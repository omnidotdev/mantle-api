/**
 * Workspace role checks.
 *
 * The verified JWT organization claims are the baseline gate: a caller is a
 * member of the workspaces in its token, with the roles listed there. Warden is
 * layered on top and can only ADD a denial, never widen access:
 *
 * - `AUTHZ_API_URL` unset: Warden is not consulted
 * - Warden unreachable or erroring: fail open to the JWT decision, so an authz
 *   outage never locks an owner or admin out of their workspace
 * - Warden denies, `WARDEN_ENFORCE=true`: hard deny
 * - Warden denies, not enforced: shadow mode, logged only, until workspace
 *   membership tuples are confirmed in Warden
 */

import { GraphQLError } from "graphql";

import { providers } from "lib/providers";

import type { WardenRelation } from "@omnidotdev/providers";

/** A workspace the caller belongs to, from the JWT organization claims */
export interface OrganizationClaim {
  id: string;
  slug?: string;
  name?: string;
  type?: "personal" | "team";
  roles: string[];
}

type OrganizationRelation = WardenRelation<"organization">;

/** Roles that may manage a workspace (settings, numbering, sales channels) */
const ADMIN_ROLES: readonly string[] = ["owner", "admin"];

const isWardenEnforced = (): boolean => process.env.WARDEN_ENFORCE === "true";

/**
 * Decide whether Warden denies a caller the JWT claims already admitted. Only
 * call this AFTER the JWT gate has passed: it never grants access
 */
export const isDeniedByWarden = async ({
  userId,
  organizationId,
  relation,
}: {
  userId: string | null | undefined;
  organizationId: string;
  relation: OrganizationRelation;
}): Promise<boolean> => {
  const { authz } = providers;
  if (!userId || !authz) return false;

  let allowed: boolean;
  try {
    allowed = await authz.checkPermission(
      userId,
      "organization",
      organizationId,
      relation,
    );
  } catch (err) {
    console.warn(
      "[authz] Warden check unavailable, falling back to JWT workspace claims:",
      err instanceof Error ? err.message : err,
    );
    return false;
  }

  if (allowed) return false;

  const detail = { organizationId, relation };
  if (isWardenEnforced()) {
    console.warn("[authz] Warden denied workspace access", detail);
    return true;
  }

  console.warn(
    "[authz] Warden denied workspace access the JWT claims allowed (shadow mode; set WARDEN_ENFORCE=true to enforce)",
    detail,
  );
  return false;
};

type RoleContext = {
  observer?: { id?: string } | null;
  organizationIds?: string[];
  organizations?: OrganizationClaim[];
};

const forbidden = () =>
  new GraphQLError("Only workspace owners and admins can do this", {
    extensions: { code: "FORBIDDEN" },
  });

/**
 * Throw unless the caller is an owner or admin of `organizationId` (or a
 * trusted service). Membership itself is checked by the caller's guard first
 */
export const assertWorkspaceAdmin = async (
  context: RoleContext | undefined,
  organizationId: string,
): Promise<void> => {
  if (!context?.observer) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  if (context.organizationIds?.includes("*")) return;

  const claim = context.organizations?.find((org) => org.id === organizationId);
  if (!claim || !claim.roles.some((role) => ADMIN_ROLES.includes(role)))
    throw forbidden();

  if (
    await isDeniedByWarden({
      userId: context.observer.id,
      organizationId,
      relation: "admin",
    })
  )
    throw forbidden();
};

/**
 * Fill in the caller's role in each workspace from a richer source (userinfo)
 * when the token's claim lists workspace ids only. Membership never changes:
 * a workspace userinfo lists but the token does not is ignored, and a failed
 * lookup leaves the roles empty, so admin-only actions fail closed
 */
export const withHydratedRoles = async (
  claims: OrganizationClaim[],
  hydrate?: () => Promise<Array<{ id: string; roles?: string[] }> | undefined>,
): Promise<OrganizationClaim[]> => {
  if (!hydrate || claims.every((org) => org.roles.length > 0)) return claims;

  let rich: Array<{ id: string; roles?: string[] }> | undefined;
  try {
    rich = await hydrate();
  } catch (err) {
    console.warn(
      "[auth] workspace role lookup failed:",
      err instanceof Error ? err.message : err,
    );
  }
  if (!rich) return claims;

  return claims.map((org) => {
    if (org.roles.length > 0) return org;
    const roles = rich.find((r) => r.id === org.id)?.roles;

    return Array.isArray(roles)
      ? { ...org, roles: roles.filter((r) => typeof r === "string") }
      : org;
  });
};

/** Workspaces in which the claims make the caller an owner or admin */
export const adminOrganizationIds = (claims: OrganizationClaim[]): string[] =>
  claims
    .filter((org) => org.roles.some((role) => ADMIN_ROLES.includes(role)))
    .map((org) => org.id);
