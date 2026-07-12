ALTER TABLE "user" ADD COLUMN "age" integer;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "education_level" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "difficult_subjects" text[];--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "has_seen_welcome_video" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "streak" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "last_streak_at" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "streak_saves" integer DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "streak_saves_updated_at" timestamp;