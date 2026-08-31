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
			paidAt: string;
			reference: string | null;
			method: string | null;
		};
	};
}

interface InvoiceWithPaymentsData {
	invoice?: {
		rowId: string;
		payments: {
			nodes: Array<{
				rowId: string;
				amount: string;
				paidAt: string;
				reference: string | null;
				method: string | null;
			}>;
		};
	};
}

interface PaymentsByInvoiceData {
	payments?: {
		nodes: Array<{ rowId: string }>;
	};
}

interface DeleteInvoiceData {
	deleteInvoice?: {
		deletedInvoiceId: string;
	};
}

describe("invoice payments", () => {
	const ctx = setupTestContext();
	const testObserver = {
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
					paidAt
					reference
					method
				}
			}
		}
	`;

	const INVOICE_WITH_PAYMENTS = /* GraphQL */ `
		query InvoiceWithPayments($rowId: UUID!) {
			invoice(rowId: $rowId) {
				rowId
				payments {
					nodes {
						rowId
						amount
						paidAt
						reference
						method
					}
				}
			}
		}
	`;

	const PAYMENTS_BY_INVOICE = /* GraphQL */ `
		query PaymentsByInvoice($invoiceId: UUID!) {
			payments(condition: { invoiceId: $invoiceId }) {
				nodes {
					rowId
				}
			}
		}
	`;

	const DELETE_INVOICE = /* GraphQL */ `
		mutation DeleteInvoice($input: DeleteInvoiceInput!) {
			deleteInvoice(input: $input) {
				deletedInvoiceId
			}
		}
	`;

	/** Create an invoice and return its rowId */
	const createInvoice = async (invoiceNumber: string, total: string) => {
		const result = await ctx
			.graphqlAs(testObserver)
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

	test("records multiple payments on different dates", async () => {
		const invoiceId = await createInvoice("INV-PAY-1", "9000.00");

		// Send paidAt as the full ISO datetime string graphql-request produces
		// from a JS Date, exactly as the app does, to prove the Date scalar
		// stores the calendar date
		const first = await ctx.graphql.execute<CreatePaymentData>(
			CREATE_PAYMENT,
			{
				input: {
					payment: {
						invoiceId,
						amount: "4500.00",
						paidAt: new Date("2026-08-05").toISOString(),
						reference: "CHK-1042",
						method: "check",
					},
				},
			},
		);
		expect(first.errors).toBeUndefined();
		expect(first.data?.createPayment?.payment?.paidAt).toBe("2026-08-05");

		const second = await ctx.graphql.execute<CreatePaymentData>(
			CREATE_PAYMENT,
			{
				input: {
					payment: {
						invoiceId,
						amount: "4500.00",
						paidAt: new Date("2026-08-20").toISOString(),
						reference: "Wire-8830",
						method: "wire",
					},
				},
			},
		);
		expect(second.errors).toBeUndefined();

		const result = await ctx.graphql.execute<InvoiceWithPaymentsData>(
			INVOICE_WITH_PAYMENTS,
			{ rowId: invoiceId },
		);

		expect(result.errors).toBeUndefined();

		const nodes = result.data?.invoice?.payments?.nodes ?? [];
		expect(nodes).toHaveLength(2);

		const paid = nodes.reduce(
			(sum, node) => sum + Number.parseFloat(node.amount),
			0,
		);
		expect(paid).toBe(9000);

		const dates = nodes.map((node) => node.paidAt).sort();
		expect(dates).toEqual(["2026-08-05", "2026-08-20"]);

		const byDate = new Map(nodes.map((node) => [node.paidAt, node]));
		expect(byDate.get("2026-08-05")?.reference).toBe("CHK-1042");
		expect(byDate.get("2026-08-05")?.method).toBe("check");
		expect(byDate.get("2026-08-20")?.reference).toBe("Wire-8830");
	});

	test("cascade deletes payments when the invoice is deleted", async () => {
		const invoiceId = await createInvoice("INV-PAY-2", "1000.00");

		await ctx.graphql.execute<CreatePaymentData>(CREATE_PAYMENT, {
			input: {
				payment: {
					invoiceId,
					amount: "1000.00",
					paidAt: new Date("2026-08-10").toISOString(),
					reference: null,
					method: null,
				},
			},
		});

		const deleteResult = await ctx.graphql.execute<DeleteInvoiceData>(
			DELETE_INVOICE,
			{ input: { rowId: invoiceId } },
		);
		expect(deleteResult.errors).toBeUndefined();

		const result = await ctx.graphql.execute<PaymentsByInvoiceData>(
			PAYMENTS_BY_INVOICE,
			{ invoiceId },
		);

		expect(result.data?.payments?.nodes).toHaveLength(0);
	});
});
