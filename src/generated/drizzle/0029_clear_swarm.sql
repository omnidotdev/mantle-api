CREATE TABLE "usage_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"metric" text NOT NULL,
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organization_settings" ADD COLUMN "company_name" text;--> statement-breakpoint
ALTER TABLE "organization_settings" ADD COLUMN "contact_name" text;--> statement-breakpoint
ALTER TABLE "organization_settings" ADD COLUMN "contact_title" text;--> statement-breakpoint
ALTER TABLE "organization_settings" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "organization_settings" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "organization_settings" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "organization_settings" ADD COLUMN "address_line1" text;--> statement-breakpoint
ALTER TABLE "organization_settings" ADD COLUMN "address_line2" text;--> statement-breakpoint
ALTER TABLE "organization_settings" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "organization_settings" ADD COLUMN "state" text;--> statement-breakpoint
ALTER TABLE "organization_settings" ADD COLUMN "postal_code" text;--> statement-breakpoint
ALTER TABLE "organization_settings" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "organization_settings" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "organization_settings" ADD COLUMN "registration_state" text;--> statement-breakpoint
CREATE INDEX "usage_event_org_metric_created_idx" ON "usage_event" USING btree ("organization_id","metric","created_at");