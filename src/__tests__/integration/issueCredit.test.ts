import { describe, expect, test } from "bun:test";

import { setupTestContext } from "test/setup/testContext";

interface IssueCreditData {
	issueCredit?: {
		creditTransactionId: string;
		amountIssued: string;
		balance: string;
	};
}

describe("issue workspace credit", () => {
	const ctx = setupTestContext();
	const observer = {
		id: "test-user-id",
		email: "test@example.com",
		name: "Test User",
	};

	const ISSUE_CREDIT = /* GraphQL */ `
		mutation IssueCredit($input: IssueCreditInput!) {
			issueCredit(input: $input) {
				creditTransactionId
				amountIssued
				balance
			}
		}
	`;

	const issue = (input: Record<string, unknown>) =>
		ctx.graphqlAs(observer).execute<IssueCreditData>(ISSUE_CREDIT, { input });

	const creditRows = async (organizationId: string) => {
		const { rows } = await ctx.pool.query(
			`SELECT amount, kind, note FROM credit_transaction WHERE organization_id = $1 ORDER BY created_at`,
			[organizationId],
		);
		return rows as Array<{ amount: string; kind: string; note: string | null }>;
	};

	test("issues workspace credit as a positive creditNote entry", async () => {
		const result = await issue({
			organizationId: "issue-org-a",
			amount: "50.00",
			note: "Goodwill credit",
		});

		expect(result.errors).toBeUndefined();
		const payload = result.data?.issueCredit;
		expect(payload?.amountIssued).toBe("50.00");
		expect(payload?.balance).toBe("50.00");

		const rows = await creditRows("issue-org-a");
		expect(rows).toHaveLength(1);
		expect(rows[0]?.kind).toBe("creditNote");
		expect(rows[0]?.amount).toBe("50.00");
		expect(rows[0]?.note).toBe("Goodwill credit");
	});

	test("accumulates into the workspace balance", async () => {
		await issue({ organizationId: "issue-org-b", amount: "30.00" });
		const second = await issue({
			organizationId: "issue-org-b",
			amount: "20.00",
		});
		expect(second.data?.issueCredit?.balance).toBe("50.00");
	});

	test("rejects a non-positive amount, writing no entry", async () => {
		const result = await issue({ organizationId: "issue-org-c", amount: "0" });
		expect(result.errors).toBeDefined();
		expect(await creditRows("issue-org-c")).toHaveLength(0);
	});

	test("rejects a system-managed kind, writing no entry", async () => {
		const result = await issue({
			organizationId: "issue-org-d",
			amount: "10.00",
			kind: "overpayment",
		});
		expect(result.errors).toBeDefined();
		expect(await creditRows("issue-org-d")).toHaveLength(0);
	});
});
