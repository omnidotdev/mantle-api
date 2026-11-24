CREATE TABLE "entitlement_snapshot" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"tier" text NOT NULL,
	"limits" jsonb NOT NULL,
	"fetched_at" timestamp(6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "entitlement_snapshot_organization_id_idx" ON "entitlement_snapshot" USING btree ("organization_id");