CREATE TABLE "person_external_link" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"external_id" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp(6) with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "person_external_link" ADD CONSTRAINT "person_external_link_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "person_external_link_provider_external_id_idx" ON "person_external_link" USING btree ("provider","external_id");--> statement-breakpoint
CREATE INDEX "person_external_link_person_id_idx" ON "person_external_link" USING btree ("person_id");