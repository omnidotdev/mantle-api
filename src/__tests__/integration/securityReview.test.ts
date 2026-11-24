import { describe, expect, test } from "bun:test";
import { HttpResponse, http } from "msw";

import { createBillingProvider } from "@omnidotdev/providers/billing";

import { APP_ID, providers } from "lib/providers";
import { mswServer } from "test/setup/mswServer";
import { setupTestContext } from "test/setup/testContext";

/**
 * Pre-launch security review: attack tests.
 *
 * Each test attempts one way to (a) read or change another workspace's data,
 * (b) get past a plan limit, or (c) act as an owner/admin without the role.
 * A test passes when the attack is refused. Tests named `[finding]` covered a
 * real weakness: they failed before the fix that ships beside them
 *
 * Roles: workspace A is the victim, B the attacker's own workspace. "Dual"
 * is a caller who belongs to both (e.g. a contractor), used only where an
 * attack needs it
 */

const ORG_A = "org-victim";
const ORG_B = "org-attacker";

const ownerA = { id: "user-owner-a", name: "Owner A" };
const memberA = { id: "user-member-a", name: "Member A" };
const attacker = { id: "user-attacker", name: "Attacker" };
const dual = { id: "user-dual", name: "Dual" };

const AETHER_URL = "http://aether.test";

const useFreePlan = (org: string, limits: Record<string, string>) => {
  providers.billing = createBillingProvider({
    provider: "aether",
    baseUrl: AETHER_URL,
    serviceApiKey: "test-billing-key",
    appId: APP_ID,
  });
  mswServer.use(
    http.get(`${AETHER_URL}/entitlements/${APP_ID}/organization/${org}`, () =>
      HttpResponse.json({
        billingAccountId: "ba-1",
        entityType: "organization",
        entityId: org,
        entitlementVersion: 1,
        entitlements: Object.entries({ tier: "free", ...limits }).map(
          ([featureKey, value], i) => ({
            id: `e-${i}`,
            productId: APP_ID,
            featureKey,
            value,
            source: "subscription",
            validFrom: "2026-01-01T00:00:00Z",
            validUntil: null,
          }),
        ),
      }),
    ),
  );
};

describe("security review", () => {
  const ctx = setupTestContext();

  const asOwnerA = () => ctx.graphqlAs(ownerA, [ORG_A], ["owner"]);
  const asMemberA = () => ctx.graphqlAs(memberA, [ORG_A], ["member"]);
  const asAttacker = () => ctx.graphqlAs(attacker, [ORG_B], ["owner"]);
  const asDual = () => ctx.graphqlAs(dual, [ORG_A, ORG_B], ["owner"]);
  const anon = () => ctx.graphql;

  const one = async (text: string, values: unknown[]) =>
    (await ctx.pool.query<{ id: string }>(text, values)).rows[0]!.id;

  /** Workspace A's records, seeded straight into the database */
  const seedVictim = async () => {
    const company = await one(
      "insert into company (organization_id, name, email) values ($1, 'Victim Co', 'cfo@victim.test') returning id",
      [ORG_A],
    );
    const person = await one(
      "insert into person (organization_id, first_name, last_name, notes) values ($1, 'Vic', 'Tim', 'secret note') returning id",
      [ORG_A],
    );
    const supplier = await one(
      "insert into supplier (organization_id, name) values ($1, 'Victim Supply') returning id",
      [ORG_A],
    );
    const product = await one(
      "insert into product (organization_id, name) values ($1, 'Victim Widget') returning id",
      [ORG_A],
    );
    const invoice = await one(
      "insert into invoice (organization_id, invoice_number, issue_date, total, company_id, contact_id, notes) values ($1, 'INV-VICTIM', '2026-08-01', 500, $2, $3, 'secret terms') returning id",
      [ORG_A, company, person],
    );
    const quote = await one(
      "insert into quote (organization_id, quote_number, title, valid_until) values ($1, 'Q-VICTIM', 'Secret quote', '2026-09-01') returning id",
      [ORG_A],
    );
    const payment = await one(
      "insert into payment (invoice_id, amount, paid_at, reference) values ($1, 50, '2026-08-02', 'wire-123') returning id",
      [invoice],
    );
    await ctx.pool.query(
      "insert into credit_transaction (organization_id, amount, kind, note) values ($1, 1000, 'creditNote', 'victim credit')",
      [ORG_A],
    );
    await ctx.pool.query(
      "insert into document_numbering_config (organization_id, document_type, prefix, next_sequential_number) values ($1, 'invoice', 'INV', 42)",
      [ORG_A],
    );
    await ctx.pool.query(
      "insert into channel_connection (organization_id, provider, credentials) values ($1, 'etsy', '{\"token\":\"secret\"}')",
      [ORG_A],
    );

    return { company, person, supplier, product, invoice, quote, payment };
  };

  /** Workspace B's own records, for attacks that pivot from them */
  const seedAttacker = async () => {
    const company = await one(
      "insert into company (organization_id, name) values ($1, 'Attacker Co') returning id",
      [ORG_B],
    );
    const invoice = await one(
      "insert into invoice (organization_id, invoice_number, issue_date, total) values ($1, 'INV-ATTACKER', '2026-08-01', 10) returning id",
      [ORG_B],
    );
    const person = await one(
      "insert into person (organization_id, first_name, last_name) values ($1, 'Att', 'Acker') returning id",
      [ORG_B],
    );
    return { company, invoice, person };
  };

  const scalar = async (text: string, values: unknown[] = []) =>
    (await ctx.pool.query(text, values)).rows[0]?.v;

  describe("cross-workspace reads", () => {
    test("Relay global ids (`*ById`) of another workspace's rows resolve to null", async () => {
      await seedVictim();

      const ids = await asOwnerA().execute<
        Record<string, { nodes: Array<{ id: string }> }>
      >(`{
        invoices { nodes { id } } companies { nodes { id } } people { nodes { id } }
        payments { nodes { id } } creditTransactions { nodes { id } }
        documentNumberingConfigs { nodes { id } } channelConnections { nodes { id } }
      }`);
      expect(ids.errors).toBeUndefined();

      const lookups: Array<[string, string]> = [
        ["invoiceById", ids.data!.invoices!.nodes[0]!.id],
        ["companyById", ids.data!.companies!.nodes[0]!.id],
        ["personById", ids.data!.people!.nodes[0]!.id],
        ["paymentById", ids.data!.payments!.nodes[0]!.id],
        ["creditTransactionById", ids.data!.creditTransactions!.nodes[0]!.id],
        [
          "documentNumberingConfigById",
          ids.data!.documentNumberingConfigs!.nodes[0]!.id,
        ],
        ["channelConnectionById", ids.data!.channelConnections!.nodes[0]!.id],
      ];

      for (const [field, id] of lookups) {
        for (const caller of [asAttacker(), anon()]) {
          const res = await caller.execute<Record<string, unknown>>(
            `query ($id: ID!) { ${field}(id: $id) { rowId } }`,
            { id },
          );
          expect({ field, row: res.data?.[field] ?? null }).toEqual({
            field,
            row: null,
          });
        }
      }
    });

    test("the root `node(id)` lookup is not exposed", async () => {
      const res = await anon().execute(`{ node(id: "x") { id } }`);
      expect(res.errors?.[0]?.message).toContain('Cannot query field "node"');
    });

    test("re-entering Query through `query { ... }` stays scoped", async () => {
      await seedVictim();
      const res = await asAttacker().execute<{
        query: { invoices: { totalCount: number }; people: { totalCount: number } };
      }>(`{ query { invoices { totalCount } people { totalCount } } }`);
      expect(res.data?.query.invoices.totalCount).toBe(0);
      expect(res.data?.query.people.totalCount).toBe(0);
    });

    test("a mutation payload's `query` field stays scoped", async () => {
      await seedVictim();
      const res = await asAttacker().execute<{
        createCompany: { query: { invoices: { totalCount: number } } };
      }>(
        `mutation { createCompany(input: { company: { organizationId: "${ORG_B}", name: "x" } }) {
          query { invoices { totalCount } companies { totalCount } }
        } }`,
      );
      expect(res.errors).toBeUndefined();
      expect(res.data?.createCompany.query.invoices.totalCount).toBe(0);
    });

    test("filters cannot read another workspace (organizationId filter, or)", async () => {
      await seedVictim();
      const res = await asAttacker().execute<{
        invoices: { totalCount: number };
        people: { totalCount: number };
      }>(`{
        invoices(filter: { or: [{ organizationId: { equalTo: "${ORG_A}" } }, { invoiceNumber: { isNull: false } }] }) { totalCount }
        people(filter: { organizationId: { in: ["${ORG_A}", "${ORG_B}"] } }) { totalCount }
      }`);
      expect(res.errors).toBeUndefined();
      expect(res.data?.invoices.totalCount).toBe(0);
      expect(res.data?.people.totalCount).toBe(0);
    });

    test("child collections and their parent relations stay scoped", async () => {
      await seedVictim();
      const res = await asAttacker().execute<{
        payments: { nodes: unknown[] };
        invoiceLineItems: { nodes: unknown[] };
      }>(`{
        payments { nodes { rowId invoice { rowId notes } } }
        invoiceLineItems { nodes { rowId invoice { rowId } } }
      }`);
      expect(res.data?.payments.nodes).toEqual([]);
      expect(res.data?.invoiceLineItems.nodes).toEqual([]);
    });

    test("invoiceHtml refuses another workspace's invoice and anonymous callers", async () => {
      const { invoice } = await seedVictim();
      const q = `query ($id: UUID!) { invoiceHtml(invoiceId: $id) { html } }`;

      for (const caller of [asAttacker(), anon()]) {
        const res = await caller.execute<{ invoiceHtml: { html: string } | null }>(
          q,
          { id: invoice },
        );
        expect(res.data?.invoiceHtml ?? null).toBeNull();
        expect(res.errors).toBeDefined();
      }
    });

    test("workspacePlan refuses another workspace", async () => {
      await seedVictim();
      const res = await asAttacker().execute(
        `{ workspacePlan(organizationId: "${ORG_A}") { tier limits { key used } } }`,
      );
      expect(res.errors?.[0]?.extensions?.code).toBe("FORBIDDEN");
    });
  });

  describe("cross-workspace writes", () => {
    test("creating a row in another workspace is refused for every org table", async () => {
      const inputs: Array<[string, string, Record<string, unknown>]> = [
        ["createCompany", "company", { name: "x" }],
        ["createPerson", "person", { firstName: "x", lastName: "y" }],
        ["createProduct", "product", { name: "x" }],
        ["createSupplier", "supplier", { name: "x" }],
        ["createInvoice", "invoice", { invoiceNumber: "X-1", issueDate: "2026-08-01" }],
        ["createQuote", "quote", { quoteNumber: "Q-1", title: "x", validUntil: "2026-09-01" }],
        ["createCreditTransaction", "creditTransaction", { amount: "1", kind: "creditNote" }],
      ];

      for (const [mutation, key, fields] of inputs) {
        const res = await asAttacker().execute(
          `mutation ($input: ${mutation.replace("create", "Create")}Input!) { ${mutation}(input: $input) { clientMutationId } }`,
          { input: { [key]: { organizationId: ORG_A, ...fields } } },
        );
        expect({ mutation, refused: !!res.errors }).toEqual({
          mutation,
          refused: true,
        });
      }

      expect(
        await scalar(
          "select (select count(*) from company) + (select count(*) from person) + (select count(*) from invoice) + (select count(*) from credit_transaction) as v",
        ),
      ).toBe("0");
    });

    test("moving the attacker's own row into another workspace is refused", async () => {
      const { company } = await seedAttacker();
      const res = await asAttacker().execute(
        `mutation ($input: UpdateCompanyInput!) { updateCompany(input: $input) { company { rowId } } }`,
        { input: { rowId: company, patch: { organizationId: ORG_A } } },
      );
      expect(res.errors).toBeDefined();
      expect(
        await scalar("select organization_id as v from company where id = $1", [
          company,
        ]),
      ).toBe(ORG_B);
    });

    test("an own row cannot point at another workspace's row (then read it through the relation)", async () => {
      const victim = await seedVictim();
      const own = await seedAttacker();

      const attempts: Array<[string, Record<string, unknown>]> = [
        [
          `mutation ($input: CreateInvoiceInput!) { createInvoice(input: $input) { invoice { company { name } contact { notes } } } }`,
          {
            input: {
              invoice: {
                organizationId: ORG_B,
                invoiceNumber: "PIVOT",
                issueDate: "2026-08-01",
                companyId: victim.company,
                contactId: victim.person,
              },
            },
          },
        ],
        [
          `mutation ($input: UpdateInvoiceInput!) { updateInvoice(input: $input) { invoice { company { name } } } }`,
          { input: { rowId: own.invoice, patch: { companyId: victim.company } } },
        ],
        [
          `mutation ($input: CreateQuoteInput!) { createQuote(input: $input) { quote { rowId } } }`,
          {
            input: {
              quote: {
                organizationId: ORG_B,
                quoteNumber: "Q-PIVOT",
                title: "x",
                validUntil: "2026-09-01",
                convertedInvoiceId: victim.invoice,
              },
            },
          },
        ],
        [
          `mutation ($input: CreateCompanyMemberInput!) { createCompanyMember(input: $input) { companyMember { person { notes } } } }`,
          { input: { companyMember: { companyId: own.company, personId: victim.person } } },
        ],
        [
          `mutation ($input: CreatePaymentInput!) { createPayment(input: $input) { payment { invoice { notes } } } }`,
          { input: { payment: { invoiceId: victim.invoice, amount: "1", paidAt: "2026-08-02" } } },
        ],
        [
          `mutation ($input: CreateCreditTransactionInput!) { createCreditTransaction(input: $input) { clientMutationId } }`,
          {
            input: {
              creditTransaction: {
                organizationId: ORG_B,
                amount: "1",
                kind: "creditNote",
                paymentId: victim.payment,
              },
            },
          },
        ],
      ];

      for (const [query, variables] of attempts) {
        const res = await asAttacker().execute(query, variables);
        expect({ query: query.slice(0, 40), refused: !!res.errors }).toEqual({
          query: query.slice(0, 40),
          refused: true,
        });
      }

      expect(
        await scalar(
          "select count(*) as v from invoice where organization_id = $1 and company_id is not null",
          [ORG_B],
        ),
      ).toBe("0");
    });

    test("generateDocumentNumber cannot advance another workspace's sequence", async () => {
      await seedVictim();
      for (const caller of [asAttacker(), anon()]) {
        const res = await caller.execute(
          `mutation { generateDocumentNumber(input: { organizationId: "${ORG_A}", documentType: "invoice" }) { documentNumber } }`,
        );
        expect(res.errors).toBeDefined();
      }
      expect(
        await scalar(
          "select next_sequential_number as v from document_numbering_config where organization_id = $1",
          [ORG_A],
        ),
      ).toBe(42);
    });

    test("applyInvoiceCredit cannot spend another workspace's credit on its invoice", async () => {
      const { invoice } = await seedVictim();
      for (const caller of [asAttacker(), anon()]) {
        const res = await caller.execute(
          `mutation ($id: UUID!) { applyInvoiceCredit(input: { invoiceId: $id, amount: "100" }) { remainingCredit } }`,
          { id: invoice },
        );
        expect(res.errors).toBeDefined();
      }
      expect(
        await scalar(
          "select count(*) as v from credit_transaction where kind = 'application'",
        ),
      ).toBe("0");
    });

    test("issueCredit cannot mint credit into another workspace or link its invoice", async () => {
      const { invoice } = await seedVictim();

      const intoA = await asAttacker().execute(
        `mutation { issueCredit(input: { organizationId: "${ORG_A}", amount: "999" }) { balance } }`,
      );
      expect(intoA.errors).toBeDefined();

      const linked = await asAttacker().execute(
        `mutation ($id: UUID!) { issueCredit(input: { organizationId: "${ORG_B}", amount: "1", invoiceId: $id }) { balance } }`,
        { id: invoice },
      );
      expect(linked.errors).toBeDefined();

      expect(
        await scalar("select count(*) as v from credit_transaction"),
      ).toBe("1");
    });

    test("anonymous callers cannot call any custom mutation", async () => {
      const res = await anon().execute(
        `mutation { issueCredit(input: { organizationId: "${ORG_A}", amount: "1" }) { balance } }`,
      );
      expect(res.errors?.[0]?.extensions?.code).toBe("UNAUTHENTICATED");
    });
  });

  describe("workspace admin operations", () => {
    test("a plain member cannot change settings, numbering or sales channels", async () => {
      await seedVictim();
      const cfg = await scalar(
        "select id as v from document_numbering_config where organization_id = $1",
        [ORG_A],
      );

      const attempts: Array<[string, Record<string, unknown>]> = [
        [
          `mutation ($input: CreateOrganizationSettingInput!) { createOrganizationSetting(input: $input) { clientMutationId } }`,
          { input: { organizationSetting: { organizationId: ORG_A, companyName: "pwned" } } },
        ],
        [
          `mutation ($input: UpdateDocumentNumberingConfigInput!) { updateDocumentNumberingConfig(input: $input) { clientMutationId } }`,
          { input: { rowId: cfg, patch: { nextSequentialNumber: 1 } } },
        ],
        [
          `mutation ($input: CreateDocumentNumberingConfigInput!) { createDocumentNumberingConfig(input: $input) { clientMutationId } }`,
          { input: { documentNumberingConfig: { organizationId: ORG_A, documentType: "quote", prefix: "X" } } },
        ],
        [
          `mutation ($input: CreateChannelConnectionInput!) { createChannelConnection(input: $input) { clientMutationId } }`,
          { input: { channelConnection: { organizationId: ORG_A, provider: "shopify" } } },
        ],
      ];

      for (const [query, variables] of attempts) {
        const res = await asMemberA().execute(query, variables);
        expect(res.errors?.[0]?.message).toBeDefined();
      }

      const channels = await asMemberA().execute<{
        channelConnections: { nodes: unknown[] };
      }>(`{ channelConnections { nodes { rowId } } }`);
      expect(channels.data?.channelConnections.nodes).toEqual([]);

      expect(
        await scalar(
          "select next_sequential_number as v from document_numbering_config where id = $1",
          [cfg],
        ),
      ).toBe(42);
      expect(await scalar("select count(*) as v from organization_settings")).toBe(
        "0",
      );
      expect(await scalar("select count(*) as v from channel_connection")).toBe(
        "1",
      );
    });

    test("a plain member cannot delete settings or sales channels", async () => {
      await seedVictim();
      const channel = await scalar("select id as v from channel_connection");
      const res = await asMemberA().execute(
        `mutation ($input: DeleteChannelConnectionInput!) { deleteChannelConnection(input: $input) { clientMutationId } }`,
        { input: { rowId: channel } },
      );
      expect(res.errors).toBeDefined();
      expect(await scalar("select count(*) as v from channel_connection")).toBe(
        "1",
      );
    });
  });

  describe("plan limit bypasses", () => {
    const CREATE_PERSON = /* GraphQL */ `
      mutation ($input: CreatePersonInput!) { createPerson(input: $input) { person { rowId } } }
    `;
    const CREATE_INVOICE = /* GraphQL */ `
      mutation ($input: CreateInvoiceInput!) { createInvoice(input: $input) { invoice { rowId } } }
    `;
    let seq = 0;
    const person = (org = ORG_A) => ({
      input: {
        person: { organizationId: org, firstName: "P", lastName: String(++seq) },
      },
    });
    const invoice = (org = ORG_A, extra: Record<string, unknown> = {}) => ({
      input: {
        invoice: {
          organizationId: org,
          invoiceNumber: `INV-${++seq}`,
          issueDate: "2026-11-01",
          ...extra,
        },
      },
    });
    const count = async (table: string, org = ORG_A) =>
      Number(
        await scalar(
          `select count(*) as v from ${table} where organization_id = $1`,
          [org],
        ),
      );

    test("[finding] parallel contact creates cannot overshoot the contact cap", async () => {
      useFreePlan(ORG_A, { max_contacts: "5" });
      for (let i = 0; i < 4; i++)
        expect((await asOwnerA().execute(CREATE_PERSON, person())).errors).toBeUndefined();

      const results = await Promise.all(
        Array.from({ length: 12 }, () => asOwnerA().execute(CREATE_PERSON, person())),
      );

      expect(await count("person")).toBeLessThanOrEqual(5);
      expect(await count("person")).toBe(4 + results.filter((r) => !r.errors).length);
    });

    test("[finding] parallel invoice creates cannot overshoot the monthly invoice cap", async () => {
      useFreePlan(ORG_A, { max_invoices_per_month: "3" });

      const results = await Promise.all(
        Array.from({ length: 12 }, () => asOwnerA().execute(CREATE_INVOICE, invoice())),
      );

      const created = results.filter((r) => !r.errors).length;
      expect(await count("invoice")).toBeLessThanOrEqual(3);
      // Every refused create reports the limit, and every reported success exists
      expect(await count("invoice")).toBe(created);
      for (const r of results.filter((r) => r.errors))
        expect(r.errors?.[0]?.extensions?.code).toBe("PLAN_LIMIT_REACHED");
    });

    test("aliased creates in one request cannot overshoot the contact cap", async () => {
      useFreePlan(ORG_A, { max_contacts: "2" });
      const aliases = Array.from(
        { length: 5 },
        (_, i) =>
          `p${i}: createPerson(input: { person: { organizationId: "${ORG_A}", firstName: "A", lastName: "${i}" } }) { person { rowId } }`,
      ).join("\n");

      await asOwnerA().execute(`mutation { ${aliases} }`);

      expect(await count("person")).toBe(2);
    });

    test("backdating createdAt does not free monthly invoice slots", async () => {
      useFreePlan(ORG_A, { max_invoices_per_month: "2" });

      for (let i = 0; i < 4; i++)
        await asOwnerA().execute(
          CREATE_INVOICE,
          invoice(ORG_A, { createdAt: "2020-01-01T00:00:00Z" }),
        );

      expect(await count("invoice")).toBe(2);
    });

    test("deleting and recreating invoices does not free monthly slots", async () => {
      useFreePlan(ORG_A, { max_invoices_per_month: "1" });

      const first = await asOwnerA().execute<{
        createInvoice: { invoice: { rowId: string } };
      }>(CREATE_INVOICE, invoice());
      await asOwnerA().execute(
        `mutation ($input: DeleteInvoiceInput!) { deleteInvoice(input: $input) { clientMutationId } }`,
        { input: { rowId: first.data?.createInvoice.invoice.rowId } },
      );
      const again = await asOwnerA().execute(CREATE_INVOICE, invoice());
      expect(again.errors?.[0]?.extensions?.code).toBe("PLAN_LIMIT_REACHED");
    });

    test("[finding] invoices cannot be moved into a workspace past its monthly cap", async () => {
      // A capped workspace fills its quota, then takes invoices created in
      // another workspace the caller belongs to (every user also has a
      // personal workspace with its own quota)
      useFreePlan(ORG_A, { max_invoices_per_month: "1" });
      useFreePlan(ORG_B, { max_invoices_per_month: "5" });
      expect((await asDual().execute(CREATE_INVOICE, invoice(ORG_A))).errors).toBeUndefined();
      expect(
        (await asDual().execute(CREATE_INVOICE, invoice(ORG_A))).errors?.[0]
          ?.extensions?.code,
      ).toBe("PLAN_LIMIT_REACHED");

      const elsewhere = await asDual().execute<{
        createInvoice: { invoice: { rowId: string } };
      }>(CREATE_INVOICE, invoice(ORG_B));
      expect(elsewhere.errors).toBeUndefined();

      const move = await asDual().execute(
        `mutation ($input: UpdateInvoiceInput!) { updateInvoice(input: $input) { invoice { rowId } } }`,
        {
          input: {
            rowId: elsewhere.data?.createInvoice.invoice.rowId,
            patch: { organizationId: ORG_A },
          },
        },
      );
      // A record's workspace is now set once, so the move itself is refused
      expect(move.errors).toBeDefined();
      expect(await count("invoice", ORG_A)).toBe(1);
    });

    test("contacts imported one by one (the app's CSV import path) stop at the cap", async () => {
      useFreePlan(ORG_A, { max_contacts: "3" });
      const results = [];
      for (let i = 0; i < 6; i++)
        results.push(await asOwnerA().execute(CREATE_PERSON, person()));
      expect(results.filter((r) => !r.errors)).toHaveLength(3);
      expect(await count("person")).toBe(3);
    });
  });

  describe("cross-workspace references made by a member of both", () => {
    /**
     * A caller in both A and B links A's invoice to B's company and contact.
     * The membership check passed (they belong to both), but A's other
     * members, who are not in B, could then read B's company and contact
     * through A's invoice
     */
    test("[finding] a row cannot reference a row in a different workspace, even one the caller belongs to", async () => {
      const b = await seedAttacker();
      const res = await asDual().execute(
        `mutation ($input: CreateInvoiceInput!) { createInvoice(input: $input) { invoice { rowId } } }`,
        {
          input: {
            invoice: {
              organizationId: ORG_A,
              invoiceNumber: "CROSS",
              issueDate: "2026-08-01",
              companyId: b.company,
              contactId: b.person,
            },
          },
        },
      );
      expect(res.errors).toBeDefined();
      expect(
        await scalar(
          "select count(*) as v from invoice where organization_id = $1",
          [ORG_A],
        ),
      ).toBe("0");
    });

    test("[finding] invoiceHtml never renders a company or contact from another workspace", async () => {
      // A legacy cross-workspace link, written before the guard above
      const b = await seedAttacker();
      await ctx.pool.query(
        "update company set name = 'B Confidential Co' where id = $1",
        [b.company],
      );
      const invoice = await one(
        "insert into invoice (organization_id, invoice_number, issue_date, company_id, contact_id) values ($1, 'LEGACY', '2026-08-01', $2, $3) returning id",
        [ORG_A, b.company, b.person],
      );

      const res = await asMemberA().execute<{ invoiceHtml: { html: string } }>(
        `query ($id: UUID!) { invoiceHtml(invoiceId: $id) { html } }`,
        { id: invoice },
      );
      expect(res.errors).toBeUndefined();
      expect(res.data?.invoiceHtml.html).not.toContain("B Confidential Co");
      expect(res.data?.invoiceHtml.html).not.toContain("Acker");

      // The GraphQL relation already hides it
      const rel = await asMemberA().execute<{
        invoice: { company: unknown; contact: unknown };
      }>(`query ($id: UUID!) { invoice(rowId: $id) { company { name } contact { lastName } } }`, {
        id: invoice,
      });
      expect(rel.data?.invoice.company).toBeNull();
      expect(rel.data?.invoice.contact).toBeNull();
    });
  });

  describe("convertQuoteToInvoice", () => {
    const CONVERT = /* GraphQL */ `
      mutation ($input: ConvertQuoteToInvoiceInput!) {
        convertQuoteToInvoice(input: $input) { invoiceId invoiceNumber }
      }
    `;
    let n = 0;
    const acceptedQuote = (org = ORG_A, extra: { companyId?: string; contactId?: string } = {}) =>
      one(
        "insert into quote (organization_id, quote_number, title, valid_until, status, company_id, contact_id) values ($1, $2, 'Q', '2026-12-31', 'accepted', $3, $4) returning id",
        [org, `QC-${++n}`, extra.companyId ?? null, extra.contactId ?? null],
      );

    test("another workspace's member and anonymous callers cannot convert its quote", async () => {
      const quoteId = await acceptedQuote();
      for (const caller of [asAttacker(), anon()]) {
        const res = await caller.execute(CONVERT, { input: { quoteId } });
        expect(res.errors).toBeDefined();
      }
      expect(await scalar("select count(*) as v from invoice")).toBe("0");
      expect(
        await scalar("select status as v from quote where id = $1", [quoteId]),
      ).toBe("accepted");
    });

    test("[finding] conversions and creates racing together cannot overshoot the monthly invoice cap", async () => {
      useFreePlan(ORG_A, { max_invoices_per_month: "3" });
      const quotes = await Promise.all(
        Array.from({ length: 6 }, () => acceptedQuote()),
      );

      await Promise.all([
        ...quotes.map((quoteId) =>
          asOwnerA().execute(CONVERT, { input: { quoteId } }),
        ),
        ...Array.from({ length: 6 }, (_, i) =>
          asOwnerA().execute(
            `mutation ($input: CreateInvoiceInput!) { createInvoice(input: $input) { invoice { rowId } } }`,
            {
              input: {
                invoice: {
                  organizationId: ORG_A,
                  invoiceNumber: `RACE-${i}`,
                  issueDate: "2026-11-01",
                },
              },
            },
          ),
        ),
      ]);

      expect(
        Number(
          await scalar(
            "select count(*) as v from invoice where organization_id = $1",
            [ORG_A],
          ),
        ),
      ).toBeLessThanOrEqual(3);
    });

    test("[finding] a stale link to another workspace's client is not copied onto the invoice", async () => {
      const b = await seedAttacker();
      await ctx.pool.query(
        "update company set name = 'B Confidential Co' where id = $1",
        [b.company],
      );
      const quoteId = await acceptedQuote(ORG_A, {
        companyId: b.company,
        contactId: b.person,
      });

      const res = await asOwnerA().execute<{
        convertQuoteToInvoice: { invoiceId: string };
      }>(CONVERT, { input: { quoteId } });
      expect(res.errors).toBeUndefined();

      const { rows } = await ctx.pool.query(
        "select company_id, contact_id, coalesce(bill_to, '') as bill_to from invoice where id = $1",
        [res.data?.convertQuoteToInvoice.invoiceId],
      );
      expect(rows[0]?.company_id).toBeNull();
      expect(rows[0]?.contact_id).toBeNull();
      expect(rows[0]?.bill_to).not.toContain("B Confidential Co");
      expect(rows[0]?.bill_to).not.toContain("Acker");
    });
  });

  describe("a record's workspace is set once", () => {
    test("[finding] no update can change organizationId, even for a member of both workspaces", async () => {
      const own = await seedAttacker();
      const cases: Array<[string, string, string]> = [
        ["updateCompany", "UpdateCompanyInput", own.company],
        ["updateInvoice", "UpdateInvoiceInput", own.invoice],
        ["updatePerson", "UpdatePersonInput", own.person],
      ];
      for (const [mutation, type, rowId] of cases) {
        const res = await asDual().execute(
          `mutation ($input: ${type}!) { ${mutation}(input: $input) { clientMutationId } }`,
          { input: { rowId, patch: { organizationId: ORG_A } } },
        );
        expect({ mutation, refused: !!res.errors }).toEqual({
          mutation,
          refused: true,
        });
      }
      expect(
        await scalar(
          "select count(*) as v from (select organization_id from company union all select organization_id from invoice union all select organization_id from person) t where organization_id = $1",
          [ORG_A],
        ),
      ).toBe("0");
    });

    test("[finding] a child record cannot move to a parent in another workspace", async () => {
      const own = await seedAttacker();
      const victim = await seedVictim();
      const payment = await one(
        "insert into payment (invoice_id, amount, paid_at) values ($1, 5, '2026-08-02') returning id",
        [own.invoice],
      );

      const res = await asDual().execute(
        `mutation ($input: UpdatePaymentInput!) { updatePayment(input: $input) { clientMutationId } }`,
        { input: { rowId: payment, patch: { invoiceId: victim.invoice } } },
      );
      expect(res.errors).toBeDefined();
      expect(
        await scalar("select invoice_id as v from payment where id = $1", [
          payment,
        ]),
      ).toBe(own.invoice);
    });
  });

  describe("the credit ledger is append-only", () => {
    test("[finding] the generated credit create, update and delete mutations are gone", async () => {
      for (const field of [
        "createCreditTransaction",
        "updateCreditTransaction",
        "deleteCreditTransaction",
      ]) {
        const res = await asOwnerA().execute(
          `mutation { ${field}(input: {}) { clientMutationId } }`,
        );
        expect(res.errors?.[0]?.message).toContain(
          `Cannot query field "${field}"`,
        );
      }
    });

    test("issueCredit refuses the system-only kinds", async () => {
      for (const kind of ["overpayment", "application", "void"]) {
        const res = await asOwnerA().execute(
          `mutation { issueCredit(input: { organizationId: "${ORG_A}", amount: "100", kind: "${kind}" }) { balance } }`,
        );
        expect(res.errors).toBeDefined();
      }
      expect(await scalar("select count(*) as v from credit_transaction")).toBe(
        "0",
      );
    });
  });
});
