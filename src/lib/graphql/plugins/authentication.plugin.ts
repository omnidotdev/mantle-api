import { useGenericAuth } from "@envelop/generic-auth";
import { createOrganizationHydrator } from "@omnidotdev/providers/auth";
import { createRemoteJWKSet, jwtVerify } from "jose";

import {
  OMNI_CLAIMS_ORGANIZATIONS,
  personalWorkspaceId,
  resolveOrganizationIds,
  toPgTextArray,
} from "lib/auth/workspaceClaims";
import { adminOrganizationIds, withHydratedRoles } from "lib/authz";
import {
  AUTH_AUDIENCE,
  AUTH_ISSUER,
  AUTH_JWKS_URL,
  AUTH_USERINFO_URL,
  SERVICE_KEY,
  personalWorkspaceFallback,
} from "lib/config/env.config";

import type { ResolveUserFn } from "@envelop/generic-auth";
import type { JWTPayload } from "jose";
import type { OrganizationClaim } from "lib/authz";
import type { GraphQLContext } from "lib/graphql/createGraphqlContext";

interface MantleJWTPayload extends JWTPayload {
  sub: string;
  email?: string;
  name?: string;
  [OMNI_CLAIMS_ORGANIZATIONS]?: unknown;
}

/**
 * Observer type - represents the authenticated entity.
 */
export interface Observer {
  id: string;
  email?: string;
  name?: string;
}

/**
 * Every GUC the scope SQL reads, set on every auth path: on a pooled backend
 * an unset GUC reads back as '' (not NULL), never as another request's value
 */
const ANONYMOUS_PG_SETTINGS = {
  "app.service_auth": "false",
  "app.organization_ids": "{}",
  "app.admin_organization_ids": "{}",
};

/**
 * The roles each granted workspace's claim carries (none, for the slim
 * `{ id }` claim Gatekeeper puts in access tokens)
 */
const claimedRoles = (raw: unknown, ids: string[]): OrganizationClaim[] => {
  const entries = Array.isArray(raw) ? raw : [];

  return ids.map((id) => {
    const entry = entries.find(
      (o) => !!o && typeof o === "object" && (o as { id?: unknown }).id === id,
    ) as { roles?: unknown } | undefined;
    const roles = Array.isArray(entry?.roles)
      ? entry.roles.filter((r): r is string => typeof r === "string")
      : [];

    return { id, roles };
  });
};

const jwks = AUTH_JWKS_URL ? createRemoteJWKSet(new URL(AUTH_JWKS_URL)) : null;

/**
 * Pin the token's audience (and issuer) when configured: the identity provider
 * signs tokens for every product's API with the same keys, so without a pinned
 * audience a token minted for another product, or another client, would act
 * here with the caller's full workspace access
 */
const audiences = AUTH_AUDIENCE?.split(",")
  .map((aud) => aud.trim())
  .filter(Boolean);
const verifyOptions = {
  ...(audiences?.length ? { audience: audiences } : {}),
  ...(AUTH_ISSUER ? { issuer: AUTH_ISSUER } : {}),
};

/**
 * Access tokens carry workspace ids only (Gatekeeper slims the claim), so the
 * caller's role in each workspace comes from userinfo, cached per user for a
 * minute. Membership itself always comes from the verified token
 */
const userinfoUrl =
  AUTH_USERINFO_URL ??
  (AUTH_JWKS_URL
    ? new URL("/oauth2/userinfo", AUTH_JWKS_URL).toString()
    : null);
const roleHydrator = userinfoUrl
  ? createOrganizationHydrator({ userinfoUrl, logPrefix: "[auth]" })
  : null;

/**
 * Validate user session via JWKS token or service key.
 * Sets pgSettings and organizationIds on the GraphQL context
 * for SQL-level organization scoping.
 * @see https://the-guild.dev/graphql/envelop/plugins/use-generic-auth#getting-started
 */
const resolveUser: ResolveUserFn<Observer, GraphQLContext> = async (ctx) => {
  // Check for service-to-service auth via x-service-key header
  const serviceKey = ctx.request.headers.get("x-service-key");
  if (serviceKey && SERVICE_KEY && serviceKey === SERVICE_KEY) {
    // Service key gets unrestricted access (internal services need cross-org queries)
    // The wildcard '*' is handled by the pgSettings SQL: ANY('{*}') won't match,
    // but service key auth bypasses the scope plugin because organizationIds
    // contains '*' which the sideEffect checks handle
    (ctx as GraphQLContext).organizationIds = ["*"];
    (ctx as GraphQLContext).organizations = [];
    (ctx as GraphQLContext).pgSettings = {
      "app.user_id": "service:internal",
      // Service key: select all rows (no org filter applied via a permissive condition)
      "app.service_auth": "true",
      // Set explicitly even though `app.service_auth` short-circuits the scope
      // predicate: on a pooled backend an unset GUC reads back as '' (not NULL),
      // so every auth path must set every GUC the scope SQL reads
      "app.organization_ids": "{}",
      "app.admin_organization_ids": "{}",
    };

    return {
      id: "service:internal",
      email: "service@internal",
      name: "Internal Service",
    };
  }

  // Fall back to JWT bearer token
  const accessToken = ctx.request.headers
    .get("authorization")
    ?.split("Bearer ")[1];

  if (!accessToken || !jwks) {
    // Unauthenticated: set empty org IDs (blocks all org-scoped reads)
    (ctx as GraphQLContext).organizationIds = [];
    (ctx as GraphQLContext).organizations = [];
    (ctx as GraphQLContext).pgSettings = ANONYMOUS_PG_SETTINGS;

    return null;
  }

  try {
    const { payload } = await jwtVerify(accessToken, jwks, verifyOptions);
    const claims = payload as MantleJWTPayload;

    // Workspace ids the token grants (never the service wildcard)
    const orgIds = resolveOrganizationIds(claims, {
      personalFallback: personalWorkspaceFallback,
    });

    // A self-hosted caller's derived personal workspace is their own; other
    // workspaces take their roles from the claim, else from userinfo
    const isPersonalFallback =
      personalWorkspaceFallback &&
      orgIds.length === 1 &&
      orgIds[0] === personalWorkspaceId(claims.sub);
    const orgClaims = isPersonalFallback
      ? orgIds.map((id) => ({ id, roles: ["owner"] }))
      : await withHydratedRoles(
          claimedRoles(claims[OMNI_CLAIMS_ORGANIZATIONS], orgIds),
          roleHydrator
            ? () => roleHydrator.hydrate(claims.sub, accessToken)
            : undefined,
        );

    (ctx as GraphQLContext).organizationIds = orgIds;
    (ctx as GraphQLContext).organizations = orgClaims;
    (ctx as GraphQLContext).pgSettings = {
      "app.user_id": claims.sub,
      "app.service_auth": "false",
      "app.organization_ids": toPgTextArray(orgIds),
      "app.admin_organization_ids": toPgTextArray(
        adminOrganizationIds(orgClaims),
      ),
    };

    return {
      id: claims.sub,
      email: claims.email,
      name: claims.name,
    };
  } catch (err) {
    console.error("[auth] JWT verify failed:", err);
    (ctx as GraphQLContext).organizationIds = [];
    (ctx as GraphQLContext).organizations = [];
    (ctx as GraphQLContext).pgSettings = ANONYMOUS_PG_SETTINGS;

    return null;
  }
};

/**
 * Authentication plugin.
 * Uses "resolve-only" mode to allow unauthenticated queries.
 * Organization scoping is enforced by the OrganizationScope plugin.
 * @see https://the-guild.dev/graphql/envelop/plugins/use-generic-auth
 */
const authenticationPlugin = useGenericAuth({
  contextFieldName: "observer",
  resolveUserFn: resolveUser,
  mode: "resolve-only",
});

export default authenticationPlugin;
