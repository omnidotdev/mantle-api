import { EXPORTABLE } from "graphile-export";
import { gql, makeExtendSchemaPlugin } from "graphile-utils";

import type { GraphQLContext } from "lib/graphql/createGraphqlContext";

const InvoicePdfPlugin = makeExtendSchemaPlugin({
  typeDefs: gql`
		type InvoiceHtmlPayload {
			html: String!
			invoiceNumber: String!
			filename: String!
		}

		extend type Query {
			"""
			Render an invoice as a self-contained HTML document suitable for
			print-to-PDF or embedding in an iframe. The caller must have
			access to the invoice's organization.
			"""
			invoiceHtml(invoiceId: UUID!): InvoiceHtmlPayload
		}
	`,
  resolvers: {
    Query: {
      invoiceHtml: EXPORTABLE(
        () =>
          async (
            _parent: unknown,
            args: { invoiceId: string },
            context: GraphQLContext,
          ) => {
            const { and, eq, asc } = await import("drizzle-orm");
            const { dbPool } = await import("lib/db/db");
            const {
              invoiceTable,
              invoiceLineItemTable,
              companyTable,
              personTable,
              organizationSettingsTable,
            } = await import("lib/db/schema");
            const { default: renderInvoiceHtml } = await import(
              "lib/invoices/renderInvoiceHtml"
            );

            const { invoiceId } = args;
            const { organizationIds } = context;

            if (!organizationIds?.length) {
              throw new Error("Authentication required");
            }

            const [invoice] = await dbPool
              .select()
              .from(invoiceTable)
              .where(eq(invoiceTable.id, invoiceId));

            if (!invoice) {
              throw new Error("Invoice not found");
            }

            // Organization scoping
            if (
              !organizationIds.includes("*") &&
              !organizationIds.includes(invoice.organizationId)
            ) {
              throw new Error("Invoice not found");
            }

            const lineItems = await dbPool
              .select()
              .from(invoiceLineItemTable)
              .where(eq(invoiceLineItemTable.invoiceId, invoiceId))
              .orderBy(asc(invoiceLineItemTable.sortOrder));

            const company = invoice.companyId
              ? ((
                  await dbPool
                    .select()
                    .from(companyTable)
                    // Only the invoice's own workspace: a stale link to
                    // another workspace's company must not render it
                    .where(
                      and(
                        eq(companyTable.id, invoice.companyId),
                        eq(companyTable.organizationId, invoice.organizationId),
                      ),
                    )
                )[0] ?? null)
              : null;

            const contact = invoice.contactId
              ? ((
                  await dbPool
                    .select()
                    .from(personTable)
                    .where(
                      and(
                        eq(personTable.id, invoice.contactId),
                        eq(personTable.organizationId, invoice.organizationId),
                      ),
                    )
                )[0] ?? null)
              : null;

            const [settings] = await dbPool
              .select()
              .from(organizationSettingsTable)
              .where(
                eq(
                  organizationSettingsTable.organizationId,
                  invoice.organizationId,
                ),
              );

            const html = renderInvoiceHtml({
              invoice,
              lineItems,
              company,
              contact,
              accentColor: settings?.accentColor ?? "#0d9488",
            });

            return {
              html,
              invoiceNumber: invoice.invoiceNumber,
              filename: `invoice-${invoice.invoiceNumber}.html`,
            };
          },
        [],
      ),
    },
  },
});

export default InvoicePdfPlugin;
