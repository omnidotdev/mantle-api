/**
 * @file Diff Mantle products against connected channel listings and push changes.
 *
 * Usage:
 *   bun sync:channels <organizationId>
 *   bun sync:channels <organizationId> --channel etsy
 *   bun sync:channels <organizationId> --dry-run
 *   bun sync:channels <organizationId> --force
 */

import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import "lib/channels"; // side-effect: registers providers
import { getProvider } from "lib/channels";
import type { ChannelUpdate } from "lib/channels/types";
import * as schema from "lib/db/schema";
import { channelConnectionTable } from "lib/db/schema/channelConnection.table";
import { productTable } from "lib/db/schema/product.table";
import { productExternalLinkTable } from "lib/db/schema/productExternalLink.table";

import type { SelectChannelConnection } from "lib/db/schema/channelConnection.table";

// -- CLI args -----------------------------------------------------------------

const args = process.argv.slice(2);

const organizationId = args.find((a) => !a.startsWith("--"));
const dryRun = args.includes("--dry-run");
const force = args.includes("--force");

const channelFlagIdx = args.indexOf("--channel");
const channelFilter =
	channelFlagIdx !== -1 ? args[channelFlagIdx + 1] : undefined;

if (!organizationId) {
	console.error(
		"Usage: bun sync:channels <organizationId> [--channel <name>] [--dry-run] [--force]",
	);
	process.exit(1);
}

// -- Env vars -----------------------------------------------------------------

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
	console.error("DATABASE_URL is required");
	process.exit(1);
}

// -- DB setup -----------------------------------------------------------------

const pgPool = new Pool({ connectionString: databaseUrl });
const db = drizzle({ client: pgPool, schema, casing: "snake_case" });

// -- Default sync fields ------------------------------------------------------

const DEFAULT_SYNC_FIELDS = ["price", "quantity", "title", "description"];

// -- Main ---------------------------------------------------------------------

interface ChannelStats {
	updated: number;
	skipped: number;
	failed: number;
}

async function main() {
	// Query active channel connections for this org
	const conditions = [
		eq(channelConnectionTable.organizationId, organizationId!),
		eq(channelConnectionTable.status, "active"),
	];

	if (channelFilter) {
		conditions.push(eq(channelConnectionTable.provider, channelFilter));
	}

	const connections = await db
		.select()
		.from(channelConnectionTable)
		.where(and(...conditions));

	if (connections.length === 0) {
		console.info("No active channel connections found");
		await pgPool.end();
		return;
	}

	const summary = new Map<string, ChannelStats>();
	let hasFailures = false;

	for (const connection of connections) {
		const stats: ChannelStats = { updated: 0, skipped: 0, failed: 0 };
		summary.set(connection.provider, stats);

		const provider = getProvider(connection.provider);
		if (!provider) {
			console.error(`No provider registered for "${connection.provider}"`);
			stats.failed++;
			hasFailures = true;
			continue;
		}

		// Refresh tokens if needed
		let activeConnection: SelectChannelConnection = connection;
		try {
			const refreshed = await provider.refreshTokenIfNeeded(connection);

			if (refreshed !== connection) {
				// Tokens changed, persist them
				await db
					.update(channelConnectionTable)
					.set({
						credentials: refreshed.credentials,
						updatedAt: new Date().toISOString(),
					})
					.where(eq(channelConnectionTable.id, connection.id));

				activeConnection = refreshed;
			}
		} catch (err) {
			console.error(
				`Failed to refresh tokens for ${connection.provider}:`,
				err,
			);
			stats.failed++;
			hasFailures = true;
			continue;
		}

		// Query products with external links for this provider
		const products = await db
			.select({
				product: productTable,
				link: productExternalLinkTable,
			})
			.from(productTable)
			.innerJoin(
				productExternalLinkTable,
				eq(productTable.id, productExternalLinkTable.productId),
			)
			.where(
				and(
					eq(productTable.organizationId, organizationId!),
					eq(productExternalLinkTable.provider, connection.provider),
				),
			);

		if (products.length === 0) {
			console.info(
				`  ${connection.provider}: no linked products, skipping`,
			);
			continue;
		}

		console.info(
			`  ${connection.provider}: syncing ${products.length} product(s)...`,
		);

		const syncFields =
			connection.syncConfig?.syncFields ?? DEFAULT_SYNC_FIELDS;
		const fieldOverrides = connection.syncConfig?.fieldOverrides ?? {};

		for (const { product, link } of products) {
			try {
				const listing = await provider.getListing(
					activeConnection,
					link.externalId,
				);

				const update: ChannelUpdate = { externalId: link.externalId };
				let hasDiff = false;

				const mantlePrice = product.unitPrice
					? Number.parseFloat(product.unitPrice)
					: null;

				// Price
				if (
					syncFields.includes("price") &&
					fieldOverrides.price !== connection.provider &&
					mantlePrice !== null
				) {
					if (force || mantlePrice !== listing.price) {
						update.price = mantlePrice;
						hasDiff = true;
					}
				}

				// Quantity
				if (
					syncFields.includes("quantity") &&
					fieldOverrides.quantity !== connection.provider &&
					product.currentQuantity !== null
				) {
					if (force || product.currentQuantity !== listing.quantity) {
						update.quantity = product.currentQuantity;
						hasDiff = true;
					}
				}

				// Title
				if (
					syncFields.includes("title") &&
					fieldOverrides.title !== connection.provider
				) {
					if (force || product.name !== listing.title) {
						update.title = product.name;
						hasDiff = true;
					}
				}

				// Description
				if (
					syncFields.includes("description") &&
					fieldOverrides.description !== connection.provider &&
					product.description !== null
				) {
					if (force || product.description !== listing.description) {
						update.description = product.description;
						hasDiff = true;
					}
				}

				if (!hasDiff) {
					stats.skipped++;
					continue;
				}

				if (dryRun) {
					console.info(
						`    [dry-run] ${product.sku ?? product.id}: would update`,
						JSON.stringify(update),
					);
					stats.updated++;
					continue;
				}

				await provider.updateListing(activeConnection, update);
				stats.updated++;
				console.info(`    ${product.sku ?? product.id}: updated`);
			} catch (err) {
				console.error(
					`    ${product.sku ?? product.id}: sync failed:`,
					err,
				);
				stats.failed++;
				hasFailures = true;
			}
		}

		// Update lastSyncedAt (unless dry-run)
		if (!dryRun) {
			await db
				.update(channelConnectionTable)
				.set({ lastSyncedAt: new Date().toISOString() })
				.where(eq(channelConnectionTable.id, connection.id));
		}
	}

	// -- Summary ----------------------------------------------------------------

	console.info("\n--- Sync Summary ---");

	for (const [provider, stats] of summary) {
		console.info(
			`  ${provider}: ${stats.updated} updated, ${stats.skipped} skipped, ${stats.failed} failed`,
		);
	}

	await pgPool.end();

	if (hasFailures) {
		process.exit(1);
	}
}

main().catch((err) => {
	console.error("Sync failed:", err);
	process.exit(1);
});
