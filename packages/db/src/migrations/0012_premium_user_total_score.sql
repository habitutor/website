ALTER TABLE "user"
	ADD COLUMN IF NOT EXISTS "total_score" integer DEFAULT 0 NOT NULL;

WITH attempt_scores AS (
	SELECT
		a.id AS attempt_id,
		a.user_id,
		COUNT(aq.question_id) AS question_count,
		COALESCE(SUM(CASE WHEN ao.is_correct THEN 1 ELSE 0 END), 0) AS correct_count
	FROM "user_flashcard_attempt" a
	INNER JOIN "user_flashcard_question_answer" aq ON aq.attempt_id = a.id
	LEFT JOIN "question_answer_option" ao ON ao.id = aq.selected_answer_id
	WHERE a.submitted_at IS NOT NULL
	GROUP BY a.id, a.user_id
), user_scores AS (
	SELECT
		user_id,
		COALESCE(
			SUM(
				CASE
					WHEN question_count > 0 THEN ROUND((correct_count::numeric * 100) / question_count)::int
					ELSE 0
				END
			),
			0
		) AS total_score
	FROM attempt_scores
	GROUP BY user_id
)
UPDATE "user" u
SET "total_score" = us.total_score
FROM user_scores us
WHERE u.id = us.user_id;
