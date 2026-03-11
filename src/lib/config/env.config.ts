/**
 * Environment variables.
 *
 * Individual access avoids a bun bundler bug where destructured
 * `process.env` exports lose their `var` declarations in the output.
 */
const NODE_ENV = process.env.NODE_ENV;
export const PORT = process.env.PORT ?? 4000;
export const DATABASE_URL = process.env.DATABASE_URL;
export const CORS_ALLOWED_ORIGINS = process.env.CORS_ALLOWED_ORIGINS;
export const AUTH_JWKS_URL = process.env.AUTH_JWKS_URL;
export const GRAPHQL_MAX_COMPLEXITY_COST =
  process.env.GRAPHQL_MAX_COMPLEXITY_COST ?? "5000";
export const UNLEASH_SERVER_API_URL = process.env.UNLEASH_SERVER_API_URL;
export const UNLEASH_SERVER_API_TOKEN = process.env.UNLEASH_SERVER_API_TOKEN;
export const VORTEX_API_URL = process.env.VORTEX_API_URL;
export const VORTEX_API_KEY = process.env.VORTEX_API_KEY;

export const isDevEnv = NODE_ENV === "development",
  isProdEnv = NODE_ENV === "production";
