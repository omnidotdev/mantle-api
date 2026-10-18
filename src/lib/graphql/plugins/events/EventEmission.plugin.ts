import { EXPORTABLE } from "graphile-export";
import { sideEffect } from "postgraphile/grafast";
import { wrapPlans } from "postgraphile/utils";

import type { PlanWrapperFn } from "postgraphile/utils";

/**
 * Emit a domain event. Lazily loads the provider to avoid capturing
 * a class instance in EXPORTABLE closures.
 */
const emitEvent = EXPORTABLE(
  () => (type: string, data: Record<string, unknown>, subject: string) => {
    // Lazy import avoids EXPORTABLE serialization of class instances
    import("lib/providers").then(({ events }) => {
      void events.emit({ type, data, subject });
    });
  },
  [],
);

/**
 * Emit a domain event after a mutation succeeds.
 */
const emitOnMutate = (
  entity: string,
  action: "created" | "updated" | "deleted",
): PlanWrapperFn =>
  EXPORTABLE(
    (sideEffect, emitEvent, entity, action): PlanWrapperFn =>
      (plan, $record) => {
        sideEffect([$record], ([record]) => {
          if (!record?.id) return;

          emitEvent(`mantle.${entity}.${action}`, { id: record.id }, record.id);
        });

        return plan();
      },
    [sideEffect, emitEvent, entity, action],
  );

/**
 * Emit an enriched product event with catalog-relevant fields.
 * Used for product mutations so Halo can build its commerce projection.
 */
const emitProductEvent = (
  action: "created" | "updated" | "deleted",
): PlanWrapperFn =>
  EXPORTABLE(
    (sideEffect, emitEvent, action): PlanWrapperFn =>
      (plan, $record) => {
        sideEffect([$record], ([record]) => {
          if (!record?.id) return;

          emitEvent(
            `mantle.product.${action}`,
            {
              id: record.id,
              organizationId: record.organizationId,
              sku: record.sku,
              upc: record.upc,
              name: record.name,
              description: record.description,
              costPrice: record.costPrice,
              retailPrice: record.retailPrice,
              unitPrice: record.unitPrice,
              fulfillmentType: record.fulfillmentType,
              supplierId: record.supplierId,
              supplierSku: record.supplierSku,
              weight: record.weight,
              category1: record.category1,
              category2: record.category2,
              imageUrl: record.imageUrl,
              imageUrl2: record.imageUrl2,
              imageUrl3: record.imageUrl3,
              isActive: record.isActive,
              isRestricted: record.isRestricted,
              currentQuantity: record.currentQuantity,
              channels: record.channels,
            },
            record.id,
          );
        });

        return plan();
      },
    [sideEffect, emitEvent, action],
  );

/**
 * Emit an enriched invoice event with fields needed by MyFi for journal entries.
 */
const emitInvoiceEvent = (
  action: "created" | "updated" | "deleted",
): PlanWrapperFn =>
  EXPORTABLE(
    (sideEffect, emitEvent, action): PlanWrapperFn =>
      (plan, $record) => {
        sideEffect([$record], ([record]) => {
          if (!record?.id) return;

          emitEvent(
            `mantle.invoice.${action}`,
            {
              id: record.id,
              organizationId: record.organizationId,
              companyId: record.companyId,
              contactId: record.contactId,
              invoiceNumber: record.invoiceNumber,
              status: record.status,
              total: record.total,
              currency: record.currency,
              issueDate: record.issueDate,
              dueDate: record.dueDate,
              paidAt: record.paidAt,
              paymentReference: record.paymentReference,
            },
            record.id,
          );
        });

        return plan();
      },
    [sideEffect, emitEvent, action],
  );

/**
 * Emit an enriched payment event with fields needed by MyFi to book per-payment
 * facts. Mantle is the system of record for payments against an invoice; MyFi
 * correlates each payment to the invoice it already tracks via `invoiceId`, so
 * the event carries the payment's own columns rather than re-reading the parent.
 *
 * Closes the Mantle to MyFi payment gap: without this, MyFi only ever sees an
 * invoice flip to `paid` and books the whole total at once, never the partial
 * or per-payment detail. The `<entity>.<action>` shape (`payment.created` etc.)
 * is the stable cross-product contract; the `mantle.` prefix is provenance.
 */
const emitPaymentEvent = (
  action: "created" | "updated" | "deleted",
): PlanWrapperFn =>
  EXPORTABLE(
    (sideEffect, emitEvent, action): PlanWrapperFn =>
      (plan, $record) => {
        sideEffect([$record], ([record]) => {
          if (!record?.id) return;

          emitEvent(
            `mantle.payment.${action}`,
            {
              id: record.id,
              invoiceId: record.invoiceId,
              amount: record.amount,
              paidAt: record.paidAt,
              reference: record.reference,
              method: record.method,
            },
            record.id,
          );
        });

        return plan();
      },
    [sideEffect, emitEvent, action],
  );

/**
 * Emit an enriched quote event with fields needed by MyFi for journal entries.
 */
const emitQuoteEvent = (
  action: "created" | "updated" | "deleted",
): PlanWrapperFn =>
  EXPORTABLE(
    (sideEffect, emitEvent, action): PlanWrapperFn =>
      (plan, $record) => {
        sideEffect([$record], ([record]) => {
          if (!record?.id) return;

          emitEvent(
            `mantle.quote.${action}`,
            {
              id: record.id,
              organizationId: record.organizationId,
              companyId: record.companyId,
              contactId: record.contactId,
              quoteNumber: record.quoteNumber,
              status: record.status,
              total: record.total,
              currency: record.currency,
              validUntil: record.validUntil,
              convertedInvoiceId: record.convertedInvoiceId,
            },
            record.id,
          );
        });

        return plan();
      },
    [sideEffect, emitEvent, action],
  );

/**
 * Event emission plugin for Mantle mutations.
 *
 * Emits CloudEvents to Vortex for company, invoice, payment, quote, product, and person lifecycle.
 */
const EventEmissionPlugin = wrapPlans({
  Mutation: {
    createCompany: emitOnMutate("company", "created"),
    updateCompany: emitOnMutate("company", "updated"),
    deleteCompany: emitOnMutate("company", "deleted"),
    createInvoice: emitInvoiceEvent("created"),
    updateInvoice: emitInvoiceEvent("updated"),
    deleteInvoice: emitInvoiceEvent("deleted"),
    createQuote: emitQuoteEvent("created"),
    updateQuote: emitQuoteEvent("updated"),
    deleteQuote: emitQuoteEvent("deleted"),
    createPayment: emitPaymentEvent("created"),
    updatePayment: emitPaymentEvent("updated"),
    deletePayment: emitPaymentEvent("deleted"),
    createProduct: emitProductEvent("created"),
    updateProduct: emitProductEvent("updated"),
    deleteProduct: emitOnMutate("product", "deleted"),
    createPerson: emitOnMutate("person", "created"),
    updatePerson: emitOnMutate("person", "updated"),
    deletePerson: emitOnMutate("person", "deleted"),
    createDocumentNumberingConfig: emitOnMutate(
      "documentNumberingConfig",
      "created",
    ),
    updateDocumentNumberingConfig: emitOnMutate(
      "documentNumberingConfig",
      "updated",
    ),
    deleteDocumentNumberingConfig: emitOnMutate(
      "documentNumberingConfig",
      "deleted",
    ),
  },
});

export default EventEmissionPlugin;
