import { beforeEach, describe, expect, test } from "bun:test";
import { createHmac } from "node:crypto";

import { eq, inArray } from "drizzle-orm";

import {
  channelConnectionTable,
  companyMemberTable,
  companyTable,
  creditTransactionTable,
  invoiceLineItemTable,
  invoiceTable,
  organizationSettingsTable,
  paymentTable,
  personTable,
  productTable,
  quoteLineItemTable,
  quoteTable,
  supplierTable,
} from "lib/db/schema";
import { createIdpWebhook } from "lib/idp/idpWebhook";
import { setupTestContext } from "test/setup/testContext";

const SECRET = "test-idp-secret";
const ORG = "org-deleted";
const OTHER_ORG = "org-kept";

const sign = (body: string) =>
  createHmac("sha256", SECRET).update(body).digest("hex");

// The flat shape Vortex delivers (IDP_EVENT_TRANSFORM)
const deleted = (organizationId: string) => ({
  eventType: "organization.deleted",
  organizationId,
  timestamp: new Date().toISOString(),
});

describe("POST /webhooks/idp organization.deleted", () => {
  const ctx = setupTestContext();

  // The shared reset leaves these workspace tables alone
  beforeEach(async () => {
    const { db } = ctx;
    for (const table of [
      supplierTable,
      channelConnectionTable,
      organizationSettingsTable,
    ]) {
      await db
        .delete(table)
        .where(inArray(table.organizationId, [ORG, OTHER_ORG]));
    }
  });

  const post = (
    body: unknown,
    { signature, secret = SECRET }: { signature?: string | null; secret?: string } = {},
  ) => {
    const raw = JSON.stringify(body);
    // biome-ignore lint/suspicious/noExplicitAny: test database client stands in for the pool
    return createIdpWebhook({ db: ctx.db as any, webhookSecret: secret }).handle(
      new Request("http://localhost/webhooks/idp", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(signature === null
            ? {}
            : { "x-idp-signature": signature ?? sign(raw) }),
        },
        body: raw,
      }),
    );
  };

  /** One row in each of the workspace's tables, wired together */
  const seed = async (organizationId: string) => {
    const { db } = ctx;
    const [company] = await db
      .insert(companyTable)
      .values({ organizationId, name: "Acme" })
      .returning();
    const [person] = await db
      .insert(personTable)
      .values({ organizationId, firstName: "Ada", lastName: "Lovelace" })
      .returning();
    const [supplier] = await db
      .insert(supplierTable)
      .values({ organizationId, name: "Parts Co" })
      .returning();
    if (!company || !person || !supplier) throw new Error("seed failed");
    await db
      .insert(companyMemberTable)
      .values({ companyId: company.id, personId: person.id });
    const [product] = await db
      .insert(productTable)
      .values({ organizationId, name: "Widget", supplierId: supplier.id })
      .returning();
    const [invoice] = await db
      .insert(invoiceTable)
      .values({
        organizationId,
        invoiceNumber: `INV-${organizationId}`,
        issueDate: "2026-08-01",
        companyId: company.id,
        contactId: person.id,
      })
      .returning();
    const [quote] = await db
      .insert(quoteTable)
      .values({
        organizationId,
        quoteNumber: `Q-${organizationId}`,
        title: "Build",
        validUntil: "2026-09-01",
        companyId: company.id,
        contactId: person.id,
        convertedInvoiceId: invoice?.id,
      })
      .returning();
    if (!product || !invoice || !quote) throw new Error("seed failed");
    const line = {
      description: "Widget",
      quantity: "1",
      unitPrice: "100.00",
      amount: "100.00",
      productId: product.id,
    };
    await db.insert(invoiceLineItemTable).values({ ...line, invoiceId: invoice.id });
    await db.insert(quoteLineItemTable).values({ ...line, quoteId: quote.id });
    const [payment] = await db
      .insert(paymentTable)
      .values({ invoiceId: invoice.id, amount: "120.00", paidAt: "2026-08-02" })
      .returning();
    await db.insert(creditTransactionTable).values({
      organizationId,
      amount: "20.00",
      kind: "overpayment",
      invoiceId: invoice.id,
      paymentId: payment?.id,
    });
    await db.insert(channelConnectionTable).values({
      organizationId,
      provider: "etsy",
      credentials: { accessToken: "secret" },
    });
    await db.insert(organizationSettingsTable).values({ organizationId });
    return { invoiceId: invoice.id, companyId: company.id };
  };

  const countOrg = async (organizationId: string) => {
    const { db } = ctx;
    const tables = [
      companyTable,
      personTable,
      supplierTable,
      productTable,
      invoiceTable,
      quoteTable,
      creditTransactionTable,
      channelConnectionTable,
      organizationSettingsTable,
    ] as const;
    let total = 0;
    for (const table of tables) {
      total += (
        await db
          .select({ id: table.id })
          .from(table)
          .where(eq(table.organizationId, organizationId))
      ).length;
    }
    return total;
  };

  test("deletes everything the workspace keeps, children included", async () => {
    const { invoiceId, companyId } = await seed(ORG);
    expect(await countOrg(ORG)).toBe(9);

    const res = await post(deleted(ORG));
    expect(res.status).toBe(200);

    const { db } = ctx;
    expect(await countOrg(ORG)).toBe(0);
    expect(
      await db
        .select()
        .from(paymentTable)
        .where(eq(paymentTable.invoiceId, invoiceId)),
    ).toHaveLength(0);
    expect(
      await db
        .select()
        .from(invoiceLineItemTable)
        .where(eq(invoiceLineItemTable.invoiceId, invoiceId)),
    ).toHaveLength(0);
    expect(
      await db
        .select()
        .from(companyMemberTable)
        .where(eq(companyMemberTable.companyId, companyId)),
    ).toHaveLength(0);
  });

  test("leaves another workspace untouched", async () => {
    await seed(ORG);
    await seed(OTHER_ORG);

    await post(deleted(ORG));

    expect(await countOrg(OTHER_ORG)).toBe(9);
  });

  test("is idempotent: a redelivery acks 200", async () => {
    await seed(ORG);
    expect((await post(deleted(ORG))).status).toBe(200);
    expect((await post(deleted(ORG))).status).toBe(200);
  });

  test("refuses an unsigned or forged call (401) and deletes nothing", async () => {
    await seed(ORG);
    expect((await post(deleted(ORG), { signature: null })).status).toBe(401);
    expect((await post(deleted(ORG), { signature: "deadbeef" })).status).toBe(
      401,
    );
    expect(await countOrg(ORG)).toBe(9);
  });

  test("fails closed (503) when no secret is configured", async () => {
    await seed(ORG);
    expect((await post(deleted(ORG), { secret: "" })).status).toBe(503);
    expect(await countOrg(ORG)).toBe(9);
  });

  test("rejects an event without an organization id (400)", async () => {
    expect((await post({ eventType: "organization.deleted" })).status).toBe(
      400,
    );
  });
});
