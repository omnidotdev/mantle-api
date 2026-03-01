import {
	boolean,
	index,
	pgTable,
	text,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";
import { generateDefaultDate, generateDefaultId } from "lib/db/util";
import { companyTable } from "./company.table";
import { personTable } from "./person.table";

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const companyMemberTable = pgTable(
	"company_member",
	{
		id: generateDefaultId(),
		companyId: uuid("company_id")
			.notNull()
			.references(() => companyTable.id, { onDelete: "cascade" }),
		personId: uuid("person_id")
			.notNull()
			.references(() => personTable.id, { onDelete: "cascade" }),
		title: text(),
		isPrimary: boolean("is_primary").default(false),
		createdAt: generateDefaultDate(),
	},
	(table) => [
		uniqueIndex().on(table.id),
		index("company_member_company_id_idx").on(table.companyId),
		index("company_member_person_id_idx").on(table.personId),
	],
);

export type InsertCompanyMember = InferInsertModel<typeof companyMemberTable>;
export type SelectCompanyMember = InferSelectModel<typeof companyMemberTable>;
