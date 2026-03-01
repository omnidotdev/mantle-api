import { index, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { generateDefaultDate, generateDefaultId } from "lib/db/util";

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const companyTable = pgTable(
	"company",
	{
		id: generateDefaultId(),
		organizationId: text("organization_id").notNull(),
		name: text().notNull(),
		website: text(),
		industry: text(),
		phone: text(),
		email: text(),
		addressLine1: text("address_line_1"),
		addressLine2: text("address_line_2"),
		city: text(),
		state: text(),
		postalCode: text("postal_code"),
		country: text(),
		notes: text(),
		createdAt: generateDefaultDate(),
		updatedAt: generateDefaultDate(),
	},
	(table) => [
		uniqueIndex().on(table.id),
		index("company_organization_id_idx").on(table.organizationId),
	],
);

export type InsertCompany = InferInsertModel<typeof companyTable>;
export type SelectCompany = InferSelectModel<typeof companyTable>;
