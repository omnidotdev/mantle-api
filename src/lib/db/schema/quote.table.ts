import {
	date,
	index,
	numeric,
	pgTable,
	text,
	uniqueIndex,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { generateDefaultDate, generateDefaultId } from "lib/db/util";
import { companyTable } from "./company.table";
import { invoiceTable } from "./invoice.table";
import { personTable } from "./person.table";

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const quoteStatuses = [
	"draft",
	"sent",
	"accepted",
	"declined",
	"expired",
	"converted",
] as const;

export type QuoteStatus = (typeof quoteStatuses)[number];

export const quoteTable = pgTable(
	"quote",
	{
		id: generateDefaultId(),
		organizationId: text("organization_id").notNull(),
		quoteNumber: text("quote_number").notNull(),
		companyId: uuid("company_id").references(() => companyTable.id),
		contactId: uuid("contact_id").references(() => personTable.id),
		title: text().notNull(),
		description: text(),
		status: varchar({ length: 20 })
			.$type<QuoteStatus>()
			.default("draft")
			.notNull(),
		validUntil: date("valid_until").notNull(),
		projectType: text("project_type"),
		timeRange: text("time_range"),
		terms: text(),
		additionalTerms: text("additional_terms").array(),
		notes: text(),
		subtotal: numeric({ precision: 12, scale: 2 }).default("0"),
		taxRate: numeric("tax_rate", { precision: 5, scale: 2 }),
		taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).default("0"),
		total: numeric({ precision: 12, scale: 2 }).default("0"),
		currency: varchar({ length: 3 }).default("USD"),
		convertedInvoiceId: uuid("converted_invoice_id").references(
			() => invoiceTable.id,
		),
		createdAt: generateDefaultDate(),
		updatedAt: generateDefaultDate(),
	},
	(table) => [
		uniqueIndex().on(table.id),
		index("quote_organization_id_idx").on(table.organizationId),
		index("quote_company_id_idx").on(table.companyId),
		index("quote_status_idx").on(table.status),
		uniqueIndex("quote_organization_id_quote_number_idx").on(
			table.organizationId,
			table.quoteNumber,
		),
	],
);

export type InsertQuote = InferInsertModel<typeof quoteTable>;
export type SelectQuote = InferSelectModel<typeof quoteTable>;
