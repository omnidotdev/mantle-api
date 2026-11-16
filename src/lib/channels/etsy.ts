import type { SelectChannelConnection } from "lib/db/schema/channelConnection.table";
import type { ChannelListing, ChannelProvider, ChannelUpdate } from "./types";

const ETSY_API_BASE = "https://openapi.etsy.com/v3/application";
const ETSY_TOKEN_URL = "https://api.etsy.com/v3/public/oauth/token";

// 5 minute buffer before expiry
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

interface EtsyCredentials {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}

function getKeystring(): string {
  const apiKey = process.env.ETSY_API_KEY;

  if (!apiKey) {
    throw new Error("ETSY_API_KEY is not set");
  }

  return apiKey.split(":")[0];
}

function getCredentials(connection: SelectChannelConnection): EtsyCredentials {
  return connection.credentials as EtsyCredentials;
}

function authHeaders(credentials: EtsyCredentials): Record<string, string> {
  return {
    Authorization: `Bearer ${credentials.accessToken}`,
    "x-api-key": getKeystring(),
  };
}

const etsyProvider: ChannelProvider = {
  name: "etsy",

  async refreshTokenIfNeeded(
    connection: SelectChannelConnection,
  ): Promise<SelectChannelConnection> {
    const credentials = getCredentials(connection);

    if (
      credentials.expiresAt &&
      credentials.expiresAt - Date.now() > TOKEN_REFRESH_BUFFER_MS
    ) {
      return connection;
    }

    const res = await fetch(ETSY_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: getKeystring(),
        refresh_token: credentials.refreshToken ?? "",
      }),
    });

    if (!res.ok) {
      throw new Error(`Etsy token refresh failed: ${res.status}`);
    }

    const data = (await res.json()) as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };

    const updatedCredentials: EtsyCredentials = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };

    return {
      ...connection,
      credentials: updatedCredentials as unknown as Record<string, unknown>,
    };
  },

  async getListing(
    connection: SelectChannelConnection,
    externalId: string,
  ): Promise<ChannelListing> {
    const credentials = getCredentials(connection);
    const shopId = connection.externalShopId;

    const res = await fetch(
      `${ETSY_API_BASE}/shops/${shopId}/listings/${externalId}`,
      { headers: authHeaders(credentials) },
    );

    if (!res.ok) {
      throw new Error(`Etsy getListing failed: ${res.status}`);
    }

    const data = (await res.json()) as {
      listing_id: number;
      title: string;
      description: string;
      quantity: number;
      price: { amount: number; divisor: number };
    };

    return {
      externalId: String(data.listing_id),
      title: data.title,
      description: data.description,
      quantity: data.quantity,
      price: data.price.amount / data.price.divisor,
    };
  },

  async updateListing(
    connection: SelectChannelConnection,
    update: ChannelUpdate,
  ): Promise<void> {
    const credentials = getCredentials(connection);
    const shopId = connection.externalShopId;

    const body: Record<string, unknown> = {};

    if (update.title !== undefined) {
      body.title = update.title.slice(0, 140);
    }
    if (update.description !== undefined) {
      body.description = update.description;
    }
    if (update.price !== undefined) {
      body.price = update.price;
    }
    if (update.quantity !== undefined) {
      body.quantity = update.quantity;
    }

    const res = await fetch(
      `${ETSY_API_BASE}/shops/${shopId}/listings/${update.externalId}`,
      {
        method: "PATCH",
        headers: {
          ...authHeaders(credentials),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    if (!res.ok) {
      throw new Error(`Etsy updateListing failed: ${res.status}`);
    }
  },
};

export default etsyProvider;
