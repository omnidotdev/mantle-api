import {
	date,
	index,
	numeric,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { generateDefaultDate, generateDefaultId } from "lib/db/util";
import { companyTable } from "./company.table";
import { personTable } from "./person.table";

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const invoiceStatuses = [
	"draft",
	"sent",
	"viewed",
	"paid",
	"overdue",
	"cancelled",
	"refunded",
] as const;

export type InvoiceStatus = (typeof invoiceStatuses)[number];

export const invoiceTable = pgTable(
	"invoice",
	{
		id: generateDefaultId(),
		organizationId: text("organization_id").notNull(),
		invoiceNumber: text("invoice_number").notNull(),
		companyId: uuid("company_id")
			.notNull()
			.references(() => companyTable.id),
		contactId: uuid("contact_id").references(() => personTable.id),
		status: varchar({ length: 20 })
			.$type<InvoiceStatus>()
			.default("draft")
			.notNull(),
		issueDate: date("issue_date").notNull(),
		dueDate: date("due_date").notNull(),
		notes: text(),
		subtotal: numeric({ precision: 12, scale: 2 }).default("0"),
		taxRate: numeric("tax_rate", { precision: 5, scale: 2 }),
		taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).default("0"),
		total: numeric({ precision: 12, scale: 2 }).default("0"),
		currency: varchar({ length: 3 }).default("USD"),
		paidAt: timestamp("paid_at", {
			precision: 6,
			mode: "string",
			withTimezone: true,
		}),
		paymentReference: text("payment_reference"),
		paymentLinkUrl: text("payment_link_url"),
		createdAt: generateDefaultDate(),
		updatedAt: generateDefaultDate(),
	},
	(table) => [
		uniqueIndex().on(table.id),
		index("invoice_organization_id_idx").on(table.organizationId),
		index("invoice_company_id_idx").on(table.companyId),
		index("invoice_status_idx").on(table.status),
		uniqueIndex("invoice_organization_id_invoice_number_idx").on(
			table.organizationId,
			table.invoiceNumber,
		),
	],
);

export type InsertInvoice = InferInsertModel<typeof invoiceTable>;
export type SelectInvoice = InferSelectModel<typeof invoiceTable>;
