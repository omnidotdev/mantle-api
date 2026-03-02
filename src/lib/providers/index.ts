/**
 * Shared provider instances for Mantle API.
 */

import { createFlagProvider } from "@omnidotdev/providers";

import {
  UNLEASH_SERVER_API_URL,
  UNLEASH_SERVER_API_TOKEN,
} from "lib/config/env.config";

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
