import { describe, expect, test } from "bun:test";

import { companyTable, documentNumberingConfigTable } from "lib/db/schema";
import { setupTestContext } from "test/setup/testContext";

// Writes need an authenticated caller; this one acts with trusted service
// scope so the test exercises behavior, not authorization
const SERVICE_OBSERVER = { id: "test-service", name: "Test" };

interface GenerateDocumentNumberData {
	generateDocumentNumber?: { documentNumber?: string };
}

describe("generateDocumentNumber per-client overrides", () => {
	const ctx = setupTestContext();

	const GENERATE = /* GraphQL */ `
		mutation Generate($input: GenerateDocumentNumberInput!) {
			generateDocumentNumber(input: $input) {
				documentNumber
			}
		}
	`;

	const seedCompany = async (organizationId: string, name: string) => {
		const [row] = await ctx.db
			.insert(companyTable)
			.values({ organizationId, name })
			.returning({ id: companyTable.id });
		return row.id;
	};

	const generate = (organizationId: string, companyId?: string) =>
		ctx.graphqlAs(SERVICE_OBSERVER).execute<GenerateDocumentNumberData>(GENERATE, {
			input: { organizationId, documentType: "invoice", companyId },
		});

	test("uses a per-client override prefix with its own sequence", async () => {
		const orgId = "override-org";
		const companyId = await seedCompany(orgId, "Tovsen Development");
		await ctx.db.insert(documentNumberingConfigTable).values({
			organizationId: orgId,
			documentType: "invoice",
			companyId,
			prefix: "TDTS",
		});

		const first = await generate(orgId, companyId);
		expect(first.errors).toBeUndefined();
		expect(first.data?.generateDocumentNumber?.documentNumber).toBe(
			"TDTS-0001",
		);

		const second = await generate(orgId, companyId);
		expect(second.data?.generateDocumentNumber?.documentNumber).toBe(
			"TDTS-0002",
		);
	});

	test("falls back to the workspace default when the client has no override", async () => {
		const orgId = "fallback-org";
		const companyId = await seedCompany(orgId, "No Override Co");

		const result = await generate(orgId, companyId);
		expect(result.errors).toBeUndefined();
		expect(result.data?.generateDocumentNumber?.documentNumber).toBe(
			"INV-0001",
		);
	});

	test("client override and workspace default keep independent counters", async () => {
		const orgId = "independent-org";
		const companyId = await seedCompany(orgId, "Tovsen Development");
		await ctx.db.insert(documentNumberingConfigTable).values({
			organizationId: orgId,
			documentType: "invoice",
			companyId,
			prefix: "TDTS",
		});

		// Advance the workspace-wide default sequence twice
		await generate(orgId);
		await generate(orgId);

		// The client override still starts from its own 1
		const client = await generate(orgId, companyId);
		expect(client.data?.generateDocumentNumber?.documentNumber).toBe(
			"TDTS-0001",
		);

		// The default continues its own sequence, unaffected by the override
		const fallback = await generate(orgId);
		expect(fallback.data?.generateDocumentNumber?.documentNumber).toBe(
			"INV-0003",
		);
	});
});
