import { pgTable, text, uniqueIndex, varchar } from "drizzle-orm/pg-core";

import { generateDefaultDate, generateDefaultId } from "lib/db/util";

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const organizationSettingsTable = pgTable(
  "organization_settings",
  {
    id: generateDefaultId(),
    organizationId: text("organization_id").notNull(),
    accentColor: varchar("accent_color", { length: 7 }).default("#0d9488"),
    createdAt: generateDefaultDate(),
    updatedAt: generateDefaultDate(),
  },
  (table) => [
    uniqueIndex().on(table.id),
    uniqueIndex("org_settings_organization_id_idx").on(table.organizationId),
  ],
);

export type InsertOrganizationSettings = InferInsertModel<
  typeof organizationSettingsTable
>;
export type SelectOrganizationSettings = InferSelectModel<
  typeof organizationSettingsTable
>;
