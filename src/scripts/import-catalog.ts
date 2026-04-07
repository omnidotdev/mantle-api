/**
 * @file Import a distributor catalog CSV into the Mantle product table,
 * applying Sacred Flame curation filters.
 *
 * Usage:
 *   bun src/scripts/import-catalog.ts <csv-path> <organizationId>
 *
 * Or set ORGANIZATION_ID env var and pass only the CSV path.
 */

import { readFileSync } from "node:fs";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "lib/db/schema";
import { productTable } from "lib/db/schema/product.table";
import { supplierTable } from "lib/db/schema/supplier.table";

// -- CLI args ---------------------------------------------------------------

const csvPath = process.argv[2];
const rawOrganizationId = process.argv[3] || process.env.ORGANIZATION_ID;

if (!csvPath) {
  console.error(
    "Usage: bun src/scripts/import-catalog.ts <csv-path> [organizationId]",
  );
  process.exit(1);
}

if (!rawOrganizationId) {
  console.error(
    "organizationId is required (arg #2 or ORGANIZATION_ID env var)",
  );
  process.exit(1);
}

const organizationId = rawOrganizationId;

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

// -- DB setup ---------------------------------------------------------------

const pgPool = new Pool({ connectionString: databaseUrl });
const db = drizzle({ client: pgPool, schema, casing: "snake_case" });

// -- Filter config ----------------------------------------------------------

const PRICE_FLOOR = 15;

const APPROVED_MANUFACTURERS = new Set(
  [
    // Premium tier
    "LELO",
    "ANEROS",
    "SVAKOM",
    "KAMA SUTRA",
    "INTIMINA",
    "PJUR",
    "WICKED SENSUAL CARE",
    "TANTUS",
    "FEMMEFUNN",
    "NU SENSUELLE",
    "KIIROO",
    "HAPPY RABBIT",
    "PLAYBOY PLEASURE",
    "SPORTSHEETS",
    "GLAS",
    "JIMMYJANE",
    "INTIMATE EARTH",
    "SLIQUID",
    "LOVENSE",
    "SATISFYER",
    "FIFTY SHADES",
    "SENSUVA",
    "EARTHLY BODY",
    "SHIBARI",
    "DORCEL",
    "PROMESCENT",
    "BATHMATE",
    "CLANDESTINE",
    "VIBRATEX",
    "INTIMATELY GG",
    "HIGH ON LOVE",
    "PILLOW TALK",
    "LA NUA",
    "LOVE TO LOVE",
    // Mid tier
    "BLUSH NOVELTIES",
    "NS NOVELTIES",
    "EVOLVED NOVELTIES",
    "VEDO TOYS",
    "MAIA TOYS",
    "ADRIEN LASTIC",
    "SYSTEM JO",
    "ID LUBE",
    "ID WELLNESS ESSENTIALS",
    "SELOPA",
    "CURVE NOVELTIES",
    "CALIFORNIA EXOTIC NOVELTIES",
    "SHOTS TOYS",
    "DOC JOHNSON",
    "GENDER X",
    "CLOUD 9",
    "PERFECT FIT BRAND",
    "OXBALLS",
    "HONEY PLAY BOX",
    "EDONISTA",
    "VIBEN",
    "NIXIE",
    "OTOUCH",
    "MAGIC MOTION",
    "ORGIE",
    "MD SCIENCE LAB",
    "BODY ACTION",
    "SEI MIO",
    "LUV INC",
    "SILEX-D",
    "FORTO",
    "GET LUCKY",
    "LOVE VERB",
    "WINX",
    "TENTRA",
    "EMPOWERED PRODUCTS",
    "DYNAMO WELLNESS",
    "VUSH",
    "LOLA MILANI",
  ].map((m) => m.toUpperCase()),
);

const EXCLUDED_CATEGORIES = new Set(
  [
    "Displays",
    "Bachelor & Bachelorette",
    "Party Supplies",
    "Smoke Shop",
    "Batteries",
    "Books & Magazines",
    "Games Gifts & Gags",
    "Blowout Items",
    "Holidays",
  ].map((c) => c.toUpperCase()),
);

const KEYWORD_PATTERNS: RegExp[] = [
  /joke/i,
  /gag/i,
  /novelty/i,
  /prank/i,
  /funny/i,
  /party/i,
  /cheap/i,
  /disposable/i,
  /display/i,
  /bowl/i,
  /fishbowl/i,
  /\d+\s*ct\b/i,
  /pornstar/i,
  /anime/i,
  /love doll/i,
  /blow.?up/i,
  /inflatable.?doll/i,
];

// -- CSV parsing ------------------------------------------------------------

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      fields.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  fields.push(current.trim());
  return fields;
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, "").trim();
}

// -- Main -------------------------------------------------------------------

const SUPPLIER_NAME = "National/Universal";
const SUPPLIER_CODE = "national-universal";
const RETAIL_MARKUP = 2.2;
const BATCH_SIZE = 100;

async function main() {
  const raw = readFileSync(csvPath!, "utf-8");
  const lines = raw.split(/\r?\n/).filter((l) => l.trim());

  if (lines.length < 2) {
    console.error("CSV has no data rows");
    process.exit(1);
  }

  const headers = parseCSVLine(lines[0]);
  const colIndex = (name: string) => {
    const idx = headers.indexOf(name);
    if (idx === -1) {
      console.error(`Missing CSV column: ${name}`);
      process.exit(1);
    }
    return idx;
  };

  const col = {
    upc: colIndex("UPC"),
    title: colIndex("Title"),
    manufacturer: colIndex("Manufacturer"),
    description: colIndex("Description"),
    weight: colIndex("Weight"),
    category1: colIndex("Category1"),
    category2: colIndex("Category2"),
    category3: colIndex("Category3"),
    image: colIndex("Image"),
    image2: colIndex("Image2"),
    image3: colIndex("Image3"),
    price: colIndex("Price"),
    discounted: colIndex("Discounted"),
    qty: colIndex("Qty"),
    model: colIndex("Model"),
    restricted: colIndex("3rd Party Restricted"),
  };

  // Upsert supplier
  const [supplier] = await db
    .insert(supplierTable)
    .values({
      organizationId,
      name: SUPPLIER_NAME,
      code: SUPPLIER_CODE,
      isActive: true,
    })
    .onConflictDoUpdate({
      target: [supplierTable.organizationId, supplierTable.code],
      set: { name: SUPPLIER_NAME, isActive: true },
    })
    .returning({ id: supplierTable.id });

  const supplierId = supplier!.id;
  console.info(`Supplier "${SUPPLIER_NAME}" ready (id: ${supplierId})`);

  // Stats
  const stats = {
    total: 0,
    imported: 0,
    skippedRestricted: 0,
    skippedPrice: 0,
    skippedOutOfStock: 0,
    skippedManufacturer: 0,
    skippedCategory: 0,
    skippedKeyword: 0,
    skippedNoSku: 0,
  };

  const batch: Array<typeof productTable.$inferInsert> = [];

  async function flushBatch() {
    if (batch.length === 0) return;

    for (const row of batch) {
      await db
        .insert(productTable)
        .values(row)
        .onConflictDoUpdate({
          target: [productTable.organizationId, productTable.sku],
          set: {
            name: row.name,
            description: row.description,
            upc: row.upc,
            unitPrice: row.unitPrice,
            costPrice: row.costPrice,
            retailPrice: row.retailPrice,
            supplierSku: row.supplierSku,
            supplierId: row.supplierId,
            fulfillmentType: row.fulfillmentType,
            weight: row.weight,
            category1: row.category1,
            category2: row.category2,
            imageUrl: row.imageUrl,
            imageUrl2: row.imageUrl2,
            imageUrl3: row.imageUrl3,
            currentQuantity: row.currentQuantity,
            lowStockThreshold: row.lowStockThreshold,
            isRestricted: row.isRestricted,
            isActive: row.isActive,
          },
        });
    }

    batch.length = 0;
  }

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);
    if (fields.length < headers.length) continue;

    stats.total++;

    const restricted = fields[col.restricted];
    if (restricted?.toUpperCase() === "Y") {
      stats.skippedRestricted++;
      continue;
    }

    const priceStr = fields[col.price];
    const price = Number.parseFloat(priceStr);
    if (Number.isNaN(price) || price < PRICE_FLOOR) {
      stats.skippedPrice++;
      continue;
    }

    const qty = Number.parseInt(fields[col.qty], 10);
    if (Number.isNaN(qty) || qty <= 0) {
      stats.skippedOutOfStock++;
      continue;
    }

    const manufacturer = (fields[col.manufacturer] || "").toUpperCase();
    if (!APPROVED_MANUFACTURERS.has(manufacturer)) {
      stats.skippedManufacturer++;
      continue;
    }

    const cat1 = fields[col.category1] || "";
    const cat2 = fields[col.category2] || "";
    const cat3 = fields[col.category3] || "";
    if (
      EXCLUDED_CATEGORIES.has(cat1.toUpperCase()) ||
      EXCLUDED_CATEGORIES.has(cat2.toUpperCase()) ||
      EXCLUDED_CATEGORIES.has(cat3.toUpperCase())
    ) {
      stats.skippedCategory++;
      continue;
    }

    const title = fields[col.title] || "";
    if (KEYWORD_PATTERNS.some((re) => re.test(title))) {
      stats.skippedKeyword++;
      continue;
    }

    const sku = fields[col.model];
    if (!sku) {
      stats.skippedNoSku++;
      continue;
    }

    const discounted = fields[col.discounted];
    const costPrice = discounted ? Number.parseFloat(discounted) : Number.NaN;
    const retailPrice = price * RETAIL_MARKUP;
    const weightVal = Number.parseFloat(fields[col.weight]);

    batch.push({
      organizationId,
      name: title,
      description: stripHtml(fields[col.description] || ""),
      sku,
      upc: fields[col.upc] || undefined,
      unitPrice: retailPrice.toFixed(2),
      costPrice: Number.isNaN(costPrice) ? undefined : costPrice.toFixed(2),
      retailPrice: retailPrice.toFixed(2),
      supplierSku: sku,
      supplierId,
      fulfillmentType: "dropship",
      weight:
        !Number.isNaN(weightVal) && weightVal > 0
          ? weightVal.toFixed(2)
          : undefined,
      category1: cat1 || undefined,
      category2: cat2 || undefined,
      imageUrl: fields[col.image] || undefined,
      imageUrl2: fields[col.image2] || undefined,
      imageUrl3: fields[col.image3] || undefined,
      currentQuantity: qty,
      lowStockThreshold: 5,
      isRestricted: false,
      isActive: true,
    });

    if (batch.length >= BATCH_SIZE) {
      await flushBatch();
    }

    stats.imported++;
  }

  await flushBatch();

  // Emit catalog import summary event to Vortex (if configured)
  const vortexUrl = process.env.VORTEX_API_URL;
  const vortexKey = process.env.VORTEX_API_KEY;

  if (vortexUrl && vortexKey) {
    const { createEventsProvider } = await import("@omnidotdev/providers");

    const events = createEventsProvider({
      provider: "http",
      baseUrl: vortexUrl,
      apiKey: vortexKey,
      source: "omni.mantle",
    });

    await events.emit({
      type: "mantle.catalog.import.completed",
      data: {
        organizationId,
        supplierId,
        supplierName: SUPPLIER_NAME,
        productsImported: stats.imported,
        totalProcessed: stats.total,
      },
      subject: organizationId,
    });

    console.info("Vortex event emitted: mantle.catalog.import.completed");
  }

  // Close pool
  await pgPool.end();

  // Report
  console.info("\n--- Import Summary ---");
  console.info(`Total rows processed:       ${stats.total}`);
  console.info(`Imported (upserted):        ${stats.imported}`);
  console.info(`Skipped (3rd party):        ${stats.skippedRestricted}`);
  console.info(`Skipped (price < $${PRICE_FLOOR}):    ${stats.skippedPrice}`);
  console.info(`Skipped (out of stock):     ${stats.skippedOutOfStock}`);
  console.info(`Skipped (manufacturer):     ${stats.skippedManufacturer}`);
  console.info(`Skipped (excluded category):${stats.skippedCategory}`);
  console.info(`Skipped (keyword):          ${stats.skippedKeyword}`);
  console.info(`Skipped (no SKU):           ${stats.skippedNoSku}`);
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
