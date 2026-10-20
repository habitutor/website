CREATE TYPE "public"."recording_category" AS ENUM('TKA', 'SNBT', 'MANDIRI');--> statement-breakpoint
CREATE TABLE "recording" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "recording_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"category" "recording_category" NOT NULL,
	"title" text NOT NULL,
	"teacher" text,
	"youtube_url" text NOT NULL,
	"recorded_at" date NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_recording_category_published" ON "recording" USING btree ("category","is_published");