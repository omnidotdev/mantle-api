import { EXPORTABLE } from "graphile-export";
import { gql, makeExtendSchemaPlugin } from "graphile-utils";

/**
 * Parse a money string (numeric(12,2)) to integer cents, or null when it is not
 * a finite number. Working in cents keeps the comparisons exact instead of
 * leaning on binary floating point for currency.
 */
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

/**
 * Format integer cents back to a 2-decimal money string.
 */
const fromCents = EXPORTABLE(
  () =>
    (cents: number): string =>
      (cents / 100).toFixed(2),
  [],
);

/**
 * Apply a workspace's available credit against one of its invoices.
 *
 * Credit is an append-only ledger scoped by `(organizationId, currency)`
 * (see `credit_transaction`). Applying credit records a negative `application`
 * entry tied to the target invoice, which both draws down the workspace balance
 * (sum of entries for the currency) and reduces that invoice's outstanding
 * balance (total - payments - applied credits).
 *
 * Safety:
 * - A transaction-scoped advisory lock keyed on `(organizationId, currency)`
 *   serializes concurrent applications for the same workspace balance, so two
 *   parallel applies can never jointly overspend the available credit.
 * - The invoice row is locked (`FOR NO KEY UPDATE`) so the outstanding balance
 *   is read against a serialized view of the invoice (consistent with the
 *   payment and total-recompute paths).
 * - The amount is validated against both the available credit and the invoice
 *   outstanding before any row is written, so a rejected apply writes nothing.
 */
const ApplyInvoiceCreditPlugin = makeExtendSchemaPlugin({
  typeDefs: gql`
		input ApplyInvoiceCreditInput {
			invoiceId: UUID!
			amount: String!
			note: String
		}

		type ApplyInvoiceCreditPayload {
			creditTransactionId: UUID!
			amountApplied: String!
			remainingCredit: String!
			invoiceOutstanding: String!
		}

		extend type Mutation {
			applyInvoiceCredit(
				input: ApplyInvoiceCreditInput!
			): ApplyInvoiceCreditPayload
		}
	`,
  resolvers: {
    Mutation: {
      applyInvoiceCredit: EXPORTABLE(
        (toCents, fromCents) =>
          async (
            _parent: unknown,
            args: {
              input: { invoiceId: string; amount: string; note?: string };
            },
          ) => {
            const { sql } = await import("drizzle-orm");
            const { dbPool } = await import("lib/db/db");

            const { invoiceId, amount, note } = args.input;

            const appliedCents = toCents(amount);
            if (appliedCents === null || appliedCents <= 0) {
              throw new Error("Credit amount must be a positive value");
            }

            const outcome = await dbPool.transaction(async (tx) => {
              // Resolve the invoice's workspace and currency first so the
              // advisory lock below can serialize spend for this balance
              const invoiceResult = await tx.execute(
                sql`SELECT organization_id, currency FROM invoice WHERE id = ${invoiceId}::uuid`,
              );
              const invoiceMeta = invoiceResult.rows[0] as
                | { organization_id: string; currency: string | null }
                | undefined;
              if (!invoiceMeta) {
                throw new Error("Invoice not found");
              }

              const organizationId = invoiceMeta.organization_id;
              const currency = invoiceMeta.currency ?? "USD";

              // Serialize credit spend for this (workspace, currency): two
              // concurrent applies against the same balance cannot both read the
              // pre-spend available amount and jointly overspend it
              await tx.execute(
                sql`SELECT pg_advisory_xact_lock(hashtext(${`${organizationId}:${currency}`})::bigint)`,
              );

              // Lock the invoice and read its outstanding inputs under that lock
              const lockedResult = await tx.execute(
                sql`SELECT i.total,
                           coalesce((SELECT sum(amount) FROM payment WHERE invoice_id = i.id), 0) AS paid,
                           coalesce((SELECT sum(amount) FROM credit_transaction WHERE invoice_id = i.id AND kind = 'application'), 0) AS applied
                      FROM invoice i
                     WHERE i.id = ${invoiceId}::uuid
                       FOR NO KEY UPDATE OF i`,
              );
              const locked = lockedResult.rows[0] as
                | { total: string | null; paid: string; applied: string }
                | undefined;
              if (!locked) {
                throw new Error("Invoice not found");
              }

              const availableResult = await tx.execute(
                sql`SELECT coalesce(sum(amount), 0) AS available
                      FROM credit_transaction
                     WHERE organization_id = ${organizationId}
                       AND currency = ${currency}`,
              );
              const availableCents =
                toCents(
                  (availableResult.rows[0] as { available: string }).available,
                ) ?? 0;

              // Outstanding = total - payments - applied credits. Applied credit
              // entries are stored negative, so adding them reduces outstanding
              const totalCents = toCents(locked.total) ?? 0;
              const paidCents = toCents(locked.paid) ?? 0;
              const appliedCreditCents = toCents(locked.applied) ?? 0;
              const outstandingCents =
                totalCents - paidCents + appliedCreditCents;

              if (availableCents <= 0) {
                throw new Error("No workspace credit available");
              }
              if (appliedCents > availableCents) {
                throw new Error("Amount exceeds available workspace credit");
              }
              if (appliedCents > outstandingCents) {
                throw new Error("Amount exceeds invoice outstanding balance");
              }

              // Record the draw-down as a negative application entry
              const insertResult = await tx.execute(
                sql`INSERT INTO credit_transaction
                      (organization_id, currency, amount, kind, invoice_id, note)
                    VALUES (${organizationId}, ${currency}, ${fromCents(-appliedCents)}, 'application', ${invoiceId}::uuid, ${note ?? null})
                    RETURNING id`,
              );
              const creditTransactionId = (
                insertResult.rows[0] as { id: string }
              ).id;

              return {
                creditTransactionId,
                organizationId,
                currency,
                amountApplied: fromCents(appliedCents),
                remainingCredit: fromCents(availableCents - appliedCents),
                invoiceOutstanding: fromCents(outstandingCents - appliedCents),
              };
            });

            // Emit after the transaction commits, so a rolled-back apply never
            // publishes a credit event. Emission must never fail the user's
            // mutation, so provider errors are swallowed. The `credit.applied`
            // suffix is the stable cross-product contract (see the invoicing
            // consolidation design); `amount` is the signed ledger value
            const { events } = await import("lib/providers");
            void events
              .emit({
                type: "mantle.credit.applied",
                data: {
                  id: outcome.creditTransactionId,
                  organizationId: outcome.organizationId,
                  currency: outcome.currency,
                  invoiceId,
                  amount: fromCents(-appliedCents),
                  kind: "application",
                },
                subject: outcome.creditTransactionId,
              })
              .catch(() => {});

            return {
              creditTransactionId: outcome.creditTransactionId,
              amountApplied: outcome.amountApplied,
              remainingCredit: outcome.remainingCredit,
              invoiceOutstanding: outcome.invoiceOutstanding,
            };
          },
        [toCents, fromCents],
      ),
    },
  },
});

export default ApplyInvoiceCreditPlugin;
