import { afterEach, beforeEach } from "bun:test";

import { clearLimitsCache } from "lib/entitlements";
import { providers } from "lib/providers";
import { createTestGraphQLClient } from "test/util/graphqlClient";

import { mswServer } from "./mswServer";
import { resetDatabase } from "./resetDatabase";

import type { Observer } from "lib/graphql/plugins/authentication.plugin";
import type { Pool } from "pg";
import type { GraphQLTestClient } from "test/util/graphqlClient";
import type { TestDatabase } from "./createTestDatabase";

export interface TestContext {
	db: TestDatabase["db"];
	pool: Pool;
	graphql: GraphQLTestClient;
	graphqlAs: (
		observer: Observer,
		organizationIds?: string[],
		roles?: string[],
	) => GraphQLTestClient;
}

export const setupTestContext = (): TestContext => {
	const getTestDb = () => {
		if (!globalThis.__TEST_DATABASE__) {
			throw new Error(
				"Test database not initialized. Ensure preload.ts is configured in bunfig.toml",
			);
		}
		return globalThis.__TEST_DATABASE__;
	};

	const initialProviders = { ...providers };

	beforeEach(async () => {
		const { db } = getTestDb();
		await resetDatabase(db);
		clearLimitsCache();
	});

	afterEach(() => {
		mswServer.resetHandlers();
		Object.assign(providers, initialProviders);
		delete process.env.BILLING_BYPASS_ORG_IDS;
		delete process.env.WARDEN_ENFORCE;
	});

	return new Proxy({} as TestContext, {
		get(_, prop: keyof TestContext) {
			const { db, pool } = getTestDb();

			if (prop === "db") return db;
			if (prop === "pool") return pool;
			if (prop === "graphql") return createTestGraphQLClient({ pool, db });
			if (prop === "graphqlAs") {
				return (
					observer: Observer,
					organizationIds?: string[],
					roles?: string[],
				) =>
					createTestGraphQLClient({
						pool,
						db,
						observer,
						organizationIds,
						roles,
					});
			}

			return undefined;
		},
	});
};
