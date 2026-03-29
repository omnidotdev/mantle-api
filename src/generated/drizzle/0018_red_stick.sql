CREATE TABLE "product_external_link" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"external_id" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp(6) with time zone DEFAULT now(),
	"updated_at" timestamp(6) with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "product_external_link" ADD CONSTRAINT "product_external_link_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "product_external_link_id_index" ON "product_external_link" USING btree ("id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_external_link_product_id_provider_idx" ON "product_external_link" USING btree ("product_id","provider");--> statement-breakpoint
CREATE UNIQUE INDEX "product_external_link_provider_external_id_idx" ON "product_external_link" USING btree ("provider","external_id");--> statement-breakpoint
CREATE INDEX "product_external_link_product_id_idx" ON "product_external_link" USING btree ("product_id");