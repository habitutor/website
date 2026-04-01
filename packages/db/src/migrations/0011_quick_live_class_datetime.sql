ALTER TABLE "dashboard_live_class" ALTER COLUMN "date" SET DATA TYPE date USING "date"::date;--> statement-breakpoint
ALTER TABLE "dashboard_live_class" ALTER COLUMN "time" SET DATA TYPE time USING "time"::time;
