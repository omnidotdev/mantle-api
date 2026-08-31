import { EXPORTABLE } from "graphile-export";
import { sideEffectWithPgClient } from "postgraphile/@dataplan/pg";
import { wrapPlans } from "postgraphile/utils";

import type { PgClient, PgExecutor } from "postgraphile/@dataplan/pg";
import type { FieldArgs, Step } from "postgraphile/grafast";
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
 * Invoice statuses whose totals are still owner-editable and therefore safe to
 * recompute. Mirrors `invoiceStatuses` in the schema minus the settled states
 * (`paid`, `void`), whose totals are frozen: a paid invoice's recorded total is
 * what the customer was charged and a void invoice is closed, so a later
 * line-item edit must never silently rewrite either (that would diverge the
 * document from the money that actually moved, with nothing reconciling paidAt).
 */
const EDITABLE_INVOICE_STATUSES = [
  "draft",
  "sent",
  "viewed",
  "overdue",
] as const;

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
 * Guarantees:
 * - Only editable-status invoices are touched; paid/void totals are frozen.
 * - The invoice row is locked (`SELECT ... FOR NO KEY UPDATE`) before the line
 *   sum is read, so concurrent line writers serialize instead of each committing
 *   a total that omits the other's just-inserted line (READ COMMITTED otherwise
 *   lets each transaction sum without seeing the sibling's uncommitted row).
 *   `FOR NO KEY UPDATE` (not `FOR UPDATE`) is used deliberately: inserting a line
 *   takes a `FOR KEY SHARE` lock on the parent invoice via the FK, and two
 *   concurrent recomputes each upgrading to `FOR UPDATE` would deadlock, whereas
 *   `FOR NO KEY UPDATE` does not conflict with `FOR KEY SHARE` yet still
 *   serializes against another recompute of the same invoice.
 * - `force` controls the empty-invoice case. Normally an invoice with no line
 *   items is left untouched (its totals may be entered directly as a manual
 *   invoice). When a line is deleted from or moved off an invoice we KNOW it was
 *   line-driven, so `force` recomputes it even down to zero rather than leaving
 *   a stale (overstated) total behind.
 *
 * NOTE: this runs as a post-mutation side effect, so the mutation's own payload
 * still reflects the pre-recompute values. Clients must refetch the invoice (or
 * read it back) to observe the recomputed totals.
 */
const recomputeInvoiceTotals = EXPORTABLE(
  (EDITABLE_INVOICE_STATUSES) =>
    async (
      pgClient: PgClient,
      rawInvoiceId: unknown,
      force = false,
    ): Promise<void> => {
      const invoiceId =
        typeof rawInvoiceId === "string" && rawInvoiceId.length > 0
          ? rawInvoiceId
          : null;
      if (!invoiceId) return;

      // Lock the invoice row before summing so parallel line writes on the same
      // invoice serialize; the lock is held until the mutation transaction
      // commits, forcing a concurrent writer to re-sum after this one lands
      const locked = await pgClient.query<{ status: string }>({
        text: `SELECT status FROM invoice WHERE id = $1 FOR NO KEY UPDATE`,
        values: [invoiceId],
      });
      const status = locked.rows[0]?.status;

      // Freeze settled documents: never rewrite the totals of a paid or void
      // invoice (only editable statuses derive from their line items)
      if (
        !status ||
        !(EDITABLE_INVOICE_STATUSES as readonly string[]).includes(status)
      ) {
        return;
      }

      // Normalize each line's stored amount to quantity * unitPrice so a
      // divergent client-supplied amount cannot persist
      await pgClient.query({
        text: `UPDATE invoice_line_item
                  SET amount = round(quantity * unit_price, 2)
                WHERE invoice_id = $1
                  AND amount IS DISTINCT FROM round(quantity * unit_price, 2)`,
        values: [invoiceId],
      });

      // Recompute the invoice totals from its line items. Without `force`, an
      // invoice that has no lines keeps its entered totals (manual invoice);
      // with `force` it is recomputed regardless (down to zero) because we know
      // a line was just removed from it
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
                  AND ($2
                       OR exists (SELECT 1 FROM invoice_line_item WHERE invoice_id = $1))`,
        values: [invoiceId, force],
      });
    },
  [EDITABLE_INVOICE_STATUSES],
);

/**
 * Read the invoice a line item currently belongs to. Used to capture a line's
 * ORIGIN invoice before an update mutation runs, so a reparent can recompute
 * the invoice the line leaves behind.
 */
const readLineItemInvoiceId = EXPORTABLE(
  () =>
    async (pgClient: PgClient, rawLineId: unknown): Promise<string | null> => {
      const lineId =
        typeof rawLineId === "string" && rawLineId.length > 0
          ? rawLineId
          : null;
      if (!lineId) return null;
      const { rows } = await pgClient.query<{ invoice_id: string }>({
        text: `SELECT invoice_id FROM invoice_line_item WHERE id = $1`,
        values: [lineId],
      });
      return rows[0]?.invoice_id ?? null;
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
 * Plan wrapper for `updateInvoiceLineItem`, which additionally handles a
 * reparent: `invoiceId` is part of `InvoiceLineItemPatch`, so an update can move
 * a line to a different invoice. Recomputing only the destination (as the
 * generic wrapper would) leaves the ORIGIN permanently overstated. This captures
 * the line's current invoice BEFORE the update (a side effect created ahead of
 * `plan()`, so it is sequenced first within the transaction) and, afterwards,
 * recomputes both the destination and, when it changed, the origin.
 */
const recomputeLineItemUpdate =
  (pgExecutor: PgExecutor): PlanWrapperFn =>
  (plan, _$source, fieldArgs: FieldArgs) => {
    // Capture the origin invoice before the update rewrites the line's
    // invoice_id (sequenced before the update via a pre-plan side effect)
    const $lineId = fieldArgs.getRaw(["input", "rowId"]);
    const $originInvoiceId = sideEffectWithPgClient(
      pgExecutor,
      $lineId,
      readLineItemInvoiceId,
    );

    const $payload = plan();
    const $mutation = ($payload as unknown as PayloadStep).get("result");
    const $destinationInvoiceId = $mutation.get("invoice_id");

    sideEffectWithPgClient(
      pgExecutor,
      {
        origin: $originInvoiceId,
        destination: $destinationInvoiceId,
      },
      async (pgClient, { origin, destination }) => {
        // Destination keeps the manual-invoice guard (it may legitimately be
        // empty); it now holds the moved line, so this reflects reality
        await recomputeInvoiceTotals(pgClient, destination);

        // On a reparent, force-recompute the origin so it reflects its
        // remaining lines even if the move emptied it
        const originId =
          typeof origin === "string" && origin.length > 0 ? origin : null;
        const destinationId =
          typeof destination === "string" && destination.length > 0
            ? destination
            : null;
        if (originId && originId !== destinationId) {
          await recomputeInvoiceTotals(pgClient, originId, true);
        }
      },
    );

    return $payload;
  };

/**
 * Recompute invoice totals server-side whenever an invoice or one of its line
 * items is created, updated, or deleted.
 */
const RecomputeInvoiceTotalsPlugin = wrapPlans((build) => {
  const pgExecutor = build.pgExecutor as PgExecutor;
  return {
    Mutation: {
      updateInvoice: recomputeAfter("id"),
      createInvoiceLineItem: recomputeAfter("invoice_id"),
      updateInvoiceLineItem: recomputeLineItemUpdate(pgExecutor),
      deleteInvoiceLineItem: recomputeAfter("invoice_id"),
    },
  };
});

export default RecomputeInvoiceTotalsPlugin;
