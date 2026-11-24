import { describe, expect, test } from "bun:test";

import {
  OMNI_CLAIMS_ORGANIZATIONS,
  personalWorkspaceId,
  resolveOrganizationIds,
  toPgTextArray,
} from "lib/auth/workspaceClaims";

/**
 * Workspace resolution for signed-in callers, including tokens from a
 * self-hosted OpenID Connect provider: subjects that are not UUIDs and tokens
 * that carry no workspace claims
 */
describe("workspace claims", () => {
  const on = { personalFallback: true };
  const off = { personalFallback: false };

  test("reads workspace ids from the organizations claim", () => {
    const claims = {
      sub: "user-1",
      [OMNI_CLAIMS_ORGANIZATIONS]: [{ id: "org-a" }, { id: "org-b" }],
    };

    expect(resolveOrganizationIds(claims, off)).toEqual(["org-a", "org-b"]);
    // the fallback never replaces real workspaces
    expect(resolveOrganizationIds(claims, on)).toEqual(["org-a", "org-b"]);
  });

  test("a token without the claim has no workspaces unless the fallback is on", () => {
    const claims = { sub: "alice@example.com" };

    expect(resolveOrganizationIds(claims, off)).toEqual([]);
    expect(resolveOrganizationIds(claims, on)).toEqual([
      personalWorkspaceId("alice@example.com"),
    ]);
  });

  test("an empty claim falls back the same way", () => {
    const claims = { sub: "auth0|123", [OMNI_CLAIMS_ORGANIZATIONS]: [] };

    expect(resolveOrganizationIds(claims, on)).toEqual([
      personalWorkspaceId("auth0|123"),
    ]);
  });

  test("ignores malformed entries and never grants the service wildcard", () => {
    const claims = {
      sub: "user-1",
      [OMNI_CLAIMS_ORGANIZATIONS]: [
        { id: "*" },
        { id: "" },
        { id: 42 },
        null,
        { slug: "no-id" },
        { id: "org-a" },
      ],
    };

    expect(resolveOrganizationIds(claims, off)).toEqual(["org-a"]);
  });

  test("no subject means no personal workspace", () => {
    expect(resolveOrganizationIds({}, on)).toEqual([]);
  });

  test("personal workspace ids are stable, distinct, and URL and SQL safe", () => {
    const subjects = [
      "alice@example.com",
      "auth0|123",
      'weird, "sub" {with} \\ chars',
      "3f1c2b0e-8d6a-4f3e-9b1a-2c4d5e6f7a8b",
    ];
    const ids = subjects.map(personalWorkspaceId);

    expect(new Set(ids).size).toBe(subjects.length);
    for (const [i, id] of ids.entries()) {
      expect(id).toMatch(/^personal-[0-9a-f]{32}$/);
      expect(personalWorkspaceId(subjects[i] as string)).toBe(id);
    }
  });

  test("derives the same id as mantle-app", () => {
    // fixed vector shared with mantle-app's personalWorkspace test
    expect(personalWorkspaceId("alice@example.com")).toBe(
      "personal-ff8d9819fc0e12bf0d24892e45987e24",
    );
  });

  test("serializes ids as a quoted Postgres array literal", () => {
    expect(toPgTextArray([])).toBe("{}");
    expect(toPgTextArray(["org-a", "org-b"])).toBe('{"org-a","org-b"}');
    expect(toPgTextArray(['a,b', 'q"t', "b\\s", "{x}"])).toBe(
      '{"a,b","q\\"t","b\\\\s","{x}"}',
    );
  });
});
