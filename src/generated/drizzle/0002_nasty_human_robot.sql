ALTER TABLE "invoice" ALTER COLUMN "company_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "invoice" ADD COLUMN "bill_to" text;