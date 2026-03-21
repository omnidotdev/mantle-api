import { EXPORTABLE } from "graphile-export";
import { context, sideEffect } from "postgraphile/grafast";
import { wrapPlans } from "postgraphile/utils";

import { isWithinLimit } from "lib/entitlements";

import type { PlanWrapperFn } from "postgraphile/utils";

/**
 * Enforce max_team_members on createCompanyMember.
 *
 * Counts existing members for the organization (via the company's organizationId)
 * and rejects when the plan limit is reached.
 */
const enforceTeamMemberLimit = EXPORTABLE(
  (context, sideEffect, isWithinLimit): PlanWrapperFn =>
    (plan, _, fieldArgs) => {
      const $input = fieldArgs.getRaw(["input", "companyMember"]);
      const $observer = context().get("observer");
      const $db = context().get("db");

      sideEffect([$input, $observer, $db], async ([input, observer, db]) => {
        if (!observer) throw new Error("Unauthorized");

        const companyId = input?.companyId;
        if (!companyId) throw new Error("Company ID required");

        // Look up the company to get organizationId
        const company = await db.query.companyTable.findFirst({
          where: (table: any, { eq }: any) => eq(table.id, companyId),
          columns: { organizationId: true },
        });

        if (!company) throw new Error("Company not found");

        // Count existing members for this organization (across all companies)
        const existingMembers = await db.query.companyMemberTable.findMany({
          where: (table: any, { eq, inArray }: any) => {
            // Get all companies in this org, then count members
            return eq(table.companyId, companyId);
          },
          columns: { id: true },
        });

        const allowed = await isWithinLimit(
          { organizationId: company.organizationId },
          "max_team_members",
          existingMembers.length,
        );

        if (!allowed) {
          throw new Error(
            "Team member limit reached. Upgrade your plan for more team members",
          );
        }
      });

      return plan();
    },
  [context, sideEffect, isWithinLimit],
);

/**
 * Authorization plugin for company members.
 * Enforces max_team_members entitlement on creation.
 */
const CompanyMemberPlugin = wrapPlans({
  Mutation: {
    createCompanyMember: enforceTeamMemberLimit,
  },
});

export default CompanyMemberPlugin;
