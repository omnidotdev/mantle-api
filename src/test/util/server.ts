import { Elysia } from "elysia";
import { createYoga } from "graphql-yoga";
import { createWithPgClient } from "postgraphile/adaptors/pg";

import authenticationPlugin from "lib/graphql/plugins/authentication.plugin";

export const makeElysiaApp = () => {
	const app = new Elysia();

	app.get("/health", () => ({
		status: "ok",
		timestamp: Date.now(),
		service: "mantle-api",
	}));

	return {
		handle: (input: Request | URL | string, init?: RequestInit) =>
			app.handle(toRequest(input, init)),
	};
};

const toRequest = (input: Request | URL | string, init?: RequestInit) =>
	input instanceof Request
		? input
		: new Request(typeof input === "string" ? input : input.toString(), init);

export const makeYogaServer = (opts?: {
	headers?: Record<string, string>;
}) => {
	const { pool, db } = globalThis.__TEST_DATABASE__;
	const withPgClient = createWithPgClient({ pool });

	const schema = globalThis.__TEST_SCHEMA__;

	const yoga = createYoga({
		schema,
		plugins: [authenticationPlugin],
		context: async ({ request }) => ({
			request,
			db,
			observer: null,
			withPgClient,
			pgSettings: null,
			pgSubscriber: null,
		}),
	});

	return {
		fetch: (input: Request | URL | string, init?: RequestInit) => {
			const req = toRequest(input, init);

			if (opts?.headers) {
				const merged = new Headers(req.headers);
				for (const [k, v] of Object.entries(opts.headers)) merged.set(k, v);
				return yoga.fetch(new Request(req, { headers: merged }));
			}

			return yoga.fetch(req);
		},
	};
};
