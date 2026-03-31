import type { ChannelProvider } from "./types";

const providers = new Map<string, ChannelProvider>();

export function registerProvider(provider: ChannelProvider) {
  providers.set(provider.name, provider);
}

export function getProvider(name: string): ChannelProvider | undefined {
  return providers.get(name);
}

export type {
  ChannelListing,
  ChannelProvider,
  ChannelUpdate,
} from "./types";

import etsyProvider from "./etsy";
registerProvider(etsyProvider);
