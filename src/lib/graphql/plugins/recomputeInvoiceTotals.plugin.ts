import { EXPORTABLE } from "graphile-export";
import { sideEffectWithPgClient } from "postgraphile/@dataplan/pg";
import { wrapPlans } from "postgraphile/utils";

import type { PgClient, PgExecutor } from "postgraphile/@dataplan/pg";
import type { Step } from "postgraphile/grafast";
import type { PlanWrapperFn } from "postgraphile/utils";

/**
 * Minimal shape of the CRUD mutation payload plan (`object({ result: $mutation })`)
 * and the underlying insert/update/delete step we read from it.
 */
interface MutationStep {
  resource: { executor: PgExecutor };
  get: (attr: string) => Step;
}
interface PayloadStep {
  get: (key: "result") => MutationStep;
}

/**
 * Recompute an invoice's monetary columns from its line items, in the same
 * transaction as the triggering mutation.
 *
 * Invoice `subtotal`, `taxAmount`, and `total` (and each line item `amount`)
 * are otherwise plain client-supplied columns written through Postgraphile
 * auto-CRUD, so a client could persist a document whose totals disagree with
 * its line items. This derives them server-side from the source of truth
 * (quantity * unitPrice per line) so client-supplied values cannot diverge.
 *
 * Domain formula (mirrors renderInvoiceHtml and the schema):
 *   line.amount = quantity * unitPrice
 *   subtotal    = sum(line.amount)
 *   taxAmount   = subtotal * taxRate / 100
 *   total       = subtotal + taxAmount
 *
 * Invoices with no line items are left untouched (their totals may be entered
 * directly as a manual/simple invoice), so this only ever corrects a document
 * that actually has lines to derive from.
 */
const recomputeInvoiceTotals = EXPORTABLE(
  () =>
    async (pgClient: PgClient, rawInvoiceId: unknown): Promise<void> => {
      const invoiceId =
        typeof rawInvoiceId === "string" && rawInvoiceId.length > 0
          ? rawInvoiceId
          : null;
      if (!invoiceId) return;

      // Normalize each line's stored amount to quantity * unitPrice so a
      // divergent client-supplied amount cannot persist
      await pgClient.query({
        text: `UPDATE invoice_line_item
                  SET amount = round(quantity * unit_price, 2)
                WHERE invoice_id = $1
                  AND amount IS DISTINCT FROM round(quantity * unit_price, 2)`,
        values: [invoiceId],
      });

      // Recompute the invoice totals from its line items, but only when the
      // invoice actually has lines (an invoice with none keeps its entered totals)
      await pgClient.query({
        text: `UPDATE invoice i
                  SET subtotal   = agg.s,
                      tax_amount = round(agg.s * coalesce(i.tax_rate, 0) / 100, 2),
                      total      = agg.s + round(agg.s * coalesce(i.tax_rate, 0) / 100, 2),
                      updated_at = now()
                 FROM (
                        SELECT coalesce(sum(round(quantity * unit_price, 2)), 0) AS s
                          FROM invoice_line_item
                         WHERE invoice_id = $1
                      ) agg
                WHERE i.id = $1
                  AND exists (SELECT 1 FROM invoice_line_item WHERE invoice_id = $1)`,
        values: [invoiceId],
      });
    },
  [],
);

/**
 * Build a plan wrapper that, after the wrapped mutation runs, recomputes the
 * affected invoice's totals in the same transaction.
 *
 * `idAttr` is the column on the mutated row that identifies the invoice:
 * `"id"` for invoice mutations, `"invoice_id"` for line-item mutations. The
 * value is pulled via RETURNING, so it is available even for update/delete
 * where the input carries only the row id.
 */
const recomputeAfter = (idAttr: "id" | "invoice_id"): PlanWrapperFn =>
  EXPORTABLE(
    (sideEffectWithPgClient, recomputeInvoiceTotals, idAttr): PlanWrapperFn =>
      (plan) => {
        const $payload = plan();
        // The CRUD payload plan is `object({ result: $mutation })`
        const $mutation = ($payload as unknown as PayloadStep).get("result");

        // Recompute after the mutation (the invoice id is read via RETURNING)
        // using its own pg client, so the update shares the mutation transaction
        // and sees the just-written row
        sideEffectWithPgClient(
          $mutation.resource.executor,
          $mutation.get(idAttr),
          recomputeInvoiceTotals,
        );

        return $payload;
      },
    [sideEffectWithPgClient, recomputeInvoiceTotals, idAttr],
  );

/**
 * Recompute invoice totals server-side whenever an invoice or one of its line
 * items is created, updated, or deleted.
 */
const RecomputeInvoiceTotalsPlugin = wrapPlans({
  Mutation: {
    updateInvoice: recomputeAfter("id"),
    createInvoiceLineItem: recomputeAfter("invoice_id"),
    updateInvoiceLineItem: recomputeAfter("invoice_id"),
    deleteInvoiceLineItem: recomputeAfter("invoice_id"),
  },
});

export default RecomputeInvoiceTotalsPlugin;
