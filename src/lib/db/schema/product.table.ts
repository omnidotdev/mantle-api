import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { generateDefaultDate, generateDefaultId } from "lib/db/util";
import { supplierTable } from "./supplier.table";

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const productTable = pgTable(
  "product",
  {
    id: generateDefaultId(),
    organizationId: text("organization_id").notNull(),
    name: text().notNull(),
    description: text(),
    sku: text(),
    unitPrice: numeric("unit_price", { precision: 12, scale: 2 }),
    currentQuantity: integer("current_quantity").default(0),
    lowStockThreshold: integer("low_stock_threshold"),
    supplierId: uuid("supplier_id").references(() => supplierTable.id, {
      onDelete: "set null",
    }),
    fulfillmentType: text("fulfillment_type").default("stocked"),
    supplierSku: text("supplier_sku"),
    upc: text(),
    costPrice: numeric("cost_price", { precision: 12, scale: 2 }),
    retailPrice: numeric("retail_price", { precision: 12, scale: 2 }),
    weight: numeric({ precision: 8, scale: 2 }),
    category1: text(),
    category2: text(),
    imageUrl: text("image_url"),
    imageUrl2: text("image_url_2"),
    imageUrl3: text("image_url_3"),
    isRestricted: boolean("is_restricted").default(false),
    isActive: boolean("is_active").default(true),
    channels: text().array().default([]),
    createdAt: generateDefaultDate(),
    updatedAt: generateDefaultDate(),
  },
  (table) => [
    uniqueIndex().on(table.id),
    index("product_organization_id_idx").on(table.organizationId),
    uniqueIndex("product_organization_id_sku_idx").on(
      table.organizationId,
      table.sku,
    ),
  ],
);

export type InsertProduct = InferInsertModel<typeof productTable>;
export type SelectProduct = InferSelectModel<typeof productTable>;
