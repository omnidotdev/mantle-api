CREATE TABLE "company" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"website" text,
	"industry" text,
	"phone" text,
	"email" text,
	"address_line_1" text,
	"address_line_2" text,
	"city" text,
	"state" text,
	"postal_code" text,
	"country" text,
	"notes" text,
	"created_at" timestamp(6) with time zone DEFAULT now(),
	"updated_at" timestamp(6) with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "company_member" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"person_id" uuid NOT NULL,
	"title" text,
	"is_primary" boolean DEFAULT false,
	"created_at" timestamp(6) with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "inventory_adjustment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity_change" integer NOT NULL,
	"reason" text NOT NULL,
	"reference_id" uuid,
	"created_at" timestamp(6) with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoice" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"invoice_number" text NOT NULL,
	"company_id" uuid NOT NULL,
	"contact_id" uuid,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"issue_date" date NOT NULL,
	"due_date" date NOT NULL,
	"notes" text,
	"subtotal" numeric(12, 2) DEFAULT '0',
	"tax_rate" numeric(5, 2),
	"tax_amount" numeric(12, 2) DEFAULT '0',
	"total" numeric(12, 2) DEFAULT '0',
	"currency" varchar(3) DEFAULT 'USD',
	"paid_at" timestamp(6) with time zone,
	"payment_reference" text,
	"payment_link_url" text,
	"created_at" timestamp(6) with time zone DEFAULT now(),
	"updated_at" timestamp(6) with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoice_line_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"product_id" uuid,
	"description" text NOT NULL,
	"quantity" numeric(10, 2) NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "person" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"phone" text,
	"avatar_url" text,
	"tags" text[],
	"notes" text,
	"created_at" timestamp(6) with time zone DEFAULT now(),
	"updated_at" timestamp(6) with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"sku" text,
	"unit_price" numeric(12, 2),
	"current_quantity" integer DEFAULT 0,
	"low_stock_threshold" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp(6) with time zone DEFAULT now(),
	"updated_at" timestamp(6) with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quote" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"quote_number" text NOT NULL,
	"company_id" uuid NOT NULL,
	"contact_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"valid_until" date NOT NULL,
	"terms" text,
	"notes" text,
	"subtotal" numeric(12, 2) DEFAULT '0',
	"tax_rate" numeric(5, 2),
	"tax_amount" numeric(12, 2) DEFAULT '0',
	"total" numeric(12, 2) DEFAULT '0',
	"currency" varchar(3) DEFAULT 'USD',
	"converted_invoice_id" uuid,
	"created_at" timestamp(6) with time zone DEFAULT now(),
	"updated_at" timestamp(6) with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quote_line_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_id" uuid NOT NULL,
	"product_id" uuid,
	"description" text NOT NULL,
	"quantity" numeric(10, 2) NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"pricing_type" varchar(20) DEFAULT 'fixed' NOT NULL,
	"estimated_hours" numeric(10, 2),
	"royalty_percentage" numeric(5, 2),
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
ALTER TABLE "company_member" ADD CONSTRAINT "company_member_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_member" ADD CONSTRAINT "company_member_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_adjustment" ADD CONSTRAINT "inventory_adjustment_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_contact_id_person_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_line_item" ADD CONSTRAINT "invoice_line_item_invoice_id_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoice"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_line_item" ADD CONSTRAINT "invoice_line_item_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote" ADD CONSTRAINT "quote_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote" ADD CONSTRAINT "quote_contact_id_person_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote" ADD CONSTRAINT "quote_converted_invoice_id_invoice_id_fk" FOREIGN KEY ("converted_invoice_id") REFERENCES "public"."invoice"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_line_item" ADD CONSTRAINT "quote_line_item_quote_id_quote_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quote"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_line_item" ADD CONSTRAINT "quote_line_item_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "company_id_index" ON "company" USING btree ("id");--> statement-breakpoint
CREATE INDEX "company_organization_id_idx" ON "company" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "company_member_id_index" ON "company_member" USING btree ("id");--> statement-breakpoint
CREATE INDEX "company_member_company_id_idx" ON "company_member" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "company_member_person_id_idx" ON "company_member" USING btree ("person_id");--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_adjustment_id_index" ON "inventory_adjustment" USING btree ("id");--> statement-breakpoint
CREATE INDEX "inventory_adjustment_product_id_idx" ON "inventory_adjustment" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "invoice_id_index" ON "invoice" USING btree ("id");--> statement-breakpoint
CREATE INDEX "invoice_organization_id_idx" ON "invoice" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invoice_company_id_idx" ON "invoice" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "invoice_status_idx" ON "invoice" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "invoice_organization_id_invoice_number_idx" ON "invoice" USING btree ("organization_id","invoice_number");--> statement-breakpoint
CREATE UNIQUE INDEX "invoice_line_item_id_index" ON "invoice_line_item" USING btree ("id");--> statement-breakpoint
CREATE INDEX "invoice_line_item_invoice_id_idx" ON "invoice_line_item" USING btree ("invoice_id");--> statement-breakpoint
CREATE UNIQUE INDEX "person_id_index" ON "person" USING btree ("id");--> statement-breakpoint
CREATE INDEX "person_organization_id_idx" ON "person" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "person_email_idx" ON "person" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "product_id_index" ON "product" USING btree ("id");--> statement-breakpoint
CREATE INDEX "product_organization_id_idx" ON "product" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_organization_id_sku_idx" ON "product" USING btree ("organization_id","sku");--> statement-breakpoint
CREATE UNIQUE INDEX "quote_id_index" ON "quote" USING btree ("id");--> statement-breakpoint
CREATE INDEX "quote_organization_id_idx" ON "quote" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "quote_company_id_idx" ON "quote" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "quote_status_idx" ON "quote" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "quote_organization_id_quote_number_idx" ON "quote" USING btree ("organization_id","quote_number");--> statement-breakpoint
CREATE UNIQUE INDEX "quote_line_item_id_index" ON "quote_line_item" USING btree ("id");--> statement-breakpoint
CREATE INDEX "quote_line_item_quote_id_idx" ON "quote_line_item" USING btree ("quote_id");