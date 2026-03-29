/**
 * @file Import active Etsy listings into the Mantle product table.
 * Read-only against Etsy. Creates products + productExternalLink records.
 *
 * Usage:
 *   bun import:etsy <organizationId>
 *
 * Requires ETSY_API_KEY in .env.local.
 */

import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "lib/db/schema";
import { productTable } from "lib/db/schema/product.table";
import { productExternalLinkTable } from "lib/db/schema/productExternalLink.table";

const ETSY_API_BASE = "https://openapi.etsy.com/v3/application";
const SHOP_HANDLE = "matterforgeco";
const PAGE_LIMIT = 100;

// -- CLI args ---------------------------------------------------------------

const rawOrganizationId = process.argv[2] || process.env.ORGANIZATION_ID;

if (!rawOrganizationId) {
  console.error(
    "Usage: bun import:etsy <organizationId>\n  Or set ORGANIZATION_ID env var.",
  );
  process.exit(1);
}

const organizationId = rawOrganizationId;

const apiKey = process.env.ETSY_API_KEY;
if (!apiKey) {
  console.error("ETSY_API_KEY is required (set in .env.local)");
  process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

// -- DB setup ---------------------------------------------------------------

const pgPool = new Pool({ connectionString: databaseUrl });
const db = drizzle({ client: pgPool, schema, casing: "snake_case" });

// -- Etsy API ---------------------------------------------------------------

const headers = { "x-api-key": apiKey };

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers });

  if (!res.ok) {
    throw new Error(`Etsy API ${res.status}: ${res.statusText} (${url})`);
  }

  return res.json() as Promise<T>;
}

interface EtsyImage {
  url_fullxfull: string;
}

interface EtsyPrice {
  amount: number;
  divisor: number;
  currency_code: string;
}

interface EtsyListing {
  listing_id: number;
  title: string;
  description: string;
  price: EtsyPrice;
  tags: string[];
  url: string;
  sku: string[];
  created_timestamp: number;
  images: EtsyImage[];
}

async function fetchAllListings(): Promise<EtsyListing[]> {
  const shopData = await fetchJson<{ shop_id: number }>(
    `${ETSY_API_BASE}/shops/${SHOP_HANDLE}`,
  );

  const results: EtsyListing[] = [];
  let offset = 0;

  while (true) {
    const url = `${ETSY_API_BASE}/shops/${shopData.shop_id}/listings/active?includes=images&limit=${PAGE_LIMIT}&offset=${offset}`;
    const data = await fetchJson<{ count: number; results: EtsyListing[] }>(
      url,
    );

    results.push(...data.results);
    if (results.length >= data.count) break;
    offset += PAGE_LIMIT;
  }

  return results;
}

// -- Main -------------------------------------------------------------------

async function main() {
  console.info(`Fetching listings from Etsy shop "${SHOP_HANDLE}"...`);
  const listings = await fetchAllListings();
  console.info(`Found ${listings.length} active listings`);

  let created = 0;
  let skipped = 0;

  for (const listing of listings) {
    const externalId = String(listing.listing_id);

    // Check if already imported
    const existing = await db
      .select({ id: productExternalLinkTable.id })
      .from(productExternalLinkTable)
      .where(
        and(
          eq(productExternalLinkTable.provider, "etsy"),
          eq(productExternalLinkTable.externalId, externalId),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      skipped++;
      continue;
    }

    const retailPrice = listing.price.amount / listing.price.divisor;

    // Insert product
    const [product] = await db
      .insert(productTable)
      .values({
        organizationId,
        name: listing.title,
        description: listing.description,
        retailPrice: retailPrice.toFixed(2),
        unitPrice: retailPrice.toFixed(2),
        costPrice: undefined,
        sku: listing.sku?.[0] || undefined,
        category1: listing.tags[0] || undefined,
        category2: listing.tags[1] || undefined,
        imageUrl: listing.images?.[0]?.url_fullxfull || undefined,
        imageUrl2: listing.images?.[1]?.url_fullxfull || undefined,
        imageUrl3: listing.images?.[2]?.url_fullxfull || undefined,
        fulfillmentType: "stocked",
        isActive: true,
        channels: ["etsy"],
      })
      .returning({ id: productTable.id });

    // Insert external link
    await db.insert(productExternalLinkTable).values({
      productId: product!.id,
      provider: "etsy",
      externalId,
      metadata: {
        etsyUrl: listing.url,
        currency: listing.price.currency_code,
        tags: listing.tags,
        allImages: listing.images?.map((img) => img.url_fullxfull) ?? [],
      },
    });

    console.info(`  Imported: ${listing.title} (${externalId})`);
    created++;
  }

  await pgPool.end();

  console.info("\n--- Import Summary ---");
  console.info(`Listings found:    ${listings.length}`);
  console.info(`Products created:  ${created}`);
  console.info(`Already imported:  ${skipped}`);
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
