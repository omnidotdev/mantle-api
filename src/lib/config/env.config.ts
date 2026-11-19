/**
 * Environment variables.
 */
export const {
  NODE_ENV,
  PORT = 4000,
  DATABASE_URL,
  CORS_ALLOWED_ORIGINS,
  AUTH_JWKS_URL,
  GRAPHQL_MAX_COMPLEXITY_COST = "5000",
  UNLEASH_SERVER_API_URL,
  UNLEASH_SERVER_API_TOKEN,
  VORTEX_API_URL,
  VORTEX_API_KEY,
  SERVICE_KEY,
  BILLING_BASE_URL,
  BILLING_SERVICE_API_KEY,
  // Shared secret Vortex signs Gatekeeper identity events (workspace deletion)
  // with, for POST /webhooks/idp
  IDP_WEBHOOK_SECRET,
} = process.env;

export const isDevEnv = NODE_ENV === "development",
  isProdEnv = NODE_ENV === "production";

// Startup warnings for optional integrations
if (!BILLING_BASE_URL)
  console.warn("BILLING_BASE_URL not set, billing disabled");
if (!VORTEX_API_URL)
  console.warn("VORTEX_API_URL not set, event streaming disabled");
if (!IDP_WEBHOOK_SECRET)
  console.warn(
    "IDP_WEBHOOK_SECRET not set, deleting a deleted workspace's data disabled",
  );
if (!UNLEASH_SERVER_API_URL)
  console.warn("UNLEASH_SERVER_API_URL not set, feature flags disabled");
