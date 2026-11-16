import { describe, expect, test } from "bun:test";

import { setupTestContext } from "test/setup/testContext";

/**
 * Workspace isolation for the generated GraphQL surface.
 *
 * The API runs in resolve-only mode, and before this guard every generated
 * mutation outside invoices, people and company members had no authorization:
 * an anonymous caller could rewrite any payment or supplier by rowId. Root
 * payment and credit reads were unscoped, relations (`payment { invoice }`)
 * skipped the root filter, and single-row reads returned any row to an
 * anonymous caller. These tests cover each path: anonymous refused, a member
 * of another workspace refused, the owning workspace allowed.
 */

const ORG_A = "org-a";
const ORG_B = "org-b";

const memberA = { id: "user-a", name: "A" };
const memberB = { id: "user-b", name: "B" };

describe("workspace isolation", () => {
  const ctx = setupTestContext();

  const asA = () => ctx.graphqlAs(memberA, [ORG_A]);
  const asB = () => ctx.graphqlAs(memberB, [ORG_B]);
  const anon = () => ctx.graphql;

  const createInvoice = async (
    client: ReturnType<typeof asA>,
    organizationId: string,
    invoiceNumber: string,
  ) => {
    const result = await client.execute<{
      createInvoice: { invoice: { rowId: string } };
    }>(
      /* GraphQL */ `
        mutation ($input: CreateInvoiceInput!) {
          createInvoice(input: $input) { invoice { rowId } }
        }
      `,
      {
        input: {
          invoice: {
            organizationId,
            invoiceNumber,
            issueDate: "2026-08-01",
            total: "100.00",
          },
        },
      },
    );
    return result;
  };

  const createPayment = (client: ReturnType<typeof asA>, invoiceId: string) =>
    client.execute<{ createPayment: { payment: { rowId: string } } }>(
      /* GraphQL */ `
        mutation ($input: CreatePaymentInput!) {
          createPayment(input: $input) { payment { rowId amount } }
        }
      `,
      { input: { payment: { invoiceId, amount: "40.00", paidAt: "2026-08-02" } } },
    );

  /** Org A owns an invoice with one payment and a supplier */
  const seed = async () => {
    const invoice = await createInvoice(asA(), ORG_A, "INV-A-1");
    expect(invoice.errors).toBeUndefined();
    const invoiceId = invoice.data?.createInvoice.invoice.rowId as string;

    const payment = await createPayment(asA(), invoiceId);
    expect(payment.errors).toBeUndefined();
    const paymentId = payment.data?.createPayment.payment.rowId as string;

    const supplier = await asA().execute<{
      createSupplier: { supplier: { rowId: string } };
    }>(
      /* GraphQL */ `
        mutation ($input: CreateSupplierInput!) {
          createSupplier(input: $input) { supplier { rowId } }
        }
      `,
      { input: { supplier: { organizationId: ORG_A, name: "Acme" } } },
    );
    expect(supplier.errors).toBeUndefined();

    return {
      invoiceId,
      paymentId,
      supplierId: supplier.data?.createSupplier.supplier.rowId as string,
    };
  };

  const paymentAmount = async (paymentId: string) => {
    const { rows } = await ctx.pool.query(
      "select amount from payment where id = $1",
      [paymentId],
    );
    return rows[0]?.amount as string | undefined;
  };

  const UPDATE_PAYMENT = /* GraphQL */ `
    mutation ($input: UpdatePaymentInput!) {
      updatePayment(input: $input) { payment { rowId } }
    }
  `;

  test("anonymous callers cannot write", async () => {
    const { paymentId, supplierId } = await seed();

    const payment = await anon().execute(UPDATE_PAYMENT, {
      input: { rowId: paymentId, patch: { amount: "1.00" } },
    });
    expect(payment.errors).toBeDefined();
    expect(await paymentAmount(paymentId)).toBe("40.00");

    const supplier = await anon().execute(
      /* GraphQL */ `
        mutation ($input: UpdateSupplierInput!) {
          updateSupplier(input: $input) { supplier { rowId } }
        }
      `,
      { input: { rowId: supplierId, patch: { name: "pwned" } } },
    );
    expect(supplier.errors).toBeDefined();
  });

  test("anonymous callers cannot read payments, their invoices, or rows by id", async () => {
    const { invoiceId } = await seed();

    const result = await anon().execute<{
      payments: { nodes: Array<{ invoice: { rowId: string } | null }> };
    }>(/* GraphQL */ `{ payments { nodes { invoice { rowId } } } }`);
    expect(result.data?.payments.nodes ?? []).toEqual([]);

    const single = await anon().execute<{ invoice: unknown }>(
      /* GraphQL */ `query ($rowId: UUID!) { invoice(rowId: $rowId) { rowId } }`,
      { rowId: invoiceId },
    );
    expect(single.data?.invoice ?? null).toBeNull();
  });

  test("another workspace's member cannot touch the payment or reach the invoice", async () => {
    const { invoiceId, paymentId } = await seed();

    const update = await asB().execute(UPDATE_PAYMENT, {
      input: { rowId: paymentId, patch: { amount: "1.00" } },
    });
    expect(update.errors).toBeDefined();
    expect(await paymentAmount(paymentId)).toBe("40.00");

    const attach = await createPayment(asB(), invoiceId);
    expect(attach.errors).toBeDefined();

    const reads = await asB().execute<{
      payments: { nodes: unknown[] };
    }>(/* GraphQL */ `{ payments { nodes { rowId } } }`);
    expect(reads.data?.payments.nodes).toEqual([]);
  });

  test("a member cannot create rows in, or move rows into, another workspace", async () => {
    await seed();

    const foreign = await createInvoice(asB(), ORG_A, "INV-B-INTO-A");
    expect(foreign.errors).toBeDefined();

    const own = await createInvoice(asB(), ORG_B, "INV-B-1");
    expect(own.errors).toBeUndefined();
    const ownId = own.data?.createInvoice.invoice.rowId as string;

    const move = await asB().execute(
      /* GraphQL */ `
        mutation ($input: UpdateInvoiceInput!) {
          updateInvoice(input: $input) { invoice { rowId } }
        }
      `,
      { input: { rowId: ownId, patch: { organizationId: ORG_A } } },
    );
    expect(move.errors).toBeDefined();
  });

  test("the owning workspace reads and writes its own rows", async () => {
    const { paymentId } = await seed();

    const reads = await asA().execute<{
      payments: { nodes: Array<{ invoice: { rowId: string } | null }> };
    }>(/* GraphQL */ `{ payments { nodes { invoice { rowId } } } }`);
    expect(reads.data?.payments.nodes).toHaveLength(1);
    expect(reads.data?.payments.nodes[0]?.invoice).not.toBeNull();

    const update = await asA().execute(UPDATE_PAYMENT, {
      input: { rowId: paymentId, patch: { amount: "45.00" } },
    });
    expect(update.errors).toBeUndefined();
    expect(await paymentAmount(paymentId)).toBe("45.00");
  });

  test("credit and numbering mutations require membership of the workspace", async () => {
    const { invoiceId } = await seed();

    const ISSUE = /* GraphQL */ `
      mutation ($input: IssueCreditInput!) {
        issueCredit(input: $input) { __typename }
      }
    `;
    const issueInput = { input: { organizationId: ORG_A, amount: "500.00" } };

    expect((await anon().execute(ISSUE, issueInput)).errors).toBeDefined();
    expect((await asB().execute(ISSUE, issueInput)).errors).toBeDefined();

    const credits = await ctx.pool.query(
      "select count(*)::int as n from credit_transaction where organization_id = $1",
      [ORG_A],
    );
    expect(credits.rows[0]?.n).toBe(0);

    const apply = await asB().execute(
      /* GraphQL */ `
        mutation ($input: ApplyInvoiceCreditInput!) {
          applyInvoiceCredit(input: $input) { __typename }
        }
      `,
      { input: { invoiceId, amount: "10.00" } },
    );
    expect(apply.errors).toBeDefined();

    const numbering = await asB().execute(
      /* GraphQL */ `
        mutation ($input: GenerateDocumentNumberInput!) {
          generateDocumentNumber(input: $input) { __typename }
        }
      `,
      { input: { organizationId: ORG_A, documentType: "invoice" } },
    );
    expect(numbering.errors).toBeDefined();

    const own = await asA().execute(ISSUE, issueInput);
    expect(own.errors).toBeUndefined();
  });
});
