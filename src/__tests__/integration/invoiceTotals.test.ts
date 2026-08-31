import { describe, expect, test } from "bun:test";

import { setupTestContext } from "test/setup/testContext";

interface CreateInvoiceData {
	createInvoice?: {
		invoice?: {
			rowId: string;
			subtotal: string;
			taxAmount: string;
			total: string;
		};
	};
}

interface CreateLineItemData {
	createInvoiceLineItem?: {
		invoiceLineItem?: {
			rowId: string;
			amount: string;
		};
	};
}

interface UpdateLineItemData {
	updateInvoiceLineItem?: {
		invoiceLineItem?: { rowId: string; amount: string };
	};
}

interface DeleteLineItemData {
	deleteInvoiceLineItem?: { deletedInvoiceLineItemId: string };
}

interface UpdateInvoiceData {
	updateInvoice?: {
		invoice?: {
			rowId: string;
			subtotal: string;
			taxAmount: string;
			total: string;
		};
	};
}

describe("invoice total recomputation", () => {
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
					subtotal
					taxAmount
					total
				}
			}
		}
	`;

	const CREATE_LINE_ITEM = /* GraphQL */ `
		mutation CreateLineItem($input: CreateInvoiceLineItemInput!) {
			createInvoiceLineItem(input: $input) {
				invoiceLineItem {
					rowId
					amount
				}
			}
		}
	`;

	const UPDATE_LINE_ITEM = /* GraphQL */ `
		mutation UpdateLineItem($input: UpdateInvoiceLineItemInput!) {
			updateInvoiceLineItem(input: $input) {
				invoiceLineItem {
					rowId
					amount
				}
			}
		}
	`;

	const DELETE_LINE_ITEM = /* GraphQL */ `
		mutation DeleteLineItem($input: DeleteInvoiceLineItemInput!) {
			deleteInvoiceLineItem(input: $input) {
				deletedInvoiceLineItemId
			}
		}
	`;

	const UPDATE_INVOICE = /* GraphQL */ `
		mutation UpdateInvoice($input: UpdateInvoiceInput!) {
			updateInvoice(input: $input) {
				invoice {
					rowId
					subtotal
					taxAmount
					total
				}
			}
		}
	`;

	const createInvoice = async (
		invoiceNumber: string,
		extra: Record<string, unknown> = {},
	) => {
		const result = await ctx
			.graphqlAs(observer)
			.execute<CreateInvoiceData>(CREATE_INVOICE, {
				input: {
					invoice: {
						organizationId: "test-org",
						invoiceNumber,
						issueDate: "2026-08-01",
						...extra,
					},
				},
			});

		expect(result.errors).toBeUndefined();

		return result.data?.createInvoice?.invoice?.rowId as string;
	};

	const addLineItem = async (
		invoiceId: string,
		line: {
			description: string;
			quantity: string;
			unitPrice: string;
			amount: string;
		},
	) => {
		const result = await ctx
			.graphqlAs(observer)
			.execute<CreateLineItemData>(CREATE_LINE_ITEM, {
				input: { invoiceLineItem: { invoiceId, ...line } },
			});

		expect(result.errors).toBeUndefined();

		return result.data?.createInvoiceLineItem?.invoiceLineItem?.rowId as string;
	};

	// Read persisted rows straight from the database. GraphQL collection reads
	// are organization-scoped and return nothing under the test's empty
	// pgSettings, and a mutation payload reflects values captured before the
	// recompute side effect runs; a direct read proves what was committed
	const dbInvoice = async (rowId: string) => {
		const { rows } = await ctx.pool.query(
			"SELECT subtotal, tax_amount, total FROM invoice WHERE id = $1",
			[rowId],
		);
		return rows[0] as
			| { subtotal: string; tax_amount: string; total: string }
			| undefined;
	};

	const dbLineAmount = async (rowId: string) => {
		const { rows } = await ctx.pool.query(
			"SELECT amount FROM invoice_line_item WHERE id = $1",
			[rowId],
		);
		return (rows[0] as { amount: string } | undefined)?.amount;
	};

	test("corrects a lying line amount and the invoice totals on line create", async () => {
		const invoiceId = await createInvoice("INV-RECOMP-1", {
			subtotal: "999.99",
			total: "999.99",
		});

		// Line claims amount 1.00 while quantity * unitPrice = 3 * 50 = 150.00
		const lineId = await addLineItem(invoiceId, {
			description: "Widget",
			quantity: "3",
			unitPrice: "50.00",
			amount: "1.00",
		});

		// The stored line amount is corrected to quantity * unitPrice
		expect(await dbLineAmount(lineId)).toBe("150.00");

		// The invoice totals now reflect the real line items, not the lie
		const invoice = await dbInvoice(invoiceId);
		expect(invoice?.subtotal).toBe("150.00");
		expect(invoice?.tax_amount).toBe("0.00");
		expect(invoice?.total).toBe("150.00");
	});

	test("applies tax rate to the recomputed subtotal", async () => {
		const invoiceId = await createInvoice("INV-RECOMP-TAX", {
			taxRate: "10.00",
		});

		await addLineItem(invoiceId, {
			description: "Service A",
			quantity: "2",
			unitPrice: "100.00",
			amount: "0.00",
		});
		await addLineItem(invoiceId, {
			description: "Service B",
			quantity: "1",
			unitPrice: "50.00",
			amount: "0.00",
		});

		// subtotal = 200 + 50 = 250; tax = 10% = 25; total = 275
		const invoice = await dbInvoice(invoiceId);
		expect(invoice?.subtotal).toBe("250.00");
		expect(invoice?.tax_amount).toBe("25.00");
		expect(invoice?.total).toBe("275.00");
	});

	test("recomputes when a line item is updated", async () => {
		const invoiceId = await createInvoice("INV-RECOMP-UPD");

		const lineId = await addLineItem(invoiceId, {
			description: "Item",
			quantity: "1",
			unitPrice: "10.00",
			amount: "10.00",
		});

		// Bump quantity to 5 but keep the stale amount
		const updated = await ctx
			.graphqlAs(observer)
			.execute<UpdateLineItemData>(UPDATE_LINE_ITEM, {
				input: {
					rowId: lineId,
					patch: { quantity: "5", amount: "10.00" },
				},
			});
		expect(updated.errors).toBeUndefined();

		expect(await dbLineAmount(lineId)).toBe("50.00");

		const invoice = await dbInvoice(invoiceId);
		expect(invoice?.subtotal).toBe("50.00");
		expect(invoice?.total).toBe("50.00");
	});

	test("recomputes when a line item is deleted", async () => {
		const invoiceId = await createInvoice("INV-RECOMP-DEL");

		await addLineItem(invoiceId, {
			description: "Keep",
			quantity: "1",
			unitPrice: "40.00",
			amount: "40.00",
		});
		const removeId = await addLineItem(invoiceId, {
			description: "Remove",
			quantity: "1",
			unitPrice: "60.00",
			amount: "60.00",
		});

		// Both present: subtotal = 100
		expect((await dbInvoice(invoiceId))?.subtotal).toBe("100.00");

		const deleted = await ctx
			.graphqlAs(observer)
			.execute<DeleteLineItemData>(DELETE_LINE_ITEM, {
				input: { rowId: removeId },
			});
		expect(deleted.errors).toBeUndefined();

		// Only the kept line remains: subtotal = 40
		const invoice = await dbInvoice(invoiceId);
		expect(invoice?.subtotal).toBe("40.00");
		expect(invoice?.total).toBe("40.00");
	});

	test("recomputes a lying subtotal/total on updateInvoice when lines exist", async () => {
		const invoiceId = await createInvoice("INV-RECOMP-INV");

		await addLineItem(invoiceId, {
			description: "Item",
			quantity: "2",
			unitPrice: "30.00",
			amount: "60.00",
		});

		// Client tries to overwrite totals with bogus values
		const result = await ctx
			.graphqlAs(observer)
			.execute<UpdateInvoiceData>(UPDATE_INVOICE, {
				input: {
					rowId: invoiceId,
					patch: { subtotal: "5.00", taxAmount: "0.00", total: "5.00" },
				},
			});
		expect(result.errors).toBeUndefined();

		// The persisted values are the recomputed ones, not the submitted lie
		const invoice = await dbInvoice(invoiceId);
		expect(invoice?.subtotal).toBe("60.00");
		expect(invoice?.total).toBe("60.00");
	});

	test("leaves a manual invoice with no line items untouched", async () => {
		const invoiceId = await createInvoice("INV-MANUAL", {
			subtotal: "500.00",
			total: "500.00",
		});

		// Update an unrelated field; totals must not be zeroed since there are no lines
		const result = await ctx
			.graphqlAs(observer)
			.execute<UpdateInvoiceData>(UPDATE_INVOICE, {
				input: { rowId: invoiceId, patch: { notes: "manual invoice" } },
			});
		expect(result.errors).toBeUndefined();

		const invoice = await dbInvoice(invoiceId);
		expect(invoice?.subtotal).toBe("500.00");
		expect(invoice?.total).toBe("500.00");
	});
});
