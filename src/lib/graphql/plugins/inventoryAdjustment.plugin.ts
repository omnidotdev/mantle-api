import { EXPORTABLE } from "graphile-export";
import { sideEffectWithPgClient } from "postgraphile/@dataplan/pg";
import { wrapPlans } from "postgraphile/utils";

import type { PgClient, PgExecutor } from "postgraphile/@dataplan/pg";
import type { Step } from "postgraphile/grafast";
import type { PlanWrapperFn } from "postgraphile/utils";

/**
 * Minimal shape of the CRUD mutation payload plan (`object({ result: $mutation })`)
 * and the underlying insert/delete step the row's columns are read from
 */
interface MutationStep {
  resource: { executor: PgExecutor };
  get: (attr: string) => Step;
}
interface PayloadStep {
  get: (key: "result") => MutationStep;
}

/**
 * Apply a stock movement to its product, in the adjustment's own transaction,
 * so the history row and the product's on-hand quantity never disagree
 */
const applyStockChange = EXPORTABLE(
  () =>
    (direction: 1 | -1) =>
    async (
      pgClient: PgClient,
      input: { productId: unknown; quantityChange: unknown },
    ): Promise<void> => {
      const productId =
        typeof input.productId === "string" ? input.productId : null;
      const change = Number(input.quantityChange);
      if (!productId || !Number.isFinite(change) || change === 0) return;

      await pgClient.query({
        text: `UPDATE product
                  SET current_quantity = coalesce(current_quantity, 0) + $2,
                      updated_at = now()
                WHERE id = $1`,
        values: [productId, direction * change],
      });
    },
  [],
);

const onStockMutation = (direction: 1 | -1): PlanWrapperFn =>
  EXPORTABLE(
    (sideEffectWithPgClient, applyStockChange, direction): PlanWrapperFn =>
      (plan) => {
        const $payload = plan();
        if (!$payload) return $payload;
        const $mutation = ($payload as unknown as PayloadStep).get("result");

        sideEffectWithPgClient(
          $mutation.resource.executor,
          {
            productId: $mutation.get("product_id"),
            quantityChange: $mutation.get("quantity_change"),
          },
          applyStockChange(direction),
        );

        return $payload;
      },
    [sideEffectWithPgClient, applyStockChange, direction],
  );

/**
 * Keep `product.current_quantity` in step with the inventory adjustment log:
 * recording an adjustment moves the product's stock by its quantity change,
 * and deleting one reverses it. An adjustment's product and quantity cannot be
 * edited after the fact (hideInternalData), so the two stay consistent
 */
const InventoryAdjustmentPlugin = wrapPlans({
  Mutation: {
    createInventoryAdjustment: onStockMutation(1),
    deleteInventoryAdjustment: onStockMutation(-1),
  },
});

export default InventoryAdjustmentPlugin;
