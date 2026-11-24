import { describe, expect, test } from "bun:test";
import { HttpResponse, http } from "msw";

import { createBillingProvider } from "@omnidotdev/providers/billing";

import { clearLimitsCache } from "lib/entitlements";
import { APP_ID, providers } from "lib/providers";
import { mswServer } from "test/setup/mswServer";
import { setupTestContext } from "test/setup/testContext";

/**
 * Plan limits from Aether, enforced server-side on direct GraphQL writes:
 * contacts (every person counts, internal or not, including people moved in
 * from another workspace) and invoices per month (creations count, so a
 * delete does not free a slot). Covers the three billing modes: configured and
 * answering, configured but failing (last known plan, else fail open), and not
 * configured (no limits)
 */

const AETHER_URL = "http://aether.test";
const ORG = "org-limits";
const OTHER_ORG = "org-limits-other";
const user = { id: "user-limits", name: "Limits" };

const entitlementsUrl = (org: string) =>
  `${AETHER_URL}/entitlements/${APP_ID}/organization/${org}`;

const entitlements = (org: string, values: Record<string, string>) => ({
  billingAccountId: "ba-1",
  entityType: "organization",
  entityId: org,
  entitlementVersion: 1,
  entitlements: Object.entries(values).map(([featureKey, value], i) => ({
    id: `e-${i}`,
    productId: APP_ID,
    featureKey,
    value,
    source: "subscription",
    validFrom: "2026-01-01T00:00:00Z",
    validUntil: null,
  })),
});

/** A fresh Aether client (no cache, closed breaker) against the mock */
const useAether = () => {
  providers.billing = createBillingProvider({
    provider: "aether",
    baseUrl: AETHER_URL,
    serviceApiKey: "test-billing-key",
    appId: APP_ID,
  });
};

const answer = (org: string, values: Record<string, string>) =>
  mswServer.use(
    http.get(entitlementsUrl(org), () =>
      HttpResponse.json(entitlements(org, values)),
    ),
  );

const fail = (org: string) =>
  mswServer.use(
    http.get(entitlementsUrl(org), () =>
      HttpResponse.json({ error: "down" }, { status: 503 }),
    ),
  );

const CREATE_PERSON = /* GraphQL */ `
  mutation ($input: CreatePersonInput!) {
    createPerson(input: $input) { person { rowId } }
  }
`;

const CREATE_INVOICE = /* GraphQL */ `
  mutation ($input: CreateInvoiceInput!) {
    createInvoice(input: $input) { invoice { rowId } }
  }
`;

describe("plan limits", () => {
  const ctx = setupTestContext();
  const asOwner = () => ctx.graphqlAs(user, [ORG, OTHER_ORG]);

  let seq = 0;
  const createPerson = (internal = false, org = ORG) =>
    asOwner().execute<{ createPerson: { person: { rowId: string } } }>(
      CREATE_PERSON,
      {
        input: {
          person: {
            organizationId: org,
            firstName: "P",
            lastName: String(++seq),
            internal,
          },
        },
      },
    );

  const createInvoice = (org = ORG) =>
    asOwner().execute<{ createInvoice: { invoice: { rowId: string } } }>(
      CREATE_INVOICE,
      {
        input: {
          invoice: {
            organizationId: org,
            invoiceNumber: `INV-${++seq}`,
            issueDate: "2026-11-01",
          },
        },
      },
    );

  const count = async (table: string, org = ORG) =>
    (
      await ctx.pool.query(
        `select count(*)::int as n from ${table} where organization_id = $1`,
        [org],
      )
    ).rows[0]?.n as number;

  const limitCode = (result: { errors?: readonly unknown[] }) =>
    (
      result.errors?.[0] as
        | { extensions?: { code?: string; limit?: string } }
        | undefined
    )?.extensions;

  test("contacts stop at the plan limit, internal or not, and the refused write rolls back", async () => {
    useAether();
    answer(ORG, { tier: "free", max_contacts: "2" });

    expect((await createPerson()).errors).toBeUndefined();
    expect((await createPerson(true)).errors).toBeUndefined();

    const third = await createPerson(true);
    expect(limitCode(third)).toEqual({
      code: "PLAN_LIMIT_REACHED",
      limit: "max_contacts",
    });
    expect(third.errors?.[0]?.message).toContain("up to 2 contacts");
    expect(await count("person")).toBe(2);
  });

  test("a person cannot be moved into another workspace (so not past its contact limit)", async () => {
    useAether();
    answer(ORG, { tier: "free", max_contacts: "1" });
    answer(OTHER_ORG, { tier: "pro" });

    expect((await createPerson()).errors).toBeUndefined();
    const other = await createPerson(false, OTHER_ORG);
    const otherId = other.data?.createPerson.person.rowId;

    const move = await asOwner().execute(
      /* GraphQL */ `
        mutation ($input: UpdatePersonInput!) {
          updatePerson(input: $input) { person { rowId } }
        }
      `,
      { input: { rowId: otherId, patch: { organizationId: ORG } } },
    );
    // A record's workspace is set once: the patch has no organizationId
    expect(move.errors).toBeDefined();
    expect(await count("person")).toBe(1);
    expect(await count("person", OTHER_ORG)).toBe(1);
  });

  test("monthly invoices count creations, so deleting one does not free a slot", async () => {
    useAether();
    answer(ORG, { tier: "free", max_invoices_per_month: "2" });

    const first = await createInvoice();
    expect(first.errors).toBeUndefined();
    expect((await createInvoice()).errors).toBeUndefined();

    const removed = await asOwner().execute(
      /* GraphQL */ `
        mutation ($input: DeleteInvoiceInput!) {
          deleteInvoice(input: $input) { clientMutationId }
        }
      `,
      { input: { rowId: first.data?.createInvoice.invoice.rowId } },
    );
    expect(removed.errors).toBeUndefined();

    const third = await createInvoice();
    expect(limitCode(third)?.limit).toBe("max_invoices_per_month");
    expect(await count("invoice")).toBe(1);
  });

  test("a paid tier without explicit limits is unlimited", async () => {
    useAether();
    answer(ORG, { tier: "pro" });

    for (let i = 0; i < 7; i++)
      expect((await createInvoice()).errors).toBeUndefined();
  });

  test("no billing account means the free tier", async () => {
    useAether();
    mswServer.use(
      http.get(entitlementsUrl(ORG), () =>
        HttpResponse.json({ error: "not found" }, { status: 404 }),
      ),
    );

    for (let i = 0; i < 5; i++)
      expect((await createInvoice()).errors).toBeUndefined();
    expect(limitCode(await createInvoice())?.code).toBe("PLAN_LIMIT_REACHED");
  });

  test("an Aether outage keeps the last known plan", async () => {
    useAether();
    answer(ORG, { tier: "free", max_contacts: "1" });
    expect((await createPerson()).errors).toBeUndefined();

    // A new client has no response cache of its own: only the last known plan
    // can still apply
    useAether();
    fail(ORG);
    expect(limitCode(await createPerson())?.code).toBe("PLAN_LIMIT_REACHED");
  });

  test("a restart during an Aether outage keeps the persisted plan", async () => {
    useAether();
    answer(ORG, { tier: "free", max_contacts: "1" });
    expect((await createPerson()).errors).toBeUndefined();

    const snapshot = await ctx.pool.query(
      "select tier, limits from entitlement_snapshot where organization_id = $1",
      [ORG],
    );
    expect(snapshot.rows[0]?.tier).toBe("free");
    expect(snapshot.rows[0]?.limits.max_contacts).toBe(1);

    // A restart forgets everything held in memory
    clearLimitsCache();
    useAether();
    fail(ORG);
    expect(limitCode(await createPerson())?.code).toBe("PLAN_LIMIT_REACHED");
    expect(await count("person")).toBe(1);
  });

  test("a workspace without a billing account drops its persisted plan", async () => {
    useAether();
    answer(ORG, { tier: "pro" });
    expect((await createPerson()).errors).toBeUndefined();
    expect(await count("entitlement_snapshot")).toBe(1);

    clearLimitsCache();
    useAether();
    mswServer.use(
      http.get(entitlementsUrl(ORG), () =>
        HttpResponse.json({ error: "not found" }, { status: 404 }),
      ),
    );
    expect((await createPerson()).errors).toBeUndefined();
    expect(await count("entitlement_snapshot")).toBe(0);
  });

  test("an Aether outage with no known plan fails open", async () => {
    useAether();
    fail(ORG);

    for (let i = 0; i < 3; i++)
      expect((await createPerson()).errors).toBeUndefined();
  });

  test("a network failure is treated as an outage, not as the free tier", async () => {
    useAether();
    mswServer.use(http.get(entitlementsUrl(ORG), () => HttpResponse.error()));

    for (let i = 0; i < 6; i++)
      expect((await createInvoice()).errors).toBeUndefined();
  });

  test("a billing outage never blocks reading or editing existing records", async () => {
    useAether();
    answer(ORG, { tier: "free", max_contacts: "1" });
    expect((await createPerson()).errors).toBeUndefined();
    // Over the limit already (e.g. after a downgrade)
    await ctx.pool.query(
      "insert into person (organization_id, first_name, last_name) values ($1, 'Over', 'Limit'), ($1, 'Over', 'Limit2')",
      [ORG],
    );

    useAether();
    fail(ORG);

    const read = await asOwner().execute<{
      people: { nodes: Array<{ rowId: string }> };
    }>(/* GraphQL */ `{ people { nodes { rowId } } }`);
    expect(read.data?.people.nodes).toHaveLength(3);

    const edit = await asOwner().execute(
      /* GraphQL */ `
        mutation ($input: UpdatePersonInput!) {
          updatePerson(input: $input) { person { rowId } }
        }
      `,
      {
        input: {
          rowId: read.data?.people.nodes[0]?.rowId,
          patch: { notes: "still editable" },
        },
      },
    );
    expect(edit.errors).toBeUndefined();
    expect(await count("person")).toBe(3);
  });

  test("billing not configured applies no plan limits", async () => {
    providers.billing = undefined;

    for (let i = 0; i < 6; i++)
      expect((await createInvoice()).errors).toBeUndefined();
  });

  test("bypass workspaces are never limited", async () => {
    useAether();
    answer(ORG, { tier: "free", max_contacts: "0" });
    process.env.BILLING_BYPASS_ORG_IDS = `other,${ORG}`;

    expect((await createPerson()).errors).toBeUndefined();
  });

  test("workspacePlan reports the tier, limits and usage to members only", async () => {
    useAether();
    answer(ORG, { tier: "free", max_contacts: "50" });
    await createPerson();
    await createInvoice();

    const QUERY = /* GraphQL */ `
      query ($organizationId: String!) {
        workspacePlan(organizationId: $organizationId) {
          tier
          source
          limits { key limit used }
        }
      }
    `;

    const plan = await asOwner().execute<{
      workspacePlan: {
        tier: string;
        source: string;
        limits: Array<{ key: string; limit: number; used: number | null }>;
      };
    }>(QUERY, { organizationId: ORG });
    expect(plan.errors).toBeUndefined();
    expect(plan.data?.workspacePlan.tier).toBe("free");
    expect(plan.data?.workspacePlan.source).toBe("plan");
    const byKey = Object.fromEntries(
      plan.data?.workspacePlan.limits.map((l) => [l.key, l]) ?? [],
    );
    expect(byKey.max_contacts).toEqual({
      key: "max_contacts",
      limit: 50,
      used: 1,
    });
    expect(byKey.max_invoices_per_month).toEqual({
      key: "max_invoices_per_month",
      limit: 5,
      used: 1,
    });
    expect(byKey.max_team_members?.used).toBeNull();

    const outsider = await ctx
      .graphqlAs({ id: "x", name: "X" }, ["elsewhere"])
      .execute(QUERY, { organizationId: ORG });
    expect(outsider.errors).toBeDefined();
  });

  test("linking contacts to a company is not limited by the seat limit", async () => {
    useAether();
    answer(ORG, { tier: "free", max_team_members: "1" });

    const company = await ctx.pool.query<{ id: string }>(
      "insert into company (organization_id, name) values ($1, 'Acme') returning id",
      [ORG],
    );
    for (let i = 0; i < 3; i++) {
      const person = await createPerson();
      const link = await asOwner().execute(
        /* GraphQL */ `
          mutation ($input: CreateCompanyMemberInput!) {
            createCompanyMember(input: $input) { clientMutationId }
          }
        `,
        {
          input: {
            companyMember: {
              companyId: company.rows[0]?.id,
              personId: person.data?.createPerson.person.rowId,
            },
          },
        },
      );
      expect(link.errors).toBeUndefined();
    }
  });
});
