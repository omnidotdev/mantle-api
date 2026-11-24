ALTER TABLE "quote" DROP CONSTRAINT "quote_converted_invoice_id_invoice_id_fk";
--> statement-breakpoint
ALTER TABLE "quote" ADD CONSTRAINT "quote_converted_invoice_id_invoice_id_fk" FOREIGN KEY ("converted_invoice_id") REFERENCES "public"."invoice"("id") ON DELETE set null ON UPDATE no action;