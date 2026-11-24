/**
 * Workspace plan limits.
 *
 * Resolves a workspace's Mantle plan limits from its organization's Aether
 * entitlements. Plan limits only ever gate NEW records: nothing is hidden,
 * locked, or deleted because of a plan, a downgrade, or a billing outage, so a
 * workspace can always read and edit what it already has.
 *
 *   - billing not configured (self-hosting, local development): no limits
 *   - bypass organizations (e.g. Omni's own workspace): no limits
 *   - Aether answers: the workspace's plan (a workspace with no billing
 *     account is on the free tier)
 *   - Aether unreachable or erroring: the workspace's last known plan; with
 *     none cached, fail open (no limits) rather than block a paying workspace
 *
 * Paid limits are therefore enforced only from an answer Aether gave
 */

import { BILLING_BYPASS_ORG_IDS } from "lib/config/env.config";
import { APP_ID, providers } from "lib/providers";

import type {
  EntitlementsResponse,
  EntitlementsResult,
} from "@omnidotdev/providers/billing";

/** Plan limit keys Mantle enforces or reports (catalog `operationalLimits`) */
export const LIMIT_KEYS = [
  "max_team_members",
  "max_contacts",
  "max_invoices_per_month",
  "advanced_workflows",
  "custom_templates",
] as const;

export type LimitKey = (typeof LIMIT_KEYS)[number];

type PlanLimits = Record<LimitKey, number>;

/** No limit */
const UNLIMITED = -1;

/**
 * Per-tier defaults, used for a key Aether does not return. These mirror the
 * Mantle tiers in omni-api's product catalog (planConfigs.ts), which is the
 * source of truth: edit the catalog first, then this
 */
const TIER_LIMITS: Record<string, PlanLimits> = {
  free: {
    max_team_members: 1,
    max_contacts: 50,
    max_invoices_per_month: 5,
    advanced_workflows: 0,
    custom_templates: 0,
  },
  pro: {
    max_team_members: UNLIMITED,
    max_contacts: UNLIMITED,
    max_invoices_per_month: UNLIMITED,
    advanced_workflows: 0,
    custom_templates: 0,
  },
  team: {
    max_team_members: UNLIMITED,
    max_contacts: UNLIMITED,
    max_invoices_per_month: UNLIMITED,
    advanced_workflows: 1,
    custom_templates: 1,
  },
};

const FREE_LIMITS: PlanLimits = TIER_LIMITS.free!;

const UNLIMITED_LIMITS = Object.fromEntries(
  LIMIT_KEYS.map((key) => [key, UNLIMITED]),
) as PlanLimits;

/**
 * How a workspace's limits were resolved:
 *  - `plan`: from its Aether entitlements
 *  - `free`: Aether reports no billing account, so the free tier applies
 *  - `cached`: Aether is unreachable, so its last known plan applies
 *  - `unavailable`: Aether is unreachable and no plan is known, so no limits
 *    apply until it recovers (fail open)
 *  - `unconfigured`: billing is not configured (self-hosting), no limits
 *  - `bypass`: the workspace is exempt from plan limits
 */
type LimitsSource =
  | "plan"
  | "free"
  | "cached"
  | "unavailable"
  | "unconfigured"
  | "bypass";

export interface ResolvedLimits {
  tier: string;
  limits: PlanLimits;
  source: LimitsSource;
}

const bypassOrganizationIds = (): Set<string> =>
  new Set(
    (process.env.BILLING_BYPASS_ORG_IDS ?? BILLING_BYPASS_ORG_IDS ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  );

const findValue = (ents: EntitlementsResponse, key: string) =>
  ents.entitlements.find(
    (e) => e.featureKey === key || e.featureKey === `${APP_ID}:${key}`,
  )?.value;

/**
 * Map an Aether entitlements response to plan limits. A key Aether does not
 * return (or returns unparseable) falls back to the tier default for that key
 */
export const entitlementsToLimits = (
  ents: EntitlementsResponse,
): { tier: string; limits: PlanLimits } => {
  const tierValue = findValue(ents, "tier");
  const tier = tierValue ? String(tierValue) : "free";
  const defaults = TIER_LIMITS[tier] ?? FREE_LIMITS;

  const limits = Object.fromEntries(
    LIMIT_KEYS.map((key) => {
      const value = findValue(ents, key);
      if (value == null || value === "") return [key, defaults[key]];
      if (value === "unlimited") return [key, UNLIMITED];
      const parsed = Number(value);

      return [key, Number.isFinite(parsed) ? parsed : defaults[key]];
    }),
  ) as PlanLimits;

  return { tier, limits };
};

/** Last plan Aether returned per organization, kept for outages */
const lastKnown = new Map<string, ResolvedLimits>();

/** No-account and outage results, reused briefly so they are not re-fetched per request */
const misses = new Map<
  string,
  { resolved: ResolvedLimits; expiresAt: number }
>();

const MISS_TTL_MS = 60_000;

const FREE: ResolvedLimits = {
  tier: "free",
  limits: FREE_LIMITS,
  source: "free",
};

const onOutage = (organizationId: string): ResolvedLimits => {
  const known = lastKnown.get(organizationId);
  if (known) return { ...known, source: "cached" };

  return { tier: "unknown", limits: UNLIMITED_LIMITS, source: "unavailable" };
};

const fromResult = (
  organizationId: string,
  result: EntitlementsResult,
): ResolvedLimits => {
  if (result.status === "success") {
    const resolved: ResolvedLimits = {
      ...entitlementsToLimits(result.data),
      source: "plan",
    };
    lastKnown.set(organizationId, resolved);

    return resolved;
  }

  if (result.status === "not_found") {
    // No billing account: the workspace is on the free tier, so a plan seen
    // before (e.g. a canceled subscription) no longer applies
    lastKnown.delete(organizationId);

    return FREE;
  }

  return onOutage(organizationId);
};

/**
 * Resolve a workspace's plan limits along with how they were resolved. Never
 * throws: a billing failure degrades to the last known plan, else no limits
 */
export const resolveLimits = async (
  organizationId: string,
): Promise<ResolvedLimits> => {
  if (bypassOrganizationIds().has(organizationId))
    return { tier: "bypass", limits: UNLIMITED_LIMITS, source: "bypass" };

  const { billing } = providers;
  if (!billing)
    return {
      tier: "unlimited",
      limits: UNLIMITED_LIMITS,
      source: "unconfigured",
    };

  const miss = misses.get(organizationId);
  if (miss && miss.expiresAt > Date.now()) return miss.resolved;

  let resolved: ResolvedLimits;

  try {
    resolved = fromResult(
      organizationId,
      await billing.getEntitlementsResult(
        "organization",
        organizationId,
        APP_ID,
      ),
    );
  } catch (err) {
    console.error(
      "[entitlements] lookup failed, using the last known plan (or none):",
      err instanceof Error ? err.message : err,
    );
    resolved = onOutage(organizationId);
  }

  if (resolved.source === "plan") misses.delete(organizationId);
  else
    misses.set(organizationId, {
      resolved,
      expiresAt: Date.now() + MISS_TTL_MS,
    });

  return resolved;
};

/** Whether `count` existing records leave room for one more under `limit` */
export const hasRoomFor = (limit: number, count: number): boolean =>
  limit < 0 || count < limit;

/**
 * Drop every cached lookup. Tests use this between cases; the last known plans
 * go too, so only call it where an outage fallback is not needed
 */
export const clearLimitsCache = (): void => {
  misses.clear();
  lastKnown.clear();
};
