import { describe, expect, test } from "bun:test";

import { setupTestContext } from "test/setup/testContext";

interface OrganizationSettingsData {
	organizationSettings?: {
		nodes: Array<{
			rowId: string;
			organizationId: string;
			accentColor: string | null;
		}>;
	};
}

interface CreateOrganizationSettingsData {
	createOrganizationSetting?: {
		organizationSetting?: {
			rowId: string;
			organizationId: string;
			accentColor: string | null;
		};
	};
}

interface UpdateOrganizationSettingsData {
	updateOrganizationSetting?: {
		organizationSetting?: {
			rowId: string;
			accentColor: string | null;
		};
	};
}

describe("organization settings", () => {
	const ctx = setupTestContext();

	const CREATE_MUTATION = /* GraphQL */ `
		mutation CreateOrganizationSetting(
			$input: CreateOrganizationSettingInput!
		) {
			createOrganizationSetting(input: $input) {
				organizationSetting {
					rowId
					organizationId
					accentColor
				}
			}
		}
	`;

	const QUERY = /* GraphQL */ `
		query OrganizationSettings($organizationId: String!) {
			organizationSettings(
				condition: { organizationId: $organizationId }
			) {
				nodes {
					rowId
					organizationId
					accentColor
				}
			}
		}
	`;

	const UPDATE_MUTATION = /* GraphQL */ `
		mutation UpdateOrganizationSetting(
			$input: UpdateOrganizationSettingInput!
		) {
			updateOrganizationSetting(input: $input) {
				organizationSetting {
					rowId
					accentColor
				}
			}
		}
	`;

	test("creates org settings with default accent color", async () => {
		const result =
			await ctx.graphql.execute<CreateOrganizationSettingsData>(
				CREATE_MUTATION,
				{
					input: {
						organizationSetting: {
							organizationId: "test-org",
						},
					},
				},
			);

		expect(result.errors).toBeUndefined();
		const settings =
			result.data?.createOrganizationSetting?.organizationSetting;
		expect(settings?.organizationId).toBe("test-org");
		expect(settings?.accentColor).toBe("#0d9488");
	});

	test("creates org settings with custom accent color", async () => {
		const result =
			await ctx.graphql.execute<CreateOrganizationSettingsData>(
				CREATE_MUTATION,
				{
					input: {
						organizationSetting: {
							organizationId: "custom-org",
							accentColor: "#ff5733",
						},
					},
				},
			);

		expect(result.errors).toBeUndefined();
		expect(
			result.data?.createOrganizationSetting?.organizationSetting
				?.accentColor,
		).toBe("#ff5733");
	});

	test("updates accent color", async () => {
		const createResult =
			await ctx.graphql.execute<CreateOrganizationSettingsData>(
				CREATE_MUTATION,
				{
					input: {
						organizationSetting: {
							organizationId: "update-org",
						},
					},
				},
			);

		const rowId =
			createResult.data?.createOrganizationSetting?.organizationSetting
				?.rowId;

		const updateResult =
			await ctx.graphql.execute<UpdateOrganizationSettingsData>(
				UPDATE_MUTATION,
				{
					input: {
						rowId,
						patch: { accentColor: "#1a1a2e" },
					},
				},
			);

		expect(updateResult.errors).toBeUndefined();
		expect(
			updateResult.data?.updateOrganizationSetting?.organizationSetting
				?.accentColor,
		).toBe("#1a1a2e");
	});

	test("queries org settings by organization ID", async () => {
		await ctx.graphql.execute<CreateOrganizationSettingsData>(
			CREATE_MUTATION,
			{
				input: {
					organizationSetting: {
						organizationId: "query-org",
						accentColor: "#e94560",
					},
				},
			},
		);

		const result =
			await ctx.graphql.execute<OrganizationSettingsData>(QUERY, {
				organizationId: "query-org",
			});

		expect(result.errors).toBeUndefined();
		const nodes = result.data?.organizationSettings?.nodes;
		expect(nodes).toHaveLength(1);
		expect(nodes?.[0].accentColor).toBe("#e94560");
	});

	test("enforces unique organization ID", async () => {
		await ctx.graphql.execute<CreateOrganizationSettingsData>(
			CREATE_MUTATION,
			{
				input: {
					organizationSetting: {
						organizationId: "unique-org",
					},
				},
			},
		);

		const result =
			await ctx.graphql.execute<CreateOrganizationSettingsData>(
				CREATE_MUTATION,
				{
					input: {
						organizationSetting: {
							organizationId: "unique-org",
						},
					},
				},
			);

		expect(result.errors).toBeDefined();
	});
});
