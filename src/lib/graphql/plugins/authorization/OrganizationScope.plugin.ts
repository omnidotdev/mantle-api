import { EXPORTABLE } from "graphile-export";
import { SafeError, context, sideEffect } from "postgraphile/grafast";
import { sql } from "postgraphile/pg-sql2";
import { wrapPlans } from "postgraphile/utils";

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
            return sql`(coalesce(current_setting('app.service_auth', true), '') = 'true' OR ${expression} = ANY(coalesce(current_setting('app.organization_ids', true)::text[], '{}')))`;
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
            return sql`(coalesce(current_setting('app.service_auth', true), '') = 'true' OR ${expression} IN (SELECT ${sql.identifier(parentPk)} FROM ${sql.identifier(parentTable)} WHERE organization_id = ANY(coalesce(current_setting('app.organization_ids', true)::text[], '{}'))))`;
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
            if (!item || !observer) return;

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
            if (!item || !observer) return;

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
const OrganizationScopePlugin = wrapPlans({
  Query: {
    // Collection queries - SQL-level WHERE organization_id filtering
    channelConnections: scopeCollection(),
    companies: scopeCollection(),
    people: scopeCollection(),
    products: scopeCollection(),
    invoices: scopeCollection(),
    quotes: scopeCollection(),
    suppliers: scopeCollection(),
    documentNumberingConfigs: scopeCollection(),
    organizationSettings: scopeCollection(),

    // Child table collections - scoped via parent FK joins
    companyMembers: scopeChildCollection("company", "company_id"),
    invoiceLineItems: scopeChildCollection("invoice", "invoice_id"),
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
    quote: scopeSingleItem(),
    supplier: scopeSingleItem(),
    documentNumberingConfig: scopeSingleItem(),
    organizationSetting: scopeSingleItem(),

    // Child table single-item queries - scoped via parent FK lookup
    companyMember: scopeChildSingleItem("company", "companyId"),
    invoiceLineItem: scopeChildSingleItem("invoice", "invoiceId"),
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
  },
});

export default OrganizationScopePlugin;
