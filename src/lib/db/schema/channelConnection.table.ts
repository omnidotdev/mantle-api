import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { generateDefaultDate, generateDefaultId } from "lib/db/util";

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const channelConnectionTable = pgTable(
  "channel_connection",
  {
    id: generateDefaultId(),
    organizationId: text("organization_id").notNull(),
    provider: text().notNull(),
    status: text().notNull().default("active"),
    externalShopId: text("external_shop_id"),
    credentials: jsonb().$type<Record<string, unknown>>().notNull().default({}),
    scopes: text().array(),
    syncConfig: jsonb("sync_config")
      .$type<{
        syncFields?: string[];
        fieldOverrides?: Record<string, string>;
      }>()
      .notNull()
      .default({}),
    lastSyncedAt: timestamp("last_synced_at", {
      precision: 6,
      mode: "string",
      withTimezone: true,
    }),
    createdAt: generateDefaultDate(),
    updatedAt: generateDefaultDate(),
  },
  (table) => [
    uniqueIndex().on(table.id),
    uniqueIndex("channel_connection_org_provider_idx").on(
      table.organizationId,
      table.provider,
    ),
    index("channel_connection_org_idx").on(table.organizationId),
  ],
);

export type InsertChannelConnection = InferInsertModel<
  typeof channelConnectionTable
>;
export type SelectChannelConnection = InferSelectModel<
  typeof channelConnectionTable
>;
