/**
 * Shared provider instances for Mantle API.
 */

import {
  createEventsProvider,
  createFlagProvider,
} from "@omnidotdev/providers";

import {
  UNLEASH_SERVER_API_URL,
  UNLEASH_SERVER_API_TOKEN,
  VORTEX_API_KEY,
  VORTEX_API_URL,
} from "lib/config/env.config";

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
