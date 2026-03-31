import type { SelectChannelConnection } from "lib/db/schema/channelConnection.table";

export interface ChannelListing {
  externalId: string;
  price: number;
  quantity: number;
  title: string;
  description: string;
}

export interface ChannelUpdate {
  externalId: string;
  price?: number;
  quantity?: number;
  title?: string;
  description?: string;
}

export interface ChannelProvider {
  name: string;
  refreshTokenIfNeeded(
    connection: SelectChannelConnection,
  ): Promise<SelectChannelConnection>;
  getListing(
    connection: SelectChannelConnection,
    externalId: string,
  ): Promise<ChannelListing>;
  updateListing(
    connection: SelectChannelConnection,
    update: ChannelUpdate,
  ): Promise<void>;
}
