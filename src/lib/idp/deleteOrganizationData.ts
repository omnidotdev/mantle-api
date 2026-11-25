import { eq } from "drizzle-orm";

import { dbPool } from "lib/db/db";
import {
  channelConnectionTable,
  companyTable,
  creditTransactionTable,
  customFieldTable,
  documentNumberingConfigTable,
  entitlementSnapshotTable,
  invoiceTable,
  organizationSettingsTable,
  personTable,
  productTable,
  quoteTable,
  supplierTable,
  usageEventTable,
} from "lib/db/schema";

/** Rows deleted per table */
type OrganizationDeletionCounts = Record<string, number>;

/**
 * Delete everything Mantle keeps for a deleted workspace (Gatekeeper
 * organization): its credit ledger, quotes, invoices (with their line items
 * and payments), document numbering, products (with their external links and
 * inventory adjustments), suppliers, companies and people (with their
 * memberships and external links), custom field definitions, sales channel connections (and the
 * credentials they hold), its settings (including the workspace profile), its
 * plan usage ledger, and its last known plan.
 *
 * The records are the workspace's own, kept on its behalf, so they go with it.
 * One transaction, ordered so no row is left pointing at a deleted one: a
 * line item references its product without a cascade, so invoices and quotes
 * go before products, and quotes and invoices reference companies and people.
 * Idempotent: a workspace with nothing left is a no-op
 */
export const deleteOrganizationData = async (
  organizationId: string,
  db: typeof dbPool = dbPool,
): Promise<OrganizationDeletionCounts> =>
  db.transaction(async (tx) => {
    const counts: OrganizationDeletionCounts = {};
    const steps = [
      ["creditTransactions", creditTransactionTable],
      ["quotes", quoteTable],
      ["invoices", invoiceTable],
      ["documentNumberingConfigs", documentNumberingConfigTable],
      ["products", productTable],
      ["suppliers", supplierTable],
      ["companies", companyTable],
      ["people", personTable],
      ["customFields", customFieldTable],
      ["channelConnections", channelConnectionTable],
      ["organizationSettings", organizationSettingsTable],
      ["usageEvents", usageEventTable],
      ["entitlementSnapshots", entitlementSnapshotTable],
    ] as const;

    for (const [name, table] of steps) {
      const rows = await tx
        .delete(table)
        .where(eq(table.organizationId, organizationId))
        .returning({ id: table.id });
      counts[name] = rows.length;
    }

    return counts;
  });
