CREATE TABLE "ptn_tour_export_log" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ptn_tour_export_log_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"event_id" integer NOT NULL,
	"admin_id" text,
	"format" text NOT NULL,
	"row_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ptn_tour_event" ADD COLUMN "tutor_photo_url" text;--> statement-breakpoint
ALTER TABLE "ptn_tour_event" ADD COLUMN "tutor_achievement" text;--> statement-breakpoint
ALTER TABLE "ptn_tour_event" ADD COLUMN "reward" text;--> statement-breakpoint
ALTER TABLE "ptn_tour_export_log" ADD CONSTRAINT "ptn_tour_export_log_event_id_ptn_tour_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."ptn_tour_event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptn_tour_export_log" ADD CONSTRAINT "ptn_tour_export_log_admin_id_user_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ptn_tour_export_log_event_idx" ON "ptn_tour_export_log" USING btree ("event_id");