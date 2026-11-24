import { jsonb, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

import { generateDefaultDate, generateDefaultId } from "lib/db/util";

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

/**
 * Last plan Aether returned for each workspace (tier and resolved limits),
 * refreshed on successful lookups. Read only when Aether is unreachable, so a
 * restart during a billing outage keeps the workspace's plan instead of
 * failing open. Internal, never exposed through GraphQL
 */
export const entitlementSnapshotTable = pgTable(
  "entitlement_snapshot",
  {
    id: generateDefaultId(),
    organizationId: text("organization_id").notNull(),
    tier: text().notNull(),
    limits: jsonb().$type<Record<string, number>>().notNull(),
    fetchedAt: generateDefaultDate().notNull(),
  },
  (table) => [
    uniqueIndex("entitlement_snapshot_organization_id_idx").on(
      table.organizationId,
    ),
  ],
);

export type InsertEntitlementSnapshot = InferInsertModel<
  typeof entitlementSnapshotTable
>;
export type SelectEntitlementSnapshot = InferSelectModel<
  typeof entitlementSnapshotTable
>;
