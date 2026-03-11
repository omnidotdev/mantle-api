import {
	integer,
	pgTable,
	text,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core";
import { generateDefaultDate, generateDefaultId } from "lib/db/util";

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const idStrategies = ["sequential", "random"] as const;

export type IdStrategy = (typeof idStrategies)[number];

export const documentNumberingConfigTable = pgTable(
	"document_numbering_config",
	{
		id: generateDefaultId(),
		organizationId: text("organization_id").notNull(),
		globalPrefix: text("global_prefix").default(""),
		documentType: text("document_type").notNull(),
		prefix: text().default("").notNull(),
		separator: varchar({ length: 5 }).default("-").notNull(),
		dateFormat: text("date_format"),
		idStrategy: varchar("id_strategy", { length: 20 })
			.$type<IdStrategy>()
			.default("sequential")
			.notNull(),
		sequentialPadding: integer("sequential_padding").default(4).notNull(),
		randomLength: integer("random_length").default(8).notNull(),
		nextSequentialNumber: integer("next_sequential_number")
			.default(1)
			.notNull(),
		createdAt: generateDefaultDate(),
		updatedAt: generateDefaultDate(),
	},
	(table) => [
		uniqueIndex().on(table.id),
		uniqueIndex("doc_numbering_org_id_doc_type_idx").on(
			table.organizationId,
			table.documentType,
		),
	],
);

export type InsertDocumentNumberingConfig = InferInsertModel<
	typeof documentNumberingConfigTable
>;
export type SelectDocumentNumberingConfig = InferSelectModel<
	typeof documentNumberingConfigTable
>;
