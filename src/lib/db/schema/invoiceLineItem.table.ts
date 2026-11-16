import {
  index,
  integer,
  numeric,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { generateDefaultId } from "lib/db/util";
import { invoiceTable } from "./invoice.table";
import { productTable } from "./product.table";

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const invoiceLineItemTable = pgTable(
  "invoice_line_item",
  {
    id: generateDefaultId(),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoiceTable.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => productTable.id),
    description: text().notNull(),
    quantity: numeric({ precision: 10, scale: 2 }).notNull(),
    unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
    amount: numeric({ precision: 12, scale: 2 }).notNull(),
    sortOrder: integer("sort_order").default(0),
  },
  (table) => [
    uniqueIndex().on(table.id),
    index("invoice_line_item_invoice_id_idx").on(table.invoiceId),
  ],
);

export type InsertInvoiceLineItem = InferInsertModel<
  typeof invoiceLineItemTable
>;
export type SelectInvoiceLineItem = InferSelectModel<
  typeof invoiceLineItemTable
>;
