import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import {
	practicePack,
	practicePackAttempt,
	practicePackQuestions,
	practicePackUserAnswer,
	question,
	questionAnswerOption,
} from "@habitutor/db/schema/practice-pack";
import { and, count, desc, eq } from "drizzle-orm";
import type { Question } from "../../types/practice-pack";

export const practicePackRepo = {
	listWithAttempts: async ({ db = defaultDb, userId }: { db?: DrizzleDatabase; userId: string }) => {
		return db
			.select({
				id: practicePack.id,
				attemptId: practicePackAttempt.id,
				title: practicePack.title,
				status: practicePackAttempt.status ?? "not_started",
				startedAt: practicePackAttempt.startedAt,
				completedAt: practicePackAttempt.completedAt,
			})
			.from(practicePack)
			.leftJoin(
				practicePackAttempt,
				and(eq(practicePack.id, practicePackAttempt.practicePackId), eq(practicePackAttempt.userId, userId)),
			);
	},

	findWithQuestions: async ({
		db = defaultDb,
		packId,
		userId,
	}: {
		db?: DrizzleDatabase;
		packId: number;
		userId: string;
	}) => {
		return db
			.select({
				attemptId: practicePackAttempt.id,
				title: practicePack.title,
				status: practicePackAttempt.status,
				startedAt: practicePackAttempt.startedAt,
				completedAt: practicePackAttempt.completedAt,
				questionId: practicePackQuestions.questionId,
				questionOrder: practicePackQuestions.order,
				questionContent: question.content,
				questionContentJson: question.contentJson,
				questionDiscussion: question.discussion,
				questionDiscussionJson: question.discussionJson,
				answerId: questionAnswerOption.id,
				answerContent: questionAnswerOption.content,
				userSelectedAnswerId: practicePackUserAnswer.selectedAnswerId,
			})
			.from(practicePack)
			.innerJoin(practicePackAttempt, eq(practicePackAttempt.practicePackId, practicePack.id))
			.innerJoin(practicePackQuestions, eq(practicePackQuestions.practicePackId, practicePack.id))
			.innerJoin(question, eq(question.id, practicePackQuestions.questionId))
			.innerJoin(questionAnswerOption, eq(questionAnswerOption.questionId, question.id))
			.leftJoin(
				practicePackUserAnswer,
				and(
					eq(practicePackUserAnswer.questionId, question.id),
					eq(practicePackUserAnswer.attemptId, practicePackAttempt.id),
				),
			)
			.where(and(eq(practicePack.id, packId), eq(practicePackAttempt.userId, userId)));
	},

	createAttempt: async ({
		db = defaultDb,
		packId,
		userId,
	}: {
		db?: DrizzleDatabase;
		packId: number;
		userId: string;
	}) => {
		const [attempt] = await db
			.insert(practicePackAttempt)
			.values({
				practicePackId: packId,
				userId,
			})
			.onConflictDoNothing()
			.returning();
		return attempt;
	},

	getAttempt: async ({ db = defaultDb, packId, userId }: { db?: DrizzleDatabase; packId: number; userId: string }) => {
		const [attempt] = await db
			.select({
				id: practicePackAttempt.id,
				userId: practicePackAttempt.userId,
				status: practicePackAttempt.status,
			})
			.from(practicePackAttempt)
			.where(and(eq(practicePackAttempt.practicePackId, packId), eq(practicePackAttempt.userId, userId)))
			.limit(1);
		return attempt;
	},

	saveAnswer: async ({
		db = defaultDb,
		attemptId,
		questionId,
		selectedAnswerId,
	}: {
		db?: DrizzleDatabase;
		attemptId: number;
		questionId: number;
		selectedAnswerId: number;
	}) => {
		return db
			.insert(practicePackUserAnswer)
			.values({
				attemptId,
				questionId,
				selectedAnswerId,
			})
			.onConflictDoUpdate({
				target: [practicePackUserAnswer.attemptId, practicePackUserAnswer.questionId],
				set: { selectedAnswerId },
			});
	},

	submitAttempt: async ({
		db = defaultDb,
		packId,
		userId,
	}: {
		db?: DrizzleDatabase;
		packId: number;
		userId: string;
	}) => {
		const [attempt] = await db
			.update(practicePackAttempt)
			.set({
				completedAt: new Date(),
				status: "finished",
			})
			.where(and(eq(practicePackAttempt.practicePackId, packId), eq(practicePackAttempt.userId, userId)))
			.returning();
		return attempt;
	},

	countAttempts: async ({ db = defaultDb, userId }: { db?: DrizzleDatabase; userId: string }) => {
		const [result] = await db
			.select({ count: count() })
			.from(practicePackAttempt)
			.where(eq(practicePackAttempt.userId, userId));
		return result?.count ?? 0;
	},

	getHistory: async ({
		db = defaultDb,
		userId,
		limit,
		offset,
	}: {
		db?: DrizzleDatabase;
		userId: string;
		limit: number;
		offset: number;
	}) => {
		return db
			.select({
				practicePackId: practicePackAttempt.practicePackId,
				startedAt: practicePackAttempt.startedAt,
				completedAt: practicePackAttempt.completedAt,
				status: practicePackAttempt.status,
			})
			.from(practicePackAttempt)
			.where(eq(practicePackAttempt.userId, userId))
			.orderBy(desc(practicePackAttempt.startedAt))
			.limit(limit)
			.offset(offset);
	},

	findHistoryByPack: async ({
		db = defaultDb,
		packId,
		userId,
	}: {
		db?: DrizzleDatabase;
		packId: number;
		userId: string;
	}) => {
		return db
			.select({
				attemptId: practicePackAttempt.id,
				title: practicePack.title,
				questionId: practicePackQuestions.questionId,
				questionOrder: practicePackQuestions.order,
				questionContent: question.content,
				questionContentJson: question.contentJson,
				questionDiscussion: question.discussion,
				questionDiscussionJson: question.discussionJson,
				answerId: questionAnswerOption.id,
				answerContent: questionAnswerOption.content,
				answerIsCorrect: questionAnswerOption.isCorrect,
				userSelectedAnswerId: practicePackUserAnswer.selectedAnswerId,
				startedAt: practicePackAttempt.startedAt,
				completedAt: practicePackAttempt.completedAt,
			})
			.from(practicePack)
			.innerJoin(practicePackAttempt, eq(practicePackAttempt.practicePackId, practicePack.id))
			.innerJoin(practicePackQuestions, eq(practicePackQuestions.practicePackId, practicePack.id))
			.innerJoin(question, eq(question.id, practicePackQuestions.questionId))
			.innerJoin(questionAnswerOption, eq(questionAnswerOption.questionId, question.id))
			.leftJoin(
				practicePackUserAnswer,
				and(
					eq(practicePackUserAnswer.questionId, question.id),
					eq(practicePackUserAnswer.attemptId, practicePackAttempt.id),
				),
			)
			.where(
				and(
					eq(practicePack.id, packId),
					eq(practicePackAttempt.userId, userId),
					eq(practicePackAttempt.status, "finished"),
				),
			);
	},
};

export function buildQuestionMap(
	rows: Array<{
		questionId: number;
		questionOrder: number | null;
		questionContent: string;
		questionContentJson: unknown;
		questionDiscussion: string;
		questionDiscussionJson: unknown;
		answerId: number;
		answerContent: string;
		selectedAnswerId?: number | null;
		answerIsCorrect?: boolean | null;
	}>,
): Map<number, Question & { userAnswerIsCorrect?: boolean }> {
	const questionMap = new Map<number, Question & { userAnswerIsCorrect?: boolean }>();

	for (const row of rows) {
		if (!questionMap.has(row.questionId)) {
			questionMap.set(row.questionId, {
				id: row.questionId,
				order: row.questionOrder ?? 1,
				content: (row.questionContentJson || row.questionContent) as Record<string, unknown>,
				discussion: (row.questionDiscussionJson || row.questionDiscussion) as Record<string, unknown>,
				selectedAnswerId: row.selectedAnswerId ?? null,
				answers: [],
			});
		}

		questionMap.get(row.questionId)?.answers.push({
			id: row.answerId,
			content: row.answerContent,
		});
	}

	return questionMap;
}

export function buildHistoryQuestionMap(
	rows: Array<{
		questionId: number;
		questionOrder: number | null;
		questionContent: string;
		questionContentJson: unknown;
		questionDiscussion: string;
		questionDiscussionJson: unknown;
		answerId: number;
		answerContent: string;
		answerIsCorrect: boolean | null;
		selectedAnswerId: number | null;
	}>,
): Map<number, Question & { userAnswerIsCorrect: boolean }> {
	const questionMap = new Map<number, Question & { userAnswerIsCorrect: boolean }>();

	for (const row of rows) {
		if (!questionMap.has(row.questionId)) {
			const userAnswerIsCorrect =
				row.selectedAnswerId !== null && row.answerIsCorrect === true && row.selectedAnswerId === row.answerId;

			questionMap.set(row.questionId, {
				id: row.questionId,
				order: row.questionOrder ?? 1,
				content: (row.questionContentJson || row.questionContent) as Record<string, unknown>,
				discussion: (row.questionDiscussionJson || row.questionDiscussion) as Record<string, unknown>,
				selectedAnswerId: row.selectedAnswerId ?? null,
				userAnswerIsCorrect,
				answers: [],
			});
		}

		const q = questionMap.get(row.questionId);
		q?.answers.push({
			id: row.answerId,
			content: row.answerContent,
			isCorrect: row.answerIsCorrect ?? undefined,
		});

		if (q && row.selectedAnswerId === row.answerId && row.answerIsCorrect === true) {
			q.userAnswerIsCorrect = true;
		}
	}

	return questionMap;
}
