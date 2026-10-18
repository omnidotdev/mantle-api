import { describe, expect, test } from "bun:test";

import { setupTestContext } from "test/setup/testContext";

interface CreateInvoiceData {
	createInvoice?: {
		invoice?: {
			rowId: string;
			total: string;
		};
	};
}

interface CreatePaymentData {
	createPayment?: {
		payment?: {
			rowId: string;
			amount: string;
		};
	};
}

describe("overpayment to credit", () => {
	const ctx = setupTestContext();
	const observer = {
		id: "test-user-id",
		email: "test@example.com",
		name: "Test User",
	};

	const CREATE_INVOICE = /* GraphQL */ `
		mutation CreateInvoice($input: CreateInvoiceInput!) {
			createInvoice(input: $input) {
				invoice {
					rowId
					total
				}
			}
		}
	`;

	const CREATE_PAYMENT = /* GraphQL */ `
		mutation CreatePayment($input: CreatePaymentInput!) {
			createPayment(input: $input) {
				payment {
					rowId
					amount
				}
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
		const result = await ctx
			.graphqlAs(observer)
			.execute<CreatePaymentData>(CREATE_PAYMENT, {
				input: {
					payment: {
						invoiceId,
						amount,
						paidAt: new Date("2026-08-05").toISOString(),
					},
				},
			});
		expect(result.errors).toBeUndefined();
		return result.data?.createPayment?.payment?.rowId as string;
	};

	// Credit rows are read straight from the database: the createPayment payload
	// reflects values captured before the overpayment side effect runs
	const creditRows = async (invoiceId: string) => {
		const { rows } = await ctx.pool.query(
			`SELECT organization_id, currency, amount, kind, invoice_id, payment_id
			   FROM credit_transaction
			  WHERE invoice_id = $1
			  ORDER BY created_at`,
			[invoiceId],
		);
		return rows as Array<{
			organization_id: string;
			currency: string;
			amount: string;
			kind: string;
			invoice_id: string | null;
			payment_id: string | null;
		}>;
	};

	test("records the excess of a single overpayment as workspace credit", async () => {
		const invoiceId = await createInvoice("INV-OVERPAY-1", "100.00");
		const paymentId = await pay(invoiceId, "120.00");

		const rows = await creditRows(invoiceId);
		expect(rows).toHaveLength(1);
		expect(rows[0]?.amount).toBe("20.00");
		expect(rows[0]?.kind).toBe("overpayment");
		expect(rows[0]?.organization_id).toBe("test-org");
		expect(rows[0]?.currency).toBe("USD");
		expect(rows[0]?.payment_id).toBe(paymentId);
	});

	test("accumulates only the new delta when payments cross the total", async () => {
		const invoiceId = await createInvoice("INV-OVERPAY-2", "100.00");

		// Under the total: no credit yet
		await pay(invoiceId, "80.00");
		expect(await creditRows(invoiceId)).toHaveLength(0);

		// Crosses the total by 20: a single 20.00 credit, not a re-credit of earlier
		await pay(invoiceId, "40.00");
		const afterCross = await creditRows(invoiceId);
		expect(afterCross).toHaveLength(1);
		expect(afterCross[0]?.amount).toBe("20.00");

		// A further overpayment adds only its own delta (another 50)
		await pay(invoiceId, "50.00");
		const afterMore = await creditRows(invoiceId);
		expect(afterMore).toHaveLength(2);
		const total = afterMore.reduce(
			(sum, r) => sum + Number.parseFloat(r.amount),
			0,
		);
		expect(total).toBe(70);
	});

	test("records no credit when the invoice is paid exactly", async () => {
		const invoiceId = await createInvoice("INV-EXACT", "100.00");
		await pay(invoiceId, "100.00");
		expect(await creditRows(invoiceId)).toHaveLength(0);
	});

	test("records no credit when the invoice is underpaid", async () => {
		const invoiceId = await createInvoice("INV-UNDER", "100.00");
		await pay(invoiceId, "25.00");
		expect(await creditRows(invoiceId)).toHaveLength(0);
	});
});
