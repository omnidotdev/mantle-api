/**
 * Environment variables.
 */
const { NODE_ENV } = process.env;

export const {
  PORT = 4000,
  DATABASE_URL,
  CORS_ALLOWED_ORIGINS,
  AUTH_JWKS_URL,
  // Gatekeeper userinfo, for the caller's workspace roles (access tokens carry
  // workspace ids only). Defaults to /oauth2/userinfo on the JWKS host
  AUTH_USERINFO_URL,
  GRAPHQL_MAX_COMPLEXITY_COST = "5000",
  UNLEASH_SERVER_API_URL,
  UNLEASH_SERVER_API_TOKEN,
  VORTEX_API_URL,
  VORTEX_API_KEY,
  SERVICE_KEY,
  // Billing/entitlements (Aether). Optional: when unset (self-hosting) no plan
  // limits apply
  BILLING_BASE_URL,
  // Service API key Aether requires on entitlement reads
  BILLING_SERVICE_API_KEY,
  // Comma-separated organization IDs exempt from plan limits (e.g. Omni's own)
  BILLING_BYPASS_ORG_IDS,
  // Authorization (Warden PDP). Optional: when unset Warden is not consulted
  // and the verified JWT organization claims are the only gate
  AUTHZ_API_URL,
  // Service key Warden requires on every /check call (X-Service-Key)
  AUTHZ_SERVICE_KEY,
  // Shared secret Vortex signs Gatekeeper identity events (workspace deletion)
  // with, for POST /webhooks/idp
  IDP_WEBHOOK_SECRET,
} = process.env;

/**
 * Self-host with a non-Omni OpenID Connect provider: give a caller whose token
 * carries no workspace claims a personal workspace ("true" to enable)
 */
export const personalWorkspaceFallback =
  process.env.PERSONAL_WORKSPACE_FALLBACK === "true";

export const isDevEnv = NODE_ENV === "development",
  isProdEnv = NODE_ENV === "production";

// TLS certificate verification stays on outside development. A local stack
// with self-signed certificates opts out explicitly with
// NODE_TLS_REJECT_UNAUTHORIZED=0 in .env.local; production never honors it
if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === "0") {
  if (isDevEnv) {
    console.warn(
      "NODE_TLS_REJECT_UNAUTHORIZED=0, TLS certificate verification disabled (development only)",
    );
  } else {
    delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    console.warn(
      "NODE_TLS_REJECT_UNAUTHORIZED=0 ignored outside development, TLS certificate verification stays on",
    );
  }
}

// Startup warnings for optional integrations
if (!BILLING_BASE_URL)
  console.warn(
    "BILLING_BASE_URL not set, billing disabled (no plan limits apply)",
  );
if (BILLING_BASE_URL && !BILLING_SERVICE_API_KEY)
  console.warn(
    "BILLING_SERVICE_API_KEY not set, entitlement reads will be rejected and fall back to the last known plan (or no limits)",
  );
if (!AUTHZ_API_URL)
  console.warn(
    "AUTHZ_API_URL not set, Warden role checks disabled (JWT workspace claims only)",
  );
if (AUTHZ_API_URL && !AUTHZ_SERVICE_KEY)
  console.warn(
    "AUTHZ_SERVICE_KEY not set, Warden checks will be rejected and fall back to JWT workspace claims",
  );
if (AUTHZ_API_URL && process.env.WARDEN_ENFORCE !== "true")
  console.warn(
    "WARDEN_ENFORCE not set, Warden runs in shadow mode (denials logged, not enforced)",
  );
if (!VORTEX_API_URL)
  console.warn("VORTEX_API_URL not set, event streaming disabled");
if (!IDP_WEBHOOK_SECRET)
  console.warn(
    "IDP_WEBHOOK_SECRET not set, deleting a deleted workspace's data disabled",
  );
if (!UNLEASH_SERVER_API_URL)
  console.warn("UNLEASH_SERVER_API_URL not set, feature flags disabled");
if (personalWorkspaceFallback)
  console.warn(
    "PERSONAL_WORKSPACE_FALLBACK enabled, callers without workspace claims get a personal workspace",
  );
