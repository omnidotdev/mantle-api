import { GraphQLError } from "graphql";

type WorkspaceContext = {
  observer?: unknown;
  organizationIds?: string[];
};

/**
 * Throw unless the caller is signed in and belongs to `organizationId` (or is
 * a trusted service). Custom resolvers that write to a workspace call this
 * before touching data
 */
export const assertWorkspaceAccess = (
  context: WorkspaceContext | undefined,
  organizationId: string | null | undefined,
): void => {
  if (!context?.observer) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  const orgs = context.organizationIds ?? [];
  if (orgs.includes("*")) return;

  if (!organizationId || !orgs.includes(organizationId)) {
    throw new GraphQLError("Not authorized for this workspace", {
      extensions: { code: "FORBIDDEN" },
    });
  }
};
