import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import {
	practicePack,
	practicePackQuestions,
	question,
	questionAnswerOption,
} from "@habitutor/db/schema/practice-pack";
import { and, count, eq, ilike, inArray, or, sql } from "drizzle-orm";

export const adminPracticePackRepo = {
	list: async ({
		db = defaultDb,
		limit,
		offset,
		search,
	}: {
		db?: DrizzleDatabase;
		limit: number;
		offset: number;
		search: string;
	}) => {
		const baseQuery = db
			.select({
				id: practicePack.id,
				title: practicePack.title,
				description: practicePack.description,
			})
			.from(practicePack);

		const filteredQuery = search
			? baseQuery.where(and(ilike(practicePack.title, `%${search}%`), ilike(practicePack.description, `%${search}%`)))
			: baseQuery;

		return filteredQuery.limit(limit).offset(offset).orderBy(practicePack.id);
	},

	count: async ({ db = defaultDb, search }: { db?: DrizzleDatabase; search: string }) => {
		const [result] = search
			? await db
					.select({ count: count() })
					.from(practicePack)
					.where(or(ilike(practicePack.title, `%${search}%`), ilike(practicePack.description, `%${search}%`)))
			: await db.select({ count: count() }).from(practicePack);
		return result?.count ?? 0;
	},

	getById: async ({ db = defaultDb, id }: { db?: DrizzleDatabase; id: number }) => {
		const [pack] = await db
			.select({
				id: practicePack.id,
				title: practicePack.title,
				description: practicePack.description,
			})
			.from(practicePack)
			.where(eq(practicePack.id, id))
			.limit(1);
		return pack;
	},

	create: async ({
		db = defaultDb,
		title,
		description,
	}: {
		db?: DrizzleDatabase;
		title: string;
		description?: string;
	}) => {
		const [pack] = await db.insert(practicePack).values({ title, description }).returning();
		return pack;
	},

	update: async ({
		db = defaultDb,
		id,
		title,
		description,
	}: {
		db?: DrizzleDatabase;
		id: number;
		title: string;
		description?: string;
	}) => {
		const [pack] = await db.update(practicePack).set({ title, description }).where(eq(practicePack.id, id)).returning();
		return pack;
	},

	delete: async ({ db = defaultDb, id }: { db?: DrizzleDatabase; id: number }) => {
		const [pack] = await db.delete(practicePack).where(eq(practicePack.id, id)).returning();
		return pack;
	},

	getPracticePackById: async ({ db = defaultDb, id }: { db?: DrizzleDatabase; id: number }) => {
		const [pack] = await db.select().from(practicePack).where(eq(practicePack.id, id)).limit(1);
		return pack;
	},

	getQuestionById: async ({ db = defaultDb, id }: { db?: DrizzleDatabase; id: number }) => {
		const [q] = await db.select().from(question).where(eq(question.id, id)).limit(1);
		return q;
	},

	getMaxQuestionOrder: async ({ db = defaultDb, practicePackId }: { db?: DrizzleDatabase; practicePackId: number }) => {
		const [result] = await db
			.select({ maxOrder: sql<number>`COALESCE(MAX(${practicePackQuestions.order}), 0)` })
			.from(practicePackQuestions)
			.where(eq(practicePackQuestions.practicePackId, practicePackId));
		return result?.maxOrder ?? 0;
	},

	addQuestion: async ({
		db = defaultDb,
		practicePackId,
		questionId,
		order,
	}: {
		db?: DrizzleDatabase;
		practicePackId: number;
		questionId: number;
		order: number;
	}) => {
		return db
			.insert(practicePackQuestions)
			.values({
				practicePackId,
				questionId,
				order,
			})
			.onConflictDoNothing();
	},

	removeQuestion: async ({
		db = defaultDb,
		practicePackId,
		questionId,
	}: {
		db?: DrizzleDatabase;
		practicePackId: number;
		questionId: number;
	}) => {
		return db
			.delete(practicePackQuestions)
			.where(
				and(eq(practicePackQuestions.practicePackId, practicePackId), eq(practicePackQuestions.questionId, questionId)),
			);
	},

	updateQuestionOrder: async ({
		db = defaultDb,
		practicePackId,
		questionId,
		order,
	}: {
		db?: DrizzleDatabase;
		practicePackId: number;
		questionId: number;
		order: number;
	}) => {
		return db
			.update(practicePackQuestions)
			.set({ order })
			.where(
				and(eq(practicePackQuestions.practicePackId, practicePackId), eq(practicePackQuestions.questionId, questionId)),
			);
	},

	getQuestionsForPack: async ({ db = defaultDb, packId }: { db?: DrizzleDatabase; packId: number }) => {
		return db
			.select({
				questionId: practicePackQuestions.questionId,
				questionOrder: practicePackQuestions.order,
				questionContent: question.content,
				questionDiscussion: question.discussion,
				questionContentJson: question.contentJson,
				questionDiscussionJson: question.discussionJson,
				questionIsFlashcard: question.isFlashcardQuestion,
				answerId: questionAnswerOption.id,
				answerContent: questionAnswerOption.content,
				answerCode: questionAnswerOption.code,
				answerIsCorrect: questionAnswerOption.isCorrect,
			})
			.from(practicePack)
			.innerJoin(practicePackQuestions, eq(practicePackQuestions.practicePackId, practicePack.id))
			.innerJoin(question, eq(question.id, practicePackQuestions.questionId))
			.innerJoin(questionAnswerOption, eq(questionAnswerOption.questionId, question.id))
			.where(eq(practicePack.id, packId));
	},

	getQuestionIdsForPack: async ({ db = defaultDb, packId }: { db?: DrizzleDatabase; packId: number }) => {
		return db
			.select({ questionId: practicePackQuestions.questionId })
			.from(practicePackQuestions)
			.where(eq(practicePackQuestions.practicePackId, packId));
	},

	updateQuestionsFlashcard: async ({
		db = defaultDb,
		questionIds,
		isFlashcardQuestion,
	}: {
		db?: DrizzleDatabase;
		questionIds: number[];
		isFlashcardQuestion: boolean;
	}) => {
		return db
			.update(question)
			.set({ isFlashcardQuestion })
			.where(inArray(question.id, questionIds))
			.returning({ id: question.id });
	},
};
