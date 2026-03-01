import { index, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { generateDefaultDate, generateDefaultId } from "lib/db/util";

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const personTable = pgTable(
	"person",
	{
		id: generateDefaultId(),
		organizationId: text("organization_id").notNull(),
		firstName: text("first_name").notNull(),
		lastName: text("last_name").notNull(),
		email: text(),
		phone: text(),
		avatarUrl: text("avatar_url"),
		tags: text().array(),
		notes: text(),
		createdAt: generateDefaultDate(),
		updatedAt: generateDefaultDate(),
	},
	(table) => [
		uniqueIndex().on(table.id),
		index("person_organization_id_idx").on(table.organizationId),
		index("person_email_idx").on(table.email),
	],
);

export type InsertPerson = InferInsertModel<typeof personTable>;
export type SelectPerson = InferSelectModel<typeof personTable>;
