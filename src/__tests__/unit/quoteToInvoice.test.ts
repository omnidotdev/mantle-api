import { describe, expect, test } from "bun:test";

import { quoteLinesToInvoiceLines, toBillTo } from "lib/quotes/quoteToInvoice";

import type { ConvertibleLine } from "lib/quotes/quoteToInvoice";

const line = (overrides: Partial<ConvertibleLine>): ConvertibleLine => ({
  id: crypto.randomUUID(),
  description: "Work",
  quantity: "1",
  unitPrice: "0",
  amount: "0",
  pricingType: "fixed",
  hourlyRate: null,
  estimatedHours: null,
  productId: null,
  ...overrides,
});

const map = (lines: ConvertibleLine[]) => quoteLinesToInvoiceLines(lines);

describe("toBillTo", () => {
  test("lists the contact, then the company", () => {
    expect(
      toBillTo({
        contactFirstName: "Ada",
        contactLastName: "Lovelace",
        companyName: "Acme",
        clientName: null,
        clientEmail: null,
      }),
    ).toBe("Ada Lovelace\nAcme");
  });

  test("falls back to the free-text client name and email", () => {
    expect(
      toBillTo({
        contactFirstName: null,
        contactLastName: null,
        companyName: null,
        clientName: "Jane Doe",
        clientEmail: "jane@example.com",
      }),
    ).toBe("Jane Doe\njane@example.com");
  });

  test("is null with no client at all", () => {
    expect(
      toBillTo({
        contactFirstName: null,
        contactLastName: null,
        companyName: null,
        clientName: "  ",
        clientEmail: null,
      }),
    ).toBeNull();
  });
});

describe("quoteLinesToInvoiceLines", () => {
  test("keeps fixed lines as quoted", () => {
    expect(
      map([line({ description: "Build", quantity: "2", unitPrice: "1500" })])
        .lineItems,
    ).toEqual([
      {
        description: "Build",
        quantity: "2",
        unitPrice: "1500.00",
        productId: null,
        sortOrder: 0,
      },
    ]);
  });

  test("bills hourly lines as estimated hours at the hourly rate", () => {
    expect(
      map([
        line({
          description: "Support",
          pricingType: "hourly",
          hourlyRate: "150",
          estimatedHours: "12.5",
        }),
      ]).lineItems[0],
    ).toMatchObject({
      description: "Support (hourly)",
      quantity: "12.5",
      unitPrice: "150.00",
    });
  });

  test("bills hourly lines without an estimate at 0 hours", () => {
    expect(
      map([line({ pricingType: "hourly", hourlyRate: "100" })]).lineItems[0],
    ).toMatchObject({ quantity: "0", unitPrice: "100.00" });
  });

  test("treats hourly lines with no rate as quantity times unit price", () => {
    expect(
      map([line({ pricingType: "hourly", quantity: "3", unitPrice: "40" })])
        .lineItems[0],
    ).toMatchObject({ description: "Work", quantity: "3", unitPrice: "40.00" });
  });

  test("lists complimentary and included lines at no charge", () => {
    expect(
      map([
        line({
          description: "Hosting setup",
          pricingType: "complimentary",
          unitPrice: "200",
        }),
        line({ description: "Support", pricingType: "included" }),
      ]).lineItems.map((li) => [li.description, li.unitPrice]),
    ).toEqual([
      ["Hosting setup (complimentary)", "0.00"],
      ["Support (included)", "0.00"],
    ]);
  });

  test("skips royalty lines with no fixed amount and reports them", () => {
    const royalty = line({
      description: "Revenue share",
      pricingType: "royalty",
    });
    const { lineItems, skipped } = map([
      line({ description: "Build", unitPrice: "100" }),
      royalty,
    ]);
    expect(lineItems).toHaveLength(1);
    expect(skipped).toEqual([
      { id: royalty.id, description: "Revenue share", pricingType: "royalty" },
    ]);
  });

  test("bills royalty lines that carry a fixed amount", () => {
    const { lineItems, skipped } = map([
      line({
        pricingType: "royalty",
        quantity: "1",
        unitPrice: "500",
        amount: "500",
      }),
    ]);
    expect(lineItems[0]?.unitPrice).toBe("500.00");
    expect(skipped).toHaveLength(0);
  });

  test("drops blank lines and renumbers sort order", () => {
    const { lineItems, skipped } = map([
      line({ description: "  " }),
      line({ description: "First" }),
      line({ description: "Second" }),
    ]);
    expect(lineItems.map((li) => [li.description, li.sortOrder])).toEqual([
      ["First", 0],
      ["Second", 1],
    ]);
    expect(skipped).toHaveLength(0);
  });

  test("defaults a blank quantity to 1 and passes the product through", () => {
    expect(
      map([line({ quantity: "", unitPrice: "9.99", productId: "product-1" })])
        .lineItems[0],
    ).toMatchObject({ quantity: "1", unitPrice: "9.99", productId: "product-1" });
  });
});
