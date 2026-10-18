import { EXPORTABLE } from "graphile-export";
import { context, sideEffect } from "postgraphile/grafast";
import { wrapPlans } from "postgraphile/utils";

import { isWithinLimit } from "lib/entitlements";

import type { PlanWrapperFn } from "postgraphile/utils";

/**
 * Enforce max_invoices_per_month on createInvoice.
 *
 * Counts invoices created in the current calendar month for the organization
 * and rejects when the plan limit is reached.
 */
const enforceInvoiceLimit = EXPORTABLE(
  (context, sideEffect, isWithinLimit): PlanWrapperFn =>
    (plan, _, fieldArgs) => {
      const $input = fieldArgs.getRaw(["input", "invoice"]);
      const $observer = context().get("observer");
      const $db = context().get("db");

      sideEffect([$input, $observer, $db], async ([input, observer, db]) => {
        if (!observer) throw new Error("Unauthorized");

        const organizationId = input?.organizationId;
        if (!organizationId) throw new Error("Workspace ID required");

        // Count invoices created this month for this organization
        const now = new Date();
        const monthStart = new Date(
          now.getFullYear(),
          now.getMonth(),
          1,
        ).toISOString();
        const monthEnd = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          1,
        ).toISOString();

        const invoicesThisMonth = await db.query.invoiceTable.findMany({
          where: (table: any, { and, eq, gte, lt }: any) =>
            and(
              eq(table.organizationId, organizationId),
              gte(table.createdAt, monthStart),
              lt(table.createdAt, monthEnd),
            ),
          columns: { id: true },
        });

        const allowed = await isWithinLimit(
          { organizationId },
          "max_invoices_per_month",
          invoicesThisMonth.length,
        );

        if (!allowed) {
          throw new Error(
            "Monthly invoice limit reached. Upgrade your plan for more invoices",
          );
        }
      });

      return plan();
    },
  [context, sideEffect, isWithinLimit],
);

/**
 * Authorization plugin for invoices.
 * Enforces max_invoices_per_month entitlement on creation.
 */
const InvoicePlugin = wrapPlans({
  Mutation: {
    createInvoice: enforceInvoiceLimit,
  },
});

export default InvoicePlugin;
