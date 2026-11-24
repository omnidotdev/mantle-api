import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";

import { EMITTING_MUTATIONS } from "lib/graphql/plugins/events/EventEmission.plugin";
import { events } from "lib/providers";
import { setupTestContext } from "test/setup/testContext";

import type { Mock } from "bun:test";

/**
 * Every wrapped CRUD mutation emits `mantle.<entity>.<action>` carrying the
 * written row's id and workspace, and a failed mutation emits nothing.
 * Regression: the wrappers read the row from the root `$source` instead of the
 * mutation result, so no generated mutation ever emitted
 */

const ORG = "org-events";
const SERVICE = { id: "test-service", name: "Test" };

interface Emitted {
  type: string;
  subject?: string;
  data: Record<string, unknown>;
}

const pascal = (entity: string) =>
  entity.charAt(0).toUpperCase() + entity.slice(1);

/** Create input for each entity (payment gets its invoice id at run time) */
const createInput = (
  entity: string,
  invoiceId: string,
): Record<string, unknown> =>
  ({
    company: { organizationId: ORG, name: "Acme" },
    person: { organizationId: ORG, firstName: "Ada", lastName: "Lovelace" },
    documentNumberingConfig: { organizationId: ORG, documentType: "quote" },
    invoice: {
      organizationId: ORG,
      invoiceNumber: "INV-EVT-2",
      issueDate: "2026-11-01",
      status: "sent",
      currency: "USD",
    },
    quote: {
      organizationId: ORG,
      quoteNumber: "QT-EVT-1",
      title: "Website",
      validUntil: "2026-12-31",
    },
    payment: { invoiceId, amount: "40.00", paidAt: "2026-11-02" },
    product: { organizationId: ORG, name: "Widget", unitPrice: "9.50" },
  })[entity] ?? {};

/** A harmless patch for each entity */
const patch = (entity: string): Record<string, unknown> =>
  ({
    company: { name: "Acme Ltd" },
    person: { lastName: "Byron" },
    documentNumberingConfig: { prefix: "Q" },
    invoice: { notes: "Thanks" },
    quote: { title: "Website v2" },
    payment: { reference: "wire-1" },
    product: { name: "Widget Pro" },
  })[entity] ?? {};

describe("event emission", () => {
  const ctx = setupTestContext();
  const client = () => ctx.graphqlAs(SERVICE);

  let emit: Mock<typeof events.emit>;

  beforeEach(() => {
    emit = spyOn(events, "emit").mockResolvedValue(undefined as never);
  });

  afterEach(() => {
    emit.mockRestore();
  });

  /** Events emitted so far (emission is fire-and-forget, so let it settle) */
  const emitted = async (): Promise<Emitted[]> => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return emit.mock.calls.map(([event]) => event as unknown as Emitted);
  };

  const seedInvoice = async () =>
    (
      await ctx.pool.query<{ id: string }>(
        `insert into invoice (organization_id, invoice_number, issue_date, status, currency)
         values ($1, 'INV-EVT-1', '2026-11-01', 'sent', 'EUR') returning id`,
        [ORG],
      )
    ).rows[0]!.id;

  const run = async (query: string, variables: Record<string, unknown>) => {
    const result = await client().execute<Record<string, unknown>>(
      query,
      variables,
    );
    expect(result.errors).toBeUndefined();
    return result.data ?? {};
  };

  const entities = [
    ...new Set(EMITTING_MUTATIONS.map(([entity]) => entity)),
  ] as string[];

  for (const entity of entities) {
    test(`${entity}: create, update and delete each emit with the saved row`, async () => {
      const invoiceId = await seedInvoice();
      const type = pascal(entity);

      const created = await run(
        `mutation ($input: Create${type}Input!) {
           create${type}(input: $input) { ${entity} { rowId } }
         }`,
        { input: { [entity]: createInput(entity, invoiceId) } },
      );
      const rowId = (
        created[`create${type}`] as Record<string, { rowId: string }>
      )[entity]!.rowId;

      await run(
        `mutation ($input: Update${type}Input!) {
           update${type}(input: $input) { clientMutationId }
         }`,
        { input: { rowId, patch: patch(entity) } },
      );
      await run(
        `mutation ($input: Delete${type}Input!) {
           delete${type}(input: $input) { clientMutationId }
         }`,
        { input: { rowId } },
      );

      const own = (await emitted()).filter((event) =>
        event.type.startsWith(`mantle.${entity}.`),
      );
      expect(own.map((event) => event.type)).toEqual([
        `mantle.${entity}.created`,
        `mantle.${entity}.updated`,
        `mantle.${entity}.deleted`,
      ]);
      for (const event of own) {
        expect(event.subject).toBe(rowId);
        expect(event.data).toMatchObject({ id: rowId, organizationId: ORG });
      }
    });
  }

  test("a payment carries its amount and its invoice's workspace and currency", async () => {
    const invoiceId = await seedInvoice();
    await run(
      `mutation ($input: CreatePaymentInput!) {
         createPayment(input: $input) { clientMutationId }
       }`,
      { input: { payment: createInput("payment", invoiceId) } },
    );

    const [event] = (await emitted()).filter(
      (e) => e.type === "mantle.payment.created",
    );
    expect(event?.data).toMatchObject({
      invoiceId,
      organizationId: ORG,
      currency: "EUR",
      amount: "40.00",
      paidAt: "2026-11-02",
    });
  });

  test("an invoice update carries the total recomputed after the write", async () => {
    const invoiceId = await seedInvoice();
    await ctx.pool.query(
      `insert into invoice_line_item (invoice_id, description, quantity, unit_price, amount)
       values ($1, 'Build', 1, 100, 100)`,
      [invoiceId],
    );

    await run(
      `mutation ($input: UpdateInvoiceInput!) {
         updateInvoice(input: $input) { clientMutationId }
       }`,
      { input: { rowId: invoiceId, patch: { taxRate: "10" } } },
    );

    const [event] = (await emitted()).filter(
      (e) => e.type === "mantle.invoice.updated",
    );
    expect(event?.data).toMatchObject({
      id: invoiceId,
      organizationId: ORG,
      status: "sent",
      invoiceNumber: "INV-EVT-1",
      currency: "EUR",
    });
    expect(Number(event?.data.total)).toBe(110);
  });

  test("a failed mutation emits nothing", async () => {
    // Unknown invoice: the insert fails its foreign key
    const result = await client().execute(
      `mutation ($input: CreatePaymentInput!) {
         createPayment(input: $input) { clientMutationId }
       }`,
      {
        input: {
          payment: createInput(
            "payment",
            "00000000-0000-0000-0000-000000000000",
          ),
        },
      },
    );

    expect(result.errors).toBeDefined();
    expect(await emitted()).toEqual([]);
  });

  test("an update that matches no row emits nothing", async () => {
    await client().execute(
      `mutation ($input: UpdateInvoiceInput!) {
         updateInvoice(input: $input) { clientMutationId }
       }`,
      {
        input: {
          rowId: "00000000-0000-0000-0000-000000000000",
          patch: { notes: "x" },
        },
      },
    );

    expect(await emitted()).toEqual([]);
  });

  test("convertQuoteToInvoice emits the invoice created and the quote updated", async () => {
    const quoteId = (
      await ctx.pool.query<{ id: string }>(
        `insert into quote (organization_id, quote_number, title, valid_until, status, currency)
         values ($1, 'QT-EVT-2', 'Website', '2026-12-31', 'accepted', 'USD') returning id`,
        [ORG],
      )
    ).rows[0]!.id;
    await ctx.pool.query(
      `insert into quote_line_item (quote_id, description, quantity, unit_price, amount)
       values ($1, 'Build', 2, 50, 100)`,
      [quoteId],
    );

    const data = await run(
      `mutation ($input: ConvertQuoteToInvoiceInput!) {
         convertQuoteToInvoice(input: $input) { invoiceId }
       }`,
      { input: { quoteId } },
    );
    const { invoiceId } = data.convertQuoteToInvoice as { invoiceId: string };

    const all = await emitted();
    expect(all.find((e) => e.type === "mantle.invoice.created")?.data).toMatchObject({
      id: invoiceId,
      organizationId: ORG,
      status: "draft",
    });
    expect(all.find((e) => e.type === "mantle.quote.updated")?.data).toMatchObject({
      id: quoteId,
      organizationId: ORG,
      status: "converted",
      convertedInvoiceId: invoiceId,
    });
  });
});
