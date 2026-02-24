import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { userFlashcardAttempt, userFlashcardQuestionAnswer } from "@habitutor/db/schema/flashcard";
import { question, questionAnswerOption } from "@habitutor/db/schema/practice-pack";
import { and, desc, eq, gte, inArray, isNull, sql } from "drizzle-orm";

export const flashcardRepo = {
	getLatestAttempt: async ({ db = defaultDb, userId }: { db?: DrizzleDatabase; userId: string }) => {
		const [attempt] = await db
			.select()
			.from(userFlashcardAttempt)
			.where(eq(userFlashcardAttempt.userId, userId))
			.orderBy(desc(userFlashcardAttempt.startedAt))
			.limit(1);
		return attempt;
	},

	getLatestAttemptForToday: async ({
		db = defaultDb,
		userId,
		today,
	}: {
		db?: DrizzleDatabase;
		userId: string;
		today: Date;
	}) => {
		const [attempt] = await db
			.select()
			.from(userFlashcardAttempt)
			.where(and(eq(userFlashcardAttempt.userId, userId), gte(userFlashcardAttempt.startedAt, today)))
			.orderBy(desc(userFlashcardAttempt.startedAt))
			.limit(1);
		return attempt;
	},

	createAttempt: async ({
		db = defaultDb,
		userId,
		deadline,
	}: {
		db?: DrizzleDatabase;
		userId: string;
		deadline: Date;
	}) => {
		const [attempt] = await db
			.insert(userFlashcardAttempt)
			.values({
				userId,
				startedAt: new Date(),
				deadline,
			})
			.returning();
		return attempt;
	},

	getRandomFlashcardQuestionIds: async ({ db = defaultDb, limit = 5 }: { db?: DrizzleDatabase; limit?: number }) => {
		return await db
			.select({ id: question.id })
			.from(question)
			.where(eq(question.isFlashcardQuestion, true))
			.orderBy(sql`RANDOM()`)
			.limit(limit);
	},

	getQuestionsByIds: async ({ db = defaultDb, ids }: { db?: DrizzleDatabase; ids: number[] }) => {
		return db.query.question.findMany({
			where: inArray(question.id, ids),
			with: {
				answerOptions: true,
			},
		});
	},

	insertQuestionAnswers: async ({
		db = defaultDb,
		answers,
	}: {
		db?: DrizzleDatabase;
		answers: Array<{ attemptId: number; assignedDate: Date; questionId: number }>;
	}) => {
		return db.insert(userFlashcardQuestionAnswer).values(answers);
	},

	getUnansweredQuestions: async ({ db = defaultDb, attemptId }: { db?: DrizzleDatabase; attemptId: number }) => {
		return db.query.userFlashcardQuestionAnswer.findMany({
			where: and(
				eq(userFlashcardQuestionAnswer.attemptId, attemptId),
				isNull(userFlashcardQuestionAnswer.selectedAnswerId),
			),
			with: {
				question: {
					columns: {
						id: true,
						content: true,
						contentJson: true,
					},
					with: {
						answerOptions: {
							columns: {
								id: true,
								content: true,
								code: true,
							},
							orderBy: (answers, { asc }) => [asc(answers.code)],
						},
					},
				},
			},
		});
	},

	getAttemptById: async ({ db = defaultDb, attemptId }: { db?: DrizzleDatabase; attemptId: number }) => {
		const [attempt] = await db
			.select()
			.from(userFlashcardAttempt)
			.where(eq(userFlashcardAttempt.id, attemptId))
			.limit(1);
		return attempt;
	},

	markAttemptSubmitted: async ({ db = defaultDb, attemptId }: { db?: DrizzleDatabase; attemptId: number }) => {
		const [attempt] = await db
			.update(userFlashcardAttempt)
			.set({ submittedAt: new Date() })
			.where(eq(userFlashcardAttempt.id, attemptId))
			.returning();
		return attempt;
	},

	getAttemptForQuestion: async ({
		db = defaultDb,
		userId,
		questionId,
		today,
	}: {
		db?: DrizzleDatabase;
		userId: string;
		questionId: number;
		today: Date;
	}) => {
		const [attempt] = await db
			.select({
				id: userFlashcardAttempt.id,
				deadline: userFlashcardAttempt.deadline,
			})
			.from(userFlashcardQuestionAnswer)
			.innerJoin(userFlashcardAttempt, eq(userFlashcardQuestionAnswer.attemptId, userFlashcardAttempt.id))
			.where(
				and(
					eq(userFlashcardQuestionAnswer.questionId, questionId),
					eq(userFlashcardQuestionAnswer.assignedDate, today),
					eq(userFlashcardAttempt.userId, userId),
				),
			)
			.orderBy(desc(userFlashcardAttempt.startedAt))
			.limit(1);
		return attempt;
	},

	getAnswersForQuestion: async ({ db = defaultDb, questionId }: { db?: DrizzleDatabase; questionId: number }) => {
		return db
			.select({
				id: questionAnswerOption.id,
				isCorrect: questionAnswerOption.isCorrect,
			})
			.from(questionAnswerOption)
			.where(eq(questionAnswerOption.questionId, questionId));
	},

	updateQuestionAnswer: async ({
		db = defaultDb,
		questionId,
		attemptId,
		selectedAnswerId,
		today,
	}: {
		db?: DrizzleDatabase;
		questionId: number;
		attemptId: number;
		selectedAnswerId: number;
		today: Date;
	}) => {
		return db
			.update(userFlashcardQuestionAnswer)
			.set({ selectedAnswerId })
			.where(
				and(
					eq(userFlashcardQuestionAnswer.questionId, questionId),
					eq(userFlashcardQuestionAnswer.assignedDate, today),
					eq(userFlashcardQuestionAnswer.attemptId, attemptId),
				),
			);
	},

	getAttemptWithOptionalId: async ({
		db = defaultDb,
		userId,
		attemptId,
	}: {
		db?: DrizzleDatabase;
		userId: string;
		attemptId?: number;
	}) => {
		const [attempt] = await db
			.select()
			.from(userFlashcardAttempt)
			.where(
				and(eq(userFlashcardAttempt.userId, userId), attemptId ? eq(userFlashcardAttempt.id, attemptId) : undefined),
			)
			.orderBy(desc(userFlashcardAttempt.startedAt))
			.limit(1);
		return attempt;
	},

	getAttemptQuestionAnswers: async ({ db = defaultDb, attemptId }: { db?: DrizzleDatabase; attemptId: number }) => {
		return db.query.userFlashcardQuestionAnswer.findMany({
			where: eq(userFlashcardQuestionAnswer.attemptId, attemptId),
			columns: {
				selectedAnswerId: true,
			},
			with: {
				question: {
					columns: {
						id: true,
						content: true,
						contentJson: true,
						discussion: true,
						discussionJson: true,
					},
					with: {
						answerOptions: {
							columns: {
								id: true,
								content: true,
								code: true,
								isCorrect: true,
							},
							orderBy: (answers, { asc }) => [asc(answers.code)],
						},
					},
				},
			},
		});
	},

	getUserHistory: async ({
		db = defaultDb,
		userId,
		limit = 50,
	}: {
		db?: DrizzleDatabase;
		userId: string;
		limit?: number;
	}) => {
		return db
			.select({
				id: userFlashcardAttempt.id,
				startedAt: userFlashcardAttempt.startedAt,
				submittedAt: userFlashcardAttempt.submittedAt,
			})
			.from(userFlashcardAttempt)
			.where(eq(userFlashcardAttempt.userId, userId))
			.orderBy(desc(userFlashcardAttempt.startedAt))
			.limit(limit);
	},
};
