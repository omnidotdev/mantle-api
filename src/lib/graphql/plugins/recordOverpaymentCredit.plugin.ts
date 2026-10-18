import { EXPORTABLE } from "graphile-export";
import { sideEffectWithPgClient } from "postgraphile/@dataplan/pg";
import { wrapPlans } from "postgraphile/utils";

import type { PgClient, PgExecutor } from "postgraphile/@dataplan/pg";
import type { Step } from "postgraphile/grafast";
import type { PlanWrapperFn } from "postgraphile/utils";

/**
 * Minimal shape of the CRUD mutation payload plan (`object({ result: $mutation })`)
 * and the underlying insert step we read the written row's columns from.
 */
interface MutationStep {
  resource: { executor: PgExecutor };
  get: (attr: string) => Step;
}
interface PayloadStep {
  get: (key: "result") => MutationStep;
}

/**
 * After a payment is recorded, convert any excess of total payments over the
 * invoice total into workspace credit, in the same transaction as the payment.
 *
 * A customer who pays more than they owe (a single overpayment, or cumulative
 * payments that cross the total) should not need a manual refund dance: the
 * excess becomes credit on their workspace, usable against future invoices.
 *
 * The invoice row is locked (`SELECT ... FOR NO KEY UPDATE`) before the payment
 * sum is read so concurrent payments on the same invoice serialize instead of
 * each computing an overpayment that omits the other's just-inserted row.
 * `FOR NO KEY UPDATE` (not `FOR UPDATE`) matches the invoice-total recompute: a
 * payment insert takes `FOR KEY SHARE` on the parent invoice via its FK, and two
 * concurrent `FOR UPDATE` upgrades would deadlock.
 *
 * Idempotent across multiple payments: the new credit is the current overpaid
 * amount minus overpayment credit already recorded for the invoice, so a second
 * payment that pushes the invoice further past its total only ever adds the new
 * delta, never re-credits the earlier excess.
 */
const recordOverpaymentCredit = EXPORTABLE(
  () =>
    async (
      pgClient: PgClient,
      input: { invoiceId: unknown; paymentId: unknown },
    ): Promise<void> => {
      const invoiceId =
        typeof input.invoiceId === "string" && input.invoiceId.length > 0
          ? input.invoiceId
          : null;
      if (!invoiceId) return;

      const paymentId =
        typeof input.paymentId === "string" && input.paymentId.length > 0
          ? input.paymentId
          : null;

      // Lock the invoice so parallel payments on it serialize; the lock holds
      // until the payment transaction commits, forcing a concurrent writer to
      // recompute the overpaid amount after this one lands
      const invoice = await pgClient.query<{
        total: string | null;
        currency: string | null;
        organization_id: string;
      }>({
        text: `SELECT total, currency, organization_id
				          FROM invoice
				         WHERE id = $1
				         FOR NO KEY UPDATE`,
        values: [invoiceId],
      });
      const row = invoice.rows[0];
      if (!row) return;

      // Record only the NEW overpaid delta: current (sum(payments) - total),
      // floored at zero, minus overpayment credit already recorded for this
      // invoice. Inserted only when positive, so an exact or under payment, and
      // a re-run over the same state, add nothing
      await pgClient.query({
        text: `INSERT INTO credit_transaction
				         (organization_id, currency, amount, kind, invoice_id, payment_id)
				       SELECT $2, $3, c.new_credit, 'overpayment', $1, $4
				         FROM (
				                SELECT round(
				                         greatest(
				                           (SELECT coalesce(sum(amount), 0) FROM payment WHERE invoice_id = $1)
				                             - coalesce($5::numeric, 0),
				                           0
				                         )
				                         - (SELECT coalesce(sum(amount), 0)
				                              FROM credit_transaction
				                             WHERE invoice_id = $1 AND kind = 'overpayment'),
				                         2
				                       ) AS new_credit
				              ) c
				        WHERE c.new_credit > 0`,
        values: [
          invoiceId,
          row.organization_id,
          row.currency ?? "USD",
          paymentId,
          row.total,
        ],
      });
    },
  [],
);

/**
 * Record workspace credit for any overpayment whenever a payment is created.
 */
const RecordOverpaymentCreditPlugin = wrapPlans({
  Mutation: {
    createPayment: EXPORTABLE(
      (sideEffectWithPgClient, recordOverpaymentCredit): PlanWrapperFn =>
        (plan) => {
          const $payload = plan();
          const $mutation = ($payload as unknown as PayloadStep).get("result");

          // Run in the payment's own transaction (its pg client) so the sum of
          // payments sees the just-inserted row
          sideEffectWithPgClient(
            $mutation.resource.executor,
            {
              invoiceId: $mutation.get("invoice_id"),
              paymentId: $mutation.get("id"),
            },
            recordOverpaymentCredit,
          );

          return $payload;
        },
      [sideEffectWithPgClient, recordOverpaymentCredit],
    ),
  },
});

export default RecordOverpaymentCreditPlugin;
