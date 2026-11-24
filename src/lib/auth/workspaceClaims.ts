/**
 * Workspace (organization) resolution for an authenticated caller.
 *
 * Omni Gatekeeper puts the caller's workspaces in a namespaced organizations
 * claim. A self-hosted instance signed in through any other OpenID Connect
 * provider gets no such claim, so with `PERSONAL_WORKSPACE_FALLBACK` on, a
 * caller without workspace claims gets one personal workspace derived from
 * their subject. mantle-app derives the same id, so both sides agree on it
 */

/** Claim key for organization claims in a token */
export const OMNI_CLAIMS_ORGANIZATIONS =
  "https://manifold.omni.dev/@omni/claims/organizations";

/**
 * Deterministic personal workspace id for a subject. The subject is hashed so
 * any subject format works (emails, `provider|id` pairs, UUIDs) and none of it
 * is stored in workspace columns. Must match mantle-app's derivation
 */
export const personalWorkspaceId = (subject: string): string => {
  const hex = new Bun.CryptoHasher("sha256").update(subject).digest("hex");

  return `personal-${hex.slice(0, 32)}`;
};

interface ResolveOptions {
  /** Give a caller without workspace claims a personal workspace */
  personalFallback: boolean;
}

/**
 * Workspace ids a verified token grants. Claim entries without a string id are
 * ignored, as is the `*` wildcard, which is reserved for service-key callers
 * and must never be granted by a token. With the fallback on, a caller with no
 * workspaces gets their personal workspace
 */
export const resolveOrganizationIds = (
  claims: { sub?: string; [key: string]: unknown },
  { personalFallback }: ResolveOptions,
): string[] => {
  const orgClaims = claims[OMNI_CLAIMS_ORGANIZATIONS];

  const ids = Array.isArray(orgClaims)
    ? orgClaims
        .map((org) => (org as { id?: unknown } | null)?.id)
        .filter(
          (id): id is string =>
            typeof id === "string" && id.length > 0 && id !== "*",
        )
    : [];

  if (ids.length === 0 && personalFallback && claims.sub) {
    return [personalWorkspaceId(claims.sub)];
  }

  return ids;
};

/**
 * Serialize ids as a Postgres `text[]` literal. Every element is quoted and
 * escaped, so an id containing a comma, brace, quote, backslash, or whitespace
 * stays one element instead of splitting into (or injecting) other ids
 */
export const toPgTextArray = (ids: readonly string[]): string =>
  `{${ids
    .map((id) => `"${id.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`)
    .join(",")}}`;
