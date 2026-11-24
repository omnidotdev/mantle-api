import { beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { useGrafast } from "grafast/envelop";
import { createYoga } from "graphql-yoga";
import { SignJWT, exportJWK, generateKeyPair } from "jose";
import { HttpResponse, http } from "msw";
import { createWithPgClient } from "postgraphile/adaptors/pg";

import authenticationPlugin from "lib/graphql/plugins/authentication.plugin";
import { mswServer } from "test/setup/mswServer";
import { setupTestContext } from "test/setup/testContext";

/**
 * Pre-launch security review: the real authentication plugin, end to end.
 *
 * Every other integration test injects the caller's workspaces straight into
 * the GraphQL context; these sign real tokens against a mock JWKS and send
 * them through the authentication plugin, attacking token verification
 * itself. `[finding]` tests covered a real weakness and failed before the fix
 * that ships beside them
 */

const JWKS_URL = process.env.AUTH_JWKS_URL ?? "http://localhost:9999";
const AUDIENCE = process.env.AUTH_AUDIENCE ?? "https://api.mantle.test";
const CLAIMS = "https://manifold.omni.dev/@omni/claims/organizations";
const ORG_A = "org-victim";
const KID = "security-review-key";

const keys = await generateKeyPair("RS256");
const forged = await generateKeyPair("RS256");
const publicJwk = { ...(await exportJWK(keys.publicKey)), kid: KID, alg: "RS256", use: "sig" };

const sign = (
  payload: Record<string, unknown>,
  {
    key = keys.privateKey,
    audience = AUDIENCE as string | null,
    expiresIn = 3600,
  } = {},
) => {
  const now = Math.floor(Date.now() / 1000);
  let jwt = new SignJWT(payload)
    .setProtectedHeader({ alg: "RS256", kid: KID })
    .setSubject("user-a")
    .setIssuer(JWKS_URL)
    .setIssuedAt(now - 10)
    .setExpirationTime(now + expiresIn);
  if (audience) jwt = jwt.setAudience(audience);
  return jwt.sign(key);
};

const memberOfA = { [CLAIMS]: [{ id: ORG_A, roles: ["owner"] }] };

describe("security review: token verification", () => {
  const ctx = setupTestContext();

  beforeAll(() => {
    mswServer.use(
      http.get(`${JWKS_URL}/`, () => HttpResponse.json({ keys: [publicJwk] })),
    );
  });

  beforeEach(async () => {
    // afterEach resets handlers; keep serving the JWKS
    mswServer.use(
      http.get(`${JWKS_URL}/`, () => HttpResponse.json({ keys: [publicJwk] })),
    );
    await ctx.pool.query(
      "insert into person (organization_id, first_name, last_name) values ($1, 'Vic', 'Tim')",
      [ORG_A],
    );
  });

  /** The server's GraphQL pipeline: the authentication plugin, then Grafast */
  const server = () => {
    const { pool, db } = globalThis.__TEST_DATABASE__;
    return createYoga({
      schema: globalThis.__TEST_SCHEMA__,
      plugins: [authenticationPlugin, useGrafast()],
      context: async ({ request }) => ({
        request,
        db,
        withPgClient: createWithPgClient({ pool }),
        pgSubscriber: null,
      }),
    });
  };

  const peopleSeen = async (headers: Record<string, string>) => {
    const res = await server().fetch("http://localhost:4001/graphql", {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify({ query: "{ people { totalCount } }" }),
    });
    const body = (await res.json()) as {
      data?: { people?: { totalCount: number } };
    };
    return body.data?.people?.totalCount;
  };

  const bearer = (token: string) => ({ authorization: `Bearer ${token}` });

  test("a valid token for this API reads its own workspace", async () => {
    expect(await peopleSeen(bearer(await sign(memberOfA)))).toBe(1);
  });

  test("[finding] a token minted for another product's API is refused", async () => {
    const token = await sign(memberOfA, {
      audience: "https://api.other-product.test",
    });
    expect(await peopleSeen(bearer(token))).toBe(0);
  });

  test("[finding] a token without an audience is refused", async () => {
    const token = await sign(memberOfA, { audience: null });
    expect(await peopleSeen(bearer(token))).toBe(0);
  });

  test("a token signed by another key under the same kid is refused", async () => {
    const token = await sign(memberOfA, { key: forged.privateKey });
    expect(await peopleSeen(bearer(token))).toBe(0);
  });

  test("an expired token is refused", async () => {
    const token = await sign(memberOfA, { expiresIn: -60 });
    expect(await peopleSeen(bearer(token))).toBe(0);
  });

  test("an unsigned (alg: none) token is refused", async () => {
    const enc = (v: unknown) => Buffer.from(JSON.stringify(v)).toString("base64url");
    const token = `${enc({ alg: "none", kid: KID })}.${enc({
      sub: "user-a",
      aud: AUDIENCE,
      exp: Math.floor(Date.now() / 1000) + 3600,
      ...memberOfA,
    })}.`;
    expect(await peopleSeen(bearer(token))).toBe(0);
  });

  test("a token claiming the service wildcard workspace gets no service access", async () => {
    const token = await sign({ [CLAIMS]: [{ id: "*", roles: ["owner"] }] });
    expect(await peopleSeen(bearer(token))).toBe(0);
  });

  test("a wrong or empty service key is anonymous", async () => {
    expect(await peopleSeen({ "x-service-key": "guess" })).toBe(0);
    expect(await peopleSeen({ "x-service-key": "" })).toBe(0);
  });
});
