import { EXPORTABLE } from "graphile-export";
import { gql, makeExtendSchemaPlugin } from "graphile-utils";

/**
 * A workspace's Mantle plan: its tier, how the tier was resolved, and each
 * plan limit with the current usage where Mantle can count it. The app shows
 * it on the settings page and uses it to explain a refused create; the limits
 * themselves are enforced server-side by PlanLimitsPlugin.
 *
 * `used` is null for limits Mantle does not count (workspace seats are managed
 * in the Omni account hub, and the feature flags have no usage)
 */
const WorkspacePlanPlugin = makeExtendSchemaPlugin({
  typeDefs: gql`
		type WorkspacePlanLimit {
			"""Catalog limit key, e.g. max_contacts"""
			key: String!
			"""The limit; -1 means unlimited"""
			limit: Int!
			"""Current usage, when Mantle counts it"""
			used: Int
		}

		type WorkspacePlan {
			organizationId: String!
			tier: String!
			"""
			How the tier was resolved: plan, cached (billing unreachable, last
			known plan), free, unavailable (billing unreachable, free tier), or
			bypass
			"""
			source: String!
			limits: [WorkspacePlanLimit!]!
		}

		extend type Query {
			workspacePlan(organizationId: String!): WorkspacePlan
		}
	`,
  resolvers: {
    Query: {
      workspacePlan: EXPORTABLE(
        () =>
          async (
            _parent: unknown,
            args: { organizationId: string },
            context: { observer?: unknown; organizationIds?: string[] },
          ) => {
            const { sql } = await import("drizzle-orm");
            const { dbPool } = await import("lib/db/db");
            const { LIMIT_KEYS, resolveLimits } = await import(
              "lib/entitlements"
            );
            const { assertWorkspaceAccess } = await import(
              "lib/graphql/workspaceAccess"
            );

            const { organizationId } = args;
            assertWorkspaceAccess(context, organizationId);

            const [resolved, usage] = await Promise.all([
              resolveLimits(organizationId),
              dbPool.execute(
                sql`WITH period AS (
                      SELECT date_trunc('month', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC' AS start
                    )
                    SELECT
                      (SELECT count(*)::int FROM person
                        WHERE organization_id = ${organizationId}) AS contacts,
                      (SELECT count(*)::int FROM usage_event, period
                        WHERE organization_id = ${organizationId}
                          AND metric = 'invoice_created'
                          AND created_at >= period.start) AS invoice_events,
                      (SELECT count(*)::int FROM invoice, period
                        WHERE organization_id = ${organizationId}
                          AND created_at >= period.start) AS invoices_live`,
              ),
            ]);

            const row = usage.rows[0] as
              | {
                  contacts: number;
                  invoice_events: number;
                  invoices_live: number;
                }
              | undefined;
            const used: Record<string, number | null> = {
              max_contacts: row?.contacts ?? 0,
              max_invoices_per_month: Math.max(
                row?.invoice_events ?? 0,
                row?.invoices_live ?? 0,
              ),
            };

            return {
              organizationId,
              tier: resolved.tier,
              source: resolved.source,
              limits: LIMIT_KEYS.map((key) => ({
                key,
                limit: resolved.limits[key],
                used: used[key] ?? null,
              })),
            };
          },
        [],
      ),
    },
  },
});

export default WorkspacePlanPlugin;
