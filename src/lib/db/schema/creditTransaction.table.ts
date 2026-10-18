import { CREDIT_TRANSACTION_KINDS } from "@omnidotdev/providers/invoicing";
import {
  index,
  numeric,
  pgTable,
  text,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { generateDefaultDate, generateDefaultId } from "lib/db/util";
import { invoiceTable } from "./invoice.table";
import { paymentTable } from "./payment.table";

import type { CreditTransactionKind } from "@omnidotdev/providers/invoicing";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

/**
 * How a credit entry came to exist (the shared cross-product credit contract):
 * - overpayment: excess of payments over an invoice total, recorded as credit
 * - creditNote: credit issued by a credit-note document (refund/adjustment)
 * - application: credit consumed against an invoice (a negative amount)
 * - adjustment: manual correction
 * - void: reversal of a prior entry (a negative amount)
 *
 * Sourced from `@omnidotdev/providers/invoicing` so Mantle and MyFi cannot
 * drift; kept as app-validated text (not a pgEnum) so the set can evolve.
 */
export const creditTransactionKinds = CREDIT_TRANSACTION_KINDS;

export type { CreditTransactionKind };

/**
 * Append-only credit ledger scoped to a workspace (organization) and currency.
 * A workspace's available credit balance is the sum of `amount` across its
 * entries for a given currency: positive entries issue credit (overpayment,
 * credit note), negative entries consume it (applied to an invoice) or reverse
 * it (void). Rows are immutable, so a credit's history is never silently
 * rewritten, only extended with a compensating entry.
 */
export const creditTransactionTable = pgTable(
  "credit_transaction",
  {
    id: generateDefaultId(),
    organizationId: text("organization_id").notNull(),
    currency: varchar({ length: 3 }).default("USD").notNull(),
    amount: numeric({ precision: 12, scale: 2 }).notNull(),
    kind: varchar({ length: 20 }).$type<CreditTransactionKind>().notNull(),
    // The invoice this entry relates to: the source invoice for an overpayment,
    // or the target invoice for an application. Kept (set null) when the invoice
    // is deleted, because the credit belongs to the workspace, not the invoice
    invoiceId: uuid("invoice_id").references(() => invoiceTable.id, {
      onDelete: "set null",
    }),
    // The payment whose excess produced an overpayment credit, when applicable
    paymentId: uuid("payment_id").references(() => paymentTable.id, {
      onDelete: "set null",
    }),
    note: text(),
    createdAt: generateDefaultDate(),
  },
  (table) => [
    uniqueIndex().on(table.id),
    index("credit_transaction_organization_id_idx").on(table.organizationId),
    index("credit_transaction_invoice_id_idx").on(table.invoiceId),
    index("credit_transaction_payment_id_idx").on(table.paymentId),
  ],
);

export type InsertCreditTransaction = InferInsertModel<
  typeof creditTransactionTable
>;
export type SelectCreditTransaction = InferSelectModel<
  typeof creditTransactionTable
>;
