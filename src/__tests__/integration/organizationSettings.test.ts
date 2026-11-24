import { describe, expect, test } from "bun:test";

import { setupTestContext } from "test/setup/testContext";

// Writes need an authenticated caller; this one acts with trusted service
// scope so the test exercises behavior, not authorization
const SERVICE_OBSERVER = { id: "test-service", name: "Test" };

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
			await ctx.graphqlAs(SERVICE_OBSERVER).execute<CreateOrganizationSettingsData>(
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
			await ctx.graphqlAs(SERVICE_OBSERVER).execute<CreateOrganizationSettingsData>(
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
			await ctx.graphqlAs(SERVICE_OBSERVER).execute<CreateOrganizationSettingsData>(
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
			await ctx.graphqlAs(SERVICE_OBSERVER).execute<UpdateOrganizationSettingsData>(
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
		await ctx.graphqlAs(SERVICE_OBSERVER).execute<CreateOrganizationSettingsData>(
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
			await ctx.graphqlAs(SERVICE_OBSERVER).execute<OrganizationSettingsData>(QUERY, {
				organizationId: "query-org",
			});

		expect(result.errors).toBeUndefined();
		const nodes = result.data?.organizationSettings?.nodes;
		expect(nodes).toHaveLength(1);
		expect(nodes?.[0].accentColor).toBe("#e94560");
	});

	test("enforces unique organization ID", async () => {
		await ctx.graphqlAs(SERVICE_OBSERVER).execute<CreateOrganizationSettingsData>(
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
			await ctx.graphqlAs(SERVICE_OBSERVER).execute<CreateOrganizationSettingsData>(
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

	const PROFILE_FIELDS = /* GraphQL */ `
		rowId
		organizationId
		accentColor
		companyName
		contactName
		contactTitle
		email
		phone
		website
		addressLine1
		addressLine2
		city
		state
		postalCode
		country
		logoUrl
		registrationState
	`;

	const FULL_PROFILE = {
		companyName: "Acme Studio",
		contactName: "Ada Lovelace",
		contactTitle: "Founder",
		email: "ada@acme.test",
		phone: "+1 555 0100",
		website: "https://acme.test",
		addressLine1: "1 Main St",
		addressLine2: "Suite 2",
		city: "Springfield",
		state: "IL",
		postalCode: "62701",
		country: "US",
		logoUrl: "https://acme.test/logo.png",
		registrationState: "Delaware",
		accentColor: "#123456",
	};

	test("stores and reads back the workspace profile", async () => {
		const owner = ctx.graphqlAs({ id: "owner", name: "O" }, ["profile-org"]);

		const created = await owner.execute<{
			createOrganizationSetting: {
				organizationSetting: Record<string, string | null>;
			};
		}>(
			`mutation ($input: CreateOrganizationSettingInput!) {
				createOrganizationSetting(input: $input) {
					organizationSetting { ${PROFILE_FIELDS} }
				}
			}`,
			{
				input: {
					organizationSetting: {
						organizationId: "profile-org",
						...FULL_PROFILE,
					},
				},
			},
		);
		expect(created.errors).toBeUndefined();

		const read = await owner.execute<{
			organizationSettings: { nodes: Array<Record<string, string | null>> };
		}>(
			`query ($organizationId: String!) {
				organizationSettings(condition: { organizationId: $organizationId }) {
					nodes { ${PROFILE_FIELDS} }
				}
			}`,
			{ organizationId: "profile-org" },
		);
		expect(read.errors).toBeUndefined();
		expect(read.data?.organizationSettings.nodes).toHaveLength(1);
		expect(read.data?.organizationSettings.nodes[0]).toMatchObject(
			FULL_PROFILE,
		);
	});

	test("a profile starts empty and a patch changes only the fields it names", async () => {
		const owner = ctx.graphqlAs({ id: "owner", name: "O" }, ["patch-org"]);

		const created = await owner.execute<{
			createOrganizationSetting: {
				organizationSetting: Record<string, string | null>;
			};
		}>(
			`mutation ($input: CreateOrganizationSettingInput!) {
				createOrganizationSetting(input: $input) {
					organizationSetting { ${PROFILE_FIELDS} }
				}
			}`,
			{
				input: {
					organizationSetting: {
						organizationId: "patch-org",
						companyName: "Before",
						city: "Old Town",
					},
				},
			},
		);
		const settings = created.data?.createOrganizationSetting.organizationSetting;
		expect(settings?.email).toBeNull();
		expect(settings?.logoUrl).toBeNull();

		const updated = await owner.execute<{
			updateOrganizationSetting: {
				organizationSetting: Record<string, string | null>;
			};
		}>(
			`mutation ($input: UpdateOrganizationSettingInput!) {
				updateOrganizationSetting(input: $input) {
					organizationSetting { ${PROFILE_FIELDS} }
				}
			}`,
			{
				input: {
					rowId: settings?.rowId,
					patch: { companyName: "After", city: null },
				},
			},
		);
		expect(updated.errors).toBeUndefined();
		expect(
			updated.data?.updateOrganizationSetting.organizationSetting,
		).toMatchObject({
			companyName: "After",
			city: null,
			accentColor: "#0d9488",
		});
	});

	test("only the workspace's owners and admins can write its profile", async () => {
		const member = ctx.graphqlAs({ id: "member", name: "M" }, ["role-org"], [
			"member",
		]);

		const result = await member.execute(CREATE_MUTATION, {
			input: {
				organizationSetting: {
					organizationId: "role-org",
					companyName: "Not allowed",
				},
			},
		});
		expect(result.errors).toBeDefined();

		const { rows } = await ctx.pool.query(
			"select count(*)::int as n from organization_settings where organization_id = 'role-org'",
		);
		expect(rows[0]?.n).toBe(0);
	});

	test("another workspace cannot read the profile", async () => {
		await ctx.graphqlAs(SERVICE_OBSERVER).execute(CREATE_MUTATION, {
			input: {
				organizationSetting: {
					organizationId: "private-org",
					companyName: "Private",
				},
			},
		});

		const outsider = await ctx
			.graphqlAs({ id: "outsider", name: "X" }, ["elsewhere"])
			.execute<OrganizationSettingsData>(QUERY, {
				organizationId: "private-org",
			});
		expect(outsider.data?.organizationSettings?.nodes).toEqual([]);
	});
});
