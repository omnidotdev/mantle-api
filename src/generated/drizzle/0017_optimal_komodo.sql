CREATE TABLE "supplier" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"code" text,
	"contact_email" text,
	"contact_phone" text,
	"website" text,
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp(6) with time zone DEFAULT now(),
	"updated_at" timestamp(6) with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "supplier_id" uuid;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "fulfillment_type" text DEFAULT 'stocked';--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "supplier_sku" text;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "upc" text;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "cost_price" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "retail_price" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "weight" numeric(8, 2);--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "category1" text;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "category2" text;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "image_url_2" text;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "image_url_3" text;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "is_restricted" boolean DEFAULT false;--> statement-breakpoint
CREATE UNIQUE INDEX "supplier_id_index" ON "supplier" USING btree ("id");--> statement-breakpoint
CREATE INDEX "supplier_organization_id_idx" ON "supplier" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "supplier_organization_id_code_idx" ON "supplier" USING btree ("organization_id","code");--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_supplier_id_supplier_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."supplier"("id") ON DELETE set null ON UPDATE no action;