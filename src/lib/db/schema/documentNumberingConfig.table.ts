import { sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  text,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { generateDefaultDate, generateDefaultId } from "lib/db/util";
import { companyTable } from "./company.table";

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const idStrategies = ["sequential", "random"] as const;

export type IdStrategy = (typeof idStrategies)[number];

export const documentNumberingConfigTable = pgTable(
  "document_numbering_config",
  {
    id: generateDefaultId(),
    organizationId: text("organization_id").notNull(),
    // Null = the workspace-wide default for this document type; a company id =
    // a per-client override that takes precedence for that client
    companyId: uuid("company_id").references(() => companyTable.id, {
      onDelete: "cascade",
    }),
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
    // Lookup + keeps (org, document type) filterable in GraphQL
    index("doc_numbering_org_id_doc_type_lookup_idx").on(
      table.organizationId,
      table.documentType,
    ),
    // One workspace default per (org, document type)
    uniqueIndex("doc_numbering_org_doc_type_default_idx")
      .on(table.organizationId, table.documentType)
      .where(sql`${table.companyId} is null`),
    // One override per (org, document type, client)
    uniqueIndex("doc_numbering_org_doc_type_company_idx")
      .on(table.organizationId, table.documentType, table.companyId)
      .where(sql`${table.companyId} is not null`),
  ],
);

export type InsertDocumentNumberingConfig = InferInsertModel<
  typeof documentNumberingConfigTable
>;
export type SelectDocumentNumberingConfig = InferSelectModel<
  typeof documentNumberingConfigTable
>;
