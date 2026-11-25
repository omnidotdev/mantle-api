import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { generateDefaultDate, generateDefaultId } from "lib/db/util";

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { CustomFieldOption } from "lib/customFields";

/**
 * A field a workspace adds to its people or companies. Records store values
 * in their own `custom_fields` column, keyed by this row's id (see
 * lib/customFields)
 */
export const customFieldTable = pgTable(
  "custom_field",
  {
    id: generateDefaultId(),
    organizationId: text("organization_id").notNull(),
    /** `person` or `company` */
    entity: text().notNull(),
    label: text().notNull(),
    /** text, number, date, checkbox, select or multi_select */
    type: text().notNull(),
    /** Choices for select and multi_select fields */
    options: jsonb().$type<CustomFieldOption[]>().default([]).notNull(),
    position: integer().default(0).notNull(),
    createdAt: generateDefaultDate(),
    updatedAt: generateDefaultDate(),
  },
  (table) => [
    uniqueIndex().on(table.id),
    index("custom_field_organization_id_idx").on(table.organizationId),
    uniqueIndex("custom_field_organization_id_entity_label_idx").on(
      table.organizationId,
      table.entity,
      table.label,
    ),
  ],
);

export type InsertCustomField = InferInsertModel<typeof customFieldTable>;
export type SelectCustomField = InferSelectModel<typeof customFieldTable>;
