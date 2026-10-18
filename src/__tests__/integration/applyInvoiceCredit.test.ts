import { describe, expect, test } from "bun:test";

import { setupTestContext } from "test/setup/testContext";

interface CreateInvoiceData {
	createInvoice?: { invoice?: { rowId: string; total: string } };
}
interface ApplyInvoiceCreditData {
	applyInvoiceCredit?: {
		creditTransactionId: string;
		amountApplied: string;
		remainingCredit: string;
		invoiceOutstanding: string;
	};
}

describe("apply invoice credit", () => {
	const ctx = setupTestContext();
	const observer = {
		id: "test-user-id",
		email: "test@example.com",
		name: "Test User",
	};

	const CREATE_INVOICE = /* GraphQL */ `
		mutation CreateInvoice($input: CreateInvoiceInput!) {
			createInvoice(input: $input) {
				invoice { rowId total }
			}
		}
	`;

	const CREATE_PAYMENT = /* GraphQL */ `
		mutation CreatePayment($input: CreatePaymentInput!) {
			createPayment(input: $input) { payment { rowId } }
		}
	`;

	const APPLY_CREDIT = /* GraphQL */ `
		mutation ApplyInvoiceCredit($input: ApplyInvoiceCreditInput!) {
			applyInvoiceCredit(input: $input) {
				creditTransactionId
				amountApplied
				remainingCredit
				invoiceOutstanding
			}
		}
	`;

	const createInvoice = async (invoiceNumber: string, total: string) => {
		const result = await ctx
			.graphqlAs(observer)
			.execute<CreateInvoiceData>(CREATE_INVOICE, {
				input: {
					invoice: {
						organizationId: "test-org",
						invoiceNumber,
						issueDate: "2026-08-01",
						total,
					},
				},
			});
		expect(result.errors).toBeUndefined();
		return result.data?.createInvoice?.invoice?.rowId as string;
	};

	const pay = async (invoiceId: string, amount: string) => {
		const result = await ctx.graphqlAs(observer).execute(CREATE_PAYMENT, {
			input: {
				payment: {
					invoiceId,
					amount,
					paidAt: new Date("2026-08-05").toISOString(),
				},
			},
		});
		expect(result.errors).toBeUndefined();
	};

	// Seed workspace credit by overpaying a throwaway invoice: the excess becomes
	// an `overpayment` credit_transaction for the org, usable on other invoices
	const seedCredit = async (slug: string, excess: number) => {
		const invoiceId = await createInvoice(`INV-SEED-${slug}`, "100.00");
		await pay(invoiceId, (100 + excess).toFixed(2));
	};

	const creditRows = async (invoiceId: string) => {
		const { rows } = await ctx.pool.query(
			`SELECT amount, kind FROM credit_transaction WHERE invoice_id = $1 ORDER BY created_at`,
			[invoiceId],
		);
		return rows as Array<{ amount: string; kind: string }>;
	};

	test("applies available workspace credit, recording a negative application entry", async () => {
		await seedCredit("A", 20);
		const target = await createInvoice("INV-APPLY-A", "50.00");

		const result = await ctx
			.graphqlAs(observer)
			.execute<ApplyInvoiceCreditData>(APPLY_CREDIT, {
				input: { invoiceId: target, amount: "20.00" },
			});

		expect(result.errors).toBeUndefined();
		const payload = result.data?.applyInvoiceCredit;
		expect(payload?.amountApplied).toBe("20.00");
		expect(payload?.remainingCredit).toBe("0.00");
		expect(payload?.invoiceOutstanding).toBe("30.00");

		const rows = await creditRows(target);
		expect(rows).toHaveLength(1);
		expect(rows[0]?.kind).toBe("application");
		expect(rows[0]?.amount).toBe("-20.00");
	});

	test("rejects applying more credit than is available, writing no entry", async () => {
		await seedCredit("B", 10);
		const target = await createInvoice("INV-APPLY-B", "50.00");

		const result = await ctx.graphqlAs(observer).execute(APPLY_CREDIT, {
			input: { invoiceId: target, amount: "20.00" },
		});
		expect(result.errors).toBeDefined();
		expect(await creditRows(target)).toHaveLength(0);
	});

	test("rejects applying more than the invoice outstanding, writing no entry", async () => {
		await seedCredit("C", 100);
		const target = await createInvoice("INV-APPLY-C", "30.00");

		const result = await ctx.graphqlAs(observer).execute(APPLY_CREDIT, {
			input: { invoiceId: target, amount: "50.00" },
		});
		expect(result.errors).toBeDefined();
		expect(await creditRows(target)).toHaveLength(0);
	});

	test("rejects a non-positive amount, writing no entry", async () => {
		await seedCredit("D", 50);
		const target = await createInvoice("INV-APPLY-D", "50.00");

		const result = await ctx.graphqlAs(observer).execute(APPLY_CREDIT, {
			input: { invoiceId: target, amount: "0" },
		});
		expect(result.errors).toBeDefined();
		expect(await creditRows(target)).toHaveLength(0);
	});
});
