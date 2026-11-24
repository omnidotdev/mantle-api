import { EXPORTABLE } from "graphile-export";
import { sideEffectWithPgClient } from "postgraphile/@dataplan/pg";
import { wrapPlans } from "postgraphile/utils";

import type { PgClient, PgExecutor } from "postgraphile/@dataplan/pg";
import type { FieldArgs, Step } from "postgraphile/grafast";

/**
 * Minimal shape of the CRUD mutation payload plan (`object({ result: $mutation })`)
 * and the underlying delete step the deleted row's columns are read from
 */
interface MutationStep {
  get: (attr: string) => Step;
}
interface PayloadStep {
  get: (key: "result") => MutationStep;
}

/** Status a converted quote returns to when its invoice is deleted */
const RELEASED_QUOTE_STATUS = "accepted";

/**
 * The quotes converted into an invoice, read before the delete (the foreign
 * key nulls `converted_invoice_id` as the invoice goes, losing the link)
 */
const readConvertedQuotes = EXPORTABLE(
  () =>
    async (pgClient: PgClient, rawInvoiceId: unknown): Promise<string[]> => {
      if (typeof rawInvoiceId !== "string" || !rawInvoiceId) return [];

      const { rows } = await pgClient.query<{ id: string }>({
        text: "SELECT id FROM quote WHERE converted_invoice_id = $1",
        values: [rawInvoiceId],
      });

      return rows.map((row) => row.id);
    },
  [],
);

/**
 * After the delete: put those quotes back to `accepted`, ready to invoice
 * again. Runs only when the delete returned a row, so a refused or missed
 * delete releases nothing
 */
const releaseQuotes = EXPORTABLE(
  (RELEASED_QUOTE_STATUS) =>
    async (
      pgClient: PgClient,
      input: { deletedId: unknown; quoteIds: unknown },
    ): Promise<void> => {
      const { deletedId, quoteIds } = input;
      if (typeof deletedId !== "string" || !Array.isArray(quoteIds)) return;
      if (quoteIds.length === 0) return;

      await pgClient.query({
        text: `UPDATE quote
                  SET status = $2, converted_invoice_id = NULL, updated_at = now()
                WHERE id = ANY($1::uuid[])
                  AND status = 'converted'`,
        values: [quoteIds, RELEASED_QUOTE_STATUS],
      });
    },
  [RELEASED_QUOTE_STATUS],
);

/**
 * Deleting an invoice made from a quote releases that quote: the foreign key
 * unlinks it (ON DELETE SET NULL) and this flips it from `converted` back to
 * `accepted`, in the delete's own transaction, so the quote can be invoiced
 * again and never shows as converted into an invoice that no longer exists
 */
const ReleaseConvertedQuotePlugin = wrapPlans((build) => {
  const pgExecutor = build.pgExecutor as PgExecutor;

  return {
    Mutation: {
      deleteInvoice: (plan, _$source, fieldArgs: FieldArgs) => {
        // Sequenced before the delete: a side effect created ahead of plan()
        const $quoteIds = sideEffectWithPgClient(
          pgExecutor,
          fieldArgs.getRaw(["input", "rowId"]),
          readConvertedQuotes,
        );

        const $payload = plan();
        const $mutation = ($payload as unknown as PayloadStep).get("result");

        sideEffectWithPgClient(
          pgExecutor,
          { deletedId: $mutation.get("id"), quoteIds: $quoteIds },
          releaseQuotes,
        );

        return $payload;
      },
    },
  };
});

export default ReleaseConvertedQuotePlugin;
