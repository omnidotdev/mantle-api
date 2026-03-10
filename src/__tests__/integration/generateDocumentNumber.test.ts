import { describe, expect, test } from "bun:test";

import { setupTestContext } from "test/setup/testContext";

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

	test("generates sequential quote number with default config", async () => {
		const result = await ctx.graphql.execute(GENERATE_MUTATION, {
			input: { organizationId: "test-org", documentType: "quote" },
		});

		expect(result.errors).toBeUndefined();
		expect(result.data?.generateDocumentNumber?.documentNumber).toBe(
			"QT-0001",
		);
	});

	test("generates sequential invoice number with default config", async () => {
		const result = await ctx.graphql.execute(GENERATE_MUTATION, {
			input: { organizationId: "test-org", documentType: "invoice" },
		});

		expect(result.errors).toBeUndefined();
		expect(result.data?.generateDocumentNumber?.documentNumber).toBe(
			"INV-0001",
		);
	});

	test("increments sequential number on each call", async () => {
		const orgId = "test-org-seq";

		const r1 = await ctx.graphql.execute(GENERATE_MUTATION, {
			input: { organizationId: orgId, documentType: "quote" },
		});
		expect(r1.data?.generateDocumentNumber?.documentNumber).toBe("QT-0001");

		const r2 = await ctx.graphql.execute(GENERATE_MUTATION, {
			input: { organizationId: orgId, documentType: "quote" },
		});
		expect(r2.data?.generateDocumentNumber?.documentNumber).toBe("QT-0002");

		const r3 = await ctx.graphql.execute(GENERATE_MUTATION, {
			input: { organizationId: orgId, documentType: "quote" },
		});
		expect(r3.data?.generateDocumentNumber?.documentNumber).toBe("QT-0003");
	});

	test("auto-creates config on first call", async () => {
		await ctx.graphql.execute(GENERATE_MUTATION, {
			input: { organizationId: "new-org", documentType: "invoice" },
		});

		const configResult = await ctx.graphql.execute(CONFIG_QUERY, {
			organizationId: "new-org",
		});

		const nodes = configResult.data?.documentNumberingConfigs?.nodes;
		expect(nodes).toHaveLength(1);
		expect(nodes[0].prefix).toBe("INV");
		expect(nodes[0].separator).toBe("-");
		expect(nodes[0].idStrategy).toBe("sequential");
		expect(nodes[0].sequentialPadding).toBe(4);
		expect(nodes[0].nextSequentialNumber).toBe(2);
	});

	test("generates random document number when configured", async () => {
		// First generate to create the config
		await ctx.graphql.execute(GENERATE_MUTATION, {
			input: { organizationId: "random-org", documentType: "quote" },
		});

		// Get the config rowId
		const configResult = await ctx.graphql.execute(CONFIG_QUERY, {
			organizationId: "random-org",
		});
		const configRowId =
			configResult.data?.documentNumberingConfigs?.nodes[0]?.rowId;

		// Update to random strategy
		await ctx.graphql.execute(UPDATE_CONFIG_MUTATION, {
			input: {
				rowId: configRowId,
				patch: { idStrategy: "random" },
			},
		});

		// Generate with random strategy
		const result = await ctx.graphql.execute(GENERATE_MUTATION, {
			input: { organizationId: "random-org", documentType: "quote" },
		});

		const docNum = result.data?.generateDocumentNumber?.documentNumber;
		expect(docNum).toBeDefined();
		// Should match QT- prefix followed by uppercase hex
		expect(docNum).toMatch(/^QT-[A-F0-9]{8}$/);
	});

	test("isolates numbering between organizations", async () => {
		const r1 = await ctx.graphql.execute(GENERATE_MUTATION, {
			input: { organizationId: "org-a", documentType: "quote" },
		});
		expect(r1.data?.generateDocumentNumber?.documentNumber).toBe("QT-0001");

		const r2 = await ctx.graphql.execute(GENERATE_MUTATION, {
			input: { organizationId: "org-b", documentType: "quote" },
		});
		expect(r2.data?.generateDocumentNumber?.documentNumber).toBe("QT-0001");
	});

	test("isolates numbering between document types", async () => {
		const r1 = await ctx.graphql.execute(GENERATE_MUTATION, {
			input: { organizationId: "test-org", documentType: "quote" },
		});
		expect(r1.data?.generateDocumentNumber?.documentNumber).toBe("QT-0001");

		const r2 = await ctx.graphql.execute(GENERATE_MUTATION, {
			input: { organizationId: "test-org", documentType: "invoice" },
		});
		expect(r2.data?.generateDocumentNumber?.documentNumber).toBe("INV-0001");
	});
});
