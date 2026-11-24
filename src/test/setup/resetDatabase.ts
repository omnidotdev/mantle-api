import { sql } from "drizzle-orm";

import type { TestDatabase } from "./createTestDatabase";

export const resetDatabase = async (db: TestDatabase["db"]): Promise<void> => {
	await db.execute(
		sql`TRUNCATE TABLE "document_numbering_config", "quote_line_item", "quote", "invoice_line_item", "invoice", "inventory_adjustment", "person", "company_member", "product", "company", "payment", "supplier", "credit_transaction", "organization_settings", "channel_connection", "person_external_link", "product_external_link", "usage_event", "entitlement_snapshot" CASCADE`,
	);
};
