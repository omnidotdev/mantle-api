import { describe, expect, test } from "bun:test";

import { toPgTextArray } from "lib/auth/workspaceClaims";
import { setupTestContext } from "test/setup/testContext";

/**
 * The caller's workspace ids reach the scope SQL as a `text[]` literal in a
 * GUC. An id containing a comma or brace used to split into extra elements,
 * so `a,b` would also grant workspace `b`. Every id must round-trip as exactly
 * one element
 */
describe("workspace id array literal", () => {
  const ctx = setupTestContext();

  test("round-trips ids with separators, quotes, and backslashes", async () => {
    const ids = [
      "org-a",
      "a,b",
      "{c}",
      'quote"d',
      "back\\slash",
      "spaced id",
      "personal-0123456789abcdef0123456789abcdef",
    ];

    const { rows } = await ctx.pool.query<{ ids: string[] }>(
      "select $1::text[] as ids",
      [toPgTextArray(ids)],
    );

    expect(rows[0]?.ids).toEqual(ids);
  });

  test("an id with a comma does not grant the workspace after it", async () => {
    const { rows } = await ctx.pool.query<{ granted: boolean }>(
      "select 'b' = any($1::text[]) as granted",
      [toPgTextArray(["a,b"])],
    );

    expect(rows[0]?.granted).toBe(false);
  });
});
