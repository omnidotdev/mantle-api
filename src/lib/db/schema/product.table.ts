import {
	boolean,
	index,
	integer,
	numeric,
	pgTable,
	text,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { generateDefaultDate, generateDefaultId } from "lib/db/util";

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
		isActive: boolean("is_active").default(true),
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
