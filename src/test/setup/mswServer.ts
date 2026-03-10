import { exportJWK, generateKeyPair, SignJWT } from "jose";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";

const AUTH_BASE_URL = process.env.AUTH_JWKS_URL ?? "http://localhost:9999";

export const TEST_USER_ID = "e5d5d4ce-1ee4-42c0-b223-7ad2173a4616";

export const TEST_USER = {
	id: TEST_USER_ID,
	email: "test@example.com",
	name: "Test User",
} as const;

const testKeyPair = await generateKeyPair("RS256");
const testPublicJwk = await exportJWK(testKeyPair.publicKey);
testPublicJwk.kid = "test-key-id";
testPublicJwk.use = "sig";
testPublicJwk.alg = "RS256";

export const generateTestToken = async (
	claims: { sub: string } & Record<string, unknown> = { sub: TEST_USER_ID },
): Promise<string> => {
	const now = Math.floor(Date.now() / 1000);

	return new SignJWT(claims)
		.setProtectedHeader({ alg: "RS256", kid: "test-key-id" })
		.setIssuer(AUTH_BASE_URL)
		.setIssuedAt(now)
		.setExpirationTime(now + 3600)
		.sign(testKeyPair.privateKey);
};

export const TEST_TOKEN = await generateTestToken();

export const mswServer = setupServer(
	http.get(`${AUTH_BASE_URL}/.well-known/jwks.json`, () => {
		return HttpResponse.json({
			keys: [testPublicJwk],
		});
	}),
);
