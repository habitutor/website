CREATE TABLE "content_practice_answer" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "content_practice_answer_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"content_item_id" integer NOT NULL,
	"question_id" integer NOT NULL,
	"selected_answer_id" integer NOT NULL,
	"is_correct" boolean NOT NULL,
	"answered_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "content_practice_answer" ADD CONSTRAINT "content_practice_answer_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_practice_answer" ADD CONSTRAINT "content_practice_answer_content_item_id_content_item_id_fk" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_practice_answer" ADD CONSTRAINT "content_practice_answer_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_practice_answer" ADD CONSTRAINT "content_practice_answer_selected_answer_id_question_answer_option_id_fk" FOREIGN KEY ("selected_answer_id") REFERENCES "public"."question_answer_option"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "content_practice_answer_current_unique" ON "content_practice_answer" USING btree ("user_id","content_item_id","question_id") WHERE archived_at is null;--> statement-breakpoint
CREATE INDEX "idx_content_practice_answer_question" ON "content_practice_answer" USING btree ("question_id");