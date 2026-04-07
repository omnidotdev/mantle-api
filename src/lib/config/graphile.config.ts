import { PgSimplifyInflectionPreset } from "@graphile/simplify-inflection";
import { makePgService } from "postgraphile/adaptors/pg";
import { PostGraphileAmberPreset } from "postgraphile/presets/amber";
import { PostGraphileConnectionFilterPreset } from "postgraphile-plugin-connection-filter";

import {
  CompanyMemberPlugin,
  InvoicePlugin,
  OrganizationScopePlugin,
  PersonPlugin,
} from "lib/graphql/plugins/authorization";
import { EventEmissionPlugin } from "lib/graphql/plugins/events";
import GenerateDocumentNumberPlugin from "lib/graphql/plugins/generateDocumentNumber.plugin";
import InvoicePdfPlugin from "lib/graphql/plugins/invoicePdf.plugin";
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
    CompanyMemberPlugin,
    InvoicePlugin,
    PersonPlugin,
    EventEmissionPlugin,
    GenerateDocumentNumberPlugin,
    InvoicePdfPlugin,
  ],
  schema: {
    defaultBehavior: "+manyRelation:resource:connection",
  },
};

export default graphilePreset;
