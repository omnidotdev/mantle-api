import { describe, expect, test } from "bun:test";

import { setupTestContext } from "test/setup/testContext";

// Writes need an authenticated caller; this one acts with trusted service
// scope so the test exercises behavior, not authorization
const SERVICE_OBSERVER = { id: "test-service", name: "Test" };

interface GenerateDocumentNumberData {
	generateDocumentNumber?: { documentNumber?: string };
}

interface DocumentNumberingConfigsData {
	documentNumberingConfigs?: {
		nodes: Array<{
			rowId: string;
			organizationId: string;
			documentType: string;
			prefix: string;
			separator: string;
			idStrategy: string;
			sequentialPadding: number;
			randomLength: number;
			nextSequentialNumber: number;
		}>;
	};
}

interface UpdateDocumentNumberingConfigData {
	updateDocumentNumberingConfig?: {
		documentNumberingConfig?: { rowId: string; idStrategy: string };
	};
}

describe("generateDocumentNumber mutation", () => {
	const ctx = setupTestContext();

	const GENERATE_MUTATION = /* GraphQL */ `
    mutation GenerateDocumentNumber($input: GenerateDocumentNumberInput!) {
      generateDocumentNumber(input: $input) {
        documentNumber
      }
    }
  `;

	const CONFIG_QUERY = /* GraphQL */ `
    query DocumentNumberingConfigs($organizationId: String!) {
      documentNumberingConfigs(condition: { organizationId: $organizationId }) {
        nodes {
          rowId
          organizationId
          documentType
          prefix
          separator
          idStrategy
          sequentialPadding
          randomLength
          nextSequentialNumber
        }
      }
    }
  `;

	const UPDATE_CONFIG_MUTATION = /* GraphQL */ `
    mutation UpdateDocumentNumberingConfig($input: UpdateDocumentNumberingConfigInput!) {
      updateDocumentNumberingConfig(input: $input) {
        documentNumberingConfig {
          rowId
          idStrategy
        }
      }
    }
  `;

	const UPDATE_CONFIG_MUTATION_FULL = /* GraphQL */ `
		mutation UpdateDocumentNumberingConfig(
			$input: UpdateDocumentNumberingConfigInput!
		) {
			updateDocumentNumberingConfig(input: $input) {
				documentNumberingConfig {
					rowId
					globalPrefix
					prefix
					idStrategy
				}
			}
		}
	`;

	test("generates sequential quote number with default config", async () => {
		const result = await ctx.graphqlAs(SERVICE_OBSERVER).execute<GenerateDocumentNumberData>(GENERATE_MUTATION, {
			input: { organizationId: "test-org", documentType: "quote" },
		});

		expect(result.errors).toBeUndefined();
		expect(result.data?.generateDocumentNumber?.documentNumber).toBe(
			"QT-0001",
		);
	});

	test("generates sequential invoice number with default config", async () => {
		const result = await ctx.graphqlAs(SERVICE_OBSERVER).execute<GenerateDocumentNumberData>(GENERATE_MUTATION, {
			input: { organizationId: "test-org", documentType: "invoice" },
		});

		expect(result.errors).toBeUndefined();
		expect(result.data?.generateDocumentNumber?.documentNumber).toBe(
			"INV-0001",
		);
	});

	test("increments sequential number on each call", async () => {
		const orgId = "test-org-seq";

		const r1 = await ctx.graphqlAs(SERVICE_OBSERVER).execute<GenerateDocumentNumberData>(GENERATE_MUTATION, {
			input: { organizationId: orgId, documentType: "quote" },
		});
		expect(r1.data?.generateDocumentNumber?.documentNumber).toBe("QT-0001");

		const r2 = await ctx.graphqlAs(SERVICE_OBSERVER).execute<GenerateDocumentNumberData>(GENERATE_MUTATION, {
			input: { organizationId: orgId, documentType: "quote" },
		});
		expect(r2.data?.generateDocumentNumber?.documentNumber).toBe("QT-0002");

		const r3 = await ctx.graphqlAs(SERVICE_OBSERVER).execute<GenerateDocumentNumberData>(GENERATE_MUTATION, {
			input: { organizationId: orgId, documentType: "quote" },
		});
		expect(r3.data?.generateDocumentNumber?.documentNumber).toBe("QT-0003");
	});

	test("auto-creates config on first call", async () => {
		await ctx.graphqlAs(SERVICE_OBSERVER).execute<GenerateDocumentNumberData>(GENERATE_MUTATION, {
			input: { organizationId: "new-org", documentType: "invoice" },
		});

		const configResult = await ctx.graphqlAs(SERVICE_OBSERVER).execute<DocumentNumberingConfigsData>(CONFIG_QUERY, {
			organizationId: "new-org",
		});

		const nodes = configResult.data?.documentNumberingConfigs?.nodes;
		expect(nodes).toHaveLength(1);
		expect(nodes?.[0].prefix).toBe("INV");
		expect(nodes?.[0].separator).toBe("-");
		expect(nodes?.[0].idStrategy).toBe("sequential");
		expect(nodes?.[0].sequentialPadding).toBe(4);
		expect(nodes?.[0].nextSequentialNumber).toBe(2);
	});

	test("generates random document number when configured", async () => {
		// First generate to create the config
		await ctx.graphqlAs(SERVICE_OBSERVER).execute<GenerateDocumentNumberData>(GENERATE_MUTATION, {
			input: { organizationId: "random-org", documentType: "quote" },
		});

		// Get the config rowId
		const configResult = await ctx.graphqlAs(SERVICE_OBSERVER).execute<DocumentNumberingConfigsData>(CONFIG_QUERY, {
			organizationId: "random-org",
		});
		const configRowId =
			configResult.data?.documentNumberingConfigs?.nodes?.[0]?.rowId;

		// Update to random strategy
		await ctx.graphqlAs(SERVICE_OBSERVER).execute<UpdateDocumentNumberingConfigData>(UPDATE_CONFIG_MUTATION, {
			input: {
				rowId: configRowId,
				patch: { idStrategy: "random" },
			},
		});

		// Generate with random strategy
		const result = await ctx.graphqlAs(SERVICE_OBSERVER).execute<GenerateDocumentNumberData>(GENERATE_MUTATION, {
			input: { organizationId: "random-org", documentType: "quote" },
		});

		const docNum = result.data?.generateDocumentNumber?.documentNumber;
		expect(docNum).toBeDefined();
		// Should match QT- prefix followed by uppercase hex
		expect(docNum).toMatch(/^QT-[A-F0-9]{8}$/);
	});

	test("isolates numbering between organizations", async () => {
		const r1 = await ctx.graphqlAs(SERVICE_OBSERVER).execute<GenerateDocumentNumberData>(GENERATE_MUTATION, {
			input: { organizationId: "org-a", documentType: "quote" },
		});
		expect(r1.data?.generateDocumentNumber?.documentNumber).toBe("QT-0001");

		const r2 = await ctx.graphqlAs(SERVICE_OBSERVER).execute<GenerateDocumentNumberData>(GENERATE_MUTATION, {
			input: { organizationId: "org-b", documentType: "quote" },
		});
		expect(r2.data?.generateDocumentNumber?.documentNumber).toBe("QT-0001");
	});

	test("isolates numbering between document types", async () => {
		const r1 = await ctx.graphqlAs(SERVICE_OBSERVER).execute<GenerateDocumentNumberData>(GENERATE_MUTATION, {
			input: { organizationId: "test-org", documentType: "quote" },
		});
		expect(r1.data?.generateDocumentNumber?.documentNumber).toBe("QT-0001");

		const r2 = await ctx.graphqlAs(SERVICE_OBSERVER).execute<GenerateDocumentNumberData>(GENERATE_MUTATION, {
			input: { organizationId: "test-org", documentType: "invoice" },
		});
		expect(r2.data?.generateDocumentNumber?.documentNumber).toBe("INV-0001");
	});

	test("prepends global prefix to document number", async () => {
		// Generate first to auto-create config
		await ctx.graphqlAs(SERVICE_OBSERVER).execute<GenerateDocumentNumberData>(GENERATE_MUTATION, {
			input: { organizationId: "global-prefix-org", documentType: "quote" },
		});

		// Get config rowId
		const configResult =
			await ctx.graphqlAs(SERVICE_OBSERVER).execute<DocumentNumberingConfigsData>(CONFIG_QUERY, {
				organizationId: "global-prefix-org",
			});
		const configRowId =
			configResult.data?.documentNumberingConfigs?.nodes?.[0]?.rowId;

		// Set global prefix
		await ctx.graphqlAs(SERVICE_OBSERVER).execute(UPDATE_CONFIG_MUTATION_FULL, {
			input: {
				rowId: configRowId,
				patch: { globalPrefix: "ACME" },
			},
		});

		// Generate again - should include global prefix
		const result = await ctx.graphqlAs(SERVICE_OBSERVER).execute<GenerateDocumentNumberData>(
			GENERATE_MUTATION,
			{
				input: {
					organizationId: "global-prefix-org",
					documentType: "quote",
				},
			},
		);

		expect(result.data?.generateDocumentNumber?.documentNumber).toBe(
			"ACME-QT-0002",
		);
	});

	test("global prefix works with empty doc-type prefix", async () => {
		await ctx.graphqlAs(SERVICE_OBSERVER).execute<GenerateDocumentNumberData>(GENERATE_MUTATION, {
			input: { organizationId: "gp-no-doc-prefix", documentType: "quote" },
		});

		const configResult =
			await ctx.graphqlAs(SERVICE_OBSERVER).execute<DocumentNumberingConfigsData>(CONFIG_QUERY, {
				organizationId: "gp-no-doc-prefix",
			});
		const configRowId =
			configResult.data?.documentNumberingConfigs?.nodes?.[0]?.rowId;

		// Set global prefix but clear doc-type prefix
		await ctx.graphqlAs(SERVICE_OBSERVER).execute(UPDATE_CONFIG_MUTATION_FULL, {
			input: {
				rowId: configRowId,
				patch: { globalPrefix: "ACME", prefix: "" },
			},
		});

		const result = await ctx.graphqlAs(SERVICE_OBSERVER).execute<GenerateDocumentNumberData>(
			GENERATE_MUTATION,
			{
				input: {
					organizationId: "gp-no-doc-prefix",
					documentType: "quote",
				},
			},
		);

		expect(result.data?.generateDocumentNumber?.documentNumber).toBe(
			"ACME-0002",
		);
	});

	test("generates a timestamp-style number when configured", async () => {
		const result = await ctx.graphqlAs(SERVICE_OBSERVER).execute<GenerateDocumentNumberData>(
			GENERATE_MUTATION,
			{
				input: {
					organizationId: "timestamp-org",
					documentType: "invoice",
					idStrategy: "timestamp",
				},
			},
		);

		expect(result.errors).toBeUndefined();
		// e.g. INV-20260203-115447
		expect(result.data?.generateDocumentNumber?.documentNumber).toMatch(
			/^INV-\d{8}-\d{6}$/,
		);
	});
});
