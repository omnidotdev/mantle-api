import { EXPORTABLE } from "graphile-export";
import { sideEffectWithPgClient } from "postgraphile/@dataplan/pg";
import { object } from "postgraphile/grafast";
import { wrapPlans } from "postgraphile/utils";

import type { PgClient, PgExecutor } from "postgraphile/@dataplan/pg";
import type { Step } from "postgraphile/grafast";
import type { PlanWrapperFn } from "postgraphile/utils";

/**
 * Minimal shape of the CRUD mutation payload plan (`object({ result: $mutation })`)
 * and the insert/update/delete step the written row's columns are read from
 */
interface MutationStep {
  resource: { executor: PgExecutor };
  get: (attr: string) => Step;
}
interface PayloadStep {
  get: (key: "result") => MutationStep;
}

type Action = "created" | "updated" | "deleted";
type Row = Record<string, unknown>;

/**
 * Event payload fields per entity: `[payload key, column]`. Values come from
 * the mutation's RETURNING row, decoded (numerics and dates as strings).
 * `id` and `organizationId` lead every payload; a payment row has no workspace
 * of its own, so its `organizationId` and `currency` are read from its invoice
 * (see {@link enrichPayment})
 */
const EVENT_FIELDS = {
  company: [
    ["id", "id"],
    ["organizationId", "organization_id"],
  ],
  person: [
    ["id", "id"],
    ["organizationId", "organization_id"],
  ],
  documentNumberingConfig: [
    ["id", "id"],
    ["organizationId", "organization_id"],
  ],
  // Fields MyFi needs to book invoices as journal entries
  invoice: [
    ["id", "id"],
    ["organizationId", "organization_id"],
    ["companyId", "company_id"],
    ["contactId", "contact_id"],
    ["invoiceNumber", "invoice_number"],
    ["status", "status"],
    ["total", "total"],
    ["currency", "currency"],
    ["issueDate", "issue_date"],
    ["dueDate", "due_date"],
    ["paidAt", "paid_at"],
    ["paymentReference", "payment_reference"],
  ],
  quote: [
    ["id", "id"],
    ["organizationId", "organization_id"],
    ["companyId", "company_id"],
    ["contactId", "contact_id"],
    ["quoteNumber", "quote_number"],
    ["status", "status"],
    ["total", "total"],
    ["currency", "currency"],
    ["validUntil", "valid_until"],
    ["convertedInvoiceId", "converted_invoice_id"],
  ],
  // Per-payment facts so MyFi books partial and per-payment cash, not the
  // whole invoice at once
  payment: [
    ["id", "id"],
    ["invoiceId", "invoice_id"],
    ["amount", "amount"],
    ["paidAt", "paid_at"],
    ["reference", "reference"],
    ["method", "method"],
  ],
  // Catalog fields so Halo can build its commerce projection
  product: [
    ["id", "id"],
    ["organizationId", "organization_id"],
    ["sku", "sku"],
    ["upc", "upc"],
    ["name", "name"],
    ["description", "description"],
    ["costPrice", "cost_price"],
    ["retailPrice", "retail_price"],
    ["unitPrice", "unit_price"],
    ["fulfillmentType", "fulfillment_type"],
    ["supplierId", "supplier_id"],
    ["supplierSku", "supplier_sku"],
    ["weight", "weight"],
    ["category1", "category1"],
    ["category2", "category2"],
    ["imageUrl", "image_url"],
    ["imageUrl2", "image_url_2"],
    ["imageUrl3", "image_url_3"],
    ["isActive", "is_active"],
    ["isRestricted", "is_restricted"],
    ["currentQuantity", "current_quantity"],
    ["channels", "channels"],
  ],
} as const satisfies Record<string, readonly (readonly [string, string])[]>;

type Entity = keyof typeof EVENT_FIELDS;

/**
 * A payment row carries no workspace or currency; read them from its invoice
 * (MyFi resolves the book by `organizationId`, so without it the payment cannot
 * be booked)
 */
const enrichPayment = EXPORTABLE(
  () =>
    async (pgClient: PgClient, row: Row): Promise<Row> => {
      if (typeof row.invoiceId !== "string") return row;

      const { rows } = await pgClient.query<{
        organization_id: string;
        currency: string | null;
      }>({
        text: "SELECT organization_id, currency FROM invoice WHERE id = $1",
        values: [row.invoiceId],
      });

      return {
        ...row,
        organizationId: rows[0]?.organization_id,
        currency: rows[0]?.currency ?? undefined,
      };
    },
  [],
);

/**
 * Re-read a created or updated invoice so the event carries its final state:
 * totals are recomputed by a later step in the same transaction (see
 * RecomputeInvoiceTotalsPlugin), after the RETURNING row was produced
 */
const refreshInvoice = EXPORTABLE(
  () =>
    async (pgClient: PgClient, row: Row): Promise<Row> => {
      const { rows } = await pgClient.query<{ total: string | null }>({
        text: "SELECT total::text FROM invoice WHERE id = $1",
        values: [row.id],
      });

      return rows[0] ? { ...row, total: rows[0].total } : row;
    },
  [],
);

/**
 * Publish one domain event. Emission never fails the mutation that produced it
 */
const publish = EXPORTABLE(
  () => (type: string, data: Row) => {
    // Lazy import keeps the provider instance out of the plan closures
    void import("lib/providers")
      .then(({ events }) =>
        events.emit({ type, data, subject: String(data.id) }),
      )
      .catch(() => {});
  },
  [],
);

/**
 * Emit `mantle.<entity>.<action>` with the written row once the mutation
 * succeeds.
 *
 * The row is read from the mutation result (`$payload.get("result")`), not the
 * wrapper's `$source`, which for a root Mutation field is the root value and
 * carries no row. The side effect is created after `plan()`, so grafast
 * sequences it after every side effect the inner wrappers planned (plan limit
 * re-count, totals recompute, overpayment credit): if any of them fails, the
 * mutation fails and nothing is emitted. EventEmissionPlugin is listed last in
 * the preset so it wraps every other mutation plugin
 */
const emitOnMutate = (entity: Entity, action: Action): PlanWrapperFn =>
  EXPORTABLE(
    (
      object,
      sideEffectWithPgClient,
      EVENT_FIELDS,
      enrichPayment,
      refreshInvoice,
      publish,
      entity,
      action,
    ): PlanWrapperFn =>
      (plan) => {
        const $payload = plan();
        if (!$payload) return $payload;
        const $mutation = ($payload as unknown as PayloadStep).get("result");

        const $row = object(
          Object.fromEntries(
            EVENT_FIELDS[entity].map(([key, column]) => [
              key,
              $mutation.get(column),
            ]),
          ),
        );

        sideEffectWithPgClient(
          $mutation.resource.executor,
          $row,
          async (pgClient: PgClient, written: Row) => {
            if (!written?.id) return;

            let data = written;
            try {
              if (entity === "payment")
                data = await enrichPayment(pgClient, data);
              else if (entity === "invoice" && action !== "deleted")
                data = await refreshInvoice(pgClient, data);
            } catch {
              // Emit what the mutation returned rather than nothing
            }

            publish(`mantle.${entity}.${action}`, data);
          },
        );

        return $payload;
      },
    [
      object,
      sideEffectWithPgClient,
      EVENT_FIELDS,
      enrichPayment,
      refreshInvoice,
      publish,
      entity,
      action,
    ],
  );

/** The generated CRUD mutations that emit, as `[entity, action, field]` */
export const EMITTING_MUTATIONS: readonly (readonly [
  Entity,
  Action,
  string,
])[] = (Object.keys(EVENT_FIELDS) as Entity[]).flatMap((entity) => {
  const type = entity.charAt(0).toUpperCase() + entity.slice(1);
  return [
    [entity, "created", `create${type}`],
    [entity, "updated", `update${type}`],
    [entity, "deleted", `delete${type}`],
  ] as const;
});

/**
 * Event emission plugin for Mantle mutations.
 *
 * Emits CloudEvents to Vortex for company, person, document numbering, invoice,
 * quote, payment, and product lifecycle. MyFi books invoices, payments, and
 * credits from them; Halo projects the product catalog
 */
const EventEmissionPlugin = wrapPlans({
  Mutation: Object.fromEntries(
    EMITTING_MUTATIONS.map(([entity, action, field]) => [
      field,
      emitOnMutate(entity, action),
    ]),
  ),
});

export default EventEmissionPlugin;
