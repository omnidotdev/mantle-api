/**
 * @file OAuth 2.0 PKCE flow for connecting a sales channel
 *
 * Usage:
 *   bun channel:connect <organizationId> <provider>
 *
 * Requires DATABASE_URL and ETSY_API_KEY in .env.local.
 */

import { createHash, randomBytes } from "node:crypto";
import { createServer } from "node:http";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "lib/db/schema";
import { channelConnectionTable } from "lib/db/schema/channelConnection.table";

const SCOPES = ["listings_r", "listings_w"];
const CALLBACK_PORT = 3456;
const REDIRECT_URI = `http://localhost:${CALLBACK_PORT}/callback`;

// -- CLI args ---------------------------------------------------------------

const rawOrganizationId = process.argv[2];
const provider = process.argv[3];

if (!rawOrganizationId || !provider) {
	console.error("Usage: bun channel:connect <organizationId> <provider>");
	process.exit(1);
}

if (provider !== "etsy") {
	console.error(`Unsupported provider: ${provider} (only "etsy" is supported)`);
	process.exit(1);
}

// -- Env vars ---------------------------------------------------------------

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
	console.error("DATABASE_URL is required");
	process.exit(1);
}

const etsyApiKey = process.env.ETSY_API_KEY;
if (!etsyApiKey) {
	console.error("ETSY_API_KEY is required (set in .env.local)");
	process.exit(1);
}

const keystring = etsyApiKey.split(":")[0]!;

// -- DB setup ---------------------------------------------------------------

const pgPool = new Pool({ connectionString: databaseUrl });
const db = drizzle({ client: pgPool, schema, casing: "snake_case" });

// -- PKCE -------------------------------------------------------------------

const codeVerifier = randomBytes(32).toString("hex");
const codeChallenge = createHash("sha256")
	.update(codeVerifier)
	.digest("base64url");
const state = randomBytes(16).toString("hex");

// -- Auth URL ---------------------------------------------------------------

const authUrl = new URL("https://www.etsy.com/oauth/connect");
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("client_id", keystring);
authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
authUrl.searchParams.set("scope", SCOPES.join(" "));
authUrl.searchParams.set("state", state);
authUrl.searchParams.set("code_challenge", codeChallenge);
authUrl.searchParams.set("code_challenge_method", "S256");

console.info("Open the following URL to authorize:\n");
console.info(authUrl.toString());
console.info(`\nWaiting for callback on port ${CALLBACK_PORT}...`);

// -- Callback server --------------------------------------------------------

const server = createServer(async (req, res) => {
	const url = new URL(req.url ?? "/", `http://localhost:${CALLBACK_PORT}`);

	if (url.pathname !== "/callback") {
		res.writeHead(404);
		res.end("Not found");
		return;
	}

	const callbackState = url.searchParams.get("state");
	const code = url.searchParams.get("code");

	if (callbackState !== state) {
		res.writeHead(400);
		res.end("State mismatch");
		console.error("State mismatch, aborting");
		cleanup();
		return;
	}

	if (!code) {
		res.writeHead(400);
		res.end("Missing authorization code");
		console.error("Missing authorization code, aborting");
		cleanup();
		return;
	}

	try {
		// Exchange code for tokens
		const tokenRes = await fetch(
			"https://api.etsy.com/v3/public/oauth/token",
			{
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: new URLSearchParams({
					grant_type: "authorization_code",
					client_id: keystring,
					redirect_uri: REDIRECT_URI,
					code,
					code_verifier: codeVerifier,
				}),
			},
		);

		if (!tokenRes.ok) {
			const body = await tokenRes.text();
			throw new Error(`Token exchange failed (${tokenRes.status}): ${body}`);
		}

		const tokenData = (await tokenRes.json()) as {
			access_token: string;
			refresh_token: string;
			expires_in: number;
		};

		const expiresAt = new Date(
			Date.now() + tokenData.expires_in * 1000,
		).toISOString();

		// Fetch user/shop info
		const meRes = await fetch(
			"https://openapi.etsy.com/v3/application/users/me",
			{
				headers: { Authorization: `Bearer ${tokenData.access_token}` },
			},
		);

		if (!meRes.ok) {
			throw new Error(`Failed to fetch user info (${meRes.status})`);
		}

		const meData = (await meRes.json()) as { shop_id?: string };

		// Upsert channel connection
		await db
			.insert(channelConnectionTable)
			.values({
				organizationId: rawOrganizationId,
				provider,
				status: "active",
				externalShopId: meData.shop_id ? String(meData.shop_id) : null,
				credentials: {
					accessToken: tokenData.access_token,
					refreshToken: tokenData.refresh_token,
					expiresAt,
				},
				scopes: SCOPES,
			})
			.onConflictDoUpdate({
				target: [
					channelConnectionTable.organizationId,
					channelConnectionTable.provider,
				],
				set: {
					status: "active",
					externalShopId: meData.shop_id ? String(meData.shop_id) : null,
					credentials: {
						accessToken: tokenData.access_token,
						refreshToken: tokenData.refresh_token,
						expiresAt,
					},
					scopes: SCOPES,
					updatedAt: new Date().toISOString(),
				},
			});

		console.info(
			`\nChannel connection saved for org ${rawOrganizationId} (${provider})`,
		);

		res.writeHead(200, { "Content-Type": "text/html" });
		res.end("<h1>Connected! You can close this tab.</h1>");
	} catch (err) {
		console.error("OAuth exchange failed:", err);
		res.writeHead(500);
		res.end("OAuth exchange failed");
	} finally {
		cleanup();
	}
});

server.listen(CALLBACK_PORT);

function cleanup() {
	server.close();
	pgPool.end();
	process.exit(0);
}
