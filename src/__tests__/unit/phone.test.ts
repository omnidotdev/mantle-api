import { describe, expect, it } from "bun:test";

import { resolveRegion, toE164 } from "lib/phone";

describe("toE164", () => {
  it("normalizes US national numbers to E.164", () => {
    expect(toE164("(415) 555-2671")).toBe("+14155552671");
    expect(toE164("4155552671")).toBe("+14155552671");
  });

  it("is idempotent on E.164 input", () => {
    expect(toE164("+14155552671")).toBe("+14155552671");
    expect(toE164(toE164("(415) 555-2671"))).toBe("+14155552671");
  });

  it("respects an explicit region and international prefixes", () => {
    expect(toE164("020 7946 0000", "GB")).toBe("+442079460000");
    expect(toE164("+44 20 7946 0000")).toBe("+442079460000");
    expect(toE164("0044 20 7946 0000")).toBe("+442079460000");
  });

  it("returns null for empty input and preserves unparseable values", () => {
    expect(toE164("")).toBeNull();
    expect(toE164(null)).toBeNull();
    expect(toE164("ext 204")).toBe("ext 204");
  });
});

describe("resolveRegion", () => {
  it("accepts ISO codes and common names, defaulting to US", () => {
    expect(resolveRegion("gb")).toBe("GB");
    expect(resolveRegion("United Kingdom")).toBe("GB");
    expect(resolveRegion(null)).toBe("US");
    expect(resolveRegion("Freedonia")).toBe("US");
  });
});
