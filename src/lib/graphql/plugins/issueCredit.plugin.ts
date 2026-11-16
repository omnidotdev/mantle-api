import { EXPORTABLE } from "graphile-export";
import { gql, makeExtendSchemaPlugin } from "graphile-utils";

/**
 * Credit kinds a user may issue by hand. The other `credit_transaction` kinds
 * (`overpayment`, `application`, `void`) are system-managed (produced by the
 * overpayment and apply-credit flows), so they are rejected here.
 */
const ISSUABLE_CREDIT_KINDS = ["creditNote", "adjustment"] as const;

const toCents = EXPORTABLE(
  () =>
    (value: string | number | null | undefined): number | null => {
      if (value === null || value === undefined) return null;
      const n = typeof value === "number" ? value : Number.parseFloat(value);
      if (!Number.isFinite(n)) return null;
      return Math.round(n * 100);
    },
  [],
);

const fromCents = EXPORTABLE(
  () =>
    (cents: number): string =>
      (cents / 100).toFixed(2),
  [],
);

/**
 * Issue workspace credit by hand (a credit note or an adjustment), creating a
 * positive `credit_transaction` entry that adds to the workspace's available
 * balance (sum of entries for the currency). This is the manual counterpart to
 * the automatic overpayment credit; the resulting balance is drawn down against
 * invoices by `applyInvoiceCredit`.
 *
 * Emits `mantle.credit.issued` after commit so MyFi can book it; the debit/credit
 * account direction lives in MyFi's per-book mapping.
 */
const IssueCreditPlugin = makeExtendSchemaPlugin({
  typeDefs: gql`
		input IssueCreditInput {
			organizationId: String!
			amount: String!
			currency: String
			kind: String
			invoiceId: UUID
			note: String
		}

		type IssueCreditPayload {
			creditTransactionId: UUID!
			amountIssued: String!
			balance: String!
		}

		extend type Mutation {
			issueCredit(input: IssueCreditInput!): IssueCreditPayload
		}
	`,
  resolvers: {
    Mutation: {
      issueCredit: EXPORTABLE(
        (toCents, fromCents, ISSUABLE_CREDIT_KINDS) =>
          async (
            _parent: unknown,
            args: {
              input: {
                organizationId: string;
                amount: string;
                currency?: string;
                kind?: string;
                invoiceId?: string;
                note?: string;
              };
            },
            context: { observer?: unknown; organizationIds?: string[] },
          ) => {
            const { sql } = await import("drizzle-orm");
            const { dbPool } = await import("lib/db/db");
            const { assertWorkspaceAccess } = await import(
              "lib/graphql/workspaceAccess"
            );

            const { organizationId, amount, invoiceId, note } = args.input;

            // Issuing credit is a write to the workspace's balance: the caller
            // must belong to it, and a linked invoice must be the same
            // workspace's
            assertWorkspaceAccess(context, organizationId);
            if (invoiceId) {
              const linked = await dbPool.execute(
                sql`SELECT organization_id FROM invoice WHERE id = ${invoiceId}::uuid`,
              );
              if (linked.rows[0]?.organization_id !== organizationId) {
                assertWorkspaceAccess(context, null);
              }
            }
            const currency = args.input.currency ?? "USD";
            const kind = args.input.kind ?? "creditNote";

            const issuedCents = toCents(amount);
            if (issuedCents === null || issuedCents <= 0) {
              throw new Error("Credit amount must be a positive value");
            }
            if (!(ISSUABLE_CREDIT_KINDS as readonly string[]).includes(kind)) {
              throw new Error(
                "Credit kind must be a credit note or adjustment",
              );
            }

            const outcome = await dbPool.transaction(async (tx) => {
              const insertResult = await tx.execute(
                sql`INSERT INTO credit_transaction
                      (organization_id, currency, amount, kind, invoice_id, note)
                    VALUES (${organizationId}, ${currency}, ${fromCents(issuedCents)}, ${kind}, ${invoiceId ?? null}, ${note ?? null})
                    RETURNING id`,
              );
              const creditTransactionId = (
                insertResult.rows[0] as { id: string }
              ).id;

              const balanceResult = await tx.execute(
                sql`SELECT coalesce(sum(amount), 0) AS balance
                      FROM credit_transaction
                     WHERE organization_id = ${organizationId}
                       AND currency = ${currency}`,
              );
              const balanceCents =
                toCents(
                  (balanceResult.rows[0] as { balance: string }).balance,
                ) ?? 0;

              return { creditTransactionId, balanceCents };
            });

            // Emit after commit; errors swallowed so telemetry never fails the
            // mutation
            const { events } = await import("lib/providers");
            void events
              .emit({
                type: "mantle.credit.issued",
                data: {
                  id: outcome.creditTransactionId,
                  organizationId,
                  currency,
                  invoiceId: invoiceId ?? null,
                  amount: fromCents(issuedCents),
                  kind,
                },
                subject: outcome.creditTransactionId,
              })
              .catch(() => {});

            return {
              creditTransactionId: outcome.creditTransactionId,
              amountIssued: fromCents(issuedCents),
              balance: fromCents(outcome.balanceCents),
            };
          },
        [toCents, fromCents, ISSUABLE_CREDIT_KINDS],
      ),
    },
  },
});

export default IssueCreditPlugin;
