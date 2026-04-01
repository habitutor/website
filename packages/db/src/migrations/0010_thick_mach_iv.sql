CREATE TYPE "public"."announcement_variant" AS ENUM('primary', 'cashback');--> statement-breakpoint
CREATE TYPE "public"."live_class_access" AS ENUM('3x', '5x');--> statement-breakpoint
CREATE TABLE "dashboard_announcement" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "dashboard_announcement_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" text NOT NULL,
	"description" text NOT NULL,
	"variant" "announcement_variant" DEFAULT 'primary' NOT NULL,
	"cta_link" text,
	"cta_label" text,
	"is_published" boolean DEFAULT true NOT NULL,
	"order" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dashboard_live_class" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "dashboard_live_class_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" text NOT NULL,
	"date" text NOT NULL,
	"time" text NOT NULL,
	"teacher" text NOT NULL,
	"link" text NOT NULL,
	"access" "live_class_access" DEFAULT '3x' NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"order" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "referral_code" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "referral_usage" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "dream_campus" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "dream_major" text;--> statement-breakpoint
CREATE INDEX "idx_dashboard_announcement_published_order" ON "dashboard_announcement" USING btree ("is_published","order");--> statement-breakpoint
CREATE INDEX "idx_dashboard_announcement_variant" ON "dashboard_announcement" USING btree ("variant");--> statement-breakpoint
CREATE INDEX "idx_dashboard_live_class_published_order" ON "dashboard_live_class" USING btree ("is_published","order");--> statement-breakpoint
CREATE INDEX "idx_dashboard_live_class_access" ON "dashboard_live_class" USING btree ("access");