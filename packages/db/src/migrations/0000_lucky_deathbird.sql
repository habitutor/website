CREATE TYPE "public"."announcement_variant" AS ENUM('primary', 'cashback');--> statement-breakpoint
CREATE TYPE "public"."live_class_access" AS ENUM('3x', '5x');--> statement-breakpoint
CREATE TYPE "public"."practice_pack_status" AS ENUM('not_started', 'ongoing', 'finished');--> statement-breakpoint
CREATE TYPE "public"."content_type" AS ENUM('material', 'tips_and_trick');--> statement-breakpoint
CREATE TYPE "public"."transaction_status_enum" AS ENUM('pending', 'success', 'failed');--> statement-breakpoint
CREATE TYPE "public"."product_type_enum" AS ENUM('subscription', 'product');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text DEFAULT 'user',
	"is_premium" boolean DEFAULT false,
	"premium_tier" text,
	"flashcard_streak" integer DEFAULT 0,
	"total_score" integer DEFAULT 0 NOT NULL,
	"last_completed_flashcard_at" timestamp,
	"premium_expires_at" timestamp,
	"phone_number" text,
	"referral_code" text,
	"referral_usage" integer DEFAULT 0,
	"dream_campus" text,
	"dream_major" text,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
	"date" date NOT NULL,
	"time" time NOT NULL,
	"teacher" text NOT NULL,
	"link" text NOT NULL,
	"access" "live_class_access" DEFAULT '3x' NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"order" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_flashcard_attempt" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_flashcard_attempt_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"date" date DEFAULT CURRENT_DATE NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"deadline" timestamp NOT NULL,
	"submitted_at" timestamp,
	"score" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "user_flashcard_question_answer" (
	"assigned_date" date NOT NULL,
	"question_id" integer NOT NULL,
	"selected_answer_id" integer,
	"attempt_id" integer,
	"answered_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_flashcard_question_answer_attempt_id_assigned_date_question_id_pk" PRIMARY KEY("attempt_id","assigned_date","question_id")
);
--> statement-breakpoint
CREATE TABLE "practice_pack" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "practice_pack_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "practice_pack_attempt" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "practice_pack_attempt_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"practice_pack_id" integer NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"practice_pack_status" "practice_pack_status" DEFAULT 'ongoing' NOT NULL,
	CONSTRAINT "user_attempt" UNIQUE("user_id","practice_pack_id")
);
--> statement-breakpoint
CREATE TABLE "practice_pack_questions" (
	"practice_pack_id" integer NOT NULL,
	"question_id" integer NOT NULL,
	"order" integer DEFAULT 1,
	CONSTRAINT "practice_pack_questions_practice_pack_id_question_id_pk" PRIMARY KEY("practice_pack_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "practice_pack_user_answer" (
	"attempt_id" integer NOT NULL,
	"question_id" integer NOT NULL,
	"selected_answer_id" integer NOT NULL,
	CONSTRAINT "practice_pack_user_answer_attempt_id_question_id_pk" PRIMARY KEY("attempt_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "question" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "question_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"content" text NOT NULL,
	"discussion" text NOT NULL,
	"content_json" jsonb,
	"discussion_json" jsonb,
	"is_flashcard_question" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_answer_option" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "question_answer_option_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" char(1) NOT NULL,
	"question_id" integer NOT NULL,
	"content" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL,
	CONSTRAINT "question_answer_option_question_id_code_unique" UNIQUE("question_id","code")
);
--> statement-breakpoint
CREATE TABLE "referral_code" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"user_id" text NOT NULL,
	"referral_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "referral_code_code_unique" UNIQUE("code"),
	CONSTRAINT "referral_code_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "referral_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"referral_code_id" uuid NOT NULL,
	"transaction_id" text,
	"cashback_amount" numeric,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "referral_usage_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "content_item" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "content_item_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"subtest_id" integer NOT NULL,
	"type" "content_type" NOT NULL,
	"title" text NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_content_order" UNIQUE("subtest_id","type","order")
);
--> statement-breakpoint
CREATE TABLE "content_practice_questions" (
	"content_item_id" integer NOT NULL,
	"question_id" integer NOT NULL,
	"order" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "unique_practice_questions_order" UNIQUE("content_item_id","order")
);
--> statement-breakpoint
CREATE TABLE "note_material" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "note_material_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"content_item_id" integer NOT NULL,
	"content" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "note_material_content_item_id_unique" UNIQUE("content_item_id")
);
--> statement-breakpoint
CREATE TABLE "recent_content_view" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "recent_content_view_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"content_item_id" integer NOT NULL,
	"viewed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subtest" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "subtest_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"short_name" text NOT NULL,
	"description" text,
	"order" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subtest_short_name_unique" UNIQUE("short_name")
);
--> statement-breakpoint
CREATE TABLE "user_progress" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_progress_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"content_item_id" integer NOT NULL,
	"video_completed" boolean DEFAULT false NOT NULL,
	"note_completed" boolean DEFAULT false NOT NULL,
	"practice_questions_completed" boolean DEFAULT false NOT NULL,
	"last_viewed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_user_content" UNIQUE("user_id","content_item_id")
);
--> statement-breakpoint
CREATE TABLE "video_material" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "video_material_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"content_item_id" integer NOT NULL,
	"video_url" text NOT NULL,
	"content" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "video_material_content_item_id_unique" UNIQUE("content_item_id")
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"price" numeric NOT NULL,
	"type" "product_type_enum" NOT NULL,
	CONSTRAINT "product_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "transaction" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"product_id" uuid,
	"gross_amount" numeric,
	"status" "transaction_status_enum" DEFAULT 'pending' NOT NULL,
	"referral_code_id" uuid,
	"paid_at" timestamp,
	"ordered_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_flashcard_attempt" ADD CONSTRAINT "user_flashcard_attempt_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_flashcard_question_answer" ADD CONSTRAINT "user_flashcard_question_answer_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_flashcard_question_answer" ADD CONSTRAINT "user_flashcard_question_answer_selected_answer_id_question_answer_option_id_fk" FOREIGN KEY ("selected_answer_id") REFERENCES "public"."question_answer_option"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_flashcard_question_answer" ADD CONSTRAINT "user_flashcard_question_answer_attempt_id_user_flashcard_attempt_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."user_flashcard_attempt"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_pack_attempt" ADD CONSTRAINT "practice_pack_attempt_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_pack_attempt" ADD CONSTRAINT "practice_pack_attempt_practice_pack_id_practice_pack_id_fk" FOREIGN KEY ("practice_pack_id") REFERENCES "public"."practice_pack"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_pack_questions" ADD CONSTRAINT "practice_pack_questions_practice_pack_id_practice_pack_id_fk" FOREIGN KEY ("practice_pack_id") REFERENCES "public"."practice_pack"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_pack_questions" ADD CONSTRAINT "practice_pack_questions_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_pack_user_answer" ADD CONSTRAINT "practice_pack_user_answer_attempt_id_practice_pack_attempt_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."practice_pack_attempt"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_pack_user_answer" ADD CONSTRAINT "practice_pack_user_answer_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_pack_user_answer" ADD CONSTRAINT "practice_pack_user_answer_selected_answer_id_question_answer_option_id_fk" FOREIGN KEY ("selected_answer_id") REFERENCES "public"."question_answer_option"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_answer_option" ADD CONSTRAINT "question_answer_option_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_code" ADD CONSTRAINT "referral_code_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_usage" ADD CONSTRAINT "referral_usage_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_usage" ADD CONSTRAINT "referral_usage_referral_code_id_referral_code_id_fk" FOREIGN KEY ("referral_code_id") REFERENCES "public"."referral_code"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_item" ADD CONSTRAINT "content_item_subtest_id_subtest_id_fk" FOREIGN KEY ("subtest_id") REFERENCES "public"."subtest"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_practice_questions" ADD CONSTRAINT "content_practice_questions_content_item_id_content_item_id_fk" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_practice_questions" ADD CONSTRAINT "content_practice_questions_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_material" ADD CONSTRAINT "note_material_content_item_id_content_item_id_fk" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recent_content_view" ADD CONSTRAINT "recent_content_view_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recent_content_view" ADD CONSTRAINT "recent_content_view_content_item_id_content_item_id_fk" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_content_item_id_content_item_id_fk" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_material" ADD CONSTRAINT "video_material_content_item_id_content_item_id_fk" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_referral_code_id_referral_code_id_fk" FOREIGN KEY ("referral_code_id") REFERENCES "public"."referral_code"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "idx_dashboard_announcement_published_order" ON "dashboard_announcement" USING btree ("is_published","order");--> statement-breakpoint
CREATE INDEX "idx_dashboard_announcement_variant" ON "dashboard_announcement" USING btree ("variant");--> statement-breakpoint
CREATE INDEX "idx_dashboard_live_class_published_order" ON "dashboard_live_class" USING btree ("is_published","order");--> statement-breakpoint
CREATE INDEX "idx_dashboard_live_class_access" ON "dashboard_live_class" USING btree ("access");--> statement-breakpoint
CREATE INDEX "idx_flashcard_attempt_user" ON "user_flashcard_attempt" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_flashcard_attempt_user_started" ON "user_flashcard_attempt" USING btree ("user_id","started_at");--> statement-breakpoint
CREATE INDEX "idx_flashcard_answer_attempt" ON "user_flashcard_question_answer" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX "idx_pp_attempt_user" ON "practice_pack_attempt" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_pp_attempt_pack" ON "practice_pack_attempt" USING btree ("practice_pack_id");--> statement-breakpoint
CREATE INDEX "idx_pp_user_answer_attempt" ON "practice_pack_user_answer" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX "idx_question_flashcard" ON "question" USING btree ("is_flashcard_question");--> statement-breakpoint
CREATE INDEX "idx_answer_option_question" ON "question_answer_option" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "referral_code_user_id_idx" ON "referral_code" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "referral_code_code_idx" ON "referral_code" USING btree ("code");--> statement-breakpoint
CREATE INDEX "referral_usage_user_id_idx" ON "referral_usage" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "referral_usage_referral_code_id_idx" ON "referral_usage" USING btree ("referral_code_id");--> statement-breakpoint
CREATE INDEX "idx_recent_view_user_time" ON "recent_content_view" USING btree ("user_id","viewed_at");--> statement-breakpoint
CREATE INDEX "idx_user_progress_user" ON "user_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_progress_content" ON "user_progress" USING btree ("content_item_id");--> statement-breakpoint
CREATE INDEX "idx_transaction_user" ON "transaction" USING btree ("user_id");