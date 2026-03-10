import { useParserCache } from "@envelop/parser-cache";
import { useValidationCache } from "@envelop/validation-cache";
import { useGrafast } from "grafast/envelop";
import { createYoga } from "graphql-yoga";
import { createWithPgClient } from "postgraphile/adaptors/pg";

import type { ExecutionResult } from "graphql";
import type { Observer } from "lib/graphql/plugins/authentication.plugin";
import type { Pool } from "pg";
import type { TestDatabase } from "test/setup/createTestDatabase";

export interface GraphQLTestClient {
	execute: <TData = unknown, TVariables = Record<string, unknown>>(
		query: string,
		variables?: TVariables,
	) => Promise<ExecutionResult<TData>>;
}

export interface CreateTestGraphQLClientOptions {
	pool: Pool;
	db: TestDatabase["db"];
	observer?: Observer | null;
}

export const createTestGraphQLClient = (
	options: CreateTestGraphQLClientOptions,
): GraphQLTestClient => {
	const { pool, db, observer = null } = options;

	const withPgClient = createWithPgClient({ pool });

	const schema = globalThis.__TEST_SCHEMA__;

	const yoga = createYoga({
		schema,
		context: async () => ({
			db,
			observer,
			withPgClient,
			pgSettings: {},
			pgSubscriber: null,
			request: new Request("http://localhost:4001/graphql"),
		}),
		plugins: [useParserCache(), useValidationCache(), useGrafast()],
	});

	return {
		execute: async <TData = unknown, TVariables = Record<string, unknown>>(
			query: string,
			variables?: TVariables,
		): Promise<ExecutionResult<TData>> => {
			const response = await yoga.fetch("http://localhost:4001/graphql", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ query, variables }),
			});

			return response.json() as Promise<ExecutionResult<TData>>;
		},
	};
};
