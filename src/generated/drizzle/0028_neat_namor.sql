CREATE TABLE "credit_transaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"kind" varchar(20) NOT NULL,
	"invoice_id" uuid,
	"payment_id" uuid,
	"note" text,
	"created_at" timestamp(6) with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "credit_transaction" ADD CONSTRAINT "credit_transaction_invoice_id_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoice"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_transaction" ADD CONSTRAINT "credit_transaction_payment_id_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "credit_transaction_id_index" ON "credit_transaction" USING btree ("id");--> statement-breakpoint
CREATE INDEX "credit_transaction_organization_id_idx" ON "credit_transaction" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "credit_transaction_invoice_id_idx" ON "credit_transaction" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "credit_transaction_payment_id_idx" ON "credit_transaction" USING btree ("payment_id");