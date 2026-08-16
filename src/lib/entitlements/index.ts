/**
 * Entitlements module for Mantle.
 *
 * Thin wrapper around @omnidotdev/providers BillingProvider.
 * Maintains the same API surface for PostGraphile EXPORTABLE compatibility.
 *
 * Entitlements are queried at the ORGANIZATION level.
 * When Aether is unavailable or no billing account exists,
 * defaults to free-tier limits instead of failing.
 */

import { isWithinLimit as checkLimit } from "@omnidotdev/providers/billing";

import { billing } from "lib/providers";

import type { EntitlementsResponse } from "@omnidotdev/providers/billing";

/** Mantle app ID for entitlements */
const APP_ID = "mantle";

/**
 * Default free-tier limits applied when no billing account exists.
 * Prevents hard failures for organizations that haven't been provisioned in Aether.
 */
const DEFAULT_LIMITS: Record<string, Record<string, number>> = {
  max_team_members: { free: 1, pro: -1, team: -1 },
  max_contacts: { free: 50, pro: -1, team: -1 },
  max_invoices_per_month: { free: 5, pro: -1, team: -1 },
  advanced_workflows: { free: 0, pro: 0, team: 1 },
  custom_templates: { free: 0, pro: 0, team: 1 },
};

/**
 * Fetch entitlements for an organization from the billing provider.
 */
async function getOrgEntitlements(
  organizationId: string,
): Promise<EntitlementsResponse | null> {
  return billing.getEntitlements("organization", organizationId, APP_ID);
}

/**
 * Check if an organization is within its limit for a resource.
 * This is the primary function for authorization plugins.
 *
 * @param entity - Object with organizationId
 * @param limitKey - The limit key to check (e.g., "max_contacts")
 * @param currentCount - Current count of resources
 * @param billingBypassOrgIds - Organization IDs exempt from billing limits
 * @knipignore Used by plugins
 */
export async function isWithinLimit(
  entity: { organizationId: string },
  limitKey: string,
  currentCount: number,
  billingBypassOrgIds: string[] = [],
): Promise<boolean> {
  // Bypass check for exempt organizations (e.g., Omni internal)
  if (billingBypassOrgIds.includes(entity.organizationId)) {
    return true;
  }

  const entitlements = await getOrgEntitlements(entity.organizationId);

  return checkLimit(entitlements, limitKey, currentCount, DEFAULT_LIMITS);
}
