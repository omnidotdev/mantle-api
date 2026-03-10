CREATE TABLE "document_numbering_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"document_type" text NOT NULL,
	"prefix" text DEFAULT '' NOT NULL,
	"separator" varchar(5) DEFAULT '-' NOT NULL,
	"date_format" text,
	"id_strategy" varchar(20) DEFAULT 'sequential' NOT NULL,
	"sequential_padding" integer DEFAULT 4 NOT NULL,
	"random_length" integer DEFAULT 8 NOT NULL,
	"next_sequential_number" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp(6) with time zone DEFAULT now(),
	"updated_at" timestamp(6) with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX "document_numbering_config_id_index" ON "document_numbering_config" USING btree ("id");--> statement-breakpoint
CREATE UNIQUE INDEX "doc_numbering_org_id_doc_type_idx" ON "document_numbering_config" USING btree ("organization_id","document_type");