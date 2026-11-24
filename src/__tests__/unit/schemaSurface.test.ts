import { describe, expect, test } from "bun:test";
import { join } from "node:path";

import {
  assertSchemaSurface,
  findTableReadFields,
  listRootFields,
  loadSchema,
} from "@omnidotdev/providers/graphql-surface";

import { ORG_SCOPED_QUERY_FIELDS } from "lib/graphql/plugins/authorization/OrganizationScope.plugin";

import type { SchemaSurfacePolicy } from "@omnidotdev/providers/graphql-surface";

/**
 * Reviewed GraphQL surface.
 *
 * Table reads are filtered by OrganizationScopePlugin (root) and
 * OrganizationScopeNestedPlugin (relations). Every generated create, update and
 * delete goes through OrgMutationGuardPlugin, matched by the generated-mutation
 * scope: the caller must belong to the row's workspace, to the workspace it
 * creates into or moves to, and to every row it references. The Relay node-id
 * variants and root `node` are removed. A new root field fails here until it
 * is reviewed
 */
const schema = loadSchema(
  join(import.meta.dir, "../../generated/graphql/schema.graphql"),
);
const { Query, Mutation } = listRootFields(schema);

const POLICY: SchemaSurfacePolicy = {
  Query: {
    ...Object.fromEntries(
      Query.filter((field) => ORG_SCOPED_QUERY_FIELDS.has(field)).map(
        (field) => [field, "caller's workspaces via OrganizationScopePlugin"],
      ),
    ),
    id: "Relay node id of the root query (no data)",
    mantleCallingCode: "pure function over its arguments (no data)",
    mantleRegionFromCountry: "pure function over its arguments (no data)",
    mantleNormalizePhone: "pure function over its arguments (no data)",
    invoiceHtml: "invoice's workspace membership (invoicePdf plugin)",
    workspacePlan: "member of the workspace (assertWorkspaceAccess)",
  },
  Mutation: {
    ...Object.fromEntries(
      Mutation.filter((field) => /^(create|update|delete)[A-Z]/.test(field)).map(
        (field) => [field, "workspace membership via OrgMutationGuardPlugin"],
      ),
    ),
    issueCredit: "member of the credited workspace (assertWorkspaceAccess)",
    applyInvoiceCredit: "member of the invoice's workspace",
    generateDocumentNumber: "member of the workspace",
  },
};

describe("GraphQL schema surface", () => {
  test("matches the reviewed policy", () => {
    assertSchemaSurface(schema, POLICY);
  });

  test("every table read is workspace scoped", () => {
    const reads = findTableReadFields(schema);
    expect(reads.length).toBeGreaterThan(0);
    for (const field of reads) expect(ORG_SCOPED_QUERY_FIELDS).toContain(field);
  });

  test("no node-id write variants or root node lookup", () => {
    expect(Query).not.toContain("node");
    expect(Mutation.filter((field) => field.endsWith("ById"))).toEqual([]);
  });
});
