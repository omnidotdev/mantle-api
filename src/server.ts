// TODO remove after Tilt env reload
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { readFileSync } from "node:fs";

import { cors } from "@elysiajs/cors";
import { yoga } from "@elysiajs/graphql-yoga";
import { useOpenTelemetry } from "@envelop/opentelemetry";
import { useParserCache } from "@envelop/parser-cache";
import { useValidationCache } from "@envelop/validation-cache";
import { useDisableIntrospection } from "@graphql-yoga/plugin-disable-introspection";
import { sql } from "drizzle-orm";
import { Elysia } from "elysia";
import { useGrafast } from "grafast/envelop";
import { makeSchema } from "postgraphile";

import appConfig from "lib/config/app.config";
import {
  CORS_ALLOWED_ORIGINS,
  PORT,
  isDevEnv,
  isProdEnv,
} from "lib/config/env.config";
import graphilePreset from "lib/config/graphile.config";
import { dbPool, pgPool } from "lib/db/db";
import createGraphqlContext from "lib/graphql/createGraphqlContext";
import { armorPlugin, authenticationPlugin } from "lib/graphql/plugins";
import idpWebhook from "lib/idp/idpWebhook";
import { maintenanceMiddleware } from "lib/middleware/maintenance";

const commit = (() => {
  try {
    return readFileSync("/app/.git-sha", "utf-8").trim();
  } catch {
    return "unknown";
  }
})();

/**
 * Elysia server.
 */
const app = new Elysia()
  .onAfterHandle(({ set }) => {
    set.headers["X-Content-Type-Options"] = "nosniff";
    set.headers["X-Frame-Options"] = "DENY";
    set.headers["X-XSS-Protection"] = "1; mode=block";
    set.headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
  })
  .use(maintenanceMiddleware)
  .use(
    cors({
      origin: CORS_ALLOWED_ORIGINS?.split(",") ?? [],
      methods: ["GET", "POST", "OPTIONS"],
    }),
  )
  .get("/health", () => ({
    status: "ok",
    timestamp: Date.now(),
    service: appConfig.name,
    commit,
  }))
  .get("/ready", async ({ set }) => {
    try {
      await dbPool.execute(sql`SELECT 1`);

      return {
        status: "ready",
        database: "connected",
        timestamp: Date.now(),
      };
    } catch {
      set.status = 503;
      return {
        status: "not ready",
        database: "disconnected",
        timestamp: Date.now(),
      };
    }
  })
  // Gatekeeper identity events (a deleted workspace's data goes with it)
  .use(idpWebhook);

const { schema } = await makeSchema(graphilePreset);

app.use(
  yoga({
    schema,
    context: createGraphqlContext,
    graphiql: isDevEnv,
    plugins: [
      ...armorPlugin,
      authenticationPlugin,
      isProdEnv && useDisableIntrospection(),
      // Variables and results carry customer records (contacts, invoices,
      // the workspace profile), so they stay out of traces
      useOpenTelemetry({
        variables: false,
        result: false,
      }),
      useParserCache(),
      useValidationCache(),
      useGrafast(),
    ],
  }),
);

app.listen({
  port: PORT,
  tls: isDevEnv
    ? {
        key: Bun.file("key.pem"),
        cert: Bun.file("cert.pem"),
      }
    : undefined,
});

// biome-ignore lint/suspicious/noConsole: startup banner
console.log(
  `🦊 ${appConfig.name} Elysia server running at ${app.server?.url.toString().slice(0, -1)}`,
);
// biome-ignore lint/suspicious/noConsole: startup banner
console.log(
  `🧘 ${appConfig.name} GraphQL Yoga API running at ${app.server?.url}graphql`,
);

/**
 * Graceful shutdown handler.
 */
const shutdown = async (signal: string) => {
  // biome-ignore lint/suspicious/noConsole: shutdown lifecycle
  console.log(`[Server] Received ${signal}, shutting down gracefully...`);
  app.stop();
  await pgPool.end();
  // biome-ignore lint/suspicious/noConsole: shutdown lifecycle
  console.log("[Server] Shutdown complete");
  process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
