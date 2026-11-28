CREATE TABLE "question_report" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "question_report_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"question_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"reason" text NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp,
	"resolution" text
);
--> statement-breakpoint
ALTER TABLE "question_report" ADD CONSTRAINT "question_report_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_report" ADD CONSTRAINT "question_report_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "question_report_open_unique" ON "question_report" USING btree ("question_id","user_id") WHERE resolved_at is null;--> statement-breakpoint
CREATE INDEX "idx_question_report_question" ON "question_report" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "idx_question_report_user_created" ON "question_report" USING btree ("user_id","created_at");