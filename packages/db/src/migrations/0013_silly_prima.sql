ALTER TABLE "dashboard_live_class" ALTER COLUMN "date" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "dashboard_live_class" ALTER COLUMN "time" SET DATA TYPE time;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "premium_tier" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "total_score" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_flashcard_attempt" ADD COLUMN "score" integer DEFAULT 0;