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
 *   - Aether unreachable or erroring: the workspace's last known plan, kept in
 *     memory and persisted (entitlement_snapshot) so it survives a restart;
 *     with none known, fail open (no limits) rather than block a paying
 *     workspace
 *
 * Paid limits are therefore enforced only from an answer Aether gave
 */

import { BILLING_BYPASS_ORG_IDS } from "lib/config/env.config";
import { APP_ID, providers } from "lib/providers";

import type {
  EntitlementsResponse,
  EntitlementsResult,
} from "@omnidotdev/providers/billing";

/**
 * Plan limit keys Mantle enforces (catalog `operationalLimits`). Workspace seats
 * are not a Mantle limit: every tier has unlimited team members, managed in the
 * Omni account hub
 */
export const LIMIT_KEYS = ["max_contacts", "max_invoices_per_month"] as const;

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
  free: { max_contacts: 100, max_invoices_per_month: 10 },
  pro: { max_contacts: UNLIMITED, max_invoices_per_month: UNLIMITED },
  team: { max_contacts: UNLIMITED, max_invoices_per_month: UNLIMITED },
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

/** When each organization's plan was last written to the snapshot table */
const persistedAt = new Map<string, number>();

/** Rewrite an unchanged snapshot at most this often (keeps `fetchedAt` fresh) */
const SNAPSHOT_REFRESH_MS = 5 * 60_000;

const sameLimits = (a: PlanLimits, b: PlanLimits): boolean =>
  LIMIT_KEYS.every((key) => a[key] === b[key]);

/**
 * Persist the plan Aether just returned, so an outage after a restart still
 * has it. Skipped when the same plan was written recently. A failed write is
 * logged, never thrown: the snapshot is a fallback, not part of the request
 */
const saveSnapshot = async (
  organizationId: string,
  resolved: ResolvedLimits,
  previous: ResolvedLimits | undefined,
): Promise<void> => {
  const unchanged =
    previous?.tier === resolved.tier &&
    sameLimits(previous.limits, resolved.limits);
  const recent =
    Date.now() - (persistedAt.get(organizationId) ?? 0) < SNAPSHOT_REFRESH_MS;
  if (unchanged && recent) return;

  try {
    const { dbPool } = await import("lib/db/db");
    const { entitlementSnapshotTable } = await import("lib/db/schema");
    const fetchedAt = new Date().toISOString();

    await dbPool
      .insert(entitlementSnapshotTable)
      .values({
        organizationId,
        tier: resolved.tier,
        limits: resolved.limits,
        fetchedAt,
      })
      .onConflictDoUpdate({
        target: entitlementSnapshotTable.organizationId,
        set: { tier: resolved.tier, limits: resolved.limits, fetchedAt },
      });
    persistedAt.set(organizationId, Date.now());
  } catch (err) {
    console.warn(
      "[entitlements] could not save the plan snapshot:",
      err instanceof Error ? err.message : err,
    );
  }
};

/** Forget a workspace's persisted plan (it has no billing account any more) */
const dropSnapshot = async (organizationId: string): Promise<void> => {
  persistedAt.delete(organizationId);

  try {
    const { eq } = await import("drizzle-orm");
    const { dbPool } = await import("lib/db/db");
    const { entitlementSnapshotTable } = await import("lib/db/schema");

    await dbPool
      .delete(entitlementSnapshotTable)
      .where(eq(entitlementSnapshotTable.organizationId, organizationId));
  } catch (err) {
    console.warn(
      "[entitlements] could not clear the plan snapshot:",
      err instanceof Error ? err.message : err,
    );
  }
};

/**
 * The persisted plan for a workspace, read during an outage when this process
 * has none in memory (e.g. it restarted while Aether was down). A key missing
 * from the snapshot falls back to the tier default
 */
const loadSnapshot = async (
  organizationId: string,
): Promise<ResolvedLimits | null> => {
  try {
    const { eq } = await import("drizzle-orm");
    const { dbPool } = await import("lib/db/db");
    const { entitlementSnapshotTable } = await import("lib/db/schema");

    const [row] = await dbPool
      .select()
      .from(entitlementSnapshotTable)
      .where(eq(entitlementSnapshotTable.organizationId, organizationId))
      .limit(1);
    if (!row) return null;

    const defaults = TIER_LIMITS[row.tier] ?? FREE_LIMITS;
    const limits = Object.fromEntries(
      LIMIT_KEYS.map((key) => {
        const value = row.limits[key];
        return [
          key,
          typeof value === "number" && Number.isFinite(value)
            ? value
            : defaults[key],
        ];
      }),
    ) as PlanLimits;

    return { tier: row.tier, limits, source: "plan" };
  } catch (err) {
    console.warn(
      "[entitlements] could not read the plan snapshot:",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
};

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

const onOutage = async (organizationId: string): Promise<ResolvedLimits> => {
  const known =
    lastKnown.get(organizationId) ?? (await loadSnapshot(organizationId));
  if (known) {
    lastKnown.set(organizationId, known);

    return { ...known, source: "cached" };
  }

  return { tier: "unknown", limits: UNLIMITED_LIMITS, source: "unavailable" };
};

const fromResult = async (
  organizationId: string,
  result: EntitlementsResult,
): Promise<ResolvedLimits> => {
  if (result.status === "success") {
    const resolved: ResolvedLimits = {
      ...entitlementsToLimits(result.data),
      source: "plan",
    };
    const previous = lastKnown.get(organizationId);
    lastKnown.set(organizationId, resolved);
    await saveSnapshot(organizationId, resolved, previous);

    return resolved;
  }

  if (result.status === "not_found") {
    // No billing account: the workspace is on the free tier, so a plan seen
    // before (e.g. a canceled subscription) no longer applies
    lastKnown.delete(organizationId);
    await dropSnapshot(organizationId);

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
    resolved = await fromResult(
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
    resolved = await onOutage(organizationId);
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
 * Drop every in-memory lookup, as a restart would. Tests use this between
 * cases; the persisted snapshots stay, so an outage afterwards still falls back
 * to them
 */
export const clearLimitsCache = (): void => {
  misses.clear();
  lastKnown.clear();
  persistedAt.clear();
};
