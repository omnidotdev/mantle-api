import { sql } from "drizzle-orm";
import { SafeError, context, sideEffect } from "postgraphile/grafast";
import { wrapPlans } from "postgraphile/utils";

import { assertWorkspaceAdmin, isDeniedByWarden } from "lib/authz";

import type { OrganizationClaim } from "lib/authz";
import type { PlanWrapperFn } from "postgraphile/utils";

/**
 * How a table reaches its owning organization: directly through its own
 * `organization_id`, or through a parent row
 */
type Ownership =
  | { kind: "org" }
  | { kind: "child"; parentTable: string; parentKey: string };

/** Owning organization of every generated-CRUD table */
export const TABLE_OWNERSHIP: Record<string, Ownership> = {
  channel_connection: { kind: "org" },
  company: { kind: "org" },
  credit_transaction: { kind: "org" },
  document_numbering_config: { kind: "org" },
  invoice: { kind: "org" },
  organization_settings: { kind: "org" },
  person: { kind: "org" },
  product: { kind: "org" },
  quote: { kind: "org" },
  supplier: { kind: "org" },
  company_member: {
    kind: "child",
    parentTable: "company",
    parentKey: "companyId",
  },
  inventory_adjustment: {
    kind: "child",
    parentTable: "product",
    parentKey: "productId",
  },
  invoice_line_item: {
    kind: "child",
    parentTable: "invoice",
    parentKey: "invoiceId",
  },
  payment: { kind: "child", parentTable: "invoice", parentKey: "invoiceId" },
  person_external_link: {
    kind: "child",
    parentTable: "person",
    parentKey: "personId",
  },
  product_external_link: {
    kind: "child",
    parentTable: "product",
    parentKey: "productId",
  },
  quote_line_item: {
    kind: "child",
    parentTable: "quote",
    parentKey: "quoteId",
  },
};

/**
 * Tables only a workspace owner or admin may write: workspace-wide settings and
 * sales channel connections. `channel_connection` reads are admin-only too
 * (OrganizationScopePlugin)
 */
const ADMIN_TABLES: ReadonlySet<string> = new Set([
  "channel_connection",
  "document_numbering_config",
  "organization_settings",
]);

/**
 * Input fields that point at another organization-owned row. Every one a
 * caller sets (on create or in a patch) must resolve to an organization the
 * caller belongs to, so a row can never be attached to another workspace's
 * company, invoice, product or contact
 */
const REFERENCES: Record<string, string> = {
  companyId: "company",
  contactId: "person",
  convertedInvoiceId: "invoice",
  invoiceId: "invoice",
  paymentId: "payment",
  personId: "person",
  productId: "product",
  quoteId: "quote",
  supplierId: "supplier",
};

type Db = {
  execute: (
    query: ReturnType<typeof sql>,
  ) => Promise<{ rows: Record<string, unknown>[] }>;
};

/**
 * Resolve the organization that owns `table` row `id`, following the parent
 * chain for child tables. Returns null when the row does not exist
 */
const orgOfRow = async (
  db: Db,
  table: string,
  id: string,
): Promise<string | null> => {
  const ownership = TABLE_OWNERSHIP[table];
  if (!ownership) return null;

  if (ownership.kind === "org") {
    const { rows } = await db.execute(
      sql`select organization_id from ${sql.identifier(table)} where id = ${id}`,
    );
    return (rows[0]?.organization_id as string | undefined) ?? null;
  }

  const parentColumn = ownership.parentKey.replace(
    /[A-Z]/g,
    (c) => `_${c.toLowerCase()}`,
  );
  const { rows } = await db.execute(
    sql`select ${sql.identifier(parentColumn)} as parent_id from ${sql.identifier(table)} where id = ${id}`,
  );
  const parentId = rows[0]?.parent_id as string | undefined;
  return parentId ? orgOfRow(db, ownership.parentTable, parentId) : null;
};

const denied = () => new SafeError("Not authorized for this workspace");

/**
 * Throw unless every organization the write touches is one of the caller's
 */
const authorizeWrite = async ({
  db,
  observer,
  organizationIds,
  organizations,
  table,
  op,
  input,
}: {
  db: Db;
  observer: unknown;
  organizationIds: unknown;
  organizations: unknown;
  table: string;
  op: "create" | "update" | "delete";
  input: Record<string, unknown> | null | undefined;
}): Promise<void> => {
  if (!observer) throw new SafeError("Unauthorized");

  const orgs = Array.isArray(organizationIds)
    ? (organizationIds as string[])
    : [];
  // Service key auth is trusted across organizations
  if (orgs.includes("*")) return;

  const ownership = TABLE_OWNERSHIP[table];
  if (!ownership || !input) throw denied();

  const member = (org: string | null | undefined) =>
    !!org && orgs.includes(org);
  // Every workspace this write touches, for the role and Warden checks below
  const touched = new Set<string>();

  // The row a create inserts, or the fields an update changes
  // A create's input holds the new row under one key named for the table
  // (singularized by the inflector, e.g. `organizationSetting` for
  // organization_settings), beside the optional clientMutationId
  const recordKey = Object.keys(input).find((k) => k !== "clientMutationId");
  const values =
    op === "create"
      ? ((recordKey
          ? (input[recordKey] as Record<string, unknown> | undefined)
          : undefined) ?? {})
      : ((input.patch as Record<string, unknown> | undefined) ?? {});

  if (op !== "create") {
    // Only the primary-key variants are allowed: the node-id and unique-key
    // variants have no rowId to resolve
    const rowId = input.rowId;
    if (typeof rowId !== "string") throw denied();
    const current = await orgOfRow(db, table, rowId);
    // A missing row falls through to the mutation's own not-found result
    if (current !== null && !member(current)) throw denied();
    if (current) touched.add(current);
  }

  if (ownership.kind === "org") {
    if (
      op === "create" &&
      !member(values.organizationId as string | undefined)
    ) {
      throw denied();
    }
    if (op === "update" && values.organizationId !== undefined) {
      if (!member(values.organizationId as string)) throw denied();
    }
    if (typeof values.organizationId === "string")
      touched.add(values.organizationId);
  } else if (
    op === "create" &&
    typeof values[ownership.parentKey] !== "string"
  ) {
    throw denied();
  }

  for (const [key, refTable] of Object.entries(REFERENCES)) {
    const ref = values[key];
    if (typeof ref !== "string") continue;
    const refOrg = await orgOfRow(db, refTable, ref);
    if (!member(refOrg)) throw denied();
    if (refOrg) touched.add(refOrg);
  }

  const claims = {
    observer: observer as { id?: string },
    organizationIds: orgs,
    organizations: (organizations ?? []) as OrganizationClaim[],
  };
  const userId = (observer as { id?: string } | null)?.id;

  for (const org of touched) {
    if (ADMIN_TABLES.has(table)) {
      await assertWorkspaceAdmin(claims, org);
    } else if (
      await isDeniedByWarden({
        userId,
        organizationId: org,
        relation: "member",
      })
    ) {
      throw denied();
    }
  }
};

/**
 * Authorize every generated create, update and delete mutation.
 *
 * Only createInvoice, createPerson and createCompanyMember carried checks, and
 * those checked plan limits, not membership; the API runs in resolve-only mode,
 * so every other generated mutation (payments, suppliers, credit transactions,
 * quotes, organization settings) was callable anonymously against any
 * workspace's rows. This wraps all of them, matched by the generated-mutation
 * scope rather than by name, so a new table is guarded (or denied, until it is
 * added to TABLE_OWNERSHIP) automatically
 */
const OrgMutationGuardPlugin = wrapPlans<PlanWrapperFn>(
  (ctx) => {
    if (ctx.Self.name !== "Mutation") return null;

    const scope = ctx.scope as {
      isPgCreateMutation?: boolean;
      isPgUpdateMutation?: boolean;
      isPgDeleteMutation?: boolean;
      pgResource?: { name?: string };
      pgFieldResource?: { name?: string };
    };
    const op = scope.isPgCreateMutation
      ? "create"
      : scope.isPgUpdateMutation
        ? "update"
        : scope.isPgDeleteMutation
          ? "delete"
          : null;
    if (!op) return null;

    const table = scope.pgResource?.name ?? scope.pgFieldResource?.name ?? "";

    return (plan, _, fieldArgs) => {
      const $input = fieldArgs.getRaw("input");
      const $observer = context().get("observer");
      const $organizationIds = context().get("organizationIds");
      const $organizations = context().get("organizations");
      const $db = context().get("db");

      sideEffect(
        [$input, $observer, $organizationIds, $organizations, $db],
        ([input, observer, organizationIds, organizations, db]) =>
          authorizeWrite({
            db: db as Db,
            observer,
            organizationIds,
            organizations,
            table,
            op,
            input: input as Record<string, unknown> | null,
          }),
      );

      return plan();
    };
  },
  (wrapper) => wrapper,
  { name: "OrgMutationGuardPlugin" },
);

export default OrgMutationGuardPlugin;
