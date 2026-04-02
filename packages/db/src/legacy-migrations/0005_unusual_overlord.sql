CREATE INDEX "idx_flashcard_attempt_user" ON "user_flashcard_attempt" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_flashcard_attempt_user_started" ON "user_flashcard_attempt" USING btree ("user_id","started_at");--> statement-breakpoint
CREATE INDEX "idx_flashcard_answer_attempt" ON "user_flashcard_question_answer" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX "idx_pp_attempt_user" ON "practice_pack_attempt" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_pp_attempt_pack" ON "practice_pack_attempt" USING btree ("practice_pack_id");--> statement-breakpoint
CREATE INDEX "idx_pp_user_answer_attempt" ON "practice_pack_user_answer" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX "idx_question_flashcard" ON "question" USING btree ("is_flashcard_question");--> statement-breakpoint
CREATE INDEX "idx_answer_option_question" ON "question_answer_option" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "idx_transaction_user" ON "transaction" USING btree ("user_id");