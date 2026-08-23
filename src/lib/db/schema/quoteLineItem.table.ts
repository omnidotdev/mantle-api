import {
  index,
  integer,
  numeric,
  pgTable,
  text,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { generateDefaultId } from "lib/db/util";
import { productTable } from "./product.table";
import { quoteTable } from "./quote.table";

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const pricingTypes = [
  "fixed",
  "hourly",
  "royalty",
  "complimentary",
  "included",
] as const;

export type PricingType = (typeof pricingTypes)[number];

export const quoteLineItemTable = pgTable(
  "quote_line_item",
  {
    id: generateDefaultId(),
    quoteId: uuid("quote_id")
      .notNull()
      .references(() => quoteTable.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => productTable.id),
    description: text().notNull(),
    subtitle: text(),
    quantity: numeric({ precision: 10, scale: 2 }).notNull(),
    unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
    amount: numeric({ precision: 12, scale: 2 }).notNull(),
    pricingType: varchar("pricing_type", { length: 20 })
      .$type<PricingType>()
      .default("fixed")
      .notNull(),
    estimatedHours: numeric("estimated_hours", { precision: 10, scale: 2 }),
    hourlyRate: numeric("hourly_rate", { precision: 12, scale: 2 }),
    weeklyCapHours: integer("weekly_cap_hours"),
    monthlyCapHours: integer("monthly_cap_hours"),
    maxCapHours: integer("max_cap_hours"),
    minimumBillingMinutes: integer("minimum_billing_minutes"),
    royaltyPercentage: numeric("royalty_percentage", {
      precision: 5,
      scale: 2,
    }),
    royaltyTimeframe: integer("royalty_timeframe"),
    royaltyTimeframeUnit: varchar("royalty_timeframe_unit", { length: 20 }),
    royaltyThreshold: numeric("royalty_threshold", {
      precision: 12,
      scale: 2,
    }),
    royaltyBuyoutAmount: numeric("royalty_buyout_amount", {
      precision: 12,
      scale: 2,
    }),
    sortOrder: integer("sort_order").default(0),
    deliverables: text().array(),
    acceptanceCriteria: text("acceptance_criteria").array(),
  },
  (table) => [
    uniqueIndex().on(table.id),
    index("quote_line_item_quote_id_idx").on(table.quoteId),
    index("quote_line_item_sort_order_idx").on(table.sortOrder),
  ],
);

export type InsertQuoteLineItem = InferInsertModel<typeof quoteLineItemTable>;
export type SelectQuoteLineItem = InferSelectModel<typeof quoteLineItemTable>;
