ALTER TABLE "practice_pack_attempt" DROP CONSTRAINT "practice_pack_attempt_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "practice_pack_user_answer" DROP CONSTRAINT "practice_pack_user_answer_selected_answer_id_question_answer_option_id_fk";
--> statement-breakpoint
ALTER TABLE "practice_pack_attempt" ADD CONSTRAINT "practice_pack_attempt_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_pack_user_answer" ADD CONSTRAINT "practice_pack_user_answer_selected_answer_id_question_answer_option_id_fk" FOREIGN KEY ("selected_answer_id") REFERENCES "public"."question_answer_option"("id") ON DELETE cascade ON UPDATE no action;