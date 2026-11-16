import { EXPORTABLE } from "graphile-export";
import { SafeError, context, sideEffect } from "postgraphile/grafast";
import { sql } from "postgraphile/pg-sql2";
import { wrapPlans } from "postgraphile/utils";

import { TABLE_OWNERSHIP } from "./OrgMutationGuard.plugin";

import type { SQL } from "postgraphile/pg-sql2";
import type { PlanWrapperFn } from "postgraphile/utils";

/**
 * Add organization scoping to a collection (connection) query.
 *
 * Injects a `WHERE organization_id = ANY(...)` condition into the
 * underlying PgSelectStep via the pgSettings session variable set
 * by the authentication plugin. This ensures users can only read
 * data belonging to their organizations.
 */
const scopeCollection = (): PlanWrapperFn =>
  EXPORTABLE(
    (sql): PlanWrapperFn =>
      (plan) => {
        const $connection = plan();

        const $select = (
          $connection as {
            getSubplan: () => { where: (spec: unknown) => void };
          }
        ).getSubplan();

        $select.where({
          type: "attribute",
          attribute: "organization_id",
          callback(expression: SQL) {
            return sql`(coalesce(current_setting('app.service_auth', true), '') = 'true' OR ${expression} = ANY(coalesce(nullif(current_setting('app.organization_ids', true), ''), '{}')::text[]))`;
          },
        });

        return $connection;
      },
    [sql],
  );

/**
 * Scope a child collection via EXISTS subquery on a parent table.
 *
 * Used for tables without their own `organization_id` that reference
 * an org-scoped parent (e.g. invoice_line_item -> invoice).
 */
const scopeChildCollection = (
  parentTable: string,
  fkColumn: string,
  parentPk: string = "id",
): PlanWrapperFn =>
  EXPORTABLE(
    (sql, parentTable, fkColumn, parentPk): PlanWrapperFn =>
      (plan) => {
        const $connection = plan();

        const $select = (
          $connection as {
            getSubplan: () => { where: (spec: unknown) => void };
          }
        ).getSubplan();

        $select.where({
          type: "attribute",
          attribute: fkColumn,
          callback(expression: SQL) {
            return sql`(coalesce(current_setting('app.service_auth', true), '') = 'true' OR ${expression} IN (SELECT ${sql.identifier(parentPk)} FROM ${sql.identifier(parentTable)} WHERE organization_id = ANY(coalesce(nullif(current_setting('app.organization_ids', true), ''), '{}')::text[])))`;
          },
        });

        return $connection;
      },
    [sql, parentTable, fkColumn, parentPk],
  );

/**
 * Add organization scoping to a single-item query.
 *
 * Verifies the resolved item belongs to one of the authenticated
 * user's organizations. Throws "Not found" if unauthorized, making
 * cross-org items invisible rather than returning a 403.
 */
const scopeSingleItem = (): PlanWrapperFn =>
  EXPORTABLE(
    (SafeError, context, sideEffect): PlanWrapperFn =>
      (plan) => {
        const $item = plan();
        const $observer = context().get("observer");
        const $organizationIds = context().get("organizationIds");

        sideEffect(
          [$item, $observer, $organizationIds],
          async ([item, observer, organizationIds]) => {
            if (!item) return;
            // An anonymous caller belongs to no organization; returning the
            // row here let any rowId be read without a token
            if (!observer) throw new SafeError("Not found");

            // Service key auth bypasses org scoping
            if (Array.isArray(organizationIds) && organizationIds.includes("*"))
              return;

            if (typeof item !== "object" || !("organizationId" in item)) return;

            const itemOrgId = (item as { organizationId: string })
              .organizationId;

            if (
              !Array.isArray(organizationIds) ||
              !organizationIds.includes(itemOrgId)
            ) {
              throw new SafeError("Not found");
            }
          },
        );

        return $item;
      },
    [SafeError, context, sideEffect],
  );

/**
 * Scope a single child item by resolving its parent's org ownership.
 */
const scopeChildSingleItem = (
  parentTable: string,
  fkField: string,
): PlanWrapperFn =>
  EXPORTABLE(
    (SafeError, context, sideEffect, parentTable, fkField): PlanWrapperFn =>
      (plan) => {
        const $item = plan();
        const $observer = context().get("observer");
        const $db = context().get("db");
        const $organizationIds = context().get("organizationIds");

        sideEffect(
          [$item, $observer, $db, $organizationIds],
          async ([item, observer, db, organizationIds]) => {
            if (!item) return;
            if (!observer) throw new SafeError("Not found");

            // Service key auth bypasses org scoping
            if (Array.isArray(organizationIds) && organizationIds.includes("*"))
              return;

            if (typeof item !== "object" || !(fkField in item)) return;

            const fkValue = (item as Record<string, string>)[fkField];
            if (!fkValue) return;

            const parentTableRef =
              db.query[`${parentTable}Table` as keyof typeof db.query];
            if (!parentTableRef) return;

            const parent =
              await // biome-ignore lint/complexity/noBannedTypes: dynamic Drizzle query interface
              (parentTableRef as { findFirst: Function }).findFirst({
                where: (
                  table: Record<string, unknown>,
                  // biome-ignore lint/complexity/noBannedTypes: dynamic Drizzle query interface
                  { eq }: { eq: Function },
                ) => eq(table.id, fkValue),
              });

            if (!parent?.organizationId) {
              throw new SafeError("Not found");
            }

            if (
              !Array.isArray(organizationIds) ||
              !organizationIds.includes(parent.organizationId)
            ) {
              throw new SafeError("Not found");
            }
          },
        );

        return $item;
      },
    [SafeError, context, sideEffect, parentTable, fkField],
  );

/**
 * Organization scoping plugin for Mantle GraphQL queries.
 *
 * Ensures read operations on org-scoped tables return only data belonging
 * to the authenticated user's organizations:
 *
 * - **Collection queries**: filtered at the SQL level via a WHERE clause
 *   using `current_setting('app.organization_ids')` (set via pgSettings)
 * - **Single-item queries**: verified post-resolution against the user's
 *   organization membership from the Grafast context
 *
 * Tables with direct `organization_id`:
 *   channel_connection, company, person, product, invoice, quote,
 *   supplier, document_numbering_config, organization_settings
 *
 * Child tables scoped via parent FK:
 *   company_member -> company, invoice_line_item -> invoice,
 *   quote_line_item -> quote, inventory_adjustment -> product,
 *   person_external_link -> person, product_external_link -> product
 */
const QUERY_RULES: Record<string, PlanWrapperFn> = {
  // Collection queries - SQL-level WHERE organization_id filtering
  channelConnections: scopeCollection(),
  companies: scopeCollection(),
  people: scopeCollection(),
  products: scopeCollection(),
  invoices: scopeCollection(),
  creditTransactions: scopeCollection(),
  quotes: scopeCollection(),
  suppliers: scopeCollection(),
  documentNumberingConfigs: scopeCollection(),
  organizationSettings: scopeCollection(),

  // Child table collections - scoped via parent FK joins
  companyMembers: scopeChildCollection("company", "company_id"),
  invoiceLineItems: scopeChildCollection("invoice", "invoice_id"),
  payments: scopeChildCollection("invoice", "invoice_id"),
  quoteLineItems: scopeChildCollection("quote", "quote_id"),
  inventoryAdjustments: scopeChildCollection("product", "product_id"),
  personExternalLinks: scopeChildCollection("person", "person_id"),
  productExternalLinks: scopeChildCollection("product", "product_id"),

  // Single-item queries (by rowId) - post-resolution org membership check
  channelConnection: scopeSingleItem(),
  company: scopeSingleItem(),
  person: scopeSingleItem(),
  product: scopeSingleItem(),
  invoice: scopeSingleItem(),
  creditTransaction: scopeSingleItem(),
  creditTransactionById: scopeSingleItem(),
  organizationSettingById: scopeSingleItem(),
  supplierById: scopeSingleItem(),
  documentNumberingConfigById: scopeSingleItem(),
  quote: scopeSingleItem(),
  supplier: scopeSingleItem(),
  documentNumberingConfig: scopeSingleItem(),
  organizationSetting: scopeSingleItem(),

  // Child table single-item queries - scoped via parent FK lookup
  companyMember: scopeChildSingleItem("company", "companyId"),
  invoiceLineItem: scopeChildSingleItem("invoice", "invoiceId"),
  payment: scopeChildSingleItem("invoice", "invoiceId"),
  paymentById: scopeChildSingleItem("invoice", "invoiceId"),
  quoteLineItem: scopeChildSingleItem("quote", "quoteId"),
  inventoryAdjustment: scopeChildSingleItem("product", "productId"),
  personExternalLink: scopeChildSingleItem("person", "personId"),
  productExternalLink: scopeChildSingleItem("product", "productId"),

  // Single-item queries (by Relay global ID)
  channelConnectionById: scopeSingleItem(),
  companyById: scopeSingleItem(),
  personById: scopeSingleItem(),
  productById: scopeSingleItem(),
  invoiceById: scopeSingleItem(),
  quoteById: scopeSingleItem(),
  companyMemberById: scopeChildSingleItem("company", "companyId"),
  invoiceLineItemById: scopeChildSingleItem("invoice", "invoiceId"),
  quoteLineItemById: scopeChildSingleItem("quote", "quoteId"),
  inventoryAdjustmentById: scopeChildSingleItem("product", "productId"),
  personExternalLinkById: scopeChildSingleItem("person", "personId"),
  productExternalLinkById: scopeChildSingleItem("product", "productId"),
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

type PgWhere = { where: (spec: unknown) => void };

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
