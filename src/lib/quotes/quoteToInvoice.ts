import type { QuoteStatus } from "lib/db/schema/quote.table";
import type { PricingType } from "lib/db/schema/quoteLineItem.table";

/** Quote statuses that can be turned into an invoice */
export const CONVERTIBLE_QUOTE_STATUSES: readonly QuoteStatus[] = [
  "sent",
  "accepted",
];

/** Invoice line built from a quote line (the invoice id is added on insert) */
export interface InvoiceLineDraft {
  description: string;
  quantity: string;
  unitPrice: string;
  productId: string | null;
  sortOrder: number;
}

export interface ConvertibleQuote {
  clientName: string | null;
  clientEmail: string | null;
  companyName: string | null;
  contactFirstName: string | null;
  contactLastName: string | null;
}

export interface ConvertibleLine {
  id: string;
  description: string;
  quantity: string | null;
  unitPrice: string | null;
  amount: string | null;
  pricingType: PricingType | string;
  hourlyRate: string | null;
  estimatedHours: string | null;
  productId: string | null;
}

export interface SkippedLine {
  id: string;
  description: string;
  pricingType: string;
}

/** Parse a numeric string, treating blanks and garbage as 0 */
const toNumber = (value: string | null | undefined): number => {
  const parsed = Number.parseFloat(value ?? "");
  return Number.isFinite(parsed) ? parsed : 0;
};

/** Round to whole cents and render as a plain decimal string */
const toMoney = (value: number): string =>
  (Math.round(value * 100) / 100).toFixed(2);

/**
 * Render a quantity to the 2 decimal places the database stores, without
 * trailing zeros (e.g. 12.5, not 12.500000001)
 */
const toQuantity = (value: number): string =>
  String(Math.round(value * 100) / 100);

/**
 * Map one quote line onto an invoice line, or null when it has nothing to bill
 * up front. Invoice lines are plain quantity times unit price (totals are
 * recomputed that way), so each pricing type is flattened:
 * - fixed: quantity and unit price as quoted
 * - hourly: estimated hours at the hourly rate (0 hours when there is no
 *   estimate, ready to fill in with tracked time)
 * - complimentary and included: listed at no charge so the client sees them
 * - royalty: a share of future revenue, so it is skipped unless the quote gave
 *   it a fixed amount
 */
const toInvoiceLine = (
  item: ConvertibleLine,
): Omit<InvoiceLineDraft, "sortOrder"> | null => {
  const description = item.description.trim();
  if (!description) return null;

  const productId = item.productId ?? null;
  const quantity = toNumber(item.quantity) || 1;
  const unitPrice = toNumber(item.unitPrice);

  const line = (
    label: string,
    qty: number,
    price: number,
  ): Omit<InvoiceLineDraft, "sortOrder"> => ({
    description: label,
    quantity: toQuantity(qty),
    unitPrice: toMoney(price),
    productId,
  });

  switch (item.pricingType) {
    case "hourly": {
      const rate = toNumber(item.hourlyRate);
      if (rate <= 0) return line(description, quantity, unitPrice);
      return line(
        `${description} (hourly)`,
        Math.max(toNumber(item.estimatedHours), 0),
        rate,
      );
    }
    case "royalty":
      return toNumber(item.amount) > 0
        ? line(description, quantity, unitPrice)
        : null;
    case "complimentary":
      return line(`${description} (complimentary)`, quantity, 0);
    case "included":
      return line(`${description} (included)`, quantity, 0);
    default:
      return line(description, quantity, unitPrice);
  }
};

/** Recipient block for the invoice: contact, company (or client), email */
export const toBillTo = (quote: ConvertibleQuote): string | null => {
  const contactName = [quote.contactFirstName, quote.contactLastName]
    .filter(Boolean)
    .join(" ");
  const lines = [
    contactName,
    quote.companyName || quote.clientName,
    quote.clientEmail,
  ].filter((line): line is string => !!line?.trim());

  return lines.length ? lines.join("\n") : null;
};

/**
 * Flatten a quote's lines onto billable invoice lines, in order, reporting the
 * lines left off (royalty terms with no fixed amount). Blank lines are dropped
 * silently
 */
export const quoteLinesToInvoiceLines = (
  lineItems: ConvertibleLine[],
): { lineItems: InvoiceLineDraft[]; skipped: SkippedLine[] } => {
  const mapped: InvoiceLineDraft[] = [];
  const skipped: SkippedLine[] = [];

  for (const item of lineItems) {
    const line = toInvoiceLine(item);
    if (line) {
      mapped.push({ ...line, sortOrder: mapped.length });
    } else if (item.description.trim()) {
      skipped.push({
        id: item.id,
        description: item.description,
        pricingType: item.pricingType,
      });
    }
  }

  return { lineItems: mapped, skipped };
};
