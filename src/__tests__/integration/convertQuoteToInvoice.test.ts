import { describe, expect, test } from "bun:test";
import { HttpResponse, http } from "msw";

import { createBillingProvider } from "@omnidotdev/providers/billing";

import { APP_ID, providers } from "lib/providers";
import { mswServer } from "test/setup/mswServer";
import { setupTestContext } from "test/setup/testContext";

/**
 * convertQuoteToInvoice: one transaction that creates the invoice and its
 * lines and marks the quote converted, with the same workspace checks and
 * monthly invoice limit as a generated invoice create. Deleting the invoice
 * releases the quote back to `accepted`
 */

const ORG = "org-convert";
const OTHER_ORG = "org-convert-other";
const member = { id: "user-convert", name: "Convert" };
const outsider = { id: "user-outsider", name: "Outsider" };
const AETHER_URL = "http://aether.test";

const CONVERT = /* GraphQL */ `
  mutation ($input: ConvertQuoteToInvoiceInput!) {
    convertQuoteToInvoice(input: $input) {
      invoiceId
      invoiceNumber
      skippedLineItems { rowId description pricingType }
    }
  }
`;

const DELETE_INVOICE = /* GraphQL */ `
  mutation ($input: DeleteInvoiceInput!) {
    deleteInvoice(input: $input) { clientMutationId }
  }
`;

interface ConvertData {
  convertQuoteToInvoice: {
    invoiceId: string;
    invoiceNumber: string;
    skippedLineItems: Array<{
      rowId: string;
      description: string;
      pricingType: string;
    }>;
  };
}

const errorCode = (result: { errors?: readonly unknown[] }) =>
  (
    result.errors?.[0] as
      | { extensions?: { code?: string; invoiceId?: string } }
      | undefined
  )?.extensions;

describe("convertQuoteToInvoice", () => {
  const ctx = setupTestContext();
  const asMember = () => ctx.graphqlAs(member, [ORG]);

  const one = async <T = { id: string }>(text: string, values: unknown[]) =>
    (await ctx.pool.query(text, values)).rows[0] as T;

  let seq = 0;
  /** Seed a quote with a client and the given status */
  const seedQuote = async (status = "accepted", org = ORG) => {
    const company = await one(
      "insert into company (organization_id, name) values ($1, 'Acme') returning id",
      [org],
    );
    const contact = await one(
      "insert into person (organization_id, first_name, last_name) values ($1, 'Ada', 'Lovelace') returning id",
      [org],
    );
    const quote = await one(
      `insert into quote (organization_id, quote_number, title, valid_until, status,
                          company_id, contact_id, notes, currency, tax_rate)
       values ($1, $2, 'Website', '2026-12-31', $3, $4, $5, 'Thanks', 'EUR', 10)
       returning id`,
      [org, `QT-${++seq}`, status, company.id, contact.id],
    );

    return { quoteId: quote.id, companyId: company.id, contactId: contact.id };
  };

  const addLine = (quoteId: string, values: Record<string, unknown>) => {
    const columns = Object.keys(values);
    return ctx.pool.query(
      `insert into quote_line_item (quote_id, ${columns.join(", ")})
       values ($1, ${columns.map((_, i) => `$${i + 2}`).join(", ")})`,
      [quoteId, ...Object.values(values)],
    );
  };

  const convert = (quoteId: string, client = asMember()) =>
    client.execute<ConvertData>(CONVERT, { input: { quoteId } });

  test("creates the invoice and its lines, and links the quote", async () => {
    const { quoteId, companyId, contactId } = await seedQuote();
    await addLine(quoteId, {
      description: "Build",
      quantity: 2,
      unit_price: 1500,
      amount: 3000,
      sort_order: 0,
    });
    await addLine(quoteId, {
      description: "Support",
      quantity: 1,
      unit_price: 0,
      amount: 0,
      pricing_type: "hourly",
      hourly_rate: 150,
      estimated_hours: 12.5,
      sort_order: 1,
    });
    await addLine(quoteId, {
      description: "Hosting",
      quantity: 1,
      unit_price: 200,
      amount: 200,
      pricing_type: "complimentary",
      sort_order: 2,
    });
    await addLine(quoteId, {
      description: "Revenue share",
      quantity: 1,
      unit_price: 0,
      amount: 0,
      pricing_type: "royalty",
      sort_order: 3,
    });

    const result = await convert(quoteId);
    expect(result.errors).toBeUndefined();
    const payload = result.data?.convertQuoteToInvoice;
    expect(payload?.invoiceNumber).toBe("INV-0001");
    expect(payload?.skippedLineItems.map((li) => li.description)).toEqual([
      "Revenue share",
    ]);

    const invoice = await one<Record<string, unknown>>(
      "select * from invoice where id = $1",
      [payload?.invoiceId],
    );
    expect(invoice).toMatchObject({
      organization_id: ORG,
      invoice_number: "INV-0001",
      company_id: companyId,
      contact_id: contactId,
      bill_to: "Ada Lovelace\nAcme",
      status: "draft",
      notes: "Thanks",
      currency: "EUR",
      tax_rate: "10.00",
      subtotal: "4875.00",
      tax_amount: "487.50",
      total: "5362.50",
    });

    const lines = await ctx.pool.query(
      "select description, quantity, unit_price, amount, sort_order from invoice_line_item where invoice_id = $1 order by sort_order",
      [payload?.invoiceId],
    );
    expect(lines.rows).toEqual([
      { description: "Build", quantity: "2.00", unit_price: "1500.00", amount: "3000.00", sort_order: 0 },
      { description: "Support (hourly)", quantity: "12.50", unit_price: "150.00", amount: "1875.00", sort_order: 1 },
      { description: "Hosting (complimentary)", quantity: "1.00", unit_price: "0.00", amount: "0.00", sort_order: 2 },
    ]);

    const quote = await one<Record<string, unknown>>(
      "select status, converted_invoice_id from quote where id = $1",
      [quoteId],
    );
    expect(quote).toEqual({
      status: "converted",
      converted_invoice_id: payload?.invoiceId,
    });
  });

  test("refuses a quote that is already converted, pointing at its invoice", async () => {
    const { quoteId } = await seedQuote();
    const first = await convert(quoteId);
    expect(first.errors).toBeUndefined();

    const second = await convert(quoteId);
    expect(errorCode(second)).toEqual({
      code: "QUOTE_ALREADY_CONVERTED",
      invoiceId: first.data?.convertQuoteToInvoice.invoiceId,
    });
    const count = await one<{ n: number }>(
      "select count(*)::int as n from invoice where organization_id = $1",
      [ORG],
    );
    expect(count.n).toBe(1);
  });

  test("two concurrent conversions of one quote create one invoice", async () => {
    const { quoteId } = await seedQuote("sent");

    const results = await Promise.all([convert(quoteId), convert(quoteId)]);
    expect(results.filter((r) => !r.errors)).toHaveLength(1);
    expect(
      results.filter((r) => errorCode(r)?.code === "QUOTE_ALREADY_CONVERTED"),
    ).toHaveLength(1);

    const count = await one<{ n: number }>(
      "select count(*)::int as n from invoice where organization_id = $1",
      [ORG],
    );
    expect(count.n).toBe(1);
  });

  test("refuses drafts, declined and expired quotes", async () => {
    for (const status of ["draft", "declined", "expired"]) {
      const { quoteId } = await seedQuote(status);
      expect(errorCode(await convert(quoteId))?.code).toBe(
        "QUOTE_NOT_CONVERTIBLE",
      );
    }
    const count = await one<{ n: number }>(
      "select count(*)::int as n from invoice",
      [],
    );
    expect(count.n).toBe(0);
  });

  test("refuses anonymous callers and members of other workspaces", async () => {
    const { quoteId } = await seedQuote();

    const anonymous = await convert(quoteId, ctx.graphqlAs(null as never, []));
    expect(anonymous.errors).toBeDefined();

    const foreign = await convert(
      quoteId,
      ctx.graphqlAs(outsider, [OTHER_ORG]),
    );
    expect(errorCode(foreign)?.code).toBe("FORBIDDEN");

    const quote = await one<{ status: string }>(
      "select status from quote where id = $1",
      [quoteId],
    );
    expect(quote.status).toBe("accepted");
  });

  test("counts against the monthly invoice limit, and a refusal writes nothing", async () => {
    providers.billing = createBillingProvider({
      provider: "aether",
      baseUrl: AETHER_URL,
      serviceApiKey: "test-billing-key",
      appId: APP_ID,
    });
    mswServer.use(
      http.get(`${AETHER_URL}/entitlements/${APP_ID}/organization/${ORG}`, () =>
        HttpResponse.json({
          billingAccountId: "ba-1",
          entityType: "organization",
          entityId: ORG,
          entitlementVersion: 1,
          entitlements: [
            { id: "e-0", productId: APP_ID, featureKey: "tier", value: "free", source: "subscription", validFrom: "2026-01-01T00:00:00Z", validUntil: null },
            { id: "e-1", productId: APP_ID, featureKey: "max_invoices_per_month", value: "1", source: "subscription", validFrom: "2026-01-01T00:00:00Z", validUntil: null },
          ],
        }),
      ),
    );

    const first = await seedQuote();
    expect((await convert(first.quoteId)).errors).toBeUndefined();

    const second = await seedQuote();
    const refused = await convert(second.quoteId);
    expect(
      (refused.errors?.[0] as { extensions?: Record<string, unknown> })
        ?.extensions,
    ).toEqual({ code: "PLAN_LIMIT_REACHED", limit: "max_invoices_per_month" });

    const quote = await one<Record<string, unknown>>(
      "select status, converted_invoice_id from quote where id = $1",
      [second.quoteId],
    );
    expect(quote).toEqual({ status: "accepted", converted_invoice_id: null });
    const usage = await one<{ n: number }>(
      "select count(*)::int as n from usage_event where organization_id = $1",
      [ORG],
    );
    expect(usage.n).toBe(1);
  });

  test("deleting the invoice releases the quote back to accepted", async () => {
    const { quoteId } = await seedQuote();
    const converted = await convert(quoteId);
    const invoiceId = converted.data?.convertQuoteToInvoice.invoiceId;

    const removed = await asMember().execute(DELETE_INVOICE, {
      input: { rowId: invoiceId },
    });
    expect(removed.errors).toBeUndefined();

    const quote = await one<Record<string, unknown>>(
      "select status, converted_invoice_id from quote where id = $1",
      [quoteId],
    );
    expect(quote).toEqual({ status: "accepted", converted_invoice_id: null });

    // Ready to invoice again
    expect((await convert(quoteId)).errors).toBeUndefined();
  });

  test("the database never blocks deleting a converted invoice", async () => {
    const { quoteId } = await seedQuote();
    const converted = await convert(quoteId);
    const invoiceId = converted.data?.convertQuoteToInvoice.invoiceId;

    // Outside GraphQL (e.g. workspace deletion), the foreign key unlinks
    await ctx.pool.query("delete from invoice where id = $1", [invoiceId]);
    const quote = await one<{ converted_invoice_id: string | null }>(
      "select converted_invoice_id from quote where id = $1",
      [quoteId],
    );
    expect(quote.converted_invoice_id).toBeNull();
  });

  test("another workspace cannot release a quote by deleting its invoice", async () => {
    const { quoteId } = await seedQuote();
    const converted = await convert(quoteId);
    const invoiceId = converted.data?.convertQuoteToInvoice.invoiceId;

    const foreign = await ctx
      .graphqlAs(outsider, [OTHER_ORG])
      .execute(DELETE_INVOICE, { input: { rowId: invoiceId } });
    expect(foreign.errors).toBeDefined();

    const quote = await one<Record<string, unknown>>(
      "select status, converted_invoice_id from quote where id = $1",
      [quoteId],
    );
    expect(quote).toEqual({
      status: "converted",
      converted_invoice_id: invoiceId,
    });
  });
});

describe("invoice payment link validation", () => {
  const ctx = setupTestContext();
  const asMember = () => ctx.graphqlAs(member, [ORG]);

  const create = (paymentLinkUrl: string | null) =>
    asMember().execute<{ createInvoice: { invoice: { rowId: string } } }>(
      /* GraphQL */ `
        mutation ($input: CreateInvoiceInput!) {
          createInvoice(input: $input) { invoice { rowId } }
        }
      `,
      {
        input: {
          invoice: {
            organizationId: ORG,
            invoiceNumber: `INV-${crypto.randomUUID()}`,
            issueDate: "2026-11-01",
            paymentLinkUrl,
          },
        },
      },
    );

  const update = (rowId: string, paymentLinkUrl: string | null) =>
    asMember().execute(
      /* GraphQL */ `
        mutation ($input: UpdateInvoiceInput!) {
          updateInvoice(input: $input) { invoice { rowId } }
        }
      `,
      { input: { rowId, patch: { paymentLinkUrl } } },
    );

  test("accepts an https link or none", async () => {
    expect((await create("https://pay.example.com/i/1")).errors).toBeUndefined();
    expect((await create(null)).errors).toBeUndefined();
  });

  test("refuses non-https links on create, writing nothing", async () => {
    for (const link of [
      "http://pay.example.com",
      "javascript:alert(1)",
      `https://pay.example.com/${"a".repeat(2100)}`,
    ]) {
      const result = await create(link);
      expect(errorCode(result)?.code).toBe("BAD_USER_INPUT");
    }
    const count = await ctx.pool.query(
      "select count(*)::int as n from invoice",
    );
    expect(count.rows[0]?.n).toBe(0);
  });

  test("refuses a non-https link on update and keeps the stored one", async () => {
    const created = await create("https://pay.example.com/i/1");
    const rowId = created.data?.createInvoice.invoice.rowId as string;

    const result = await update(rowId, "javascript:alert(1)");
    expect(errorCode(result)?.code).toBe("BAD_USER_INPUT");

    const row = await ctx.pool.query(
      "select payment_link_url from invoice where id = $1",
      [rowId],
    );
    expect(row.rows[0]?.payment_link_url).toBe("https://pay.example.com/i/1");

    expect((await update(rowId, null)).errors).toBeUndefined();
  });
});
