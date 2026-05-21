ALTER TABLE "practice_pack_attempt" DROP CONSTRAINT "practice_pack_attempt_user_id_user_id_fk";
--> statement-breakpoint
DO $$
DECLARE
	constraint_to_drop text;
BEGIN
	SELECT constraint_name
	INTO constraint_to_drop
	FROM information_schema.table_constraints
	WHERE table_schema = 'public'
		AND table_name = 'practice_pack_user_answer'
		AND constraint_name IN (
			'practice_pack_user_answer_selected_answer_id_question_answer_option_id_fk',
			'practice_pack_user_answer_selected_answer_id_question_answer_op'
		)
	LIMIT 1;

	IF constraint_to_drop IS NOT NULL THEN
		EXECUTE format(
			'ALTER TABLE "practice_pack_user_answer" DROP CONSTRAINT %I',
			constraint_to_drop
		);
	END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "practice_pack_attempt" ADD CONSTRAINT "practice_pack_attempt_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_pack_user_answer" ADD CONSTRAINT "practice_pack_user_answer_selected_answer_id_question_answer_option_id_fk" FOREIGN KEY ("selected_answer_id") REFERENCES "public"."question_answer_option"("id") ON DELETE cascade ON UPDATE no action;