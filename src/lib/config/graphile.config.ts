import { PgSimplifyInflectionPreset } from "@graphile/simplify-inflection";
import { makePgService } from "postgraphile/adaptors/pg";
import { PostGraphileAmberPreset } from "postgraphile/presets/amber";
import { PostGraphileConnectionFilterPreset } from "postgraphile-plugin-connection-filter";

import ApplyInvoiceCreditPlugin from "lib/graphql/plugins/applyInvoiceCredit.plugin";
import {
  OrgMutationGuardPlugin,
  OrganizationScopeNestedPlugin,
  OrganizationScopePlugin,
  PlanLimitsPlugin,
  RemoveQueryNodePlugin,
} from "lib/graphql/plugins/authorization";
import ConvertQuoteToInvoicePlugin from "lib/graphql/plugins/convertQuoteToInvoice.plugin";
import { EventEmissionPlugin } from "lib/graphql/plugins/events";
import GenerateDocumentNumberPlugin from "lib/graphql/plugins/generateDocumentNumber.plugin";
import HideInternalDataPlugin from "lib/graphql/plugins/hideInternalData.plugin";
import InventoryAdjustmentPlugin from "lib/graphql/plugins/inventoryAdjustment.plugin";
import InvoicePdfPlugin from "lib/graphql/plugins/invoicePdf.plugin";
import IssueCreditPlugin from "lib/graphql/plugins/issueCredit.plugin";
import RecomputeInvoiceTotalsPlugin from "lib/graphql/plugins/recomputeInvoiceTotals.plugin";
import RecordOverpaymentCreditPlugin from "lib/graphql/plugins/recordOverpaymentCredit.plugin";
import ReleaseConvertedQuotePlugin from "lib/graphql/plugins/releaseConvertedQuote.plugin";
import ValidatePaymentLinkPlugin from "lib/graphql/plugins/validatePaymentLink.plugin";
import WorkspacePlanPlugin from "lib/graphql/plugins/workspacePlan.plugin";
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
    HideInternalDataPlugin,
    OrganizationScopePlugin,
    OrganizationScopeNestedPlugin,
    RemoveQueryNodePlugin,
    OrgMutationGuardPlugin,
    PlanLimitsPlugin,
    ValidatePaymentLinkPlugin,
    GenerateDocumentNumberPlugin,
    InvoicePdfPlugin,
    InventoryAdjustmentPlugin,
    RecomputeInvoiceTotalsPlugin,
    ReleaseConvertedQuotePlugin,
    RecordOverpaymentCreditPlugin,
    ApplyInvoiceCreditPlugin,
    IssueCreditPlugin,
    ConvertQuoteToInvoicePlugin,
    WorkspacePlanPlugin,
    // Last, so it wraps every other mutation plugin: events are emitted only
    // after all of their side effects succeed, with the final row state
    EventEmissionPlugin,
  ],
  schema: {
    // Relay node-id update/delete variants have no rowId for the mutation
    // guard to resolve; only the primary-key variants are exposed
    defaultBehavior:
      "+manyRelation:resource:connection -nodeId:resource:update -nodeId:resource:delete",
  },
};

export default graphilePreset;
