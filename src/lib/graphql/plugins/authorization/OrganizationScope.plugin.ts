import { EXPORTABLE } from "graphile-export";
import { sql } from "postgraphile/pg-sql2";
import { wrapPlans } from "postgraphile/utils";

import { TABLE_OWNERSHIP } from "./OrgMutationGuard.plugin";

import type { SQL } from "postgraphile/pg-sql2";
import type { PlanWrapperFn } from "postgraphile/utils";

/** Session setting holding the workspaces a filter admits */
type ScopeSetting = "app.organization_ids" | "app.admin_organization_ids";

type PgWhere = { where: (spec: unknown) => void };

/**
 * The PgSelectStep behind a root field's plan: a connection's subplan, or the
 * class step of a single-row lookup
 */
const selectOf = (step: unknown): PgWhere | null => {
  const s = step as {
    getSubplan?: () => PgWhere;
    getClassStep?: () => PgWhere;
  };
  if (typeof s.getSubplan === "function") return s.getSubplan();
  if (typeof s.getClassStep === "function") return s.getClassStep();
  return null;
};

/**
 * Scope a table with its own `organization_id` to the workspaces in a session
 * setting (set per request by the authentication plugin). Applied in SQL to
 * collections and single-row lookups alike, so a row outside the caller's
 * workspaces is simply not found, whatever fields the query selects
 */
const scopeOrg = (
  setting: ScopeSetting = "app.organization_ids",
): PlanWrapperFn =>
  EXPORTABLE(
    (sql, selectOf, setting): PlanWrapperFn =>
      (plan) => {
        const $plan = plan();
        if (!$plan) return $plan;

        selectOf($plan)?.where({
          type: "attribute",
          attribute: "organization_id",
          callback(expression: SQL) {
            return sql`(coalesce(current_setting('app.service_auth', true), '') = 'true' OR ${expression} = ANY(coalesce(nullif(current_setting(${sql.literal(setting)}, true), ''), '{}')::text[]))`;
          },
        });

        return $plan;
      },
    [sql, selectOf, setting],
  );

/**
 * Scope a child table (no `organization_id` of its own) through its parent
 * row's workspace, e.g. invoice_line_item -> invoice
 */
const scopeChild = (parentTable: string, fkColumn: string): PlanWrapperFn =>
  EXPORTABLE(
    (sql, selectOf, parentTable, fkColumn): PlanWrapperFn =>
      (plan) => {
        const $plan = plan();
        if (!$plan) return $plan;

        selectOf($plan)?.where({
          type: "attribute",
          attribute: fkColumn,
          callback(expression: SQL) {
            return sql`(coalesce(current_setting('app.service_auth', true), '') = 'true' OR ${expression} IN (SELECT id FROM ${sql.identifier(parentTable)} WHERE organization_id = ANY(coalesce(nullif(current_setting('app.organization_ids', true), ''), '{}')::text[])))`;
          },
        });

        return $plan;
      },
    [sql, selectOf, parentTable, fkColumn],
  );

/**
 * Organization scoping plugin for Mantle GraphQL queries.
 *
 * Every root read of a table (collection, single row by rowId, single row by
 * Relay id) is filtered in SQL to the caller's workspaces, read from the
 * `app.organization_ids` session setting; anonymous callers have none.
 * `channel_connection` is narrower: only workspaces the caller owns or
 * administers (`app.admin_organization_ids`).
 *
 * Child tables are scoped through their parent:
 *   company_member -> company, invoice_line_item -> invoice,
 *   payment -> invoice, quote_line_item -> quote,
 *   inventory_adjustment -> product, person_external_link -> person,
 *   product_external_link -> product
 */
const ORG_TABLES: Record<string, ScopeSetting> = {
  channelConnection: "app.admin_organization_ids",
  company: "app.organization_ids",
  creditTransaction: "app.organization_ids",
  customField: "app.organization_ids",
  documentNumberingConfig: "app.organization_ids",
  invoice: "app.organization_ids",
  organizationSetting: "app.organization_ids",
  person: "app.organization_ids",
  product: "app.organization_ids",
  quote: "app.organization_ids",
  supplier: "app.organization_ids",
};

const ORG_COLLECTIONS: Record<string, string> = {
  channelConnection: "channelConnections",
  company: "companies",
  creditTransaction: "creditTransactions",
  customField: "customFields",
  documentNumberingConfig: "documentNumberingConfigs",
  invoice: "invoices",
  organizationSetting: "organizationSettings",
  person: "people",
  product: "products",
  quote: "quotes",
  supplier: "suppliers",
};

const CHILD_TABLES: Record<
  string,
  { collection: string; parent: string; fk: string }
> = {
  companyMember: {
    collection: "companyMembers",
    parent: "company",
    fk: "company_id",
  },
  inventoryAdjustment: {
    collection: "inventoryAdjustments",
    parent: "product",
    fk: "product_id",
  },
  invoiceLineItem: {
    collection: "invoiceLineItems",
    parent: "invoice",
    fk: "invoice_id",
  },
  payment: { collection: "payments", parent: "invoice", fk: "invoice_id" },
  personExternalLink: {
    collection: "personExternalLinks",
    parent: "person",
    fk: "person_id",
  },
  productExternalLink: {
    collection: "productExternalLinks",
    parent: "product",
    fk: "product_id",
  },
  quoteLineItem: {
    collection: "quoteLineItems",
    parent: "quote",
    fk: "quote_id",
  },
};

const QUERY_RULES: Record<string, PlanWrapperFn> = {
  ...Object.fromEntries(
    Object.entries(ORG_TABLES).flatMap(([single, setting]) => [
      [single, scopeOrg(setting)],
      [`${single}ById`, scopeOrg(setting)],
      [ORG_COLLECTIONS[single] as string, scopeOrg(setting)],
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(CHILD_TABLES).flatMap(
      ([single, { collection, parent, fk }]) => [
        [single, scopeChild(parent, fk)],
        [`${single}ById`, scopeChild(parent, fk)],
        [collection, scopeChild(parent, fk)],
      ],
    ),
  ),
};

const OrganizationScopePlugin = wrapPlans({ Query: QUERY_RULES });

/**
 * Every Query field the organization scope wraps; the reviewed-surface test
 * requires every table read to be in this set
 */
export const ORG_SCOPED_QUERY_FIELDS: ReadonlySet<string> = new Set(
  Object.keys(QUERY_RULES),
);

/**
 * Apply the organization filter to relation fields, not only root Query
 * fields.
 *
 * Root reads were scoped, but relations were not: anonymous
 * `payments { invoice { ... } }` returned invoices the root `invoices` field
 * hid. Every relation that reads an organization-owned table gets the same SQL
 * filter as a root collection; child tables are reached only through an
 * already-filtered parent
 */
export const OrganizationScopeNestedPlugin = wrapPlans<PlanWrapperFn>(
  (ctx) => {
    const selfName = ctx.Self.name;
    if (
      selfName === "Query" ||
      selfName === "Mutation" ||
      selfName === "Subscription"
    ) {
      return null;
    }
    if (
      selfName.endsWith("Payload") ||
      selfName.endsWith("Edge") ||
      selfName.endsWith("Connection")
    ) {
      return null;
    }

    const scope = ctx.scope as {
      pgFieldResource?: { name?: string };
      pgRelationDetails?: {
        registry?: {
          pgRelations?: Record<
            string,
            Record<string, { remoteResource?: { name?: string } }>
          >;
        };
        codec?: { name?: string };
        relationName?: string;
      };
    };
    const details = scope.pgRelationDetails;
    if (!details) return null;
    const relation =
      details.codec?.name && details.relationName
        ? details.registry?.pgRelations?.[details.codec.name]?.[
            details.relationName
          ]
        : undefined;
    const remote =
      scope.pgFieldResource?.name ?? relation?.remoteResource?.name;
    if (!remote || TABLE_OWNERSHIP[remote]?.kind !== "org") return null;

    return (plan) => {
      const $plan = plan();
      if (!$plan) return $plan;
      const step = $plan as unknown as {
        getClassStep?: () => PgWhere;
        getSubplan?: () => PgWhere;
      };
      const $select =
        typeof step.getClassStep === "function"
          ? step.getClassStep()
          : typeof step.getSubplan === "function"
            ? step.getSubplan()
            : null;
      $select?.where({
        type: "attribute",
        attribute: "organization_id",
        callback(expression: SQL) {
          return sql`(coalesce(current_setting('app.service_auth', true), '') = 'true' OR ${expression} = ANY(coalesce(nullif(current_setting('app.organization_ids', true), ''), '{}')::text[]))`;
        },
      });
      return $plan;
    };
  },
  (wrapper) => wrapper,
  { name: "OrganizationScopeNestedPlugin" },
);

/**
 * Drop the Relay root `node(id)` lookup: it reads any row of any table by
 * global id, and child tables (payments, line items) carry no organizationId
 * for the single-item check to compare
 */
export const RemoveQueryNodePlugin: GraphileConfig.Plugin = {
  name: "RemoveQueryNodePlugin",
  version: "1.0.0",
  schema: {
    hooks: {
      GraphQLObjectType_fields(fields, _build, ctx) {
        if (ctx.Self.name !== "Query") return fields;
        const { node: _node, ...rest } = fields as Record<string, unknown>;
        return rest as typeof fields;
      },
    },
  },
};

export default OrganizationScopePlugin;
