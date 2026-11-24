import { describe, expect, test } from "bun:test";

import { adminOrganizationIds, withHydratedRoles } from "lib/authz";

/**
 * Access tokens list workspace ids only, so roles are filled in from userinfo.
 * Membership always comes from the token
 */
describe("withHydratedRoles", () => {
  const slim = [
    { id: "org-a", roles: [] },
    { id: "org-b", roles: [] },
  ];

  test("fills roles for the token's workspaces from userinfo", async () => {
    const claims = await withHydratedRoles(slim, async () => [
      { id: "org-a", roles: ["owner"] },
      { id: "org-b", roles: ["member"] },
    ]);
    expect(adminOrganizationIds(claims)).toEqual(["org-a"]);
  });

  test("never adds a workspace the token does not list", async () => {
    const claims = await withHydratedRoles(slim, async () => [
      { id: "org-a", roles: ["member"] },
      { id: "org-x", roles: ["owner"] },
    ]);
    expect(claims.map((org) => org.id)).toEqual(["org-a", "org-b"]);
    expect(adminOrganizationIds(claims)).toEqual([]);
  });

  test("a failed lookup leaves roles empty, so admin actions fail closed", async () => {
    const claims = await withHydratedRoles(slim, async () => {
      throw new Error("userinfo down");
    });
    expect(claims).toEqual(slim);
    expect(adminOrganizationIds(claims)).toEqual([]);
  });

  test("a token that already carries roles is used as is", async () => {
    let called = false;
    const rich = [{ id: "org-a", roles: ["admin"] }];
    const claims = await withHydratedRoles(rich, async () => {
      called = true;
      return [];
    });
    expect(called).toBe(false);
    expect(adminOrganizationIds(claims)).toEqual(["org-a"]);
  });
});
