import { PgSimplifyInflectionPreset } from "@graphile/simplify-inflection";
import { makePgService } from "postgraphile/adaptors/pg";
import { PostGraphileAmberPreset } from "postgraphile/presets/amber";
import { PostGraphileConnectionFilterPreset } from "postgraphile-plugin-connection-filter";

import ApplyInvoiceCreditPlugin from "lib/graphql/plugins/applyInvoiceCredit.plugin";
import {
  CompanyMemberPlugin,
  InvoicePlugin,
  OrgMutationGuardPlugin,
  OrganizationScopeNestedPlugin,
  OrganizationScopePlugin,
  PersonPlugin,
  RemoveQueryNodePlugin,
} from "lib/graphql/plugins/authorization";
import { EventEmissionPlugin } from "lib/graphql/plugins/events";
import GenerateDocumentNumberPlugin from "lib/graphql/plugins/generateDocumentNumber.plugin";
import InvoicePdfPlugin from "lib/graphql/plugins/invoicePdf.plugin";
import IssueCreditPlugin from "lib/graphql/plugins/issueCredit.plugin";
import RecomputeInvoiceTotalsPlugin from "lib/graphql/plugins/recomputeInvoiceTotals.plugin";
import RecordOverpaymentCreditPlugin from "lib/graphql/plugins/recordOverpaymentCredit.plugin";
import { DATABASE_URL, isDevEnv } from "./env.config";

/**
 * Graphile preset for Mantle.
 */
const graphilePreset: GraphileConfig.Preset = {
  extends: [
    PostGraphileAmberPreset,
    PgSimplifyInflectionPreset,
    PostGraphileConnectionFilterPreset,
  ],
  pgServices: [makePgService({ connectionString: DATABASE_URL })],
  grafast: { explain: isDevEnv },
  plugins: [
    OrganizationScopePlugin,
    OrganizationScopeNestedPlugin,
    RemoveQueryNodePlugin,
    OrgMutationGuardPlugin,
    CompanyMemberPlugin,
    InvoicePlugin,
    PersonPlugin,
    EventEmissionPlugin,
    GenerateDocumentNumberPlugin,
    InvoicePdfPlugin,
    RecomputeInvoiceTotalsPlugin,
    RecordOverpaymentCreditPlugin,
    ApplyInvoiceCreditPlugin,
    IssueCreditPlugin,
  ],
  schema: {
    // Relay node-id update/delete variants have no rowId for the mutation
    // guard to resolve; only the primary-key variants are exposed
    defaultBehavior:
      "+manyRelation:resource:connection -nodeId:resource:update -nodeId:resource:delete",
  },
};

export default graphilePreset;
