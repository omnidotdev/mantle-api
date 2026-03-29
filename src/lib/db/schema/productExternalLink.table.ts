import {
	index,
	jsonb,
	pgTable,
	text,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";

import { generateDefaultDate, generateDefaultId } from "lib/db/util";
import { productTable } from "./product.table";

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const productExternalLinkTable = pgTable(
	"product_external_link",
	{
		id: generateDefaultId(),
		productId: uuid("product_id")
			.notNull()
			.references(() => productTable.id, { onDelete: "cascade" }),
		provider: text().notNull(),
		externalId: text("external_id").notNull(),
		metadata: jsonb().$type<Record<string, unknown>>().default({}),
		createdAt: generateDefaultDate(),
		updatedAt: generateDefaultDate(),
	},
	(table) => [
		uniqueIndex().on(table.id),
		uniqueIndex("product_external_link_product_id_provider_idx").on(
			table.productId,
			table.provider,
		),
		uniqueIndex("product_external_link_provider_external_id_idx").on(
			table.provider,
			table.externalId,
		),
		index("product_external_link_product_id_idx").on(table.productId),
	],
);

export type InsertProductExternalLink = InferInsertModel<
	typeof productExternalLinkTable
>;
export type SelectProductExternalLink = InferSelectModel<
	typeof productExternalLinkTable
>;
