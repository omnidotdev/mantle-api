import { useGenericAuth } from "@envelop/generic-auth";
import { createRemoteJWKSet, jwtVerify } from "jose";

import { AUTH_JWKS_URL, SERVICE_KEY } from "lib/config/env.config";

import type { ResolveUserFn } from "@envelop/generic-auth";
import type { JWTPayload } from "jose";
import type { GraphQLContext } from "lib/graphql/createGraphqlContext";

/** Claim key for organization claims in JWT. */
const OMNI_CLAIMS_ORGANIZATIONS =
  "https://manifold.omni.dev/@omni/claims/organizations";

interface OrganizationClaim {
  id: string;
  slug: string;
  name?: string;
  type: "personal" | "team";
  roles: string[];
}

interface MantleJWTPayload extends JWTPayload {
  sub: string;
  email?: string;
  name?: string;
  [OMNI_CLAIMS_ORGANIZATIONS]?: OrganizationClaim[];
}

/**
 * Observer type - represents the authenticated entity.
 */
export interface Observer {
  id: string;
  email?: string;
  name?: string;
}

const jwks = AUTH_JWKS_URL ? createRemoteJWKSet(new URL(AUTH_JWKS_URL)) : null;

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
    (ctx as GraphQLContext).pgSettings = {
      "app.user_id": "service:internal",
      // Service key: select all rows (no org filter applied via a permissive condition)
      "app.service_auth": "true",
      // Set explicitly even though `app.service_auth` short-circuits the scope
      // predicate: on a pooled backend an unset GUC reads back as '' (not NULL),
      // so every auth path must set every GUC the scope SQL reads
      "app.organization_ids": "{}",
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
    (ctx as GraphQLContext).pgSettings = {
      "app.organization_ids": "{}",
    };

    return null;
  }

  try {
    const { payload } = await jwtVerify(accessToken, jwks);
    const claims = payload as MantleJWTPayload;

    // Extract organization IDs from JWT claims
    const orgClaims = claims[OMNI_CLAIMS_ORGANIZATIONS];
    const orgIds =
      orgClaims && Array.isArray(orgClaims) ? orgClaims.map((o) => o.id) : [];

    (ctx as GraphQLContext).organizationIds = orgIds;
    (ctx as GraphQLContext).pgSettings = {
      "app.user_id": claims.sub,
      "app.organization_ids": `{${orgIds.join(",")}}`,
    };

    return {
      id: claims.sub,
      email: claims.email,
      name: claims.name,
    };
  } catch (err) {
    console.error("[auth] JWT verify failed:", err);
    (ctx as GraphQLContext).organizationIds = [];
    (ctx as GraphQLContext).pgSettings = {
      "app.organization_ids": "{}",
    };

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
