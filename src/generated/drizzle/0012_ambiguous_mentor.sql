CREATE TABLE "organization_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"accent_color" varchar(7) DEFAULT '#0d9488',
	"created_at" timestamp(6) with time zone DEFAULT now(),
	"updated_at" timestamp(6) with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX "organization_settings_id_index" ON "organization_settings" USING btree ("id");--> statement-breakpoint
CREATE UNIQUE INDEX "org_settings_organization_id_idx" ON "organization_settings" USING btree ("organization_id");