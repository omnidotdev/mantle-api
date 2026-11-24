import { describe, expect, test } from "bun:test";

import { entitlementsToLimits } from "lib/entitlements";

const response = (values: Record<string, string | null>) => ({
  billingAccountId: "ba",
  entityType: "organization",
  entityId: "org",
  entitlementVersion: 1,
  entitlements: Object.entries(values).map(([featureKey, value], i) => ({
    id: String(i),
    productId: "mantle",
    featureKey,
    value,
    source: "subscription",
    validFrom: "2026-01-01T00:00:00Z",
    validUntil: null,
  })),
});

describe("entitlementsToLimits", () => {
  test("reads limits Aether returns, plain or app-prefixed", () => {
    const { tier, limits } = entitlementsToLimits(
      response({ tier: "free", max_contacts: "10", "mantle:max_invoices_per_month": "3" }),
    );
    expect(tier).toBe("free");
    expect(limits.max_contacts).toBe(10);
    expect(limits.max_invoices_per_month).toBe(3);
  });

  test("a missing or unparseable limit falls back to the tier default", () => {
    const { limits } = entitlementsToLimits(
      response({ tier: "free", max_contacts: "lots" }),
    );
    expect(limits.max_contacts).toBe(50);
    expect(limits.max_invoices_per_month).toBe(5);
    expect(limits.max_team_members).toBe(1);
  });

  test("paid tiers default to unlimited contacts and invoices", () => {
    for (const tier of ["pro", "team"]) {
      const { limits } = entitlementsToLimits(response({ tier }));
      expect(limits.max_contacts).toBe(-1);
      expect(limits.max_invoices_per_month).toBe(-1);
    }
  });

  test("\"unlimited\" and -1 both mean no limit", () => {
    const { limits } = entitlementsToLimits(
      response({ tier: "free", max_contacts: "unlimited", max_invoices_per_month: "-1" }),
    );
    expect(limits.max_contacts).toBe(-1);
    expect(limits.max_invoices_per_month).toBe(-1);
  });

  test("no tier means the free tier", () => {
    const { tier, limits } = entitlementsToLimits(response({}));
    expect(tier).toBe("free");
    expect(limits.max_contacts).toBe(50);
  });
});
