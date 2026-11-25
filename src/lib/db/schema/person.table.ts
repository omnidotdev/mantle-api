import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { generateDefaultDate, generateDefaultId } from "lib/db/util";

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const personTable = pgTable(
  "person",
  {
    id: generateDefaultId(),
    organizationId: text("organization_id").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    emails: text().array(),
    phone: text(),
    internal: boolean().default(false).notNull(),
    emailConsent: boolean("email_consent").default(false).notNull(),
    avatarUrl: text("avatar_url"),
    tags: text().array(),
    notes: text(),
    /** Values of the workspace's custom fields, keyed by field id */
    customFields: jsonb("custom_fields")
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    createdAt: generateDefaultDate(),
    updatedAt: generateDefaultDate(),
  },
  (table) => [
    uniqueIndex().on(table.id),
    index("person_organization_id_idx").on(table.organizationId),
    index("person_emails_idx").on(table.emails),
  ],
);

export type InsertPerson = InferInsertModel<typeof personTable>;
export type SelectPerson = InferSelectModel<typeof personTable>;
