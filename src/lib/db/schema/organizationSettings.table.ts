import { pgTable, text, uniqueIndex, varchar } from "drizzle-orm/pg-core";

import { generateDefaultDate, generateDefaultId } from "lib/db/util";

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const organizationSettingsTable = pgTable(
  "organization_settings",
  {
    id: generateDefaultId(),
    organizationId: text("organization_id").notNull(),
    accentColor: varchar("accent_color", { length: 7 }).default("#0d9488"),
    // Workspace profile shown on invoices, quotes and contracts
    companyName: text("company_name"),
    contactName: text("contact_name"),
    contactTitle: text("contact_title"),
    email: text(),
    phone: text(),
    website: text(),
    addressLine1: text("address_line1"),
    addressLine2: text("address_line2"),
    city: text(),
    state: text(),
    postalCode: text("postal_code"),
    country: text(),
    logoUrl: text("logo_url"),
    registrationState: text("registration_state"),
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
