/**
 * @file Retroactively normalize existing phone numbers to E.164.
 *
 * Walks person, company, and supplier rows and rewrites any phone value that
 * libphonenumber-js can confidently parse into canonical E.164 form. Values
 * that cannot be parsed (extensions, notes, partials) are left untouched, so
 * the backfill is non-destructive.
 *
 * Dry run by default (reports what would change). Pass --apply to write.
 *
 *   bun --env-file .env.local src/scripts/normalizePhones.ts          # preview
 *   bun --env-file .env.local src/scripts/normalizePhones.ts --apply  # execute
 */

import { eq, isNotNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { companyTable } from "lib/db/schema/company.table";
import { personTable } from "lib/db/schema/person.table";
import { supplierTable } from "lib/db/schema/supplier.table";
import { resolveRegion, toE164 } from "lib/phone";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("[normalizePhones] DATABASE_URL is not set");
  process.exit(1);
}

const apply = process.argv.includes("--apply");

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle({ client: pool, casing: "snake_case" });

/** Normalize one table's phone column, returning a change count. */
const normalizeTable = async <T extends { id: string }>({
  label,
  rows,
  current,
  regionFor,
  update,
}: {
  label: string;
  rows: T[];
  current: (row: T) => string | null;
  regionFor: (row: T) => string | undefined;
  update: (id: string, value: string) => Promise<unknown>;
}): Promise<number> => {
  let changed = 0;

  for (const row of rows) {
    const existing = current(row);
    const normalized = toE164(existing, resolveRegion(regionFor(row)));

    if (!normalized || normalized === existing) continue;

    changed += 1;
    console.info(`[${label}] ${row.id}: ${existing} -> ${normalized}`);

    if (apply) await update(row.id, normalized);
  }

  return changed;
};

try {
  console.info(
    `[normalizePhones] ${apply ? "APPLYING" : "DRY RUN (pass --apply to write)"}`,
  );

  const [people, companies, suppliers] = await Promise.all([
    db
      .select({ id: personTable.id, phone: personTable.phone })
      .from(personTable)
      .where(isNotNull(personTable.phone)),
    db
      .select({
        id: companyTable.id,
        phone: companyTable.phone,
        country: companyTable.country,
      })
      .from(companyTable)
      .where(isNotNull(companyTable.phone)),
    db
      .select({
        id: supplierTable.id,
        contactPhone: supplierTable.contactPhone,
      })
      .from(supplierTable)
      .where(isNotNull(supplierTable.contactPhone)),
  ]);

  const personChanges = await normalizeTable({
    label: "person",
    rows: people,
    current: (r) => r.phone,
    regionFor: () => undefined,
    update: (id, value) =>
      db
        .update(personTable)
        .set({ phone: value })
        .where(eq(personTable.id, id)),
  });

  const companyChanges = await normalizeTable({
    label: "company",
    rows: companies,
    current: (r) => r.phone,
    regionFor: (r) => r.country ?? undefined,
    update: (id, value) =>
      db
        .update(companyTable)
        .set({ phone: value })
        .where(eq(companyTable.id, id)),
  });

  const supplierChanges = await normalizeTable({
    label: "supplier",
    rows: suppliers,
    current: (r) => r.contactPhone,
    regionFor: () => undefined,
    update: (id, value) =>
      db
        .update(supplierTable)
        .set({ contactPhone: value })
        .where(eq(supplierTable.id, id)),
  });

  const total = personChanges + companyChanges + supplierChanges;
  console.info(
    `[normalizePhones] ${apply ? "updated" : "would update"} ${total} row(s) ` +
      `(person: ${personChanges}, company: ${companyChanges}, supplier: ${supplierChanges})`,
  );
} catch (err) {
  console.error("[normalizePhones] failed:", err);
  process.exit(1);
} finally {
  await pool.end();
}
