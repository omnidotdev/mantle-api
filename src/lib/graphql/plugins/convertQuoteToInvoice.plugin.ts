import { EXPORTABLE } from "graphile-export";
import { gql, makeExtendSchemaPlugin } from "graphile-utils";

interface QuoteRow {
  id: string;
  organization_id: string;
  status: string;
  converted_invoice_id: string | null;
  company_id: string | null;
  contact_id: string | null;
  client_name: string | null;
  client_email: string | null;
  notes: string | null;
  currency: string | null;
  tax_rate: string | null;
  company_name: string | null;
  contact_first_name: string | null;
  contact_last_name: string | null;
}

interface QuoteLineRow {
  id: string;
  description: string;
  quantity: string | null;
  unit_price: string | null;
  amount: string | null;
  pricing_type: string;
  hourly_rate: string | null;
  estimated_hours: string | null;
  product_id: string | null;
}

interface InvoiceRow {
  id: string;
  organization_id: string;
  company_id: string | null;
  contact_id: string | null;
  invoice_number: string;
  status: string;
  total: string | null;
  currency: string | null;
  issue_date: string;
  due_date: string | null;
  paid_at: string | null;
  payment_reference: string | null;
}

type Context = {
  observer?: { id?: string } | null;
  organizationIds?: string[];
};

/**
 * Turn a sent or accepted quote into a draft invoice in one transaction: the
 * invoice (same client, currency, tax rate and notes, numbered from the
 * workspace's invoice sequence), its line items (see lib/quotes for how each
 * pricing type maps), and the quote marked `converted` and linked to it.
 * Either all of it lands or none does.
 *
 * - Authorization matches a generated invoice create: the caller must belong
 *   to the quote's workspace, and Warden may deny it
 * - The quote row is locked (`FOR UPDATE`), so two concurrent conversions of
 *   the same quote serialize and the second is refused as already converted
 * - It counts as an invoice creation against the plan's monthly invoice limit
 *   (recorded in the usage ledger like createInvoice); conversions in one
 *   workspace serialize on an advisory lock so the limit holds under
 *   concurrency
 *
 * Emits `mantle.invoice.created` and `mantle.quote.updated` after commit, with
 * the same payloads as the generated mutations
 */
const ConvertQuoteToInvoicePlugin = makeExtendSchemaPlugin({
  typeDefs: gql`
		input ConvertQuoteToInvoiceInput {
			quoteId: UUID!
		}

		type ConvertQuoteSkippedLineItem {
			rowId: UUID!
			description: String!
			pricingType: String!
		}

		type ConvertQuoteToInvoicePayload {
			invoiceId: UUID!
			invoiceNumber: String!
			"""
			Quote lines left off the invoice (royalty terms with no fixed amount)
			"""
			skippedLineItems: [ConvertQuoteSkippedLineItem!]!
		}

		extend type Mutation {
			convertQuoteToInvoice(
				input: ConvertQuoteToInvoiceInput!
			): ConvertQuoteToInvoicePayload
		}
	`,
  resolvers: {
    Mutation: {
      convertQuoteToInvoice: EXPORTABLE(
        () =>
          async (
            _parent: unknown,
            args: { input: { quoteId: string } },
            context: Context,
          ) => {
            // Lazy imports to avoid capturing class instances in EXPORTABLE
            const { GraphQLError } = await import("graphql");
            const { pgPool } = await import("lib/db/db");
            const { withTransaction } = await import("lib/db/transaction");
            const { nextDocumentNumber } = await import(
              "lib/documents/documentNumber"
            );
            const { hasRoomFor, resolveLimits } = await import(
              "lib/entitlements"
            );
            const { isDeniedByWarden } = await import("lib/authz");
            const { assertWorkspaceAccess } = await import(
              "lib/graphql/workspaceAccess"
            );
            const { limitReached, usedInvoices } = await import(
              "lib/graphql/plugins/authorization/PlanLimits.plugin"
            );
            const {
              CONVERTIBLE_QUOTE_STATUSES,
              quoteLinesToInvoiceLines,
              toBillTo,
            } = await import("lib/quotes/quoteToInvoice");

            const { quoteId } = args.input;

            const notFound = () =>
              new GraphQLError("Quote not found", {
                extensions: { code: "NOT_FOUND" },
              });

            // Signed-in callers only, before anything is read
            if (!context?.observer) assertWorkspaceAccess(context, null);

            // Authorize before taking any lock: membership from the token,
            // then Warden, the same gate as a generated invoice create
            const owner = await pgPool.query<{ organization_id: string }>(
              "SELECT organization_id FROM quote WHERE id = $1::uuid",
              [quoteId],
            );
            const organizationId = owner.rows[0]?.organization_id;
            if (!organizationId) throw notFound();
            assertWorkspaceAccess(context, organizationId);

            const isService = context.organizationIds?.includes("*") ?? false;
            if (
              !isService &&
              (await isDeniedByWarden({
                userId: context.observer?.id,
                organizationId,
                relation: "member",
              }))
            ) {
              throw new GraphQLError("Not authorized for this workspace", {
                extensions: { code: "FORBIDDEN" },
              });
            }

            // A trusted service is never plan limited, like a generated create
            const limit = isService
              ? -1
              : (await resolveLimits(organizationId)).limits
                  .max_invoices_per_month;

            const outcome = await withTransaction(async (query) => {
              // The client and products are taken only from the quote's own
              // workspace, so a stale link to another workspace's record is
              // never copied onto (or printed on) the invoice
              const [quote] = await query<QuoteRow>(
                `SELECT q.id, q.organization_id, q.status, q.converted_invoice_id,
                        c.id AS company_id, p.id AS contact_id,
                        q.client_name, q.client_email,
                        q.notes, q.currency, q.tax_rate,
                        c.name AS company_name,
                        p.first_name AS contact_first_name,
                        p.last_name AS contact_last_name
                   FROM quote q
                   LEFT JOIN company c
                     ON c.id = q.company_id AND c.organization_id = q.organization_id
                   LEFT JOIN person p
                     ON p.id = q.contact_id AND p.organization_id = q.organization_id
                  WHERE q.id = $1::uuid
                    FOR UPDATE OF q`,
                [quoteId],
              );
              // Moved to another workspace between the check and the lock
              if (!quote || quote.organization_id !== organizationId)
                throw notFound();

              if (quote.converted_invoice_id) {
                throw new GraphQLError("This quote already has an invoice", {
                  extensions: {
                    code: "QUOTE_ALREADY_CONVERTED",
                    invoiceId: quote.converted_invoice_id,
                  },
                });
              }
              if (
                !(CONVERTIBLE_QUOTE_STATUSES as readonly string[]).includes(
                  quote.status,
                )
              ) {
                throw new GraphQLError(
                  "Only sent or accepted quotes can be turned into an invoice",
                  { extensions: { code: "QUOTE_NOT_CONVERTIBLE" } },
                );
              }

              // Count this as an invoice creation. Conversions in a workspace
              // serialize here, so two cannot both take the last slot
              await query("SELECT pg_advisory_xact_lock(hashtext($1))", [
                `invoice_created:${organizationId}`,
              ]);
              if (limit >= 0) {
                const used = await usedInvoices(
                  (text, values) => query<Record<string, number>>(text, values),
                  organizationId,
                );
                if (!hasRoomFor(limit, used))
                  throw limitReached("max_invoices_per_month", limit);
              }
              await query(
                "INSERT INTO usage_event (organization_id, metric) VALUES ($1, 'invoice_created')",
                [organizationId],
              );

              const lines = await query<QuoteLineRow>(
                `SELECT l.id, l.description, l.quantity, l.unit_price, l.amount,
                        l.pricing_type, l.hourly_rate, l.estimated_hours,
                        pr.id AS product_id
                   FROM quote_line_item l
                   LEFT JOIN product pr
                     ON pr.id = l.product_id AND pr.organization_id = $2
                  WHERE l.quote_id = $1::uuid
                  ORDER BY l.sort_order NULLS LAST, l.id`,
                [quoteId, organizationId],
              );
              const { lineItems, skipped } = quoteLinesToInvoiceLines(
                lines.map((line) => ({
                  id: line.id,
                  description: line.description,
                  quantity: line.quantity,
                  unitPrice: line.unit_price,
                  amount: line.amount,
                  pricingType: line.pricing_type,
                  hourlyRate: line.hourly_rate,
                  estimatedHours: line.estimated_hours,
                  productId: line.product_id,
                })),
              );

              const invoiceNumber = await nextDocumentNumber(query, {
                organizationId,
                documentType: "invoice",
                companyId: quote.company_id,
              });

              const [created] = await query<{ id: string }>(
                `INSERT INTO invoice
                   (organization_id, invoice_number, company_id, contact_id,
                    bill_to, status, issue_date, notes, currency, tax_rate)
                 VALUES ($1, $2, $3, $4, $5, 'draft',
                         (now() AT TIME ZONE 'UTC')::date, $6, $7, $8)
                 RETURNING id`,
                [
                  organizationId,
                  invoiceNumber,
                  quote.company_id,
                  quote.contact_id,
                  toBillTo({
                    clientName: quote.client_name,
                    clientEmail: quote.client_email,
                    companyName: quote.company_name,
                    contactFirstName: quote.contact_first_name,
                    contactLastName: quote.contact_last_name,
                  }),
                  quote.notes?.trim() ? quote.notes : null,
                  quote.currency || "USD",
                  quote.tax_rate,
                ],
              );
              if (!created) throw new Error("Invoice was not created");
              const invoiceId = created.id;

              for (const line of lineItems) {
                await query(
                  `INSERT INTO invoice_line_item
                     (invoice_id, product_id, description, quantity, unit_price,
                      amount, sort_order)
                   VALUES ($1, $2, $3, $4, $5, round($4::numeric * $5::numeric, 2), $6)`,
                  [
                    invoiceId,
                    line.productId,
                    line.description,
                    line.quantity,
                    line.unitPrice,
                    line.sortOrder,
                  ],
                );
              }

              // Totals from the lines, with the same formula as the invoice
              // totals recompute (each line rounded to cents, tax on the sum)
              const [invoice] = await query<InvoiceRow>(
                `UPDATE invoice i
                    SET subtotal   = agg.s,
                        tax_amount = round(agg.s * coalesce(i.tax_rate, 0) / 100, 2),
                        total      = agg.s + round(agg.s * coalesce(i.tax_rate, 0) / 100, 2)
                   FROM (
                          SELECT coalesce(sum(amount), 0) AS s
                            FROM invoice_line_item
                           WHERE invoice_id = $1
                        ) agg
                  WHERE i.id = $1
                  RETURNING i.id, i.organization_id, i.company_id, i.contact_id,
                            i.invoice_number, i.status, i.total::text, i.currency,
                            i.issue_date::text, i.due_date::text, i.paid_at::text,
                            i.payment_reference`,
                [invoiceId],
              );

              const [updatedQuote] = await query<Record<string, unknown>>(
                `UPDATE quote
                    SET status = 'converted', converted_invoice_id = $2,
                        updated_at = now()
                  WHERE id = $1
                  RETURNING id, organization_id, company_id, contact_id,
                            quote_number, status, total::text, currency,
                            valid_until::text, converted_invoice_id`,
                [quoteId, invoiceId],
              );

              return { invoice, invoiceNumber, skipped, updatedQuote };
            });

            // Emit after commit, so a rolled-back conversion publishes
            // nothing; emission never fails the mutation
            const { invoice, updatedQuote } = outcome;
            void import("lib/providers")
              .then(async ({ events }) => {
                if (invoice) {
                  await events.emit({
                    type: "mantle.invoice.created",
                    data: {
                      id: invoice.id,
                      organizationId: invoice.organization_id,
                      companyId: invoice.company_id,
                      contactId: invoice.contact_id,
                      invoiceNumber: invoice.invoice_number,
                      status: invoice.status,
                      total: invoice.total,
                      currency: invoice.currency,
                      issueDate: invoice.issue_date,
                      dueDate: invoice.due_date,
                      paidAt: invoice.paid_at,
                      paymentReference: invoice.payment_reference,
                    },
                    subject: invoice.id,
                  });
                }
                if (updatedQuote) {
                  await events.emit({
                    type: "mantle.quote.updated",
                    data: {
                      id: updatedQuote.id,
                      organizationId: updatedQuote.organization_id,
                      companyId: updatedQuote.company_id,
                      contactId: updatedQuote.contact_id,
                      quoteNumber: updatedQuote.quote_number,
                      status: updatedQuote.status,
                      total: updatedQuote.total,
                      currency: updatedQuote.currency,
                      validUntil: updatedQuote.valid_until,
                      convertedInvoiceId: updatedQuote.converted_invoice_id,
                    },
                    subject: String(updatedQuote.id),
                  });
                }
              })
              .catch(() => {});

            return {
              invoiceId: invoice?.id,
              invoiceNumber: outcome.invoiceNumber,
              skippedLineItems: outcome.skipped.map((line) => ({
                rowId: line.id,
                description: line.description,
                pricingType: line.pricingType,
              })),
            };
          },
        [],
      ),
    },
  },
});

export default ConvertQuoteToInvoicePlugin;
