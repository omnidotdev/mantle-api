CREATE TABLE "channel_connection" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"provider" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"external_shop_id" text,
	"credentials" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"scopes" text[],
	"sync_config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"last_synced_at" timestamp(6) with time zone,
	"created_at" timestamp(6) with time zone DEFAULT now(),
	"updated_at" timestamp(6) with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX "channel_connection_id_index" ON "channel_connection" USING btree ("id");--> statement-breakpoint
CREATE UNIQUE INDEX "channel_connection_org_provider_idx" ON "channel_connection" USING btree ("organization_id","provider");--> statement-breakpoint
CREATE INDEX "channel_connection_org_idx" ON "channel_connection" USING btree ("organization_id");