import { isSafePaymentLink } from "lib/invoices/paymentLink";

import type { SelectCompany } from "lib/db/schema/company.table";
import type { SelectInvoice } from "lib/db/schema/invoice.table";
import type { SelectInvoiceLineItem } from "lib/db/schema/invoiceLineItem.table";
import type { SelectPerson } from "lib/db/schema/person.table";

type InvoicePdfData = {
  invoice: SelectInvoice;
  lineItems: SelectInvoiceLineItem[];
  company: SelectCompany | null;
  contact: SelectPerson | null;
  accentColor: string;
};

const esc = (s: string | null | undefined): string => {
  if (!s) return "";

  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
};

const fmtCurrency = (value: string | null | undefined): string => {
  const n = Number.parseFloat(value ?? "0");

  return `$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const fmtDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "";

  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

/**
 * Render a complete HTML document for an invoice, suitable for print-to-PDF.
 */
const renderInvoiceHtml = (data: InvoicePdfData): string => {
  const { invoice, lineItems, company, contact, accentColor } = data;

  const billToLines: string[] = [];

  if (invoice.billTo) {
    billToLines.push(esc(invoice.billTo));
  } else if (company) {
    billToLines.push(esc(company.name));
    if (company.addressLine1) billToLines.push(esc(company.addressLine1));
    if (company.addressLine2) billToLines.push(esc(company.addressLine2));

    const cityStateZip = [company.city, company.state, company.postalCode]
      .filter(Boolean)
      .join(", ");

    if (cityStateZip) billToLines.push(esc(cityStateZip));
    if (company.country) billToLines.push(esc(company.country));
  }

  if (contact) {
    const contactName = [contact.firstName, contact.lastName]
      .filter(Boolean)
      .join(" ");

    if (contactName && !billToLines.includes(esc(contactName))) {
      billToLines.unshift(esc(contactName));
    }
  }

  const lineItemsHtml = lineItems
    .map(
      (li) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb;">${esc(li.description)}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${Number.parseFloat(li.quantity).toLocaleString()}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${fmtCurrency(li.unitPrice)}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 500;">${fmtCurrency(li.amount)}</td>
      </tr>`,
    )
    .join("\n");

  const taxSection =
    invoice.taxRate && Number.parseFloat(invoice.taxRate) > 0
      ? `
      <tr>
        <td colspan="3" style="padding: 6px 12px; text-align: right; color: #6b7280;">Tax (${Number.parseFloat(invoice.taxRate)}%)</td>
        <td style="padding: 6px 12px; text-align: right;">${fmtCurrency(invoice.taxAmount)}</td>
      </tr>`
      : "";

  const statusBadge =
    invoice.status === "paid"
      ? '<span style="background: #dcfce7; color: #166534; padding: 2px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase;">Paid</span>'
      : invoice.status === "void"
        ? '<span style="background: #fef2f2; color: #991b1b; padding: 2px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase;">Void</span>'
        : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${esc(invoice.invoiceNumber)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #111827; font-size: 14px; line-height: 1.5; }
    @page { size: A4; margin: 0; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div style="max-width: 800px; margin: 0 auto; padding: 40px;">
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
      <div>
        <h1 style="font-size: 32px; font-weight: 700; color: ${esc(accentColor)};">INVOICE</h1>
        <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">${esc(invoice.invoiceNumber)}</p>
      </div>
      <div style="text-align: right;">
        ${statusBadge}
      </div>
    </div>

    <!-- Invoice details -->
    <div style="display: flex; justify-content: space-between; margin-bottom: 32px;">
      <div>
        <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 8px;">Bill To</h3>
        ${billToLines.map((line) => `<p>${line}</p>`).join("\n        ")}
      </div>
      <div style="text-align: right;">
        <div style="margin-bottom: 8px;">
          <span style="color: #6b7280; font-size: 12px;">Issue Date</span>
          <p style="font-weight: 500;">${fmtDate(invoice.issueDate)}</p>
        </div>
        ${
          invoice.dueDate
            ? `<div style="margin-bottom: 8px;">
          <span style="color: #6b7280; font-size: 12px;">Due Date</span>
          <p style="font-weight: 500;">${fmtDate(invoice.dueDate)}</p>
        </div>`
            : ""
        }
        ${
          invoice.paidAt
            ? `<div>
          <span style="color: #6b7280; font-size: 12px;">Paid</span>
          <p style="font-weight: 500;">${fmtDate(invoice.paidAt)}</p>
        </div>`
            : ""
        }
      </div>
    </div>

    <!-- Line items -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <thead>
        <tr style="background: ${esc(accentColor)}10;">
          <th style="padding: 10px 12px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: ${esc(accentColor)}; border-bottom: 2px solid ${esc(accentColor)}30;">Description</th>
          <th style="padding: 10px 12px; text-align: right; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: ${esc(accentColor)}; border-bottom: 2px solid ${esc(accentColor)}30;">Qty</th>
          <th style="padding: 10px 12px; text-align: right; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: ${esc(accentColor)}; border-bottom: 2px solid ${esc(accentColor)}30;">Unit Price</th>
          <th style="padding: 10px 12px; text-align: right; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: ${esc(accentColor)}; border-bottom: 2px solid ${esc(accentColor)}30;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${lineItemsHtml}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="padding: 6px 12px; text-align: right; color: #6b7280;">Subtotal</td>
          <td style="padding: 6px 12px; text-align: right;">${fmtCurrency(invoice.subtotal)}</td>
        </tr>
        ${taxSection}
        <tr style="border-top: 2px solid ${esc(accentColor)};">
          <td colspan="3" style="padding: 12px; text-align: right; font-size: 16px; font-weight: 700;">Total</td>
          <td style="padding: 12px; text-align: right; font-size: 16px; font-weight: 700; color: ${esc(accentColor)};">${fmtCurrency(invoice.total)}</td>
        </tr>
      </tfoot>
    </table>

    ${
      invoice.notes
        ? `<!-- Notes -->
    <div style="margin-top: 32px; padding: 16px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
      <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 8px;">Notes</h3>
      <p style="color: #374151; white-space: pre-wrap;">${esc(invoice.notes)}</p>
    </div>`
        : ""
    }

    ${
      // Only an https link is ever rendered, whatever is stored
      isSafePaymentLink(invoice.paymentLinkUrl)
        ? `<!-- Payment link -->
    <div style="margin-top: 24px; text-align: center;">
      <a href="${esc(invoice.paymentLinkUrl.trim())}" style="display: inline-block; padding: 12px 32px; background: ${esc(accentColor)}; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Pay now</a>
    </div>`
        : ""
    }
  </div>
</body>
</html>`;
};

export default renderInvoiceHtml;
