import { describe, expect, test } from "bun:test";
import { HttpResponse, http } from "msw";

import { createAuthzProvider } from "@omnidotdev/providers";

import { providers } from "lib/providers";
import { mswServer } from "test/setup/mswServer";
import { setupTestContext } from "test/setup/testContext";

/**
 * Warden is layered on the JWT workspace claims: it can only add a denial.
 * An explicit denial is enforced only with WARDEN_ENFORCE=true (shadow mode
 * otherwise), and an unreachable Warden falls back to the JWT decision
 */

const WARDEN_URL = "http://warden.test";
const ORG = "org-warden";
const owner = { id: "user-owner", name: "Owner" };

const useWarden = (allowed: boolean | "error") => {
  providers.authz = createAuthzProvider({
    apiUrl: WARDEN_URL,
    serviceKey: "test-authz-key",
  });
  mswServer.use(
    http.post(`${WARDEN_URL}/check`, () =>
      allowed === "error"
        ? HttpResponse.json({ error: "down" }, { status: 503 })
        : HttpResponse.json({ allowed }),
    ),
  );
};

const UPDATE_SETTINGS = /* GraphQL */ `
  mutation ($input: UpdateOrganizationSettingInput!) {
    updateOrganizationSetting(input: $input) { clientMutationId }
  }
`;

describe("Warden role layer", () => {
  const ctx = setupTestContext();

  const seedSettings = async () =>
    (
      await ctx.pool.query<{ id: string }>(
        "insert into organization_settings (organization_id) values ($1) returning id",
        [ORG],
      )
    ).rows[0]!.id;

  const updateSettings = async (rowId: string) =>
    ctx
      .graphqlAs(owner, [ORG], ["owner"])
      .execute(UPDATE_SETTINGS, {
        input: { rowId, patch: { companyName: "Acme" } },
      });

  test("an enforced Warden denial refuses an owner the JWT admitted", async () => {
    const rowId = await seedSettings();
    useWarden(false);
    process.env.WARDEN_ENFORCE = "true";

    expect((await updateSettings(rowId)).errors).toBeDefined();
  });

  test("a Warden denial in shadow mode is logged, not enforced", async () => {
    const rowId = await seedSettings();
    useWarden(false);

    expect((await updateSettings(rowId)).errors).toBeUndefined();
  });

  test("an unreachable Warden falls back to the JWT claims", async () => {
    const rowId = await seedSettings();
    useWarden("error");
    process.env.WARDEN_ENFORCE = "true";

    expect((await updateSettings(rowId)).errors).toBeUndefined();
  });

  test("Warden never widens access the JWT claims refused", async () => {
    const rowId = await seedSettings();
    useWarden(true);

    const asMember = await ctx
      .graphqlAs(owner, [ORG], ["member"])
      .execute(UPDATE_SETTINGS, {
        input: { rowId, patch: { companyName: "Acme" } },
      });
    expect(asMember.errors).toBeDefined();
  });
});
