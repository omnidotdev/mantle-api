import { jsonPgSmartTags } from "postgraphile/utils";

/**
 * Keep internal data out of the GraphQL schema entirely (`-*`):
 * - `usage_event`: the plan usage ledger (invoices created per period). It is
 *   written and counted by the plan limit plugin only; the app reads usage
 *   through `workspacePlan`
 * - `entitlement_snapshot`: each workspace's last known plan, the billing
 *   outage fallback read by lib/entitlements only
 * - `channel_connection.credentials`: a sales channel's stored OAuth tokens.
 *   Only the sync scripts read them, straight from the database; no GraphQL
 *   caller, not even a workspace owner, gets them back
 *
 * An inventory adjustment's product and quantity are set once (`-update`):
 * the adjustment already moved that product's stock, so editing either would
 * leave the log and the on-hand quantity disagreeing. Delete and re-record
 * instead
 */
const HIDDEN = { behavior: "-*" } as const;
const CREATE_ONLY = { behavior: "-attribute:update" } as const;

const HideInternalDataPlugin = jsonPgSmartTags(
  {
    version: 1,
    config: {
      class: {
        usage_event: { tags: HIDDEN },
        entitlement_snapshot: { tags: HIDDEN },
      },
      attribute: {
        "channel_connection.credentials": { tags: HIDDEN },
        "inventory_adjustment.product_id": { tags: CREATE_ONLY },
        "inventory_adjustment.quantity_change": { tags: CREATE_ONLY },
      },
    },
  },
  null,
  { name: "HideInternalDataPlugin" },
);

export default HideInternalDataPlugin;
