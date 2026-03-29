import {
  boolean,
  index,
  pgTable,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { generateDefaultDate, generateDefaultId } from "lib/db/util";

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const supplierTable = pgTable(
  "supplier",
  {
    id: generateDefaultId(),
    organizationId: text("organization_id").notNull(),
    name: text().notNull(),
    code: text(),
    contactEmail: text("contact_email"),
    contactPhone: text("contact_phone"),
    website: text(),
    notes: text(),
    isActive: boolean("is_active").default(true),
    createdAt: generateDefaultDate(),
    updatedAt: generateDefaultDate(),
  },
  (table) => [
    uniqueIndex().on(table.id),
    index("supplier_organization_id_idx").on(table.organizationId),
    uniqueIndex("supplier_organization_id_code_idx").on(
      table.organizationId,
      table.code,
    ),
  ],
);

export type InsertSupplier = InferInsertModel<typeof supplierTable>;
export type SelectSupplier = InferSelectModel<typeof supplierTable>;
