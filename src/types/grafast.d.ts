import type { OrganizationClaim } from "lib/authz";
import type { dbPool } from "lib/db/db";
import type { Observer } from "lib/graphql/plugins/authentication.plugin";

declare global {
  namespace Grafast {
    interface Context {
      /** API observer (authenticated user). */
      observer: Observer | null;
      /** Database client. */
      db: typeof dbPool;
      /** Organization IDs the authenticated user belongs to. */
      organizationIds: string[];
      /** The caller's workspaces with their roles, from the JWT claims. */
      organizations: OrganizationClaim[];
    }
  }
}
