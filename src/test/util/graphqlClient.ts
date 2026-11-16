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
	/**
	 * The caller's organizations. Defaults to `["*"]` (trusted service scope)
	 * so functional tests exercise behavior, not authorization; authorization
	 * tests pass the caller's real memberships
	 */
	organizationIds?: string[];
}

export const createTestGraphQLClient = (
	options: CreateTestGraphQLClientOptions,
): GraphQLTestClient => {
	const { pool, db, observer = null, organizationIds = ["*"] } = options;
	const isService = organizationIds.includes("*");

	const withPgClient = createWithPgClient({ pool });

	const schema = globalThis.__TEST_SCHEMA__;

	const yoga = createYoga({
		schema,
		context: async () => ({
			db,
			observer,
			organizationIds: observer ? organizationIds : [],
			withPgClient,
			pgSettings: observer
				? isService
					? { "app.service_auth": "true", "app.organization_ids": "{}" }
					: {
							"app.service_auth": "false",
							"app.organization_ids": `{${organizationIds.join(",")}}`,
						}
				: { "app.organization_ids": "{}" },
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
