import type { userFlashcardAttempt, userFlashcardQuestionAnswer } from "@habitutor/db/schema/flashcard";

type FlashcardAttempt = typeof userFlashcardAttempt.$inferSelect;
type FlashcardQuestionAnswer = typeof userFlashcardQuestionAnswer.$inferSelect;

export function createTestFlashcardAttempt(overrides?: Partial<FlashcardAttempt>): FlashcardAttempt {
	return {
		id: 1,
		userId: "test-user-id",
		date: new Date(),
		startedAt: new Date(),
		deadline: new Date(Date.now() + 10 * 60 * 1000),
		submittedAt: null,
		...overrides,
	};
}

export function createTestFlashcardQuestionAnswer(
	overrides?: Partial<FlashcardQuestionAnswer>,
): FlashcardQuestionAnswer {
	return {
		attemptId: 1,
		assignedDate: new Date(),
		questionId: 1,
		selectedAnswerId: null,
		answeredAt: null,
		createdAt: new Date(),
		...overrides,
	};
}

export function createTestFlashcardAttemptWithQuestions(
	attemptOverrides?: Partial<FlashcardAttempt>,
	questionIds: number[] = [1, 2, 3, 4, 5],
): {
	attempt: FlashcardAttempt;
	questionAnswers: FlashcardQuestionAnswer[];
} {
	const attempt = createTestFlashcardAttempt(attemptOverrides);
	const questionAnswers = questionIds.map((questionId) =>
		createTestFlashcardQuestionAnswer({
			attemptId: attempt.id,
			questionId,
			assignedDate: attempt.date,
		}),
	);

	return { attempt, questionAnswers };
}
