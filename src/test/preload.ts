// Set env vars before importing modules that read them at load time
process.env.NODE_ENV = "test";

import { makeSchema } from "postgraphile";

import { createTestDatabase } from "./setup/createTestDatabase";
import { mswServer } from "./setup/mswServer";
import {
	cleanupOrphanedContainers,
	startPostgresContainer,
	stopPostgresContainer,
} from "./setup/startPostgresContainer";

import type { GraphQLSchema } from "graphql";
import type { TestDatabase } from "./setup/createTestDatabase";

declare global {
	var __TEST_DATABASE__: TestDatabase;
	var __TEST_CONTAINER_CONNECTION_STRING__: string;
	var __TEST_CLEANUP_IN_PROGRESS__: boolean;
	var __TEST_SCHEMA__: GraphQLSchema;
}

const cleanup = async () => {
	if (globalThis.__TEST_CLEANUP_IN_PROGRESS__) return;
	globalThis.__TEST_CLEANUP_IN_PROGRESS__ = true;

	console.log("\n[preload] Cleaning up test environment...");

	mswServer.close();

	if (globalThis.__TEST_DATABASE__) {
		await globalThis.__TEST_DATABASE__.cleanup();
	}

	await stopPostgresContainer();

	console.log("[preload] Test cleanup complete.\n");
};

console.log("[preload] Checking for orphaned test containers...");
await cleanupOrphanedContainers();

console.log("[preload] Starting PostgreSQL test container...");
const container = await startPostgresContainer();
const connectionString = container.getConnectionUri();

globalThis.__TEST_CONTAINER_CONNECTION_STRING__ = connectionString;
process.env.DATABASE_URL = connectionString;

console.log("[preload] Running database migrations...");
const testDb = await createTestDatabase(connectionString);
globalThis.__TEST_DATABASE__ = testDb;

console.log("[preload] Building GraphQL schema with plugins...");
const graphilePreset = (await import("lib/config/graphile.config")).default;
const { schema } = await makeSchema(graphilePreset);
globalThis.__TEST_SCHEMA__ = schema;

console.log("[preload] Starting MSW server...");
mswServer.listen({ onUnhandledRequest: "error" });

console.log("[preload] Test environment ready.\n");

process.on("beforeExit", cleanup);
process.on("SIGINT", async () => {
	await cleanup();
	process.exit(130);
});
process.on("SIGTERM", async () => {
	await cleanup();
	process.exit(143);
});
