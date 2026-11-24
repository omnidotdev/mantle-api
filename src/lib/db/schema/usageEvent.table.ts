import { index, pgTable, text } from "drizzle-orm/pg-core";

import { generateDefaultDate, generateDefaultId } from "lib/db/util";

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

/** Metered actions counted against a period plan limit */
export const usageMetrics = ["invoice_created"] as const;

export type UsageMetric = (typeof usageMetrics)[number];

/**
 * Append-only ledger of metered actions (e.g. an invoice created), so a period
 * limit counts what was created in the period rather than the rows still
 * alive: deleting an invoice does not free a monthly slot. Internal, never
 * exposed through GraphQL
 */
export const usageEventTable = pgTable(
  "usage_event",
  {
    id: generateDefaultId(),
    organizationId: text("organization_id").notNull(),
    metric: text().$type<UsageMetric>().notNull(),
    createdAt: generateDefaultDate().notNull(),
  },
  (table) => [
    index("usage_event_org_metric_created_idx").on(
      table.organizationId,
      table.metric,
      table.createdAt,
    ),
  ],
);

export type InsertUsageEvent = InferInsertModel<typeof usageEventTable>;
export type SelectUsageEvent = InferSelectModel<typeof usageEventTable>;
