// @ts-nocheck
/* eslint-disable */
import { PgCondition, PgDeleteSingleStep, PgExecutor, TYPES, assertPgClassSingleStep, listOfCodec, makeRegistry, pgDeleteSingle, pgInsertSingle, pgSelectFromRecord, pgUpdateSingle, recordCodec, sqlValueWithCodec } from "@dataplan/pg";
import { ConnectionStep, EdgeStep, ExecutableStep, ObjectStep, __ValueStep, access, assertExecutableStep, bakedInputRuntime, connection, constant, context, createObjectAndApplyChildren, first, get as get2, inhibitOnNull, inspect, isExecutableStep, lambda, list, makeDecodeNodeId, makeGrafastSchema, object, rootValue, sideEffect, specFromNodeId } from "grafast";
import { GraphQLError, Kind } from "graphql";
import { sql } from "pg-sql2";
const nodeIdHandler_Query = {
  typeName: "Query",
  codec: {
    name: "raw",
    encode: Object.assign(function rawEncode(value) {
      return typeof value === "string" ? value : null;
    }, {
      isSyncAndSafe: true
    }),
    decode: Object.assign(function rawDecode(value) {
      return typeof value === "string" ? value : null;
    }, {
      isSyncAndSafe: true
    })
  },
  match(specifier) {
    return specifier === "query";
  },
  getIdentifiers(_value) {
    return [];
  },
  getSpec() {
    return "irrelevant";
  },
  get() {
    return rootValue();
  },
  plan() {
    return constant`query`;
  }
};
const nodeIdCodecs_base64JSON_base64JSON = {
  name: "base64JSON",
  encode: (() => {
    function base64JSONEncode(value) {
      return Buffer.from(JSON.stringify(value), "utf8").toString("base64");
    }
    base64JSONEncode.isSyncAndSafe = !0;
    return base64JSONEncode;
  })(),
  decode: (() => {
    function base64JSONDecode(value) {
      return JSON.parse(Buffer.from(value, "base64").toString("utf8"));
    }
    base64JSONDecode.isSyncAndSafe = !0;
    return base64JSONDecode;
  })()
};
const nodeIdCodecs = {
  __proto__: null,
  raw: nodeIdHandler_Query.codec,
  base64JSON: nodeIdCodecs_base64JSON_base64JSON,
  pipeString: {
    name: "pipeString",
    encode: Object.assign(function pipeStringEncode(value) {
      return Array.isArray(value) ? value.join("|") : null;
    }, {
      isSyncAndSafe: true
    }),
    decode: Object.assign(function pipeStringDecode(value) {
      return typeof value === "string" ? value.split("|") : null;
    }, {
      isSyncAndSafe: true
    })
  }
};
const executor = new PgExecutor({
  name: "main",
  context() {
    const ctx = context();
    return object({
      pgSettings: "pgSettings" != null ? ctx.get("pgSettings") : constant(null),
      withPgClient: ctx.get("withPgClient")
    });
  }
});
const companyMemberIdentifier = sql.identifier("public", "company_member");
const spec_companyMember = {
  name: "companyMember",
  identifier: companyMemberIdentifier,
  attributes: {
    __proto__: null,
    id: {
      description: undefined,
      codec: TYPES.uuid,
      notNull: true,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true
      }
    },
    company_id: {
      description: undefined,
      codec: TYPES.uuid,
      notNull: true,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true
      }
    },
    person_id: {
      description: undefined,
      codec: TYPES.uuid,
      notNull: true,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true
      }
    },
    title: {
      description: undefined,
      codec: TYPES.text,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    is_primary: {
      description: undefined,
      codec: TYPES.boolean,
      notNull: false,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    created_at: {
      description: undefined,
      codec: TYPES.timestamptz,
      notNull: false,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    }
  },
  description: undefined,
  extensions: {
    oid: "453507",
    isTableLike: true,
    pg: {
      serviceName: "main",
      schemaName: "public",
      name: "company_member"
    },
    tags: {
      __proto__: null
    }
  },
  executor: executor
};
const companyMemberCodec = recordCodec(spec_companyMember);
const inventoryAdjustmentIdentifier = sql.identifier("public", "inventory_adjustment");
const spec_inventoryAdjustment = {
  name: "inventoryAdjustment",
  identifier: inventoryAdjustmentIdentifier,
  attributes: {
    __proto__: null,
    id: {
      description: undefined,
      codec: TYPES.uuid,
      notNull: true,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true
      }
    },
    product_id: {
      description: undefined,
      codec: TYPES.uuid,
      notNull: true,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true
      }
    },
    quantity_change: {
      description: undefined,
      codec: TYPES.int,
      notNull: true,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    reason: {
      description: undefined,
      codec: TYPES.text,
      notNull: true,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    reference_id: {
      description: undefined,
      codec: TYPES.uuid,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    created_at: {
      description: undefined,
      codec: TYPES.timestamptz,
      notNull: false,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    }
  },
  description: undefined,
  extensions: {
    oid: "453520",
    isTableLike: true,
    pg: {
      serviceName: "main",
      schemaName: "public",
      name: "inventory_adjustment"
    },
    tags: {
      __proto__: null
    }
  },
  executor: executor
};
const inventoryAdjustmentCodec = recordCodec(spec_inventoryAdjustment);
const invoiceLineItemIdentifier = sql.identifier("public", "invoice_line_item");
const spec_invoiceLineItem = {
  name: "invoiceLineItem",
  identifier: invoiceLineItemIdentifier,
  attributes: {
    __proto__: null,
    id: {
      description: undefined,
      codec: TYPES.uuid,
      notNull: true,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true
      }
    },
    invoice_id: {
      description: undefined,
      codec: TYPES.uuid,
      notNull: true,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true
      }
    },
    product_id: {
      description: undefined,
      codec: TYPES.uuid,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    description: {
      description: undefined,
      codec: TYPES.text,
      notNull: true,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    quantity: {
      description: undefined,
      codec: TYPES.numeric,
      notNull: true,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    unit_price: {
      description: undefined,
      codec: TYPES.numeric,
      notNull: true,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    amount: {
      description: undefined,
      codec: TYPES.numeric,
      notNull: true,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    sort_order: {
      description: undefined,
      codec: TYPES.int,
      notNull: false,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    }
  },
  description: undefined,
  extensions: {
    oid: "453555",
    isTableLike: true,
    pg: {
      serviceName: "main",
      schemaName: "public",
      name: "invoice_line_item"
    },
    tags: {
      __proto__: null
    }
  },
  executor: executor
};
const invoiceLineItemCodec = recordCodec(spec_invoiceLineItem);
const organizationSettingsIdentifier = sql.identifier("public", "organization_settings");
const spec_organizationSettings = {
  name: "organizationSettings",
  identifier: organizationSettingsIdentifier,
  attributes: {
    __proto__: null,
    id: {
      description: undefined,
      codec: TYPES.uuid,
      notNull: true,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true
      }
    },
    organization_id: {
      description: undefined,
      codec: TYPES.text,
      notNull: true,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true
      }
    },
    accent_color: {
      description: undefined,
      codec: TYPES.varchar,
      notNull: false,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    created_at: {
      description: undefined,
      codec: TYPES.timestamptz,
      notNull: false,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    updated_at: {
      description: undefined,
      codec: TYPES.timestamptz,
      notNull: false,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    }
  },
  description: undefined,
  extensions: {
    oid: "504326",
    isTableLike: true,
    pg: {
      serviceName: "main",
      schemaName: "public",
      name: "organization_settings"
    },
    tags: {
      __proto__: null
    }
  },
  executor: executor
};
const organizationSettingsCodec = recordCodec(spec_organizationSettings);
const productIdentifier = sql.identifier("public", "product");
const spec_product = {
  name: "product",
  identifier: productIdentifier,
  attributes: {
    __proto__: null,
    id: {
      description: undefined,
      codec: TYPES.uuid,
      notNull: true,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true
      }
    },
    organization_id: {
      description: undefined,
      codec: TYPES.text,
      notNull: true,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true
      }
    },
    name: {
      description: undefined,
      codec: TYPES.text,
      notNull: true,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    description: {
      description: undefined,
      codec: TYPES.text,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    sku: {
      description: undefined,
      codec: TYPES.text,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true
      }
    },
    unit_price: {
      description: undefined,
      codec: TYPES.numeric,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    current_quantity: {
      description: undefined,
      codec: TYPES.int,
      notNull: false,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    low_stock_threshold: {
      description: undefined,
      codec: TYPES.int,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    is_active: {
      description: undefined,
      codec: TYPES.boolean,
      notNull: false,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    created_at: {
      description: undefined,
      codec: TYPES.timestamptz,
      notNull: false,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    updated_at: {
      description: undefined,
      codec: TYPES.timestamptz,
      notNull: false,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    }
  },
  description: undefined,
  extensions: {
    oid: "453584",
    isTableLike: true,
    pg: {
      serviceName: "main",
      schemaName: "public",
      name: "product"
    },
    tags: {
      __proto__: null
    }
  },
  executor: executor
};
const productCodec = recordCodec(spec_product);
const documentNumberingConfigIdentifier = sql.identifier("public", "document_numbering_config");
const spec_documentNumberingConfig = {
  name: "documentNumberingConfig",
  identifier: documentNumberingConfigIdentifier,
  attributes: {
    __proto__: null,
    id: {
      description: undefined,
      codec: TYPES.uuid,
      notNull: true,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true
      }
    },
    organization_id: {
      description: undefined,
      codec: TYPES.text,
      notNull: true,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true
      }
    },
    document_type: {
      description: undefined,
      codec: TYPES.text,
      notNull: true,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true
      }
    },
    prefix: {
      description: undefined,
      codec: TYPES.text,
      notNull: true,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    separator: {
      description: undefined,
      codec: TYPES.varchar,
      notNull: true,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    date_format: {
      description: undefined,
      codec: TYPES.text,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    id_strategy: {
      description: undefined,
      codec: TYPES.varchar,
      notNull: true,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    sequential_padding: {
      description: undefined,
      codec: TYPES.int,
      notNull: true,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    random_length: {
      description: undefined,
      codec: TYPES.int,
      notNull: true,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    next_sequential_number: {
      description: undefined,
      codec: TYPES.int,
      notNull: true,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    created_at: {
      description: undefined,
      codec: TYPES.timestamptz,
      notNull: false,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    updated_at: {
      description: undefined,
      codec: TYPES.timestamptz,
      notNull: false,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    }
  },
  description: undefined,
  extensions: {
    oid: "504298",
    isTableLike: true,
    pg: {
      serviceName: "main",
      schemaName: "public",
      name: "document_numbering_config"
    },
    tags: {
      __proto__: null
    }
  },
  executor: executor
};
const documentNumberingConfigCodec = recordCodec(spec_documentNumberingConfig);
const personIdentifier = sql.identifier("public", "person");
const pgCatalogTextArrayCodec = listOfCodec(TYPES.text, {
  extensions: {
    oid: "1009",
    pg: {
      serviceName: "main",
      schemaName: "pg_catalog",
      name: "_text"
    },
    tags: {
      __proto__: null
    }
  },
  typeDelim: ",",
  description: undefined,
  name: "pgCatalogTextArray"
});
const spec_person = {
  name: "person",
  identifier: personIdentifier,
  attributes: {
    __proto__: null,
    id: {
      description: undefined,
      codec: TYPES.uuid,
      notNull: true,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true
      }
    },
    organization_id: {
      description: undefined,
      codec: TYPES.text,
      notNull: true,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true
      }
    },
    first_name: {
      description: undefined,
      codec: TYPES.text,
      notNull: true,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    last_name: {
      description: undefined,
      codec: TYPES.text,
      notNull: true,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    phone: {
      description: undefined,
      codec: TYPES.text,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    avatar_url: {
      description: undefined,
      codec: TYPES.text,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    tags: {
      description: undefined,
      codec: pgCatalogTextArrayCodec,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    notes: {
      description: undefined,
      codec: TYPES.text,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    created_at: {
      description: undefined,
      codec: TYPES.timestamptz,
      notNull: false,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    updated_at: {
      description: undefined,
      codec: TYPES.timestamptz,
      notNull: false,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    emails: {
      description: undefined,
      codec: pgCatalogTextArrayCodec,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true
      }
    },
    internal: {
      description: undefined,
      codec: TYPES.boolean,
      notNull: true,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    }
  },
  description: undefined,
  extensions: {
    oid: "453570",
    isTableLike: true,
    pg: {
      serviceName: "main",
      schemaName: "public",
      name: "person"
    },
    tags: {
      __proto__: null
    }
  },
  executor: executor
};
const personCodec = recordCodec(spec_person);
const companyIdentifier = sql.identifier("public", "company");
const spec_company = {
  name: "company",
  identifier: companyIdentifier,
  attributes: {
    __proto__: null,
    id: {
      description: undefined,
      codec: TYPES.uuid,
      notNull: true,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true
      }
    },
    organization_id: {
      description: undefined,
      codec: TYPES.text,
      notNull: true,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true
      }
    },
    name: {
      description: undefined,
      codec: TYPES.text,
      notNull: true,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    website: {
      description: undefined,
      codec: TYPES.text,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    industry: {
      description: undefined,
      codec: TYPES.text,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    phone: {
      description: undefined,
      codec: TYPES.text,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    email: {
      description: undefined,
      codec: TYPES.text,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    address_line_1: {
      description: undefined,
      codec: TYPES.text,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    address_line_2: {
      description: undefined,
      codec: TYPES.text,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    city: {
      description: undefined,
      codec: TYPES.text,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    state: {
      description: undefined,
      codec: TYPES.text,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    postal_code: {
      description: undefined,
      codec: TYPES.text,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    country: {
      description: undefined,
      codec: TYPES.text,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    notes: {
      description: undefined,
      codec: TYPES.text,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    created_at: {
      description: undefined,
      codec: TYPES.timestamptz,
      notNull: false,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    updated_at: {
      description: undefined,
      codec: TYPES.timestamptz,
      notNull: false,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    }
  },
  description: undefined,
  extensions: {
    oid: "453494",
    isTableLike: true,
    pg: {
      serviceName: "main",
      schemaName: "public",
      name: "company"
    },
    tags: {
      __proto__: null
    }
  },
  executor: executor
};
const companyCodec = recordCodec(spec_company);
const quoteLineItemIdentifier = sql.identifier("public", "quote_line_item");
const spec_quoteLineItem = {
  name: "quoteLineItem",
  identifier: quoteLineItemIdentifier,
  attributes: {
    __proto__: null,
    id: {
      description: undefined,
      codec: TYPES.uuid,
      notNull: true,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true
      }
    },
    quote_id: {
      description: undefined,
      codec: TYPES.uuid,
      notNull: true,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true
      }
    },
    product_id: {
      description: undefined,
      codec: TYPES.uuid,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    description: {
      description: undefined,
      codec: TYPES.text,
      notNull: true,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    quantity: {
      description: undefined,
      codec: TYPES.numeric,
      notNull: true,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    unit_price: {
      description: undefined,
      codec: TYPES.numeric,
      notNull: true,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    amount: {
      description: undefined,
      codec: TYPES.numeric,
      notNull: true,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    pricing_type: {
      description: undefined,
      codec: TYPES.varchar,
      notNull: true,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    estimated_hours: {
      description: undefined,
      codec: TYPES.numeric,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    royalty_percentage: {
      description: undefined,
      codec: TYPES.numeric,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    sort_order: {
      description: undefined,
      codec: TYPES.int,
      notNull: false,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    hourly_rate: {
      description: undefined,
      codec: TYPES.numeric,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    weekly_cap_hours: {
      description: undefined,
      codec: TYPES.int,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    monthly_cap_hours: {
      description: undefined,
      codec: TYPES.int,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    max_cap_hours: {
      description: undefined,
      codec: TYPES.int,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    royalty_timeframe: {
      description: undefined,
      codec: TYPES.int,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    royalty_timeframe_unit: {
      description: undefined,
      codec: TYPES.varchar,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    royalty_threshold: {
      description: undefined,
      codec: TYPES.numeric,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    royalty_buyout_amount: {
      description: undefined,
      codec: TYPES.numeric,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    subtitle: {
      description: undefined,
      codec: TYPES.text,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    minimum_billing_minutes: {
      description: undefined,
      codec: TYPES.int,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    }
  },
  description: undefined,
  extensions: {
    oid: "453621",
    isTableLike: true,
    pg: {
      serviceName: "main",
      schemaName: "public",
      name: "quote_line_item"
    },
    tags: {
      __proto__: null
    }
  },
  executor: executor
};
const quoteLineItemCodec = recordCodec(spec_quoteLineItem);
const invoiceIdentifier = sql.identifier("public", "invoice");
const spec_invoice = {
  name: "invoice",
  identifier: invoiceIdentifier,
  attributes: {
    __proto__: null,
    id: {
      description: undefined,
      codec: TYPES.uuid,
      notNull: true,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true
      }
    },
    organization_id: {
      description: undefined,
      codec: TYPES.text,
      notNull: true,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true
      }
    },
    invoice_number: {
      description: undefined,
      codec: TYPES.text,
      notNull: true,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true
      }
    },
    company_id: {
      description: undefined,
      codec: TYPES.uuid,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true
      }
    },
    contact_id: {
      description: undefined,
      codec: TYPES.uuid,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    status: {
      description: undefined,
      codec: TYPES.varchar,
      notNull: true,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true
      }
    },
    issue_date: {
      description: undefined,
      codec: TYPES.date,
      notNull: true,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    due_date: {
      description: undefined,
      codec: TYPES.date,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    notes: {
      description: undefined,
      codec: TYPES.text,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    subtotal: {
      description: undefined,
      codec: TYPES.numeric,
      notNull: false,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    tax_rate: {
      description: undefined,
      codec: TYPES.numeric,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    tax_amount: {
      description: undefined,
      codec: TYPES.numeric,
      notNull: false,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    total: {
      description: undefined,
      codec: TYPES.numeric,
      notNull: false,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    currency: {
      description: undefined,
      codec: TYPES.varchar,
      notNull: false,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    paid_at: {
      description: undefined,
      codec: TYPES.timestamptz,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    payment_reference: {
      description: undefined,
      codec: TYPES.text,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    payment_link_url: {
      description: undefined,
      codec: TYPES.text,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    created_at: {
      description: undefined,
      codec: TYPES.timestamptz,
      notNull: false,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    updated_at: {
      description: undefined,
      codec: TYPES.timestamptz,
      notNull: false,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    bill_to: {
      description: undefined,
      codec: TYPES.text,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    }
  },
  description: undefined,
  extensions: {
    oid: "453533",
    isTableLike: true,
    pg: {
      serviceName: "main",
      schemaName: "public",
      name: "invoice"
    },
    tags: {
      __proto__: null
    }
  },
  executor: executor
};
const invoiceCodec = recordCodec(spec_invoice);
const quoteIdentifier = sql.identifier("public", "quote");
const spec_quote = {
  name: "quote",
  identifier: quoteIdentifier,
  attributes: {
    __proto__: null,
    id: {
      description: undefined,
      codec: TYPES.uuid,
      notNull: true,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true
      }
    },
    organization_id: {
      description: undefined,
      codec: TYPES.text,
      notNull: true,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true
      }
    },
    quote_number: {
      description: undefined,
      codec: TYPES.text,
      notNull: true,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true
      }
    },
    company_id: {
      description: undefined,
      codec: TYPES.uuid,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true
      }
    },
    contact_id: {
      description: undefined,
      codec: TYPES.uuid,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    title: {
      description: undefined,
      codec: TYPES.text,
      notNull: true,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    description: {
      description: undefined,
      codec: TYPES.text,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    status: {
      description: undefined,
      codec: TYPES.varchar,
      notNull: true,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true
      }
    },
    valid_until: {
      description: undefined,
      codec: TYPES.date,
      notNull: true,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    terms: {
      description: undefined,
      codec: TYPES.text,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    notes: {
      description: undefined,
      codec: TYPES.text,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    subtotal: {
      description: undefined,
      codec: TYPES.numeric,
      notNull: false,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    tax_rate: {
      description: undefined,
      codec: TYPES.numeric,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    tax_amount: {
      description: undefined,
      codec: TYPES.numeric,
      notNull: false,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    total: {
      description: undefined,
      codec: TYPES.numeric,
      notNull: false,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    currency: {
      description: undefined,
      codec: TYPES.varchar,
      notNull: false,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    converted_invoice_id: {
      description: undefined,
      codec: TYPES.uuid,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    created_at: {
      description: undefined,
      codec: TYPES.timestamptz,
      notNull: false,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    updated_at: {
      description: undefined,
      codec: TYPES.timestamptz,
      notNull: false,
      hasDefault: true,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    project_type: {
      description: undefined,
      codec: TYPES.text,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    time_range: {
      description: undefined,
      codec: TYPES.text,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    additional_terms: {
      description: undefined,
      codec: pgCatalogTextArrayCodec,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    client_name: {
      description: undefined,
      codec: TYPES.text,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    client_email: {
      description: undefined,
      codec: TYPES.text,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    },
    additional_items_label: {
      description: undefined,
      codec: TYPES.text,
      notNull: false,
      hasDefault: false,
      extensions: {
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        isIndexed: false
      }
    }
  },
  description: undefined,
  extensions: {
    oid: "453599",
    isTableLike: true,
    pg: {
      serviceName: "main",
      schemaName: "public",
      name: "quote"
    },
    tags: {
      __proto__: null
    }
  },
  executor: executor
};
const quoteCodec = recordCodec(spec_quote);
const company_memberUniques = [{
  isPrimary: true,
  attributes: ["id"],
  description: undefined,
  extensions: {
    tags: {
      __proto__: null
    }
  }
}];
const registryConfig_pgResources_company_member_company_member = {
  executor: executor,
  name: "company_member",
  identifier: "main.public.company_member",
  from: companyMemberIdentifier,
  codec: companyMemberCodec,
  uniques: company_memberUniques,
  isVirtual: false,
  description: undefined,
  extensions: {
    description: undefined,
    pg: {
      serviceName: "main",
      schemaName: "public",
      name: "company_member"
    },
    isInsertable: true,
    isUpdatable: true,
    isDeletable: true,
    tags: {},
    canSelect: true,
    canInsert: true,
    canUpdate: true,
    canDelete: true
  }
};
const inventory_adjustmentUniques = [{
  isPrimary: true,
  attributes: ["id"],
  description: undefined,
  extensions: {
    tags: {
      __proto__: null
    }
  }
}];
const registryConfig_pgResources_inventory_adjustment_inventory_adjustment = {
  executor: executor,
  name: "inventory_adjustment",
  identifier: "main.public.inventory_adjustment",
  from: inventoryAdjustmentIdentifier,
  codec: inventoryAdjustmentCodec,
  uniques: inventory_adjustmentUniques,
  isVirtual: false,
  description: undefined,
  extensions: {
    description: undefined,
    pg: {
      serviceName: "main",
      schemaName: "public",
      name: "inventory_adjustment"
    },
    isInsertable: true,
    isUpdatable: true,
    isDeletable: true,
    tags: {},
    canSelect: true,
    canInsert: true,
    canUpdate: true,
    canDelete: true
  }
};
const invoice_line_itemUniques = [{
  isPrimary: true,
  attributes: ["id"],
  description: undefined,
  extensions: {
    tags: {
      __proto__: null
    }
  }
}];
const registryConfig_pgResources_invoice_line_item_invoice_line_item = {
  executor: executor,
  name: "invoice_line_item",
  identifier: "main.public.invoice_line_item",
  from: invoiceLineItemIdentifier,
  codec: invoiceLineItemCodec,
  uniques: invoice_line_itemUniques,
  isVirtual: false,
  description: undefined,
  extensions: {
    description: undefined,
    pg: {
      serviceName: "main",
      schemaName: "public",
      name: "invoice_line_item"
    },
    isInsertable: true,
    isUpdatable: true,
    isDeletable: true,
    tags: {},
    canSelect: true,
    canInsert: true,
    canUpdate: true,
    canDelete: true
  }
};
const organization_settingsUniques = [{
  isPrimary: true,
  attributes: ["id"],
  description: undefined,
  extensions: {
    tags: {
      __proto__: null
    }
  }
}];
const productUniques = [{
  isPrimary: true,
  attributes: ["id"],
  description: undefined,
  extensions: {
    tags: {
      __proto__: null
    }
  }
}];
const registryConfig_pgResources_product_product = {
  executor: executor,
  name: "product",
  identifier: "main.public.product",
  from: productIdentifier,
  codec: productCodec,
  uniques: productUniques,
  isVirtual: false,
  description: undefined,
  extensions: {
    description: undefined,
    pg: {
      serviceName: "main",
      schemaName: "public",
      name: "product"
    },
    isInsertable: true,
    isUpdatable: true,
    isDeletable: true,
    tags: {},
    canSelect: true,
    canInsert: true,
    canUpdate: true,
    canDelete: true
  }
};
const document_numbering_configUniques = [{
  isPrimary: true,
  attributes: ["id"],
  description: undefined,
  extensions: {
    tags: {
      __proto__: null
    }
  }
}];
const personUniques = [{
  isPrimary: true,
  attributes: ["id"],
  description: undefined,
  extensions: {
    tags: {
      __proto__: null
    }
  }
}];
const registryConfig_pgResources_person_person = {
  executor: executor,
  name: "person",
  identifier: "main.public.person",
  from: personIdentifier,
  codec: personCodec,
  uniques: personUniques,
  isVirtual: false,
  description: undefined,
  extensions: {
    description: undefined,
    pg: {
      serviceName: "main",
      schemaName: "public",
      name: "person"
    },
    isInsertable: true,
    isUpdatable: true,
    isDeletable: true,
    tags: {},
    canSelect: true,
    canInsert: true,
    canUpdate: true,
    canDelete: true
  }
};
const companyUniques = [{
  isPrimary: true,
  attributes: ["id"],
  description: undefined,
  extensions: {
    tags: {
      __proto__: null
    }
  }
}];
const registryConfig_pgResources_company_company = {
  executor: executor,
  name: "company",
  identifier: "main.public.company",
  from: companyIdentifier,
  codec: companyCodec,
  uniques: companyUniques,
  isVirtual: false,
  description: undefined,
  extensions: {
    description: undefined,
    pg: {
      serviceName: "main",
      schemaName: "public",
      name: "company"
    },
    isInsertable: true,
    isUpdatable: true,
    isDeletable: true,
    tags: {},
    canSelect: true,
    canInsert: true,
    canUpdate: true,
    canDelete: true
  }
};
const quote_line_itemUniques = [{
  isPrimary: true,
  attributes: ["id"],
  description: undefined,
  extensions: {
    tags: {
      __proto__: null
    }
  }
}];
const registryConfig_pgResources_quote_line_item_quote_line_item = {
  executor: executor,
  name: "quote_line_item",
  identifier: "main.public.quote_line_item",
  from: quoteLineItemIdentifier,
  codec: quoteLineItemCodec,
  uniques: quote_line_itemUniques,
  isVirtual: false,
  description: undefined,
  extensions: {
    description: undefined,
    pg: {
      serviceName: "main",
      schemaName: "public",
      name: "quote_line_item"
    },
    isInsertable: true,
    isUpdatable: true,
    isDeletable: true,
    tags: {},
    canSelect: true,
    canInsert: true,
    canUpdate: true,
    canDelete: true
  }
};
const invoiceUniques = [{
  isPrimary: true,
  attributes: ["id"],
  description: undefined,
  extensions: {
    tags: {
      __proto__: null
    }
  }
}];
const registryConfig_pgResources_invoice_invoice = {
  executor: executor,
  name: "invoice",
  identifier: "main.public.invoice",
  from: invoiceIdentifier,
  codec: invoiceCodec,
  uniques: invoiceUniques,
  isVirtual: false,
  description: undefined,
  extensions: {
    description: undefined,
    pg: {
      serviceName: "main",
      schemaName: "public",
      name: "invoice"
    },
    isInsertable: true,
    isUpdatable: true,
    isDeletable: true,
    tags: {},
    canSelect: true,
    canInsert: true,
    canUpdate: true,
    canDelete: true
  }
};
const quoteUniques = [{
  isPrimary: true,
  attributes: ["id"],
  description: undefined,
  extensions: {
    tags: {
      __proto__: null
    }
  }
}];
const registryConfig_pgResources_quote_quote = {
  executor: executor,
  name: "quote",
  identifier: "main.public.quote",
  from: quoteIdentifier,
  codec: quoteCodec,
  uniques: quoteUniques,
  isVirtual: false,
  description: undefined,
  extensions: {
    description: undefined,
    pg: {
      serviceName: "main",
      schemaName: "public",
      name: "quote"
    },
    isInsertable: true,
    isUpdatable: true,
    isDeletable: true,
    tags: {},
    canSelect: true,
    canInsert: true,
    canUpdate: true,
    canDelete: true
  }
};
const registryConfig = {
  pgExecutors: {
    __proto__: null,
    main: executor
  },
  pgCodecs: {
    __proto__: null,
    companyMember: companyMemberCodec,
    uuid: TYPES.uuid,
    text: TYPES.text,
    bool: TYPES.boolean,
    timestamptz: TYPES.timestamptz,
    inventoryAdjustment: inventoryAdjustmentCodec,
    int4: TYPES.int,
    invoiceLineItem: invoiceLineItemCodec,
    numeric: TYPES.numeric,
    organizationSettings: organizationSettingsCodec,
    varchar: TYPES.varchar,
    product: productCodec,
    documentNumberingConfig: documentNumberingConfigCodec,
    person: personCodec,
    pgCatalogTextArray: pgCatalogTextArrayCodec,
    company: companyCodec,
    quoteLineItem: quoteLineItemCodec,
    invoice: invoiceCodec,
    date: TYPES.date,
    quote: quoteCodec
  },
  pgResources: {
    __proto__: null,
    company_member: registryConfig_pgResources_company_member_company_member,
    inventory_adjustment: registryConfig_pgResources_inventory_adjustment_inventory_adjustment,
    invoice_line_item: registryConfig_pgResources_invoice_line_item_invoice_line_item,
    organization_settings: {
      executor: executor,
      name: "organization_settings",
      identifier: "main.public.organization_settings",
      from: organizationSettingsIdentifier,
      codec: organizationSettingsCodec,
      uniques: organization_settingsUniques,
      isVirtual: false,
      description: undefined,
      extensions: {
        description: undefined,
        pg: {
          serviceName: "main",
          schemaName: "public",
          name: "organization_settings"
        },
        isInsertable: true,
        isUpdatable: true,
        isDeletable: true,
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        canDelete: true
      }
    },
    product: registryConfig_pgResources_product_product,
    document_numbering_config: {
      executor: executor,
      name: "document_numbering_config",
      identifier: "main.public.document_numbering_config",
      from: documentNumberingConfigIdentifier,
      codec: documentNumberingConfigCodec,
      uniques: document_numbering_configUniques,
      isVirtual: false,
      description: undefined,
      extensions: {
        description: undefined,
        pg: {
          serviceName: "main",
          schemaName: "public",
          name: "document_numbering_config"
        },
        isInsertable: true,
        isUpdatable: true,
        isDeletable: true,
        tags: {},
        canSelect: true,
        canInsert: true,
        canUpdate: true,
        canDelete: true
      }
    },
    person: registryConfig_pgResources_person_person,
    company: registryConfig_pgResources_company_company,
    quote_line_item: registryConfig_pgResources_quote_line_item_quote_line_item,
    invoice: registryConfig_pgResources_invoice_invoice,
    quote: registryConfig_pgResources_quote_quote
  },
  pgRelations: {
    __proto__: null,
    company: {
      __proto__: null,
      companyMembersByTheirCompanyId: {
        localCodec: companyCodec,
        remoteResourceOptions: registryConfig_pgResources_company_member_company_member,
        localCodecPolymorphicTypes: undefined,
        localAttributes: ["id"],
        remoteAttributes: ["company_id"],
        isUnique: false,
        isReferencee: true,
        description: undefined,
        extensions: {
          tags: {
            behavior: []
          }
        }
      },
      invoicesByTheirCompanyId: {
        localCodec: companyCodec,
        remoteResourceOptions: registryConfig_pgResources_invoice_invoice,
        localCodecPolymorphicTypes: undefined,
        localAttributes: ["id"],
        remoteAttributes: ["company_id"],
        isUnique: false,
        isReferencee: true,
        description: undefined,
        extensions: {
          tags: {
            behavior: []
          }
        }
      },
      quotesByTheirCompanyId: {
        localCodec: companyCodec,
        remoteResourceOptions: registryConfig_pgResources_quote_quote,
        localCodecPolymorphicTypes: undefined,
        localAttributes: ["id"],
        remoteAttributes: ["company_id"],
        isUnique: false,
        isReferencee: true,
        description: undefined,
        extensions: {
          tags: {
            behavior: []
          }
        }
      }
    },
    companyMember: {
      __proto__: null,
      companyByMyCompanyId: {
        localCodec: companyMemberCodec,
        remoteResourceOptions: registryConfig_pgResources_company_company,
        localCodecPolymorphicTypes: undefined,
        localAttributes: ["company_id"],
        remoteAttributes: ["id"],
        isUnique: true,
        isReferencee: false,
        description: undefined,
        extensions: {
          tags: {
            behavior: []
          }
        }
      },
      personByMyPersonId: {
        localCodec: companyMemberCodec,
        remoteResourceOptions: registryConfig_pgResources_person_person,
        localCodecPolymorphicTypes: undefined,
        localAttributes: ["person_id"],
        remoteAttributes: ["id"],
        isUnique: true,
        isReferencee: false,
        description: undefined,
        extensions: {
          tags: {
            behavior: []
          }
        }
      }
    },
    inventoryAdjustment: {
      __proto__: null,
      productByMyProductId: {
        localCodec: inventoryAdjustmentCodec,
        remoteResourceOptions: registryConfig_pgResources_product_product,
        localCodecPolymorphicTypes: undefined,
        localAttributes: ["product_id"],
        remoteAttributes: ["id"],
        isUnique: true,
        isReferencee: false,
        description: undefined,
        extensions: {
          tags: {
            behavior: []
          }
        }
      }
    },
    invoice: {
      __proto__: null,
      companyByMyCompanyId: {
        localCodec: invoiceCodec,
        remoteResourceOptions: registryConfig_pgResources_company_company,
        localCodecPolymorphicTypes: undefined,
        localAttributes: ["company_id"],
        remoteAttributes: ["id"],
        isUnique: true,
        isReferencee: false,
        description: undefined,
        extensions: {
          tags: {
            behavior: []
          }
        }
      },
      personByMyContactId: {
        localCodec: invoiceCodec,
        remoteResourceOptions: registryConfig_pgResources_person_person,
        localCodecPolymorphicTypes: undefined,
        localAttributes: ["contact_id"],
        remoteAttributes: ["id"],
        isUnique: true,
        isReferencee: false,
        description: undefined,
        extensions: {
          tags: {
            behavior: []
          }
        }
      },
      invoiceLineItemsByTheirInvoiceId: {
        localCodec: invoiceCodec,
        remoteResourceOptions: registryConfig_pgResources_invoice_line_item_invoice_line_item,
        localCodecPolymorphicTypes: undefined,
        localAttributes: ["id"],
        remoteAttributes: ["invoice_id"],
        isUnique: false,
        isReferencee: true,
        description: undefined,
        extensions: {
          tags: {
            behavior: []
          }
        }
      },
      quotesByTheirConvertedInvoiceId: {
        localCodec: invoiceCodec,
        remoteResourceOptions: registryConfig_pgResources_quote_quote,
        localCodecPolymorphicTypes: undefined,
        localAttributes: ["id"],
        remoteAttributes: ["converted_invoice_id"],
        isUnique: false,
        isReferencee: true,
        description: undefined,
        extensions: {
          tags: {
            behavior: []
          },
          isIndexed: false
        }
      }
    },
    invoiceLineItem: {
      __proto__: null,
      invoiceByMyInvoiceId: {
        localCodec: invoiceLineItemCodec,
        remoteResourceOptions: registryConfig_pgResources_invoice_invoice,
        localCodecPolymorphicTypes: undefined,
        localAttributes: ["invoice_id"],
        remoteAttributes: ["id"],
        isUnique: true,
        isReferencee: false,
        description: undefined,
        extensions: {
          tags: {
            behavior: []
          }
        }
      },
      productByMyProductId: {
        localCodec: invoiceLineItemCodec,
        remoteResourceOptions: registryConfig_pgResources_product_product,
        localCodecPolymorphicTypes: undefined,
        localAttributes: ["product_id"],
        remoteAttributes: ["id"],
        isUnique: true,
        isReferencee: false,
        description: undefined,
        extensions: {
          tags: {
            behavior: []
          }
        }
      }
    },
    person: {
      __proto__: null,
      companyMembersByTheirPersonId: {
        localCodec: personCodec,
        remoteResourceOptions: registryConfig_pgResources_company_member_company_member,
        localCodecPolymorphicTypes: undefined,
        localAttributes: ["id"],
        remoteAttributes: ["person_id"],
        isUnique: false,
        isReferencee: true,
        description: undefined,
        extensions: {
          tags: {
            behavior: []
          }
        }
      },
      invoicesByTheirContactId: {
        localCodec: personCodec,
        remoteResourceOptions: registryConfig_pgResources_invoice_invoice,
        localCodecPolymorphicTypes: undefined,
        localAttributes: ["id"],
        remoteAttributes: ["contact_id"],
        isUnique: false,
        isReferencee: true,
        description: undefined,
        extensions: {
          tags: {
            behavior: []
          },
          isIndexed: false
        }
      },
      quotesByTheirContactId: {
        localCodec: personCodec,
        remoteResourceOptions: registryConfig_pgResources_quote_quote,
        localCodecPolymorphicTypes: undefined,
        localAttributes: ["id"],
        remoteAttributes: ["contact_id"],
        isUnique: false,
        isReferencee: true,
        description: undefined,
        extensions: {
          tags: {
            behavior: []
          },
          isIndexed: false
        }
      }
    },
    product: {
      __proto__: null,
      inventoryAdjustmentsByTheirProductId: {
        localCodec: productCodec,
        remoteResourceOptions: registryConfig_pgResources_inventory_adjustment_inventory_adjustment,
        localCodecPolymorphicTypes: undefined,
        localAttributes: ["id"],
        remoteAttributes: ["product_id"],
        isUnique: false,
        isReferencee: true,
        description: undefined,
        extensions: {
          tags: {
            behavior: []
          }
        }
      },
      invoiceLineItemsByTheirProductId: {
        localCodec: productCodec,
        remoteResourceOptions: registryConfig_pgResources_invoice_line_item_invoice_line_item,
        localCodecPolymorphicTypes: undefined,
        localAttributes: ["id"],
        remoteAttributes: ["product_id"],
        isUnique: false,
        isReferencee: true,
        description: undefined,
        extensions: {
          tags: {
            behavior: []
          },
          isIndexed: false
        }
      },
      quoteLineItemsByTheirProductId: {
        localCodec: productCodec,
        remoteResourceOptions: registryConfig_pgResources_quote_line_item_quote_line_item,
        localCodecPolymorphicTypes: undefined,
        localAttributes: ["id"],
        remoteAttributes: ["product_id"],
        isUnique: false,
        isReferencee: true,
        description: undefined,
        extensions: {
          tags: {
            behavior: []
          },
          isIndexed: false
        }
      }
    },
    quote: {
      __proto__: null,
      companyByMyCompanyId: {
        localCodec: quoteCodec,
        remoteResourceOptions: registryConfig_pgResources_company_company,
        localCodecPolymorphicTypes: undefined,
        localAttributes: ["company_id"],
        remoteAttributes: ["id"],
        isUnique: true,
        isReferencee: false,
        description: undefined,
        extensions: {
          tags: {
            behavior: []
          }
        }
      },
      personByMyContactId: {
        localCodec: quoteCodec,
        remoteResourceOptions: registryConfig_pgResources_person_person,
        localCodecPolymorphicTypes: undefined,
        localAttributes: ["contact_id"],
        remoteAttributes: ["id"],
        isUnique: true,
        isReferencee: false,
        description: undefined,
        extensions: {
          tags: {
            behavior: []
          }
        }
      },
      invoiceByMyConvertedInvoiceId: {
        localCodec: quoteCodec,
        remoteResourceOptions: registryConfig_pgResources_invoice_invoice,
        localCodecPolymorphicTypes: undefined,
        localAttributes: ["converted_invoice_id"],
        remoteAttributes: ["id"],
        isUnique: true,
        isReferencee: false,
        description: undefined,
        extensions: {
          tags: {
            behavior: []
          }
        }
      },
      quoteLineItemsByTheirQuoteId: {
        localCodec: quoteCodec,
        remoteResourceOptions: registryConfig_pgResources_quote_line_item_quote_line_item,
        localCodecPolymorphicTypes: undefined,
        localAttributes: ["id"],
        remoteAttributes: ["quote_id"],
        isUnique: false,
        isReferencee: true,
        description: undefined,
        extensions: {
          tags: {
            behavior: []
          }
        }
      }
    },
    quoteLineItem: {
      __proto__: null,
      productByMyProductId: {
        localCodec: quoteLineItemCodec,
        remoteResourceOptions: registryConfig_pgResources_product_product,
        localCodecPolymorphicTypes: undefined,
        localAttributes: ["product_id"],
        remoteAttributes: ["id"],
        isUnique: true,
        isReferencee: false,
        description: undefined,
        extensions: {
          tags: {
            behavior: []
          }
        }
      },
      quoteByMyQuoteId: {
        localCodec: quoteLineItemCodec,
        remoteResourceOptions: registryConfig_pgResources_quote_quote,
        localCodecPolymorphicTypes: undefined,
        localAttributes: ["quote_id"],
        remoteAttributes: ["id"],
        isUnique: true,
        isReferencee: false,
        description: undefined,
        extensions: {
          tags: {
            behavior: []
          }
        }
      }
    }
  }
};
const registry = makeRegistry(registryConfig);
const resource_company_memberPgResource = registry.pgResources["company_member"];
const resource_inventory_adjustmentPgResource = registry.pgResources["inventory_adjustment"];
const resource_invoice_line_itemPgResource = registry.pgResources["invoice_line_item"];
const resource_organization_settingsPgResource = registry.pgResources["organization_settings"];
const resource_productPgResource = registry.pgResources["product"];
const resource_document_numbering_configPgResource = registry.pgResources["document_numbering_config"];
const resource_personPgResource = registry.pgResources["person"];
const resource_companyPgResource = registry.pgResources["company"];
const resource_quote_line_itemPgResource = registry.pgResources["quote_line_item"];
const resource_invoicePgResource = registry.pgResources["invoice"];
const resource_quotePgResource = registry.pgResources["quote"];
const nodeIdHandler_CompanyMember = {
  typeName: "CompanyMember",
  codec: nodeIdCodecs_base64JSON_base64JSON,
  deprecationReason: undefined,
  plan($record) {
    return list([constant("CompanyMember", false), $record.get("id")]);
  },
  getSpec($list) {
    return {
      id: inhibitOnNull(access($list, [1]))
    };
  },
  getIdentifiers(value) {
    return value.slice(1);
  },
  get(spec) {
    return resource_company_memberPgResource.get(spec);
  },
  match(obj) {
    return obj[0] === "CompanyMember";
  }
};
const specForHandlerCache = new Map();
function specForHandler(handler) {
  const existing = specForHandlerCache.get(handler);
  if (existing) return existing;
  function spec(nodeId) {
    if (nodeId == null) return null;
    try {
      const specifier = handler.codec.decode(nodeId);
      if (handler.match(specifier)) return specifier;
    } catch {}
    return null;
  }
  spec.displayName = `specifier_${handler.typeName}_${handler.codec.name}`;
  spec.isSyncAndSafe = !0;
  specForHandlerCache.set(handler, spec);
  return spec;
}
const nodeFetcher_CompanyMember = $nodeId => {
  const $decoded = lambda($nodeId, specForHandler(nodeIdHandler_CompanyMember));
  return nodeIdHandler_CompanyMember.get(nodeIdHandler_CompanyMember.getSpec($decoded));
};
const nodeIdHandler_InventoryAdjustment = {
  typeName: "InventoryAdjustment",
  codec: nodeIdCodecs_base64JSON_base64JSON,
  deprecationReason: undefined,
  plan($record) {
    return list([constant("InventoryAdjustment", false), $record.get("id")]);
  },
  getSpec($list) {
    return {
      id: inhibitOnNull(access($list, [1]))
    };
  },
  getIdentifiers(value) {
    return value.slice(1);
  },
  get(spec) {
    return resource_inventory_adjustmentPgResource.get(spec);
  },
  match(obj) {
    return obj[0] === "InventoryAdjustment";
  }
};
const nodeFetcher_InventoryAdjustment = $nodeId => {
  const $decoded = lambda($nodeId, specForHandler(nodeIdHandler_InventoryAdjustment));
  return nodeIdHandler_InventoryAdjustment.get(nodeIdHandler_InventoryAdjustment.getSpec($decoded));
};
const nodeIdHandler_InvoiceLineItem = {
  typeName: "InvoiceLineItem",
  codec: nodeIdCodecs_base64JSON_base64JSON,
  deprecationReason: undefined,
  plan($record) {
    return list([constant("InvoiceLineItem", false), $record.get("id")]);
  },
  getSpec($list) {
    return {
      id: inhibitOnNull(access($list, [1]))
    };
  },
  getIdentifiers(value) {
    return value.slice(1);
  },
  get(spec) {
    return resource_invoice_line_itemPgResource.get(spec);
  },
  match(obj) {
    return obj[0] === "InvoiceLineItem";
  }
};
const nodeFetcher_InvoiceLineItem = $nodeId => {
  const $decoded = lambda($nodeId, specForHandler(nodeIdHandler_InvoiceLineItem));
  return nodeIdHandler_InvoiceLineItem.get(nodeIdHandler_InvoiceLineItem.getSpec($decoded));
};
const nodeIdHandler_OrganizationSetting = {
  typeName: "OrganizationSetting",
  codec: nodeIdCodecs_base64JSON_base64JSON,
  deprecationReason: undefined,
  plan($record) {
    return list([constant("OrganizationSetting", false), $record.get("id")]);
  },
  getSpec($list) {
    return {
      id: inhibitOnNull(access($list, [1]))
    };
  },
  getIdentifiers(value) {
    return value.slice(1);
  },
  get(spec) {
    return resource_organization_settingsPgResource.get(spec);
  },
  match(obj) {
    return obj[0] === "OrganizationSetting";
  }
};
const nodeFetcher_OrganizationSetting = $nodeId => {
  const $decoded = lambda($nodeId, specForHandler(nodeIdHandler_OrganizationSetting));
  return nodeIdHandler_OrganizationSetting.get(nodeIdHandler_OrganizationSetting.getSpec($decoded));
};
const nodeIdHandler_Product = {
  typeName: "Product",
  codec: nodeIdCodecs_base64JSON_base64JSON,
  deprecationReason: undefined,
  plan($record) {
    return list([constant("Product", false), $record.get("id")]);
  },
  getSpec($list) {
    return {
      id: inhibitOnNull(access($list, [1]))
    };
  },
  getIdentifiers(value) {
    return value.slice(1);
  },
  get(spec) {
    return resource_productPgResource.get(spec);
  },
  match(obj) {
    return obj[0] === "Product";
  }
};
const nodeFetcher_Product = $nodeId => {
  const $decoded = lambda($nodeId, specForHandler(nodeIdHandler_Product));
  return nodeIdHandler_Product.get(nodeIdHandler_Product.getSpec($decoded));
};
const nodeIdHandler_DocumentNumberingConfig = {
  typeName: "DocumentNumberingConfig",
  codec: nodeIdCodecs_base64JSON_base64JSON,
  deprecationReason: undefined,
  plan($record) {
    return list([constant("DocumentNumberingConfig", false), $record.get("id")]);
  },
  getSpec($list) {
    return {
      id: inhibitOnNull(access($list, [1]))
    };
  },
  getIdentifiers(value) {
    return value.slice(1);
  },
  get(spec) {
    return resource_document_numbering_configPgResource.get(spec);
  },
  match(obj) {
    return obj[0] === "DocumentNumberingConfig";
  }
};
const nodeFetcher_DocumentNumberingConfig = $nodeId => {
  const $decoded = lambda($nodeId, specForHandler(nodeIdHandler_DocumentNumberingConfig));
  return nodeIdHandler_DocumentNumberingConfig.get(nodeIdHandler_DocumentNumberingConfig.getSpec($decoded));
};
const nodeIdHandler_Person = {
  typeName: "Person",
  codec: nodeIdCodecs_base64JSON_base64JSON,
  deprecationReason: undefined,
  plan($record) {
    return list([constant("Person", false), $record.get("id")]);
  },
  getSpec($list) {
    return {
      id: inhibitOnNull(access($list, [1]))
    };
  },
  getIdentifiers(value) {
    return value.slice(1);
  },
  get(spec) {
    return resource_personPgResource.get(spec);
  },
  match(obj) {
    return obj[0] === "Person";
  }
};
const nodeFetcher_Person = $nodeId => {
  const $decoded = lambda($nodeId, specForHandler(nodeIdHandler_Person));
  return nodeIdHandler_Person.get(nodeIdHandler_Person.getSpec($decoded));
};
const nodeIdHandler_Company = {
  typeName: "Company",
  codec: nodeIdCodecs_base64JSON_base64JSON,
  deprecationReason: undefined,
  plan($record) {
    return list([constant("Company", false), $record.get("id")]);
  },
  getSpec($list) {
    return {
      id: inhibitOnNull(access($list, [1]))
    };
  },
  getIdentifiers(value) {
    return value.slice(1);
  },
  get(spec) {
    return resource_companyPgResource.get(spec);
  },
  match(obj) {
    return obj[0] === "Company";
  }
};
const nodeFetcher_Company = $nodeId => {
  const $decoded = lambda($nodeId, specForHandler(nodeIdHandler_Company));
  return nodeIdHandler_Company.get(nodeIdHandler_Company.getSpec($decoded));
};
const nodeIdHandler_QuoteLineItem = {
  typeName: "QuoteLineItem",
  codec: nodeIdCodecs_base64JSON_base64JSON,
  deprecationReason: undefined,
  plan($record) {
    return list([constant("QuoteLineItem", false), $record.get("id")]);
  },
  getSpec($list) {
    return {
      id: inhibitOnNull(access($list, [1]))
    };
  },
  getIdentifiers(value) {
    return value.slice(1);
  },
  get(spec) {
    return resource_quote_line_itemPgResource.get(spec);
  },
  match(obj) {
    return obj[0] === "QuoteLineItem";
  }
};
const nodeFetcher_QuoteLineItem = $nodeId => {
  const $decoded = lambda($nodeId, specForHandler(nodeIdHandler_QuoteLineItem));
  return nodeIdHandler_QuoteLineItem.get(nodeIdHandler_QuoteLineItem.getSpec($decoded));
};
const nodeIdHandler_Invoice = {
  typeName: "Invoice",
  codec: nodeIdCodecs_base64JSON_base64JSON,
  deprecationReason: undefined,
  plan($record) {
    return list([constant("Invoice", false), $record.get("id")]);
  },
  getSpec($list) {
    return {
      id: inhibitOnNull(access($list, [1]))
    };
  },
  getIdentifiers(value) {
    return value.slice(1);
  },
  get(spec) {
    return resource_invoicePgResource.get(spec);
  },
  match(obj) {
    return obj[0] === "Invoice";
  }
};
const nodeFetcher_Invoice = $nodeId => {
  const $decoded = lambda($nodeId, specForHandler(nodeIdHandler_Invoice));
  return nodeIdHandler_Invoice.get(nodeIdHandler_Invoice.getSpec($decoded));
};
const nodeIdHandler_Quote = {
  typeName: "Quote",
  codec: nodeIdCodecs_base64JSON_base64JSON,
  deprecationReason: undefined,
  plan($record) {
    return list([constant("Quote", false), $record.get("id")]);
  },
  getSpec($list) {
    return {
      id: inhibitOnNull(access($list, [1]))
    };
  },
  getIdentifiers(value) {
    return value.slice(1);
  },
  get(spec) {
    return resource_quotePgResource.get(spec);
  },
  match(obj) {
    return obj[0] === "Quote";
  }
};
const nodeFetcher_Quote = $nodeId => {
  const $decoded = lambda($nodeId, specForHandler(nodeIdHandler_Quote));
  return nodeIdHandler_Quote.get(nodeIdHandler_Quote.getSpec($decoded));
};
function qbWhereBuilder(qb) {
  return qb.whereBuilder();
}
function isEmpty(o) {
  return typeof o === "object" && o !== null && Object.keys(o).length === 0;
}
function assertAllowed(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
function assertAllowed2(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
function assertAllowed3(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
function assertAllowed4(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
function assertAllowed5(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
function assertAllowed6(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
function assertAllowed7(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
function assertAllowed8(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
function assertAllowed9(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
function assertAllowed10(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
function assertAllowed11(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
const nodeIdHandlerByTypeName = {
  __proto__: null,
  Query: nodeIdHandler_Query,
  CompanyMember: nodeIdHandler_CompanyMember,
  InventoryAdjustment: nodeIdHandler_InventoryAdjustment,
  InvoiceLineItem: nodeIdHandler_InvoiceLineItem,
  OrganizationSetting: nodeIdHandler_OrganizationSetting,
  Product: nodeIdHandler_Product,
  DocumentNumberingConfig: nodeIdHandler_DocumentNumberingConfig,
  Person: nodeIdHandler_Person,
  Company: nodeIdHandler_Company,
  QuoteLineItem: nodeIdHandler_QuoteLineItem,
  Invoice: nodeIdHandler_Invoice,
  Quote: nodeIdHandler_Quote
};
const decodeNodeId = makeDecodeNodeId(Object.values(nodeIdHandlerByTypeName));
function findTypeNameMatch(specifier) {
  if (!specifier) return null;
  for (const [typeName, typeSpec] of Object.entries(nodeIdHandlerByTypeName)) {
    const value = specifier[typeSpec.codec.name];
    if (value != null && typeSpec.match(value)) return typeName;
  }
  console.warn(`Could not find a type that matched the specifier '${inspect(specifier)}'`);
  return null;
}
function UUIDSerialize(value) {
  return "" + value;
}
const coerce = string => {
  if (!/^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i.test(string)) throw new GraphQLError("Invalid UUID, expected 32 hexadecimal characters, optionally with hyphens");
  return string;
};
function assertAllowed12(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
function assertAllowed13(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
function assertAllowed14(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
const colSpec = {
  fieldName: "rowId",
  attributeName: "id",
  attribute: spec_companyMember.attributes.id
};
const colSpec2 = {
  fieldName: "companyId",
  attributeName: "company_id",
  attribute: spec_companyMember.attributes.company_id
};
const colSpec3 = {
  fieldName: "personId",
  attributeName: "person_id",
  attribute: spec_companyMember.attributes.person_id
};
function assertAllowed15(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
function assertAllowed16(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
const resolve = (i, _v, input) => sql`${i} ${input ? sql`IS NULL` : sql`IS NOT NULL`}`;
const resolveInputCodec = () => TYPES.boolean;
const resolveSqlValue = () => sql.null;
const resolve2 = (i, v) => sql`${i} = ${v}`;
const forceTextTypesSensitive = [TYPES.citext, TYPES.char, TYPES.bpchar];
function resolveDomains(c) {
  let current = c;
  while (current.domainOfCodec) current = current.domainOfCodec;
  return current;
}
function resolveInputCodec2(c) {
  if (c.arrayOfCodec) {
    if (forceTextTypesSensitive.includes(resolveDomains(c.arrayOfCodec))) return listOfCodec(TYPES.text, {
      extensions: {
        listItemNonNull: c.extensions?.listItemNonNull
      }
    });
    return c;
  } else {
    if (forceTextTypesSensitive.includes(resolveDomains(c))) return TYPES.text;
    return c;
  }
}
function resolveSqlIdentifier(identifier, c) {
  if (c.arrayOfCodec && forceTextTypesSensitive.includes(resolveDomains(c.arrayOfCodec))) return [sql`(${identifier})::text[]`, listOfCodec(TYPES.text, {
    extensions: {
      listItemNonNull: c.extensions?.listItemNonNull
    }
  })];else if (forceTextTypesSensitive.includes(resolveDomains(c))) return [sql`(${identifier})::text`, TYPES.text];else return [identifier, c];
}
const resolve3 = (i, v) => sql`${i} <> ${v}`;
const resolve4 = (i, v) => sql`${i} IS DISTINCT FROM ${v}`;
const resolve5 = (i, v) => sql`${i} IS NOT DISTINCT FROM ${v}`;
const resolve6 = (i, v) => sql`${i} = ANY(${v})`;
function resolveInputCodec3(c) {
  if (forceTextTypesSensitive.includes(resolveDomains(c))) return listOfCodec(TYPES.text, {
    extensions: {
      listItemNonNull: !0
    }
  });else return listOfCodec(c, {
    extensions: {
      listItemNonNull: !0
    }
  });
}
const resolve7 = (i, v) => sql`${i} <> ALL(${v})`;
const resolve8 = (i, v) => sql`${i} < ${v}`;
const resolve9 = (i, v) => sql`${i} <= ${v}`;
const resolve10 = (i, v) => sql`${i} > ${v}`;
const resolve11 = (i, v) => sql`${i} >= ${v}`;
const colSpec4 = {
  fieldName: "rowId",
  attributeName: "id",
  attribute: spec_company.attributes.id
};
const colSpec5 = {
  fieldName: "organizationId",
  attributeName: "organization_id",
  attribute: spec_company.attributes.organization_id
};
function assertAllowed17(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
function assertAllowed18(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
const resolve12 = (i, _v, input) => sql`${i} ${input ? sql`IS NULL` : sql`IS NOT NULL`}`;
const resolveInputCodec4 = () => TYPES.boolean;
const resolveSqlValue2 = () => sql.null;
const resolve13 = (i, v) => sql`${i} = ${v}`;
const forceTextTypesSensitive2 = [TYPES.citext, TYPES.char, TYPES.bpchar];
function resolveDomains2(c) {
  let current = c;
  while (current.domainOfCodec) current = current.domainOfCodec;
  return current;
}
function resolveInputCodec5(c) {
  if (c.arrayOfCodec) {
    if (forceTextTypesSensitive2.includes(resolveDomains2(c.arrayOfCodec))) return listOfCodec(TYPES.text, {
      extensions: {
        listItemNonNull: c.extensions?.listItemNonNull
      }
    });
    return c;
  } else {
    if (forceTextTypesSensitive2.includes(resolveDomains2(c))) return TYPES.text;
    return c;
  }
}
function resolveSqlIdentifier2(identifier, c) {
  if (c.arrayOfCodec && forceTextTypesSensitive2.includes(resolveDomains2(c.arrayOfCodec))) return [sql`(${identifier})::text[]`, listOfCodec(TYPES.text, {
    extensions: {
      listItemNonNull: c.extensions?.listItemNonNull
    }
  })];else if (forceTextTypesSensitive2.includes(resolveDomains2(c))) return [sql`(${identifier})::text`, TYPES.text];else return [identifier, c];
}
const resolve14 = (i, v) => sql`${i} <> ${v}`;
const resolve15 = (i, v) => sql`${i} IS DISTINCT FROM ${v}`;
const resolve16 = (i, v) => sql`${i} IS NOT DISTINCT FROM ${v}`;
const resolve17 = (i, v) => sql`${i} = ANY(${v})`;
function resolveInputCodec6(c) {
  if (forceTextTypesSensitive2.includes(resolveDomains2(c))) return listOfCodec(TYPES.text, {
    extensions: {
      listItemNonNull: !0
    }
  });else return listOfCodec(c, {
    extensions: {
      listItemNonNull: !0
    }
  });
}
const resolve18 = (i, v) => sql`${i} <> ALL(${v})`;
const resolve19 = (i, v) => sql`${i} < ${v}`;
const resolve20 = (i, v) => sql`${i} <= ${v}`;
const resolve21 = (i, v) => sql`${i} > ${v}`;
const resolve22 = (i, v) => sql`${i} >= ${v}`;
const resolve23 = (i, v) => sql`${i} LIKE ${v}`;
function escapeLikeWildcards(input) {
  if (typeof input !== "string") throw Error("Non-string input was provided to escapeLikeWildcards");else return input.split("%").join("\\%").split("_").join("\\_");
}
const resolveInput = input => `%${escapeLikeWildcards(input)}%`;
const resolve24 = (i, v) => sql`${i} NOT LIKE ${v}`;
const resolveInput2 = input => `%${escapeLikeWildcards(input)}%`;
const resolve25 = (i, v) => sql`${i} ILIKE ${v}`;
const resolveInput3 = input => `%${escapeLikeWildcards(input)}%`;
const forceTextTypesInsensitive = [TYPES.char, TYPES.bpchar];
function resolveInputCodec7(c) {
  if (c.arrayOfCodec) {
    if (forceTextTypesInsensitive.includes(resolveDomains2(c.arrayOfCodec))) return listOfCodec(TYPES.text, {
      extensions: {
        listItemNonNull: c.extensions?.listItemNonNull
      }
    });
    return c;
  } else {
    if (forceTextTypesInsensitive.includes(resolveDomains2(c))) return TYPES.text;
    return c;
  }
}
function resolveSqlIdentifier3(identifier, c) {
  if (c.arrayOfCodec && forceTextTypesInsensitive.includes(resolveDomains2(c.arrayOfCodec))) return [sql`(${identifier})::text[]`, listOfCodec(TYPES.text, {
    extensions: {
      listItemNonNull: c.extensions?.listItemNonNull
    }
  })];else if (forceTextTypesInsensitive.includes(resolveDomains2(c))) return [sql`(${identifier})::text`, TYPES.text];else return [identifier, c];
}
const resolve26 = (i, v) => sql`${i} NOT ILIKE ${v}`;
const resolveInput4 = input => `%${escapeLikeWildcards(input)}%`;
const resolve27 = (i, v) => sql`${i} LIKE ${v}`;
const resolveInput5 = input => `${escapeLikeWildcards(input)}%`;
const resolve28 = (i, v) => sql`${i} NOT LIKE ${v}`;
const resolveInput6 = input => `${escapeLikeWildcards(input)}%`;
const resolve29 = (i, v) => sql`${i} ILIKE ${v}`;
const resolveInput7 = input => `${escapeLikeWildcards(input)}%`;
const resolve30 = (i, v) => sql`${i} NOT ILIKE ${v}`;
const resolveInput8 = input => `${escapeLikeWildcards(input)}%`;
const resolve31 = (i, v) => sql`${i} LIKE ${v}`;
const resolveInput9 = input => `%${escapeLikeWildcards(input)}`;
const resolve32 = (i, v) => sql`${i} NOT LIKE ${v}`;
const resolveInput10 = input => `%${escapeLikeWildcards(input)}`;
const resolve33 = (i, v) => sql`${i} ILIKE ${v}`;
const resolveInput11 = input => `%${escapeLikeWildcards(input)}`;
const resolve34 = (i, v) => sql`${i} NOT ILIKE ${v}`;
const resolveInput12 = input => `%${escapeLikeWildcards(input)}`;
const resolve35 = (i, v) => sql`${i} LIKE ${v}`;
const resolve36 = (i, v) => sql`${i} NOT LIKE ${v}`;
const resolve37 = (i, v) => sql`${i} ILIKE ${v}`;
const resolve38 = (i, v) => sql`${i} NOT ILIKE ${v}`;
function resolveInputCodec8(inputCodec) {
  if ("equalTo" === "in" || "equalTo" === "notIn") {
    const t = resolveDomains2(inputCodec) === TYPES.citext ? inputCodec : TYPES.text;
    return listOfCodec(t, {
      extensions: {
        listItemNonNull: !0
      }
    });
  } else return resolveDomains2(inputCodec) === TYPES.citext ? inputCodec : TYPES.text;
}
function resolveSqlIdentifier4(sourceAlias, codec) {
  return resolveDomains2(codec) === TYPES.citext ? [sourceAlias, codec] : [sql`lower(${sourceAlias}::text)`, TYPES.text];
}
function resolveSqlValue3(_unused, input, inputCodec) {
  if ("equalTo" === "in" || "equalTo" === "notIn") {
    const sqlList = sqlValueWithCodec(input, inputCodec);
    if (inputCodec.arrayOfCodec === TYPES.citext) return sqlList;else return sql`(select lower(t) from unnest(${sqlList}) t)`;
  } else {
    const sqlValue = sqlValueWithCodec(input, inputCodec);
    if (inputCodec === TYPES.citext) return sqlValue;else return sql`lower(${sqlValue})`;
  }
}
function resolveInputCodec9(inputCodec) {
  if ("notEqualTo" === "in" || "notEqualTo" === "notIn") {
    const t = resolveDomains2(inputCodec) === TYPES.citext ? inputCodec : TYPES.text;
    return listOfCodec(t, {
      extensions: {
        listItemNonNull: !0
      }
    });
  } else return resolveDomains2(inputCodec) === TYPES.citext ? inputCodec : TYPES.text;
}
function resolveSqlIdentifier5(sourceAlias, codec) {
  return resolveDomains2(codec) === TYPES.citext ? [sourceAlias, codec] : [sql`lower(${sourceAlias}::text)`, TYPES.text];
}
function resolveSqlValue4(_unused, input, inputCodec) {
  if ("notEqualTo" === "in" || "notEqualTo" === "notIn") {
    const sqlList = sqlValueWithCodec(input, inputCodec);
    if (inputCodec.arrayOfCodec === TYPES.citext) return sqlList;else return sql`(select lower(t) from unnest(${sqlList}) t)`;
  } else {
    const sqlValue = sqlValueWithCodec(input, inputCodec);
    if (inputCodec === TYPES.citext) return sqlValue;else return sql`lower(${sqlValue})`;
  }
}
function resolveInputCodec10(inputCodec) {
  if ("distinctFrom" === "in" || "distinctFrom" === "notIn") {
    const t = resolveDomains2(inputCodec) === TYPES.citext ? inputCodec : TYPES.text;
    return listOfCodec(t, {
      extensions: {
        listItemNonNull: !0
      }
    });
  } else return resolveDomains2(inputCodec) === TYPES.citext ? inputCodec : TYPES.text;
}
function resolveSqlIdentifier6(sourceAlias, codec) {
  return resolveDomains2(codec) === TYPES.citext ? [sourceAlias, codec] : [sql`lower(${sourceAlias}::text)`, TYPES.text];
}
function resolveSqlValue5(_unused, input, inputCodec) {
  if ("distinctFrom" === "in" || "distinctFrom" === "notIn") {
    const sqlList = sqlValueWithCodec(input, inputCodec);
    if (inputCodec.arrayOfCodec === TYPES.citext) return sqlList;else return sql`(select lower(t) from unnest(${sqlList}) t)`;
  } else {
    const sqlValue = sqlValueWithCodec(input, inputCodec);
    if (inputCodec === TYPES.citext) return sqlValue;else return sql`lower(${sqlValue})`;
  }
}
function resolveInputCodec11(inputCodec) {
  if ("notDistinctFrom" === "in" || "notDistinctFrom" === "notIn") {
    const t = resolveDomains2(inputCodec) === TYPES.citext ? inputCodec : TYPES.text;
    return listOfCodec(t, {
      extensions: {
        listItemNonNull: !0
      }
    });
  } else return resolveDomains2(inputCodec) === TYPES.citext ? inputCodec : TYPES.text;
}
function resolveSqlIdentifier7(sourceAlias, codec) {
  return resolveDomains2(codec) === TYPES.citext ? [sourceAlias, codec] : [sql`lower(${sourceAlias}::text)`, TYPES.text];
}
function resolveSqlValue6(_unused, input, inputCodec) {
  if ("notDistinctFrom" === "in" || "notDistinctFrom" === "notIn") {
    const sqlList = sqlValueWithCodec(input, inputCodec);
    if (inputCodec.arrayOfCodec === TYPES.citext) return sqlList;else return sql`(select lower(t) from unnest(${sqlList}) t)`;
  } else {
    const sqlValue = sqlValueWithCodec(input, inputCodec);
    if (inputCodec === TYPES.citext) return sqlValue;else return sql`lower(${sqlValue})`;
  }
}
function resolveInputCodec12(inputCodec) {
  if ("in" === "in" || "in" === "notIn") {
    const t = resolveDomains2(inputCodec) === TYPES.citext ? inputCodec : TYPES.text;
    return listOfCodec(t, {
      extensions: {
        listItemNonNull: !0
      }
    });
  } else return resolveDomains2(inputCodec) === TYPES.citext ? inputCodec : TYPES.text;
}
function resolveSqlIdentifier8(sourceAlias, codec) {
  return resolveDomains2(codec) === TYPES.citext ? [sourceAlias, codec] : [sql`lower(${sourceAlias}::text)`, TYPES.text];
}
function resolveSqlValue7(_unused, input, inputCodec) {
  if ("in" === "in" || "in" === "notIn") {
    const sqlList = sqlValueWithCodec(input, inputCodec);
    if (inputCodec.arrayOfCodec === TYPES.citext) return sqlList;else return sql`(select lower(t) from unnest(${sqlList}) t)`;
  } else {
    const sqlValue = sqlValueWithCodec(input, inputCodec);
    if (inputCodec === TYPES.citext) return sqlValue;else return sql`lower(${sqlValue})`;
  }
}
function resolveInputCodec13(inputCodec) {
  if ("notIn" === "in" || "notIn" === "notIn") {
    const t = resolveDomains2(inputCodec) === TYPES.citext ? inputCodec : TYPES.text;
    return listOfCodec(t, {
      extensions: {
        listItemNonNull: !0
      }
    });
  } else return resolveDomains2(inputCodec) === TYPES.citext ? inputCodec : TYPES.text;
}
function resolveSqlIdentifier9(sourceAlias, codec) {
  return resolveDomains2(codec) === TYPES.citext ? [sourceAlias, codec] : [sql`lower(${sourceAlias}::text)`, TYPES.text];
}
function resolveSqlValue8(_unused, input, inputCodec) {
  if ("notIn" === "in" || "notIn" === "notIn") {
    const sqlList = sqlValueWithCodec(input, inputCodec);
    if (inputCodec.arrayOfCodec === TYPES.citext) return sqlList;else return sql`(select lower(t) from unnest(${sqlList}) t)`;
  } else {
    const sqlValue = sqlValueWithCodec(input, inputCodec);
    if (inputCodec === TYPES.citext) return sqlValue;else return sql`lower(${sqlValue})`;
  }
}
function resolveInputCodec14(inputCodec) {
  if ("lessThan" === "in" || "lessThan" === "notIn") {
    const t = resolveDomains2(inputCodec) === TYPES.citext ? inputCodec : TYPES.text;
    return listOfCodec(t, {
      extensions: {
        listItemNonNull: !0
      }
    });
  } else return resolveDomains2(inputCodec) === TYPES.citext ? inputCodec : TYPES.text;
}
function resolveSqlIdentifier10(sourceAlias, codec) {
  return resolveDomains2(codec) === TYPES.citext ? [sourceAlias, codec] : [sql`lower(${sourceAlias}::text)`, TYPES.text];
}
function resolveSqlValue9(_unused, input, inputCodec) {
  if ("lessThan" === "in" || "lessThan" === "notIn") {
    const sqlList = sqlValueWithCodec(input, inputCodec);
    if (inputCodec.arrayOfCodec === TYPES.citext) return sqlList;else return sql`(select lower(t) from unnest(${sqlList}) t)`;
  } else {
    const sqlValue = sqlValueWithCodec(input, inputCodec);
    if (inputCodec === TYPES.citext) return sqlValue;else return sql`lower(${sqlValue})`;
  }
}
function resolveInputCodec15(inputCodec) {
  if ("lessThanOrEqualTo" === "in" || "lessThanOrEqualTo" === "notIn") {
    const t = resolveDomains2(inputCodec) === TYPES.citext ? inputCodec : TYPES.text;
    return listOfCodec(t, {
      extensions: {
        listItemNonNull: !0
      }
    });
  } else return resolveDomains2(inputCodec) === TYPES.citext ? inputCodec : TYPES.text;
}
function resolveSqlIdentifier11(sourceAlias, codec) {
  return resolveDomains2(codec) === TYPES.citext ? [sourceAlias, codec] : [sql`lower(${sourceAlias}::text)`, TYPES.text];
}
function resolveSqlValue10(_unused, input, inputCodec) {
  if ("lessThanOrEqualTo" === "in" || "lessThanOrEqualTo" === "notIn") {
    const sqlList = sqlValueWithCodec(input, inputCodec);
    if (inputCodec.arrayOfCodec === TYPES.citext) return sqlList;else return sql`(select lower(t) from unnest(${sqlList}) t)`;
  } else {
    const sqlValue = sqlValueWithCodec(input, inputCodec);
    if (inputCodec === TYPES.citext) return sqlValue;else return sql`lower(${sqlValue})`;
  }
}
function resolveInputCodec16(inputCodec) {
  if ("greaterThan" === "in" || "greaterThan" === "notIn") {
    const t = resolveDomains2(inputCodec) === TYPES.citext ? inputCodec : TYPES.text;
    return listOfCodec(t, {
      extensions: {
        listItemNonNull: !0
      }
    });
  } else return resolveDomains2(inputCodec) === TYPES.citext ? inputCodec : TYPES.text;
}
function resolveSqlIdentifier12(sourceAlias, codec) {
  return resolveDomains2(codec) === TYPES.citext ? [sourceAlias, codec] : [sql`lower(${sourceAlias}::text)`, TYPES.text];
}
function resolveSqlValue11(_unused, input, inputCodec) {
  if ("greaterThan" === "in" || "greaterThan" === "notIn") {
    const sqlList = sqlValueWithCodec(input, inputCodec);
    if (inputCodec.arrayOfCodec === TYPES.citext) return sqlList;else return sql`(select lower(t) from unnest(${sqlList}) t)`;
  } else {
    const sqlValue = sqlValueWithCodec(input, inputCodec);
    if (inputCodec === TYPES.citext) return sqlValue;else return sql`lower(${sqlValue})`;
  }
}
function resolveInputCodec17(inputCodec) {
  if ("greaterThanOrEqualTo" === "in" || "greaterThanOrEqualTo" === "notIn") {
    const t = resolveDomains2(inputCodec) === TYPES.citext ? inputCodec : TYPES.text;
    return listOfCodec(t, {
      extensions: {
        listItemNonNull: !0
      }
    });
  } else return resolveDomains2(inputCodec) === TYPES.citext ? inputCodec : TYPES.text;
}
function resolveSqlIdentifier13(sourceAlias, codec) {
  return resolveDomains2(codec) === TYPES.citext ? [sourceAlias, codec] : [sql`lower(${sourceAlias}::text)`, TYPES.text];
}
function resolveSqlValue12(_unused, input, inputCodec) {
  if ("greaterThanOrEqualTo" === "in" || "greaterThanOrEqualTo" === "notIn") {
    const sqlList = sqlValueWithCodec(input, inputCodec);
    if (inputCodec.arrayOfCodec === TYPES.citext) return sqlList;else return sql`(select lower(t) from unnest(${sqlList}) t)`;
  } else {
    const sqlValue = sqlValueWithCodec(input, inputCodec);
    if (inputCodec === TYPES.citext) return sqlValue;else return sql`lower(${sqlValue})`;
  }
}
function assertAllowed19(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
function assertAllowed20(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
const colSpec6 = {
  fieldName: "rowId",
  attributeName: "id",
  attribute: spec_invoice.attributes.id
};
const colSpec7 = {
  fieldName: "organizationId",
  attributeName: "organization_id",
  attribute: spec_invoice.attributes.organization_id
};
const colSpec8 = {
  fieldName: "invoiceNumber",
  attributeName: "invoice_number",
  attribute: spec_invoice.attributes.invoice_number
};
const colSpec9 = {
  fieldName: "companyId",
  attributeName: "company_id",
  attribute: spec_invoice.attributes.company_id
};
const colSpec10 = {
  fieldName: "status",
  attributeName: "status",
  attribute: spec_invoice.attributes.status
};
function assertAllowed21(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
function assertAllowed22(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
function assertAllowed23(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
function assertAllowed24(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
const colSpec11 = {
  fieldName: "rowId",
  attributeName: "id",
  attribute: spec_invoiceLineItem.attributes.id
};
const colSpec12 = {
  fieldName: "invoiceId",
  attributeName: "invoice_id",
  attribute: spec_invoiceLineItem.attributes.invoice_id
};
function assertAllowed25(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
function assertAllowed26(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
const colSpec13 = {
  fieldName: "rowId",
  attributeName: "id",
  attribute: spec_product.attributes.id
};
const colSpec14 = {
  fieldName: "organizationId",
  attributeName: "organization_id",
  attribute: spec_product.attributes.organization_id
};
const colSpec15 = {
  fieldName: "sku",
  attributeName: "sku",
  attribute: spec_product.attributes.sku
};
function assertAllowed27(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
function assertAllowed28(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
function assertAllowed29(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
const colSpec16 = {
  fieldName: "rowId",
  attributeName: "id",
  attribute: spec_inventoryAdjustment.attributes.id
};
const colSpec17 = {
  fieldName: "productId",
  attributeName: "product_id",
  attribute: spec_inventoryAdjustment.attributes.product_id
};
function assertAllowed30(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
function assertAllowed31(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
const colSpec18 = {
  fieldName: "rowId",
  attributeName: "id",
  attribute: spec_person.attributes.id
};
const colSpec19 = {
  fieldName: "organizationId",
  attributeName: "organization_id",
  attribute: spec_person.attributes.organization_id
};
const colSpec20 = {
  fieldName: "emails",
  attributeName: "emails",
  attribute: spec_person.attributes.emails
};
function assertAllowed32(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
function assertAllowed33(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
const resolve39 = (i, _v, input) => sql`${i} ${input ? sql`IS NULL` : sql`IS NOT NULL`}`;
const resolveInputCodec18 = () => TYPES.boolean;
const resolveSqlValue13 = () => sql.null;
const resolve40 = (i, v) => sql`${i} = ${v}`;
const forceTextTypesSensitive3 = [TYPES.citext, TYPES.char, TYPES.bpchar];
function resolveDomains3(c) {
  let current = c;
  while (current.domainOfCodec) current = current.domainOfCodec;
  return current;
}
function resolveInputCodec19(c) {
  if (c.arrayOfCodec) {
    if (forceTextTypesSensitive3.includes(resolveDomains3(c.arrayOfCodec))) return listOfCodec(TYPES.text, {
      extensions: {
        listItemNonNull: c.extensions?.listItemNonNull
      }
    });
    return c;
  } else {
    if (forceTextTypesSensitive3.includes(resolveDomains3(c))) return TYPES.text;
    return c;
  }
}
function resolveSqlIdentifier14(identifier, c) {
  if (c.arrayOfCodec && forceTextTypesSensitive3.includes(resolveDomains3(c.arrayOfCodec))) return [sql`(${identifier})::text[]`, listOfCodec(TYPES.text, {
    extensions: {
      listItemNonNull: c.extensions?.listItemNonNull
    }
  })];else if (forceTextTypesSensitive3.includes(resolveDomains3(c))) return [sql`(${identifier})::text`, TYPES.text];else return [identifier, c];
}
const resolve41 = (i, v) => sql`${i} <> ${v}`;
const resolve42 = (i, v) => sql`${i} IS DISTINCT FROM ${v}`;
const resolve43 = (i, v) => sql`${i} IS NOT DISTINCT FROM ${v}`;
const resolve44 = (i, v) => sql`${i} < ${v}`;
const resolve45 = (i, v) => sql`${i} <= ${v}`;
const resolve46 = (i, v) => sql`${i} > ${v}`;
const resolve47 = (i, v) => sql`${i} >= ${v}`;
const resolve48 = (i, v) => sql`${i} @> ${v}`;
const resolve49 = (i, v) => sql`${i} <@ ${v}`;
const resolve50 = (i, v) => sql`${i} && ${v}`;
const resolve51 = (i, v) => sql`${v} = ANY (${i})`;
function resolveInputCodec20(c) {
  if (c.arrayOfCodec) {
    if (forceTextTypesSensitive3.includes(resolveDomains3(c.arrayOfCodec))) return TYPES.text;
    return c.arrayOfCodec;
  } else throw Error("Expected array codec");
}
const resolve52 = (i, v) => sql`${v} <> ANY (${i})`;
const resolve53 = (i, v) => sql`${v} > ANY (${i})`;
const resolve54 = (i, v) => sql`${v} >= ANY (${i})`;
const resolve55 = (i, v) => sql`${v} < ANY (${i})`;
const resolve56 = (i, v) => sql`${v} <= ANY (${i})`;
function assertAllowed34(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
function assertAllowed35(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
const colSpec21 = {
  fieldName: "rowId",
  attributeName: "id",
  attribute: spec_quote.attributes.id
};
const colSpec22 = {
  fieldName: "organizationId",
  attributeName: "organization_id",
  attribute: spec_quote.attributes.organization_id
};
const colSpec23 = {
  fieldName: "quoteNumber",
  attributeName: "quote_number",
  attribute: spec_quote.attributes.quote_number
};
const colSpec24 = {
  fieldName: "companyId",
  attributeName: "company_id",
  attribute: spec_quote.attributes.company_id
};
const colSpec25 = {
  fieldName: "status",
  attributeName: "status",
  attribute: spec_quote.attributes.status
};
function assertAllowed36(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
function assertAllowed37(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
function assertAllowed38(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
function assertAllowed39(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
const colSpec26 = {
  fieldName: "rowId",
  attributeName: "id",
  attribute: spec_quoteLineItem.attributes.id
};
const colSpec27 = {
  fieldName: "quoteId",
  attributeName: "quote_id",
  attribute: spec_quoteLineItem.attributes.quote_id
};
function assertAllowed40(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
function assertAllowed41(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
function assertAllowed42(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
function assertAllowed43(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
function assertAllowed44(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
function assertAllowed45(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
const colSpec28 = {
  fieldName: "rowId",
  attributeName: "id",
  attribute: spec_organizationSettings.attributes.id
};
const colSpec29 = {
  fieldName: "organizationId",
  attributeName: "organization_id",
  attribute: spec_organizationSettings.attributes.organization_id
};
function assertAllowed46(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
const colSpec30 = {
  fieldName: "rowId",
  attributeName: "id",
  attribute: spec_documentNumberingConfig.attributes.id
};
const colSpec31 = {
  fieldName: "organizationId",
  attributeName: "organization_id",
  attribute: spec_documentNumberingConfig.attributes.organization_id
};
const colSpec32 = {
  fieldName: "documentType",
  attributeName: "document_type",
  attribute: spec_documentNumberingConfig.attributes.document_type
};
function assertAllowed47(value, mode) {
  if (mode === "object" && !false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
  if (mode === "list" && !false) {
    const arr = value;
    if (arr) {
      const l = arr.length;
      for (let i = 0; i < l; i++) if (isEmpty(arr[i])) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
    }
  }
  if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
}
function oldPlan(_, args) {
  const $insert = pgInsertSingle(resource_productPgResource, Object.create(null));
  args.apply($insert);
  return object({
    result: $insert
  });
}
const emitEvent = (type, data, subject) => {
  import("lib/providers").then(({
    events
  }) => {
    events.emit({
      type,
      data,
      subject
    });
  });
};
const planWrapper = (plan, $record) => {
  sideEffect([$record], ([record]) => {
    if (!record?.id) return;
    emitEvent(`mantle.${"product"}.${"created"}`, {
      id: record.id
    }, record.id);
  });
  return plan();
};
function oldPlan2(_, args) {
  const $insert = pgInsertSingle(resource_document_numbering_configPgResource, Object.create(null));
  args.apply($insert);
  return object({
    result: $insert
  });
}
const planWrapper2 = (plan, $record) => {
  sideEffect([$record], ([record]) => {
    if (!record?.id) return;
    emitEvent(`mantle.${"documentNumberingConfig"}.${"created"}`, {
      id: record.id
    }, record.id);
  });
  return plan();
};
function oldPlan3(_, args) {
  const $insert = pgInsertSingle(resource_personPgResource, Object.create(null));
  args.apply($insert);
  return object({
    result: $insert
  });
}
const planWrapper3 = (plan, $record) => {
  sideEffect([$record], ([record]) => {
    if (!record?.id) return;
    emitEvent(`mantle.${"person"}.${"created"}`, {
      id: record.id
    }, record.id);
  });
  return plan();
};
function oldPlan4(_, args) {
  const $insert = pgInsertSingle(resource_companyPgResource, Object.create(null));
  args.apply($insert);
  return object({
    result: $insert
  });
}
const planWrapper4 = (plan, $record) => {
  sideEffect([$record], ([record]) => {
    if (!record?.id) return;
    emitEvent(`mantle.${"company"}.${"created"}`, {
      id: record.id
    }, record.id);
  });
  return plan();
};
function oldPlan5(_, args) {
  const $insert = pgInsertSingle(resource_invoicePgResource, Object.create(null));
  args.apply($insert);
  return object({
    result: $insert
  });
}
const planWrapper5 = (plan, $record) => {
  sideEffect([$record], ([record]) => {
    if (!record?.id) return;
    emitEvent(`mantle.${"invoice"}.${"created"}`, {
      id: record.id
    }, record.id);
  });
  return plan();
};
function oldPlan6(_, args) {
  const $insert = pgInsertSingle(resource_quotePgResource, Object.create(null));
  args.apply($insert);
  return object({
    result: $insert
  });
}
const planWrapper6 = (plan, $record) => {
  sideEffect([$record], ([record]) => {
    if (!record?.id) return;
    emitEvent(`mantle.${"quote"}.${"created"}`, {
      id: record.id
    }, record.id);
  });
  return plan();
};
const specFromArgs_CompanyMember = args => {
  const $nodeId = args.getRaw(["input", "id"]);
  return specFromNodeId(nodeIdHandler_CompanyMember, $nodeId);
};
const specFromArgs_InventoryAdjustment = args => {
  const $nodeId = args.getRaw(["input", "id"]);
  return specFromNodeId(nodeIdHandler_InventoryAdjustment, $nodeId);
};
const specFromArgs_InvoiceLineItem = args => {
  const $nodeId = args.getRaw(["input", "id"]);
  return specFromNodeId(nodeIdHandler_InvoiceLineItem, $nodeId);
};
const specFromArgs_OrganizationSetting = args => {
  const $nodeId = args.getRaw(["input", "id"]);
  return specFromNodeId(nodeIdHandler_OrganizationSetting, $nodeId);
};
const specFromArgs_Product = args => {
  const $nodeId = args.getRaw(["input", "id"]);
  return specFromNodeId(nodeIdHandler_Product, $nodeId);
};
const oldPlan7 = (_$root, args) => {
  const $update = pgUpdateSingle(resource_productPgResource, {
    id: args.getRaw(['input', "rowId"])
  });
  args.apply($update);
  return object({
    result: $update
  });
};
const planWrapper7 = (plan, $record) => {
  sideEffect([$record], ([record]) => {
    if (!record?.id) return;
    emitEvent(`mantle.${"product"}.${"updated"}`, {
      id: record.id
    }, record.id);
  });
  return plan();
};
const specFromArgs_DocumentNumberingConfig = args => {
  const $nodeId = args.getRaw(["input", "id"]);
  return specFromNodeId(nodeIdHandler_DocumentNumberingConfig, $nodeId);
};
const oldPlan8 = (_$root, args) => {
  const $update = pgUpdateSingle(resource_document_numbering_configPgResource, {
    id: args.getRaw(['input', "rowId"])
  });
  args.apply($update);
  return object({
    result: $update
  });
};
const planWrapper8 = (plan, $record) => {
  sideEffect([$record], ([record]) => {
    if (!record?.id) return;
    emitEvent(`mantle.${"documentNumberingConfig"}.${"updated"}`, {
      id: record.id
    }, record.id);
  });
  return plan();
};
const specFromArgs_Person = args => {
  const $nodeId = args.getRaw(["input", "id"]);
  return specFromNodeId(nodeIdHandler_Person, $nodeId);
};
const oldPlan9 = (_$root, args) => {
  const $update = pgUpdateSingle(resource_personPgResource, {
    id: args.getRaw(['input', "rowId"])
  });
  args.apply($update);
  return object({
    result: $update
  });
};
const planWrapper9 = (plan, $record) => {
  sideEffect([$record], ([record]) => {
    if (!record?.id) return;
    emitEvent(`mantle.${"person"}.${"updated"}`, {
      id: record.id
    }, record.id);
  });
  return plan();
};
const specFromArgs_Company = args => {
  const $nodeId = args.getRaw(["input", "id"]);
  return specFromNodeId(nodeIdHandler_Company, $nodeId);
};
const oldPlan10 = (_$root, args) => {
  const $update = pgUpdateSingle(resource_companyPgResource, {
    id: args.getRaw(['input', "rowId"])
  });
  args.apply($update);
  return object({
    result: $update
  });
};
const planWrapper10 = (plan, $record) => {
  sideEffect([$record], ([record]) => {
    if (!record?.id) return;
    emitEvent(`mantle.${"company"}.${"updated"}`, {
      id: record.id
    }, record.id);
  });
  return plan();
};
const specFromArgs_QuoteLineItem = args => {
  const $nodeId = args.getRaw(["input", "id"]);
  return specFromNodeId(nodeIdHandler_QuoteLineItem, $nodeId);
};
const specFromArgs_Invoice = args => {
  const $nodeId = args.getRaw(["input", "id"]);
  return specFromNodeId(nodeIdHandler_Invoice, $nodeId);
};
const oldPlan11 = (_$root, args) => {
  const $update = pgUpdateSingle(resource_invoicePgResource, {
    id: args.getRaw(['input', "rowId"])
  });
  args.apply($update);
  return object({
    result: $update
  });
};
const planWrapper11 = (plan, $record) => {
  sideEffect([$record], ([record]) => {
    if (!record?.id) return;
    emitEvent(`mantle.${"invoice"}.${"updated"}`, {
      id: record.id
    }, record.id);
  });
  return plan();
};
const specFromArgs_Quote = args => {
  const $nodeId = args.getRaw(["input", "id"]);
  return specFromNodeId(nodeIdHandler_Quote, $nodeId);
};
const oldPlan12 = (_$root, args) => {
  const $update = pgUpdateSingle(resource_quotePgResource, {
    id: args.getRaw(['input', "rowId"])
  });
  args.apply($update);
  return object({
    result: $update
  });
};
const planWrapper12 = (plan, $record) => {
  sideEffect([$record], ([record]) => {
    if (!record?.id) return;
    emitEvent(`mantle.${"quote"}.${"updated"}`, {
      id: record.id
    }, record.id);
  });
  return plan();
};
const specFromArgs_CompanyMember2 = args => {
  const $nodeId = args.getRaw(["input", "id"]);
  return specFromNodeId(nodeIdHandler_CompanyMember, $nodeId);
};
const specFromArgs_InventoryAdjustment2 = args => {
  const $nodeId = args.getRaw(["input", "id"]);
  return specFromNodeId(nodeIdHandler_InventoryAdjustment, $nodeId);
};
const specFromArgs_InvoiceLineItem2 = args => {
  const $nodeId = args.getRaw(["input", "id"]);
  return specFromNodeId(nodeIdHandler_InvoiceLineItem, $nodeId);
};
const specFromArgs_OrganizationSetting2 = args => {
  const $nodeId = args.getRaw(["input", "id"]);
  return specFromNodeId(nodeIdHandler_OrganizationSetting, $nodeId);
};
const specFromArgs_Product2 = args => {
  const $nodeId = args.getRaw(["input", "id"]);
  return specFromNodeId(nodeIdHandler_Product, $nodeId);
};
const oldPlan13 = (_$root, args) => {
  const $delete = pgDeleteSingle(resource_productPgResource, {
    id: args.getRaw(['input', "rowId"])
  });
  args.apply($delete);
  return object({
    result: $delete
  });
};
const planWrapper13 = (plan, $record) => {
  sideEffect([$record], ([record]) => {
    if (!record?.id) return;
    emitEvent(`mantle.${"product"}.${"deleted"}`, {
      id: record.id
    }, record.id);
  });
  return plan();
};
const specFromArgs_DocumentNumberingConfig2 = args => {
  const $nodeId = args.getRaw(["input", "id"]);
  return specFromNodeId(nodeIdHandler_DocumentNumberingConfig, $nodeId);
};
const oldPlan14 = (_$root, args) => {
  const $delete = pgDeleteSingle(resource_document_numbering_configPgResource, {
    id: args.getRaw(['input', "rowId"])
  });
  args.apply($delete);
  return object({
    result: $delete
  });
};
const planWrapper14 = (plan, $record) => {
  sideEffect([$record], ([record]) => {
    if (!record?.id) return;
    emitEvent(`mantle.${"documentNumberingConfig"}.${"deleted"}`, {
      id: record.id
    }, record.id);
  });
  return plan();
};
const specFromArgs_Person2 = args => {
  const $nodeId = args.getRaw(["input", "id"]);
  return specFromNodeId(nodeIdHandler_Person, $nodeId);
};
const oldPlan15 = (_$root, args) => {
  const $delete = pgDeleteSingle(resource_personPgResource, {
    id: args.getRaw(['input', "rowId"])
  });
  args.apply($delete);
  return object({
    result: $delete
  });
};
const planWrapper15 = (plan, $record) => {
  sideEffect([$record], ([record]) => {
    if (!record?.id) return;
    emitEvent(`mantle.${"person"}.${"deleted"}`, {
      id: record.id
    }, record.id);
  });
  return plan();
};
const specFromArgs_Company2 = args => {
  const $nodeId = args.getRaw(["input", "id"]);
  return specFromNodeId(nodeIdHandler_Company, $nodeId);
};
const oldPlan16 = (_$root, args) => {
  const $delete = pgDeleteSingle(resource_companyPgResource, {
    id: args.getRaw(['input', "rowId"])
  });
  args.apply($delete);
  return object({
    result: $delete
  });
};
const planWrapper16 = (plan, $record) => {
  sideEffect([$record], ([record]) => {
    if (!record?.id) return;
    emitEvent(`mantle.${"company"}.${"deleted"}`, {
      id: record.id
    }, record.id);
  });
  return plan();
};
const specFromArgs_QuoteLineItem2 = args => {
  const $nodeId = args.getRaw(["input", "id"]);
  return specFromNodeId(nodeIdHandler_QuoteLineItem, $nodeId);
};
const specFromArgs_Invoice2 = args => {
  const $nodeId = args.getRaw(["input", "id"]);
  return specFromNodeId(nodeIdHandler_Invoice, $nodeId);
};
const oldPlan17 = (_$root, args) => {
  const $delete = pgDeleteSingle(resource_invoicePgResource, {
    id: args.getRaw(['input', "rowId"])
  });
  args.apply($delete);
  return object({
    result: $delete
  });
};
const planWrapper17 = (plan, $record) => {
  sideEffect([$record], ([record]) => {
    if (!record?.id) return;
    emitEvent(`mantle.${"invoice"}.${"deleted"}`, {
      id: record.id
    }, record.id);
  });
  return plan();
};
const specFromArgs_Quote2 = args => {
  const $nodeId = args.getRaw(["input", "id"]);
  return specFromNodeId(nodeIdHandler_Quote, $nodeId);
};
const oldPlan18 = (_$root, args) => {
  const $delete = pgDeleteSingle(resource_quotePgResource, {
    id: args.getRaw(['input', "rowId"])
  });
  args.apply($delete);
  return object({
    result: $delete
  });
};
const planWrapper18 = (plan, $record) => {
  sideEffect([$record], ([record]) => {
    if (!record?.id) return;
    emitEvent(`mantle.${"quote"}.${"deleted"}`, {
      id: record.id
    }, record.id);
  });
  return plan();
};
const defaultPrefix = docType => {
  switch (docType) {
    case "quote":
      return "QT";
    case "invoice":
      return "INV";
    default:
      return docType.slice(0, 3).toUpperCase();
  }
};
const generateRandomHex = length => {
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(Math.ceil(length / 2)));
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("").toUpperCase().slice(0, length);
};
const assembleNumber = (prefix, separator, datePart, idPart) => {
  const parts = [];
  if (prefix) parts.push(prefix);
  if (datePart) parts.push(datePart);
  parts.push(idPart);
  return parts.join(separator);
};
const buildDatePart = dateFormat => {
  if (!dateFormat) return "";
  const now = new Date(),
    yyyy = now.getFullYear().toString(),
    mm = (now.getMonth() + 1).toString().padStart(2, "0");
  switch (dateFormat) {
    case "YYYY":
      return yyyy;
    case "YYMM":
      return `${yyyy.slice(2)}${mm}`;
    case "YYYYMM":
      return `${yyyy}${mm}`;
    default:
      return "";
  }
};
const getPgSelectSingleFromMutationResult = (resource, pkAttributes, $mutation) => {
  const $result = $mutation.getStepForKey("result", !0);
  if (!$result) return null;
  if ($result instanceof PgDeleteSingleStep) return pgSelectFromRecord($result.resource, $result.record());else {
    const spec = pkAttributes.reduce((memo, attributeName) => {
      memo[attributeName] = $result.get(attributeName);
      return memo;
    }, Object.create(null));
    return resource.find(spec);
  }
};
const pgMutationPayloadEdge = (resource, pkAttributes, $mutation, fieldArgs) => {
  const $select = getPgSelectSingleFromMutationResult(resource, pkAttributes, $mutation);
  if (!$select) return constant(null);
  fieldArgs.apply($select, "orderBy");
  const $connection = connection($select);
  return new EdgeStep($connection, first($connection));
};
export const typeDefs = /* GraphQL */`"""The root query type which gives access points into the data universe."""
type Query implements Node {
  """
  Exposes the root query type nested one level down. This is helpful for Relay 1
  which can only query top level fields if they are in a particular form.
  """
  query: Query!

  """
  The root query type must be a \`Node\` to work well with Relay 1 mutations. This just resolves to \`query\`.
  """
  id: ID!

  """Fetches an object given its globally unique \`ID\`."""
  node(
    """The globally unique \`ID\`."""
    id: ID!
  ): Node

  """Get a single \`CompanyMember\`."""
  companyMember(rowId: UUID!): CompanyMember

  """Get a single \`InventoryAdjustment\`."""
  inventoryAdjustment(rowId: UUID!): InventoryAdjustment

  """Get a single \`InvoiceLineItem\`."""
  invoiceLineItem(rowId: UUID!): InvoiceLineItem

  """Get a single \`OrganizationSetting\`."""
  organizationSetting(rowId: UUID!): OrganizationSetting

  """Get a single \`Product\`."""
  product(rowId: UUID!): Product

  """Get a single \`DocumentNumberingConfig\`."""
  documentNumberingConfig(rowId: UUID!): DocumentNumberingConfig

  """Get a single \`Person\`."""
  person(rowId: UUID!): Person

  """Get a single \`Company\`."""
  company(rowId: UUID!): Company

  """Get a single \`QuoteLineItem\`."""
  quoteLineItem(rowId: UUID!): QuoteLineItem

  """Get a single \`Invoice\`."""
  invoice(rowId: UUID!): Invoice

  """Get a single \`Quote\`."""
  quote(rowId: UUID!): Quote

  """Reads a single \`CompanyMember\` using its globally unique \`ID\`."""
  companyMemberById(
    """
    The globally unique \`ID\` to be used in selecting a single \`CompanyMember\`.
    """
    id: ID!
  ): CompanyMember

  """Reads a single \`InventoryAdjustment\` using its globally unique \`ID\`."""
  inventoryAdjustmentById(
    """
    The globally unique \`ID\` to be used in selecting a single \`InventoryAdjustment\`.
    """
    id: ID!
  ): InventoryAdjustment

  """Reads a single \`InvoiceLineItem\` using its globally unique \`ID\`."""
  invoiceLineItemById(
    """
    The globally unique \`ID\` to be used in selecting a single \`InvoiceLineItem\`.
    """
    id: ID!
  ): InvoiceLineItem

  """Reads a single \`OrganizationSetting\` using its globally unique \`ID\`."""
  organizationSettingById(
    """
    The globally unique \`ID\` to be used in selecting a single \`OrganizationSetting\`.
    """
    id: ID!
  ): OrganizationSetting

  """Reads a single \`Product\` using its globally unique \`ID\`."""
  productById(
    """The globally unique \`ID\` to be used in selecting a single \`Product\`."""
    id: ID!
  ): Product

  """
  Reads a single \`DocumentNumberingConfig\` using its globally unique \`ID\`.
  """
  documentNumberingConfigById(
    """
    The globally unique \`ID\` to be used in selecting a single \`DocumentNumberingConfig\`.
    """
    id: ID!
  ): DocumentNumberingConfig

  """Reads a single \`Person\` using its globally unique \`ID\`."""
  personById(
    """The globally unique \`ID\` to be used in selecting a single \`Person\`."""
    id: ID!
  ): Person

  """Reads a single \`Company\` using its globally unique \`ID\`."""
  companyById(
    """The globally unique \`ID\` to be used in selecting a single \`Company\`."""
    id: ID!
  ): Company

  """Reads a single \`QuoteLineItem\` using its globally unique \`ID\`."""
  quoteLineItemById(
    """
    The globally unique \`ID\` to be used in selecting a single \`QuoteLineItem\`.
    """
    id: ID!
  ): QuoteLineItem

  """Reads a single \`Invoice\` using its globally unique \`ID\`."""
  invoiceById(
    """The globally unique \`ID\` to be used in selecting a single \`Invoice\`."""
    id: ID!
  ): Invoice

  """Reads a single \`Quote\` using its globally unique \`ID\`."""
  quoteById(
    """The globally unique \`ID\` to be used in selecting a single \`Quote\`."""
    id: ID!
  ): Quote

  """Reads and enables pagination through a set of \`CompanyMember\`."""
  companyMembers(
    """Only read the first \`n\` values of the set."""
    first: Int

    """Only read the last \`n\` values of the set."""
    last: Int

    """
    Skip the first \`n\` values from our \`after\` cursor, an alternative to cursor
    based pagination. May not be used with \`last\`.
    """
    offset: Int

    """Read all values in the set before (above) this cursor."""
    before: Cursor

    """Read all values in the set after (below) this cursor."""
    after: Cursor

    """
    A condition to be used in determining which values should be returned by the collection.
    """
    condition: CompanyMemberCondition

    """
    A filter to be used in determining which values should be returned by the collection.
    """
    filter: CompanyMemberFilter

    """The method to use when ordering \`CompanyMember\`."""
    orderBy: [CompanyMemberOrderBy!] = [PRIMARY_KEY_ASC]
  ): CompanyMemberConnection

  """Reads and enables pagination through a set of \`InventoryAdjustment\`."""
  inventoryAdjustments(
    """Only read the first \`n\` values of the set."""
    first: Int

    """Only read the last \`n\` values of the set."""
    last: Int

    """
    Skip the first \`n\` values from our \`after\` cursor, an alternative to cursor
    based pagination. May not be used with \`last\`.
    """
    offset: Int

    """Read all values in the set before (above) this cursor."""
    before: Cursor

    """Read all values in the set after (below) this cursor."""
    after: Cursor

    """
    A condition to be used in determining which values should be returned by the collection.
    """
    condition: InventoryAdjustmentCondition

    """
    A filter to be used in determining which values should be returned by the collection.
    """
    filter: InventoryAdjustmentFilter

    """The method to use when ordering \`InventoryAdjustment\`."""
    orderBy: [InventoryAdjustmentOrderBy!] = [PRIMARY_KEY_ASC]
  ): InventoryAdjustmentConnection

  """Reads and enables pagination through a set of \`InvoiceLineItem\`."""
  invoiceLineItems(
    """Only read the first \`n\` values of the set."""
    first: Int

    """Only read the last \`n\` values of the set."""
    last: Int

    """
    Skip the first \`n\` values from our \`after\` cursor, an alternative to cursor
    based pagination. May not be used with \`last\`.
    """
    offset: Int

    """Read all values in the set before (above) this cursor."""
    before: Cursor

    """Read all values in the set after (below) this cursor."""
    after: Cursor

    """
    A condition to be used in determining which values should be returned by the collection.
    """
    condition: InvoiceLineItemCondition

    """
    A filter to be used in determining which values should be returned by the collection.
    """
    filter: InvoiceLineItemFilter

    """The method to use when ordering \`InvoiceLineItem\`."""
    orderBy: [InvoiceLineItemOrderBy!] = [PRIMARY_KEY_ASC]
  ): InvoiceLineItemConnection

  """Reads and enables pagination through a set of \`OrganizationSetting\`."""
  organizationSettings(
    """Only read the first \`n\` values of the set."""
    first: Int

    """Only read the last \`n\` values of the set."""
    last: Int

    """
    Skip the first \`n\` values from our \`after\` cursor, an alternative to cursor
    based pagination. May not be used with \`last\`.
    """
    offset: Int

    """Read all values in the set before (above) this cursor."""
    before: Cursor

    """Read all values in the set after (below) this cursor."""
    after: Cursor

    """
    A condition to be used in determining which values should be returned by the collection.
    """
    condition: OrganizationSettingCondition

    """
    A filter to be used in determining which values should be returned by the collection.
    """
    filter: OrganizationSettingFilter

    """The method to use when ordering \`OrganizationSetting\`."""
    orderBy: [OrganizationSettingOrderBy!] = [PRIMARY_KEY_ASC]
  ): OrganizationSettingConnection

  """Reads and enables pagination through a set of \`Product\`."""
  products(
    """Only read the first \`n\` values of the set."""
    first: Int

    """Only read the last \`n\` values of the set."""
    last: Int

    """
    Skip the first \`n\` values from our \`after\` cursor, an alternative to cursor
    based pagination. May not be used with \`last\`.
    """
    offset: Int

    """Read all values in the set before (above) this cursor."""
    before: Cursor

    """Read all values in the set after (below) this cursor."""
    after: Cursor

    """
    A condition to be used in determining which values should be returned by the collection.
    """
    condition: ProductCondition

    """
    A filter to be used in determining which values should be returned by the collection.
    """
    filter: ProductFilter

    """The method to use when ordering \`Product\`."""
    orderBy: [ProductOrderBy!] = [PRIMARY_KEY_ASC]
  ): ProductConnection

  """
  Reads and enables pagination through a set of \`DocumentNumberingConfig\`.
  """
  documentNumberingConfigs(
    """Only read the first \`n\` values of the set."""
    first: Int

    """Only read the last \`n\` values of the set."""
    last: Int

    """
    Skip the first \`n\` values from our \`after\` cursor, an alternative to cursor
    based pagination. May not be used with \`last\`.
    """
    offset: Int

    """Read all values in the set before (above) this cursor."""
    before: Cursor

    """Read all values in the set after (below) this cursor."""
    after: Cursor

    """
    A condition to be used in determining which values should be returned by the collection.
    """
    condition: DocumentNumberingConfigCondition

    """
    A filter to be used in determining which values should be returned by the collection.
    """
    filter: DocumentNumberingConfigFilter

    """The method to use when ordering \`DocumentNumberingConfig\`."""
    orderBy: [DocumentNumberingConfigOrderBy!] = [PRIMARY_KEY_ASC]
  ): DocumentNumberingConfigConnection

  """Reads and enables pagination through a set of \`Person\`."""
  people(
    """Only read the first \`n\` values of the set."""
    first: Int

    """Only read the last \`n\` values of the set."""
    last: Int

    """
    Skip the first \`n\` values from our \`after\` cursor, an alternative to cursor
    based pagination. May not be used with \`last\`.
    """
    offset: Int

    """Read all values in the set before (above) this cursor."""
    before: Cursor

    """Read all values in the set after (below) this cursor."""
    after: Cursor

    """
    A condition to be used in determining which values should be returned by the collection.
    """
    condition: PersonCondition

    """
    A filter to be used in determining which values should be returned by the collection.
    """
    filter: PersonFilter

    """The method to use when ordering \`Person\`."""
    orderBy: [PersonOrderBy!] = [PRIMARY_KEY_ASC]
  ): PersonConnection

  """Reads and enables pagination through a set of \`Company\`."""
  companies(
    """Only read the first \`n\` values of the set."""
    first: Int

    """Only read the last \`n\` values of the set."""
    last: Int

    """
    Skip the first \`n\` values from our \`after\` cursor, an alternative to cursor
    based pagination. May not be used with \`last\`.
    """
    offset: Int

    """Read all values in the set before (above) this cursor."""
    before: Cursor

    """Read all values in the set after (below) this cursor."""
    after: Cursor

    """
    A condition to be used in determining which values should be returned by the collection.
    """
    condition: CompanyCondition

    """
    A filter to be used in determining which values should be returned by the collection.
    """
    filter: CompanyFilter

    """The method to use when ordering \`Company\`."""
    orderBy: [CompanyOrderBy!] = [PRIMARY_KEY_ASC]
  ): CompanyConnection

  """Reads and enables pagination through a set of \`QuoteLineItem\`."""
  quoteLineItems(
    """Only read the first \`n\` values of the set."""
    first: Int

    """Only read the last \`n\` values of the set."""
    last: Int

    """
    Skip the first \`n\` values from our \`after\` cursor, an alternative to cursor
    based pagination. May not be used with \`last\`.
    """
    offset: Int

    """Read all values in the set before (above) this cursor."""
    before: Cursor

    """Read all values in the set after (below) this cursor."""
    after: Cursor

    """
    A condition to be used in determining which values should be returned by the collection.
    """
    condition: QuoteLineItemCondition

    """
    A filter to be used in determining which values should be returned by the collection.
    """
    filter: QuoteLineItemFilter

    """The method to use when ordering \`QuoteLineItem\`."""
    orderBy: [QuoteLineItemOrderBy!] = [PRIMARY_KEY_ASC]
  ): QuoteLineItemConnection

  """Reads and enables pagination through a set of \`Invoice\`."""
  invoices(
    """Only read the first \`n\` values of the set."""
    first: Int

    """Only read the last \`n\` values of the set."""
    last: Int

    """
    Skip the first \`n\` values from our \`after\` cursor, an alternative to cursor
    based pagination. May not be used with \`last\`.
    """
    offset: Int

    """Read all values in the set before (above) this cursor."""
    before: Cursor

    """Read all values in the set after (below) this cursor."""
    after: Cursor

    """
    A condition to be used in determining which values should be returned by the collection.
    """
    condition: InvoiceCondition

    """
    A filter to be used in determining which values should be returned by the collection.
    """
    filter: InvoiceFilter

    """The method to use when ordering \`Invoice\`."""
    orderBy: [InvoiceOrderBy!] = [PRIMARY_KEY_ASC]
  ): InvoiceConnection

  """Reads and enables pagination through a set of \`Quote\`."""
  quotes(
    """Only read the first \`n\` values of the set."""
    first: Int

    """Only read the last \`n\` values of the set."""
    last: Int

    """
    Skip the first \`n\` values from our \`after\` cursor, an alternative to cursor
    based pagination. May not be used with \`last\`.
    """
    offset: Int

    """Read all values in the set before (above) this cursor."""
    before: Cursor

    """Read all values in the set after (below) this cursor."""
    after: Cursor

    """
    A condition to be used in determining which values should be returned by the collection.
    """
    condition: QuoteCondition

    """
    A filter to be used in determining which values should be returned by the collection.
    """
    filter: QuoteFilter

    """The method to use when ordering \`Quote\`."""
    orderBy: [QuoteOrderBy!] = [PRIMARY_KEY_ASC]
  ): QuoteConnection
}

"""An object with a globally unique \`ID\`."""
interface Node {
  """
  A globally unique identifier. Can be used in various places throughout the system to identify this single value.
  """
  id: ID!
}

type CompanyMember implements Node {
  """
  A globally unique identifier. Can be used in various places throughout the system to identify this single value.
  """
  id: ID!
  rowId: UUID!
  companyId: UUID!
  personId: UUID!
  title: String
  isPrimary: Boolean
  createdAt: Datetime

  """Reads a single \`Company\` that is related to this \`CompanyMember\`."""
  company: Company

  """Reads a single \`Person\` that is related to this \`CompanyMember\`."""
  person: Person
}

"""
A universally unique identifier as defined by [RFC 4122](https://tools.ietf.org/html/rfc4122).
"""
scalar UUID

"""
A point in time as described by the [ISO
8601](https://en.wikipedia.org/wiki/ISO_8601) and, if it has a timezone, [RFC
3339](https://datatracker.ietf.org/doc/html/rfc3339) standards. Input values
that do not conform to both ISO 8601 and RFC 3339 may be coerced, which may lead
to unexpected results.
"""
scalar Datetime

type Company implements Node {
  """
  A globally unique identifier. Can be used in various places throughout the system to identify this single value.
  """
  id: ID!
  rowId: UUID!
  organizationId: String!
  name: String!
  website: String
  industry: String
  phone: String
  email: String
  addressLine1: String
  addressLine2: String
  city: String
  state: String
  postalCode: String
  country: String
  notes: String
  createdAt: Datetime
  updatedAt: Datetime

  """Reads and enables pagination through a set of \`CompanyMember\`."""
  companyMembers(
    """Only read the first \`n\` values of the set."""
    first: Int

    """Only read the last \`n\` values of the set."""
    last: Int

    """
    Skip the first \`n\` values from our \`after\` cursor, an alternative to cursor
    based pagination. May not be used with \`last\`.
    """
    offset: Int

    """Read all values in the set before (above) this cursor."""
    before: Cursor

    """Read all values in the set after (below) this cursor."""
    after: Cursor

    """
    A condition to be used in determining which values should be returned by the collection.
    """
    condition: CompanyMemberCondition

    """
    A filter to be used in determining which values should be returned by the collection.
    """
    filter: CompanyMemberFilter

    """The method to use when ordering \`CompanyMember\`."""
    orderBy: [CompanyMemberOrderBy!] = [PRIMARY_KEY_ASC]
  ): CompanyMemberConnection!

  """Reads and enables pagination through a set of \`Invoice\`."""
  invoices(
    """Only read the first \`n\` values of the set."""
    first: Int

    """Only read the last \`n\` values of the set."""
    last: Int

    """
    Skip the first \`n\` values from our \`after\` cursor, an alternative to cursor
    based pagination. May not be used with \`last\`.
    """
    offset: Int

    """Read all values in the set before (above) this cursor."""
    before: Cursor

    """Read all values in the set after (below) this cursor."""
    after: Cursor

    """
    A condition to be used in determining which values should be returned by the collection.
    """
    condition: InvoiceCondition

    """
    A filter to be used in determining which values should be returned by the collection.
    """
    filter: InvoiceFilter

    """The method to use when ordering \`Invoice\`."""
    orderBy: [InvoiceOrderBy!] = [PRIMARY_KEY_ASC]
  ): InvoiceConnection!

  """Reads and enables pagination through a set of \`Quote\`."""
  quotes(
    """Only read the first \`n\` values of the set."""
    first: Int

    """Only read the last \`n\` values of the set."""
    last: Int

    """
    Skip the first \`n\` values from our \`after\` cursor, an alternative to cursor
    based pagination. May not be used with \`last\`.
    """
    offset: Int

    """Read all values in the set before (above) this cursor."""
    before: Cursor

    """Read all values in the set after (below) this cursor."""
    after: Cursor

    """
    A condition to be used in determining which values should be returned by the collection.
    """
    condition: QuoteCondition

    """
    A filter to be used in determining which values should be returned by the collection.
    """
    filter: QuoteFilter

    """The method to use when ordering \`Quote\`."""
    orderBy: [QuoteOrderBy!] = [PRIMARY_KEY_ASC]
  ): QuoteConnection!
}

"""A connection to a list of \`CompanyMember\` values."""
type CompanyMemberConnection {
  """A list of \`CompanyMember\` objects."""
  nodes: [CompanyMember]!

  """
  A list of edges which contains the \`CompanyMember\` and cursor to aid in pagination.
  """
  edges: [CompanyMemberEdge]!

  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """The count of *all* \`CompanyMember\` you could get from the connection."""
  totalCount: Int!
}

"""A \`CompanyMember\` edge in the connection."""
type CompanyMemberEdge {
  """A cursor for use in pagination."""
  cursor: Cursor

  """The \`CompanyMember\` at the end of the edge."""
  node: CompanyMember
}

"""A location in a connection that can be used for resuming pagination."""
scalar Cursor

"""Information about pagination in a connection."""
type PageInfo {
  """When paginating forwards, are there more items?"""
  hasNextPage: Boolean!

  """When paginating backwards, are there more items?"""
  hasPreviousPage: Boolean!

  """When paginating backwards, the cursor to continue."""
  startCursor: Cursor

  """When paginating forwards, the cursor to continue."""
  endCursor: Cursor
}

"""
A condition to be used against \`CompanyMember\` object types. All fields are
tested for equality and combined with a logical ‘and.’
"""
input CompanyMemberCondition {
  """Checks for equality with the object’s \`rowId\` field."""
  rowId: UUID

  """Checks for equality with the object’s \`companyId\` field."""
  companyId: UUID

  """Checks for equality with the object’s \`personId\` field."""
  personId: UUID
}

"""
A filter to be used against \`CompanyMember\` object types. All fields are combined with a logical ‘and.’
"""
input CompanyMemberFilter {
  """Filter by the object’s \`rowId\` field."""
  rowId: UUIDFilter

  """Filter by the object’s \`companyId\` field."""
  companyId: UUIDFilter

  """Filter by the object’s \`personId\` field."""
  personId: UUIDFilter

  """Filter by the object’s \`company\` relation."""
  company: CompanyFilter

  """Filter by the object’s \`person\` relation."""
  person: PersonFilter

  """Checks for all expressions in this list."""
  and: [CompanyMemberFilter!]

  """Checks for any expressions in this list."""
  or: [CompanyMemberFilter!]

  """Negates the expression."""
  not: CompanyMemberFilter
}

"""
A filter to be used against UUID fields. All fields are combined with a logical ‘and.’
"""
input UUIDFilter {
  """
  Is null (if \`true\` is specified) or is not null (if \`false\` is specified).
  """
  isNull: Boolean

  """Equal to the specified value."""
  equalTo: UUID

  """Not equal to the specified value."""
  notEqualTo: UUID

  """
  Not equal to the specified value, treating null like an ordinary value.
  """
  distinctFrom: UUID

  """Equal to the specified value, treating null like an ordinary value."""
  notDistinctFrom: UUID

  """Included in the specified list."""
  in: [UUID!]

  """Not included in the specified list."""
  notIn: [UUID!]

  """Less than the specified value."""
  lessThan: UUID

  """Less than or equal to the specified value."""
  lessThanOrEqualTo: UUID

  """Greater than the specified value."""
  greaterThan: UUID

  """Greater than or equal to the specified value."""
  greaterThanOrEqualTo: UUID
}

"""
A filter to be used against \`Company\` object types. All fields are combined with a logical ‘and.’
"""
input CompanyFilter {
  """Filter by the object’s \`rowId\` field."""
  rowId: UUIDFilter

  """Filter by the object’s \`organizationId\` field."""
  organizationId: StringFilter

  """Filter by the object’s \`companyMembers\` relation."""
  companyMembers: CompanyToManyCompanyMemberFilter

  """Some related \`companyMembers\` exist."""
  companyMembersExist: Boolean

  """Filter by the object’s \`invoices\` relation."""
  invoices: CompanyToManyInvoiceFilter

  """Some related \`invoices\` exist."""
  invoicesExist: Boolean

  """Filter by the object’s \`quotes\` relation."""
  quotes: CompanyToManyQuoteFilter

  """Some related \`quotes\` exist."""
  quotesExist: Boolean

  """Checks for all expressions in this list."""
  and: [CompanyFilter!]

  """Checks for any expressions in this list."""
  or: [CompanyFilter!]

  """Negates the expression."""
  not: CompanyFilter
}

"""
A filter to be used against String fields. All fields are combined with a logical ‘and.’
"""
input StringFilter {
  """
  Is null (if \`true\` is specified) or is not null (if \`false\` is specified).
  """
  isNull: Boolean

  """Equal to the specified value."""
  equalTo: String

  """Not equal to the specified value."""
  notEqualTo: String

  """
  Not equal to the specified value, treating null like an ordinary value.
  """
  distinctFrom: String

  """Equal to the specified value, treating null like an ordinary value."""
  notDistinctFrom: String

  """Included in the specified list."""
  in: [String!]

  """Not included in the specified list."""
  notIn: [String!]

  """Less than the specified value."""
  lessThan: String

  """Less than or equal to the specified value."""
  lessThanOrEqualTo: String

  """Greater than the specified value."""
  greaterThan: String

  """Greater than or equal to the specified value."""
  greaterThanOrEqualTo: String

  """Contains the specified string (case-sensitive)."""
  includes: String

  """Does not contain the specified string (case-sensitive)."""
  notIncludes: String

  """Contains the specified string (case-insensitive)."""
  includesInsensitive: String

  """Does not contain the specified string (case-insensitive)."""
  notIncludesInsensitive: String

  """Starts with the specified string (case-sensitive)."""
  startsWith: String

  """Does not start with the specified string (case-sensitive)."""
  notStartsWith: String

  """Starts with the specified string (case-insensitive)."""
  startsWithInsensitive: String

  """Does not start with the specified string (case-insensitive)."""
  notStartsWithInsensitive: String

  """Ends with the specified string (case-sensitive)."""
  endsWith: String

  """Does not end with the specified string (case-sensitive)."""
  notEndsWith: String

  """Ends with the specified string (case-insensitive)."""
  endsWithInsensitive: String

  """Does not end with the specified string (case-insensitive)."""
  notEndsWithInsensitive: String

  """
  Matches the specified pattern (case-sensitive). An underscore (_) matches any single character; a percent sign (%) matches any sequence of zero or more characters.
  """
  like: String

  """
  Does not match the specified pattern (case-sensitive). An underscore (_) matches any single character; a percent sign (%) matches any sequence of zero or more characters.
  """
  notLike: String

  """
  Matches the specified pattern (case-insensitive). An underscore (_) matches any single character; a percent sign (%) matches any sequence of zero or more characters.
  """
  likeInsensitive: String

  """
  Does not match the specified pattern (case-insensitive). An underscore (_) matches any single character; a percent sign (%) matches any sequence of zero or more characters.
  """
  notLikeInsensitive: String

  """Equal to the specified value (case-insensitive)."""
  equalToInsensitive: String

  """Not equal to the specified value (case-insensitive)."""
  notEqualToInsensitive: String

  """
  Not equal to the specified value, treating null like an ordinary value (case-insensitive).
  """
  distinctFromInsensitive: String

  """
  Equal to the specified value, treating null like an ordinary value (case-insensitive).
  """
  notDistinctFromInsensitive: String

  """Included in the specified list (case-insensitive)."""
  inInsensitive: [String!]

  """Not included in the specified list (case-insensitive)."""
  notInInsensitive: [String!]

  """Less than the specified value (case-insensitive)."""
  lessThanInsensitive: String

  """Less than or equal to the specified value (case-insensitive)."""
  lessThanOrEqualToInsensitive: String

  """Greater than the specified value (case-insensitive)."""
  greaterThanInsensitive: String

  """Greater than or equal to the specified value (case-insensitive)."""
  greaterThanOrEqualToInsensitive: String
}

"""
A filter to be used against many \`CompanyMember\` object types. All fields are combined with a logical ‘and.’
"""
input CompanyToManyCompanyMemberFilter {
  """
  Every related \`CompanyMember\` matches the filter criteria. All fields are combined with a logical ‘and.’
  """
  every: CompanyMemberFilter

  """
  Some related \`CompanyMember\` matches the filter criteria. All fields are combined with a logical ‘and.’
  """
  some: CompanyMemberFilter

  """
  No related \`CompanyMember\` matches the filter criteria. All fields are combined with a logical ‘and.’
  """
  none: CompanyMemberFilter
}

"""
A filter to be used against many \`Invoice\` object types. All fields are combined with a logical ‘and.’
"""
input CompanyToManyInvoiceFilter {
  """
  Every related \`Invoice\` matches the filter criteria. All fields are combined with a logical ‘and.’
  """
  every: InvoiceFilter

  """
  Some related \`Invoice\` matches the filter criteria. All fields are combined with a logical ‘and.’
  """
  some: InvoiceFilter

  """
  No related \`Invoice\` matches the filter criteria. All fields are combined with a logical ‘and.’
  """
  none: InvoiceFilter
}

"""
A filter to be used against \`Invoice\` object types. All fields are combined with a logical ‘and.’
"""
input InvoiceFilter {
  """Filter by the object’s \`rowId\` field."""
  rowId: UUIDFilter

  """Filter by the object’s \`organizationId\` field."""
  organizationId: StringFilter

  """Filter by the object’s \`invoiceNumber\` field."""
  invoiceNumber: StringFilter

  """Filter by the object’s \`companyId\` field."""
  companyId: UUIDFilter

  """Filter by the object’s \`status\` field."""
  status: StringFilter

  """Filter by the object’s \`invoiceLineItems\` relation."""
  invoiceLineItems: InvoiceToManyInvoiceLineItemFilter

  """Some related \`invoiceLineItems\` exist."""
  invoiceLineItemsExist: Boolean

  """Filter by the object’s \`company\` relation."""
  company: CompanyFilter

  """A related \`company\` exists."""
  companyExists: Boolean

  """Filter by the object’s \`contact\` relation."""
  contact: PersonFilter

  """A related \`contact\` exists."""
  contactExists: Boolean

  """Checks for all expressions in this list."""
  and: [InvoiceFilter!]

  """Checks for any expressions in this list."""
  or: [InvoiceFilter!]

  """Negates the expression."""
  not: InvoiceFilter
}

"""
A filter to be used against many \`InvoiceLineItem\` object types. All fields are combined with a logical ‘and.’
"""
input InvoiceToManyInvoiceLineItemFilter {
  """
  Every related \`InvoiceLineItem\` matches the filter criteria. All fields are combined with a logical ‘and.’
  """
  every: InvoiceLineItemFilter

  """
  Some related \`InvoiceLineItem\` matches the filter criteria. All fields are combined with a logical ‘and.’
  """
  some: InvoiceLineItemFilter

  """
  No related \`InvoiceLineItem\` matches the filter criteria. All fields are combined with a logical ‘and.’
  """
  none: InvoiceLineItemFilter
}

"""
A filter to be used against \`InvoiceLineItem\` object types. All fields are combined with a logical ‘and.’
"""
input InvoiceLineItemFilter {
  """Filter by the object’s \`rowId\` field."""
  rowId: UUIDFilter

  """Filter by the object’s \`invoiceId\` field."""
  invoiceId: UUIDFilter

  """Filter by the object’s \`invoice\` relation."""
  invoice: InvoiceFilter

  """Filter by the object’s \`product\` relation."""
  product: ProductFilter

  """A related \`product\` exists."""
  productExists: Boolean

  """Checks for all expressions in this list."""
  and: [InvoiceLineItemFilter!]

  """Checks for any expressions in this list."""
  or: [InvoiceLineItemFilter!]

  """Negates the expression."""
  not: InvoiceLineItemFilter
}

"""
A filter to be used against \`Product\` object types. All fields are combined with a logical ‘and.’
"""
input ProductFilter {
  """Filter by the object’s \`rowId\` field."""
  rowId: UUIDFilter

  """Filter by the object’s \`organizationId\` field."""
  organizationId: StringFilter

  """Filter by the object’s \`sku\` field."""
  sku: StringFilter

  """Filter by the object’s \`inventoryAdjustments\` relation."""
  inventoryAdjustments: ProductToManyInventoryAdjustmentFilter

  """Some related \`inventoryAdjustments\` exist."""
  inventoryAdjustmentsExist: Boolean

  """Checks for all expressions in this list."""
  and: [ProductFilter!]

  """Checks for any expressions in this list."""
  or: [ProductFilter!]

  """Negates the expression."""
  not: ProductFilter
}

"""
A filter to be used against many \`InventoryAdjustment\` object types. All fields are combined with a logical ‘and.’
"""
input ProductToManyInventoryAdjustmentFilter {
  """
  Every related \`InventoryAdjustment\` matches the filter criteria. All fields are combined with a logical ‘and.’
  """
  every: InventoryAdjustmentFilter

  """
  Some related \`InventoryAdjustment\` matches the filter criteria. All fields are combined with a logical ‘and.’
  """
  some: InventoryAdjustmentFilter

  """
  No related \`InventoryAdjustment\` matches the filter criteria. All fields are combined with a logical ‘and.’
  """
  none: InventoryAdjustmentFilter
}

"""
A filter to be used against \`InventoryAdjustment\` object types. All fields are combined with a logical ‘and.’
"""
input InventoryAdjustmentFilter {
  """Filter by the object’s \`rowId\` field."""
  rowId: UUIDFilter

  """Filter by the object’s \`productId\` field."""
  productId: UUIDFilter

  """Filter by the object’s \`product\` relation."""
  product: ProductFilter

  """Checks for all expressions in this list."""
  and: [InventoryAdjustmentFilter!]

  """Checks for any expressions in this list."""
  or: [InventoryAdjustmentFilter!]

  """Negates the expression."""
  not: InventoryAdjustmentFilter
}

"""
A filter to be used against \`Person\` object types. All fields are combined with a logical ‘and.’
"""
input PersonFilter {
  """Filter by the object’s \`rowId\` field."""
  rowId: UUIDFilter

  """Filter by the object’s \`organizationId\` field."""
  organizationId: StringFilter

  """Filter by the object’s \`emails\` field."""
  emails: StringListFilter

  """Filter by the object’s \`companyMembers\` relation."""
  companyMembers: PersonToManyCompanyMemberFilter

  """Some related \`companyMembers\` exist."""
  companyMembersExist: Boolean

  """Checks for all expressions in this list."""
  and: [PersonFilter!]

  """Checks for any expressions in this list."""
  or: [PersonFilter!]

  """Negates the expression."""
  not: PersonFilter
}

"""
A filter to be used against String List fields. All fields are combined with a logical ‘and.’
"""
input StringListFilter {
  """
  Is null (if \`true\` is specified) or is not null (if \`false\` is specified).
  """
  isNull: Boolean

  """Equal to the specified value."""
  equalTo: [String]

  """Not equal to the specified value."""
  notEqualTo: [String]

  """
  Not equal to the specified value, treating null like an ordinary value.
  """
  distinctFrom: [String]

  """Equal to the specified value, treating null like an ordinary value."""
  notDistinctFrom: [String]

  """Less than the specified value."""
  lessThan: [String]

  """Less than or equal to the specified value."""
  lessThanOrEqualTo: [String]

  """Greater than the specified value."""
  greaterThan: [String]

  """Greater than or equal to the specified value."""
  greaterThanOrEqualTo: [String]

  """Contains the specified list of values."""
  contains: [String]

  """Contained by the specified list of values."""
  containedBy: [String]

  """Overlaps the specified list of values."""
  overlaps: [String]

  """Any array item is equal to the specified value."""
  anyEqualTo: String

  """Any array item is not equal to the specified value."""
  anyNotEqualTo: String

  """Any array item is less than the specified value."""
  anyLessThan: String

  """Any array item is less than or equal to the specified value."""
  anyLessThanOrEqualTo: String

  """Any array item is greater than the specified value."""
  anyGreaterThan: String

  """Any array item is greater than or equal to the specified value."""
  anyGreaterThanOrEqualTo: String
}

"""
A filter to be used against many \`CompanyMember\` object types. All fields are combined with a logical ‘and.’
"""
input PersonToManyCompanyMemberFilter {
  """
  Every related \`CompanyMember\` matches the filter criteria. All fields are combined with a logical ‘and.’
  """
  every: CompanyMemberFilter

  """
  Some related \`CompanyMember\` matches the filter criteria. All fields are combined with a logical ‘and.’
  """
  some: CompanyMemberFilter

  """
  No related \`CompanyMember\` matches the filter criteria. All fields are combined with a logical ‘and.’
  """
  none: CompanyMemberFilter
}

"""
A filter to be used against many \`Quote\` object types. All fields are combined with a logical ‘and.’
"""
input CompanyToManyQuoteFilter {
  """
  Every related \`Quote\` matches the filter criteria. All fields are combined with a logical ‘and.’
  """
  every: QuoteFilter

  """
  Some related \`Quote\` matches the filter criteria. All fields are combined with a logical ‘and.’
  """
  some: QuoteFilter

  """
  No related \`Quote\` matches the filter criteria. All fields are combined with a logical ‘and.’
  """
  none: QuoteFilter
}

"""
A filter to be used against \`Quote\` object types. All fields are combined with a logical ‘and.’
"""
input QuoteFilter {
  """Filter by the object’s \`rowId\` field."""
  rowId: UUIDFilter

  """Filter by the object’s \`organizationId\` field."""
  organizationId: StringFilter

  """Filter by the object’s \`quoteNumber\` field."""
  quoteNumber: StringFilter

  """Filter by the object’s \`companyId\` field."""
  companyId: UUIDFilter

  """Filter by the object’s \`status\` field."""
  status: StringFilter

  """Filter by the object’s \`quoteLineItems\` relation."""
  quoteLineItems: QuoteToManyQuoteLineItemFilter

  """Some related \`quoteLineItems\` exist."""
  quoteLineItemsExist: Boolean

  """Filter by the object’s \`company\` relation."""
  company: CompanyFilter

  """A related \`company\` exists."""
  companyExists: Boolean

  """Filter by the object’s \`contact\` relation."""
  contact: PersonFilter

  """A related \`contact\` exists."""
  contactExists: Boolean

  """Filter by the object’s \`convertedInvoice\` relation."""
  convertedInvoice: InvoiceFilter

  """A related \`convertedInvoice\` exists."""
  convertedInvoiceExists: Boolean

  """Checks for all expressions in this list."""
  and: [QuoteFilter!]

  """Checks for any expressions in this list."""
  or: [QuoteFilter!]

  """Negates the expression."""
  not: QuoteFilter
}

"""
A filter to be used against many \`QuoteLineItem\` object types. All fields are combined with a logical ‘and.’
"""
input QuoteToManyQuoteLineItemFilter {
  """
  Every related \`QuoteLineItem\` matches the filter criteria. All fields are combined with a logical ‘and.’
  """
  every: QuoteLineItemFilter

  """
  Some related \`QuoteLineItem\` matches the filter criteria. All fields are combined with a logical ‘and.’
  """
  some: QuoteLineItemFilter

  """
  No related \`QuoteLineItem\` matches the filter criteria. All fields are combined with a logical ‘and.’
  """
  none: QuoteLineItemFilter
}

"""
A filter to be used against \`QuoteLineItem\` object types. All fields are combined with a logical ‘and.’
"""
input QuoteLineItemFilter {
  """Filter by the object’s \`rowId\` field."""
  rowId: UUIDFilter

  """Filter by the object’s \`quoteId\` field."""
  quoteId: UUIDFilter

  """Filter by the object’s \`product\` relation."""
  product: ProductFilter

  """A related \`product\` exists."""
  productExists: Boolean

  """Filter by the object’s \`quote\` relation."""
  quote: QuoteFilter

  """Checks for all expressions in this list."""
  and: [QuoteLineItemFilter!]

  """Checks for any expressions in this list."""
  or: [QuoteLineItemFilter!]

  """Negates the expression."""
  not: QuoteLineItemFilter
}

"""Methods to use when ordering \`CompanyMember\`."""
enum CompanyMemberOrderBy {
  NATURAL
  PRIMARY_KEY_ASC
  PRIMARY_KEY_DESC
  ROW_ID_ASC
  ROW_ID_DESC
  COMPANY_ID_ASC
  COMPANY_ID_DESC
  PERSON_ID_ASC
  PERSON_ID_DESC
}

"""A connection to a list of \`Invoice\` values."""
type InvoiceConnection {
  """A list of \`Invoice\` objects."""
  nodes: [Invoice]!

  """
  A list of edges which contains the \`Invoice\` and cursor to aid in pagination.
  """
  edges: [InvoiceEdge]!

  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """The count of *all* \`Invoice\` you could get from the connection."""
  totalCount: Int!
}

type Invoice implements Node {
  """
  A globally unique identifier. Can be used in various places throughout the system to identify this single value.
  """
  id: ID!
  rowId: UUID!
  organizationId: String!
  invoiceNumber: String!
  companyId: UUID
  contactId: UUID
  status: String!
  issueDate: Date!
  dueDate: Date
  notes: String
  subtotal: BigFloat
  taxRate: BigFloat
  taxAmount: BigFloat
  total: BigFloat
  currency: String
  paidAt: Datetime
  paymentReference: String
  paymentLinkUrl: String
  createdAt: Datetime
  updatedAt: Datetime
  billTo: String

  """Reads a single \`Company\` that is related to this \`Invoice\`."""
  company: Company

  """Reads a single \`Person\` that is related to this \`Invoice\`."""
  contact: Person

  """Reads and enables pagination through a set of \`InvoiceLineItem\`."""
  invoiceLineItems(
    """Only read the first \`n\` values of the set."""
    first: Int

    """Only read the last \`n\` values of the set."""
    last: Int

    """
    Skip the first \`n\` values from our \`after\` cursor, an alternative to cursor
    based pagination. May not be used with \`last\`.
    """
    offset: Int

    """Read all values in the set before (above) this cursor."""
    before: Cursor

    """Read all values in the set after (below) this cursor."""
    after: Cursor

    """
    A condition to be used in determining which values should be returned by the collection.
    """
    condition: InvoiceLineItemCondition

    """
    A filter to be used in determining which values should be returned by the collection.
    """
    filter: InvoiceLineItemFilter

    """The method to use when ordering \`InvoiceLineItem\`."""
    orderBy: [InvoiceLineItemOrderBy!] = [PRIMARY_KEY_ASC]
  ): InvoiceLineItemConnection!
}

"""A calendar date in YYYY-MM-DD format."""
scalar Date

"""
A floating point number that requires more precision than IEEE 754 binary 64
"""
scalar BigFloat

type Person implements Node {
  """
  A globally unique identifier. Can be used in various places throughout the system to identify this single value.
  """
  id: ID!
  rowId: UUID!
  organizationId: String!
  firstName: String!
  lastName: String!
  phone: String
  avatarUrl: String
  tags: [String]
  notes: String
  createdAt: Datetime
  updatedAt: Datetime
  emails: [String]
  internal: Boolean!

  """Reads and enables pagination through a set of \`CompanyMember\`."""
  companyMembers(
    """Only read the first \`n\` values of the set."""
    first: Int

    """Only read the last \`n\` values of the set."""
    last: Int

    """
    Skip the first \`n\` values from our \`after\` cursor, an alternative to cursor
    based pagination. May not be used with \`last\`.
    """
    offset: Int

    """Read all values in the set before (above) this cursor."""
    before: Cursor

    """Read all values in the set after (below) this cursor."""
    after: Cursor

    """
    A condition to be used in determining which values should be returned by the collection.
    """
    condition: CompanyMemberCondition

    """
    A filter to be used in determining which values should be returned by the collection.
    """
    filter: CompanyMemberFilter

    """The method to use when ordering \`CompanyMember\`."""
    orderBy: [CompanyMemberOrderBy!] = [PRIMARY_KEY_ASC]
  ): CompanyMemberConnection!
}

"""A connection to a list of \`InvoiceLineItem\` values."""
type InvoiceLineItemConnection {
  """A list of \`InvoiceLineItem\` objects."""
  nodes: [InvoiceLineItem]!

  """
  A list of edges which contains the \`InvoiceLineItem\` and cursor to aid in pagination.
  """
  edges: [InvoiceLineItemEdge]!

  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """
  The count of *all* \`InvoiceLineItem\` you could get from the connection.
  """
  totalCount: Int!
}

type InvoiceLineItem implements Node {
  """
  A globally unique identifier. Can be used in various places throughout the system to identify this single value.
  """
  id: ID!
  rowId: UUID!
  invoiceId: UUID!
  productId: UUID
  description: String!
  quantity: BigFloat!
  unitPrice: BigFloat!
  amount: BigFloat!
  sortOrder: Int

  """Reads a single \`Invoice\` that is related to this \`InvoiceLineItem\`."""
  invoice: Invoice

  """Reads a single \`Product\` that is related to this \`InvoiceLineItem\`."""
  product: Product
}

type Product implements Node {
  """
  A globally unique identifier. Can be used in various places throughout the system to identify this single value.
  """
  id: ID!
  rowId: UUID!
  organizationId: String!
  name: String!
  description: String
  sku: String
  unitPrice: BigFloat
  currentQuantity: Int
  lowStockThreshold: Int
  isActive: Boolean
  createdAt: Datetime
  updatedAt: Datetime

  """Reads and enables pagination through a set of \`InventoryAdjustment\`."""
  inventoryAdjustments(
    """Only read the first \`n\` values of the set."""
    first: Int

    """Only read the last \`n\` values of the set."""
    last: Int

    """
    Skip the first \`n\` values from our \`after\` cursor, an alternative to cursor
    based pagination. May not be used with \`last\`.
    """
    offset: Int

    """Read all values in the set before (above) this cursor."""
    before: Cursor

    """Read all values in the set after (below) this cursor."""
    after: Cursor

    """
    A condition to be used in determining which values should be returned by the collection.
    """
    condition: InventoryAdjustmentCondition

    """
    A filter to be used in determining which values should be returned by the collection.
    """
    filter: InventoryAdjustmentFilter

    """The method to use when ordering \`InventoryAdjustment\`."""
    orderBy: [InventoryAdjustmentOrderBy!] = [PRIMARY_KEY_ASC]
  ): InventoryAdjustmentConnection!
}

"""A connection to a list of \`InventoryAdjustment\` values."""
type InventoryAdjustmentConnection {
  """A list of \`InventoryAdjustment\` objects."""
  nodes: [InventoryAdjustment]!

  """
  A list of edges which contains the \`InventoryAdjustment\` and cursor to aid in pagination.
  """
  edges: [InventoryAdjustmentEdge]!

  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """
  The count of *all* \`InventoryAdjustment\` you could get from the connection.
  """
  totalCount: Int!
}

type InventoryAdjustment implements Node {
  """
  A globally unique identifier. Can be used in various places throughout the system to identify this single value.
  """
  id: ID!
  rowId: UUID!
  productId: UUID!
  quantityChange: Int!
  reason: String!
  referenceId: UUID
  createdAt: Datetime

  """
  Reads a single \`Product\` that is related to this \`InventoryAdjustment\`.
  """
  product: Product
}

"""A \`InventoryAdjustment\` edge in the connection."""
type InventoryAdjustmentEdge {
  """A cursor for use in pagination."""
  cursor: Cursor

  """The \`InventoryAdjustment\` at the end of the edge."""
  node: InventoryAdjustment
}

"""
A condition to be used against \`InventoryAdjustment\` object types. All fields
are tested for equality and combined with a logical ‘and.’
"""
input InventoryAdjustmentCondition {
  """Checks for equality with the object’s \`rowId\` field."""
  rowId: UUID

  """Checks for equality with the object’s \`productId\` field."""
  productId: UUID
}

"""Methods to use when ordering \`InventoryAdjustment\`."""
enum InventoryAdjustmentOrderBy {
  NATURAL
  PRIMARY_KEY_ASC
  PRIMARY_KEY_DESC
  ROW_ID_ASC
  ROW_ID_DESC
  PRODUCT_ID_ASC
  PRODUCT_ID_DESC
}

"""A \`InvoiceLineItem\` edge in the connection."""
type InvoiceLineItemEdge {
  """A cursor for use in pagination."""
  cursor: Cursor

  """The \`InvoiceLineItem\` at the end of the edge."""
  node: InvoiceLineItem
}

"""
A condition to be used against \`InvoiceLineItem\` object types. All fields are
tested for equality and combined with a logical ‘and.’
"""
input InvoiceLineItemCondition {
  """Checks for equality with the object’s \`rowId\` field."""
  rowId: UUID

  """Checks for equality with the object’s \`invoiceId\` field."""
  invoiceId: UUID
}

"""Methods to use when ordering \`InvoiceLineItem\`."""
enum InvoiceLineItemOrderBy {
  NATURAL
  PRIMARY_KEY_ASC
  PRIMARY_KEY_DESC
  ROW_ID_ASC
  ROW_ID_DESC
  INVOICE_ID_ASC
  INVOICE_ID_DESC
}

"""A \`Invoice\` edge in the connection."""
type InvoiceEdge {
  """A cursor for use in pagination."""
  cursor: Cursor

  """The \`Invoice\` at the end of the edge."""
  node: Invoice
}

"""
A condition to be used against \`Invoice\` object types. All fields are tested for equality and combined with a logical ‘and.’
"""
input InvoiceCondition {
  """Checks for equality with the object’s \`rowId\` field."""
  rowId: UUID

  """Checks for equality with the object’s \`organizationId\` field."""
  organizationId: String

  """Checks for equality with the object’s \`invoiceNumber\` field."""
  invoiceNumber: String

  """Checks for equality with the object’s \`companyId\` field."""
  companyId: UUID

  """Checks for equality with the object’s \`status\` field."""
  status: String
}

"""Methods to use when ordering \`Invoice\`."""
enum InvoiceOrderBy {
  NATURAL
  PRIMARY_KEY_ASC
  PRIMARY_KEY_DESC
  ROW_ID_ASC
  ROW_ID_DESC
  ORGANIZATION_ID_ASC
  ORGANIZATION_ID_DESC
  INVOICE_NUMBER_ASC
  INVOICE_NUMBER_DESC
  COMPANY_ID_ASC
  COMPANY_ID_DESC
  STATUS_ASC
  STATUS_DESC
}

"""A connection to a list of \`Quote\` values."""
type QuoteConnection {
  """A list of \`Quote\` objects."""
  nodes: [Quote]!

  """
  A list of edges which contains the \`Quote\` and cursor to aid in pagination.
  """
  edges: [QuoteEdge]!

  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """The count of *all* \`Quote\` you could get from the connection."""
  totalCount: Int!
}

type Quote implements Node {
  """
  A globally unique identifier. Can be used in various places throughout the system to identify this single value.
  """
  id: ID!
  rowId: UUID!
  organizationId: String!
  quoteNumber: String!
  companyId: UUID
  contactId: UUID
  title: String!
  description: String
  status: String!
  validUntil: Date!
  terms: String
  notes: String
  subtotal: BigFloat
  taxRate: BigFloat
  taxAmount: BigFloat
  total: BigFloat
  currency: String
  convertedInvoiceId: UUID
  createdAt: Datetime
  updatedAt: Datetime
  projectType: String
  timeRange: String
  additionalTerms: [String]
  clientName: String
  clientEmail: String
  additionalItemsLabel: String

  """Reads a single \`Company\` that is related to this \`Quote\`."""
  company: Company

  """Reads a single \`Person\` that is related to this \`Quote\`."""
  contact: Person

  """Reads a single \`Invoice\` that is related to this \`Quote\`."""
  convertedInvoice: Invoice

  """Reads and enables pagination through a set of \`QuoteLineItem\`."""
  quoteLineItems(
    """Only read the first \`n\` values of the set."""
    first: Int

    """Only read the last \`n\` values of the set."""
    last: Int

    """
    Skip the first \`n\` values from our \`after\` cursor, an alternative to cursor
    based pagination. May not be used with \`last\`.
    """
    offset: Int

    """Read all values in the set before (above) this cursor."""
    before: Cursor

    """Read all values in the set after (below) this cursor."""
    after: Cursor

    """
    A condition to be used in determining which values should be returned by the collection.
    """
    condition: QuoteLineItemCondition

    """
    A filter to be used in determining which values should be returned by the collection.
    """
    filter: QuoteLineItemFilter

    """The method to use when ordering \`QuoteLineItem\`."""
    orderBy: [QuoteLineItemOrderBy!] = [PRIMARY_KEY_ASC]
  ): QuoteLineItemConnection!
}

"""A connection to a list of \`QuoteLineItem\` values."""
type QuoteLineItemConnection {
  """A list of \`QuoteLineItem\` objects."""
  nodes: [QuoteLineItem]!

  """
  A list of edges which contains the \`QuoteLineItem\` and cursor to aid in pagination.
  """
  edges: [QuoteLineItemEdge]!

  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """The count of *all* \`QuoteLineItem\` you could get from the connection."""
  totalCount: Int!
}

type QuoteLineItem implements Node {
  """
  A globally unique identifier. Can be used in various places throughout the system to identify this single value.
  """
  id: ID!
  rowId: UUID!
  quoteId: UUID!
  productId: UUID
  description: String!
  quantity: BigFloat!
  unitPrice: BigFloat!
  amount: BigFloat!
  pricingType: String!
  estimatedHours: BigFloat
  royaltyPercentage: BigFloat
  sortOrder: Int
  hourlyRate: BigFloat
  weeklyCapHours: Int
  monthlyCapHours: Int
  maxCapHours: Int
  royaltyTimeframe: Int
  royaltyTimeframeUnit: String
  royaltyThreshold: BigFloat
  royaltyBuyoutAmount: BigFloat
  subtitle: String
  minimumBillingMinutes: Int

  """Reads a single \`Product\` that is related to this \`QuoteLineItem\`."""
  product: Product

  """Reads a single \`Quote\` that is related to this \`QuoteLineItem\`."""
  quote: Quote
}

"""A \`QuoteLineItem\` edge in the connection."""
type QuoteLineItemEdge {
  """A cursor for use in pagination."""
  cursor: Cursor

  """The \`QuoteLineItem\` at the end of the edge."""
  node: QuoteLineItem
}

"""
A condition to be used against \`QuoteLineItem\` object types. All fields are
tested for equality and combined with a logical ‘and.’
"""
input QuoteLineItemCondition {
  """Checks for equality with the object’s \`rowId\` field."""
  rowId: UUID

  """Checks for equality with the object’s \`quoteId\` field."""
  quoteId: UUID
}

"""Methods to use when ordering \`QuoteLineItem\`."""
enum QuoteLineItemOrderBy {
  NATURAL
  PRIMARY_KEY_ASC
  PRIMARY_KEY_DESC
  ROW_ID_ASC
  ROW_ID_DESC
  QUOTE_ID_ASC
  QUOTE_ID_DESC
}

"""A \`Quote\` edge in the connection."""
type QuoteEdge {
  """A cursor for use in pagination."""
  cursor: Cursor

  """The \`Quote\` at the end of the edge."""
  node: Quote
}

"""
A condition to be used against \`Quote\` object types. All fields are tested for equality and combined with a logical ‘and.’
"""
input QuoteCondition {
  """Checks for equality with the object’s \`rowId\` field."""
  rowId: UUID

  """Checks for equality with the object’s \`organizationId\` field."""
  organizationId: String

  """Checks for equality with the object’s \`quoteNumber\` field."""
  quoteNumber: String

  """Checks for equality with the object’s \`companyId\` field."""
  companyId: UUID

  """Checks for equality with the object’s \`status\` field."""
  status: String
}

"""Methods to use when ordering \`Quote\`."""
enum QuoteOrderBy {
  NATURAL
  PRIMARY_KEY_ASC
  PRIMARY_KEY_DESC
  ROW_ID_ASC
  ROW_ID_DESC
  ORGANIZATION_ID_ASC
  ORGANIZATION_ID_DESC
  QUOTE_NUMBER_ASC
  QUOTE_NUMBER_DESC
  COMPANY_ID_ASC
  COMPANY_ID_DESC
  STATUS_ASC
  STATUS_DESC
}

type OrganizationSetting implements Node {
  """
  A globally unique identifier. Can be used in various places throughout the system to identify this single value.
  """
  id: ID!
  rowId: UUID!
  organizationId: String!
  accentColor: String
  createdAt: Datetime
  updatedAt: Datetime
}

type DocumentNumberingConfig implements Node {
  """
  A globally unique identifier. Can be used in various places throughout the system to identify this single value.
  """
  id: ID!
  rowId: UUID!
  organizationId: String!
  documentType: String!
  prefix: String!
  separator: String!
  dateFormat: String
  idStrategy: String!
  sequentialPadding: Int!
  randomLength: Int!
  nextSequentialNumber: Int!
  createdAt: Datetime
  updatedAt: Datetime
}

"""A connection to a list of \`OrganizationSetting\` values."""
type OrganizationSettingConnection {
  """A list of \`OrganizationSetting\` objects."""
  nodes: [OrganizationSetting]!

  """
  A list of edges which contains the \`OrganizationSetting\` and cursor to aid in pagination.
  """
  edges: [OrganizationSettingEdge]!

  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """
  The count of *all* \`OrganizationSetting\` you could get from the connection.
  """
  totalCount: Int!
}

"""A \`OrganizationSetting\` edge in the connection."""
type OrganizationSettingEdge {
  """A cursor for use in pagination."""
  cursor: Cursor

  """The \`OrganizationSetting\` at the end of the edge."""
  node: OrganizationSetting
}

"""
A condition to be used against \`OrganizationSetting\` object types. All fields
are tested for equality and combined with a logical ‘and.’
"""
input OrganizationSettingCondition {
  """Checks for equality with the object’s \`rowId\` field."""
  rowId: UUID

  """Checks for equality with the object’s \`organizationId\` field."""
  organizationId: String
}

"""
A filter to be used against \`OrganizationSetting\` object types. All fields are combined with a logical ‘and.’
"""
input OrganizationSettingFilter {
  """Filter by the object’s \`rowId\` field."""
  rowId: UUIDFilter

  """Filter by the object’s \`organizationId\` field."""
  organizationId: StringFilter

  """Checks for all expressions in this list."""
  and: [OrganizationSettingFilter!]

  """Checks for any expressions in this list."""
  or: [OrganizationSettingFilter!]

  """Negates the expression."""
  not: OrganizationSettingFilter
}

"""Methods to use when ordering \`OrganizationSetting\`."""
enum OrganizationSettingOrderBy {
  NATURAL
  PRIMARY_KEY_ASC
  PRIMARY_KEY_DESC
  ROW_ID_ASC
  ROW_ID_DESC
  ORGANIZATION_ID_ASC
  ORGANIZATION_ID_DESC
}

"""A connection to a list of \`Product\` values."""
type ProductConnection {
  """A list of \`Product\` objects."""
  nodes: [Product]!

  """
  A list of edges which contains the \`Product\` and cursor to aid in pagination.
  """
  edges: [ProductEdge]!

  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """The count of *all* \`Product\` you could get from the connection."""
  totalCount: Int!
}

"""A \`Product\` edge in the connection."""
type ProductEdge {
  """A cursor for use in pagination."""
  cursor: Cursor

  """The \`Product\` at the end of the edge."""
  node: Product
}

"""
A condition to be used against \`Product\` object types. All fields are tested for equality and combined with a logical ‘and.’
"""
input ProductCondition {
  """Checks for equality with the object’s \`rowId\` field."""
  rowId: UUID

  """Checks for equality with the object’s \`organizationId\` field."""
  organizationId: String

  """Checks for equality with the object’s \`sku\` field."""
  sku: String
}

"""Methods to use when ordering \`Product\`."""
enum ProductOrderBy {
  NATURAL
  PRIMARY_KEY_ASC
  PRIMARY_KEY_DESC
  ROW_ID_ASC
  ROW_ID_DESC
  ORGANIZATION_ID_ASC
  ORGANIZATION_ID_DESC
  SKU_ASC
  SKU_DESC
}

"""A connection to a list of \`DocumentNumberingConfig\` values."""
type DocumentNumberingConfigConnection {
  """A list of \`DocumentNumberingConfig\` objects."""
  nodes: [DocumentNumberingConfig]!

  """
  A list of edges which contains the \`DocumentNumberingConfig\` and cursor to aid in pagination.
  """
  edges: [DocumentNumberingConfigEdge]!

  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """
  The count of *all* \`DocumentNumberingConfig\` you could get from the connection.
  """
  totalCount: Int!
}

"""A \`DocumentNumberingConfig\` edge in the connection."""
type DocumentNumberingConfigEdge {
  """A cursor for use in pagination."""
  cursor: Cursor

  """The \`DocumentNumberingConfig\` at the end of the edge."""
  node: DocumentNumberingConfig
}

"""
A condition to be used against \`DocumentNumberingConfig\` object types. All
fields are tested for equality and combined with a logical ‘and.’
"""
input DocumentNumberingConfigCondition {
  """Checks for equality with the object’s \`rowId\` field."""
  rowId: UUID

  """Checks for equality with the object’s \`organizationId\` field."""
  organizationId: String

  """Checks for equality with the object’s \`documentType\` field."""
  documentType: String
}

"""
A filter to be used against \`DocumentNumberingConfig\` object types. All fields are combined with a logical ‘and.’
"""
input DocumentNumberingConfigFilter {
  """Filter by the object’s \`rowId\` field."""
  rowId: UUIDFilter

  """Filter by the object’s \`organizationId\` field."""
  organizationId: StringFilter

  """Filter by the object’s \`documentType\` field."""
  documentType: StringFilter

  """Checks for all expressions in this list."""
  and: [DocumentNumberingConfigFilter!]

  """Checks for any expressions in this list."""
  or: [DocumentNumberingConfigFilter!]

  """Negates the expression."""
  not: DocumentNumberingConfigFilter
}

"""Methods to use when ordering \`DocumentNumberingConfig\`."""
enum DocumentNumberingConfigOrderBy {
  NATURAL
  PRIMARY_KEY_ASC
  PRIMARY_KEY_DESC
  ROW_ID_ASC
  ROW_ID_DESC
  ORGANIZATION_ID_ASC
  ORGANIZATION_ID_DESC
  DOCUMENT_TYPE_ASC
  DOCUMENT_TYPE_DESC
}

"""A connection to a list of \`Person\` values."""
type PersonConnection {
  """A list of \`Person\` objects."""
  nodes: [Person]!

  """
  A list of edges which contains the \`Person\` and cursor to aid in pagination.
  """
  edges: [PersonEdge]!

  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """The count of *all* \`Person\` you could get from the connection."""
  totalCount: Int!
}

"""A \`Person\` edge in the connection."""
type PersonEdge {
  """A cursor for use in pagination."""
  cursor: Cursor

  """The \`Person\` at the end of the edge."""
  node: Person
}

"""
A condition to be used against \`Person\` object types. All fields are tested for equality and combined with a logical ‘and.’
"""
input PersonCondition {
  """Checks for equality with the object’s \`rowId\` field."""
  rowId: UUID

  """Checks for equality with the object’s \`organizationId\` field."""
  organizationId: String
}

"""Methods to use when ordering \`Person\`."""
enum PersonOrderBy {
  NATURAL
  PRIMARY_KEY_ASC
  PRIMARY_KEY_DESC
  ROW_ID_ASC
  ROW_ID_DESC
  ORGANIZATION_ID_ASC
  ORGANIZATION_ID_DESC
}

"""A connection to a list of \`Company\` values."""
type CompanyConnection {
  """A list of \`Company\` objects."""
  nodes: [Company]!

  """
  A list of edges which contains the \`Company\` and cursor to aid in pagination.
  """
  edges: [CompanyEdge]!

  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """The count of *all* \`Company\` you could get from the connection."""
  totalCount: Int!
}

"""A \`Company\` edge in the connection."""
type CompanyEdge {
  """A cursor for use in pagination."""
  cursor: Cursor

  """The \`Company\` at the end of the edge."""
  node: Company
}

"""
A condition to be used against \`Company\` object types. All fields are tested for equality and combined with a logical ‘and.’
"""
input CompanyCondition {
  """Checks for equality with the object’s \`rowId\` field."""
  rowId: UUID

  """Checks for equality with the object’s \`organizationId\` field."""
  organizationId: String
}

"""Methods to use when ordering \`Company\`."""
enum CompanyOrderBy {
  NATURAL
  PRIMARY_KEY_ASC
  PRIMARY_KEY_DESC
  ROW_ID_ASC
  ROW_ID_DESC
  ORGANIZATION_ID_ASC
  ORGANIZATION_ID_DESC
}

"""
The root mutation type which contains root level fields which mutate data.
"""
type Mutation {
  """Creates a single \`CompanyMember\`."""
  createCompanyMember(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: CreateCompanyMemberInput!
  ): CreateCompanyMemberPayload

  """Creates a single \`InventoryAdjustment\`."""
  createInventoryAdjustment(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: CreateInventoryAdjustmentInput!
  ): CreateInventoryAdjustmentPayload

  """Creates a single \`InvoiceLineItem\`."""
  createInvoiceLineItem(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: CreateInvoiceLineItemInput!
  ): CreateInvoiceLineItemPayload

  """Creates a single \`OrganizationSetting\`."""
  createOrganizationSetting(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: CreateOrganizationSettingInput!
  ): CreateOrganizationSettingPayload

  """Creates a single \`Product\`."""
  createProduct(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: CreateProductInput!
  ): CreateProductPayload

  """Creates a single \`DocumentNumberingConfig\`."""
  createDocumentNumberingConfig(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: CreateDocumentNumberingConfigInput!
  ): CreateDocumentNumberingConfigPayload

  """Creates a single \`Person\`."""
  createPerson(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: CreatePersonInput!
  ): CreatePersonPayload

  """Creates a single \`Company\`."""
  createCompany(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: CreateCompanyInput!
  ): CreateCompanyPayload

  """Creates a single \`QuoteLineItem\`."""
  createQuoteLineItem(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: CreateQuoteLineItemInput!
  ): CreateQuoteLineItemPayload

  """Creates a single \`Invoice\`."""
  createInvoice(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: CreateInvoiceInput!
  ): CreateInvoicePayload

  """Creates a single \`Quote\`."""
  createQuote(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: CreateQuoteInput!
  ): CreateQuotePayload

  """
  Updates a single \`CompanyMember\` using its globally unique id and a patch.
  """
  updateCompanyMemberById(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: UpdateCompanyMemberByIdInput!
  ): UpdateCompanyMemberPayload

  """Updates a single \`CompanyMember\` using a unique key and a patch."""
  updateCompanyMember(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: UpdateCompanyMemberInput!
  ): UpdateCompanyMemberPayload

  """
  Updates a single \`InventoryAdjustment\` using its globally unique id and a patch.
  """
  updateInventoryAdjustmentById(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: UpdateInventoryAdjustmentByIdInput!
  ): UpdateInventoryAdjustmentPayload

  """Updates a single \`InventoryAdjustment\` using a unique key and a patch."""
  updateInventoryAdjustment(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: UpdateInventoryAdjustmentInput!
  ): UpdateInventoryAdjustmentPayload

  """
  Updates a single \`InvoiceLineItem\` using its globally unique id and a patch.
  """
  updateInvoiceLineItemById(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: UpdateInvoiceLineItemByIdInput!
  ): UpdateInvoiceLineItemPayload

  """Updates a single \`InvoiceLineItem\` using a unique key and a patch."""
  updateInvoiceLineItem(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: UpdateInvoiceLineItemInput!
  ): UpdateInvoiceLineItemPayload

  """
  Updates a single \`OrganizationSetting\` using its globally unique id and a patch.
  """
  updateOrganizationSettingById(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: UpdateOrganizationSettingByIdInput!
  ): UpdateOrganizationSettingPayload

  """Updates a single \`OrganizationSetting\` using a unique key and a patch."""
  updateOrganizationSetting(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: UpdateOrganizationSettingInput!
  ): UpdateOrganizationSettingPayload

  """Updates a single \`Product\` using its globally unique id and a patch."""
  updateProductById(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: UpdateProductByIdInput!
  ): UpdateProductPayload

  """Updates a single \`Product\` using a unique key and a patch."""
  updateProduct(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: UpdateProductInput!
  ): UpdateProductPayload

  """
  Updates a single \`DocumentNumberingConfig\` using its globally unique id and a patch.
  """
  updateDocumentNumberingConfigById(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: UpdateDocumentNumberingConfigByIdInput!
  ): UpdateDocumentNumberingConfigPayload

  """
  Updates a single \`DocumentNumberingConfig\` using a unique key and a patch.
  """
  updateDocumentNumberingConfig(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: UpdateDocumentNumberingConfigInput!
  ): UpdateDocumentNumberingConfigPayload

  """Updates a single \`Person\` using its globally unique id and a patch."""
  updatePersonById(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: UpdatePersonByIdInput!
  ): UpdatePersonPayload

  """Updates a single \`Person\` using a unique key and a patch."""
  updatePerson(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: UpdatePersonInput!
  ): UpdatePersonPayload

  """Updates a single \`Company\` using its globally unique id and a patch."""
  updateCompanyById(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: UpdateCompanyByIdInput!
  ): UpdateCompanyPayload

  """Updates a single \`Company\` using a unique key and a patch."""
  updateCompany(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: UpdateCompanyInput!
  ): UpdateCompanyPayload

  """
  Updates a single \`QuoteLineItem\` using its globally unique id and a patch.
  """
  updateQuoteLineItemById(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: UpdateQuoteLineItemByIdInput!
  ): UpdateQuoteLineItemPayload

  """Updates a single \`QuoteLineItem\` using a unique key and a patch."""
  updateQuoteLineItem(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: UpdateQuoteLineItemInput!
  ): UpdateQuoteLineItemPayload

  """Updates a single \`Invoice\` using its globally unique id and a patch."""
  updateInvoiceById(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: UpdateInvoiceByIdInput!
  ): UpdateInvoicePayload

  """Updates a single \`Invoice\` using a unique key and a patch."""
  updateInvoice(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: UpdateInvoiceInput!
  ): UpdateInvoicePayload

  """Updates a single \`Quote\` using its globally unique id and a patch."""
  updateQuoteById(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: UpdateQuoteByIdInput!
  ): UpdateQuotePayload

  """Updates a single \`Quote\` using a unique key and a patch."""
  updateQuote(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: UpdateQuoteInput!
  ): UpdateQuotePayload

  """Deletes a single \`CompanyMember\` using its globally unique id."""
  deleteCompanyMemberById(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: DeleteCompanyMemberByIdInput!
  ): DeleteCompanyMemberPayload

  """Deletes a single \`CompanyMember\` using a unique key."""
  deleteCompanyMember(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: DeleteCompanyMemberInput!
  ): DeleteCompanyMemberPayload

  """Deletes a single \`InventoryAdjustment\` using its globally unique id."""
  deleteInventoryAdjustmentById(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: DeleteInventoryAdjustmentByIdInput!
  ): DeleteInventoryAdjustmentPayload

  """Deletes a single \`InventoryAdjustment\` using a unique key."""
  deleteInventoryAdjustment(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: DeleteInventoryAdjustmentInput!
  ): DeleteInventoryAdjustmentPayload

  """Deletes a single \`InvoiceLineItem\` using its globally unique id."""
  deleteInvoiceLineItemById(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: DeleteInvoiceLineItemByIdInput!
  ): DeleteInvoiceLineItemPayload

  """Deletes a single \`InvoiceLineItem\` using a unique key."""
  deleteInvoiceLineItem(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: DeleteInvoiceLineItemInput!
  ): DeleteInvoiceLineItemPayload

  """Deletes a single \`OrganizationSetting\` using its globally unique id."""
  deleteOrganizationSettingById(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: DeleteOrganizationSettingByIdInput!
  ): DeleteOrganizationSettingPayload

  """Deletes a single \`OrganizationSetting\` using a unique key."""
  deleteOrganizationSetting(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: DeleteOrganizationSettingInput!
  ): DeleteOrganizationSettingPayload

  """Deletes a single \`Product\` using its globally unique id."""
  deleteProductById(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: DeleteProductByIdInput!
  ): DeleteProductPayload

  """Deletes a single \`Product\` using a unique key."""
  deleteProduct(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: DeleteProductInput!
  ): DeleteProductPayload

  """
  Deletes a single \`DocumentNumberingConfig\` using its globally unique id.
  """
  deleteDocumentNumberingConfigById(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: DeleteDocumentNumberingConfigByIdInput!
  ): DeleteDocumentNumberingConfigPayload

  """Deletes a single \`DocumentNumberingConfig\` using a unique key."""
  deleteDocumentNumberingConfig(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: DeleteDocumentNumberingConfigInput!
  ): DeleteDocumentNumberingConfigPayload

  """Deletes a single \`Person\` using its globally unique id."""
  deletePersonById(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: DeletePersonByIdInput!
  ): DeletePersonPayload

  """Deletes a single \`Person\` using a unique key."""
  deletePerson(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: DeletePersonInput!
  ): DeletePersonPayload

  """Deletes a single \`Company\` using its globally unique id."""
  deleteCompanyById(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: DeleteCompanyByIdInput!
  ): DeleteCompanyPayload

  """Deletes a single \`Company\` using a unique key."""
  deleteCompany(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: DeleteCompanyInput!
  ): DeleteCompanyPayload

  """Deletes a single \`QuoteLineItem\` using its globally unique id."""
  deleteQuoteLineItemById(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: DeleteQuoteLineItemByIdInput!
  ): DeleteQuoteLineItemPayload

  """Deletes a single \`QuoteLineItem\` using a unique key."""
  deleteQuoteLineItem(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: DeleteQuoteLineItemInput!
  ): DeleteQuoteLineItemPayload

  """Deletes a single \`Invoice\` using its globally unique id."""
  deleteInvoiceById(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: DeleteInvoiceByIdInput!
  ): DeleteInvoicePayload

  """Deletes a single \`Invoice\` using a unique key."""
  deleteInvoice(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: DeleteInvoiceInput!
  ): DeleteInvoicePayload

  """Deletes a single \`Quote\` using its globally unique id."""
  deleteQuoteById(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: DeleteQuoteByIdInput!
  ): DeleteQuotePayload

  """Deletes a single \`Quote\` using a unique key."""
  deleteQuote(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: DeleteQuoteInput!
  ): DeleteQuotePayload
  generateDocumentNumber(
    """
    The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
    """
    input: GenerateDocumentNumberInput!
  ): GenerateDocumentNumberPayload
}

"""The output of our create \`CompanyMember\` mutation."""
type CreateCompanyMemberPayload {
  """
  The exact same \`clientMutationId\` that was provided in the mutation input,
  unchanged and unused. May be used by a client to track mutations.
  """
  clientMutationId: String

  """The \`CompanyMember\` that was created by this mutation."""
  companyMember: CompanyMember

  """
  Our root query field type. Allows us to run any query from our mutation payload.
  """
  query: Query

  """An edge for our \`CompanyMember\`. May be used by Relay 1."""
  companyMemberEdge(
    """The method to use when ordering \`CompanyMember\`."""
    orderBy: [CompanyMemberOrderBy!]! = [PRIMARY_KEY_ASC]
  ): CompanyMemberEdge
}

"""All input for the create \`CompanyMember\` mutation."""
input CreateCompanyMemberInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String

  """The \`CompanyMember\` to be created by this mutation."""
  companyMember: CompanyMemberInput!
}

"""An input for mutations affecting \`CompanyMember\`"""
input CompanyMemberInput {
  rowId: UUID
  companyId: UUID!
  personId: UUID!
  title: String
  isPrimary: Boolean
  createdAt: Datetime
}

"""The output of our create \`InventoryAdjustment\` mutation."""
type CreateInventoryAdjustmentPayload {
  """
  The exact same \`clientMutationId\` that was provided in the mutation input,
  unchanged and unused. May be used by a client to track mutations.
  """
  clientMutationId: String

  """The \`InventoryAdjustment\` that was created by this mutation."""
  inventoryAdjustment: InventoryAdjustment

  """
  Our root query field type. Allows us to run any query from our mutation payload.
  """
  query: Query

  """An edge for our \`InventoryAdjustment\`. May be used by Relay 1."""
  inventoryAdjustmentEdge(
    """The method to use when ordering \`InventoryAdjustment\`."""
    orderBy: [InventoryAdjustmentOrderBy!]! = [PRIMARY_KEY_ASC]
  ): InventoryAdjustmentEdge
}

"""All input for the create \`InventoryAdjustment\` mutation."""
input CreateInventoryAdjustmentInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String

  """The \`InventoryAdjustment\` to be created by this mutation."""
  inventoryAdjustment: InventoryAdjustmentInput!
}

"""An input for mutations affecting \`InventoryAdjustment\`"""
input InventoryAdjustmentInput {
  rowId: UUID
  productId: UUID!
  quantityChange: Int!
  reason: String!
  referenceId: UUID
  createdAt: Datetime
}

"""The output of our create \`InvoiceLineItem\` mutation."""
type CreateInvoiceLineItemPayload {
  """
  The exact same \`clientMutationId\` that was provided in the mutation input,
  unchanged and unused. May be used by a client to track mutations.
  """
  clientMutationId: String

  """The \`InvoiceLineItem\` that was created by this mutation."""
  invoiceLineItem: InvoiceLineItem

  """
  Our root query field type. Allows us to run any query from our mutation payload.
  """
  query: Query

  """An edge for our \`InvoiceLineItem\`. May be used by Relay 1."""
  invoiceLineItemEdge(
    """The method to use when ordering \`InvoiceLineItem\`."""
    orderBy: [InvoiceLineItemOrderBy!]! = [PRIMARY_KEY_ASC]
  ): InvoiceLineItemEdge
}

"""All input for the create \`InvoiceLineItem\` mutation."""
input CreateInvoiceLineItemInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String

  """The \`InvoiceLineItem\` to be created by this mutation."""
  invoiceLineItem: InvoiceLineItemInput!
}

"""An input for mutations affecting \`InvoiceLineItem\`"""
input InvoiceLineItemInput {
  rowId: UUID
  invoiceId: UUID!
  productId: UUID
  description: String!
  quantity: BigFloat!
  unitPrice: BigFloat!
  amount: BigFloat!
  sortOrder: Int
}

"""The output of our create \`OrganizationSetting\` mutation."""
type CreateOrganizationSettingPayload {
  """
  The exact same \`clientMutationId\` that was provided in the mutation input,
  unchanged and unused. May be used by a client to track mutations.
  """
  clientMutationId: String

  """The \`OrganizationSetting\` that was created by this mutation."""
  organizationSetting: OrganizationSetting

  """
  Our root query field type. Allows us to run any query from our mutation payload.
  """
  query: Query

  """An edge for our \`OrganizationSetting\`. May be used by Relay 1."""
  organizationSettingEdge(
    """The method to use when ordering \`OrganizationSetting\`."""
    orderBy: [OrganizationSettingOrderBy!]! = [PRIMARY_KEY_ASC]
  ): OrganizationSettingEdge
}

"""All input for the create \`OrganizationSetting\` mutation."""
input CreateOrganizationSettingInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String

  """The \`OrganizationSetting\` to be created by this mutation."""
  organizationSetting: OrganizationSettingInput!
}

"""An input for mutations affecting \`OrganizationSetting\`"""
input OrganizationSettingInput {
  rowId: UUID
  organizationId: String!
  accentColor: String
  createdAt: Datetime
  updatedAt: Datetime
}

"""The output of our create \`Product\` mutation."""
type CreateProductPayload {
  """
  The exact same \`clientMutationId\` that was provided in the mutation input,
  unchanged and unused. May be used by a client to track mutations.
  """
  clientMutationId: String

  """The \`Product\` that was created by this mutation."""
  product: Product

  """
  Our root query field type. Allows us to run any query from our mutation payload.
  """
  query: Query

  """An edge for our \`Product\`. May be used by Relay 1."""
  productEdge(
    """The method to use when ordering \`Product\`."""
    orderBy: [ProductOrderBy!]! = [PRIMARY_KEY_ASC]
  ): ProductEdge
}

"""All input for the create \`Product\` mutation."""
input CreateProductInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String

  """The \`Product\` to be created by this mutation."""
  product: ProductInput!
}

"""An input for mutations affecting \`Product\`"""
input ProductInput {
  rowId: UUID
  organizationId: String!
  name: String!
  description: String
  sku: String
  unitPrice: BigFloat
  currentQuantity: Int
  lowStockThreshold: Int
  isActive: Boolean
  createdAt: Datetime
  updatedAt: Datetime
}

"""The output of our create \`DocumentNumberingConfig\` mutation."""
type CreateDocumentNumberingConfigPayload {
  """
  The exact same \`clientMutationId\` that was provided in the mutation input,
  unchanged and unused. May be used by a client to track mutations.
  """
  clientMutationId: String

  """The \`DocumentNumberingConfig\` that was created by this mutation."""
  documentNumberingConfig: DocumentNumberingConfig

  """
  Our root query field type. Allows us to run any query from our mutation payload.
  """
  query: Query

  """An edge for our \`DocumentNumberingConfig\`. May be used by Relay 1."""
  documentNumberingConfigEdge(
    """The method to use when ordering \`DocumentNumberingConfig\`."""
    orderBy: [DocumentNumberingConfigOrderBy!]! = [PRIMARY_KEY_ASC]
  ): DocumentNumberingConfigEdge
}

"""All input for the create \`DocumentNumberingConfig\` mutation."""
input CreateDocumentNumberingConfigInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String

  """The \`DocumentNumberingConfig\` to be created by this mutation."""
  documentNumberingConfig: DocumentNumberingConfigInput!
}

"""An input for mutations affecting \`DocumentNumberingConfig\`"""
input DocumentNumberingConfigInput {
  rowId: UUID
  organizationId: String!
  documentType: String!
  prefix: String
  separator: String
  dateFormat: String
  idStrategy: String
  sequentialPadding: Int
  randomLength: Int
  nextSequentialNumber: Int
  createdAt: Datetime
  updatedAt: Datetime
}

"""The output of our create \`Person\` mutation."""
type CreatePersonPayload {
  """
  The exact same \`clientMutationId\` that was provided in the mutation input,
  unchanged and unused. May be used by a client to track mutations.
  """
  clientMutationId: String

  """The \`Person\` that was created by this mutation."""
  person: Person

  """
  Our root query field type. Allows us to run any query from our mutation payload.
  """
  query: Query

  """An edge for our \`Person\`. May be used by Relay 1."""
  personEdge(
    """The method to use when ordering \`Person\`."""
    orderBy: [PersonOrderBy!]! = [PRIMARY_KEY_ASC]
  ): PersonEdge
}

"""All input for the create \`Person\` mutation."""
input CreatePersonInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String

  """The \`Person\` to be created by this mutation."""
  person: PersonInput!
}

"""An input for mutations affecting \`Person\`"""
input PersonInput {
  rowId: UUID
  organizationId: String!
  firstName: String!
  lastName: String!
  phone: String
  avatarUrl: String
  tags: [String]
  notes: String
  createdAt: Datetime
  updatedAt: Datetime
  emails: [String]
  internal: Boolean
}

"""The output of our create \`Company\` mutation."""
type CreateCompanyPayload {
  """
  The exact same \`clientMutationId\` that was provided in the mutation input,
  unchanged and unused. May be used by a client to track mutations.
  """
  clientMutationId: String

  """The \`Company\` that was created by this mutation."""
  company: Company

  """
  Our root query field type. Allows us to run any query from our mutation payload.
  """
  query: Query

  """An edge for our \`Company\`. May be used by Relay 1."""
  companyEdge(
    """The method to use when ordering \`Company\`."""
    orderBy: [CompanyOrderBy!]! = [PRIMARY_KEY_ASC]
  ): CompanyEdge
}

"""All input for the create \`Company\` mutation."""
input CreateCompanyInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String

  """The \`Company\` to be created by this mutation."""
  company: CompanyInput!
}

"""An input for mutations affecting \`Company\`"""
input CompanyInput {
  rowId: UUID
  organizationId: String!
  name: String!
  website: String
  industry: String
  phone: String
  email: String
  addressLine1: String
  addressLine2: String
  city: String
  state: String
  postalCode: String
  country: String
  notes: String
  createdAt: Datetime
  updatedAt: Datetime
}

"""The output of our create \`QuoteLineItem\` mutation."""
type CreateQuoteLineItemPayload {
  """
  The exact same \`clientMutationId\` that was provided in the mutation input,
  unchanged and unused. May be used by a client to track mutations.
  """
  clientMutationId: String

  """The \`QuoteLineItem\` that was created by this mutation."""
  quoteLineItem: QuoteLineItem

  """
  Our root query field type. Allows us to run any query from our mutation payload.
  """
  query: Query

  """An edge for our \`QuoteLineItem\`. May be used by Relay 1."""
  quoteLineItemEdge(
    """The method to use when ordering \`QuoteLineItem\`."""
    orderBy: [QuoteLineItemOrderBy!]! = [PRIMARY_KEY_ASC]
  ): QuoteLineItemEdge
}

"""All input for the create \`QuoteLineItem\` mutation."""
input CreateQuoteLineItemInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String

  """The \`QuoteLineItem\` to be created by this mutation."""
  quoteLineItem: QuoteLineItemInput!
}

"""An input for mutations affecting \`QuoteLineItem\`"""
input QuoteLineItemInput {
  rowId: UUID
  quoteId: UUID!
  productId: UUID
  description: String!
  quantity: BigFloat!
  unitPrice: BigFloat!
  amount: BigFloat!
  pricingType: String
  estimatedHours: BigFloat
  royaltyPercentage: BigFloat
  sortOrder: Int
  hourlyRate: BigFloat
  weeklyCapHours: Int
  monthlyCapHours: Int
  maxCapHours: Int
  royaltyTimeframe: Int
  royaltyTimeframeUnit: String
  royaltyThreshold: BigFloat
  royaltyBuyoutAmount: BigFloat
  subtitle: String
  minimumBillingMinutes: Int
}

"""The output of our create \`Invoice\` mutation."""
type CreateInvoicePayload {
  """
  The exact same \`clientMutationId\` that was provided in the mutation input,
  unchanged and unused. May be used by a client to track mutations.
  """
  clientMutationId: String

  """The \`Invoice\` that was created by this mutation."""
  invoice: Invoice

  """
  Our root query field type. Allows us to run any query from our mutation payload.
  """
  query: Query

  """An edge for our \`Invoice\`. May be used by Relay 1."""
  invoiceEdge(
    """The method to use when ordering \`Invoice\`."""
    orderBy: [InvoiceOrderBy!]! = [PRIMARY_KEY_ASC]
  ): InvoiceEdge
}

"""All input for the create \`Invoice\` mutation."""
input CreateInvoiceInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String

  """The \`Invoice\` to be created by this mutation."""
  invoice: InvoiceInput!
}

"""An input for mutations affecting \`Invoice\`"""
input InvoiceInput {
  rowId: UUID
  organizationId: String!
  invoiceNumber: String!
  companyId: UUID
  contactId: UUID
  status: String
  issueDate: Date!
  dueDate: Date
  notes: String
  subtotal: BigFloat
  taxRate: BigFloat
  taxAmount: BigFloat
  total: BigFloat
  currency: String
  paidAt: Datetime
  paymentReference: String
  paymentLinkUrl: String
  createdAt: Datetime
  updatedAt: Datetime
  billTo: String
}

"""The output of our create \`Quote\` mutation."""
type CreateQuotePayload {
  """
  The exact same \`clientMutationId\` that was provided in the mutation input,
  unchanged and unused. May be used by a client to track mutations.
  """
  clientMutationId: String

  """The \`Quote\` that was created by this mutation."""
  quote: Quote

  """
  Our root query field type. Allows us to run any query from our mutation payload.
  """
  query: Query

  """An edge for our \`Quote\`. May be used by Relay 1."""
  quoteEdge(
    """The method to use when ordering \`Quote\`."""
    orderBy: [QuoteOrderBy!]! = [PRIMARY_KEY_ASC]
  ): QuoteEdge
}

"""All input for the create \`Quote\` mutation."""
input CreateQuoteInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String

  """The \`Quote\` to be created by this mutation."""
  quote: QuoteInput!
}

"""An input for mutations affecting \`Quote\`"""
input QuoteInput {
  rowId: UUID
  organizationId: String!
  quoteNumber: String!
  companyId: UUID
  contactId: UUID
  title: String!
  description: String
  status: String
  validUntil: Date!
  terms: String
  notes: String
  subtotal: BigFloat
  taxRate: BigFloat
  taxAmount: BigFloat
  total: BigFloat
  currency: String
  convertedInvoiceId: UUID
  createdAt: Datetime
  updatedAt: Datetime
  projectType: String
  timeRange: String
  additionalTerms: [String]
  clientName: String
  clientEmail: String
  additionalItemsLabel: String
}

"""The output of our update \`CompanyMember\` mutation."""
type UpdateCompanyMemberPayload {
  """
  The exact same \`clientMutationId\` that was provided in the mutation input,
  unchanged and unused. May be used by a client to track mutations.
  """
  clientMutationId: String

  """The \`CompanyMember\` that was updated by this mutation."""
  companyMember: CompanyMember

  """
  Our root query field type. Allows us to run any query from our mutation payload.
  """
  query: Query

  """An edge for our \`CompanyMember\`. May be used by Relay 1."""
  companyMemberEdge(
    """The method to use when ordering \`CompanyMember\`."""
    orderBy: [CompanyMemberOrderBy!]! = [PRIMARY_KEY_ASC]
  ): CompanyMemberEdge
}

"""All input for the \`updateCompanyMemberById\` mutation."""
input UpdateCompanyMemberByIdInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String

  """
  The globally unique \`ID\` which will identify a single \`CompanyMember\` to be updated.
  """
  id: ID!

  """
  An object where the defined keys will be set on the \`CompanyMember\` being updated.
  """
  patch: CompanyMemberPatch!
}

"""
Represents an update to a \`CompanyMember\`. Fields that are set will be updated.
"""
input CompanyMemberPatch {
  rowId: UUID
  companyId: UUID
  personId: UUID
  title: String
  isPrimary: Boolean
  createdAt: Datetime
}

"""All input for the \`updateCompanyMember\` mutation."""
input UpdateCompanyMemberInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String
  rowId: UUID!

  """
  An object where the defined keys will be set on the \`CompanyMember\` being updated.
  """
  patch: CompanyMemberPatch!
}

"""The output of our update \`InventoryAdjustment\` mutation."""
type UpdateInventoryAdjustmentPayload {
  """
  The exact same \`clientMutationId\` that was provided in the mutation input,
  unchanged and unused. May be used by a client to track mutations.
  """
  clientMutationId: String

  """The \`InventoryAdjustment\` that was updated by this mutation."""
  inventoryAdjustment: InventoryAdjustment

  """
  Our root query field type. Allows us to run any query from our mutation payload.
  """
  query: Query

  """An edge for our \`InventoryAdjustment\`. May be used by Relay 1."""
  inventoryAdjustmentEdge(
    """The method to use when ordering \`InventoryAdjustment\`."""
    orderBy: [InventoryAdjustmentOrderBy!]! = [PRIMARY_KEY_ASC]
  ): InventoryAdjustmentEdge
}

"""All input for the \`updateInventoryAdjustmentById\` mutation."""
input UpdateInventoryAdjustmentByIdInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String

  """
  The globally unique \`ID\` which will identify a single \`InventoryAdjustment\` to be updated.
  """
  id: ID!

  """
  An object where the defined keys will be set on the \`InventoryAdjustment\` being updated.
  """
  patch: InventoryAdjustmentPatch!
}

"""
Represents an update to a \`InventoryAdjustment\`. Fields that are set will be updated.
"""
input InventoryAdjustmentPatch {
  rowId: UUID
  productId: UUID
  quantityChange: Int
  reason: String
  referenceId: UUID
  createdAt: Datetime
}

"""All input for the \`updateInventoryAdjustment\` mutation."""
input UpdateInventoryAdjustmentInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String
  rowId: UUID!

  """
  An object where the defined keys will be set on the \`InventoryAdjustment\` being updated.
  """
  patch: InventoryAdjustmentPatch!
}

"""The output of our update \`InvoiceLineItem\` mutation."""
type UpdateInvoiceLineItemPayload {
  """
  The exact same \`clientMutationId\` that was provided in the mutation input,
  unchanged and unused. May be used by a client to track mutations.
  """
  clientMutationId: String

  """The \`InvoiceLineItem\` that was updated by this mutation."""
  invoiceLineItem: InvoiceLineItem

  """
  Our root query field type. Allows us to run any query from our mutation payload.
  """
  query: Query

  """An edge for our \`InvoiceLineItem\`. May be used by Relay 1."""
  invoiceLineItemEdge(
    """The method to use when ordering \`InvoiceLineItem\`."""
    orderBy: [InvoiceLineItemOrderBy!]! = [PRIMARY_KEY_ASC]
  ): InvoiceLineItemEdge
}

"""All input for the \`updateInvoiceLineItemById\` mutation."""
input UpdateInvoiceLineItemByIdInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String

  """
  The globally unique \`ID\` which will identify a single \`InvoiceLineItem\` to be updated.
  """
  id: ID!

  """
  An object where the defined keys will be set on the \`InvoiceLineItem\` being updated.
  """
  patch: InvoiceLineItemPatch!
}

"""
Represents an update to a \`InvoiceLineItem\`. Fields that are set will be updated.
"""
input InvoiceLineItemPatch {
  rowId: UUID
  invoiceId: UUID
  productId: UUID
  description: String
  quantity: BigFloat
  unitPrice: BigFloat
  amount: BigFloat
  sortOrder: Int
}

"""All input for the \`updateInvoiceLineItem\` mutation."""
input UpdateInvoiceLineItemInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String
  rowId: UUID!

  """
  An object where the defined keys will be set on the \`InvoiceLineItem\` being updated.
  """
  patch: InvoiceLineItemPatch!
}

"""The output of our update \`OrganizationSetting\` mutation."""
type UpdateOrganizationSettingPayload {
  """
  The exact same \`clientMutationId\` that was provided in the mutation input,
  unchanged and unused. May be used by a client to track mutations.
  """
  clientMutationId: String

  """The \`OrganizationSetting\` that was updated by this mutation."""
  organizationSetting: OrganizationSetting

  """
  Our root query field type. Allows us to run any query from our mutation payload.
  """
  query: Query

  """An edge for our \`OrganizationSetting\`. May be used by Relay 1."""
  organizationSettingEdge(
    """The method to use when ordering \`OrganizationSetting\`."""
    orderBy: [OrganizationSettingOrderBy!]! = [PRIMARY_KEY_ASC]
  ): OrganizationSettingEdge
}

"""All input for the \`updateOrganizationSettingById\` mutation."""
input UpdateOrganizationSettingByIdInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String

  """
  The globally unique \`ID\` which will identify a single \`OrganizationSetting\` to be updated.
  """
  id: ID!

  """
  An object where the defined keys will be set on the \`OrganizationSetting\` being updated.
  """
  patch: OrganizationSettingPatch!
}

"""
Represents an update to a \`OrganizationSetting\`. Fields that are set will be updated.
"""
input OrganizationSettingPatch {
  rowId: UUID
  organizationId: String
  accentColor: String
  createdAt: Datetime
  updatedAt: Datetime
}

"""All input for the \`updateOrganizationSetting\` mutation."""
input UpdateOrganizationSettingInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String
  rowId: UUID!

  """
  An object where the defined keys will be set on the \`OrganizationSetting\` being updated.
  """
  patch: OrganizationSettingPatch!
}

"""The output of our update \`Product\` mutation."""
type UpdateProductPayload {
  """
  The exact same \`clientMutationId\` that was provided in the mutation input,
  unchanged and unused. May be used by a client to track mutations.
  """
  clientMutationId: String

  """The \`Product\` that was updated by this mutation."""
  product: Product

  """
  Our root query field type. Allows us to run any query from our mutation payload.
  """
  query: Query

  """An edge for our \`Product\`. May be used by Relay 1."""
  productEdge(
    """The method to use when ordering \`Product\`."""
    orderBy: [ProductOrderBy!]! = [PRIMARY_KEY_ASC]
  ): ProductEdge
}

"""All input for the \`updateProductById\` mutation."""
input UpdateProductByIdInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String

  """
  The globally unique \`ID\` which will identify a single \`Product\` to be updated.
  """
  id: ID!

  """
  An object where the defined keys will be set on the \`Product\` being updated.
  """
  patch: ProductPatch!
}

"""
Represents an update to a \`Product\`. Fields that are set will be updated.
"""
input ProductPatch {
  rowId: UUID
  organizationId: String
  name: String
  description: String
  sku: String
  unitPrice: BigFloat
  currentQuantity: Int
  lowStockThreshold: Int
  isActive: Boolean
  createdAt: Datetime
  updatedAt: Datetime
}

"""All input for the \`updateProduct\` mutation."""
input UpdateProductInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String
  rowId: UUID!

  """
  An object where the defined keys will be set on the \`Product\` being updated.
  """
  patch: ProductPatch!
}

"""The output of our update \`DocumentNumberingConfig\` mutation."""
type UpdateDocumentNumberingConfigPayload {
  """
  The exact same \`clientMutationId\` that was provided in the mutation input,
  unchanged and unused. May be used by a client to track mutations.
  """
  clientMutationId: String

  """The \`DocumentNumberingConfig\` that was updated by this mutation."""
  documentNumberingConfig: DocumentNumberingConfig

  """
  Our root query field type. Allows us to run any query from our mutation payload.
  """
  query: Query

  """An edge for our \`DocumentNumberingConfig\`. May be used by Relay 1."""
  documentNumberingConfigEdge(
    """The method to use when ordering \`DocumentNumberingConfig\`."""
    orderBy: [DocumentNumberingConfigOrderBy!]! = [PRIMARY_KEY_ASC]
  ): DocumentNumberingConfigEdge
}

"""All input for the \`updateDocumentNumberingConfigById\` mutation."""
input UpdateDocumentNumberingConfigByIdInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String

  """
  The globally unique \`ID\` which will identify a single \`DocumentNumberingConfig\` to be updated.
  """
  id: ID!

  """
  An object where the defined keys will be set on the \`DocumentNumberingConfig\` being updated.
  """
  patch: DocumentNumberingConfigPatch!
}

"""
Represents an update to a \`DocumentNumberingConfig\`. Fields that are set will be updated.
"""
input DocumentNumberingConfigPatch {
  rowId: UUID
  organizationId: String
  documentType: String
  prefix: String
  separator: String
  dateFormat: String
  idStrategy: String
  sequentialPadding: Int
  randomLength: Int
  nextSequentialNumber: Int
  createdAt: Datetime
  updatedAt: Datetime
}

"""All input for the \`updateDocumentNumberingConfig\` mutation."""
input UpdateDocumentNumberingConfigInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String
  rowId: UUID!

  """
  An object where the defined keys will be set on the \`DocumentNumberingConfig\` being updated.
  """
  patch: DocumentNumberingConfigPatch!
}

"""The output of our update \`Person\` mutation."""
type UpdatePersonPayload {
  """
  The exact same \`clientMutationId\` that was provided in the mutation input,
  unchanged and unused. May be used by a client to track mutations.
  """
  clientMutationId: String

  """The \`Person\` that was updated by this mutation."""
  person: Person

  """
  Our root query field type. Allows us to run any query from our mutation payload.
  """
  query: Query

  """An edge for our \`Person\`. May be used by Relay 1."""
  personEdge(
    """The method to use when ordering \`Person\`."""
    orderBy: [PersonOrderBy!]! = [PRIMARY_KEY_ASC]
  ): PersonEdge
}

"""All input for the \`updatePersonById\` mutation."""
input UpdatePersonByIdInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String

  """
  The globally unique \`ID\` which will identify a single \`Person\` to be updated.
  """
  id: ID!

  """
  An object where the defined keys will be set on the \`Person\` being updated.
  """
  patch: PersonPatch!
}

"""
Represents an update to a \`Person\`. Fields that are set will be updated.
"""
input PersonPatch {
  rowId: UUID
  organizationId: String
  firstName: String
  lastName: String
  phone: String
  avatarUrl: String
  tags: [String]
  notes: String
  createdAt: Datetime
  updatedAt: Datetime
  emails: [String]
  internal: Boolean
}

"""All input for the \`updatePerson\` mutation."""
input UpdatePersonInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String
  rowId: UUID!

  """
  An object where the defined keys will be set on the \`Person\` being updated.
  """
  patch: PersonPatch!
}

"""The output of our update \`Company\` mutation."""
type UpdateCompanyPayload {
  """
  The exact same \`clientMutationId\` that was provided in the mutation input,
  unchanged and unused. May be used by a client to track mutations.
  """
  clientMutationId: String

  """The \`Company\` that was updated by this mutation."""
  company: Company

  """
  Our root query field type. Allows us to run any query from our mutation payload.
  """
  query: Query

  """An edge for our \`Company\`. May be used by Relay 1."""
  companyEdge(
    """The method to use when ordering \`Company\`."""
    orderBy: [CompanyOrderBy!]! = [PRIMARY_KEY_ASC]
  ): CompanyEdge
}

"""All input for the \`updateCompanyById\` mutation."""
input UpdateCompanyByIdInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String

  """
  The globally unique \`ID\` which will identify a single \`Company\` to be updated.
  """
  id: ID!

  """
  An object where the defined keys will be set on the \`Company\` being updated.
  """
  patch: CompanyPatch!
}

"""
Represents an update to a \`Company\`. Fields that are set will be updated.
"""
input CompanyPatch {
  rowId: UUID
  organizationId: String
  name: String
  website: String
  industry: String
  phone: String
  email: String
  addressLine1: String
  addressLine2: String
  city: String
  state: String
  postalCode: String
  country: String
  notes: String
  createdAt: Datetime
  updatedAt: Datetime
}

"""All input for the \`updateCompany\` mutation."""
input UpdateCompanyInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String
  rowId: UUID!

  """
  An object where the defined keys will be set on the \`Company\` being updated.
  """
  patch: CompanyPatch!
}

"""The output of our update \`QuoteLineItem\` mutation."""
type UpdateQuoteLineItemPayload {
  """
  The exact same \`clientMutationId\` that was provided in the mutation input,
  unchanged and unused. May be used by a client to track mutations.
  """
  clientMutationId: String

  """The \`QuoteLineItem\` that was updated by this mutation."""
  quoteLineItem: QuoteLineItem

  """
  Our root query field type. Allows us to run any query from our mutation payload.
  """
  query: Query

  """An edge for our \`QuoteLineItem\`. May be used by Relay 1."""
  quoteLineItemEdge(
    """The method to use when ordering \`QuoteLineItem\`."""
    orderBy: [QuoteLineItemOrderBy!]! = [PRIMARY_KEY_ASC]
  ): QuoteLineItemEdge
}

"""All input for the \`updateQuoteLineItemById\` mutation."""
input UpdateQuoteLineItemByIdInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String

  """
  The globally unique \`ID\` which will identify a single \`QuoteLineItem\` to be updated.
  """
  id: ID!

  """
  An object where the defined keys will be set on the \`QuoteLineItem\` being updated.
  """
  patch: QuoteLineItemPatch!
}

"""
Represents an update to a \`QuoteLineItem\`. Fields that are set will be updated.
"""
input QuoteLineItemPatch {
  rowId: UUID
  quoteId: UUID
  productId: UUID
  description: String
  quantity: BigFloat
  unitPrice: BigFloat
  amount: BigFloat
  pricingType: String
  estimatedHours: BigFloat
  royaltyPercentage: BigFloat
  sortOrder: Int
  hourlyRate: BigFloat
  weeklyCapHours: Int
  monthlyCapHours: Int
  maxCapHours: Int
  royaltyTimeframe: Int
  royaltyTimeframeUnit: String
  royaltyThreshold: BigFloat
  royaltyBuyoutAmount: BigFloat
  subtitle: String
  minimumBillingMinutes: Int
}

"""All input for the \`updateQuoteLineItem\` mutation."""
input UpdateQuoteLineItemInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String
  rowId: UUID!

  """
  An object where the defined keys will be set on the \`QuoteLineItem\` being updated.
  """
  patch: QuoteLineItemPatch!
}

"""The output of our update \`Invoice\` mutation."""
type UpdateInvoicePayload {
  """
  The exact same \`clientMutationId\` that was provided in the mutation input,
  unchanged and unused. May be used by a client to track mutations.
  """
  clientMutationId: String

  """The \`Invoice\` that was updated by this mutation."""
  invoice: Invoice

  """
  Our root query field type. Allows us to run any query from our mutation payload.
  """
  query: Query

  """An edge for our \`Invoice\`. May be used by Relay 1."""
  invoiceEdge(
    """The method to use when ordering \`Invoice\`."""
    orderBy: [InvoiceOrderBy!]! = [PRIMARY_KEY_ASC]
  ): InvoiceEdge
}

"""All input for the \`updateInvoiceById\` mutation."""
input UpdateInvoiceByIdInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String

  """
  The globally unique \`ID\` which will identify a single \`Invoice\` to be updated.
  """
  id: ID!

  """
  An object where the defined keys will be set on the \`Invoice\` being updated.
  """
  patch: InvoicePatch!
}

"""
Represents an update to a \`Invoice\`. Fields that are set will be updated.
"""
input InvoicePatch {
  rowId: UUID
  organizationId: String
  invoiceNumber: String
  companyId: UUID
  contactId: UUID
  status: String
  issueDate: Date
  dueDate: Date
  notes: String
  subtotal: BigFloat
  taxRate: BigFloat
  taxAmount: BigFloat
  total: BigFloat
  currency: String
  paidAt: Datetime
  paymentReference: String
  paymentLinkUrl: String
  createdAt: Datetime
  updatedAt: Datetime
  billTo: String
}

"""All input for the \`updateInvoice\` mutation."""
input UpdateInvoiceInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String
  rowId: UUID!

  """
  An object where the defined keys will be set on the \`Invoice\` being updated.
  """
  patch: InvoicePatch!
}

"""The output of our update \`Quote\` mutation."""
type UpdateQuotePayload {
  """
  The exact same \`clientMutationId\` that was provided in the mutation input,
  unchanged and unused. May be used by a client to track mutations.
  """
  clientMutationId: String

  """The \`Quote\` that was updated by this mutation."""
  quote: Quote

  """
  Our root query field type. Allows us to run any query from our mutation payload.
  """
  query: Query

  """An edge for our \`Quote\`. May be used by Relay 1."""
  quoteEdge(
    """The method to use when ordering \`Quote\`."""
    orderBy: [QuoteOrderBy!]! = [PRIMARY_KEY_ASC]
  ): QuoteEdge
}

"""All input for the \`updateQuoteById\` mutation."""
input UpdateQuoteByIdInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String

  """
  The globally unique \`ID\` which will identify a single \`Quote\` to be updated.
  """
  id: ID!

  """
  An object where the defined keys will be set on the \`Quote\` being updated.
  """
  patch: QuotePatch!
}

"""
Represents an update to a \`Quote\`. Fields that are set will be updated.
"""
input QuotePatch {
  rowId: UUID
  organizationId: String
  quoteNumber: String
  companyId: UUID
  contactId: UUID
  title: String
  description: String
  status: String
  validUntil: Date
  terms: String
  notes: String
  subtotal: BigFloat
  taxRate: BigFloat
  taxAmount: BigFloat
  total: BigFloat
  currency: String
  convertedInvoiceId: UUID
  createdAt: Datetime
  updatedAt: Datetime
  projectType: String
  timeRange: String
  additionalTerms: [String]
  clientName: String
  clientEmail: String
  additionalItemsLabel: String
}

"""All input for the \`updateQuote\` mutation."""
input UpdateQuoteInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String
  rowId: UUID!

  """
  An object where the defined keys will be set on the \`Quote\` being updated.
  """
  patch: QuotePatch!
}

"""The output of our delete \`CompanyMember\` mutation."""
type DeleteCompanyMemberPayload {
  """
  The exact same \`clientMutationId\` that was provided in the mutation input,
  unchanged and unused. May be used by a client to track mutations.
  """
  clientMutationId: String

  """The \`CompanyMember\` that was deleted by this mutation."""
  companyMember: CompanyMember
  deletedCompanyMemberId: ID

  """
  Our root query field type. Allows us to run any query from our mutation payload.
  """
  query: Query

  """An edge for our \`CompanyMember\`. May be used by Relay 1."""
  companyMemberEdge(
    """The method to use when ordering \`CompanyMember\`."""
    orderBy: [CompanyMemberOrderBy!]! = [PRIMARY_KEY_ASC]
  ): CompanyMemberEdge
}

"""All input for the \`deleteCompanyMemberById\` mutation."""
input DeleteCompanyMemberByIdInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String

  """
  The globally unique \`ID\` which will identify a single \`CompanyMember\` to be deleted.
  """
  id: ID!
}

"""All input for the \`deleteCompanyMember\` mutation."""
input DeleteCompanyMemberInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String
  rowId: UUID!
}

"""The output of our delete \`InventoryAdjustment\` mutation."""
type DeleteInventoryAdjustmentPayload {
  """
  The exact same \`clientMutationId\` that was provided in the mutation input,
  unchanged and unused. May be used by a client to track mutations.
  """
  clientMutationId: String

  """The \`InventoryAdjustment\` that was deleted by this mutation."""
  inventoryAdjustment: InventoryAdjustment
  deletedInventoryAdjustmentId: ID

  """
  Our root query field type. Allows us to run any query from our mutation payload.
  """
  query: Query

  """An edge for our \`InventoryAdjustment\`. May be used by Relay 1."""
  inventoryAdjustmentEdge(
    """The method to use when ordering \`InventoryAdjustment\`."""
    orderBy: [InventoryAdjustmentOrderBy!]! = [PRIMARY_KEY_ASC]
  ): InventoryAdjustmentEdge
}

"""All input for the \`deleteInventoryAdjustmentById\` mutation."""
input DeleteInventoryAdjustmentByIdInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String

  """
  The globally unique \`ID\` which will identify a single \`InventoryAdjustment\` to be deleted.
  """
  id: ID!
}

"""All input for the \`deleteInventoryAdjustment\` mutation."""
input DeleteInventoryAdjustmentInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String
  rowId: UUID!
}

"""The output of our delete \`InvoiceLineItem\` mutation."""
type DeleteInvoiceLineItemPayload {
  """
  The exact same \`clientMutationId\` that was provided in the mutation input,
  unchanged and unused. May be used by a client to track mutations.
  """
  clientMutationId: String

  """The \`InvoiceLineItem\` that was deleted by this mutation."""
  invoiceLineItem: InvoiceLineItem
  deletedInvoiceLineItemId: ID

  """
  Our root query field type. Allows us to run any query from our mutation payload.
  """
  query: Query

  """An edge for our \`InvoiceLineItem\`. May be used by Relay 1."""
  invoiceLineItemEdge(
    """The method to use when ordering \`InvoiceLineItem\`."""
    orderBy: [InvoiceLineItemOrderBy!]! = [PRIMARY_KEY_ASC]
  ): InvoiceLineItemEdge
}

"""All input for the \`deleteInvoiceLineItemById\` mutation."""
input DeleteInvoiceLineItemByIdInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String

  """
  The globally unique \`ID\` which will identify a single \`InvoiceLineItem\` to be deleted.
  """
  id: ID!
}

"""All input for the \`deleteInvoiceLineItem\` mutation."""
input DeleteInvoiceLineItemInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String
  rowId: UUID!
}

"""The output of our delete \`OrganizationSetting\` mutation."""
type DeleteOrganizationSettingPayload {
  """
  The exact same \`clientMutationId\` that was provided in the mutation input,
  unchanged and unused. May be used by a client to track mutations.
  """
  clientMutationId: String

  """The \`OrganizationSetting\` that was deleted by this mutation."""
  organizationSetting: OrganizationSetting
  deletedOrganizationSettingId: ID

  """
  Our root query field type. Allows us to run any query from our mutation payload.
  """
  query: Query

  """An edge for our \`OrganizationSetting\`. May be used by Relay 1."""
  organizationSettingEdge(
    """The method to use when ordering \`OrganizationSetting\`."""
    orderBy: [OrganizationSettingOrderBy!]! = [PRIMARY_KEY_ASC]
  ): OrganizationSettingEdge
}

"""All input for the \`deleteOrganizationSettingById\` mutation."""
input DeleteOrganizationSettingByIdInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String

  """
  The globally unique \`ID\` which will identify a single \`OrganizationSetting\` to be deleted.
  """
  id: ID!
}

"""All input for the \`deleteOrganizationSetting\` mutation."""
input DeleteOrganizationSettingInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String
  rowId: UUID!
}

"""The output of our delete \`Product\` mutation."""
type DeleteProductPayload {
  """
  The exact same \`clientMutationId\` that was provided in the mutation input,
  unchanged and unused. May be used by a client to track mutations.
  """
  clientMutationId: String

  """The \`Product\` that was deleted by this mutation."""
  product: Product
  deletedProductId: ID

  """
  Our root query field type. Allows us to run any query from our mutation payload.
  """
  query: Query

  """An edge for our \`Product\`. May be used by Relay 1."""
  productEdge(
    """The method to use when ordering \`Product\`."""
    orderBy: [ProductOrderBy!]! = [PRIMARY_KEY_ASC]
  ): ProductEdge
}

"""All input for the \`deleteProductById\` mutation."""
input DeleteProductByIdInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String

  """
  The globally unique \`ID\` which will identify a single \`Product\` to be deleted.
  """
  id: ID!
}

"""All input for the \`deleteProduct\` mutation."""
input DeleteProductInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String
  rowId: UUID!
}

"""The output of our delete \`DocumentNumberingConfig\` mutation."""
type DeleteDocumentNumberingConfigPayload {
  """
  The exact same \`clientMutationId\` that was provided in the mutation input,
  unchanged and unused. May be used by a client to track mutations.
  """
  clientMutationId: String

  """The \`DocumentNumberingConfig\` that was deleted by this mutation."""
  documentNumberingConfig: DocumentNumberingConfig
  deletedDocumentNumberingConfigId: ID

  """
  Our root query field type. Allows us to run any query from our mutation payload.
  """
  query: Query

  """An edge for our \`DocumentNumberingConfig\`. May be used by Relay 1."""
  documentNumberingConfigEdge(
    """The method to use when ordering \`DocumentNumberingConfig\`."""
    orderBy: [DocumentNumberingConfigOrderBy!]! = [PRIMARY_KEY_ASC]
  ): DocumentNumberingConfigEdge
}

"""All input for the \`deleteDocumentNumberingConfigById\` mutation."""
input DeleteDocumentNumberingConfigByIdInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String

  """
  The globally unique \`ID\` which will identify a single \`DocumentNumberingConfig\` to be deleted.
  """
  id: ID!
}

"""All input for the \`deleteDocumentNumberingConfig\` mutation."""
input DeleteDocumentNumberingConfigInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String
  rowId: UUID!
}

"""The output of our delete \`Person\` mutation."""
type DeletePersonPayload {
  """
  The exact same \`clientMutationId\` that was provided in the mutation input,
  unchanged and unused. May be used by a client to track mutations.
  """
  clientMutationId: String

  """The \`Person\` that was deleted by this mutation."""
  person: Person
  deletedPersonId: ID

  """
  Our root query field type. Allows us to run any query from our mutation payload.
  """
  query: Query

  """An edge for our \`Person\`. May be used by Relay 1."""
  personEdge(
    """The method to use when ordering \`Person\`."""
    orderBy: [PersonOrderBy!]! = [PRIMARY_KEY_ASC]
  ): PersonEdge
}

"""All input for the \`deletePersonById\` mutation."""
input DeletePersonByIdInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String

  """
  The globally unique \`ID\` which will identify a single \`Person\` to be deleted.
  """
  id: ID!
}

"""All input for the \`deletePerson\` mutation."""
input DeletePersonInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String
  rowId: UUID!
}

"""The output of our delete \`Company\` mutation."""
type DeleteCompanyPayload {
  """
  The exact same \`clientMutationId\` that was provided in the mutation input,
  unchanged and unused. May be used by a client to track mutations.
  """
  clientMutationId: String

  """The \`Company\` that was deleted by this mutation."""
  company: Company
  deletedCompanyId: ID

  """
  Our root query field type. Allows us to run any query from our mutation payload.
  """
  query: Query

  """An edge for our \`Company\`. May be used by Relay 1."""
  companyEdge(
    """The method to use when ordering \`Company\`."""
    orderBy: [CompanyOrderBy!]! = [PRIMARY_KEY_ASC]
  ): CompanyEdge
}

"""All input for the \`deleteCompanyById\` mutation."""
input DeleteCompanyByIdInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String

  """
  The globally unique \`ID\` which will identify a single \`Company\` to be deleted.
  """
  id: ID!
}

"""All input for the \`deleteCompany\` mutation."""
input DeleteCompanyInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String
  rowId: UUID!
}

"""The output of our delete \`QuoteLineItem\` mutation."""
type DeleteQuoteLineItemPayload {
  """
  The exact same \`clientMutationId\` that was provided in the mutation input,
  unchanged and unused. May be used by a client to track mutations.
  """
  clientMutationId: String

  """The \`QuoteLineItem\` that was deleted by this mutation."""
  quoteLineItem: QuoteLineItem
  deletedQuoteLineItemId: ID

  """
  Our root query field type. Allows us to run any query from our mutation payload.
  """
  query: Query

  """An edge for our \`QuoteLineItem\`. May be used by Relay 1."""
  quoteLineItemEdge(
    """The method to use when ordering \`QuoteLineItem\`."""
    orderBy: [QuoteLineItemOrderBy!]! = [PRIMARY_KEY_ASC]
  ): QuoteLineItemEdge
}

"""All input for the \`deleteQuoteLineItemById\` mutation."""
input DeleteQuoteLineItemByIdInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String

  """
  The globally unique \`ID\` which will identify a single \`QuoteLineItem\` to be deleted.
  """
  id: ID!
}

"""All input for the \`deleteQuoteLineItem\` mutation."""
input DeleteQuoteLineItemInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String
  rowId: UUID!
}

"""The output of our delete \`Invoice\` mutation."""
type DeleteInvoicePayload {
  """
  The exact same \`clientMutationId\` that was provided in the mutation input,
  unchanged and unused. May be used by a client to track mutations.
  """
  clientMutationId: String

  """The \`Invoice\` that was deleted by this mutation."""
  invoice: Invoice
  deletedInvoiceId: ID

  """
  Our root query field type. Allows us to run any query from our mutation payload.
  """
  query: Query

  """An edge for our \`Invoice\`. May be used by Relay 1."""
  invoiceEdge(
    """The method to use when ordering \`Invoice\`."""
    orderBy: [InvoiceOrderBy!]! = [PRIMARY_KEY_ASC]
  ): InvoiceEdge
}

"""All input for the \`deleteInvoiceById\` mutation."""
input DeleteInvoiceByIdInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String

  """
  The globally unique \`ID\` which will identify a single \`Invoice\` to be deleted.
  """
  id: ID!
}

"""All input for the \`deleteInvoice\` mutation."""
input DeleteInvoiceInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String
  rowId: UUID!
}

"""The output of our delete \`Quote\` mutation."""
type DeleteQuotePayload {
  """
  The exact same \`clientMutationId\` that was provided in the mutation input,
  unchanged and unused. May be used by a client to track mutations.
  """
  clientMutationId: String

  """The \`Quote\` that was deleted by this mutation."""
  quote: Quote
  deletedQuoteId: ID

  """
  Our root query field type. Allows us to run any query from our mutation payload.
  """
  query: Query

  """An edge for our \`Quote\`. May be used by Relay 1."""
  quoteEdge(
    """The method to use when ordering \`Quote\`."""
    orderBy: [QuoteOrderBy!]! = [PRIMARY_KEY_ASC]
  ): QuoteEdge
}

"""All input for the \`deleteQuoteById\` mutation."""
input DeleteQuoteByIdInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String

  """
  The globally unique \`ID\` which will identify a single \`Quote\` to be deleted.
  """
  id: ID!
}

"""All input for the \`deleteQuote\` mutation."""
input DeleteQuoteInput {
  """
  An arbitrary string value with no semantic meaning. Will be included in the
  payload verbatim. May be used to track mutations by the client.
  """
  clientMutationId: String
  rowId: UUID!
}

input GenerateDocumentNumberInput {
  organizationId: String!
  documentType: String!
  idStrategy: String
}

type GenerateDocumentNumberPayload {
  documentNumber: String!
}`;
export const objects = {
  Query: {
    assertStep() {
      return !0;
    },
    plans: {
      companies: {
        plan() {
          return connection(resource_companyPgResource.find());
        },
        args: {
          first(_, $connection, arg) {
            $connection.setFirst(arg.getRaw());
          },
          last(_, $connection, val) {
            $connection.setLast(val.getRaw());
          },
          offset(_, $connection, val) {
            $connection.setOffset(val.getRaw());
          },
          before(_, $connection, val) {
            $connection.setBefore(val.getRaw());
          },
          after(_, $connection, val) {
            $connection.setAfter(val.getRaw());
          },
          condition(_condition, $connection, arg) {
            const $select = $connection.getSubplan();
            arg.apply($select, qbWhereBuilder);
          },
          filter(_, $connection, fieldArg) {
            const $pgSelect = $connection.getSubplan();
            fieldArg.apply($pgSelect, (queryBuilder, value) => {
              assertAllowed8(value, "object");
              if (value == null) return;
              const condition = new PgCondition(queryBuilder);
              return condition;
            });
          },
          orderBy(parent, $connection, value) {
            const $select = $connection.getSubplan();
            value.apply($select);
          }
        }
      },
      company(_$root, {
        $rowId
      }) {
        return resource_companyPgResource.get({
          id: $rowId
        });
      },
      companyById(_$parent, args) {
        const $nodeId = args.getRaw("id");
        return nodeFetcher_Company($nodeId);
      },
      companyMember(_$root, {
        $rowId
      }) {
        return resource_company_memberPgResource.get({
          id: $rowId
        });
      },
      companyMemberById(_$parent, args) {
        const $nodeId = args.getRaw("id");
        return nodeFetcher_CompanyMember($nodeId);
      },
      companyMembers: {
        plan() {
          return connection(resource_company_memberPgResource.find());
        },
        args: {
          first(_, $connection, arg) {
            $connection.setFirst(arg.getRaw());
          },
          last(_, $connection, val) {
            $connection.setLast(val.getRaw());
          },
          offset(_, $connection, val) {
            $connection.setOffset(val.getRaw());
          },
          before(_, $connection, val) {
            $connection.setBefore(val.getRaw());
          },
          after(_, $connection, val) {
            $connection.setAfter(val.getRaw());
          },
          condition(_condition, $connection, arg) {
            const $select = $connection.getSubplan();
            arg.apply($select, qbWhereBuilder);
          },
          filter(_, $connection, fieldArg) {
            const $pgSelect = $connection.getSubplan();
            fieldArg.apply($pgSelect, (queryBuilder, value) => {
              assertAllowed(value, "object");
              if (value == null) return;
              const condition = new PgCondition(queryBuilder);
              return condition;
            });
          },
          orderBy(parent, $connection, value) {
            const $select = $connection.getSubplan();
            value.apply($select);
          }
        }
      },
      documentNumberingConfig(_$root, {
        $rowId
      }) {
        return resource_document_numbering_configPgResource.get({
          id: $rowId
        });
      },
      documentNumberingConfigById(_$parent, args) {
        const $nodeId = args.getRaw("id");
        return nodeFetcher_DocumentNumberingConfig($nodeId);
      },
      documentNumberingConfigs: {
        plan() {
          return connection(resource_document_numbering_configPgResource.find());
        },
        args: {
          first(_, $connection, arg) {
            $connection.setFirst(arg.getRaw());
          },
          last(_, $connection, val) {
            $connection.setLast(val.getRaw());
          },
          offset(_, $connection, val) {
            $connection.setOffset(val.getRaw());
          },
          before(_, $connection, val) {
            $connection.setBefore(val.getRaw());
          },
          after(_, $connection, val) {
            $connection.setAfter(val.getRaw());
          },
          condition(_condition, $connection, arg) {
            const $select = $connection.getSubplan();
            arg.apply($select, qbWhereBuilder);
          },
          filter(_, $connection, fieldArg) {
            const $pgSelect = $connection.getSubplan();
            fieldArg.apply($pgSelect, (queryBuilder, value) => {
              assertAllowed6(value, "object");
              if (value == null) return;
              const condition = new PgCondition(queryBuilder);
              return condition;
            });
          },
          orderBy(parent, $connection, value) {
            const $select = $connection.getSubplan();
            value.apply($select);
          }
        }
      },
      id($parent) {
        const specifier = nodeIdHandler_Query.plan($parent);
        return lambda(specifier, nodeIdCodecs[nodeIdHandler_Query.codec.name].encode);
      },
      inventoryAdjustment(_$root, {
        $rowId
      }) {
        return resource_inventory_adjustmentPgResource.get({
          id: $rowId
        });
      },
      inventoryAdjustmentById(_$parent, args) {
        const $nodeId = args.getRaw("id");
        return nodeFetcher_InventoryAdjustment($nodeId);
      },
      inventoryAdjustments: {
        plan() {
          return connection(resource_inventory_adjustmentPgResource.find());
        },
        args: {
          first(_, $connection, arg) {
            $connection.setFirst(arg.getRaw());
          },
          last(_, $connection, val) {
            $connection.setLast(val.getRaw());
          },
          offset(_, $connection, val) {
            $connection.setOffset(val.getRaw());
          },
          before(_, $connection, val) {
            $connection.setBefore(val.getRaw());
          },
          after(_, $connection, val) {
            $connection.setAfter(val.getRaw());
          },
          condition(_condition, $connection, arg) {
            const $select = $connection.getSubplan();
            arg.apply($select, qbWhereBuilder);
          },
          filter(_, $connection, fieldArg) {
            const $pgSelect = $connection.getSubplan();
            fieldArg.apply($pgSelect, (queryBuilder, value) => {
              assertAllowed2(value, "object");
              if (value == null) return;
              const condition = new PgCondition(queryBuilder);
              return condition;
            });
          },
          orderBy(parent, $connection, value) {
            const $select = $connection.getSubplan();
            value.apply($select);
          }
        }
      },
      invoice(_$root, {
        $rowId
      }) {
        return resource_invoicePgResource.get({
          id: $rowId
        });
      },
      invoiceById(_$parent, args) {
        const $nodeId = args.getRaw("id");
        return nodeFetcher_Invoice($nodeId);
      },
      invoiceLineItem(_$root, {
        $rowId
      }) {
        return resource_invoice_line_itemPgResource.get({
          id: $rowId
        });
      },
      invoiceLineItemById(_$parent, args) {
        const $nodeId = args.getRaw("id");
        return nodeFetcher_InvoiceLineItem($nodeId);
      },
      invoiceLineItems: {
        plan() {
          return connection(resource_invoice_line_itemPgResource.find());
        },
        args: {
          first(_, $connection, arg) {
            $connection.setFirst(arg.getRaw());
          },
          last(_, $connection, val) {
            $connection.setLast(val.getRaw());
          },
          offset(_, $connection, val) {
            $connection.setOffset(val.getRaw());
          },
          before(_, $connection, val) {
            $connection.setBefore(val.getRaw());
          },
          after(_, $connection, val) {
            $connection.setAfter(val.getRaw());
          },
          condition(_condition, $connection, arg) {
            const $select = $connection.getSubplan();
            arg.apply($select, qbWhereBuilder);
          },
          filter(_, $connection, fieldArg) {
            const $pgSelect = $connection.getSubplan();
            fieldArg.apply($pgSelect, (queryBuilder, value) => {
              assertAllowed3(value, "object");
              if (value == null) return;
              const condition = new PgCondition(queryBuilder);
              return condition;
            });
          },
          orderBy(parent, $connection, value) {
            const $select = $connection.getSubplan();
            value.apply($select);
          }
        }
      },
      invoices: {
        plan() {
          return connection(resource_invoicePgResource.find());
        },
        args: {
          first(_, $connection, arg) {
            $connection.setFirst(arg.getRaw());
          },
          last(_, $connection, val) {
            $connection.setLast(val.getRaw());
          },
          offset(_, $connection, val) {
            $connection.setOffset(val.getRaw());
          },
          before(_, $connection, val) {
            $connection.setBefore(val.getRaw());
          },
          after(_, $connection, val) {
            $connection.setAfter(val.getRaw());
          },
          condition(_condition, $connection, arg) {
            const $select = $connection.getSubplan();
            arg.apply($select, qbWhereBuilder);
          },
          filter(_, $connection, fieldArg) {
            const $pgSelect = $connection.getSubplan();
            fieldArg.apply($pgSelect, (queryBuilder, value) => {
              assertAllowed10(value, "object");
              if (value == null) return;
              const condition = new PgCondition(queryBuilder);
              return condition;
            });
          },
          orderBy(parent, $connection, value) {
            const $select = $connection.getSubplan();
            value.apply($select);
          }
        }
      },
      node(_$root, fieldArgs) {
        return fieldArgs.getRaw("id");
      },
      organizationSetting(_$root, {
        $rowId
      }) {
        return resource_organization_settingsPgResource.get({
          id: $rowId
        });
      },
      organizationSettingById(_$parent, args) {
        const $nodeId = args.getRaw("id");
        return nodeFetcher_OrganizationSetting($nodeId);
      },
      organizationSettings: {
        plan() {
          return connection(resource_organization_settingsPgResource.find());
        },
        args: {
          first(_, $connection, arg) {
            $connection.setFirst(arg.getRaw());
          },
          last(_, $connection, val) {
            $connection.setLast(val.getRaw());
          },
          offset(_, $connection, val) {
            $connection.setOffset(val.getRaw());
          },
          before(_, $connection, val) {
            $connection.setBefore(val.getRaw());
          },
          after(_, $connection, val) {
            $connection.setAfter(val.getRaw());
          },
          condition(_condition, $connection, arg) {
            const $select = $connection.getSubplan();
            arg.apply($select, qbWhereBuilder);
          },
          filter(_, $connection, fieldArg) {
            const $pgSelect = $connection.getSubplan();
            fieldArg.apply($pgSelect, (queryBuilder, value) => {
              assertAllowed4(value, "object");
              if (value == null) return;
              const condition = new PgCondition(queryBuilder);
              return condition;
            });
          },
          orderBy(parent, $connection, value) {
            const $select = $connection.getSubplan();
            value.apply($select);
          }
        }
      },
      people: {
        plan() {
          return connection(resource_personPgResource.find());
        },
        args: {
          first(_, $connection, arg) {
            $connection.setFirst(arg.getRaw());
          },
          last(_, $connection, val) {
            $connection.setLast(val.getRaw());
          },
          offset(_, $connection, val) {
            $connection.setOffset(val.getRaw());
          },
          before(_, $connection, val) {
            $connection.setBefore(val.getRaw());
          },
          after(_, $connection, val) {
            $connection.setAfter(val.getRaw());
          },
          condition(_condition, $connection, arg) {
            const $select = $connection.getSubplan();
            arg.apply($select, qbWhereBuilder);
          },
          filter(_, $connection, fieldArg) {
            const $pgSelect = $connection.getSubplan();
            fieldArg.apply($pgSelect, (queryBuilder, value) => {
              assertAllowed7(value, "object");
              if (value == null) return;
              const condition = new PgCondition(queryBuilder);
              return condition;
            });
          },
          orderBy(parent, $connection, value) {
            const $select = $connection.getSubplan();
            value.apply($select);
          }
        }
      },
      person(_$root, {
        $rowId
      }) {
        return resource_personPgResource.get({
          id: $rowId
        });
      },
      personById(_$parent, args) {
        const $nodeId = args.getRaw("id");
        return nodeFetcher_Person($nodeId);
      },
      product(_$root, {
        $rowId
      }) {
        return resource_productPgResource.get({
          id: $rowId
        });
      },
      productById(_$parent, args) {
        const $nodeId = args.getRaw("id");
        return nodeFetcher_Product($nodeId);
      },
      products: {
        plan() {
          return connection(resource_productPgResource.find());
        },
        args: {
          first(_, $connection, arg) {
            $connection.setFirst(arg.getRaw());
          },
          last(_, $connection, val) {
            $connection.setLast(val.getRaw());
          },
          offset(_, $connection, val) {
            $connection.setOffset(val.getRaw());
          },
          before(_, $connection, val) {
            $connection.setBefore(val.getRaw());
          },
          after(_, $connection, val) {
            $connection.setAfter(val.getRaw());
          },
          condition(_condition, $connection, arg) {
            const $select = $connection.getSubplan();
            arg.apply($select, qbWhereBuilder);
          },
          filter(_, $connection, fieldArg) {
            const $pgSelect = $connection.getSubplan();
            fieldArg.apply($pgSelect, (queryBuilder, value) => {
              assertAllowed5(value, "object");
              if (value == null) return;
              const condition = new PgCondition(queryBuilder);
              return condition;
            });
          },
          orderBy(parent, $connection, value) {
            const $select = $connection.getSubplan();
            value.apply($select);
          }
        }
      },
      query() {
        return rootValue();
      },
      quote(_$root, {
        $rowId
      }) {
        return resource_quotePgResource.get({
          id: $rowId
        });
      },
      quoteById(_$parent, args) {
        const $nodeId = args.getRaw("id");
        return nodeFetcher_Quote($nodeId);
      },
      quoteLineItem(_$root, {
        $rowId
      }) {
        return resource_quote_line_itemPgResource.get({
          id: $rowId
        });
      },
      quoteLineItemById(_$parent, args) {
        const $nodeId = args.getRaw("id");
        return nodeFetcher_QuoteLineItem($nodeId);
      },
      quoteLineItems: {
        plan() {
          return connection(resource_quote_line_itemPgResource.find());
        },
        args: {
          first(_, $connection, arg) {
            $connection.setFirst(arg.getRaw());
          },
          last(_, $connection, val) {
            $connection.setLast(val.getRaw());
          },
          offset(_, $connection, val) {
            $connection.setOffset(val.getRaw());
          },
          before(_, $connection, val) {
            $connection.setBefore(val.getRaw());
          },
          after(_, $connection, val) {
            $connection.setAfter(val.getRaw());
          },
          condition(_condition, $connection, arg) {
            const $select = $connection.getSubplan();
            arg.apply($select, qbWhereBuilder);
          },
          filter(_, $connection, fieldArg) {
            const $pgSelect = $connection.getSubplan();
            fieldArg.apply($pgSelect, (queryBuilder, value) => {
              assertAllowed9(value, "object");
              if (value == null) return;
              const condition = new PgCondition(queryBuilder);
              return condition;
            });
          },
          orderBy(parent, $connection, value) {
            const $select = $connection.getSubplan();
            value.apply($select);
          }
        }
      },
      quotes: {
        plan() {
          return connection(resource_quotePgResource.find());
        },
        args: {
          first(_, $connection, arg) {
            $connection.setFirst(arg.getRaw());
          },
          last(_, $connection, val) {
            $connection.setLast(val.getRaw());
          },
          offset(_, $connection, val) {
            $connection.setOffset(val.getRaw());
          },
          before(_, $connection, val) {
            $connection.setBefore(val.getRaw());
          },
          after(_, $connection, val) {
            $connection.setAfter(val.getRaw());
          },
          condition(_condition, $connection, arg) {
            const $select = $connection.getSubplan();
            arg.apply($select, qbWhereBuilder);
          },
          filter(_, $connection, fieldArg) {
            const $pgSelect = $connection.getSubplan();
            fieldArg.apply($pgSelect, (queryBuilder, value) => {
              assertAllowed11(value, "object");
              if (value == null) return;
              const condition = new PgCondition(queryBuilder);
              return condition;
            });
          },
          orderBy(parent, $connection, value) {
            const $select = $connection.getSubplan();
            value.apply($select);
          }
        }
      }
    }
  },
  Mutation: {
    assertStep: __ValueStep,
    plans: {
      createCompany: {
        plan(...planParams) {
          const smartPlan = (...overrideParams) => {
              const args = [...overrideParams.concat(planParams.slice(overrideParams.length))],
                $prev = oldPlan4.apply(this, args);
              if (!($prev instanceof ExecutableStep)) {
                console.error(`Wrapped a plan function at ${"Mutation"}.${"createCompany"}, but that function did not return a step!
${String(oldPlan4)}`);
                throw Error("Wrapped a plan function, but that function did not return a step!");
              }
              args[1].autoApply($prev);
              return $prev;
            },
            [$source, fieldArgs, info] = planParams,
            $newPlan = planWrapper4(smartPlan, $source, fieldArgs, info);
          if ($newPlan === void 0) throw Error("Your plan wrapper didn't return anything; it must return a step or null!");
          if ($newPlan !== null && !isExecutableStep($newPlan)) throw Error(`Your plan wrapper returned something other than a step... It must return a step (or null). (Returned: ${inspect($newPlan)})`);
          return $newPlan;
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      createCompanyMember: {
        plan(_, args) {
          const $insert = pgInsertSingle(resource_company_memberPgResource, Object.create(null));
          args.apply($insert);
          return object({
            result: $insert
          });
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      createDocumentNumberingConfig: {
        plan(...planParams) {
          const smartPlan = (...overrideParams) => {
              const args = [...overrideParams.concat(planParams.slice(overrideParams.length))],
                $prev = oldPlan2.apply(this, args);
              if (!($prev instanceof ExecutableStep)) {
                console.error(`Wrapped a plan function at ${"Mutation"}.${"createDocumentNumberingConfig"}, but that function did not return a step!
${String(oldPlan2)}`);
                throw Error("Wrapped a plan function, but that function did not return a step!");
              }
              args[1].autoApply($prev);
              return $prev;
            },
            [$source, fieldArgs, info] = planParams,
            $newPlan = planWrapper2(smartPlan, $source, fieldArgs, info);
          if ($newPlan === void 0) throw Error("Your plan wrapper didn't return anything; it must return a step or null!");
          if ($newPlan !== null && !isExecutableStep($newPlan)) throw Error(`Your plan wrapper returned something other than a step... It must return a step (or null). (Returned: ${inspect($newPlan)})`);
          return $newPlan;
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      createInventoryAdjustment: {
        plan(_, args) {
          const $insert = pgInsertSingle(resource_inventory_adjustmentPgResource, Object.create(null));
          args.apply($insert);
          return object({
            result: $insert
          });
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      createInvoice: {
        plan(...planParams) {
          const smartPlan = (...overrideParams) => {
              const args = [...overrideParams.concat(planParams.slice(overrideParams.length))],
                $prev = oldPlan5.apply(this, args);
              if (!($prev instanceof ExecutableStep)) {
                console.error(`Wrapped a plan function at ${"Mutation"}.${"createInvoice"}, but that function did not return a step!
${String(oldPlan5)}`);
                throw Error("Wrapped a plan function, but that function did not return a step!");
              }
              args[1].autoApply($prev);
              return $prev;
            },
            [$source, fieldArgs, info] = planParams,
            $newPlan = planWrapper5(smartPlan, $source, fieldArgs, info);
          if ($newPlan === void 0) throw Error("Your plan wrapper didn't return anything; it must return a step or null!");
          if ($newPlan !== null && !isExecutableStep($newPlan)) throw Error(`Your plan wrapper returned something other than a step... It must return a step (or null). (Returned: ${inspect($newPlan)})`);
          return $newPlan;
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      createInvoiceLineItem: {
        plan(_, args) {
          const $insert = pgInsertSingle(resource_invoice_line_itemPgResource, Object.create(null));
          args.apply($insert);
          return object({
            result: $insert
          });
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      createOrganizationSetting: {
        plan(_, args) {
          const $insert = pgInsertSingle(resource_organization_settingsPgResource, Object.create(null));
          args.apply($insert);
          return object({
            result: $insert
          });
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      createPerson: {
        plan(...planParams) {
          const smartPlan = (...overrideParams) => {
              const args = [...overrideParams.concat(planParams.slice(overrideParams.length))],
                $prev = oldPlan3.apply(this, args);
              if (!($prev instanceof ExecutableStep)) {
                console.error(`Wrapped a plan function at ${"Mutation"}.${"createPerson"}, but that function did not return a step!
${String(oldPlan3)}`);
                throw Error("Wrapped a plan function, but that function did not return a step!");
              }
              args[1].autoApply($prev);
              return $prev;
            },
            [$source, fieldArgs, info] = planParams,
            $newPlan = planWrapper3(smartPlan, $source, fieldArgs, info);
          if ($newPlan === void 0) throw Error("Your plan wrapper didn't return anything; it must return a step or null!");
          if ($newPlan !== null && !isExecutableStep($newPlan)) throw Error(`Your plan wrapper returned something other than a step... It must return a step (or null). (Returned: ${inspect($newPlan)})`);
          return $newPlan;
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      createProduct: {
        plan(...planParams) {
          const smartPlan = (...overrideParams) => {
              const args = [...overrideParams.concat(planParams.slice(overrideParams.length))],
                $prev = oldPlan.apply(this, args);
              if (!($prev instanceof ExecutableStep)) {
                console.error(`Wrapped a plan function at ${"Mutation"}.${"createProduct"}, but that function did not return a step!
${String(oldPlan)}`);
                throw Error("Wrapped a plan function, but that function did not return a step!");
              }
              args[1].autoApply($prev);
              return $prev;
            },
            [$source, fieldArgs, info] = planParams,
            $newPlan = planWrapper(smartPlan, $source, fieldArgs, info);
          if ($newPlan === void 0) throw Error("Your plan wrapper didn't return anything; it must return a step or null!");
          if ($newPlan !== null && !isExecutableStep($newPlan)) throw Error(`Your plan wrapper returned something other than a step... It must return a step (or null). (Returned: ${inspect($newPlan)})`);
          return $newPlan;
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      createQuote: {
        plan(...planParams) {
          const smartPlan = (...overrideParams) => {
              const args = [...overrideParams.concat(planParams.slice(overrideParams.length))],
                $prev = oldPlan6.apply(this, args);
              if (!($prev instanceof ExecutableStep)) {
                console.error(`Wrapped a plan function at ${"Mutation"}.${"createQuote"}, but that function did not return a step!
${String(oldPlan6)}`);
                throw Error("Wrapped a plan function, but that function did not return a step!");
              }
              args[1].autoApply($prev);
              return $prev;
            },
            [$source, fieldArgs, info] = planParams,
            $newPlan = planWrapper6(smartPlan, $source, fieldArgs, info);
          if ($newPlan === void 0) throw Error("Your plan wrapper didn't return anything; it must return a step or null!");
          if ($newPlan !== null && !isExecutableStep($newPlan)) throw Error(`Your plan wrapper returned something other than a step... It must return a step (or null). (Returned: ${inspect($newPlan)})`);
          return $newPlan;
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      createQuoteLineItem: {
        plan(_, args) {
          const $insert = pgInsertSingle(resource_quote_line_itemPgResource, Object.create(null));
          args.apply($insert);
          return object({
            result: $insert
          });
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      deleteCompany: {
        plan(...planParams) {
          const smartPlan = (...overrideParams) => {
              const args = [...overrideParams.concat(planParams.slice(overrideParams.length))],
                $prev = oldPlan16.apply(this, args);
              if (!($prev instanceof ExecutableStep)) {
                console.error(`Wrapped a plan function at ${"Mutation"}.${"deleteCompany"}, but that function did not return a step!
${String(oldPlan16)}`);
                throw Error("Wrapped a plan function, but that function did not return a step!");
              }
              args[1].autoApply($prev);
              return $prev;
            },
            [$source, fieldArgs, info] = planParams,
            $newPlan = planWrapper16(smartPlan, $source, fieldArgs, info);
          if ($newPlan === void 0) throw Error("Your plan wrapper didn't return anything; it must return a step or null!");
          if ($newPlan !== null && !isExecutableStep($newPlan)) throw Error(`Your plan wrapper returned something other than a step... It must return a step (or null). (Returned: ${inspect($newPlan)})`);
          return $newPlan;
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      deleteCompanyById: {
        plan(_$root, args) {
          const $delete = pgDeleteSingle(resource_companyPgResource, specFromArgs_Company2(args));
          args.apply($delete);
          return object({
            result: $delete
          });
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      deleteCompanyMember: {
        plan(_$root, args) {
          const $delete = pgDeleteSingle(resource_company_memberPgResource, {
            id: args.getRaw(['input', "rowId"])
          });
          args.apply($delete);
          return object({
            result: $delete
          });
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      deleteCompanyMemberById: {
        plan(_$root, args) {
          const $delete = pgDeleteSingle(resource_company_memberPgResource, specFromArgs_CompanyMember2(args));
          args.apply($delete);
          return object({
            result: $delete
          });
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      deleteDocumentNumberingConfig: {
        plan(...planParams) {
          const smartPlan = (...overrideParams) => {
              const args = [...overrideParams.concat(planParams.slice(overrideParams.length))],
                $prev = oldPlan14.apply(this, args);
              if (!($prev instanceof ExecutableStep)) {
                console.error(`Wrapped a plan function at ${"Mutation"}.${"deleteDocumentNumberingConfig"}, but that function did not return a step!
${String(oldPlan14)}`);
                throw Error("Wrapped a plan function, but that function did not return a step!");
              }
              args[1].autoApply($prev);
              return $prev;
            },
            [$source, fieldArgs, info] = planParams,
            $newPlan = planWrapper14(smartPlan, $source, fieldArgs, info);
          if ($newPlan === void 0) throw Error("Your plan wrapper didn't return anything; it must return a step or null!");
          if ($newPlan !== null && !isExecutableStep($newPlan)) throw Error(`Your plan wrapper returned something other than a step... It must return a step (or null). (Returned: ${inspect($newPlan)})`);
          return $newPlan;
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      deleteDocumentNumberingConfigById: {
        plan(_$root, args) {
          const $delete = pgDeleteSingle(resource_document_numbering_configPgResource, specFromArgs_DocumentNumberingConfig2(args));
          args.apply($delete);
          return object({
            result: $delete
          });
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      deleteInventoryAdjustment: {
        plan(_$root, args) {
          const $delete = pgDeleteSingle(resource_inventory_adjustmentPgResource, {
            id: args.getRaw(['input', "rowId"])
          });
          args.apply($delete);
          return object({
            result: $delete
          });
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      deleteInventoryAdjustmentById: {
        plan(_$root, args) {
          const $delete = pgDeleteSingle(resource_inventory_adjustmentPgResource, specFromArgs_InventoryAdjustment2(args));
          args.apply($delete);
          return object({
            result: $delete
          });
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      deleteInvoice: {
        plan(...planParams) {
          const smartPlan = (...overrideParams) => {
              const args = [...overrideParams.concat(planParams.slice(overrideParams.length))],
                $prev = oldPlan17.apply(this, args);
              if (!($prev instanceof ExecutableStep)) {
                console.error(`Wrapped a plan function at ${"Mutation"}.${"deleteInvoice"}, but that function did not return a step!
${String(oldPlan17)}`);
                throw Error("Wrapped a plan function, but that function did not return a step!");
              }
              args[1].autoApply($prev);
              return $prev;
            },
            [$source, fieldArgs, info] = planParams,
            $newPlan = planWrapper17(smartPlan, $source, fieldArgs, info);
          if ($newPlan === void 0) throw Error("Your plan wrapper didn't return anything; it must return a step or null!");
          if ($newPlan !== null && !isExecutableStep($newPlan)) throw Error(`Your plan wrapper returned something other than a step... It must return a step (or null). (Returned: ${inspect($newPlan)})`);
          return $newPlan;
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      deleteInvoiceById: {
        plan(_$root, args) {
          const $delete = pgDeleteSingle(resource_invoicePgResource, specFromArgs_Invoice2(args));
          args.apply($delete);
          return object({
            result: $delete
          });
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      deleteInvoiceLineItem: {
        plan(_$root, args) {
          const $delete = pgDeleteSingle(resource_invoice_line_itemPgResource, {
            id: args.getRaw(['input', "rowId"])
          });
          args.apply($delete);
          return object({
            result: $delete
          });
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      deleteInvoiceLineItemById: {
        plan(_$root, args) {
          const $delete = pgDeleteSingle(resource_invoice_line_itemPgResource, specFromArgs_InvoiceLineItem2(args));
          args.apply($delete);
          return object({
            result: $delete
          });
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      deleteOrganizationSetting: {
        plan(_$root, args) {
          const $delete = pgDeleteSingle(resource_organization_settingsPgResource, {
            id: args.getRaw(['input', "rowId"])
          });
          args.apply($delete);
          return object({
            result: $delete
          });
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      deleteOrganizationSettingById: {
        plan(_$root, args) {
          const $delete = pgDeleteSingle(resource_organization_settingsPgResource, specFromArgs_OrganizationSetting2(args));
          args.apply($delete);
          return object({
            result: $delete
          });
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      deletePerson: {
        plan(...planParams) {
          const smartPlan = (...overrideParams) => {
              const args = [...overrideParams.concat(planParams.slice(overrideParams.length))],
                $prev = oldPlan15.apply(this, args);
              if (!($prev instanceof ExecutableStep)) {
                console.error(`Wrapped a plan function at ${"Mutation"}.${"deletePerson"}, but that function did not return a step!
${String(oldPlan15)}`);
                throw Error("Wrapped a plan function, but that function did not return a step!");
              }
              args[1].autoApply($prev);
              return $prev;
            },
            [$source, fieldArgs, info] = planParams,
            $newPlan = planWrapper15(smartPlan, $source, fieldArgs, info);
          if ($newPlan === void 0) throw Error("Your plan wrapper didn't return anything; it must return a step or null!");
          if ($newPlan !== null && !isExecutableStep($newPlan)) throw Error(`Your plan wrapper returned something other than a step... It must return a step (or null). (Returned: ${inspect($newPlan)})`);
          return $newPlan;
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      deletePersonById: {
        plan(_$root, args) {
          const $delete = pgDeleteSingle(resource_personPgResource, specFromArgs_Person2(args));
          args.apply($delete);
          return object({
            result: $delete
          });
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      deleteProduct: {
        plan(...planParams) {
          const smartPlan = (...overrideParams) => {
              const args = [...overrideParams.concat(planParams.slice(overrideParams.length))],
                $prev = oldPlan13.apply(this, args);
              if (!($prev instanceof ExecutableStep)) {
                console.error(`Wrapped a plan function at ${"Mutation"}.${"deleteProduct"}, but that function did not return a step!
${String(oldPlan13)}`);
                throw Error("Wrapped a plan function, but that function did not return a step!");
              }
              args[1].autoApply($prev);
              return $prev;
            },
            [$source, fieldArgs, info] = planParams,
            $newPlan = planWrapper13(smartPlan, $source, fieldArgs, info);
          if ($newPlan === void 0) throw Error("Your plan wrapper didn't return anything; it must return a step or null!");
          if ($newPlan !== null && !isExecutableStep($newPlan)) throw Error(`Your plan wrapper returned something other than a step... It must return a step (or null). (Returned: ${inspect($newPlan)})`);
          return $newPlan;
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      deleteProductById: {
        plan(_$root, args) {
          const $delete = pgDeleteSingle(resource_productPgResource, specFromArgs_Product2(args));
          args.apply($delete);
          return object({
            result: $delete
          });
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      deleteQuote: {
        plan(...planParams) {
          const smartPlan = (...overrideParams) => {
              const args = [...overrideParams.concat(planParams.slice(overrideParams.length))],
                $prev = oldPlan18.apply(this, args);
              if (!($prev instanceof ExecutableStep)) {
                console.error(`Wrapped a plan function at ${"Mutation"}.${"deleteQuote"}, but that function did not return a step!
${String(oldPlan18)}`);
                throw Error("Wrapped a plan function, but that function did not return a step!");
              }
              args[1].autoApply($prev);
              return $prev;
            },
            [$source, fieldArgs, info] = planParams,
            $newPlan = planWrapper18(smartPlan, $source, fieldArgs, info);
          if ($newPlan === void 0) throw Error("Your plan wrapper didn't return anything; it must return a step or null!");
          if ($newPlan !== null && !isExecutableStep($newPlan)) throw Error(`Your plan wrapper returned something other than a step... It must return a step (or null). (Returned: ${inspect($newPlan)})`);
          return $newPlan;
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      deleteQuoteById: {
        plan(_$root, args) {
          const $delete = pgDeleteSingle(resource_quotePgResource, specFromArgs_Quote2(args));
          args.apply($delete);
          return object({
            result: $delete
          });
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      deleteQuoteLineItem: {
        plan(_$root, args) {
          const $delete = pgDeleteSingle(resource_quote_line_itemPgResource, {
            id: args.getRaw(['input', "rowId"])
          });
          args.apply($delete);
          return object({
            result: $delete
          });
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      deleteQuoteLineItemById: {
        plan(_$root, args) {
          const $delete = pgDeleteSingle(resource_quote_line_itemPgResource, specFromArgs_QuoteLineItem2(args));
          args.apply($delete);
          return object({
            result: $delete
          });
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      generateDocumentNumber: {
        async resolve(_parent, args) {
          const {
              sql
            } = await import("drizzle-orm"),
            {
              dbPool
            } = await import("lib/db/db"),
            {
              documentNumberingConfigTable
            } = await import("lib/db/schema"),
            {
              organizationId,
              documentType,
              idStrategy
            } = args.input;
          return {
            documentNumber: await dbPool.transaction(async tx => {
              await tx.insert(documentNumberingConfigTable).values({
                organizationId,
                documentType,
                prefix: defaultPrefix(documentType),
                separator: "-",
                idStrategy: "sequential",
                sequentialPadding: 4,
                randomLength: 8,
                nextSequentialNumber: 1
              }).onConflictDoNothing({
                target: [documentNumberingConfigTable.organizationId, documentNumberingConfigTable.documentType]
              });
              const config = (await tx.execute(sql`SELECT * FROM document_numbering_config WHERE organization_id = ${organizationId} AND document_type = ${documentType} FOR UPDATE`)).rows[0],
                datePart = buildDatePart(config.date_format);
              let idPart;
              if ((idStrategy ?? config.id_strategy) === "sequential") {
                const seqNum = config.next_sequential_number;
                await tx.update(documentNumberingConfigTable).set({
                  nextSequentialNumber: sql`${documentNumberingConfigTable.nextSequentialNumber} + 1`,
                  updatedAt: sql`NOW()`
                }).where(sql`id = ${config.id}`);
                idPart = String(seqNum).padStart(config.sequential_padding, "0");
              } else idPart = generateRandomHex(config.random_length);
              return assembleNumber(config.prefix, config.separator, datePart, idPart);
            })
          };
        },
        subscribe: undefined
      },
      updateCompany: {
        plan(...planParams) {
          const smartPlan = (...overrideParams) => {
              const args = [...overrideParams.concat(planParams.slice(overrideParams.length))],
                $prev = oldPlan10.apply(this, args);
              if (!($prev instanceof ExecutableStep)) {
                console.error(`Wrapped a plan function at ${"Mutation"}.${"updateCompany"}, but that function did not return a step!
${String(oldPlan10)}`);
                throw Error("Wrapped a plan function, but that function did not return a step!");
              }
              args[1].autoApply($prev);
              return $prev;
            },
            [$source, fieldArgs, info] = planParams,
            $newPlan = planWrapper10(smartPlan, $source, fieldArgs, info);
          if ($newPlan === void 0) throw Error("Your plan wrapper didn't return anything; it must return a step or null!");
          if ($newPlan !== null && !isExecutableStep($newPlan)) throw Error(`Your plan wrapper returned something other than a step... It must return a step (or null). (Returned: ${inspect($newPlan)})`);
          return $newPlan;
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      updateCompanyById: {
        plan(_$root, args) {
          const $update = pgUpdateSingle(resource_companyPgResource, specFromArgs_Company(args));
          args.apply($update);
          return object({
            result: $update
          });
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      updateCompanyMember: {
        plan(_$root, args) {
          const $update = pgUpdateSingle(resource_company_memberPgResource, {
            id: args.getRaw(['input', "rowId"])
          });
          args.apply($update);
          return object({
            result: $update
          });
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      updateCompanyMemberById: {
        plan(_$root, args) {
          const $update = pgUpdateSingle(resource_company_memberPgResource, specFromArgs_CompanyMember(args));
          args.apply($update);
          return object({
            result: $update
          });
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      updateDocumentNumberingConfig: {
        plan(...planParams) {
          const smartPlan = (...overrideParams) => {
              const args = [...overrideParams.concat(planParams.slice(overrideParams.length))],
                $prev = oldPlan8.apply(this, args);
              if (!($prev instanceof ExecutableStep)) {
                console.error(`Wrapped a plan function at ${"Mutation"}.${"updateDocumentNumberingConfig"}, but that function did not return a step!
${String(oldPlan8)}`);
                throw Error("Wrapped a plan function, but that function did not return a step!");
              }
              args[1].autoApply($prev);
              return $prev;
            },
            [$source, fieldArgs, info] = planParams,
            $newPlan = planWrapper8(smartPlan, $source, fieldArgs, info);
          if ($newPlan === void 0) throw Error("Your plan wrapper didn't return anything; it must return a step or null!");
          if ($newPlan !== null && !isExecutableStep($newPlan)) throw Error(`Your plan wrapper returned something other than a step... It must return a step (or null). (Returned: ${inspect($newPlan)})`);
          return $newPlan;
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      updateDocumentNumberingConfigById: {
        plan(_$root, args) {
          const $update = pgUpdateSingle(resource_document_numbering_configPgResource, specFromArgs_DocumentNumberingConfig(args));
          args.apply($update);
          return object({
            result: $update
          });
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      updateInventoryAdjustment: {
        plan(_$root, args) {
          const $update = pgUpdateSingle(resource_inventory_adjustmentPgResource, {
            id: args.getRaw(['input', "rowId"])
          });
          args.apply($update);
          return object({
            result: $update
          });
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      updateInventoryAdjustmentById: {
        plan(_$root, args) {
          const $update = pgUpdateSingle(resource_inventory_adjustmentPgResource, specFromArgs_InventoryAdjustment(args));
          args.apply($update);
          return object({
            result: $update
          });
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      updateInvoice: {
        plan(...planParams) {
          const smartPlan = (...overrideParams) => {
              const args = [...overrideParams.concat(planParams.slice(overrideParams.length))],
                $prev = oldPlan11.apply(this, args);
              if (!($prev instanceof ExecutableStep)) {
                console.error(`Wrapped a plan function at ${"Mutation"}.${"updateInvoice"}, but that function did not return a step!
${String(oldPlan11)}`);
                throw Error("Wrapped a plan function, but that function did not return a step!");
              }
              args[1].autoApply($prev);
              return $prev;
            },
            [$source, fieldArgs, info] = planParams,
            $newPlan = planWrapper11(smartPlan, $source, fieldArgs, info);
          if ($newPlan === void 0) throw Error("Your plan wrapper didn't return anything; it must return a step or null!");
          if ($newPlan !== null && !isExecutableStep($newPlan)) throw Error(`Your plan wrapper returned something other than a step... It must return a step (or null). (Returned: ${inspect($newPlan)})`);
          return $newPlan;
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      updateInvoiceById: {
        plan(_$root, args) {
          const $update = pgUpdateSingle(resource_invoicePgResource, specFromArgs_Invoice(args));
          args.apply($update);
          return object({
            result: $update
          });
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      updateInvoiceLineItem: {
        plan(_$root, args) {
          const $update = pgUpdateSingle(resource_invoice_line_itemPgResource, {
            id: args.getRaw(['input', "rowId"])
          });
          args.apply($update);
          return object({
            result: $update
          });
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      updateInvoiceLineItemById: {
        plan(_$root, args) {
          const $update = pgUpdateSingle(resource_invoice_line_itemPgResource, specFromArgs_InvoiceLineItem(args));
          args.apply($update);
          return object({
            result: $update
          });
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      updateOrganizationSetting: {
        plan(_$root, args) {
          const $update = pgUpdateSingle(resource_organization_settingsPgResource, {
            id: args.getRaw(['input', "rowId"])
          });
          args.apply($update);
          return object({
            result: $update
          });
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      updateOrganizationSettingById: {
        plan(_$root, args) {
          const $update = pgUpdateSingle(resource_organization_settingsPgResource, specFromArgs_OrganizationSetting(args));
          args.apply($update);
          return object({
            result: $update
          });
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      updatePerson: {
        plan(...planParams) {
          const smartPlan = (...overrideParams) => {
              const args = [...overrideParams.concat(planParams.slice(overrideParams.length))],
                $prev = oldPlan9.apply(this, args);
              if (!($prev instanceof ExecutableStep)) {
                console.error(`Wrapped a plan function at ${"Mutation"}.${"updatePerson"}, but that function did not return a step!
${String(oldPlan9)}`);
                throw Error("Wrapped a plan function, but that function did not return a step!");
              }
              args[1].autoApply($prev);
              return $prev;
            },
            [$source, fieldArgs, info] = planParams,
            $newPlan = planWrapper9(smartPlan, $source, fieldArgs, info);
          if ($newPlan === void 0) throw Error("Your plan wrapper didn't return anything; it must return a step or null!");
          if ($newPlan !== null && !isExecutableStep($newPlan)) throw Error(`Your plan wrapper returned something other than a step... It must return a step (or null). (Returned: ${inspect($newPlan)})`);
          return $newPlan;
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      updatePersonById: {
        plan(_$root, args) {
          const $update = pgUpdateSingle(resource_personPgResource, specFromArgs_Person(args));
          args.apply($update);
          return object({
            result: $update
          });
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      updateProduct: {
        plan(...planParams) {
          const smartPlan = (...overrideParams) => {
              const args = [...overrideParams.concat(planParams.slice(overrideParams.length))],
                $prev = oldPlan7.apply(this, args);
              if (!($prev instanceof ExecutableStep)) {
                console.error(`Wrapped a plan function at ${"Mutation"}.${"updateProduct"}, but that function did not return a step!
${String(oldPlan7)}`);
                throw Error("Wrapped a plan function, but that function did not return a step!");
              }
              args[1].autoApply($prev);
              return $prev;
            },
            [$source, fieldArgs, info] = planParams,
            $newPlan = planWrapper7(smartPlan, $source, fieldArgs, info);
          if ($newPlan === void 0) throw Error("Your plan wrapper didn't return anything; it must return a step or null!");
          if ($newPlan !== null && !isExecutableStep($newPlan)) throw Error(`Your plan wrapper returned something other than a step... It must return a step (or null). (Returned: ${inspect($newPlan)})`);
          return $newPlan;
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      updateProductById: {
        plan(_$root, args) {
          const $update = pgUpdateSingle(resource_productPgResource, specFromArgs_Product(args));
          args.apply($update);
          return object({
            result: $update
          });
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      updateQuote: {
        plan(...planParams) {
          const smartPlan = (...overrideParams) => {
              const args = [...overrideParams.concat(planParams.slice(overrideParams.length))],
                $prev = oldPlan12.apply(this, args);
              if (!($prev instanceof ExecutableStep)) {
                console.error(`Wrapped a plan function at ${"Mutation"}.${"updateQuote"}, but that function did not return a step!
${String(oldPlan12)}`);
                throw Error("Wrapped a plan function, but that function did not return a step!");
              }
              args[1].autoApply($prev);
              return $prev;
            },
            [$source, fieldArgs, info] = planParams,
            $newPlan = planWrapper12(smartPlan, $source, fieldArgs, info);
          if ($newPlan === void 0) throw Error("Your plan wrapper didn't return anything; it must return a step or null!");
          if ($newPlan !== null && !isExecutableStep($newPlan)) throw Error(`Your plan wrapper returned something other than a step... It must return a step (or null). (Returned: ${inspect($newPlan)})`);
          return $newPlan;
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      updateQuoteById: {
        plan(_$root, args) {
          const $update = pgUpdateSingle(resource_quotePgResource, specFromArgs_Quote(args));
          args.apply($update);
          return object({
            result: $update
          });
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      updateQuoteLineItem: {
        plan(_$root, args) {
          const $update = pgUpdateSingle(resource_quote_line_itemPgResource, {
            id: args.getRaw(['input', "rowId"])
          });
          args.apply($update);
          return object({
            result: $update
          });
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      },
      updateQuoteLineItemById: {
        plan(_$root, args) {
          const $update = pgUpdateSingle(resource_quote_line_itemPgResource, specFromArgs_QuoteLineItem(args));
          args.apply($update);
          return object({
            result: $update
          });
        },
        args: {
          input(_, $object) {
            return $object;
          }
        }
      }
    }
  },
  Company: {
    assertStep: assertPgClassSingleStep,
    plans: {
      addressLine1($record) {
        return $record.get("address_line_1");
      },
      addressLine2($record) {
        return $record.get("address_line_2");
      },
      companyMembers: {
        plan($record) {
          const $records = resource_company_memberPgResource.find({
            company_id: $record.get("id")
          });
          return connection($records);
        },
        args: {
          first(_, $connection, arg) {
            $connection.setFirst(arg.getRaw());
          },
          last(_, $connection, val) {
            $connection.setLast(val.getRaw());
          },
          offset(_, $connection, val) {
            $connection.setOffset(val.getRaw());
          },
          before(_, $connection, val) {
            $connection.setBefore(val.getRaw());
          },
          after(_, $connection, val) {
            $connection.setAfter(val.getRaw());
          },
          condition(_condition, $connection, arg) {
            const $select = $connection.getSubplan();
            arg.apply($select, qbWhereBuilder);
          },
          filter(_, $connection, fieldArg) {
            const $pgSelect = $connection.getSubplan();
            fieldArg.apply($pgSelect, (queryBuilder, value) => {
              assertAllowed12(value, "object");
              if (value == null) return;
              const condition = new PgCondition(queryBuilder);
              return condition;
            });
          },
          orderBy(parent, $connection, value) {
            const $select = $connection.getSubplan();
            value.apply($select);
          }
        }
      },
      createdAt($record) {
        return $record.get("created_at");
      },
      id($parent) {
        const specifier = nodeIdHandler_Company.plan($parent);
        return lambda(specifier, nodeIdCodecs[nodeIdHandler_Company.codec.name].encode);
      },
      invoices: {
        plan($record) {
          const $records = resource_invoicePgResource.find({
            company_id: $record.get("id")
          });
          return connection($records);
        },
        args: {
          first(_, $connection, arg) {
            $connection.setFirst(arg.getRaw());
          },
          last(_, $connection, val) {
            $connection.setLast(val.getRaw());
          },
          offset(_, $connection, val) {
            $connection.setOffset(val.getRaw());
          },
          before(_, $connection, val) {
            $connection.setBefore(val.getRaw());
          },
          after(_, $connection, val) {
            $connection.setAfter(val.getRaw());
          },
          condition(_condition, $connection, arg) {
            const $select = $connection.getSubplan();
            arg.apply($select, qbWhereBuilder);
          },
          filter(_, $connection, fieldArg) {
            const $pgSelect = $connection.getSubplan();
            fieldArg.apply($pgSelect, (queryBuilder, value) => {
              assertAllowed13(value, "object");
              if (value == null) return;
              const condition = new PgCondition(queryBuilder);
              return condition;
            });
          },
          orderBy(parent, $connection, value) {
            const $select = $connection.getSubplan();
            value.apply($select);
          }
        }
      },
      organizationId($record) {
        return $record.get("organization_id");
      },
      postalCode($record) {
        return $record.get("postal_code");
      },
      quotes: {
        plan($record) {
          const $records = resource_quotePgResource.find({
            company_id: $record.get("id")
          });
          return connection($records);
        },
        args: {
          first(_, $connection, arg) {
            $connection.setFirst(arg.getRaw());
          },
          last(_, $connection, val) {
            $connection.setLast(val.getRaw());
          },
          offset(_, $connection, val) {
            $connection.setOffset(val.getRaw());
          },
          before(_, $connection, val) {
            $connection.setBefore(val.getRaw());
          },
          after(_, $connection, val) {
            $connection.setAfter(val.getRaw());
          },
          condition(_condition, $connection, arg) {
            const $select = $connection.getSubplan();
            arg.apply($select, qbWhereBuilder);
          },
          filter(_, $connection, fieldArg) {
            const $pgSelect = $connection.getSubplan();
            fieldArg.apply($pgSelect, (queryBuilder, value) => {
              assertAllowed14(value, "object");
              if (value == null) return;
              const condition = new PgCondition(queryBuilder);
              return condition;
            });
          },
          orderBy(parent, $connection, value) {
            const $select = $connection.getSubplan();
            value.apply($select);
          }
        }
      },
      rowId($record) {
        return $record.get("id");
      },
      updatedAt($record) {
        return $record.get("updated_at");
      }
    },
    planType($specifier) {
      const spec = Object.create(null);
      for (const pkCol of companyUniques[0].attributes) spec[pkCol] = get2($specifier, pkCol);
      return resource_companyPgResource.get(spec);
    }
  },
  CompanyConnection: {
    assertStep: ConnectionStep,
    plans: {
      totalCount($connection) {
        return $connection.cloneSubplanWithoutPagination("aggregate").singleAsRecord().select(sql`count(*)`, TYPES.bigint, !1);
      }
    }
  },
  CompanyMember: {
    assertStep: assertPgClassSingleStep,
    plans: {
      company($record) {
        return resource_companyPgResource.get({
          id: $record.get("company_id")
        });
      },
      companyId($record) {
        return $record.get("company_id");
      },
      createdAt($record) {
        return $record.get("created_at");
      },
      id($parent) {
        const specifier = nodeIdHandler_CompanyMember.plan($parent);
        return lambda(specifier, nodeIdCodecs[nodeIdHandler_CompanyMember.codec.name].encode);
      },
      isPrimary($record) {
        return $record.get("is_primary");
      },
      person($record) {
        return resource_personPgResource.get({
          id: $record.get("person_id")
        });
      },
      personId($record) {
        return $record.get("person_id");
      },
      rowId($record) {
        return $record.get("id");
      }
    },
    planType($specifier) {
      const spec = Object.create(null);
      for (const pkCol of company_memberUniques[0].attributes) spec[pkCol] = get2($specifier, pkCol);
      return resource_company_memberPgResource.get(spec);
    }
  },
  CompanyMemberConnection: {
    assertStep: ConnectionStep,
    plans: {
      totalCount($connection) {
        return $connection.cloneSubplanWithoutPagination("aggregate").singleAsRecord().select(sql`count(*)`, TYPES.bigint, !1);
      }
    }
  },
  CreateCompanyMemberPayload: {
    assertStep: assertExecutableStep,
    plans: {
      clientMutationId($mutation) {
        return $mutation.getStepForKey("result").getMeta("clientMutationId");
      },
      companyMember($object) {
        return $object.get("result");
      },
      companyMemberEdge($mutation, fieldArgs) {
        return pgMutationPayloadEdge(resource_company_memberPgResource, company_memberUniques[0].attributes, $mutation, fieldArgs);
      },
      query() {
        return rootValue();
      }
    }
  },
  CreateCompanyPayload: {
    assertStep: assertExecutableStep,
    plans: {
      clientMutationId($mutation) {
        return $mutation.getStepForKey("result").getMeta("clientMutationId");
      },
      company($object) {
        return $object.get("result");
      },
      companyEdge($mutation, fieldArgs) {
        return pgMutationPayloadEdge(resource_companyPgResource, companyUniques[0].attributes, $mutation, fieldArgs);
      },
      query() {
        return rootValue();
      }
    }
  },
  CreateDocumentNumberingConfigPayload: {
    assertStep: assertExecutableStep,
    plans: {
      clientMutationId($mutation) {
        return $mutation.getStepForKey("result").getMeta("clientMutationId");
      },
      documentNumberingConfig($object) {
        return $object.get("result");
      },
      documentNumberingConfigEdge($mutation, fieldArgs) {
        return pgMutationPayloadEdge(resource_document_numbering_configPgResource, document_numbering_configUniques[0].attributes, $mutation, fieldArgs);
      },
      query() {
        return rootValue();
      }
    }
  },
  CreateInventoryAdjustmentPayload: {
    assertStep: assertExecutableStep,
    plans: {
      clientMutationId($mutation) {
        return $mutation.getStepForKey("result").getMeta("clientMutationId");
      },
      inventoryAdjustment($object) {
        return $object.get("result");
      },
      inventoryAdjustmentEdge($mutation, fieldArgs) {
        return pgMutationPayloadEdge(resource_inventory_adjustmentPgResource, inventory_adjustmentUniques[0].attributes, $mutation, fieldArgs);
      },
      query() {
        return rootValue();
      }
    }
  },
  CreateInvoiceLineItemPayload: {
    assertStep: assertExecutableStep,
    plans: {
      clientMutationId($mutation) {
        return $mutation.getStepForKey("result").getMeta("clientMutationId");
      },
      invoiceLineItem($object) {
        return $object.get("result");
      },
      invoiceLineItemEdge($mutation, fieldArgs) {
        return pgMutationPayloadEdge(resource_invoice_line_itemPgResource, invoice_line_itemUniques[0].attributes, $mutation, fieldArgs);
      },
      query() {
        return rootValue();
      }
    }
  },
  CreateInvoicePayload: {
    assertStep: assertExecutableStep,
    plans: {
      clientMutationId($mutation) {
        return $mutation.getStepForKey("result").getMeta("clientMutationId");
      },
      invoice($object) {
        return $object.get("result");
      },
      invoiceEdge($mutation, fieldArgs) {
        return pgMutationPayloadEdge(resource_invoicePgResource, invoiceUniques[0].attributes, $mutation, fieldArgs);
      },
      query() {
        return rootValue();
      }
    }
  },
  CreateOrganizationSettingPayload: {
    assertStep: assertExecutableStep,
    plans: {
      clientMutationId($mutation) {
        return $mutation.getStepForKey("result").getMeta("clientMutationId");
      },
      organizationSetting($object) {
        return $object.get("result");
      },
      organizationSettingEdge($mutation, fieldArgs) {
        return pgMutationPayloadEdge(resource_organization_settingsPgResource, organization_settingsUniques[0].attributes, $mutation, fieldArgs);
      },
      query() {
        return rootValue();
      }
    }
  },
  CreatePersonPayload: {
    assertStep: assertExecutableStep,
    plans: {
      clientMutationId($mutation) {
        return $mutation.getStepForKey("result").getMeta("clientMutationId");
      },
      person($object) {
        return $object.get("result");
      },
      personEdge($mutation, fieldArgs) {
        return pgMutationPayloadEdge(resource_personPgResource, personUniques[0].attributes, $mutation, fieldArgs);
      },
      query() {
        return rootValue();
      }
    }
  },
  CreateProductPayload: {
    assertStep: assertExecutableStep,
    plans: {
      clientMutationId($mutation) {
        return $mutation.getStepForKey("result").getMeta("clientMutationId");
      },
      product($object) {
        return $object.get("result");
      },
      productEdge($mutation, fieldArgs) {
        return pgMutationPayloadEdge(resource_productPgResource, productUniques[0].attributes, $mutation, fieldArgs);
      },
      query() {
        return rootValue();
      }
    }
  },
  CreateQuoteLineItemPayload: {
    assertStep: assertExecutableStep,
    plans: {
      clientMutationId($mutation) {
        return $mutation.getStepForKey("result").getMeta("clientMutationId");
      },
      query() {
        return rootValue();
      },
      quoteLineItem($object) {
        return $object.get("result");
      },
      quoteLineItemEdge($mutation, fieldArgs) {
        return pgMutationPayloadEdge(resource_quote_line_itemPgResource, quote_line_itemUniques[0].attributes, $mutation, fieldArgs);
      }
    }
  },
  CreateQuotePayload: {
    assertStep: assertExecutableStep,
    plans: {
      clientMutationId($mutation) {
        return $mutation.getStepForKey("result").getMeta("clientMutationId");
      },
      query() {
        return rootValue();
      },
      quote($object) {
        return $object.get("result");
      },
      quoteEdge($mutation, fieldArgs) {
        return pgMutationPayloadEdge(resource_quotePgResource, quoteUniques[0].attributes, $mutation, fieldArgs);
      }
    }
  },
  DeleteCompanyMemberPayload: {
    assertStep: ObjectStep,
    plans: {
      clientMutationId($mutation) {
        return $mutation.getStepForKey("result").getMeta("clientMutationId");
      },
      companyMember($object) {
        return $object.get("result");
      },
      companyMemberEdge($mutation, fieldArgs) {
        return pgMutationPayloadEdge(resource_company_memberPgResource, company_memberUniques[0].attributes, $mutation, fieldArgs);
      },
      deletedCompanyMemberId($object) {
        const $record = $object.getStepForKey("result"),
          specifier = nodeIdHandler_CompanyMember.plan($record);
        return lambda(specifier, nodeIdCodecs_base64JSON_base64JSON.encode);
      },
      query() {
        return rootValue();
      }
    }
  },
  DeleteCompanyPayload: {
    assertStep: ObjectStep,
    plans: {
      clientMutationId($mutation) {
        return $mutation.getStepForKey("result").getMeta("clientMutationId");
      },
      company($object) {
        return $object.get("result");
      },
      companyEdge($mutation, fieldArgs) {
        return pgMutationPayloadEdge(resource_companyPgResource, companyUniques[0].attributes, $mutation, fieldArgs);
      },
      deletedCompanyId($object) {
        const $record = $object.getStepForKey("result"),
          specifier = nodeIdHandler_Company.plan($record);
        return lambda(specifier, nodeIdCodecs_base64JSON_base64JSON.encode);
      },
      query() {
        return rootValue();
      }
    }
  },
  DeleteDocumentNumberingConfigPayload: {
    assertStep: ObjectStep,
    plans: {
      clientMutationId($mutation) {
        return $mutation.getStepForKey("result").getMeta("clientMutationId");
      },
      deletedDocumentNumberingConfigId($object) {
        const $record = $object.getStepForKey("result"),
          specifier = nodeIdHandler_DocumentNumberingConfig.plan($record);
        return lambda(specifier, nodeIdCodecs_base64JSON_base64JSON.encode);
      },
      documentNumberingConfig($object) {
        return $object.get("result");
      },
      documentNumberingConfigEdge($mutation, fieldArgs) {
        return pgMutationPayloadEdge(resource_document_numbering_configPgResource, document_numbering_configUniques[0].attributes, $mutation, fieldArgs);
      },
      query() {
        return rootValue();
      }
    }
  },
  DeleteInventoryAdjustmentPayload: {
    assertStep: ObjectStep,
    plans: {
      clientMutationId($mutation) {
        return $mutation.getStepForKey("result").getMeta("clientMutationId");
      },
      deletedInventoryAdjustmentId($object) {
        const $record = $object.getStepForKey("result"),
          specifier = nodeIdHandler_InventoryAdjustment.plan($record);
        return lambda(specifier, nodeIdCodecs_base64JSON_base64JSON.encode);
      },
      inventoryAdjustment($object) {
        return $object.get("result");
      },
      inventoryAdjustmentEdge($mutation, fieldArgs) {
        return pgMutationPayloadEdge(resource_inventory_adjustmentPgResource, inventory_adjustmentUniques[0].attributes, $mutation, fieldArgs);
      },
      query() {
        return rootValue();
      }
    }
  },
  DeleteInvoiceLineItemPayload: {
    assertStep: ObjectStep,
    plans: {
      clientMutationId($mutation) {
        return $mutation.getStepForKey("result").getMeta("clientMutationId");
      },
      deletedInvoiceLineItemId($object) {
        const $record = $object.getStepForKey("result"),
          specifier = nodeIdHandler_InvoiceLineItem.plan($record);
        return lambda(specifier, nodeIdCodecs_base64JSON_base64JSON.encode);
      },
      invoiceLineItem($object) {
        return $object.get("result");
      },
      invoiceLineItemEdge($mutation, fieldArgs) {
        return pgMutationPayloadEdge(resource_invoice_line_itemPgResource, invoice_line_itemUniques[0].attributes, $mutation, fieldArgs);
      },
      query() {
        return rootValue();
      }
    }
  },
  DeleteInvoicePayload: {
    assertStep: ObjectStep,
    plans: {
      clientMutationId($mutation) {
        return $mutation.getStepForKey("result").getMeta("clientMutationId");
      },
      deletedInvoiceId($object) {
        const $record = $object.getStepForKey("result"),
          specifier = nodeIdHandler_Invoice.plan($record);
        return lambda(specifier, nodeIdCodecs_base64JSON_base64JSON.encode);
      },
      invoice($object) {
        return $object.get("result");
      },
      invoiceEdge($mutation, fieldArgs) {
        return pgMutationPayloadEdge(resource_invoicePgResource, invoiceUniques[0].attributes, $mutation, fieldArgs);
      },
      query() {
        return rootValue();
      }
    }
  },
  DeleteOrganizationSettingPayload: {
    assertStep: ObjectStep,
    plans: {
      clientMutationId($mutation) {
        return $mutation.getStepForKey("result").getMeta("clientMutationId");
      },
      deletedOrganizationSettingId($object) {
        const $record = $object.getStepForKey("result"),
          specifier = nodeIdHandler_OrganizationSetting.plan($record);
        return lambda(specifier, nodeIdCodecs_base64JSON_base64JSON.encode);
      },
      organizationSetting($object) {
        return $object.get("result");
      },
      organizationSettingEdge($mutation, fieldArgs) {
        return pgMutationPayloadEdge(resource_organization_settingsPgResource, organization_settingsUniques[0].attributes, $mutation, fieldArgs);
      },
      query() {
        return rootValue();
      }
    }
  },
  DeletePersonPayload: {
    assertStep: ObjectStep,
    plans: {
      clientMutationId($mutation) {
        return $mutation.getStepForKey("result").getMeta("clientMutationId");
      },
      deletedPersonId($object) {
        const $record = $object.getStepForKey("result"),
          specifier = nodeIdHandler_Person.plan($record);
        return lambda(specifier, nodeIdCodecs_base64JSON_base64JSON.encode);
      },
      person($object) {
        return $object.get("result");
      },
      personEdge($mutation, fieldArgs) {
        return pgMutationPayloadEdge(resource_personPgResource, personUniques[0].attributes, $mutation, fieldArgs);
      },
      query() {
        return rootValue();
      }
    }
  },
  DeleteProductPayload: {
    assertStep: ObjectStep,
    plans: {
      clientMutationId($mutation) {
        return $mutation.getStepForKey("result").getMeta("clientMutationId");
      },
      deletedProductId($object) {
        const $record = $object.getStepForKey("result"),
          specifier = nodeIdHandler_Product.plan($record);
        return lambda(specifier, nodeIdCodecs_base64JSON_base64JSON.encode);
      },
      product($object) {
        return $object.get("result");
      },
      productEdge($mutation, fieldArgs) {
        return pgMutationPayloadEdge(resource_productPgResource, productUniques[0].attributes, $mutation, fieldArgs);
      },
      query() {
        return rootValue();
      }
    }
  },
  DeleteQuoteLineItemPayload: {
    assertStep: ObjectStep,
    plans: {
      clientMutationId($mutation) {
        return $mutation.getStepForKey("result").getMeta("clientMutationId");
      },
      deletedQuoteLineItemId($object) {
        const $record = $object.getStepForKey("result"),
          specifier = nodeIdHandler_QuoteLineItem.plan($record);
        return lambda(specifier, nodeIdCodecs_base64JSON_base64JSON.encode);
      },
      query() {
        return rootValue();
      },
      quoteLineItem($object) {
        return $object.get("result");
      },
      quoteLineItemEdge($mutation, fieldArgs) {
        return pgMutationPayloadEdge(resource_quote_line_itemPgResource, quote_line_itemUniques[0].attributes, $mutation, fieldArgs);
      }
    }
  },
  DeleteQuotePayload: {
    assertStep: ObjectStep,
    plans: {
      clientMutationId($mutation) {
        return $mutation.getStepForKey("result").getMeta("clientMutationId");
      },
      deletedQuoteId($object) {
        const $record = $object.getStepForKey("result"),
          specifier = nodeIdHandler_Quote.plan($record);
        return lambda(specifier, nodeIdCodecs_base64JSON_base64JSON.encode);
      },
      query() {
        return rootValue();
      },
      quote($object) {
        return $object.get("result");
      },
      quoteEdge($mutation, fieldArgs) {
        return pgMutationPayloadEdge(resource_quotePgResource, quoteUniques[0].attributes, $mutation, fieldArgs);
      }
    }
  },
  DocumentNumberingConfig: {
    assertStep: assertPgClassSingleStep,
    plans: {
      createdAt($record) {
        return $record.get("created_at");
      },
      dateFormat($record) {
        return $record.get("date_format");
      },
      documentType($record) {
        return $record.get("document_type");
      },
      id($parent) {
        const specifier = nodeIdHandler_DocumentNumberingConfig.plan($parent);
        return lambda(specifier, nodeIdCodecs[nodeIdHandler_DocumentNumberingConfig.codec.name].encode);
      },
      idStrategy($record) {
        return $record.get("id_strategy");
      },
      nextSequentialNumber($record) {
        return $record.get("next_sequential_number");
      },
      organizationId($record) {
        return $record.get("organization_id");
      },
      randomLength($record) {
        return $record.get("random_length");
      },
      rowId($record) {
        return $record.get("id");
      },
      sequentialPadding($record) {
        return $record.get("sequential_padding");
      },
      updatedAt($record) {
        return $record.get("updated_at");
      }
    },
    planType($specifier) {
      const spec = Object.create(null);
      for (const pkCol of document_numbering_configUniques[0].attributes) spec[pkCol] = get2($specifier, pkCol);
      return resource_document_numbering_configPgResource.get(spec);
    }
  },
  DocumentNumberingConfigConnection: {
    assertStep: ConnectionStep,
    plans: {
      totalCount($connection) {
        return $connection.cloneSubplanWithoutPagination("aggregate").singleAsRecord().select(sql`count(*)`, TYPES.bigint, !1);
      }
    }
  },
  InventoryAdjustment: {
    assertStep: assertPgClassSingleStep,
    plans: {
      createdAt($record) {
        return $record.get("created_at");
      },
      id($parent) {
        const specifier = nodeIdHandler_InventoryAdjustment.plan($parent);
        return lambda(specifier, nodeIdCodecs[nodeIdHandler_InventoryAdjustment.codec.name].encode);
      },
      product($record) {
        return resource_productPgResource.get({
          id: $record.get("product_id")
        });
      },
      productId($record) {
        return $record.get("product_id");
      },
      quantityChange($record) {
        return $record.get("quantity_change");
      },
      referenceId($record) {
        return $record.get("reference_id");
      },
      rowId($record) {
        return $record.get("id");
      }
    },
    planType($specifier) {
      const spec = Object.create(null);
      for (const pkCol of inventory_adjustmentUniques[0].attributes) spec[pkCol] = get2($specifier, pkCol);
      return resource_inventory_adjustmentPgResource.get(spec);
    }
  },
  InventoryAdjustmentConnection: {
    assertStep: ConnectionStep,
    plans: {
      totalCount($connection) {
        return $connection.cloneSubplanWithoutPagination("aggregate").singleAsRecord().select(sql`count(*)`, TYPES.bigint, !1);
      }
    }
  },
  Invoice: {
    assertStep: assertPgClassSingleStep,
    plans: {
      billTo($record) {
        return $record.get("bill_to");
      },
      company($record) {
        return resource_companyPgResource.get({
          id: $record.get("company_id")
        });
      },
      companyId($record) {
        return $record.get("company_id");
      },
      contact($record) {
        return resource_personPgResource.get({
          id: $record.get("contact_id")
        });
      },
      contactId($record) {
        return $record.get("contact_id");
      },
      createdAt($record) {
        return $record.get("created_at");
      },
      dueDate($record) {
        return $record.get("due_date");
      },
      id($parent) {
        const specifier = nodeIdHandler_Invoice.plan($parent);
        return lambda(specifier, nodeIdCodecs[nodeIdHandler_Invoice.codec.name].encode);
      },
      invoiceLineItems: {
        plan($record) {
          const $records = resource_invoice_line_itemPgResource.find({
            invoice_id: $record.get("id")
          });
          return connection($records);
        },
        args: {
          first(_, $connection, arg) {
            $connection.setFirst(arg.getRaw());
          },
          last(_, $connection, val) {
            $connection.setLast(val.getRaw());
          },
          offset(_, $connection, val) {
            $connection.setOffset(val.getRaw());
          },
          before(_, $connection, val) {
            $connection.setBefore(val.getRaw());
          },
          after(_, $connection, val) {
            $connection.setAfter(val.getRaw());
          },
          condition(_condition, $connection, arg) {
            const $select = $connection.getSubplan();
            arg.apply($select, qbWhereBuilder);
          },
          filter(_, $connection, fieldArg) {
            const $pgSelect = $connection.getSubplan();
            fieldArg.apply($pgSelect, (queryBuilder, value) => {
              assertAllowed42(value, "object");
              if (value == null) return;
              const condition = new PgCondition(queryBuilder);
              return condition;
            });
          },
          orderBy(parent, $connection, value) {
            const $select = $connection.getSubplan();
            value.apply($select);
          }
        }
      },
      invoiceNumber($record) {
        return $record.get("invoice_number");
      },
      issueDate($record) {
        return $record.get("issue_date");
      },
      organizationId($record) {
        return $record.get("organization_id");
      },
      paidAt($record) {
        return $record.get("paid_at");
      },
      paymentLinkUrl($record) {
        return $record.get("payment_link_url");
      },
      paymentReference($record) {
        return $record.get("payment_reference");
      },
      rowId($record) {
        return $record.get("id");
      },
      taxAmount($record) {
        return $record.get("tax_amount");
      },
      taxRate($record) {
        return $record.get("tax_rate");
      },
      updatedAt($record) {
        return $record.get("updated_at");
      }
    },
    planType($specifier) {
      const spec = Object.create(null);
      for (const pkCol of invoiceUniques[0].attributes) spec[pkCol] = get2($specifier, pkCol);
      return resource_invoicePgResource.get(spec);
    }
  },
  InvoiceConnection: {
    assertStep: ConnectionStep,
    plans: {
      totalCount($connection) {
        return $connection.cloneSubplanWithoutPagination("aggregate").singleAsRecord().select(sql`count(*)`, TYPES.bigint, !1);
      }
    }
  },
  InvoiceLineItem: {
    assertStep: assertPgClassSingleStep,
    plans: {
      id($parent) {
        const specifier = nodeIdHandler_InvoiceLineItem.plan($parent);
        return lambda(specifier, nodeIdCodecs[nodeIdHandler_InvoiceLineItem.codec.name].encode);
      },
      invoice($record) {
        return resource_invoicePgResource.get({
          id: $record.get("invoice_id")
        });
      },
      invoiceId($record) {
        return $record.get("invoice_id");
      },
      product($record) {
        return resource_productPgResource.get({
          id: $record.get("product_id")
        });
      },
      productId($record) {
        return $record.get("product_id");
      },
      rowId($record) {
        return $record.get("id");
      },
      sortOrder($record) {
        return $record.get("sort_order");
      },
      unitPrice($record) {
        return $record.get("unit_price");
      }
    },
    planType($specifier) {
      const spec = Object.create(null);
      for (const pkCol of invoice_line_itemUniques[0].attributes) spec[pkCol] = get2($specifier, pkCol);
      return resource_invoice_line_itemPgResource.get(spec);
    }
  },
  InvoiceLineItemConnection: {
    assertStep: ConnectionStep,
    plans: {
      totalCount($connection) {
        return $connection.cloneSubplanWithoutPagination("aggregate").singleAsRecord().select(sql`count(*)`, TYPES.bigint, !1);
      }
    }
  },
  OrganizationSetting: {
    assertStep: assertPgClassSingleStep,
    plans: {
      accentColor($record) {
        return $record.get("accent_color");
      },
      createdAt($record) {
        return $record.get("created_at");
      },
      id($parent) {
        const specifier = nodeIdHandler_OrganizationSetting.plan($parent);
        return lambda(specifier, nodeIdCodecs[nodeIdHandler_OrganizationSetting.codec.name].encode);
      },
      organizationId($record) {
        return $record.get("organization_id");
      },
      rowId($record) {
        return $record.get("id");
      },
      updatedAt($record) {
        return $record.get("updated_at");
      }
    },
    planType($specifier) {
      const spec = Object.create(null);
      for (const pkCol of organization_settingsUniques[0].attributes) spec[pkCol] = get2($specifier, pkCol);
      return resource_organization_settingsPgResource.get(spec);
    }
  },
  OrganizationSettingConnection: {
    assertStep: ConnectionStep,
    plans: {
      totalCount($connection) {
        return $connection.cloneSubplanWithoutPagination("aggregate").singleAsRecord().select(sql`count(*)`, TYPES.bigint, !1);
      }
    }
  },
  Person: {
    assertStep: assertPgClassSingleStep,
    plans: {
      avatarUrl($record) {
        return $record.get("avatar_url");
      },
      companyMembers: {
        plan($record) {
          const $records = resource_company_memberPgResource.find({
            person_id: $record.get("id")
          });
          return connection($records);
        },
        args: {
          first(_, $connection, arg) {
            $connection.setFirst(arg.getRaw());
          },
          last(_, $connection, val) {
            $connection.setLast(val.getRaw());
          },
          offset(_, $connection, val) {
            $connection.setOffset(val.getRaw());
          },
          before(_, $connection, val) {
            $connection.setBefore(val.getRaw());
          },
          after(_, $connection, val) {
            $connection.setAfter(val.getRaw());
          },
          condition(_condition, $connection, arg) {
            const $select = $connection.getSubplan();
            arg.apply($select, qbWhereBuilder);
          },
          filter(_, $connection, fieldArg) {
            const $pgSelect = $connection.getSubplan();
            fieldArg.apply($pgSelect, (queryBuilder, value) => {
              assertAllowed43(value, "object");
              if (value == null) return;
              const condition = new PgCondition(queryBuilder);
              return condition;
            });
          },
          orderBy(parent, $connection, value) {
            const $select = $connection.getSubplan();
            value.apply($select);
          }
        }
      },
      createdAt($record) {
        return $record.get("created_at");
      },
      firstName($record) {
        return $record.get("first_name");
      },
      id($parent) {
        const specifier = nodeIdHandler_Person.plan($parent);
        return lambda(specifier, nodeIdCodecs[nodeIdHandler_Person.codec.name].encode);
      },
      lastName($record) {
        return $record.get("last_name");
      },
      organizationId($record) {
        return $record.get("organization_id");
      },
      rowId($record) {
        return $record.get("id");
      },
      updatedAt($record) {
        return $record.get("updated_at");
      }
    },
    planType($specifier) {
      const spec = Object.create(null);
      for (const pkCol of personUniques[0].attributes) spec[pkCol] = get2($specifier, pkCol);
      return resource_personPgResource.get(spec);
    }
  },
  PersonConnection: {
    assertStep: ConnectionStep,
    plans: {
      totalCount($connection) {
        return $connection.cloneSubplanWithoutPagination("aggregate").singleAsRecord().select(sql`count(*)`, TYPES.bigint, !1);
      }
    }
  },
  Product: {
    assertStep: assertPgClassSingleStep,
    plans: {
      createdAt($record) {
        return $record.get("created_at");
      },
      currentQuantity($record) {
        return $record.get("current_quantity");
      },
      id($parent) {
        const specifier = nodeIdHandler_Product.plan($parent);
        return lambda(specifier, nodeIdCodecs[nodeIdHandler_Product.codec.name].encode);
      },
      inventoryAdjustments: {
        plan($record) {
          const $records = resource_inventory_adjustmentPgResource.find({
            product_id: $record.get("id")
          });
          return connection($records);
        },
        args: {
          first(_, $connection, arg) {
            $connection.setFirst(arg.getRaw());
          },
          last(_, $connection, val) {
            $connection.setLast(val.getRaw());
          },
          offset(_, $connection, val) {
            $connection.setOffset(val.getRaw());
          },
          before(_, $connection, val) {
            $connection.setBefore(val.getRaw());
          },
          after(_, $connection, val) {
            $connection.setAfter(val.getRaw());
          },
          condition(_condition, $connection, arg) {
            const $select = $connection.getSubplan();
            arg.apply($select, qbWhereBuilder);
          },
          filter(_, $connection, fieldArg) {
            const $pgSelect = $connection.getSubplan();
            fieldArg.apply($pgSelect, (queryBuilder, value) => {
              assertAllowed44(value, "object");
              if (value == null) return;
              const condition = new PgCondition(queryBuilder);
              return condition;
            });
          },
          orderBy(parent, $connection, value) {
            const $select = $connection.getSubplan();
            value.apply($select);
          }
        }
      },
      isActive($record) {
        return $record.get("is_active");
      },
      lowStockThreshold($record) {
        return $record.get("low_stock_threshold");
      },
      organizationId($record) {
        return $record.get("organization_id");
      },
      rowId($record) {
        return $record.get("id");
      },
      unitPrice($record) {
        return $record.get("unit_price");
      },
      updatedAt($record) {
        return $record.get("updated_at");
      }
    },
    planType($specifier) {
      const spec = Object.create(null);
      for (const pkCol of productUniques[0].attributes) spec[pkCol] = get2($specifier, pkCol);
      return resource_productPgResource.get(spec);
    }
  },
  ProductConnection: {
    assertStep: ConnectionStep,
    plans: {
      totalCount($connection) {
        return $connection.cloneSubplanWithoutPagination("aggregate").singleAsRecord().select(sql`count(*)`, TYPES.bigint, !1);
      }
    }
  },
  Quote: {
    assertStep: assertPgClassSingleStep,
    plans: {
      additionalItemsLabel($record) {
        return $record.get("additional_items_label");
      },
      additionalTerms($record) {
        return $record.get("additional_terms");
      },
      clientEmail($record) {
        return $record.get("client_email");
      },
      clientName($record) {
        return $record.get("client_name");
      },
      company($record) {
        return resource_companyPgResource.get({
          id: $record.get("company_id")
        });
      },
      companyId($record) {
        return $record.get("company_id");
      },
      contact($record) {
        return resource_personPgResource.get({
          id: $record.get("contact_id")
        });
      },
      contactId($record) {
        return $record.get("contact_id");
      },
      convertedInvoice($record) {
        return resource_invoicePgResource.get({
          id: $record.get("converted_invoice_id")
        });
      },
      convertedInvoiceId($record) {
        return $record.get("converted_invoice_id");
      },
      createdAt($record) {
        return $record.get("created_at");
      },
      id($parent) {
        const specifier = nodeIdHandler_Quote.plan($parent);
        return lambda(specifier, nodeIdCodecs[nodeIdHandler_Quote.codec.name].encode);
      },
      organizationId($record) {
        return $record.get("organization_id");
      },
      projectType($record) {
        return $record.get("project_type");
      },
      quoteLineItems: {
        plan($record) {
          const $records = resource_quote_line_itemPgResource.find({
            quote_id: $record.get("id")
          });
          return connection($records);
        },
        args: {
          first(_, $connection, arg) {
            $connection.setFirst(arg.getRaw());
          },
          last(_, $connection, val) {
            $connection.setLast(val.getRaw());
          },
          offset(_, $connection, val) {
            $connection.setOffset(val.getRaw());
          },
          before(_, $connection, val) {
            $connection.setBefore(val.getRaw());
          },
          after(_, $connection, val) {
            $connection.setAfter(val.getRaw());
          },
          condition(_condition, $connection, arg) {
            const $select = $connection.getSubplan();
            arg.apply($select, qbWhereBuilder);
          },
          filter(_, $connection, fieldArg) {
            const $pgSelect = $connection.getSubplan();
            fieldArg.apply($pgSelect, (queryBuilder, value) => {
              assertAllowed45(value, "object");
              if (value == null) return;
              const condition = new PgCondition(queryBuilder);
              return condition;
            });
          },
          orderBy(parent, $connection, value) {
            const $select = $connection.getSubplan();
            value.apply($select);
          }
        }
      },
      quoteNumber($record) {
        return $record.get("quote_number");
      },
      rowId($record) {
        return $record.get("id");
      },
      taxAmount($record) {
        return $record.get("tax_amount");
      },
      taxRate($record) {
        return $record.get("tax_rate");
      },
      timeRange($record) {
        return $record.get("time_range");
      },
      updatedAt($record) {
        return $record.get("updated_at");
      },
      validUntil($record) {
        return $record.get("valid_until");
      }
    },
    planType($specifier) {
      const spec = Object.create(null);
      for (const pkCol of quoteUniques[0].attributes) spec[pkCol] = get2($specifier, pkCol);
      return resource_quotePgResource.get(spec);
    }
  },
  QuoteConnection: {
    assertStep: ConnectionStep,
    plans: {
      totalCount($connection) {
        return $connection.cloneSubplanWithoutPagination("aggregate").singleAsRecord().select(sql`count(*)`, TYPES.bigint, !1);
      }
    }
  },
  QuoteLineItem: {
    assertStep: assertPgClassSingleStep,
    plans: {
      estimatedHours($record) {
        return $record.get("estimated_hours");
      },
      hourlyRate($record) {
        return $record.get("hourly_rate");
      },
      id($parent) {
        const specifier = nodeIdHandler_QuoteLineItem.plan($parent);
        return lambda(specifier, nodeIdCodecs[nodeIdHandler_QuoteLineItem.codec.name].encode);
      },
      maxCapHours($record) {
        return $record.get("max_cap_hours");
      },
      minimumBillingMinutes($record) {
        return $record.get("minimum_billing_minutes");
      },
      monthlyCapHours($record) {
        return $record.get("monthly_cap_hours");
      },
      pricingType($record) {
        return $record.get("pricing_type");
      },
      product($record) {
        return resource_productPgResource.get({
          id: $record.get("product_id")
        });
      },
      productId($record) {
        return $record.get("product_id");
      },
      quote($record) {
        return resource_quotePgResource.get({
          id: $record.get("quote_id")
        });
      },
      quoteId($record) {
        return $record.get("quote_id");
      },
      rowId($record) {
        return $record.get("id");
      },
      royaltyBuyoutAmount($record) {
        return $record.get("royalty_buyout_amount");
      },
      royaltyPercentage($record) {
        return $record.get("royalty_percentage");
      },
      royaltyThreshold($record) {
        return $record.get("royalty_threshold");
      },
      royaltyTimeframe($record) {
        return $record.get("royalty_timeframe");
      },
      royaltyTimeframeUnit($record) {
        return $record.get("royalty_timeframe_unit");
      },
      sortOrder($record) {
        return $record.get("sort_order");
      },
      unitPrice($record) {
        return $record.get("unit_price");
      },
      weeklyCapHours($record) {
        return $record.get("weekly_cap_hours");
      }
    },
    planType($specifier) {
      const spec = Object.create(null);
      for (const pkCol of quote_line_itemUniques[0].attributes) spec[pkCol] = get2($specifier, pkCol);
      return resource_quote_line_itemPgResource.get(spec);
    }
  },
  QuoteLineItemConnection: {
    assertStep: ConnectionStep,
    plans: {
      totalCount($connection) {
        return $connection.cloneSubplanWithoutPagination("aggregate").singleAsRecord().select(sql`count(*)`, TYPES.bigint, !1);
      }
    }
  },
  UpdateCompanyMemberPayload: {
    assertStep: ObjectStep,
    plans: {
      clientMutationId($mutation) {
        return $mutation.getStepForKey("result").getMeta("clientMutationId");
      },
      companyMember($object) {
        return $object.get("result");
      },
      companyMemberEdge($mutation, fieldArgs) {
        return pgMutationPayloadEdge(resource_company_memberPgResource, company_memberUniques[0].attributes, $mutation, fieldArgs);
      },
      query() {
        return rootValue();
      }
    }
  },
  UpdateCompanyPayload: {
    assertStep: ObjectStep,
    plans: {
      clientMutationId($mutation) {
        return $mutation.getStepForKey("result").getMeta("clientMutationId");
      },
      company($object) {
        return $object.get("result");
      },
      companyEdge($mutation, fieldArgs) {
        return pgMutationPayloadEdge(resource_companyPgResource, companyUniques[0].attributes, $mutation, fieldArgs);
      },
      query() {
        return rootValue();
      }
    }
  },
  UpdateDocumentNumberingConfigPayload: {
    assertStep: ObjectStep,
    plans: {
      clientMutationId($mutation) {
        return $mutation.getStepForKey("result").getMeta("clientMutationId");
      },
      documentNumberingConfig($object) {
        return $object.get("result");
      },
      documentNumberingConfigEdge($mutation, fieldArgs) {
        return pgMutationPayloadEdge(resource_document_numbering_configPgResource, document_numbering_configUniques[0].attributes, $mutation, fieldArgs);
      },
      query() {
        return rootValue();
      }
    }
  },
  UpdateInventoryAdjustmentPayload: {
    assertStep: ObjectStep,
    plans: {
      clientMutationId($mutation) {
        return $mutation.getStepForKey("result").getMeta("clientMutationId");
      },
      inventoryAdjustment($object) {
        return $object.get("result");
      },
      inventoryAdjustmentEdge($mutation, fieldArgs) {
        return pgMutationPayloadEdge(resource_inventory_adjustmentPgResource, inventory_adjustmentUniques[0].attributes, $mutation, fieldArgs);
      },
      query() {
        return rootValue();
      }
    }
  },
  UpdateInvoiceLineItemPayload: {
    assertStep: ObjectStep,
    plans: {
      clientMutationId($mutation) {
        return $mutation.getStepForKey("result").getMeta("clientMutationId");
      },
      invoiceLineItem($object) {
        return $object.get("result");
      },
      invoiceLineItemEdge($mutation, fieldArgs) {
        return pgMutationPayloadEdge(resource_invoice_line_itemPgResource, invoice_line_itemUniques[0].attributes, $mutation, fieldArgs);
      },
      query() {
        return rootValue();
      }
    }
  },
  UpdateInvoicePayload: {
    assertStep: ObjectStep,
    plans: {
      clientMutationId($mutation) {
        return $mutation.getStepForKey("result").getMeta("clientMutationId");
      },
      invoice($object) {
        return $object.get("result");
      },
      invoiceEdge($mutation, fieldArgs) {
        return pgMutationPayloadEdge(resource_invoicePgResource, invoiceUniques[0].attributes, $mutation, fieldArgs);
      },
      query() {
        return rootValue();
      }
    }
  },
  UpdateOrganizationSettingPayload: {
    assertStep: ObjectStep,
    plans: {
      clientMutationId($mutation) {
        return $mutation.getStepForKey("result").getMeta("clientMutationId");
      },
      organizationSetting($object) {
        return $object.get("result");
      },
      organizationSettingEdge($mutation, fieldArgs) {
        return pgMutationPayloadEdge(resource_organization_settingsPgResource, organization_settingsUniques[0].attributes, $mutation, fieldArgs);
      },
      query() {
        return rootValue();
      }
    }
  },
  UpdatePersonPayload: {
    assertStep: ObjectStep,
    plans: {
      clientMutationId($mutation) {
        return $mutation.getStepForKey("result").getMeta("clientMutationId");
      },
      person($object) {
        return $object.get("result");
      },
      personEdge($mutation, fieldArgs) {
        return pgMutationPayloadEdge(resource_personPgResource, personUniques[0].attributes, $mutation, fieldArgs);
      },
      query() {
        return rootValue();
      }
    }
  },
  UpdateProductPayload: {
    assertStep: ObjectStep,
    plans: {
      clientMutationId($mutation) {
        return $mutation.getStepForKey("result").getMeta("clientMutationId");
      },
      product($object) {
        return $object.get("result");
      },
      productEdge($mutation, fieldArgs) {
        return pgMutationPayloadEdge(resource_productPgResource, productUniques[0].attributes, $mutation, fieldArgs);
      },
      query() {
        return rootValue();
      }
    }
  },
  UpdateQuoteLineItemPayload: {
    assertStep: ObjectStep,
    plans: {
      clientMutationId($mutation) {
        return $mutation.getStepForKey("result").getMeta("clientMutationId");
      },
      query() {
        return rootValue();
      },
      quoteLineItem($object) {
        return $object.get("result");
      },
      quoteLineItemEdge($mutation, fieldArgs) {
        return pgMutationPayloadEdge(resource_quote_line_itemPgResource, quote_line_itemUniques[0].attributes, $mutation, fieldArgs);
      }
    }
  },
  UpdateQuotePayload: {
    assertStep: ObjectStep,
    plans: {
      clientMutationId($mutation) {
        return $mutation.getStepForKey("result").getMeta("clientMutationId");
      },
      query() {
        return rootValue();
      },
      quote($object) {
        return $object.get("result");
      },
      quoteEdge($mutation, fieldArgs) {
        return pgMutationPayloadEdge(resource_quotePgResource, quoteUniques[0].attributes, $mutation, fieldArgs);
      }
    }
  }
};
export const interfaces = {
  Node: {
    planType($nodeId) {
      const $specifier = decodeNodeId($nodeId);
      return {
        $__typename: lambda($specifier, findTypeNameMatch, !0),
        planForType(type) {
          const spec = nodeIdHandlerByTypeName[type.name];
          if (spec) return spec.get(spec.getSpec(access($specifier, [spec.codec.name])));else throw Error(`Failed to find handler for ${type.name}`);
        }
      };
    }
  }
};
export const inputObjects = {
  CompanyCondition: {
    plans: {
      organizationId($condition, val) {
        $condition.where({
          type: "attribute",
          attribute: "organization_id",
          callback(expression) {
            return val === null ? sql`${expression} is null` : sql`${expression} = ${sqlValueWithCodec(val, TYPES.text)}`;
          }
        });
      },
      rowId($condition, val) {
        $condition.where({
          type: "attribute",
          attribute: "id",
          callback(expression) {
            return val === null ? sql`${expression} is null` : sql`${expression} = ${sqlValueWithCodec(val, TYPES.uuid)}`;
          }
        });
      }
    }
  },
  CompanyFilter: {
    plans: {
      and($where, value) {
        assertAllowed18(value, "list");
        if (value == null) return;
        return $where.andPlan();
      },
      companyMembers($where, value) {
        assertAllowed17(value, "object");
        const $rel = $where.andPlan();
        $rel.extensions.pgFilterRelation = {
          tableExpression: companyMemberIdentifier,
          alias: resource_company_memberPgResource.name,
          localAttributes: registryConfig.pgRelations.company.companyMembersByTheirCompanyId.localAttributes,
          remoteAttributes: registryConfig.pgRelations.company.companyMembersByTheirCompanyId.remoteAttributes
        };
        return $rel;
      },
      companyMembersExist($where, value) {
        assertAllowed17(value, "scalar");
        if (value == null) return;
        const $subQuery = $where.existsPlan({
          tableExpression: companyMemberIdentifier,
          alias: resource_company_memberPgResource.name,
          equals: value
        });
        registryConfig.pgRelations.company.companyMembersByTheirCompanyId.localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = registryConfig.pgRelations.company.companyMembersByTheirCompanyId.remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
      },
      invoices($where, value) {
        assertAllowed17(value, "object");
        const $rel = $where.andPlan();
        $rel.extensions.pgFilterRelation = {
          tableExpression: invoiceIdentifier,
          alias: resource_invoicePgResource.name,
          localAttributes: registryConfig.pgRelations.company.invoicesByTheirCompanyId.localAttributes,
          remoteAttributes: registryConfig.pgRelations.company.invoicesByTheirCompanyId.remoteAttributes
        };
        return $rel;
      },
      invoicesExist($where, value) {
        assertAllowed17(value, "scalar");
        if (value == null) return;
        const $subQuery = $where.existsPlan({
          tableExpression: invoiceIdentifier,
          alias: resource_invoicePgResource.name,
          equals: value
        });
        registryConfig.pgRelations.company.invoicesByTheirCompanyId.localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = registryConfig.pgRelations.company.invoicesByTheirCompanyId.remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
      },
      not($where, value) {
        assertAllowed18(value, "object");
        if (value == null) return;
        return $where.notPlan().andPlan();
      },
      or($where, value) {
        assertAllowed18(value, "list");
        if (value == null) return;
        const $or = $where.orPlan();
        return () => $or.andPlan();
      },
      organizationId(queryBuilder, value) {
        if (value === void 0) return;
        if (!false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const condition = new PgCondition(queryBuilder);
        condition.extensions.pgFilterAttribute = colSpec5;
        return condition;
      },
      quotes($where, value) {
        assertAllowed17(value, "object");
        const $rel = $where.andPlan();
        $rel.extensions.pgFilterRelation = {
          tableExpression: quoteIdentifier,
          alias: resource_quotePgResource.name,
          localAttributes: registryConfig.pgRelations.company.quotesByTheirCompanyId.localAttributes,
          remoteAttributes: registryConfig.pgRelations.company.quotesByTheirCompanyId.remoteAttributes
        };
        return $rel;
      },
      quotesExist($where, value) {
        assertAllowed17(value, "scalar");
        if (value == null) return;
        const $subQuery = $where.existsPlan({
          tableExpression: quoteIdentifier,
          alias: resource_quotePgResource.name,
          equals: value
        });
        registryConfig.pgRelations.company.quotesByTheirCompanyId.localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = registryConfig.pgRelations.company.quotesByTheirCompanyId.remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
      },
      rowId(queryBuilder, value) {
        if (value === void 0) return;
        if (!false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const condition = new PgCondition(queryBuilder);
        condition.extensions.pgFilterAttribute = colSpec4;
        return condition;
      }
    }
  },
  CompanyInput: {
    baked: createObjectAndApplyChildren,
    plans: {
      addressLine1(obj, val, {
        field,
        schema
      }) {
        obj.set("address_line_1", bakedInputRuntime(schema, field.type, val));
      },
      addressLine2(obj, val, {
        field,
        schema
      }) {
        obj.set("address_line_2", bakedInputRuntime(schema, field.type, val));
      },
      city(obj, val, {
        field,
        schema
      }) {
        obj.set("city", bakedInputRuntime(schema, field.type, val));
      },
      country(obj, val, {
        field,
        schema
      }) {
        obj.set("country", bakedInputRuntime(schema, field.type, val));
      },
      createdAt(obj, val, {
        field,
        schema
      }) {
        obj.set("created_at", bakedInputRuntime(schema, field.type, val));
      },
      email(obj, val, {
        field,
        schema
      }) {
        obj.set("email", bakedInputRuntime(schema, field.type, val));
      },
      industry(obj, val, {
        field,
        schema
      }) {
        obj.set("industry", bakedInputRuntime(schema, field.type, val));
      },
      name(obj, val, {
        field,
        schema
      }) {
        obj.set("name", bakedInputRuntime(schema, field.type, val));
      },
      notes(obj, val, {
        field,
        schema
      }) {
        obj.set("notes", bakedInputRuntime(schema, field.type, val));
      },
      organizationId(obj, val, {
        field,
        schema
      }) {
        obj.set("organization_id", bakedInputRuntime(schema, field.type, val));
      },
      phone(obj, val, {
        field,
        schema
      }) {
        obj.set("phone", bakedInputRuntime(schema, field.type, val));
      },
      postalCode(obj, val, {
        field,
        schema
      }) {
        obj.set("postal_code", bakedInputRuntime(schema, field.type, val));
      },
      rowId(obj, val, {
        field,
        schema
      }) {
        obj.set("id", bakedInputRuntime(schema, field.type, val));
      },
      state(obj, val, {
        field,
        schema
      }) {
        obj.set("state", bakedInputRuntime(schema, field.type, val));
      },
      updatedAt(obj, val, {
        field,
        schema
      }) {
        obj.set("updated_at", bakedInputRuntime(schema, field.type, val));
      },
      website(obj, val, {
        field,
        schema
      }) {
        obj.set("website", bakedInputRuntime(schema, field.type, val));
      }
    }
  },
  CompanyMemberCondition: {
    plans: {
      companyId($condition, val) {
        $condition.where({
          type: "attribute",
          attribute: "company_id",
          callback(expression) {
            return val === null ? sql`${expression} is null` : sql`${expression} = ${sqlValueWithCodec(val, TYPES.uuid)}`;
          }
        });
      },
      personId($condition, val) {
        $condition.where({
          type: "attribute",
          attribute: "person_id",
          callback(expression) {
            return val === null ? sql`${expression} is null` : sql`${expression} = ${sqlValueWithCodec(val, TYPES.uuid)}`;
          }
        });
      },
      rowId($condition, val) {
        $condition.where({
          type: "attribute",
          attribute: "id",
          callback(expression) {
            return val === null ? sql`${expression} is null` : sql`${expression} = ${sqlValueWithCodec(val, TYPES.uuid)}`;
          }
        });
      }
    }
  },
  CompanyMemberFilter: {
    plans: {
      and($where, value) {
        assertAllowed16(value, "list");
        if (value == null) return;
        return $where.andPlan();
      },
      company($where, value) {
        assertAllowed15(value, "object");
        if (value == null) return;
        const $subQuery = $where.existsPlan({
          tableExpression: companyIdentifier,
          alias: resource_companyPgResource.name
        });
        registryConfig.pgRelations.companyMember.companyByMyCompanyId.localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = registryConfig.pgRelations.companyMember.companyByMyCompanyId.remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
        return $subQuery;
      },
      companyId(queryBuilder, value) {
        if (value === void 0) return;
        if (!false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const condition = new PgCondition(queryBuilder);
        condition.extensions.pgFilterAttribute = colSpec2;
        return condition;
      },
      not($where, value) {
        assertAllowed16(value, "object");
        if (value == null) return;
        return $where.notPlan().andPlan();
      },
      or($where, value) {
        assertAllowed16(value, "list");
        if (value == null) return;
        const $or = $where.orPlan();
        return () => $or.andPlan();
      },
      person($where, value) {
        assertAllowed15(value, "object");
        if (value == null) return;
        const $subQuery = $where.existsPlan({
          tableExpression: personIdentifier,
          alias: resource_personPgResource.name
        });
        registryConfig.pgRelations.companyMember.personByMyPersonId.localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = registryConfig.pgRelations.companyMember.personByMyPersonId.remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
        return $subQuery;
      },
      personId(queryBuilder, value) {
        if (value === void 0) return;
        if (!false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const condition = new PgCondition(queryBuilder);
        condition.extensions.pgFilterAttribute = colSpec3;
        return condition;
      },
      rowId(queryBuilder, value) {
        if (value === void 0) return;
        if (!false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const condition = new PgCondition(queryBuilder);
        condition.extensions.pgFilterAttribute = colSpec;
        return condition;
      }
    }
  },
  CompanyMemberInput: {
    baked: createObjectAndApplyChildren,
    plans: {
      companyId(obj, val, {
        field,
        schema
      }) {
        obj.set("company_id", bakedInputRuntime(schema, field.type, val));
      },
      createdAt(obj, val, {
        field,
        schema
      }) {
        obj.set("created_at", bakedInputRuntime(schema, field.type, val));
      },
      isPrimary(obj, val, {
        field,
        schema
      }) {
        obj.set("is_primary", bakedInputRuntime(schema, field.type, val));
      },
      personId(obj, val, {
        field,
        schema
      }) {
        obj.set("person_id", bakedInputRuntime(schema, field.type, val));
      },
      rowId(obj, val, {
        field,
        schema
      }) {
        obj.set("id", bakedInputRuntime(schema, field.type, val));
      },
      title(obj, val, {
        field,
        schema
      }) {
        obj.set("title", bakedInputRuntime(schema, field.type, val));
      }
    }
  },
  CompanyMemberPatch: {
    baked: createObjectAndApplyChildren,
    plans: {
      companyId(obj, val, {
        field,
        schema
      }) {
        obj.set("company_id", bakedInputRuntime(schema, field.type, val));
      },
      createdAt(obj, val, {
        field,
        schema
      }) {
        obj.set("created_at", bakedInputRuntime(schema, field.type, val));
      },
      isPrimary(obj, val, {
        field,
        schema
      }) {
        obj.set("is_primary", bakedInputRuntime(schema, field.type, val));
      },
      personId(obj, val, {
        field,
        schema
      }) {
        obj.set("person_id", bakedInputRuntime(schema, field.type, val));
      },
      rowId(obj, val, {
        field,
        schema
      }) {
        obj.set("id", bakedInputRuntime(schema, field.type, val));
      },
      title(obj, val, {
        field,
        schema
      }) {
        obj.set("title", bakedInputRuntime(schema, field.type, val));
      }
    }
  },
  CompanyPatch: {
    baked: createObjectAndApplyChildren,
    plans: {
      addressLine1(obj, val, {
        field,
        schema
      }) {
        obj.set("address_line_1", bakedInputRuntime(schema, field.type, val));
      },
      addressLine2(obj, val, {
        field,
        schema
      }) {
        obj.set("address_line_2", bakedInputRuntime(schema, field.type, val));
      },
      city(obj, val, {
        field,
        schema
      }) {
        obj.set("city", bakedInputRuntime(schema, field.type, val));
      },
      country(obj, val, {
        field,
        schema
      }) {
        obj.set("country", bakedInputRuntime(schema, field.type, val));
      },
      createdAt(obj, val, {
        field,
        schema
      }) {
        obj.set("created_at", bakedInputRuntime(schema, field.type, val));
      },
      email(obj, val, {
        field,
        schema
      }) {
        obj.set("email", bakedInputRuntime(schema, field.type, val));
      },
      industry(obj, val, {
        field,
        schema
      }) {
        obj.set("industry", bakedInputRuntime(schema, field.type, val));
      },
      name(obj, val, {
        field,
        schema
      }) {
        obj.set("name", bakedInputRuntime(schema, field.type, val));
      },
      notes(obj, val, {
        field,
        schema
      }) {
        obj.set("notes", bakedInputRuntime(schema, field.type, val));
      },
      organizationId(obj, val, {
        field,
        schema
      }) {
        obj.set("organization_id", bakedInputRuntime(schema, field.type, val));
      },
      phone(obj, val, {
        field,
        schema
      }) {
        obj.set("phone", bakedInputRuntime(schema, field.type, val));
      },
      postalCode(obj, val, {
        field,
        schema
      }) {
        obj.set("postal_code", bakedInputRuntime(schema, field.type, val));
      },
      rowId(obj, val, {
        field,
        schema
      }) {
        obj.set("id", bakedInputRuntime(schema, field.type, val));
      },
      state(obj, val, {
        field,
        schema
      }) {
        obj.set("state", bakedInputRuntime(schema, field.type, val));
      },
      updatedAt(obj, val, {
        field,
        schema
      }) {
        obj.set("updated_at", bakedInputRuntime(schema, field.type, val));
      },
      website(obj, val, {
        field,
        schema
      }) {
        obj.set("website", bakedInputRuntime(schema, field.type, val));
      }
    }
  },
  CompanyToManyCompanyMemberFilter: {
    plans: {
      every($where, value) {
        assertAllowed19(value, "object");
        if (value == null) return;
        if (!$where.extensions.pgFilterRelation) throw Error("Invalid use of filter, 'pgFilterRelation' expected");
        const {
            localAttributes,
            remoteAttributes,
            tableExpression,
            alias
          } = $where.extensions.pgFilterRelation,
          $subQuery = $where.notPlan().existsPlan({
            tableExpression,
            alias
          });
        localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
        return $subQuery.notPlan().andPlan();
      },
      none($where, value) {
        assertAllowed19(value, "object");
        if (value == null) return;
        if (!$where.extensions.pgFilterRelation) throw Error("Invalid use of filter, 'pgFilterRelation' expected");
        const {
            localAttributes,
            remoteAttributes,
            tableExpression,
            alias
          } = $where.extensions.pgFilterRelation,
          $subQuery = $where.notPlan().existsPlan({
            tableExpression,
            alias
          });
        localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
        return $subQuery;
      },
      some($where, value) {
        assertAllowed19(value, "object");
        if (value == null) return;
        if (!$where.extensions.pgFilterRelation) throw Error("Invalid use of filter, 'pgFilterRelation' expected");
        const {
            localAttributes,
            remoteAttributes,
            tableExpression,
            alias
          } = $where.extensions.pgFilterRelation,
          $subQuery = $where.existsPlan({
            tableExpression,
            alias
          });
        localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
        return $subQuery;
      }
    }
  },
  CompanyToManyInvoiceFilter: {
    plans: {
      every($where, value) {
        assertAllowed20(value, "object");
        if (value == null) return;
        if (!$where.extensions.pgFilterRelation) throw Error("Invalid use of filter, 'pgFilterRelation' expected");
        const {
            localAttributes,
            remoteAttributes,
            tableExpression,
            alias
          } = $where.extensions.pgFilterRelation,
          $subQuery = $where.notPlan().existsPlan({
            tableExpression,
            alias
          });
        localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
        return $subQuery.notPlan().andPlan();
      },
      none($where, value) {
        assertAllowed20(value, "object");
        if (value == null) return;
        if (!$where.extensions.pgFilterRelation) throw Error("Invalid use of filter, 'pgFilterRelation' expected");
        const {
            localAttributes,
            remoteAttributes,
            tableExpression,
            alias
          } = $where.extensions.pgFilterRelation,
          $subQuery = $where.notPlan().existsPlan({
            tableExpression,
            alias
          });
        localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
        return $subQuery;
      },
      some($where, value) {
        assertAllowed20(value, "object");
        if (value == null) return;
        if (!$where.extensions.pgFilterRelation) throw Error("Invalid use of filter, 'pgFilterRelation' expected");
        const {
            localAttributes,
            remoteAttributes,
            tableExpression,
            alias
          } = $where.extensions.pgFilterRelation,
          $subQuery = $where.existsPlan({
            tableExpression,
            alias
          });
        localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
        return $subQuery;
      }
    }
  },
  CompanyToManyQuoteFilter: {
    plans: {
      every($where, value) {
        assertAllowed35(value, "object");
        if (value == null) return;
        if (!$where.extensions.pgFilterRelation) throw Error("Invalid use of filter, 'pgFilterRelation' expected");
        const {
            localAttributes,
            remoteAttributes,
            tableExpression,
            alias
          } = $where.extensions.pgFilterRelation,
          $subQuery = $where.notPlan().existsPlan({
            tableExpression,
            alias
          });
        localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
        return $subQuery.notPlan().andPlan();
      },
      none($where, value) {
        assertAllowed35(value, "object");
        if (value == null) return;
        if (!$where.extensions.pgFilterRelation) throw Error("Invalid use of filter, 'pgFilterRelation' expected");
        const {
            localAttributes,
            remoteAttributes,
            tableExpression,
            alias
          } = $where.extensions.pgFilterRelation,
          $subQuery = $where.notPlan().existsPlan({
            tableExpression,
            alias
          });
        localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
        return $subQuery;
      },
      some($where, value) {
        assertAllowed35(value, "object");
        if (value == null) return;
        if (!$where.extensions.pgFilterRelation) throw Error("Invalid use of filter, 'pgFilterRelation' expected");
        const {
            localAttributes,
            remoteAttributes,
            tableExpression,
            alias
          } = $where.extensions.pgFilterRelation,
          $subQuery = $where.existsPlan({
            tableExpression,
            alias
          });
        localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
        return $subQuery;
      }
    }
  },
  CreateCompanyInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      },
      company(qb, arg) {
        if (arg != null) return qb.setBuilder();
      }
    }
  },
  CreateCompanyMemberInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      },
      companyMember(qb, arg) {
        if (arg != null) return qb.setBuilder();
      }
    }
  },
  CreateDocumentNumberingConfigInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      },
      documentNumberingConfig(qb, arg) {
        if (arg != null) return qb.setBuilder();
      }
    }
  },
  CreateInventoryAdjustmentInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      },
      inventoryAdjustment(qb, arg) {
        if (arg != null) return qb.setBuilder();
      }
    }
  },
  CreateInvoiceInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      },
      invoice(qb, arg) {
        if (arg != null) return qb.setBuilder();
      }
    }
  },
  CreateInvoiceLineItemInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      },
      invoiceLineItem(qb, arg) {
        if (arg != null) return qb.setBuilder();
      }
    }
  },
  CreateOrganizationSettingInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      },
      organizationSetting(qb, arg) {
        if (arg != null) return qb.setBuilder();
      }
    }
  },
  CreatePersonInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      },
      person(qb, arg) {
        if (arg != null) return qb.setBuilder();
      }
    }
  },
  CreateProductInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      },
      product(qb, arg) {
        if (arg != null) return qb.setBuilder();
      }
    }
  },
  CreateQuoteInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      },
      quote(qb, arg) {
        if (arg != null) return qb.setBuilder();
      }
    }
  },
  CreateQuoteLineItemInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      },
      quoteLineItem(qb, arg) {
        if (arg != null) return qb.setBuilder();
      }
    }
  },
  DeleteCompanyByIdInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      }
    }
  },
  DeleteCompanyInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      }
    }
  },
  DeleteCompanyMemberByIdInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      }
    }
  },
  DeleteCompanyMemberInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      }
    }
  },
  DeleteDocumentNumberingConfigByIdInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      }
    }
  },
  DeleteDocumentNumberingConfigInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      }
    }
  },
  DeleteInventoryAdjustmentByIdInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      }
    }
  },
  DeleteInventoryAdjustmentInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      }
    }
  },
  DeleteInvoiceByIdInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      }
    }
  },
  DeleteInvoiceInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      }
    }
  },
  DeleteInvoiceLineItemByIdInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      }
    }
  },
  DeleteInvoiceLineItemInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      }
    }
  },
  DeleteOrganizationSettingByIdInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      }
    }
  },
  DeleteOrganizationSettingInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      }
    }
  },
  DeletePersonByIdInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      }
    }
  },
  DeletePersonInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      }
    }
  },
  DeleteProductByIdInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      }
    }
  },
  DeleteProductInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      }
    }
  },
  DeleteQuoteByIdInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      }
    }
  },
  DeleteQuoteInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      }
    }
  },
  DeleteQuoteLineItemByIdInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      }
    }
  },
  DeleteQuoteLineItemInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      }
    }
  },
  DocumentNumberingConfigCondition: {
    plans: {
      documentType($condition, val) {
        $condition.where({
          type: "attribute",
          attribute: "document_type",
          callback(expression) {
            return val === null ? sql`${expression} is null` : sql`${expression} = ${sqlValueWithCodec(val, TYPES.text)}`;
          }
        });
      },
      organizationId($condition, val) {
        $condition.where({
          type: "attribute",
          attribute: "organization_id",
          callback(expression) {
            return val === null ? sql`${expression} is null` : sql`${expression} = ${sqlValueWithCodec(val, TYPES.text)}`;
          }
        });
      },
      rowId($condition, val) {
        $condition.where({
          type: "attribute",
          attribute: "id",
          callback(expression) {
            return val === null ? sql`${expression} is null` : sql`${expression} = ${sqlValueWithCodec(val, TYPES.uuid)}`;
          }
        });
      }
    }
  },
  DocumentNumberingConfigFilter: {
    plans: {
      and($where, value) {
        assertAllowed47(value, "list");
        if (value == null) return;
        return $where.andPlan();
      },
      documentType(queryBuilder, value) {
        if (value === void 0) return;
        if (!false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const condition = new PgCondition(queryBuilder);
        condition.extensions.pgFilterAttribute = colSpec32;
        return condition;
      },
      not($where, value) {
        assertAllowed47(value, "object");
        if (value == null) return;
        return $where.notPlan().andPlan();
      },
      or($where, value) {
        assertAllowed47(value, "list");
        if (value == null) return;
        const $or = $where.orPlan();
        return () => $or.andPlan();
      },
      organizationId(queryBuilder, value) {
        if (value === void 0) return;
        if (!false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const condition = new PgCondition(queryBuilder);
        condition.extensions.pgFilterAttribute = colSpec31;
        return condition;
      },
      rowId(queryBuilder, value) {
        if (value === void 0) return;
        if (!false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const condition = new PgCondition(queryBuilder);
        condition.extensions.pgFilterAttribute = colSpec30;
        return condition;
      }
    }
  },
  DocumentNumberingConfigInput: {
    baked: createObjectAndApplyChildren,
    plans: {
      createdAt(obj, val, {
        field,
        schema
      }) {
        obj.set("created_at", bakedInputRuntime(schema, field.type, val));
      },
      dateFormat(obj, val, {
        field,
        schema
      }) {
        obj.set("date_format", bakedInputRuntime(schema, field.type, val));
      },
      documentType(obj, val, {
        field,
        schema
      }) {
        obj.set("document_type", bakedInputRuntime(schema, field.type, val));
      },
      idStrategy(obj, val, {
        field,
        schema
      }) {
        obj.set("id_strategy", bakedInputRuntime(schema, field.type, val));
      },
      nextSequentialNumber(obj, val, {
        field,
        schema
      }) {
        obj.set("next_sequential_number", bakedInputRuntime(schema, field.type, val));
      },
      organizationId(obj, val, {
        field,
        schema
      }) {
        obj.set("organization_id", bakedInputRuntime(schema, field.type, val));
      },
      prefix(obj, val, {
        field,
        schema
      }) {
        obj.set("prefix", bakedInputRuntime(schema, field.type, val));
      },
      randomLength(obj, val, {
        field,
        schema
      }) {
        obj.set("random_length", bakedInputRuntime(schema, field.type, val));
      },
      rowId(obj, val, {
        field,
        schema
      }) {
        obj.set("id", bakedInputRuntime(schema, field.type, val));
      },
      separator(obj, val, {
        field,
        schema
      }) {
        obj.set("separator", bakedInputRuntime(schema, field.type, val));
      },
      sequentialPadding(obj, val, {
        field,
        schema
      }) {
        obj.set("sequential_padding", bakedInputRuntime(schema, field.type, val));
      },
      updatedAt(obj, val, {
        field,
        schema
      }) {
        obj.set("updated_at", bakedInputRuntime(schema, field.type, val));
      }
    }
  },
  DocumentNumberingConfigPatch: {
    baked: createObjectAndApplyChildren,
    plans: {
      createdAt(obj, val, {
        field,
        schema
      }) {
        obj.set("created_at", bakedInputRuntime(schema, field.type, val));
      },
      dateFormat(obj, val, {
        field,
        schema
      }) {
        obj.set("date_format", bakedInputRuntime(schema, field.type, val));
      },
      documentType(obj, val, {
        field,
        schema
      }) {
        obj.set("document_type", bakedInputRuntime(schema, field.type, val));
      },
      idStrategy(obj, val, {
        field,
        schema
      }) {
        obj.set("id_strategy", bakedInputRuntime(schema, field.type, val));
      },
      nextSequentialNumber(obj, val, {
        field,
        schema
      }) {
        obj.set("next_sequential_number", bakedInputRuntime(schema, field.type, val));
      },
      organizationId(obj, val, {
        field,
        schema
      }) {
        obj.set("organization_id", bakedInputRuntime(schema, field.type, val));
      },
      prefix(obj, val, {
        field,
        schema
      }) {
        obj.set("prefix", bakedInputRuntime(schema, field.type, val));
      },
      randomLength(obj, val, {
        field,
        schema
      }) {
        obj.set("random_length", bakedInputRuntime(schema, field.type, val));
      },
      rowId(obj, val, {
        field,
        schema
      }) {
        obj.set("id", bakedInputRuntime(schema, field.type, val));
      },
      separator(obj, val, {
        field,
        schema
      }) {
        obj.set("separator", bakedInputRuntime(schema, field.type, val));
      },
      sequentialPadding(obj, val, {
        field,
        schema
      }) {
        obj.set("sequential_padding", bakedInputRuntime(schema, field.type, val));
      },
      updatedAt(obj, val, {
        field,
        schema
      }) {
        obj.set("updated_at", bakedInputRuntime(schema, field.type, val));
      }
    }
  },
  InventoryAdjustmentCondition: {
    plans: {
      productId($condition, val) {
        $condition.where({
          type: "attribute",
          attribute: "product_id",
          callback(expression) {
            return val === null ? sql`${expression} is null` : sql`${expression} = ${sqlValueWithCodec(val, TYPES.uuid)}`;
          }
        });
      },
      rowId($condition, val) {
        $condition.where({
          type: "attribute",
          attribute: "id",
          callback(expression) {
            return val === null ? sql`${expression} is null` : sql`${expression} = ${sqlValueWithCodec(val, TYPES.uuid)}`;
          }
        });
      }
    }
  },
  InventoryAdjustmentFilter: {
    plans: {
      and($where, value) {
        assertAllowed31(value, "list");
        if (value == null) return;
        return $where.andPlan();
      },
      not($where, value) {
        assertAllowed31(value, "object");
        if (value == null) return;
        return $where.notPlan().andPlan();
      },
      or($where, value) {
        assertAllowed31(value, "list");
        if (value == null) return;
        const $or = $where.orPlan();
        return () => $or.andPlan();
      },
      product($where, value) {
        assertAllowed30(value, "object");
        if (value == null) return;
        const $subQuery = $where.existsPlan({
          tableExpression: productIdentifier,
          alias: resource_productPgResource.name
        });
        registryConfig.pgRelations.inventoryAdjustment.productByMyProductId.localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = registryConfig.pgRelations.inventoryAdjustment.productByMyProductId.remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
        return $subQuery;
      },
      productId(queryBuilder, value) {
        if (value === void 0) return;
        if (!false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const condition = new PgCondition(queryBuilder);
        condition.extensions.pgFilterAttribute = colSpec17;
        return condition;
      },
      rowId(queryBuilder, value) {
        if (value === void 0) return;
        if (!false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const condition = new PgCondition(queryBuilder);
        condition.extensions.pgFilterAttribute = colSpec16;
        return condition;
      }
    }
  },
  InventoryAdjustmentInput: {
    baked: createObjectAndApplyChildren,
    plans: {
      createdAt(obj, val, {
        field,
        schema
      }) {
        obj.set("created_at", bakedInputRuntime(schema, field.type, val));
      },
      productId(obj, val, {
        field,
        schema
      }) {
        obj.set("product_id", bakedInputRuntime(schema, field.type, val));
      },
      quantityChange(obj, val, {
        field,
        schema
      }) {
        obj.set("quantity_change", bakedInputRuntime(schema, field.type, val));
      },
      reason(obj, val, {
        field,
        schema
      }) {
        obj.set("reason", bakedInputRuntime(schema, field.type, val));
      },
      referenceId(obj, val, {
        field,
        schema
      }) {
        obj.set("reference_id", bakedInputRuntime(schema, field.type, val));
      },
      rowId(obj, val, {
        field,
        schema
      }) {
        obj.set("id", bakedInputRuntime(schema, field.type, val));
      }
    }
  },
  InventoryAdjustmentPatch: {
    baked: createObjectAndApplyChildren,
    plans: {
      createdAt(obj, val, {
        field,
        schema
      }) {
        obj.set("created_at", bakedInputRuntime(schema, field.type, val));
      },
      productId(obj, val, {
        field,
        schema
      }) {
        obj.set("product_id", bakedInputRuntime(schema, field.type, val));
      },
      quantityChange(obj, val, {
        field,
        schema
      }) {
        obj.set("quantity_change", bakedInputRuntime(schema, field.type, val));
      },
      reason(obj, val, {
        field,
        schema
      }) {
        obj.set("reason", bakedInputRuntime(schema, field.type, val));
      },
      referenceId(obj, val, {
        field,
        schema
      }) {
        obj.set("reference_id", bakedInputRuntime(schema, field.type, val));
      },
      rowId(obj, val, {
        field,
        schema
      }) {
        obj.set("id", bakedInputRuntime(schema, field.type, val));
      }
    }
  },
  InvoiceCondition: {
    plans: {
      companyId($condition, val) {
        $condition.where({
          type: "attribute",
          attribute: "company_id",
          callback(expression) {
            return val === null ? sql`${expression} is null` : sql`${expression} = ${sqlValueWithCodec(val, TYPES.uuid)}`;
          }
        });
      },
      invoiceNumber($condition, val) {
        $condition.where({
          type: "attribute",
          attribute: "invoice_number",
          callback(expression) {
            return val === null ? sql`${expression} is null` : sql`${expression} = ${sqlValueWithCodec(val, TYPES.text)}`;
          }
        });
      },
      organizationId($condition, val) {
        $condition.where({
          type: "attribute",
          attribute: "organization_id",
          callback(expression) {
            return val === null ? sql`${expression} is null` : sql`${expression} = ${sqlValueWithCodec(val, TYPES.text)}`;
          }
        });
      },
      rowId($condition, val) {
        $condition.where({
          type: "attribute",
          attribute: "id",
          callback(expression) {
            return val === null ? sql`${expression} is null` : sql`${expression} = ${sqlValueWithCodec(val, TYPES.uuid)}`;
          }
        });
      },
      status($condition, val) {
        $condition.where({
          type: "attribute",
          attribute: "status",
          callback(expression) {
            return val === null ? sql`${expression} is null` : sql`${expression} = ${sqlValueWithCodec(val, TYPES.varchar)}`;
          }
        });
      }
    }
  },
  InvoiceFilter: {
    plans: {
      and($where, value) {
        assertAllowed23(value, "list");
        if (value == null) return;
        return $where.andPlan();
      },
      company($where, value) {
        assertAllowed22(value, "object");
        if (value == null) return;
        const $subQuery = $where.existsPlan({
          tableExpression: companyIdentifier,
          alias: resource_companyPgResource.name
        });
        registryConfig.pgRelations.invoice.companyByMyCompanyId.localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = registryConfig.pgRelations.invoice.companyByMyCompanyId.remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
        return $subQuery;
      },
      companyExists($where, value) {
        assertAllowed22(value, "scalar");
        if (value == null) return;
        const $subQuery = $where.existsPlan({
          tableExpression: companyIdentifier,
          alias: resource_companyPgResource.name,
          equals: value
        });
        registryConfig.pgRelations.invoice.companyByMyCompanyId.localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = registryConfig.pgRelations.invoice.companyByMyCompanyId.remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
      },
      companyId(queryBuilder, value) {
        if (value === void 0) return;
        if (!false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const condition = new PgCondition(queryBuilder);
        condition.extensions.pgFilterAttribute = colSpec9;
        return condition;
      },
      contact($where, value) {
        assertAllowed22(value, "object");
        if (value == null) return;
        const $subQuery = $where.existsPlan({
          tableExpression: personIdentifier,
          alias: resource_personPgResource.name
        });
        registryConfig.pgRelations.invoice.personByMyContactId.localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = registryConfig.pgRelations.invoice.personByMyContactId.remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
        return $subQuery;
      },
      contactExists($where, value) {
        assertAllowed22(value, "scalar");
        if (value == null) return;
        const $subQuery = $where.existsPlan({
          tableExpression: personIdentifier,
          alias: resource_personPgResource.name,
          equals: value
        });
        registryConfig.pgRelations.invoice.personByMyContactId.localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = registryConfig.pgRelations.invoice.personByMyContactId.remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
      },
      invoiceLineItems($where, value) {
        assertAllowed21(value, "object");
        const $rel = $where.andPlan();
        $rel.extensions.pgFilterRelation = {
          tableExpression: invoiceLineItemIdentifier,
          alias: resource_invoice_line_itemPgResource.name,
          localAttributes: registryConfig.pgRelations.invoice.invoiceLineItemsByTheirInvoiceId.localAttributes,
          remoteAttributes: registryConfig.pgRelations.invoice.invoiceLineItemsByTheirInvoiceId.remoteAttributes
        };
        return $rel;
      },
      invoiceLineItemsExist($where, value) {
        assertAllowed21(value, "scalar");
        if (value == null) return;
        const $subQuery = $where.existsPlan({
          tableExpression: invoiceLineItemIdentifier,
          alias: resource_invoice_line_itemPgResource.name,
          equals: value
        });
        registryConfig.pgRelations.invoice.invoiceLineItemsByTheirInvoiceId.localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = registryConfig.pgRelations.invoice.invoiceLineItemsByTheirInvoiceId.remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
      },
      invoiceNumber(queryBuilder, value) {
        if (value === void 0) return;
        if (!false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const condition = new PgCondition(queryBuilder);
        condition.extensions.pgFilterAttribute = colSpec8;
        return condition;
      },
      not($where, value) {
        assertAllowed23(value, "object");
        if (value == null) return;
        return $where.notPlan().andPlan();
      },
      or($where, value) {
        assertAllowed23(value, "list");
        if (value == null) return;
        const $or = $where.orPlan();
        return () => $or.andPlan();
      },
      organizationId(queryBuilder, value) {
        if (value === void 0) return;
        if (!false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const condition = new PgCondition(queryBuilder);
        condition.extensions.pgFilterAttribute = colSpec7;
        return condition;
      },
      rowId(queryBuilder, value) {
        if (value === void 0) return;
        if (!false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const condition = new PgCondition(queryBuilder);
        condition.extensions.pgFilterAttribute = colSpec6;
        return condition;
      },
      status(queryBuilder, value) {
        if (value === void 0) return;
        if (!false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const condition = new PgCondition(queryBuilder);
        condition.extensions.pgFilterAttribute = colSpec10;
        return condition;
      }
    }
  },
  InvoiceInput: {
    baked: createObjectAndApplyChildren,
    plans: {
      billTo(obj, val, {
        field,
        schema
      }) {
        obj.set("bill_to", bakedInputRuntime(schema, field.type, val));
      },
      companyId(obj, val, {
        field,
        schema
      }) {
        obj.set("company_id", bakedInputRuntime(schema, field.type, val));
      },
      contactId(obj, val, {
        field,
        schema
      }) {
        obj.set("contact_id", bakedInputRuntime(schema, field.type, val));
      },
      createdAt(obj, val, {
        field,
        schema
      }) {
        obj.set("created_at", bakedInputRuntime(schema, field.type, val));
      },
      currency(obj, val, {
        field,
        schema
      }) {
        obj.set("currency", bakedInputRuntime(schema, field.type, val));
      },
      dueDate(obj, val, {
        field,
        schema
      }) {
        obj.set("due_date", bakedInputRuntime(schema, field.type, val));
      },
      invoiceNumber(obj, val, {
        field,
        schema
      }) {
        obj.set("invoice_number", bakedInputRuntime(schema, field.type, val));
      },
      issueDate(obj, val, {
        field,
        schema
      }) {
        obj.set("issue_date", bakedInputRuntime(schema, field.type, val));
      },
      notes(obj, val, {
        field,
        schema
      }) {
        obj.set("notes", bakedInputRuntime(schema, field.type, val));
      },
      organizationId(obj, val, {
        field,
        schema
      }) {
        obj.set("organization_id", bakedInputRuntime(schema, field.type, val));
      },
      paidAt(obj, val, {
        field,
        schema
      }) {
        obj.set("paid_at", bakedInputRuntime(schema, field.type, val));
      },
      paymentLinkUrl(obj, val, {
        field,
        schema
      }) {
        obj.set("payment_link_url", bakedInputRuntime(schema, field.type, val));
      },
      paymentReference(obj, val, {
        field,
        schema
      }) {
        obj.set("payment_reference", bakedInputRuntime(schema, field.type, val));
      },
      rowId(obj, val, {
        field,
        schema
      }) {
        obj.set("id", bakedInputRuntime(schema, field.type, val));
      },
      status(obj, val, {
        field,
        schema
      }) {
        obj.set("status", bakedInputRuntime(schema, field.type, val));
      },
      subtotal(obj, val, {
        field,
        schema
      }) {
        obj.set("subtotal", bakedInputRuntime(schema, field.type, val));
      },
      taxAmount(obj, val, {
        field,
        schema
      }) {
        obj.set("tax_amount", bakedInputRuntime(schema, field.type, val));
      },
      taxRate(obj, val, {
        field,
        schema
      }) {
        obj.set("tax_rate", bakedInputRuntime(schema, field.type, val));
      },
      total(obj, val, {
        field,
        schema
      }) {
        obj.set("total", bakedInputRuntime(schema, field.type, val));
      },
      updatedAt(obj, val, {
        field,
        schema
      }) {
        obj.set("updated_at", bakedInputRuntime(schema, field.type, val));
      }
    }
  },
  InvoiceLineItemCondition: {
    plans: {
      invoiceId($condition, val) {
        $condition.where({
          type: "attribute",
          attribute: "invoice_id",
          callback(expression) {
            return val === null ? sql`${expression} is null` : sql`${expression} = ${sqlValueWithCodec(val, TYPES.uuid)}`;
          }
        });
      },
      rowId($condition, val) {
        $condition.where({
          type: "attribute",
          attribute: "id",
          callback(expression) {
            return val === null ? sql`${expression} is null` : sql`${expression} = ${sqlValueWithCodec(val, TYPES.uuid)}`;
          }
        });
      }
    }
  },
  InvoiceLineItemFilter: {
    plans: {
      and($where, value) {
        assertAllowed26(value, "list");
        if (value == null) return;
        return $where.andPlan();
      },
      invoice($where, value) {
        assertAllowed25(value, "object");
        if (value == null) return;
        const $subQuery = $where.existsPlan({
          tableExpression: invoiceIdentifier,
          alias: resource_invoicePgResource.name
        });
        registryConfig.pgRelations.invoiceLineItem.invoiceByMyInvoiceId.localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = registryConfig.pgRelations.invoiceLineItem.invoiceByMyInvoiceId.remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
        return $subQuery;
      },
      invoiceId(queryBuilder, value) {
        if (value === void 0) return;
        if (!false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const condition = new PgCondition(queryBuilder);
        condition.extensions.pgFilterAttribute = colSpec12;
        return condition;
      },
      not($where, value) {
        assertAllowed26(value, "object");
        if (value == null) return;
        return $where.notPlan().andPlan();
      },
      or($where, value) {
        assertAllowed26(value, "list");
        if (value == null) return;
        const $or = $where.orPlan();
        return () => $or.andPlan();
      },
      product($where, value) {
        assertAllowed25(value, "object");
        if (value == null) return;
        const $subQuery = $where.existsPlan({
          tableExpression: productIdentifier,
          alias: resource_productPgResource.name
        });
        registryConfig.pgRelations.invoiceLineItem.productByMyProductId.localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = registryConfig.pgRelations.invoiceLineItem.productByMyProductId.remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
        return $subQuery;
      },
      productExists($where, value) {
        assertAllowed25(value, "scalar");
        if (value == null) return;
        const $subQuery = $where.existsPlan({
          tableExpression: productIdentifier,
          alias: resource_productPgResource.name,
          equals: value
        });
        registryConfig.pgRelations.invoiceLineItem.productByMyProductId.localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = registryConfig.pgRelations.invoiceLineItem.productByMyProductId.remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
      },
      rowId(queryBuilder, value) {
        if (value === void 0) return;
        if (!false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const condition = new PgCondition(queryBuilder);
        condition.extensions.pgFilterAttribute = colSpec11;
        return condition;
      }
    }
  },
  InvoiceLineItemInput: {
    baked: createObjectAndApplyChildren,
    plans: {
      amount(obj, val, {
        field,
        schema
      }) {
        obj.set("amount", bakedInputRuntime(schema, field.type, val));
      },
      description(obj, val, {
        field,
        schema
      }) {
        obj.set("description", bakedInputRuntime(schema, field.type, val));
      },
      invoiceId(obj, val, {
        field,
        schema
      }) {
        obj.set("invoice_id", bakedInputRuntime(schema, field.type, val));
      },
      productId(obj, val, {
        field,
        schema
      }) {
        obj.set("product_id", bakedInputRuntime(schema, field.type, val));
      },
      quantity(obj, val, {
        field,
        schema
      }) {
        obj.set("quantity", bakedInputRuntime(schema, field.type, val));
      },
      rowId(obj, val, {
        field,
        schema
      }) {
        obj.set("id", bakedInputRuntime(schema, field.type, val));
      },
      sortOrder(obj, val, {
        field,
        schema
      }) {
        obj.set("sort_order", bakedInputRuntime(schema, field.type, val));
      },
      unitPrice(obj, val, {
        field,
        schema
      }) {
        obj.set("unit_price", bakedInputRuntime(schema, field.type, val));
      }
    }
  },
  InvoiceLineItemPatch: {
    baked: createObjectAndApplyChildren,
    plans: {
      amount(obj, val, {
        field,
        schema
      }) {
        obj.set("amount", bakedInputRuntime(schema, field.type, val));
      },
      description(obj, val, {
        field,
        schema
      }) {
        obj.set("description", bakedInputRuntime(schema, field.type, val));
      },
      invoiceId(obj, val, {
        field,
        schema
      }) {
        obj.set("invoice_id", bakedInputRuntime(schema, field.type, val));
      },
      productId(obj, val, {
        field,
        schema
      }) {
        obj.set("product_id", bakedInputRuntime(schema, field.type, val));
      },
      quantity(obj, val, {
        field,
        schema
      }) {
        obj.set("quantity", bakedInputRuntime(schema, field.type, val));
      },
      rowId(obj, val, {
        field,
        schema
      }) {
        obj.set("id", bakedInputRuntime(schema, field.type, val));
      },
      sortOrder(obj, val, {
        field,
        schema
      }) {
        obj.set("sort_order", bakedInputRuntime(schema, field.type, val));
      },
      unitPrice(obj, val, {
        field,
        schema
      }) {
        obj.set("unit_price", bakedInputRuntime(schema, field.type, val));
      }
    }
  },
  InvoicePatch: {
    baked: createObjectAndApplyChildren,
    plans: {
      billTo(obj, val, {
        field,
        schema
      }) {
        obj.set("bill_to", bakedInputRuntime(schema, field.type, val));
      },
      companyId(obj, val, {
        field,
        schema
      }) {
        obj.set("company_id", bakedInputRuntime(schema, field.type, val));
      },
      contactId(obj, val, {
        field,
        schema
      }) {
        obj.set("contact_id", bakedInputRuntime(schema, field.type, val));
      },
      createdAt(obj, val, {
        field,
        schema
      }) {
        obj.set("created_at", bakedInputRuntime(schema, field.type, val));
      },
      currency(obj, val, {
        field,
        schema
      }) {
        obj.set("currency", bakedInputRuntime(schema, field.type, val));
      },
      dueDate(obj, val, {
        field,
        schema
      }) {
        obj.set("due_date", bakedInputRuntime(schema, field.type, val));
      },
      invoiceNumber(obj, val, {
        field,
        schema
      }) {
        obj.set("invoice_number", bakedInputRuntime(schema, field.type, val));
      },
      issueDate(obj, val, {
        field,
        schema
      }) {
        obj.set("issue_date", bakedInputRuntime(schema, field.type, val));
      },
      notes(obj, val, {
        field,
        schema
      }) {
        obj.set("notes", bakedInputRuntime(schema, field.type, val));
      },
      organizationId(obj, val, {
        field,
        schema
      }) {
        obj.set("organization_id", bakedInputRuntime(schema, field.type, val));
      },
      paidAt(obj, val, {
        field,
        schema
      }) {
        obj.set("paid_at", bakedInputRuntime(schema, field.type, val));
      },
      paymentLinkUrl(obj, val, {
        field,
        schema
      }) {
        obj.set("payment_link_url", bakedInputRuntime(schema, field.type, val));
      },
      paymentReference(obj, val, {
        field,
        schema
      }) {
        obj.set("payment_reference", bakedInputRuntime(schema, field.type, val));
      },
      rowId(obj, val, {
        field,
        schema
      }) {
        obj.set("id", bakedInputRuntime(schema, field.type, val));
      },
      status(obj, val, {
        field,
        schema
      }) {
        obj.set("status", bakedInputRuntime(schema, field.type, val));
      },
      subtotal(obj, val, {
        field,
        schema
      }) {
        obj.set("subtotal", bakedInputRuntime(schema, field.type, val));
      },
      taxAmount(obj, val, {
        field,
        schema
      }) {
        obj.set("tax_amount", bakedInputRuntime(schema, field.type, val));
      },
      taxRate(obj, val, {
        field,
        schema
      }) {
        obj.set("tax_rate", bakedInputRuntime(schema, field.type, val));
      },
      total(obj, val, {
        field,
        schema
      }) {
        obj.set("total", bakedInputRuntime(schema, field.type, val));
      },
      updatedAt(obj, val, {
        field,
        schema
      }) {
        obj.set("updated_at", bakedInputRuntime(schema, field.type, val));
      }
    }
  },
  InvoiceToManyInvoiceLineItemFilter: {
    plans: {
      every($where, value) {
        assertAllowed24(value, "object");
        if (value == null) return;
        if (!$where.extensions.pgFilterRelation) throw Error("Invalid use of filter, 'pgFilterRelation' expected");
        const {
            localAttributes,
            remoteAttributes,
            tableExpression,
            alias
          } = $where.extensions.pgFilterRelation,
          $subQuery = $where.notPlan().existsPlan({
            tableExpression,
            alias
          });
        localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
        return $subQuery.notPlan().andPlan();
      },
      none($where, value) {
        assertAllowed24(value, "object");
        if (value == null) return;
        if (!$where.extensions.pgFilterRelation) throw Error("Invalid use of filter, 'pgFilterRelation' expected");
        const {
            localAttributes,
            remoteAttributes,
            tableExpression,
            alias
          } = $where.extensions.pgFilterRelation,
          $subQuery = $where.notPlan().existsPlan({
            tableExpression,
            alias
          });
        localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
        return $subQuery;
      },
      some($where, value) {
        assertAllowed24(value, "object");
        if (value == null) return;
        if (!$where.extensions.pgFilterRelation) throw Error("Invalid use of filter, 'pgFilterRelation' expected");
        const {
            localAttributes,
            remoteAttributes,
            tableExpression,
            alias
          } = $where.extensions.pgFilterRelation,
          $subQuery = $where.existsPlan({
            tableExpression,
            alias
          });
        localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
        return $subQuery;
      }
    }
  },
  OrganizationSettingCondition: {
    plans: {
      organizationId($condition, val) {
        $condition.where({
          type: "attribute",
          attribute: "organization_id",
          callback(expression) {
            return val === null ? sql`${expression} is null` : sql`${expression} = ${sqlValueWithCodec(val, TYPES.text)}`;
          }
        });
      },
      rowId($condition, val) {
        $condition.where({
          type: "attribute",
          attribute: "id",
          callback(expression) {
            return val === null ? sql`${expression} is null` : sql`${expression} = ${sqlValueWithCodec(val, TYPES.uuid)}`;
          }
        });
      }
    }
  },
  OrganizationSettingFilter: {
    plans: {
      and($where, value) {
        assertAllowed46(value, "list");
        if (value == null) return;
        return $where.andPlan();
      },
      not($where, value) {
        assertAllowed46(value, "object");
        if (value == null) return;
        return $where.notPlan().andPlan();
      },
      or($where, value) {
        assertAllowed46(value, "list");
        if (value == null) return;
        const $or = $where.orPlan();
        return () => $or.andPlan();
      },
      organizationId(queryBuilder, value) {
        if (value === void 0) return;
        if (!false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const condition = new PgCondition(queryBuilder);
        condition.extensions.pgFilterAttribute = colSpec29;
        return condition;
      },
      rowId(queryBuilder, value) {
        if (value === void 0) return;
        if (!false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const condition = new PgCondition(queryBuilder);
        condition.extensions.pgFilterAttribute = colSpec28;
        return condition;
      }
    }
  },
  OrganizationSettingInput: {
    baked: createObjectAndApplyChildren,
    plans: {
      accentColor(obj, val, {
        field,
        schema
      }) {
        obj.set("accent_color", bakedInputRuntime(schema, field.type, val));
      },
      createdAt(obj, val, {
        field,
        schema
      }) {
        obj.set("created_at", bakedInputRuntime(schema, field.type, val));
      },
      organizationId(obj, val, {
        field,
        schema
      }) {
        obj.set("organization_id", bakedInputRuntime(schema, field.type, val));
      },
      rowId(obj, val, {
        field,
        schema
      }) {
        obj.set("id", bakedInputRuntime(schema, field.type, val));
      },
      updatedAt(obj, val, {
        field,
        schema
      }) {
        obj.set("updated_at", bakedInputRuntime(schema, field.type, val));
      }
    }
  },
  OrganizationSettingPatch: {
    baked: createObjectAndApplyChildren,
    plans: {
      accentColor(obj, val, {
        field,
        schema
      }) {
        obj.set("accent_color", bakedInputRuntime(schema, field.type, val));
      },
      createdAt(obj, val, {
        field,
        schema
      }) {
        obj.set("created_at", bakedInputRuntime(schema, field.type, val));
      },
      organizationId(obj, val, {
        field,
        schema
      }) {
        obj.set("organization_id", bakedInputRuntime(schema, field.type, val));
      },
      rowId(obj, val, {
        field,
        schema
      }) {
        obj.set("id", bakedInputRuntime(schema, field.type, val));
      },
      updatedAt(obj, val, {
        field,
        schema
      }) {
        obj.set("updated_at", bakedInputRuntime(schema, field.type, val));
      }
    }
  },
  PersonCondition: {
    plans: {
      organizationId($condition, val) {
        $condition.where({
          type: "attribute",
          attribute: "organization_id",
          callback(expression) {
            return val === null ? sql`${expression} is null` : sql`${expression} = ${sqlValueWithCodec(val, TYPES.text)}`;
          }
        });
      },
      rowId($condition, val) {
        $condition.where({
          type: "attribute",
          attribute: "id",
          callback(expression) {
            return val === null ? sql`${expression} is null` : sql`${expression} = ${sqlValueWithCodec(val, TYPES.uuid)}`;
          }
        });
      }
    }
  },
  PersonFilter: {
    plans: {
      and($where, value) {
        assertAllowed33(value, "list");
        if (value == null) return;
        return $where.andPlan();
      },
      companyMembers($where, value) {
        assertAllowed32(value, "object");
        const $rel = $where.andPlan();
        $rel.extensions.pgFilterRelation = {
          tableExpression: companyMemberIdentifier,
          alias: resource_company_memberPgResource.name,
          localAttributes: registryConfig.pgRelations.person.companyMembersByTheirPersonId.localAttributes,
          remoteAttributes: registryConfig.pgRelations.person.companyMembersByTheirPersonId.remoteAttributes
        };
        return $rel;
      },
      companyMembersExist($where, value) {
        assertAllowed32(value, "scalar");
        if (value == null) return;
        const $subQuery = $where.existsPlan({
          tableExpression: companyMemberIdentifier,
          alias: resource_company_memberPgResource.name,
          equals: value
        });
        registryConfig.pgRelations.person.companyMembersByTheirPersonId.localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = registryConfig.pgRelations.person.companyMembersByTheirPersonId.remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
      },
      emails(queryBuilder, value) {
        if (value === void 0) return;
        if (!false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const condition = new PgCondition(queryBuilder);
        condition.extensions.pgFilterAttribute = colSpec20;
        return condition;
      },
      not($where, value) {
        assertAllowed33(value, "object");
        if (value == null) return;
        return $where.notPlan().andPlan();
      },
      or($where, value) {
        assertAllowed33(value, "list");
        if (value == null) return;
        const $or = $where.orPlan();
        return () => $or.andPlan();
      },
      organizationId(queryBuilder, value) {
        if (value === void 0) return;
        if (!false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const condition = new PgCondition(queryBuilder);
        condition.extensions.pgFilterAttribute = colSpec19;
        return condition;
      },
      rowId(queryBuilder, value) {
        if (value === void 0) return;
        if (!false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const condition = new PgCondition(queryBuilder);
        condition.extensions.pgFilterAttribute = colSpec18;
        return condition;
      }
    }
  },
  PersonInput: {
    baked: createObjectAndApplyChildren,
    plans: {
      avatarUrl(obj, val, {
        field,
        schema
      }) {
        obj.set("avatar_url", bakedInputRuntime(schema, field.type, val));
      },
      createdAt(obj, val, {
        field,
        schema
      }) {
        obj.set("created_at", bakedInputRuntime(schema, field.type, val));
      },
      emails(obj, val, {
        field,
        schema
      }) {
        obj.set("emails", bakedInputRuntime(schema, field.type, val));
      },
      firstName(obj, val, {
        field,
        schema
      }) {
        obj.set("first_name", bakedInputRuntime(schema, field.type, val));
      },
      internal(obj, val, {
        field,
        schema
      }) {
        obj.set("internal", bakedInputRuntime(schema, field.type, val));
      },
      lastName(obj, val, {
        field,
        schema
      }) {
        obj.set("last_name", bakedInputRuntime(schema, field.type, val));
      },
      notes(obj, val, {
        field,
        schema
      }) {
        obj.set("notes", bakedInputRuntime(schema, field.type, val));
      },
      organizationId(obj, val, {
        field,
        schema
      }) {
        obj.set("organization_id", bakedInputRuntime(schema, field.type, val));
      },
      phone(obj, val, {
        field,
        schema
      }) {
        obj.set("phone", bakedInputRuntime(schema, field.type, val));
      },
      rowId(obj, val, {
        field,
        schema
      }) {
        obj.set("id", bakedInputRuntime(schema, field.type, val));
      },
      tags(obj, val, {
        field,
        schema
      }) {
        obj.set("tags", bakedInputRuntime(schema, field.type, val));
      },
      updatedAt(obj, val, {
        field,
        schema
      }) {
        obj.set("updated_at", bakedInputRuntime(schema, field.type, val));
      }
    }
  },
  PersonPatch: {
    baked: createObjectAndApplyChildren,
    plans: {
      avatarUrl(obj, val, {
        field,
        schema
      }) {
        obj.set("avatar_url", bakedInputRuntime(schema, field.type, val));
      },
      createdAt(obj, val, {
        field,
        schema
      }) {
        obj.set("created_at", bakedInputRuntime(schema, field.type, val));
      },
      emails(obj, val, {
        field,
        schema
      }) {
        obj.set("emails", bakedInputRuntime(schema, field.type, val));
      },
      firstName(obj, val, {
        field,
        schema
      }) {
        obj.set("first_name", bakedInputRuntime(schema, field.type, val));
      },
      internal(obj, val, {
        field,
        schema
      }) {
        obj.set("internal", bakedInputRuntime(schema, field.type, val));
      },
      lastName(obj, val, {
        field,
        schema
      }) {
        obj.set("last_name", bakedInputRuntime(schema, field.type, val));
      },
      notes(obj, val, {
        field,
        schema
      }) {
        obj.set("notes", bakedInputRuntime(schema, field.type, val));
      },
      organizationId(obj, val, {
        field,
        schema
      }) {
        obj.set("organization_id", bakedInputRuntime(schema, field.type, val));
      },
      phone(obj, val, {
        field,
        schema
      }) {
        obj.set("phone", bakedInputRuntime(schema, field.type, val));
      },
      rowId(obj, val, {
        field,
        schema
      }) {
        obj.set("id", bakedInputRuntime(schema, field.type, val));
      },
      tags(obj, val, {
        field,
        schema
      }) {
        obj.set("tags", bakedInputRuntime(schema, field.type, val));
      },
      updatedAt(obj, val, {
        field,
        schema
      }) {
        obj.set("updated_at", bakedInputRuntime(schema, field.type, val));
      }
    }
  },
  PersonToManyCompanyMemberFilter: {
    plans: {
      every($where, value) {
        assertAllowed34(value, "object");
        if (value == null) return;
        if (!$where.extensions.pgFilterRelation) throw Error("Invalid use of filter, 'pgFilterRelation' expected");
        const {
            localAttributes,
            remoteAttributes,
            tableExpression,
            alias
          } = $where.extensions.pgFilterRelation,
          $subQuery = $where.notPlan().existsPlan({
            tableExpression,
            alias
          });
        localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
        return $subQuery.notPlan().andPlan();
      },
      none($where, value) {
        assertAllowed34(value, "object");
        if (value == null) return;
        if (!$where.extensions.pgFilterRelation) throw Error("Invalid use of filter, 'pgFilterRelation' expected");
        const {
            localAttributes,
            remoteAttributes,
            tableExpression,
            alias
          } = $where.extensions.pgFilterRelation,
          $subQuery = $where.notPlan().existsPlan({
            tableExpression,
            alias
          });
        localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
        return $subQuery;
      },
      some($where, value) {
        assertAllowed34(value, "object");
        if (value == null) return;
        if (!$where.extensions.pgFilterRelation) throw Error("Invalid use of filter, 'pgFilterRelation' expected");
        const {
            localAttributes,
            remoteAttributes,
            tableExpression,
            alias
          } = $where.extensions.pgFilterRelation,
          $subQuery = $where.existsPlan({
            tableExpression,
            alias
          });
        localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
        return $subQuery;
      }
    }
  },
  ProductCondition: {
    plans: {
      organizationId($condition, val) {
        $condition.where({
          type: "attribute",
          attribute: "organization_id",
          callback(expression) {
            return val === null ? sql`${expression} is null` : sql`${expression} = ${sqlValueWithCodec(val, TYPES.text)}`;
          }
        });
      },
      rowId($condition, val) {
        $condition.where({
          type: "attribute",
          attribute: "id",
          callback(expression) {
            return val === null ? sql`${expression} is null` : sql`${expression} = ${sqlValueWithCodec(val, TYPES.uuid)}`;
          }
        });
      },
      sku($condition, val) {
        $condition.where({
          type: "attribute",
          attribute: "sku",
          callback(expression) {
            return val === null ? sql`${expression} is null` : sql`${expression} = ${sqlValueWithCodec(val, TYPES.text)}`;
          }
        });
      }
    }
  },
  ProductFilter: {
    plans: {
      and($where, value) {
        assertAllowed28(value, "list");
        if (value == null) return;
        return $where.andPlan();
      },
      inventoryAdjustments($where, value) {
        assertAllowed27(value, "object");
        const $rel = $where.andPlan();
        $rel.extensions.pgFilterRelation = {
          tableExpression: inventoryAdjustmentIdentifier,
          alias: resource_inventory_adjustmentPgResource.name,
          localAttributes: registryConfig.pgRelations.product.inventoryAdjustmentsByTheirProductId.localAttributes,
          remoteAttributes: registryConfig.pgRelations.product.inventoryAdjustmentsByTheirProductId.remoteAttributes
        };
        return $rel;
      },
      inventoryAdjustmentsExist($where, value) {
        assertAllowed27(value, "scalar");
        if (value == null) return;
        const $subQuery = $where.existsPlan({
          tableExpression: inventoryAdjustmentIdentifier,
          alias: resource_inventory_adjustmentPgResource.name,
          equals: value
        });
        registryConfig.pgRelations.product.inventoryAdjustmentsByTheirProductId.localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = registryConfig.pgRelations.product.inventoryAdjustmentsByTheirProductId.remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
      },
      not($where, value) {
        assertAllowed28(value, "object");
        if (value == null) return;
        return $where.notPlan().andPlan();
      },
      or($where, value) {
        assertAllowed28(value, "list");
        if (value == null) return;
        const $or = $where.orPlan();
        return () => $or.andPlan();
      },
      organizationId(queryBuilder, value) {
        if (value === void 0) return;
        if (!false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const condition = new PgCondition(queryBuilder);
        condition.extensions.pgFilterAttribute = colSpec14;
        return condition;
      },
      rowId(queryBuilder, value) {
        if (value === void 0) return;
        if (!false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const condition = new PgCondition(queryBuilder);
        condition.extensions.pgFilterAttribute = colSpec13;
        return condition;
      },
      sku(queryBuilder, value) {
        if (value === void 0) return;
        if (!false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const condition = new PgCondition(queryBuilder);
        condition.extensions.pgFilterAttribute = colSpec15;
        return condition;
      }
    }
  },
  ProductInput: {
    baked: createObjectAndApplyChildren,
    plans: {
      createdAt(obj, val, {
        field,
        schema
      }) {
        obj.set("created_at", bakedInputRuntime(schema, field.type, val));
      },
      currentQuantity(obj, val, {
        field,
        schema
      }) {
        obj.set("current_quantity", bakedInputRuntime(schema, field.type, val));
      },
      description(obj, val, {
        field,
        schema
      }) {
        obj.set("description", bakedInputRuntime(schema, field.type, val));
      },
      isActive(obj, val, {
        field,
        schema
      }) {
        obj.set("is_active", bakedInputRuntime(schema, field.type, val));
      },
      lowStockThreshold(obj, val, {
        field,
        schema
      }) {
        obj.set("low_stock_threshold", bakedInputRuntime(schema, field.type, val));
      },
      name(obj, val, {
        field,
        schema
      }) {
        obj.set("name", bakedInputRuntime(schema, field.type, val));
      },
      organizationId(obj, val, {
        field,
        schema
      }) {
        obj.set("organization_id", bakedInputRuntime(schema, field.type, val));
      },
      rowId(obj, val, {
        field,
        schema
      }) {
        obj.set("id", bakedInputRuntime(schema, field.type, val));
      },
      sku(obj, val, {
        field,
        schema
      }) {
        obj.set("sku", bakedInputRuntime(schema, field.type, val));
      },
      unitPrice(obj, val, {
        field,
        schema
      }) {
        obj.set("unit_price", bakedInputRuntime(schema, field.type, val));
      },
      updatedAt(obj, val, {
        field,
        schema
      }) {
        obj.set("updated_at", bakedInputRuntime(schema, field.type, val));
      }
    }
  },
  ProductPatch: {
    baked: createObjectAndApplyChildren,
    plans: {
      createdAt(obj, val, {
        field,
        schema
      }) {
        obj.set("created_at", bakedInputRuntime(schema, field.type, val));
      },
      currentQuantity(obj, val, {
        field,
        schema
      }) {
        obj.set("current_quantity", bakedInputRuntime(schema, field.type, val));
      },
      description(obj, val, {
        field,
        schema
      }) {
        obj.set("description", bakedInputRuntime(schema, field.type, val));
      },
      isActive(obj, val, {
        field,
        schema
      }) {
        obj.set("is_active", bakedInputRuntime(schema, field.type, val));
      },
      lowStockThreshold(obj, val, {
        field,
        schema
      }) {
        obj.set("low_stock_threshold", bakedInputRuntime(schema, field.type, val));
      },
      name(obj, val, {
        field,
        schema
      }) {
        obj.set("name", bakedInputRuntime(schema, field.type, val));
      },
      organizationId(obj, val, {
        field,
        schema
      }) {
        obj.set("organization_id", bakedInputRuntime(schema, field.type, val));
      },
      rowId(obj, val, {
        field,
        schema
      }) {
        obj.set("id", bakedInputRuntime(schema, field.type, val));
      },
      sku(obj, val, {
        field,
        schema
      }) {
        obj.set("sku", bakedInputRuntime(schema, field.type, val));
      },
      unitPrice(obj, val, {
        field,
        schema
      }) {
        obj.set("unit_price", bakedInputRuntime(schema, field.type, val));
      },
      updatedAt(obj, val, {
        field,
        schema
      }) {
        obj.set("updated_at", bakedInputRuntime(schema, field.type, val));
      }
    }
  },
  ProductToManyInventoryAdjustmentFilter: {
    plans: {
      every($where, value) {
        assertAllowed29(value, "object");
        if (value == null) return;
        if (!$where.extensions.pgFilterRelation) throw Error("Invalid use of filter, 'pgFilterRelation' expected");
        const {
            localAttributes,
            remoteAttributes,
            tableExpression,
            alias
          } = $where.extensions.pgFilterRelation,
          $subQuery = $where.notPlan().existsPlan({
            tableExpression,
            alias
          });
        localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
        return $subQuery.notPlan().andPlan();
      },
      none($where, value) {
        assertAllowed29(value, "object");
        if (value == null) return;
        if (!$where.extensions.pgFilterRelation) throw Error("Invalid use of filter, 'pgFilterRelation' expected");
        const {
            localAttributes,
            remoteAttributes,
            tableExpression,
            alias
          } = $where.extensions.pgFilterRelation,
          $subQuery = $where.notPlan().existsPlan({
            tableExpression,
            alias
          });
        localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
        return $subQuery;
      },
      some($where, value) {
        assertAllowed29(value, "object");
        if (value == null) return;
        if (!$where.extensions.pgFilterRelation) throw Error("Invalid use of filter, 'pgFilterRelation' expected");
        const {
            localAttributes,
            remoteAttributes,
            tableExpression,
            alias
          } = $where.extensions.pgFilterRelation,
          $subQuery = $where.existsPlan({
            tableExpression,
            alias
          });
        localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
        return $subQuery;
      }
    }
  },
  QuoteCondition: {
    plans: {
      companyId($condition, val) {
        $condition.where({
          type: "attribute",
          attribute: "company_id",
          callback(expression) {
            return val === null ? sql`${expression} is null` : sql`${expression} = ${sqlValueWithCodec(val, TYPES.uuid)}`;
          }
        });
      },
      organizationId($condition, val) {
        $condition.where({
          type: "attribute",
          attribute: "organization_id",
          callback(expression) {
            return val === null ? sql`${expression} is null` : sql`${expression} = ${sqlValueWithCodec(val, TYPES.text)}`;
          }
        });
      },
      quoteNumber($condition, val) {
        $condition.where({
          type: "attribute",
          attribute: "quote_number",
          callback(expression) {
            return val === null ? sql`${expression} is null` : sql`${expression} = ${sqlValueWithCodec(val, TYPES.text)}`;
          }
        });
      },
      rowId($condition, val) {
        $condition.where({
          type: "attribute",
          attribute: "id",
          callback(expression) {
            return val === null ? sql`${expression} is null` : sql`${expression} = ${sqlValueWithCodec(val, TYPES.uuid)}`;
          }
        });
      },
      status($condition, val) {
        $condition.where({
          type: "attribute",
          attribute: "status",
          callback(expression) {
            return val === null ? sql`${expression} is null` : sql`${expression} = ${sqlValueWithCodec(val, TYPES.varchar)}`;
          }
        });
      }
    }
  },
  QuoteFilter: {
    plans: {
      and($where, value) {
        assertAllowed38(value, "list");
        if (value == null) return;
        return $where.andPlan();
      },
      company($where, value) {
        assertAllowed37(value, "object");
        if (value == null) return;
        const $subQuery = $where.existsPlan({
          tableExpression: companyIdentifier,
          alias: resource_companyPgResource.name
        });
        registryConfig.pgRelations.quote.companyByMyCompanyId.localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = registryConfig.pgRelations.quote.companyByMyCompanyId.remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
        return $subQuery;
      },
      companyExists($where, value) {
        assertAllowed37(value, "scalar");
        if (value == null) return;
        const $subQuery = $where.existsPlan({
          tableExpression: companyIdentifier,
          alias: resource_companyPgResource.name,
          equals: value
        });
        registryConfig.pgRelations.quote.companyByMyCompanyId.localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = registryConfig.pgRelations.quote.companyByMyCompanyId.remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
      },
      companyId(queryBuilder, value) {
        if (value === void 0) return;
        if (!false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const condition = new PgCondition(queryBuilder);
        condition.extensions.pgFilterAttribute = colSpec24;
        return condition;
      },
      contact($where, value) {
        assertAllowed37(value, "object");
        if (value == null) return;
        const $subQuery = $where.existsPlan({
          tableExpression: personIdentifier,
          alias: resource_personPgResource.name
        });
        registryConfig.pgRelations.quote.personByMyContactId.localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = registryConfig.pgRelations.quote.personByMyContactId.remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
        return $subQuery;
      },
      contactExists($where, value) {
        assertAllowed37(value, "scalar");
        if (value == null) return;
        const $subQuery = $where.existsPlan({
          tableExpression: personIdentifier,
          alias: resource_personPgResource.name,
          equals: value
        });
        registryConfig.pgRelations.quote.personByMyContactId.localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = registryConfig.pgRelations.quote.personByMyContactId.remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
      },
      convertedInvoice($where, value) {
        assertAllowed37(value, "object");
        if (value == null) return;
        const $subQuery = $where.existsPlan({
          tableExpression: invoiceIdentifier,
          alias: resource_invoicePgResource.name
        });
        registryConfig.pgRelations.quote.invoiceByMyConvertedInvoiceId.localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = registryConfig.pgRelations.quote.invoiceByMyConvertedInvoiceId.remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
        return $subQuery;
      },
      convertedInvoiceExists($where, value) {
        assertAllowed37(value, "scalar");
        if (value == null) return;
        const $subQuery = $where.existsPlan({
          tableExpression: invoiceIdentifier,
          alias: resource_invoicePgResource.name,
          equals: value
        });
        registryConfig.pgRelations.quote.invoiceByMyConvertedInvoiceId.localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = registryConfig.pgRelations.quote.invoiceByMyConvertedInvoiceId.remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
      },
      not($where, value) {
        assertAllowed38(value, "object");
        if (value == null) return;
        return $where.notPlan().andPlan();
      },
      or($where, value) {
        assertAllowed38(value, "list");
        if (value == null) return;
        const $or = $where.orPlan();
        return () => $or.andPlan();
      },
      organizationId(queryBuilder, value) {
        if (value === void 0) return;
        if (!false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const condition = new PgCondition(queryBuilder);
        condition.extensions.pgFilterAttribute = colSpec22;
        return condition;
      },
      quoteLineItems($where, value) {
        assertAllowed36(value, "object");
        const $rel = $where.andPlan();
        $rel.extensions.pgFilterRelation = {
          tableExpression: quoteLineItemIdentifier,
          alias: resource_quote_line_itemPgResource.name,
          localAttributes: registryConfig.pgRelations.quote.quoteLineItemsByTheirQuoteId.localAttributes,
          remoteAttributes: registryConfig.pgRelations.quote.quoteLineItemsByTheirQuoteId.remoteAttributes
        };
        return $rel;
      },
      quoteLineItemsExist($where, value) {
        assertAllowed36(value, "scalar");
        if (value == null) return;
        const $subQuery = $where.existsPlan({
          tableExpression: quoteLineItemIdentifier,
          alias: resource_quote_line_itemPgResource.name,
          equals: value
        });
        registryConfig.pgRelations.quote.quoteLineItemsByTheirQuoteId.localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = registryConfig.pgRelations.quote.quoteLineItemsByTheirQuoteId.remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
      },
      quoteNumber(queryBuilder, value) {
        if (value === void 0) return;
        if (!false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const condition = new PgCondition(queryBuilder);
        condition.extensions.pgFilterAttribute = colSpec23;
        return condition;
      },
      rowId(queryBuilder, value) {
        if (value === void 0) return;
        if (!false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const condition = new PgCondition(queryBuilder);
        condition.extensions.pgFilterAttribute = colSpec21;
        return condition;
      },
      status(queryBuilder, value) {
        if (value === void 0) return;
        if (!false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const condition = new PgCondition(queryBuilder);
        condition.extensions.pgFilterAttribute = colSpec25;
        return condition;
      }
    }
  },
  QuoteInput: {
    baked: createObjectAndApplyChildren,
    plans: {
      additionalItemsLabel(obj, val, {
        field,
        schema
      }) {
        obj.set("additional_items_label", bakedInputRuntime(schema, field.type, val));
      },
      additionalTerms(obj, val, {
        field,
        schema
      }) {
        obj.set("additional_terms", bakedInputRuntime(schema, field.type, val));
      },
      clientEmail(obj, val, {
        field,
        schema
      }) {
        obj.set("client_email", bakedInputRuntime(schema, field.type, val));
      },
      clientName(obj, val, {
        field,
        schema
      }) {
        obj.set("client_name", bakedInputRuntime(schema, field.type, val));
      },
      companyId(obj, val, {
        field,
        schema
      }) {
        obj.set("company_id", bakedInputRuntime(schema, field.type, val));
      },
      contactId(obj, val, {
        field,
        schema
      }) {
        obj.set("contact_id", bakedInputRuntime(schema, field.type, val));
      },
      convertedInvoiceId(obj, val, {
        field,
        schema
      }) {
        obj.set("converted_invoice_id", bakedInputRuntime(schema, field.type, val));
      },
      createdAt(obj, val, {
        field,
        schema
      }) {
        obj.set("created_at", bakedInputRuntime(schema, field.type, val));
      },
      currency(obj, val, {
        field,
        schema
      }) {
        obj.set("currency", bakedInputRuntime(schema, field.type, val));
      },
      description(obj, val, {
        field,
        schema
      }) {
        obj.set("description", bakedInputRuntime(schema, field.type, val));
      },
      notes(obj, val, {
        field,
        schema
      }) {
        obj.set("notes", bakedInputRuntime(schema, field.type, val));
      },
      organizationId(obj, val, {
        field,
        schema
      }) {
        obj.set("organization_id", bakedInputRuntime(schema, field.type, val));
      },
      projectType(obj, val, {
        field,
        schema
      }) {
        obj.set("project_type", bakedInputRuntime(schema, field.type, val));
      },
      quoteNumber(obj, val, {
        field,
        schema
      }) {
        obj.set("quote_number", bakedInputRuntime(schema, field.type, val));
      },
      rowId(obj, val, {
        field,
        schema
      }) {
        obj.set("id", bakedInputRuntime(schema, field.type, val));
      },
      status(obj, val, {
        field,
        schema
      }) {
        obj.set("status", bakedInputRuntime(schema, field.type, val));
      },
      subtotal(obj, val, {
        field,
        schema
      }) {
        obj.set("subtotal", bakedInputRuntime(schema, field.type, val));
      },
      taxAmount(obj, val, {
        field,
        schema
      }) {
        obj.set("tax_amount", bakedInputRuntime(schema, field.type, val));
      },
      taxRate(obj, val, {
        field,
        schema
      }) {
        obj.set("tax_rate", bakedInputRuntime(schema, field.type, val));
      },
      terms(obj, val, {
        field,
        schema
      }) {
        obj.set("terms", bakedInputRuntime(schema, field.type, val));
      },
      timeRange(obj, val, {
        field,
        schema
      }) {
        obj.set("time_range", bakedInputRuntime(schema, field.type, val));
      },
      title(obj, val, {
        field,
        schema
      }) {
        obj.set("title", bakedInputRuntime(schema, field.type, val));
      },
      total(obj, val, {
        field,
        schema
      }) {
        obj.set("total", bakedInputRuntime(schema, field.type, val));
      },
      updatedAt(obj, val, {
        field,
        schema
      }) {
        obj.set("updated_at", bakedInputRuntime(schema, field.type, val));
      },
      validUntil(obj, val, {
        field,
        schema
      }) {
        obj.set("valid_until", bakedInputRuntime(schema, field.type, val));
      }
    }
  },
  QuoteLineItemCondition: {
    plans: {
      quoteId($condition, val) {
        $condition.where({
          type: "attribute",
          attribute: "quote_id",
          callback(expression) {
            return val === null ? sql`${expression} is null` : sql`${expression} = ${sqlValueWithCodec(val, TYPES.uuid)}`;
          }
        });
      },
      rowId($condition, val) {
        $condition.where({
          type: "attribute",
          attribute: "id",
          callback(expression) {
            return val === null ? sql`${expression} is null` : sql`${expression} = ${sqlValueWithCodec(val, TYPES.uuid)}`;
          }
        });
      }
    }
  },
  QuoteLineItemFilter: {
    plans: {
      and($where, value) {
        assertAllowed41(value, "list");
        if (value == null) return;
        return $where.andPlan();
      },
      not($where, value) {
        assertAllowed41(value, "object");
        if (value == null) return;
        return $where.notPlan().andPlan();
      },
      or($where, value) {
        assertAllowed41(value, "list");
        if (value == null) return;
        const $or = $where.orPlan();
        return () => $or.andPlan();
      },
      product($where, value) {
        assertAllowed40(value, "object");
        if (value == null) return;
        const $subQuery = $where.existsPlan({
          tableExpression: productIdentifier,
          alias: resource_productPgResource.name
        });
        registryConfig.pgRelations.quoteLineItem.productByMyProductId.localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = registryConfig.pgRelations.quoteLineItem.productByMyProductId.remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
        return $subQuery;
      },
      productExists($where, value) {
        assertAllowed40(value, "scalar");
        if (value == null) return;
        const $subQuery = $where.existsPlan({
          tableExpression: productIdentifier,
          alias: resource_productPgResource.name,
          equals: value
        });
        registryConfig.pgRelations.quoteLineItem.productByMyProductId.localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = registryConfig.pgRelations.quoteLineItem.productByMyProductId.remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
      },
      quote($where, value) {
        assertAllowed40(value, "object");
        if (value == null) return;
        const $subQuery = $where.existsPlan({
          tableExpression: quoteIdentifier,
          alias: resource_quotePgResource.name
        });
        registryConfig.pgRelations.quoteLineItem.quoteByMyQuoteId.localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = registryConfig.pgRelations.quoteLineItem.quoteByMyQuoteId.remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
        return $subQuery;
      },
      quoteId(queryBuilder, value) {
        if (value === void 0) return;
        if (!false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const condition = new PgCondition(queryBuilder);
        condition.extensions.pgFilterAttribute = colSpec27;
        return condition;
      },
      rowId(queryBuilder, value) {
        if (value === void 0) return;
        if (!false && isEmpty(value)) throw Object.assign(Error("Empty objects are forbidden in filter argument input."), {});
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const condition = new PgCondition(queryBuilder);
        condition.extensions.pgFilterAttribute = colSpec26;
        return condition;
      }
    }
  },
  QuoteLineItemInput: {
    baked: createObjectAndApplyChildren,
    plans: {
      amount(obj, val, {
        field,
        schema
      }) {
        obj.set("amount", bakedInputRuntime(schema, field.type, val));
      },
      description(obj, val, {
        field,
        schema
      }) {
        obj.set("description", bakedInputRuntime(schema, field.type, val));
      },
      estimatedHours(obj, val, {
        field,
        schema
      }) {
        obj.set("estimated_hours", bakedInputRuntime(schema, field.type, val));
      },
      hourlyRate(obj, val, {
        field,
        schema
      }) {
        obj.set("hourly_rate", bakedInputRuntime(schema, field.type, val));
      },
      maxCapHours(obj, val, {
        field,
        schema
      }) {
        obj.set("max_cap_hours", bakedInputRuntime(schema, field.type, val));
      },
      minimumBillingMinutes(obj, val, {
        field,
        schema
      }) {
        obj.set("minimum_billing_minutes", bakedInputRuntime(schema, field.type, val));
      },
      monthlyCapHours(obj, val, {
        field,
        schema
      }) {
        obj.set("monthly_cap_hours", bakedInputRuntime(schema, field.type, val));
      },
      pricingType(obj, val, {
        field,
        schema
      }) {
        obj.set("pricing_type", bakedInputRuntime(schema, field.type, val));
      },
      productId(obj, val, {
        field,
        schema
      }) {
        obj.set("product_id", bakedInputRuntime(schema, field.type, val));
      },
      quantity(obj, val, {
        field,
        schema
      }) {
        obj.set("quantity", bakedInputRuntime(schema, field.type, val));
      },
      quoteId(obj, val, {
        field,
        schema
      }) {
        obj.set("quote_id", bakedInputRuntime(schema, field.type, val));
      },
      rowId(obj, val, {
        field,
        schema
      }) {
        obj.set("id", bakedInputRuntime(schema, field.type, val));
      },
      royaltyBuyoutAmount(obj, val, {
        field,
        schema
      }) {
        obj.set("royalty_buyout_amount", bakedInputRuntime(schema, field.type, val));
      },
      royaltyPercentage(obj, val, {
        field,
        schema
      }) {
        obj.set("royalty_percentage", bakedInputRuntime(schema, field.type, val));
      },
      royaltyThreshold(obj, val, {
        field,
        schema
      }) {
        obj.set("royalty_threshold", bakedInputRuntime(schema, field.type, val));
      },
      royaltyTimeframe(obj, val, {
        field,
        schema
      }) {
        obj.set("royalty_timeframe", bakedInputRuntime(schema, field.type, val));
      },
      royaltyTimeframeUnit(obj, val, {
        field,
        schema
      }) {
        obj.set("royalty_timeframe_unit", bakedInputRuntime(schema, field.type, val));
      },
      sortOrder(obj, val, {
        field,
        schema
      }) {
        obj.set("sort_order", bakedInputRuntime(schema, field.type, val));
      },
      subtitle(obj, val, {
        field,
        schema
      }) {
        obj.set("subtitle", bakedInputRuntime(schema, field.type, val));
      },
      unitPrice(obj, val, {
        field,
        schema
      }) {
        obj.set("unit_price", bakedInputRuntime(schema, field.type, val));
      },
      weeklyCapHours(obj, val, {
        field,
        schema
      }) {
        obj.set("weekly_cap_hours", bakedInputRuntime(schema, field.type, val));
      }
    }
  },
  QuoteLineItemPatch: {
    baked: createObjectAndApplyChildren,
    plans: {
      amount(obj, val, {
        field,
        schema
      }) {
        obj.set("amount", bakedInputRuntime(schema, field.type, val));
      },
      description(obj, val, {
        field,
        schema
      }) {
        obj.set("description", bakedInputRuntime(schema, field.type, val));
      },
      estimatedHours(obj, val, {
        field,
        schema
      }) {
        obj.set("estimated_hours", bakedInputRuntime(schema, field.type, val));
      },
      hourlyRate(obj, val, {
        field,
        schema
      }) {
        obj.set("hourly_rate", bakedInputRuntime(schema, field.type, val));
      },
      maxCapHours(obj, val, {
        field,
        schema
      }) {
        obj.set("max_cap_hours", bakedInputRuntime(schema, field.type, val));
      },
      minimumBillingMinutes(obj, val, {
        field,
        schema
      }) {
        obj.set("minimum_billing_minutes", bakedInputRuntime(schema, field.type, val));
      },
      monthlyCapHours(obj, val, {
        field,
        schema
      }) {
        obj.set("monthly_cap_hours", bakedInputRuntime(schema, field.type, val));
      },
      pricingType(obj, val, {
        field,
        schema
      }) {
        obj.set("pricing_type", bakedInputRuntime(schema, field.type, val));
      },
      productId(obj, val, {
        field,
        schema
      }) {
        obj.set("product_id", bakedInputRuntime(schema, field.type, val));
      },
      quantity(obj, val, {
        field,
        schema
      }) {
        obj.set("quantity", bakedInputRuntime(schema, field.type, val));
      },
      quoteId(obj, val, {
        field,
        schema
      }) {
        obj.set("quote_id", bakedInputRuntime(schema, field.type, val));
      },
      rowId(obj, val, {
        field,
        schema
      }) {
        obj.set("id", bakedInputRuntime(schema, field.type, val));
      },
      royaltyBuyoutAmount(obj, val, {
        field,
        schema
      }) {
        obj.set("royalty_buyout_amount", bakedInputRuntime(schema, field.type, val));
      },
      royaltyPercentage(obj, val, {
        field,
        schema
      }) {
        obj.set("royalty_percentage", bakedInputRuntime(schema, field.type, val));
      },
      royaltyThreshold(obj, val, {
        field,
        schema
      }) {
        obj.set("royalty_threshold", bakedInputRuntime(schema, field.type, val));
      },
      royaltyTimeframe(obj, val, {
        field,
        schema
      }) {
        obj.set("royalty_timeframe", bakedInputRuntime(schema, field.type, val));
      },
      royaltyTimeframeUnit(obj, val, {
        field,
        schema
      }) {
        obj.set("royalty_timeframe_unit", bakedInputRuntime(schema, field.type, val));
      },
      sortOrder(obj, val, {
        field,
        schema
      }) {
        obj.set("sort_order", bakedInputRuntime(schema, field.type, val));
      },
      subtitle(obj, val, {
        field,
        schema
      }) {
        obj.set("subtitle", bakedInputRuntime(schema, field.type, val));
      },
      unitPrice(obj, val, {
        field,
        schema
      }) {
        obj.set("unit_price", bakedInputRuntime(schema, field.type, val));
      },
      weeklyCapHours(obj, val, {
        field,
        schema
      }) {
        obj.set("weekly_cap_hours", bakedInputRuntime(schema, field.type, val));
      }
    }
  },
  QuotePatch: {
    baked: createObjectAndApplyChildren,
    plans: {
      additionalItemsLabel(obj, val, {
        field,
        schema
      }) {
        obj.set("additional_items_label", bakedInputRuntime(schema, field.type, val));
      },
      additionalTerms(obj, val, {
        field,
        schema
      }) {
        obj.set("additional_terms", bakedInputRuntime(schema, field.type, val));
      },
      clientEmail(obj, val, {
        field,
        schema
      }) {
        obj.set("client_email", bakedInputRuntime(schema, field.type, val));
      },
      clientName(obj, val, {
        field,
        schema
      }) {
        obj.set("client_name", bakedInputRuntime(schema, field.type, val));
      },
      companyId(obj, val, {
        field,
        schema
      }) {
        obj.set("company_id", bakedInputRuntime(schema, field.type, val));
      },
      contactId(obj, val, {
        field,
        schema
      }) {
        obj.set("contact_id", bakedInputRuntime(schema, field.type, val));
      },
      convertedInvoiceId(obj, val, {
        field,
        schema
      }) {
        obj.set("converted_invoice_id", bakedInputRuntime(schema, field.type, val));
      },
      createdAt(obj, val, {
        field,
        schema
      }) {
        obj.set("created_at", bakedInputRuntime(schema, field.type, val));
      },
      currency(obj, val, {
        field,
        schema
      }) {
        obj.set("currency", bakedInputRuntime(schema, field.type, val));
      },
      description(obj, val, {
        field,
        schema
      }) {
        obj.set("description", bakedInputRuntime(schema, field.type, val));
      },
      notes(obj, val, {
        field,
        schema
      }) {
        obj.set("notes", bakedInputRuntime(schema, field.type, val));
      },
      organizationId(obj, val, {
        field,
        schema
      }) {
        obj.set("organization_id", bakedInputRuntime(schema, field.type, val));
      },
      projectType(obj, val, {
        field,
        schema
      }) {
        obj.set("project_type", bakedInputRuntime(schema, field.type, val));
      },
      quoteNumber(obj, val, {
        field,
        schema
      }) {
        obj.set("quote_number", bakedInputRuntime(schema, field.type, val));
      },
      rowId(obj, val, {
        field,
        schema
      }) {
        obj.set("id", bakedInputRuntime(schema, field.type, val));
      },
      status(obj, val, {
        field,
        schema
      }) {
        obj.set("status", bakedInputRuntime(schema, field.type, val));
      },
      subtotal(obj, val, {
        field,
        schema
      }) {
        obj.set("subtotal", bakedInputRuntime(schema, field.type, val));
      },
      taxAmount(obj, val, {
        field,
        schema
      }) {
        obj.set("tax_amount", bakedInputRuntime(schema, field.type, val));
      },
      taxRate(obj, val, {
        field,
        schema
      }) {
        obj.set("tax_rate", bakedInputRuntime(schema, field.type, val));
      },
      terms(obj, val, {
        field,
        schema
      }) {
        obj.set("terms", bakedInputRuntime(schema, field.type, val));
      },
      timeRange(obj, val, {
        field,
        schema
      }) {
        obj.set("time_range", bakedInputRuntime(schema, field.type, val));
      },
      title(obj, val, {
        field,
        schema
      }) {
        obj.set("title", bakedInputRuntime(schema, field.type, val));
      },
      total(obj, val, {
        field,
        schema
      }) {
        obj.set("total", bakedInputRuntime(schema, field.type, val));
      },
      updatedAt(obj, val, {
        field,
        schema
      }) {
        obj.set("updated_at", bakedInputRuntime(schema, field.type, val));
      },
      validUntil(obj, val, {
        field,
        schema
      }) {
        obj.set("valid_until", bakedInputRuntime(schema, field.type, val));
      }
    }
  },
  QuoteToManyQuoteLineItemFilter: {
    plans: {
      every($where, value) {
        assertAllowed39(value, "object");
        if (value == null) return;
        if (!$where.extensions.pgFilterRelation) throw Error("Invalid use of filter, 'pgFilterRelation' expected");
        const {
            localAttributes,
            remoteAttributes,
            tableExpression,
            alias
          } = $where.extensions.pgFilterRelation,
          $subQuery = $where.notPlan().existsPlan({
            tableExpression,
            alias
          });
        localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
        return $subQuery.notPlan().andPlan();
      },
      none($where, value) {
        assertAllowed39(value, "object");
        if (value == null) return;
        if (!$where.extensions.pgFilterRelation) throw Error("Invalid use of filter, 'pgFilterRelation' expected");
        const {
            localAttributes,
            remoteAttributes,
            tableExpression,
            alias
          } = $where.extensions.pgFilterRelation,
          $subQuery = $where.notPlan().existsPlan({
            tableExpression,
            alias
          });
        localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
        return $subQuery;
      },
      some($where, value) {
        assertAllowed39(value, "object");
        if (value == null) return;
        if (!$where.extensions.pgFilterRelation) throw Error("Invalid use of filter, 'pgFilterRelation' expected");
        const {
            localAttributes,
            remoteAttributes,
            tableExpression,
            alias
          } = $where.extensions.pgFilterRelation,
          $subQuery = $where.existsPlan({
            tableExpression,
            alias
          });
        localAttributes.forEach((localAttribute, i) => {
          const remoteAttribute = remoteAttributes[i];
          $subQuery.where(sql`${$where.alias}.${sql.identifier(localAttribute)} = ${$subQuery.alias}.${sql.identifier(remoteAttribute)}`);
        });
        return $subQuery;
      }
    }
  },
  StringFilter: {
    plans: {
      distinctFrom($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier2 ? resolveSqlIdentifier2(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec5 ? resolveInputCodec5(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve15(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "distinctFrom"
          });
        $where.where(fragment);
      },
      distinctFromInsensitive($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier6 ? resolveSqlIdentifier6(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec10 ? resolveInputCodec10(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = resolveSqlValue5 ? resolveSqlValue5($where, value, inputCodec) : sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve15(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "distinctFromInsensitive"
          });
        $where.where(fragment);
      },
      endsWith($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier2 ? resolveSqlIdentifier2(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = resolveInput9 ? resolveInput9(value) : value,
          inputCodec = resolveInputCodec5 ? resolveInputCodec5(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve31(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "endsWith"
          });
        $where.where(fragment);
      },
      endsWithInsensitive($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier3 ? resolveSqlIdentifier3(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = resolveInput11 ? resolveInput11(value) : value,
          inputCodec = resolveInputCodec7 ? resolveInputCodec7(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve33(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "endsWithInsensitive"
          });
        $where.where(fragment);
      },
      equalTo($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier2 ? resolveSqlIdentifier2(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec5 ? resolveInputCodec5(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve13(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "equalTo"
          });
        $where.where(fragment);
      },
      equalToInsensitive($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier4 ? resolveSqlIdentifier4(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec8 ? resolveInputCodec8(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = resolveSqlValue3 ? resolveSqlValue3($where, value, inputCodec) : sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve13(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "equalToInsensitive"
          });
        $where.where(fragment);
      },
      greaterThan($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier2 ? resolveSqlIdentifier2(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec5 ? resolveInputCodec5(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve21(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "greaterThan"
          });
        $where.where(fragment);
      },
      greaterThanInsensitive($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier12 ? resolveSqlIdentifier12(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec16 ? resolveInputCodec16(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = resolveSqlValue11 ? resolveSqlValue11($where, value, inputCodec) : sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve21(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "greaterThanInsensitive"
          });
        $where.where(fragment);
      },
      greaterThanOrEqualTo($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier2 ? resolveSqlIdentifier2(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec5 ? resolveInputCodec5(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve22(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "greaterThanOrEqualTo"
          });
        $where.where(fragment);
      },
      greaterThanOrEqualToInsensitive($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier13 ? resolveSqlIdentifier13(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec17 ? resolveInputCodec17(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = resolveSqlValue12 ? resolveSqlValue12($where, value, inputCodec) : sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve22(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "greaterThanOrEqualToInsensitive"
          });
        $where.where(fragment);
      },
      in($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier2 ? resolveSqlIdentifier2(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec6 ? resolveInputCodec6(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve17(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "in"
          });
        $where.where(fragment);
      },
      includes($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier2 ? resolveSqlIdentifier2(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = resolveInput ? resolveInput(value) : value,
          inputCodec = resolveInputCodec5 ? resolveInputCodec5(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve23(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "includes"
          });
        $where.where(fragment);
      },
      includesInsensitive($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier3 ? resolveSqlIdentifier3(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = resolveInput3 ? resolveInput3(value) : value,
          inputCodec = resolveInputCodec7 ? resolveInputCodec7(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve25(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "includesInsensitive"
          });
        $where.where(fragment);
      },
      inInsensitive($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier8 ? resolveSqlIdentifier8(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec12 ? resolveInputCodec12(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = resolveSqlValue7 ? resolveSqlValue7($where, value, inputCodec) : sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve17(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "inInsensitive"
          });
        $where.where(fragment);
      },
      isNull($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec4 ? resolveInputCodec4(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = resolveSqlValue2 ? resolveSqlValue2($where, value, inputCodec) : sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve12(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "isNull"
          });
        $where.where(fragment);
      },
      lessThan($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier2 ? resolveSqlIdentifier2(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec5 ? resolveInputCodec5(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve19(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "lessThan"
          });
        $where.where(fragment);
      },
      lessThanInsensitive($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier10 ? resolveSqlIdentifier10(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec14 ? resolveInputCodec14(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = resolveSqlValue9 ? resolveSqlValue9($where, value, inputCodec) : sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve19(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "lessThanInsensitive"
          });
        $where.where(fragment);
      },
      lessThanOrEqualTo($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier2 ? resolveSqlIdentifier2(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec5 ? resolveInputCodec5(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve20(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "lessThanOrEqualTo"
          });
        $where.where(fragment);
      },
      lessThanOrEqualToInsensitive($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier11 ? resolveSqlIdentifier11(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec15 ? resolveInputCodec15(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = resolveSqlValue10 ? resolveSqlValue10($where, value, inputCodec) : sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve20(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "lessThanOrEqualToInsensitive"
          });
        $where.where(fragment);
      },
      like($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier2 ? resolveSqlIdentifier2(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec5 ? resolveInputCodec5(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve35(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "like"
          });
        $where.where(fragment);
      },
      likeInsensitive($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier3 ? resolveSqlIdentifier3(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec7 ? resolveInputCodec7(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve37(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "likeInsensitive"
          });
        $where.where(fragment);
      },
      notDistinctFrom($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier2 ? resolveSqlIdentifier2(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec5 ? resolveInputCodec5(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve16(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "notDistinctFrom"
          });
        $where.where(fragment);
      },
      notDistinctFromInsensitive($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier7 ? resolveSqlIdentifier7(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec11 ? resolveInputCodec11(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = resolveSqlValue6 ? resolveSqlValue6($where, value, inputCodec) : sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve16(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "notDistinctFromInsensitive"
          });
        $where.where(fragment);
      },
      notEndsWith($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier2 ? resolveSqlIdentifier2(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = resolveInput10 ? resolveInput10(value) : value,
          inputCodec = resolveInputCodec5 ? resolveInputCodec5(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve32(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "notEndsWith"
          });
        $where.where(fragment);
      },
      notEndsWithInsensitive($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier3 ? resolveSqlIdentifier3(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = resolveInput12 ? resolveInput12(value) : value,
          inputCodec = resolveInputCodec7 ? resolveInputCodec7(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve34(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "notEndsWithInsensitive"
          });
        $where.where(fragment);
      },
      notEqualTo($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier2 ? resolveSqlIdentifier2(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec5 ? resolveInputCodec5(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve14(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "notEqualTo"
          });
        $where.where(fragment);
      },
      notEqualToInsensitive($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier5 ? resolveSqlIdentifier5(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec9 ? resolveInputCodec9(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = resolveSqlValue4 ? resolveSqlValue4($where, value, inputCodec) : sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve14(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "notEqualToInsensitive"
          });
        $where.where(fragment);
      },
      notIn($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier2 ? resolveSqlIdentifier2(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec6 ? resolveInputCodec6(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve18(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "notIn"
          });
        $where.where(fragment);
      },
      notIncludes($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier2 ? resolveSqlIdentifier2(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = resolveInput2 ? resolveInput2(value) : value,
          inputCodec = resolveInputCodec5 ? resolveInputCodec5(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve24(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "notIncludes"
          });
        $where.where(fragment);
      },
      notIncludesInsensitive($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier3 ? resolveSqlIdentifier3(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = resolveInput4 ? resolveInput4(value) : value,
          inputCodec = resolveInputCodec7 ? resolveInputCodec7(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve26(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "notIncludesInsensitive"
          });
        $where.where(fragment);
      },
      notInInsensitive($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier9 ? resolveSqlIdentifier9(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec13 ? resolveInputCodec13(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = resolveSqlValue8 ? resolveSqlValue8($where, value, inputCodec) : sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve18(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "notInInsensitive"
          });
        $where.where(fragment);
      },
      notLike($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier2 ? resolveSqlIdentifier2(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec5 ? resolveInputCodec5(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve36(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "notLike"
          });
        $where.where(fragment);
      },
      notLikeInsensitive($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier3 ? resolveSqlIdentifier3(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec7 ? resolveInputCodec7(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve38(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "notLikeInsensitive"
          });
        $where.where(fragment);
      },
      notStartsWith($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier2 ? resolveSqlIdentifier2(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = resolveInput6 ? resolveInput6(value) : value,
          inputCodec = resolveInputCodec5 ? resolveInputCodec5(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve28(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "notStartsWith"
          });
        $where.where(fragment);
      },
      notStartsWithInsensitive($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier3 ? resolveSqlIdentifier3(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = resolveInput8 ? resolveInput8(value) : value,
          inputCodec = resolveInputCodec7 ? resolveInputCodec7(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve30(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "notStartsWithInsensitive"
          });
        $where.where(fragment);
      },
      startsWith($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier2 ? resolveSqlIdentifier2(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = resolveInput5 ? resolveInput5(value) : value,
          inputCodec = resolveInputCodec5 ? resolveInputCodec5(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve27(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "startsWith"
          });
        $where.where(fragment);
      },
      startsWithInsensitive($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier3 ? resolveSqlIdentifier3(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = resolveInput7 ? resolveInput7(value) : value,
          inputCodec = resolveInputCodec7 ? resolveInputCodec7(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve29(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "startsWithInsensitive"
          });
        $where.where(fragment);
      }
    }
  },
  StringListFilter: {
    plans: {
      anyEqualTo($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec20 ? resolveInputCodec20(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve51(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "anyEqualTo"
          });
        $where.where(fragment);
      },
      anyGreaterThan($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec20 ? resolveInputCodec20(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve55(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "anyGreaterThan"
          });
        $where.where(fragment);
      },
      anyGreaterThanOrEqualTo($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec20 ? resolveInputCodec20(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve56(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "anyGreaterThanOrEqualTo"
          });
        $where.where(fragment);
      },
      anyLessThan($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec20 ? resolveInputCodec20(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve53(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "anyLessThan"
          });
        $where.where(fragment);
      },
      anyLessThanOrEqualTo($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec20 ? resolveInputCodec20(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve54(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "anyLessThanOrEqualTo"
          });
        $where.where(fragment);
      },
      anyNotEqualTo($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec20 ? resolveInputCodec20(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve52(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "anyNotEqualTo"
          });
        $where.where(fragment);
      },
      containedBy($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier14 ? resolveSqlIdentifier14(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec19 ? resolveInputCodec19(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve49(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "containedBy"
          });
        $where.where(fragment);
      },
      contains($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier14 ? resolveSqlIdentifier14(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec19 ? resolveInputCodec19(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve48(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "contains"
          });
        $where.where(fragment);
      },
      distinctFrom($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier14 ? resolveSqlIdentifier14(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec19 ? resolveInputCodec19(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve42(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "distinctFrom"
          });
        $where.where(fragment);
      },
      equalTo($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier14 ? resolveSqlIdentifier14(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec19 ? resolveInputCodec19(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve40(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "equalTo"
          });
        $where.where(fragment);
      },
      greaterThan($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier14 ? resolveSqlIdentifier14(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec19 ? resolveInputCodec19(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve46(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "greaterThan"
          });
        $where.where(fragment);
      },
      greaterThanOrEqualTo($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier14 ? resolveSqlIdentifier14(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec19 ? resolveInputCodec19(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve47(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "greaterThanOrEqualTo"
          });
        $where.where(fragment);
      },
      isNull($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec18 ? resolveInputCodec18(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = resolveSqlValue13 ? resolveSqlValue13($where, value, inputCodec) : sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve39(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "isNull"
          });
        $where.where(fragment);
      },
      lessThan($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier14 ? resolveSqlIdentifier14(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec19 ? resolveInputCodec19(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve44(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "lessThan"
          });
        $where.where(fragment);
      },
      lessThanOrEqualTo($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier14 ? resolveSqlIdentifier14(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec19 ? resolveInputCodec19(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve45(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "lessThanOrEqualTo"
          });
        $where.where(fragment);
      },
      notDistinctFrom($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier14 ? resolveSqlIdentifier14(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec19 ? resolveInputCodec19(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve43(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "notDistinctFrom"
          });
        $where.where(fragment);
      },
      notEqualTo($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier14 ? resolveSqlIdentifier14(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec19 ? resolveInputCodec19(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve41(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "notEqualTo"
          });
        $where.where(fragment);
      },
      overlaps($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier14 ? resolveSqlIdentifier14(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec19 ? resolveInputCodec19(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve50(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "overlaps"
          });
        $where.where(fragment);
      }
    }
  },
  UpdateCompanyByIdInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      },
      patch(qb, arg) {
        if (arg != null) return qb.setBuilder();
      }
    }
  },
  UpdateCompanyInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      },
      patch(qb, arg) {
        if (arg != null) return qb.setBuilder();
      }
    }
  },
  UpdateCompanyMemberByIdInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      },
      patch(qb, arg) {
        if (arg != null) return qb.setBuilder();
      }
    }
  },
  UpdateCompanyMemberInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      },
      patch(qb, arg) {
        if (arg != null) return qb.setBuilder();
      }
    }
  },
  UpdateDocumentNumberingConfigByIdInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      },
      patch(qb, arg) {
        if (arg != null) return qb.setBuilder();
      }
    }
  },
  UpdateDocumentNumberingConfigInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      },
      patch(qb, arg) {
        if (arg != null) return qb.setBuilder();
      }
    }
  },
  UpdateInventoryAdjustmentByIdInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      },
      patch(qb, arg) {
        if (arg != null) return qb.setBuilder();
      }
    }
  },
  UpdateInventoryAdjustmentInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      },
      patch(qb, arg) {
        if (arg != null) return qb.setBuilder();
      }
    }
  },
  UpdateInvoiceByIdInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      },
      patch(qb, arg) {
        if (arg != null) return qb.setBuilder();
      }
    }
  },
  UpdateInvoiceInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      },
      patch(qb, arg) {
        if (arg != null) return qb.setBuilder();
      }
    }
  },
  UpdateInvoiceLineItemByIdInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      },
      patch(qb, arg) {
        if (arg != null) return qb.setBuilder();
      }
    }
  },
  UpdateInvoiceLineItemInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      },
      patch(qb, arg) {
        if (arg != null) return qb.setBuilder();
      }
    }
  },
  UpdateOrganizationSettingByIdInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      },
      patch(qb, arg) {
        if (arg != null) return qb.setBuilder();
      }
    }
  },
  UpdateOrganizationSettingInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      },
      patch(qb, arg) {
        if (arg != null) return qb.setBuilder();
      }
    }
  },
  UpdatePersonByIdInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      },
      patch(qb, arg) {
        if (arg != null) return qb.setBuilder();
      }
    }
  },
  UpdatePersonInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      },
      patch(qb, arg) {
        if (arg != null) return qb.setBuilder();
      }
    }
  },
  UpdateProductByIdInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      },
      patch(qb, arg) {
        if (arg != null) return qb.setBuilder();
      }
    }
  },
  UpdateProductInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      },
      patch(qb, arg) {
        if (arg != null) return qb.setBuilder();
      }
    }
  },
  UpdateQuoteByIdInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      },
      patch(qb, arg) {
        if (arg != null) return qb.setBuilder();
      }
    }
  },
  UpdateQuoteInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      },
      patch(qb, arg) {
        if (arg != null) return qb.setBuilder();
      }
    }
  },
  UpdateQuoteLineItemByIdInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      },
      patch(qb, arg) {
        if (arg != null) return qb.setBuilder();
      }
    }
  },
  UpdateQuoteLineItemInput: {
    plans: {
      clientMutationId(qb, val) {
        qb.setMeta("clientMutationId", val);
      },
      patch(qb, arg) {
        if (arg != null) return qb.setBuilder();
      }
    }
  },
  UUIDFilter: {
    plans: {
      distinctFrom($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier ? resolveSqlIdentifier(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec2 ? resolveInputCodec2(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve4(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "distinctFrom"
          });
        $where.where(fragment);
      },
      equalTo($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier ? resolveSqlIdentifier(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec2 ? resolveInputCodec2(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve2(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "equalTo"
          });
        $where.where(fragment);
      },
      greaterThan($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier ? resolveSqlIdentifier(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec2 ? resolveInputCodec2(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve10(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "greaterThan"
          });
        $where.where(fragment);
      },
      greaterThanOrEqualTo($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier ? resolveSqlIdentifier(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec2 ? resolveInputCodec2(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve11(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "greaterThanOrEqualTo"
          });
        $where.where(fragment);
      },
      in($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier ? resolveSqlIdentifier(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec3 ? resolveInputCodec3(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve6(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "in"
          });
        $where.where(fragment);
      },
      isNull($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec ? resolveInputCodec(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = resolveSqlValue ? resolveSqlValue($where, value, inputCodec) : sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "isNull"
          });
        $where.where(fragment);
      },
      lessThan($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier ? resolveSqlIdentifier(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec2 ? resolveInputCodec2(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve8(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "lessThan"
          });
        $where.where(fragment);
      },
      lessThanOrEqualTo($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier ? resolveSqlIdentifier(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec2 ? resolveInputCodec2(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve9(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "lessThanOrEqualTo"
          });
        $where.where(fragment);
      },
      notDistinctFrom($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier ? resolveSqlIdentifier(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec2 ? resolveInputCodec2(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve5(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "notDistinctFrom"
          });
        $where.where(fragment);
      },
      notEqualTo($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier ? resolveSqlIdentifier(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec2 ? resolveInputCodec2(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve3(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "notEqualTo"
          });
        $where.where(fragment);
      },
      notIn($where, value) {
        if (!$where.extensions?.pgFilterAttribute) throw Error("Planning error: expected 'pgFilterAttribute' to be present on the $where plan's extensions; your extensions to `postgraphile-plugin-connection-filter` does not implement the required interfaces.");
        if (value === void 0) return;
        const {
            fieldName: parentFieldName,
            attributeName,
            attribute,
            codec,
            expression
          } = $where.extensions.pgFilterAttribute,
          sourceAlias = attribute ? attribute.expression ? attribute.expression($where.alias) : sql`${$where.alias}.${sql.identifier(attributeName)}` : expression ? expression : $where.alias,
          sourceCodec = codec ?? attribute.codec,
          [sqlIdentifier, identifierCodec] = resolveSqlIdentifier ? resolveSqlIdentifier(sourceAlias, sourceCodec) : [sourceAlias, sourceCodec];
        if (false && value === null) return;
        if (!false && value === null) throw Object.assign(Error("Null literals are forbidden in filter argument input."), {});
        const resolvedInput = value,
          inputCodec = resolveInputCodec3 ? resolveInputCodec3(codec ?? attribute.codec) : codec ?? attribute.codec,
          sqlValue = sqlValueWithCodec(resolvedInput, inputCodec),
          fragment = resolve7(sqlIdentifier, sqlValue, value, $where, {
            fieldName: parentFieldName ?? null,
            operatorName: "notIn"
          });
        $where.where(fragment);
      }
    }
  }
};
export const scalars = {
  BigFloat: {
    serialize: UUIDSerialize,
    parseValue: UUIDSerialize,
    parseLiteral(ast) {
      if (ast.kind !== Kind.STRING) throw new GraphQLError(`${"BigFloat" ?? "This scalar"} can only parse string values (kind='${ast.kind}')`);
      return ast.value;
    }
  },
  Cursor: {
    serialize: UUIDSerialize,
    parseValue: UUIDSerialize,
    parseLiteral(ast) {
      if (ast.kind !== Kind.STRING) throw new GraphQLError(`${"Cursor" ?? "This scalar"} can only parse string values (kind='${ast.kind}')`);
      return ast.value;
    }
  },
  Date: {
    serialize: UUIDSerialize,
    parseValue: UUIDSerialize,
    parseLiteral(ast) {
      if (ast.kind !== Kind.STRING) throw new GraphQLError(`${"Date" ?? "This scalar"} can only parse string values (kind='${ast.kind}')`);
      return ast.value;
    }
  },
  Datetime: {
    serialize: UUIDSerialize,
    parseValue: UUIDSerialize,
    parseLiteral(ast) {
      if (ast.kind !== Kind.STRING) throw new GraphQLError(`${"Datetime" ?? "This scalar"} can only parse string values (kind='${ast.kind}')`);
      return ast.value;
    }
  },
  UUID: {
    serialize: UUIDSerialize,
    parseValue(value) {
      return coerce("" + value);
    },
    parseLiteral(ast) {
      if (ast.kind !== Kind.STRING) throw new GraphQLError(`${"UUID" ?? "This scalar"} can only parse string values (kind = '${ast.kind}')`);
      return coerce(ast.value);
    }
  }
};
export const enums = {
  CompanyMemberOrderBy: {
    values: {
      COMPANY_ID_ASC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "company_id",
          direction: "ASC"
        });
      },
      COMPANY_ID_DESC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "company_id",
          direction: "DESC"
        });
      },
      PERSON_ID_ASC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "person_id",
          direction: "ASC"
        });
      },
      PERSON_ID_DESC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "person_id",
          direction: "DESC"
        });
      },
      PRIMARY_KEY_ASC(queryBuilder) {
        company_memberUniques[0].attributes.forEach(attributeName => {
          queryBuilder.orderBy({
            attribute: attributeName,
            direction: "ASC"
          });
        });
        queryBuilder.setOrderIsUnique();
      },
      PRIMARY_KEY_DESC(queryBuilder) {
        company_memberUniques[0].attributes.forEach(attributeName => {
          queryBuilder.orderBy({
            attribute: attributeName,
            direction: "DESC"
          });
        });
        queryBuilder.setOrderIsUnique();
      },
      ROW_ID_ASC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "id",
          direction: "ASC"
        });
        queryBuilder.setOrderIsUnique();
      },
      ROW_ID_DESC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "id",
          direction: "DESC"
        });
        queryBuilder.setOrderIsUnique();
      }
    }
  },
  CompanyOrderBy: {
    values: {
      ORGANIZATION_ID_ASC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "organization_id",
          direction: "ASC"
        });
      },
      ORGANIZATION_ID_DESC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "organization_id",
          direction: "DESC"
        });
      },
      PRIMARY_KEY_ASC(queryBuilder) {
        companyUniques[0].attributes.forEach(attributeName => {
          queryBuilder.orderBy({
            attribute: attributeName,
            direction: "ASC"
          });
        });
        queryBuilder.setOrderIsUnique();
      },
      PRIMARY_KEY_DESC(queryBuilder) {
        companyUniques[0].attributes.forEach(attributeName => {
          queryBuilder.orderBy({
            attribute: attributeName,
            direction: "DESC"
          });
        });
        queryBuilder.setOrderIsUnique();
      },
      ROW_ID_ASC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "id",
          direction: "ASC"
        });
        queryBuilder.setOrderIsUnique();
      },
      ROW_ID_DESC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "id",
          direction: "DESC"
        });
        queryBuilder.setOrderIsUnique();
      }
    }
  },
  DocumentNumberingConfigOrderBy: {
    values: {
      DOCUMENT_TYPE_ASC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "document_type",
          direction: "ASC"
        });
      },
      DOCUMENT_TYPE_DESC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "document_type",
          direction: "DESC"
        });
      },
      ORGANIZATION_ID_ASC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "organization_id",
          direction: "ASC"
        });
      },
      ORGANIZATION_ID_DESC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "organization_id",
          direction: "DESC"
        });
      },
      PRIMARY_KEY_ASC(queryBuilder) {
        document_numbering_configUniques[0].attributes.forEach(attributeName => {
          queryBuilder.orderBy({
            attribute: attributeName,
            direction: "ASC"
          });
        });
        queryBuilder.setOrderIsUnique();
      },
      PRIMARY_KEY_DESC(queryBuilder) {
        document_numbering_configUniques[0].attributes.forEach(attributeName => {
          queryBuilder.orderBy({
            attribute: attributeName,
            direction: "DESC"
          });
        });
        queryBuilder.setOrderIsUnique();
      },
      ROW_ID_ASC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "id",
          direction: "ASC"
        });
        queryBuilder.setOrderIsUnique();
      },
      ROW_ID_DESC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "id",
          direction: "DESC"
        });
        queryBuilder.setOrderIsUnique();
      }
    }
  },
  InventoryAdjustmentOrderBy: {
    values: {
      PRIMARY_KEY_ASC(queryBuilder) {
        inventory_adjustmentUniques[0].attributes.forEach(attributeName => {
          queryBuilder.orderBy({
            attribute: attributeName,
            direction: "ASC"
          });
        });
        queryBuilder.setOrderIsUnique();
      },
      PRIMARY_KEY_DESC(queryBuilder) {
        inventory_adjustmentUniques[0].attributes.forEach(attributeName => {
          queryBuilder.orderBy({
            attribute: attributeName,
            direction: "DESC"
          });
        });
        queryBuilder.setOrderIsUnique();
      },
      PRODUCT_ID_ASC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "product_id",
          direction: "ASC"
        });
      },
      PRODUCT_ID_DESC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "product_id",
          direction: "DESC"
        });
      },
      ROW_ID_ASC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "id",
          direction: "ASC"
        });
        queryBuilder.setOrderIsUnique();
      },
      ROW_ID_DESC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "id",
          direction: "DESC"
        });
        queryBuilder.setOrderIsUnique();
      }
    }
  },
  InvoiceLineItemOrderBy: {
    values: {
      INVOICE_ID_ASC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "invoice_id",
          direction: "ASC"
        });
      },
      INVOICE_ID_DESC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "invoice_id",
          direction: "DESC"
        });
      },
      PRIMARY_KEY_ASC(queryBuilder) {
        invoice_line_itemUniques[0].attributes.forEach(attributeName => {
          queryBuilder.orderBy({
            attribute: attributeName,
            direction: "ASC"
          });
        });
        queryBuilder.setOrderIsUnique();
      },
      PRIMARY_KEY_DESC(queryBuilder) {
        invoice_line_itemUniques[0].attributes.forEach(attributeName => {
          queryBuilder.orderBy({
            attribute: attributeName,
            direction: "DESC"
          });
        });
        queryBuilder.setOrderIsUnique();
      },
      ROW_ID_ASC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "id",
          direction: "ASC"
        });
        queryBuilder.setOrderIsUnique();
      },
      ROW_ID_DESC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "id",
          direction: "DESC"
        });
        queryBuilder.setOrderIsUnique();
      }
    }
  },
  InvoiceOrderBy: {
    values: {
      COMPANY_ID_ASC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "company_id",
          direction: "ASC"
        });
      },
      COMPANY_ID_DESC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "company_id",
          direction: "DESC"
        });
      },
      INVOICE_NUMBER_ASC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "invoice_number",
          direction: "ASC"
        });
      },
      INVOICE_NUMBER_DESC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "invoice_number",
          direction: "DESC"
        });
      },
      ORGANIZATION_ID_ASC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "organization_id",
          direction: "ASC"
        });
      },
      ORGANIZATION_ID_DESC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "organization_id",
          direction: "DESC"
        });
      },
      PRIMARY_KEY_ASC(queryBuilder) {
        invoiceUniques[0].attributes.forEach(attributeName => {
          queryBuilder.orderBy({
            attribute: attributeName,
            direction: "ASC"
          });
        });
        queryBuilder.setOrderIsUnique();
      },
      PRIMARY_KEY_DESC(queryBuilder) {
        invoiceUniques[0].attributes.forEach(attributeName => {
          queryBuilder.orderBy({
            attribute: attributeName,
            direction: "DESC"
          });
        });
        queryBuilder.setOrderIsUnique();
      },
      ROW_ID_ASC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "id",
          direction: "ASC"
        });
        queryBuilder.setOrderIsUnique();
      },
      ROW_ID_DESC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "id",
          direction: "DESC"
        });
        queryBuilder.setOrderIsUnique();
      },
      STATUS_ASC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "status",
          direction: "ASC"
        });
      },
      STATUS_DESC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "status",
          direction: "DESC"
        });
      }
    }
  },
  OrganizationSettingOrderBy: {
    values: {
      ORGANIZATION_ID_ASC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "organization_id",
          direction: "ASC"
        });
      },
      ORGANIZATION_ID_DESC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "organization_id",
          direction: "DESC"
        });
      },
      PRIMARY_KEY_ASC(queryBuilder) {
        organization_settingsUniques[0].attributes.forEach(attributeName => {
          queryBuilder.orderBy({
            attribute: attributeName,
            direction: "ASC"
          });
        });
        queryBuilder.setOrderIsUnique();
      },
      PRIMARY_KEY_DESC(queryBuilder) {
        organization_settingsUniques[0].attributes.forEach(attributeName => {
          queryBuilder.orderBy({
            attribute: attributeName,
            direction: "DESC"
          });
        });
        queryBuilder.setOrderIsUnique();
      },
      ROW_ID_ASC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "id",
          direction: "ASC"
        });
        queryBuilder.setOrderIsUnique();
      },
      ROW_ID_DESC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "id",
          direction: "DESC"
        });
        queryBuilder.setOrderIsUnique();
      }
    }
  },
  PersonOrderBy: {
    values: {
      ORGANIZATION_ID_ASC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "organization_id",
          direction: "ASC"
        });
      },
      ORGANIZATION_ID_DESC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "organization_id",
          direction: "DESC"
        });
      },
      PRIMARY_KEY_ASC(queryBuilder) {
        personUniques[0].attributes.forEach(attributeName => {
          queryBuilder.orderBy({
            attribute: attributeName,
            direction: "ASC"
          });
        });
        queryBuilder.setOrderIsUnique();
      },
      PRIMARY_KEY_DESC(queryBuilder) {
        personUniques[0].attributes.forEach(attributeName => {
          queryBuilder.orderBy({
            attribute: attributeName,
            direction: "DESC"
          });
        });
        queryBuilder.setOrderIsUnique();
      },
      ROW_ID_ASC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "id",
          direction: "ASC"
        });
        queryBuilder.setOrderIsUnique();
      },
      ROW_ID_DESC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "id",
          direction: "DESC"
        });
        queryBuilder.setOrderIsUnique();
      }
    }
  },
  ProductOrderBy: {
    values: {
      ORGANIZATION_ID_ASC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "organization_id",
          direction: "ASC"
        });
      },
      ORGANIZATION_ID_DESC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "organization_id",
          direction: "DESC"
        });
      },
      PRIMARY_KEY_ASC(queryBuilder) {
        productUniques[0].attributes.forEach(attributeName => {
          queryBuilder.orderBy({
            attribute: attributeName,
            direction: "ASC"
          });
        });
        queryBuilder.setOrderIsUnique();
      },
      PRIMARY_KEY_DESC(queryBuilder) {
        productUniques[0].attributes.forEach(attributeName => {
          queryBuilder.orderBy({
            attribute: attributeName,
            direction: "DESC"
          });
        });
        queryBuilder.setOrderIsUnique();
      },
      ROW_ID_ASC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "id",
          direction: "ASC"
        });
        queryBuilder.setOrderIsUnique();
      },
      ROW_ID_DESC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "id",
          direction: "DESC"
        });
        queryBuilder.setOrderIsUnique();
      },
      SKU_ASC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "sku",
          direction: "ASC"
        });
      },
      SKU_DESC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "sku",
          direction: "DESC"
        });
      }
    }
  },
  QuoteLineItemOrderBy: {
    values: {
      PRIMARY_KEY_ASC(queryBuilder) {
        quote_line_itemUniques[0].attributes.forEach(attributeName => {
          queryBuilder.orderBy({
            attribute: attributeName,
            direction: "ASC"
          });
        });
        queryBuilder.setOrderIsUnique();
      },
      PRIMARY_KEY_DESC(queryBuilder) {
        quote_line_itemUniques[0].attributes.forEach(attributeName => {
          queryBuilder.orderBy({
            attribute: attributeName,
            direction: "DESC"
          });
        });
        queryBuilder.setOrderIsUnique();
      },
      QUOTE_ID_ASC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "quote_id",
          direction: "ASC"
        });
      },
      QUOTE_ID_DESC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "quote_id",
          direction: "DESC"
        });
      },
      ROW_ID_ASC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "id",
          direction: "ASC"
        });
        queryBuilder.setOrderIsUnique();
      },
      ROW_ID_DESC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "id",
          direction: "DESC"
        });
        queryBuilder.setOrderIsUnique();
      }
    }
  },
  QuoteOrderBy: {
    values: {
      COMPANY_ID_ASC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "company_id",
          direction: "ASC"
        });
      },
      COMPANY_ID_DESC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "company_id",
          direction: "DESC"
        });
      },
      ORGANIZATION_ID_ASC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "organization_id",
          direction: "ASC"
        });
      },
      ORGANIZATION_ID_DESC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "organization_id",
          direction: "DESC"
        });
      },
      PRIMARY_KEY_ASC(queryBuilder) {
        quoteUniques[0].attributes.forEach(attributeName => {
          queryBuilder.orderBy({
            attribute: attributeName,
            direction: "ASC"
          });
        });
        queryBuilder.setOrderIsUnique();
      },
      PRIMARY_KEY_DESC(queryBuilder) {
        quoteUniques[0].attributes.forEach(attributeName => {
          queryBuilder.orderBy({
            attribute: attributeName,
            direction: "DESC"
          });
        });
        queryBuilder.setOrderIsUnique();
      },
      QUOTE_NUMBER_ASC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "quote_number",
          direction: "ASC"
        });
      },
      QUOTE_NUMBER_DESC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "quote_number",
          direction: "DESC"
        });
      },
      ROW_ID_ASC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "id",
          direction: "ASC"
        });
        queryBuilder.setOrderIsUnique();
      },
      ROW_ID_DESC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "id",
          direction: "DESC"
        });
        queryBuilder.setOrderIsUnique();
      },
      STATUS_ASC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "status",
          direction: "ASC"
        });
      },
      STATUS_DESC(queryBuilder) {
        queryBuilder.orderBy({
          attribute: "status",
          direction: "DESC"
        });
      }
    }
  }
};
export const schema = makeGrafastSchema({
  typeDefs: typeDefs,
  objects: objects,
  interfaces: interfaces,
  inputObjects: inputObjects,
  scalars: scalars,
  enums: enums
});