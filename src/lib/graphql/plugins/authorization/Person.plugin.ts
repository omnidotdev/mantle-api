import { EXPORTABLE } from "graphile-export";
import { context, sideEffect } from "postgraphile/grafast";
import { wrapPlans } from "postgraphile/utils";

import { isWithinLimit } from "lib/entitlements";

import type { PlanWrapperFn } from "postgraphile/utils";

/**
 * Enforce max_contacts on createPerson when internal=false (external contact).
 *
 * Internal team members (internal=true) are not counted against the contact limit.
 * Only external contacts count toward the max_contacts entitlement.
 */
const enforceContactLimit = EXPORTABLE(
  (context, sideEffect, isWithinLimit): PlanWrapperFn =>
    (plan, _, fieldArgs) => {
      const $input = fieldArgs.getRaw(["input", "person"]);
      const $observer = context().get("observer");
      const $db = context().get("db");

      sideEffect([$input, $observer, $db], async ([input, observer, db]) => {
        if (!observer) throw new Error("Unauthorized");

        // Only enforce for external contacts (internal=false or unset)
        if (input?.internal === true) return;

        const organizationId = input?.organizationId;
        if (!organizationId) throw new Error("Workspace ID required");

        // Count existing external contacts for this organization
        const existingContacts = await db.query.personTable.findMany({
          where: (table: any, { and, eq }: any) =>
            and(
              eq(table.organizationId, organizationId),
              eq(table.internal, false),
            ),
          columns: { id: true },
        });

        const allowed = await isWithinLimit(
          { organizationId },
          "max_contacts",
          existingContacts.length,
        );

        if (!allowed) {
          throw new Error(
            "Contact limit reached. Upgrade your plan for more contacts",
          );
        }
      });

      return plan();
    },
  [context, sideEffect, isWithinLimit],
);

/**
 * Authorization plugin for persons (contacts).
 * Enforces max_contacts entitlement on creation of external contacts.
 */
const PersonPlugin = wrapPlans({
  Mutation: {
    createPerson: enforceContactLimit,
  },
});

export default PersonPlugin;
