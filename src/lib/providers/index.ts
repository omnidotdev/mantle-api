/**
 * Shared provider instances for Mantle API.
 *
 * Billing (Aether) and authorization (Warden) are optional: when unconfigured
 * (local development, self-hosting) billing is undefined so every workspace
 * gets the free tier limits (see lib/entitlements), and Warden is not consulted
 * so the verified JWT workspace claims are the only gate (see lib/authz).
 *
 * Billing and authz live on one mutable holder rather than as bare constants so
 * the test suite can exercise both the configured and unconfigured paths
 * in-process
 */

import {
  createAuthzProvider,
  createEventsProvider,
  createFlagProvider,
} from "@omnidotdev/providers";
import { createBillingProvider } from "@omnidotdev/providers/billing";

import {
  AUTHZ_API_URL,
  AUTHZ_SERVICE_KEY,
  BILLING_BASE_URL,
  BILLING_SERVICE_API_KEY,
  UNLEASH_SERVER_API_TOKEN,
  UNLEASH_SERVER_API_URL,
  VORTEX_API_KEY,
  VORTEX_API_URL,
} from "lib/config/env.config";

import type { AuthzProvider } from "@omnidotdev/providers";
import type { BillingProvider } from "@omnidotdev/providers/billing";

/** Mantle's app id in the Omni product catalog and in Aether */
export const APP_ID = "mantle";

export const providers: {
  billing: BillingProvider | undefined;
  authz: AuthzProvider | undefined;
} = {
  billing: BILLING_BASE_URL
    ? createBillingProvider({
        provider: "aether",
        baseUrl: BILLING_BASE_URL,
        serviceApiKey: BILLING_SERVICE_API_KEY,
        appId: APP_ID,
      })
    : undefined,
  authz: AUTHZ_API_URL
    ? createAuthzProvider({
        apiUrl: AUTHZ_API_URL,
        serviceKey: AUTHZ_SERVICE_KEY,
      })
    : undefined,
};

export const events = createEventsProvider(
  VORTEX_API_URL && VORTEX_API_KEY
    ? {
        provider: "http",
        baseUrl: VORTEX_API_URL,
        apiKey: VORTEX_API_KEY,
        source: "omni.mantle",
      }
    : {},
);

export const flags = createFlagProvider(
  UNLEASH_SERVER_API_URL
    ? {
        provider: "unleash",
        url: UNLEASH_SERVER_API_URL,
        apiKey: UNLEASH_SERVER_API_TOKEN!,
        appName: "mantle-api",
      }
    : {},
);
