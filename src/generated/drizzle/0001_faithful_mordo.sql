DROP INDEX "person_email_idx";--> statement-breakpoint
ALTER TABLE "person" ADD COLUMN "emails" text[];--> statement-breakpoint
ALTER TABLE "person" ADD COLUMN "internal" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "quote" ADD COLUMN "project_type" text;--> statement-breakpoint
ALTER TABLE "quote" ADD COLUMN "time_range" text;--> statement-breakpoint
ALTER TABLE "quote" ADD COLUMN "additional_terms" text[];--> statement-breakpoint
ALTER TABLE "quote_line_item" ADD COLUMN "hourly_rate" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "quote_line_item" ADD COLUMN "weekly_cap_hours" integer;--> statement-breakpoint
ALTER TABLE "quote_line_item" ADD COLUMN "monthly_cap_hours" integer;--> statement-breakpoint
ALTER TABLE "quote_line_item" ADD COLUMN "max_cap_hours" integer;--> statement-breakpoint
ALTER TABLE "quote_line_item" ADD COLUMN "royalty_timeframe" integer;--> statement-breakpoint
ALTER TABLE "quote_line_item" ADD COLUMN "royalty_timeframe_unit" varchar(20);--> statement-breakpoint
ALTER TABLE "quote_line_item" ADD COLUMN "royalty_threshold" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "quote_line_item" ADD COLUMN "royalty_buyout_amount" numeric(12, 2);--> statement-breakpoint
CREATE INDEX "person_emails_idx" ON "person" USING btree ("emails");--> statement-breakpoint
ALTER TABLE "person" DROP COLUMN "email";