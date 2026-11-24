import { describe, expect, test } from "bun:test";

import renderInvoiceHtml from "lib/invoices/renderInvoiceHtml";
import {
  PAYMENT_LINK_MAX_LENGTH,
  isSafePaymentLink,
  paymentLinkError,
} from "lib/invoices/paymentLink";

import type { SelectInvoice } from "lib/db/schema/invoice.table";

describe("isSafePaymentLink", () => {
  test("accepts an absolute https link", () => {
    expect(isSafePaymentLink("https://pay.example.com/i/123")).toBe(true);
  });

  test("refuses other schemes, relative links and embedded credentials", () => {
    for (const value of [
      "http://pay.example.com",
      "javascript:alert(1)",
      "data:text/html,hi",
      "pay.example.com/i/1",
      "/pay",
      "https://user:secret@pay.example.com",
      "",
      null,
      42,
    ])
      expect(isSafePaymentLink(value)).toBe(false);
  });

  test("refuses a link over the length limit", () => {
    const long = `https://pay.example.com/${"a".repeat(PAYMENT_LINK_MAX_LENGTH)}`;
    expect(isSafePaymentLink(long)).toBe(false);
    expect(paymentLinkError(long)).toContain("at most");
  });
});

describe("paymentLinkError", () => {
  test("no link is fine", () => {
    expect(paymentLinkError(null)).toBeNull();
    expect(paymentLinkError(undefined)).toBeNull();
    expect(paymentLinkError("  ")).toBeNull();
  });

  test("explains a refused link", () => {
    expect(paymentLinkError("http://pay.example.com")).toBe(
      "Enter a full payment link starting with https://",
    );
  });
});

describe("renderInvoiceHtml payment link", () => {
  const render = (paymentLinkUrl: string | null) =>
    renderInvoiceHtml({
      invoice: {
        invoiceNumber: "INV-1",
        issueDate: "2026-11-01",
        status: "sent",
        paymentLinkUrl,
      } as SelectInvoice,
      lineItems: [],
      company: null,
      contact: null,
      accentColor: "#0d9488",
    });

  test("renders an https link", () => {
    expect(render("https://pay.example.com/i/1")).toContain(
      'href="https://pay.example.com/i/1"',
    );
  });

  test("never renders a non-https link stored before validation", () => {
    for (const link of ["javascript:alert(1)", "http://pay.example.com"]) {
      const html = render(link);
      expect(html).not.toContain("Pay now");
      expect(html).not.toContain(link);
    }
  });
});
