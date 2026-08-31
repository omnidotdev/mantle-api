import {
  date,
  index,
  numeric,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { generateDefaultId } from "lib/db/util";
import { invoiceTable } from "./invoice.table";

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const paymentTable = pgTable(
  "payment",
  {
    id: generateDefaultId(),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoiceTable.id, { onDelete: "cascade" }),
    amount: numeric({ precision: 12, scale: 2 }).notNull(),
    paidAt: date("paid_at").notNull(),
    reference: text(),
    method: text(),
  },
  (table) => [
    uniqueIndex().on(table.id),
    index("payment_invoice_id_idx").on(table.invoiceId),
  ],
);

export type InsertPayment = InferInsertModel<typeof paymentTable>;
export type SelectPayment = InferSelectModel<typeof paymentTable>;
