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
 * The credit ledger is append-only (`-insert -update -delete` on the generated
 * CRUD): entries are written only by issueCredit, applyInvoiceCredit and the
 * overpayment flow, which validate the kind and amount. A generated create
 * would let a member write a system kind (`overpayment`, `application`,
 * `void`), and an update or delete would rewrite history the balance and
 * MyFi's books are derived from
 *
 * A record's workspace is set once (`organization_id`, `-update`): moving a
 * record would carry it past the target workspace's plan limits and leave its
 * links pointing at the old workspace
 *
 * An inventory adjustment's product and quantity are set once (`-update`):
 * the adjustment already moved that product's stock, so editing either would
 * leave the log and the on-hand quantity disagreeing. Delete and re-record
 * instead
 */
const HIDDEN = { behavior: "-*" } as const;
const CREATE_ONLY = { behavior: "-attribute:update" } as const;
const APPEND_ONLY = { behavior: "-insert -update -delete" } as const;

/** Tables with their own workspace column */
const WORKSPACE_TABLES = [
  "channel_connection",
  "company",
  "credit_transaction",
  "document_numbering_config",
  "invoice",
  "organization_settings",
  "person",
  "product",
  "quote",
  "supplier",
];

const HideInternalDataPlugin = jsonPgSmartTags(
  {
    version: 1,
    config: {
      class: {
        usage_event: { tags: HIDDEN },
        entitlement_snapshot: { tags: HIDDEN },
        credit_transaction: { tags: APPEND_ONLY },
      },
      attribute: {
        ...Object.fromEntries(
          WORKSPACE_TABLES.map((table) => [
            `${table}.organization_id`,
            { tags: CREATE_ONLY },
          ]),
        ),
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
