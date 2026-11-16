import {
  index,
  integer,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { generateDefaultDate, generateDefaultId } from "lib/db/util";
import { productTable } from "./product.table";

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const inventoryAdjustmentTable = pgTable(
  "inventory_adjustment",
  {
    id: generateDefaultId(),
    productId: uuid("product_id")
      .notNull()
      .references(() => productTable.id, { onDelete: "cascade" }),
    quantityChange: integer("quantity_change").notNull(),
    reason: text().notNull(),
    referenceId: uuid("reference_id"),
    createdAt: generateDefaultDate(),
  },
  (table) => [
    uniqueIndex().on(table.id),
    index("inventory_adjustment_product_id_idx").on(table.productId),
  ],
);

export type InsertInventoryAdjustment = InferInsertModel<
  typeof inventoryAdjustmentTable
>;
export type SelectInventoryAdjustment = InferSelectModel<
  typeof inventoryAdjustmentTable
>;
