CREATE TABLE "payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"paid_at" date NOT NULL,
	"reference" text,
	"method" text
);
--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_invoice_id_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoice"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "payment_id_index" ON "payment" USING btree ("id");--> statement-breakpoint
CREATE INDEX "payment_invoice_id_idx" ON "payment" USING btree ("invoice_id");