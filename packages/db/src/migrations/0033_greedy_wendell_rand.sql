CREATE TABLE "ptn_tour_proof" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ptn_tour_proof_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"registration_id" integer NOT NULL,
	"kind" text NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ptn_tour_setting" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ptn_tour_event" ADD COLUMN "subjects" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "ptn_tour_registration" ADD COLUMN "reminder_day_at" timestamp;--> statement-breakpoint
ALTER TABLE "ptn_tour_registration" ADD COLUMN "reminder_hour_at" timestamp;--> statement-breakpoint
ALTER TABLE "ptn_tour_proof" ADD CONSTRAINT "ptn_tour_proof_registration_id_ptn_tour_registration_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."ptn_tour_registration"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ptn_tour_proof_registration_idx" ON "ptn_tour_proof" USING btree ("registration_id");--> statement-breakpoint
CREATE INDEX "ptn_tour_proof_created_at_idx" ON "ptn_tour_proof" USING btree ("created_at");