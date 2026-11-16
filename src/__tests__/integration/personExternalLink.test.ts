import { describe, expect, test } from "bun:test";

import { setupTestContext } from "test/setup/testContext";

// Writes need an authenticated caller; this one acts with trusted service
// scope so the test exercises behavior, not authorization
const SERVICE_OBSERVER = { id: "test-service", name: "Test" };

interface CreatePersonData {
	createPerson?: {
		person?: {
			rowId: string;
			firstName: string;
			lastName: string;
			emails: string[];
		};
	};
}

interface CreatePersonExternalLinkData {
	createPersonExternalLink?: {
		personExternalLink?: {
			rowId: string;
			personId: string;
			provider: string;
			externalId: string;
			metadata: Record<string, unknown>;
		};
	};
}

interface PersonExternalLinksData {
	personExternalLinks?: {
		nodes: Array<{
			rowId: string;
			personId: string;
			provider: string;
			externalId: string;
			person?: {
				rowId: string;
				firstName: string;
				emails: string[];
			};
		}>;
	};
}

interface PersonWithLinksData {
	person?: {
		rowId: string;
		firstName: string;
		personExternalLinks: {
			nodes: Array<{
				provider: string;
				externalId: string;
			}>;
		};
	};
}

interface DeletePersonData {
	deletePerson?: {
		deletedPersonId: string;
	};
}

describe("person external linking", () => {
	const ctx = setupTestContext();
	const testObserver = { id: "test-user-id", email: "test@example.com", name: "Test User" };

	const CREATE_PERSON = /* GraphQL */ `
		mutation CreatePerson($input: CreatePersonInput!) {
			createPerson(input: $input) {
				person {
					rowId
					firstName
					lastName
					emails
				}
			}
		}
	`;

	const CREATE_EXTERNAL_LINK = /* GraphQL */ `
		mutation CreatePersonExternalLink(
			$input: CreatePersonExternalLinkInput!
		) {
			createPersonExternalLink(input: $input) {
				personExternalLink {
					rowId
					personId
					provider
					externalId
					metadata
				}
			}
		}
	`;

	const QUERY_LINKS_BY_PROVIDER = /* GraphQL */ `
		query LinksByProvider($provider: String!, $externalId: String!) {
			personExternalLinks(
				condition: { provider: $provider, externalId: $externalId }
			) {
				nodes {
					rowId
					personId
					provider
					externalId
					person {
						rowId
						firstName
						emails
					}
				}
			}
		}
	`;

	const QUERY_PERSON_WITH_LINKS = /* GraphQL */ `
		query PersonWithLinks($rowId: UUID!) {
			person(rowId: $rowId) {
				rowId
				firstName
				personExternalLinks {
					nodes {
						provider
						externalId
					}
				}
			}
		}
	`;

	const DELETE_PERSON = /* GraphQL */ `
		mutation DeletePerson($input: DeletePersonInput!) {
			deletePerson(input: $input) {
				deletedPersonId
			}
		}
	`;

	/** Create a person and return its rowId */
	const createPerson = async (
		firstName: string,
		lastName: string,
		email: string,
	) => {
		const result = await ctx.graphqlAs(testObserver).execute<CreatePersonData>(
			CREATE_PERSON,
			{
				input: {
					person: {
						organizationId: "test-org",
						firstName,
						lastName,
						emails: [email],
					},
				},
			},
		);

		expect(result.errors).toBeUndefined();

		return result.data?.createPerson?.person?.rowId as string;
	};

	test("creates an external link for a person", async () => {
		const personId = await createPerson(
			"Test",
			"User",
			"test@example.com",
		);

		const result =
			await ctx.graphqlAs(SERVICE_OBSERVER).execute<CreatePersonExternalLinkData>(
				CREATE_EXTERNAL_LINK,
				{
					input: {
						personExternalLink: {
							personId,
							provider: "gatekeeper",
							externalId: "gk-user-123",
						},
					},
				},
			);

		expect(result.errors).toBeUndefined();

		const link =
			result.data?.createPersonExternalLink?.personExternalLink;
		expect(link?.provider).toBe("gatekeeper");
		expect(link?.externalId).toBe("gk-user-123");
		expect(link?.personId).toBe(personId);
	});

	test("looks up a person by provider and externalId", async () => {
		const personId = await createPerson(
			"Linked",
			"User",
			"linked@example.com",
		);

		await ctx.graphqlAs(SERVICE_OBSERVER).execute<CreatePersonExternalLinkData>(
			CREATE_EXTERNAL_LINK,
			{
				input: {
					personExternalLink: {
						personId,
						provider: "gatekeeper",
						externalId: "gk-user-456",
					},
				},
			},
		);

		const result =
			await ctx.graphqlAs(SERVICE_OBSERVER).execute<PersonExternalLinksData>(
				QUERY_LINKS_BY_PROVIDER,
				{
					provider: "gatekeeper",
					externalId: "gk-user-456",
				},
			);

		expect(result.errors).toBeUndefined();

		const nodes = result.data?.personExternalLinks?.nodes;
		expect(nodes).toHaveLength(1);
		expect(nodes?.[0]?.person?.firstName).toBe("Linked");
	});

	test("shows links on a person via reverse relation", async () => {
		const personId = await createPerson(
			"Multi",
			"Link",
			"multi@example.com",
		);

		await ctx.graphqlAs(SERVICE_OBSERVER).execute<CreatePersonExternalLinkData>(
			CREATE_EXTERNAL_LINK,
			{
				input: {
					personExternalLink: {
						personId,
						provider: "gatekeeper",
						externalId: "gk-multi-1",
					},
				},
			},
		);

		await ctx.graphqlAs(SERVICE_OBSERVER).execute<CreatePersonExternalLinkData>(
			CREATE_EXTERNAL_LINK,
			{
				input: {
					personExternalLink: {
						personId,
						provider: "stripe",
						externalId: "cus_abc123",
					},
				},
			},
		);

		const result = await ctx.graphqlAs(SERVICE_OBSERVER).execute<PersonWithLinksData>(
			QUERY_PERSON_WITH_LINKS,
			{ rowId: personId },
		);

		expect(result.errors).toBeUndefined();

		const links = result.data?.person?.personExternalLinks?.nodes;
		expect(links).toHaveLength(2);

		const providers = links
			?.map((l) => l.provider)
			.sort();
		expect(providers).toEqual(["gatekeeper", "stripe"]);
	});

	test("enforces unique provider + externalId", async () => {
		const person1Id = await createPerson(
			"First",
			"User",
			"first@example.com",
		);
		const person2Id = await createPerson(
			"Second",
			"User",
			"second@example.com",
		);

		await ctx.graphqlAs(SERVICE_OBSERVER).execute<CreatePersonExternalLinkData>(
			CREATE_EXTERNAL_LINK,
			{
				input: {
					personExternalLink: {
						personId: person1Id,
						provider: "gatekeeper",
						externalId: "gk-unique-test",
					},
				},
			},
		);

		const result =
			await ctx.graphqlAs(SERVICE_OBSERVER).execute<CreatePersonExternalLinkData>(
				CREATE_EXTERNAL_LINK,
				{
					input: {
						personExternalLink: {
							personId: person2Id,
							provider: "gatekeeper",
							externalId: "gk-unique-test",
						},
					},
				},
			);

		expect(result.errors).toBeDefined();
	});

	test("cascade deletes links when person is deleted", async () => {
		const personId = await createPerson(
			"Cascade",
			"Test",
			"cascade@example.com",
		);

		await ctx.graphqlAs(SERVICE_OBSERVER).execute<CreatePersonExternalLinkData>(
			CREATE_EXTERNAL_LINK,
			{
				input: {
					personExternalLink: {
						personId,
						provider: "gatekeeper",
						externalId: "gk-cascade-test",
					},
				},
			},
		);

		const deleteResult = await ctx.graphqlAs(SERVICE_OBSERVER).execute<DeletePersonData>(
			DELETE_PERSON,
			{ input: { rowId: personId } },
		);

		expect(deleteResult.errors).toBeUndefined();

		const result =
			await ctx.graphqlAs(SERVICE_OBSERVER).execute<PersonExternalLinksData>(
				QUERY_LINKS_BY_PROVIDER,
				{
					provider: "gatekeeper",
					externalId: "gk-cascade-test",
				},
			);

		expect(result.data?.personExternalLinks?.nodes).toHaveLength(0);
	});
});
