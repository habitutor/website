ALTER TABLE "ptn_tour_event" ADD COLUMN "long_description" text;--> statement-breakpoint
ALTER TABLE "ptn_tour_event" ADD COLUMN "rundown" text;--> statement-breakpoint
ALTER TABLE "ptn_tour_event" ADD COLUMN "duration_minutes" integer DEFAULT 120 NOT NULL;--> statement-breakpoint
ALTER TABLE "ptn_tour_event" ADD COLUMN "recording_free_days" integer DEFAULT 30 NOT NULL;--> statement-breakpoint
ALTER TABLE "ptn_tour_event" ADD COLUMN "access_mode" text DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "ptn_tour_material" ADD COLUMN "unlock_at" text DEFAULT 'after_register' NOT NULL;--> statement-breakpoint
ALTER TABLE "ptn_tour_material" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;