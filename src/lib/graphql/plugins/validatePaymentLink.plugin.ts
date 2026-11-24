import { EXPORTABLE } from "graphile-export";
import { GraphQLError } from "graphql";
import { sideEffect } from "postgraphile/grafast";
import { wrapPlans } from "postgraphile/utils";

import { paymentLinkError } from "lib/invoices/paymentLink";

import type { FieldArgs } from "postgraphile/grafast";
import type { PlanWrapperFn } from "postgraphile/utils";

/** Refuse the write when the payment link it sets is not a safe https link */
const assertPaymentLink = EXPORTABLE(
  (GraphQLError, paymentLinkError) =>
    (values: unknown): void => {
      if (!values || typeof values !== "object") return;
      if (!("paymentLinkUrl" in values)) return;

      const error = paymentLinkError(
        (values as { paymentLinkUrl?: unknown }).paymentLinkUrl,
      );
      if (error) {
        throw new GraphQLError(error, {
          extensions: { code: "BAD_USER_INPUT", field: "paymentLinkUrl" },
        });
      }
    },
  [GraphQLError, paymentLinkError],
);

const validate = (inputPath: string[]): PlanWrapperFn =>
  EXPORTABLE(
    (sideEffect, assertPaymentLink, inputPath): PlanWrapperFn =>
      (plan, _, fieldArgs: FieldArgs) => {
        sideEffect(fieldArgs.getRaw(inputPath), assertPaymentLink);

        return plan();
      },
    [sideEffect, assertPaymentLink, inputPath],
  );

/**
 * Validate an invoice's payment link server-side on create and update: only an
 * absolute https link without embedded credentials, at most 2048 characters
 * (see lib/invoices/paymentLink). The link is shown to the invoice's
 * recipient, so a direct API write must not be able to plant a javascript: or
 * plain http link the app's form would refuse
 */
const ValidatePaymentLinkPlugin = wrapPlans({
  Mutation: {
    createInvoice: validate(["input", "invoice"]),
    updateInvoice: validate(["input", "patch"]),
  },
});

export default ValidatePaymentLinkPlugin;
