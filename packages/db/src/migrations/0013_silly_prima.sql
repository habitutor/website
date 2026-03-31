ALTER TABLE "dashboard_live_class" ALTER COLUMN "date" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "dashboard_live_class" ALTER COLUMN "time" SET DATA TYPE time;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "premium_tier" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "total_score" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_flashcard_attempt" ADD COLUMN IF NOT EXISTS "score" integer DEFAULT 0;