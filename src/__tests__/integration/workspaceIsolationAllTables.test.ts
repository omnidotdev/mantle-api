import { describe, expect, test } from "bun:test";

import { setupTestContext } from "test/setup/testContext";

import type { Pool } from "pg";

/**
 * Every table, every path: a member of another workspace (and an anonymous
 * caller) can neither read nor change workspace A's rows, through the root
 * collection, the single-row lookup, the update or the delete mutation.
 *
 * Rows are seeded straight into the database so the test covers the read and
 * write guards alone, independent of each table's create path
 */

const ORG_A = "org-a";
const ORG_B = "org-b";

const memberA = { id: "user-a", name: "A" };
const memberB = { id: "user-b", name: "B" };

interface TableCase {
  /** SQL table */
  table: string;
  /** Root collection field */
  collection: string;
  /** Single-row lookup field */
  single: string;
  /** Generated mutation suffix (updateX / deleteX) */
  type: string;
  /** A text column the update patch sets, and its GraphQL field */
  column: string;
  field: string;
}

const CASES: TableCase[] = [
  { table: "channel_connection", collection: "channelConnections", single: "channelConnection", type: "ChannelConnection", column: "status", field: "status" },
  { table: "company", collection: "companies", single: "company", type: "Company", column: "name", field: "name" },
  { table: "credit_transaction", collection: "creditTransactions", single: "creditTransaction", type: "CreditTransaction", column: "note", field: "note" },
  { table: "document_numbering_config", collection: "documentNumberingConfigs", single: "documentNumberingConfig", type: "DocumentNumberingConfig", column: "prefix", field: "prefix" },
  { table: "invoice", collection: "invoices", single: "invoice", type: "Invoice", column: "notes", field: "notes" },
  { table: "organization_settings", collection: "organizationSettings", single: "organizationSetting", type: "OrganizationSetting", column: "company_name", field: "companyName" },
  { table: "person", collection: "people", single: "person", type: "Person", column: "notes", field: "notes" },
  { table: "product", collection: "products", single: "product", type: "Product", column: "name", field: "name" },
  { table: "quote", collection: "quotes", single: "quote", type: "Quote", column: "title", field: "title" },
  { table: "supplier", collection: "suppliers", single: "supplier", type: "Supplier", column: "name", field: "name" },
  { table: "company_member", collection: "companyMembers", single: "companyMember", type: "CompanyMember", column: "title", field: "title" },
  { table: "inventory_adjustment", collection: "inventoryAdjustments", single: "inventoryAdjustment", type: "InventoryAdjustment", column: "reason", field: "reason" },
  { table: "invoice_line_item", collection: "invoiceLineItems", single: "invoiceLineItem", type: "InvoiceLineItem", column: "description", field: "description" },
  { table: "payment", collection: "payments", single: "payment", type: "Payment", column: "reference", field: "reference" },
  { table: "person_external_link", collection: "personExternalLinks", single: "personExternalLink", type: "PersonExternalLink", column: "external_id", field: "externalId" },
  { table: "product_external_link", collection: "productExternalLinks", single: "productExternalLink", type: "ProductExternalLink", column: "external_id", field: "externalId" },
  { table: "quote_line_item", collection: "quoteLineItems", single: "quoteLineItem", type: "QuoteLineItem", column: "description", field: "description" },
];

/** Seed one row of every table into `org`, returning each row's id by table */
const seedWorkspace = async (
  pool: Pool,
  org: string,
): Promise<Record<string, string>> => {
  const one = async (text: string, values: unknown[]) =>
    (await pool.query<{ id: string }>(text, values)).rows[0]!.id;

  const company = await one(
    "insert into company (organization_id, name) values ($1, 'Acme') returning id",
    [org],
  );
  const person = await one(
    "insert into person (organization_id, first_name, last_name, notes) values ($1, 'Ada', 'L', 'seed') returning id",
    [org],
  );
  const product = await one(
    "insert into product (organization_id, name) values ($1, 'Widget') returning id",
    [org],
  );
  const invoice = await one(
    "insert into invoice (organization_id, invoice_number, issue_date, notes) values ($1, $2, '2026-08-01', 'seed') returning id",
    [org, `INV-${org}`],
  );
  const quote = await one(
    "insert into quote (organization_id, quote_number, title, valid_until) values ($1, $2, 'Q', '2026-09-01') returning id",
    [org, `Q-${org}`],
  );

  return {
    company,
    person,
    product,
    invoice,
    quote,
    channel_connection: await one(
      "insert into channel_connection (organization_id, provider, credentials) values ($1, 'etsy', '{\"token\":\"secret\"}') returning id",
      [org],
    ),
    credit_transaction: await one(
      "insert into credit_transaction (organization_id, amount, kind, note) values ($1, 10, 'adjustment', 'seed') returning id",
      [org],
    ),
    document_numbering_config: await one(
      "insert into document_numbering_config (organization_id, document_type, prefix) values ($1, 'invoice', 'INV') returning id",
      [org],
    ),
    organization_settings: await one(
      "insert into organization_settings (organization_id, company_name) values ($1, 'Seed Co') returning id",
      [org],
    ),
    supplier: await one(
      "insert into supplier (organization_id, name) values ($1, 'Supply') returning id",
      [org],
    ),
    company_member: await one(
      "insert into company_member (company_id, person_id, title) values ($1, $2, 'seed') returning id",
      [company, person],
    ),
    inventory_adjustment: await one(
      "insert into inventory_adjustment (product_id, quantity_change, reason) values ($1, 1, 'seed') returning id",
      [product],
    ),
    invoice_line_item: await one(
      "insert into invoice_line_item (invoice_id, description, quantity, unit_price, amount) values ($1, 'seed', 1, 1, 1) returning id",
      [invoice],
    ),
    payment: await one(
      "insert into payment (invoice_id, amount, paid_at, reference) values ($1, 1, '2026-08-02', 'seed') returning id",
      [invoice],
    ),
    person_external_link: await one(
      "insert into person_external_link (person_id, provider, external_id) values ($1, 'etsy', $2) returning id",
      [person, `seed-${org}`],
    ),
    product_external_link: await one(
      "insert into product_external_link (product_id, provider, external_id) values ($1, 'etsy', $2) returning id",
      [product, `seed-${org}`],
    ),
    quote_line_item: await one(
      "insert into quote_line_item (quote_id, description, quantity, unit_price, amount) values ($1, 'seed', 1, 1, 1) returning id",
      [quote],
    ),
  };
};

describe("workspace isolation, every table", () => {
  const ctx = setupTestContext();

  const callers = {
    "another workspace's member": () => ctx.graphqlAs(memberB, [ORG_B]),
    "an anonymous caller": () => ctx.graphql,
  };

  const columnValue = async (c: TableCase, id: string) =>
    (
      await ctx.pool.query(
        `select ${c.column} as v from ${c.table} where id = $1`,
        [id],
      )
    ).rows[0]?.v as string | undefined;

  for (const [who, client] of Object.entries(callers)) {
    for (const c of CASES) {
      test(`${who} cannot read or change ${c.table}`, async () => {
        const ids = await seedWorkspace(ctx.pool, ORG_A);
        const id = ids[c.table] as string;
        const before = await columnValue(c, id);
        const caller = client();

        const list = await caller.execute<
          Record<string, { nodes: Array<{ rowId: string }> }>
        >(`{ ${c.collection} { nodes { rowId } } }`);
        expect(list.data?.[c.collection]?.nodes ?? []).toEqual([]);

        const single = await caller.execute<Record<string, unknown>>(
          `query ($rowId: UUID!) { ${c.single}(rowId: $rowId) { rowId } }`,
          { rowId: id },
        );
        expect(single.data?.[c.single] ?? null).toBeNull();

        const update = await caller.execute(
          `mutation ($input: Update${c.type}Input!) { update${c.type}(input: $input) { clientMutationId } }`,
          { input: { rowId: id, patch: { [c.field]: "pwned" } } },
        );
        expect(update.errors).toBeDefined();
        expect(await columnValue(c, id)).toBe(before);

        const remove = await caller.execute(
          `mutation ($input: Delete${c.type}Input!) { delete${c.type}(input: $input) { clientMutationId } }`,
          { input: { rowId: id } },
        );
        expect(remove.errors).toBeDefined();
        expect(
          (
            await ctx.pool.query(`select 1 from ${c.table} where id = $1`, [
              id,
            ])
          ).rowCount,
        ).toBe(1);
      });
    }
  }

  test("the owning workspace's owner reads every table", async () => {
    await seedWorkspace(ctx.pool, ORG_A);
    await seedWorkspace(ctx.pool, ORG_B);

    for (const c of CASES) {
      const list = await ctx
        .graphqlAs(memberA, [ORG_A])
        .execute<Record<string, { nodes: Array<{ rowId: string }> }>>(
          `{ ${c.collection} { nodes { rowId } } }`,
        );
      expect(list.errors).toBeUndefined();
      expect(list.data?.[c.collection]?.nodes).toHaveLength(1);
    }
  });

  test("a member of another workspace cannot attach a child row to workspace A", async () => {
    const ids = await seedWorkspace(ctx.pool, ORG_A);
    const asB = ctx.graphqlAs(memberB, [ORG_B]);

    const attempts: Array<[string, string, Record<string, unknown>]> = [
      ["CompanyMember", "companyMember", { companyId: ids.company, personId: ids.person }],
      ["InventoryAdjustment", "inventoryAdjustment", { productId: ids.product, quantityChange: 5, reason: "x" }],
      ["InvoiceLineItem", "invoiceLineItem", { invoiceId: ids.invoice, description: "x", quantity: "1", unitPrice: "1", amount: "1" }],
      ["Payment", "payment", { invoiceId: ids.invoice, amount: "1", paidAt: "2026-08-03" }],
      ["PersonExternalLink", "personExternalLink", { personId: ids.person, provider: "x", externalId: "y" }],
      ["ProductExternalLink", "productExternalLink", { productId: ids.product, provider: "x", externalId: "y" }],
      ["QuoteLineItem", "quoteLineItem", { quoteId: ids.quote, description: "x", quantity: "1", unitPrice: "1", amount: "1" }],
    ];

    for (const [type, key, values] of attempts) {
      const result = await asB.execute(
        `mutation ($input: Create${type}Input!) { create${type}(input: $input) { clientMutationId } }`,
        { input: { [key]: values } },
      );
      expect(result.errors).toBeDefined();
    }

    const { rows } = await ctx.pool.query(
      "select count(*)::int as n from payment where invoice_id = $1",
      [ids.invoice],
    );
    expect(rows[0]?.n).toBe(1);
  });

  test("stored sales channel credentials are never served", async () => {
    const result = await ctx
      .graphqlAs(memberA, [ORG_A])
      .execute(`{ channelConnections { nodes { rowId credentials } } }`);
    expect(result.errors?.[0]?.message).toContain("credentials");
  });

  test("only workspace owners and admins manage sales channels and settings", async () => {
    const ids = await seedWorkspace(ctx.pool, ORG_A);
    const plainMember = ctx.graphqlAs(memberB, [ORG_A], ["member"]);

    const channels = await plainMember.execute<{
      channelConnections: { nodes: unknown[] };
    }>(`{ channelConnections { nodes { rowId } } }`);
    expect(channels.data?.channelConnections.nodes).toEqual([]);

    const settings = await plainMember.execute(
      `mutation ($input: UpdateOrganizationSettingInput!) { updateOrganizationSetting(input: $input) { clientMutationId } }`,
      {
        input: {
          rowId: ids.organization_settings,
          patch: { companyName: "Changed" },
        },
      },
    );
    expect(settings.errors?.[0]?.message).toContain("owners and admins");

    const numbering = await plainMember.execute(
      `mutation ($input: UpdateDocumentNumberingConfigInput!) { updateDocumentNumberingConfig(input: $input) { clientMutationId } }`,
      {
        input: {
          rowId: ids.document_numbering_config,
          patch: { prefix: "X" },
        },
      },
    );
    expect(numbering.errors).toBeDefined();

    // Ordinary records stay open to every member
    const person = await plainMember.execute(
      `mutation ($input: UpdatePersonInput!) { updatePerson(input: $input) { clientMutationId } }`,
      { input: { rowId: ids.person, patch: { notes: "member edit" } } },
    );
    expect(person.errors).toBeUndefined();

    const admin = ctx.graphqlAs(memberA, [ORG_A], ["admin"]);
    const adminSettings = await admin.execute(
      `mutation ($input: UpdateOrganizationSettingInput!) { updateOrganizationSetting(input: $input) { clientMutationId } }`,
      {
        input: {
          rowId: ids.organization_settings,
          patch: { companyName: "Changed" },
        },
      },
    );
    expect(adminSettings.errors).toBeUndefined();
    const adminChannels = await admin.execute<{
      channelConnections: { nodes: unknown[] };
    }>(`{ channelConnections { nodes { rowId } } }`);
    expect(adminChannels.data?.channelConnections.nodes).toHaveLength(1);
  });
});
