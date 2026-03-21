import {
	index,
	jsonb,
	pgTable,
	text,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";
import { generateDefaultDate, generateDefaultId } from "lib/db/util";
import { personTable } from "./person.table";

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const personExternalLinkTable = pgTable(
	"person_external_link",
	{
		id: generateDefaultId(),
		personId: uuid("person_id")
			.notNull()
			.references(() => personTable.id, { onDelete: "cascade" }),
		provider: text().notNull(),
		externalId: text("external_id").notNull(),
		metadata: jsonb().$type<Record<string, unknown>>().default({}),
		createdAt: generateDefaultDate(),
	},
	(table) => [
		uniqueIndex().on(table.id),
		uniqueIndex("person_external_link_provider_external_id_idx").on(
			table.provider,
			table.externalId,
		),
		index("person_external_link_person_id_idx").on(table.personId),
	],
);

export type InsertPersonExternalLink = InferInsertModel<
	typeof personExternalLinkTable
>;
export type SelectPersonExternalLink = InferSelectModel<
	typeof personExternalLinkTable
>;
