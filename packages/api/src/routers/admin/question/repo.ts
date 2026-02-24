import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { practicePackQuestions, question, questionAnswerOption } from "@habitutor/db/schema/practice-pack";
import { and, desc, eq, ilike, inArray, sql } from "drizzle-orm";

export const adminQuestionRepo = {
	list: async ({
		db = defaultDb,
		limit,
		cursorId,
		search,
	}: {
		db?: DrizzleDatabase;
		limit: number;
		cursorId: number | null;
		search: string;
	}) => {
		return db
			.select({
				id: question.id,
				content: question.content,
				contentJson: question.contentJson,
				discussion: question.discussion,
				discussionJson: question.discussionJson,
				isFlashcardQuestion: question.isFlashcardQuestion,
				packCount: sql<number>`cast(count(${practicePackQuestions.practicePackId}) as integer)`,
			})
			.from(question)
			.where(
				and(
					search.length > 0 ? ilike(question.content, `%${search}%`) : undefined,
					cursorId ? sql`${question.id} < ${cursorId}` : undefined,
				),
			)
			.leftJoin(practicePackQuestions, eq(question.id, practicePackQuestions.questionId))
			.groupBy(question.id)
			.orderBy(desc(question.id))
			.limit(limit + 1);
	},

	getById: async ({ db = defaultDb, id }: { db?: DrizzleDatabase; id: number }) => {
		return db.query.question.findFirst({
			where: eq(question.id, id),
			with: {
				answerOptions: {
					orderBy: (answerOptions, { asc }) => [asc(answerOptions.code)],
				},
			},
		});
	},

	create: async ({
		db = defaultDb,
		content,
		discussion,
		contentJson,
		discussionJson,
		isFlashcardQuestion,
	}: {
		db?: DrizzleDatabase;
		content: string;
		discussion: string;
		contentJson: object | null;
		discussionJson: object | null;
		isFlashcardQuestion: boolean;
	}) => {
		const [q] = await db
			.insert(question)
			.values({
				content,
				discussion,
				contentJson,
				discussionJson,
				isFlashcardQuestion,
			})
			.returning();
		return q;
	},

	update: async ({
		db = defaultDb,
		id,
		data,
	}: {
		db?: DrizzleDatabase;
		id: number;
		data: {
			content?: string;
			contentJson?: object | null;
			discussion?: string;
			discussionJson?: object | null;
			isFlashcardQuestion?: boolean;
		};
	}) => {
		const [q] = await db.update(question).set(data).where(eq(question.id, id)).returning();
		return q;
	},

	delete: async ({ db = defaultDb, id }: { db?: DrizzleDatabase; id: number }) => {
		const [q] = await db.delete(question).where(eq(question.id, id)).returning();
		return q;
	},

	getByIds: async ({ db = defaultDb, ids }: { db?: DrizzleDatabase; ids: number[] }) => {
		return db.select({ id: question.id }).from(question).where(inArray(question.id, ids));
	},

	bulkUpdateFlashcard: async ({
		db = defaultDb,
		ids,
		isFlashcard,
	}: {
		db?: DrizzleDatabase;
		ids: number[];
		isFlashcard: boolean;
	}) => {
		return db.update(question).set({ isFlashcardQuestion: isFlashcard }).where(inArray(question.id, ids));
	},

	getQuestionById: async ({ db = defaultDb, id }: { db?: DrizzleDatabase; id: number }) => {
		const [q] = await db.select().from(question).where(eq(question.id, id)).limit(1);
		return q;
	},

	createAnswer: async ({
		db = defaultDb,
		questionId,
		content,
		isCorrect,
		code,
	}: {
		db?: DrizzleDatabase;
		questionId: number;
		content: string;
		isCorrect: boolean;
		code: string;
	}) => {
		const [answer] = await db
			.insert(questionAnswerOption)
			.values({
				questionId,
				content,
				isCorrect,
				code,
			})
			.returning();
		return answer;
	},

	updateAnswer: async ({
		db = defaultDb,
		id,
		content,
		isCorrect,
	}: {
		db?: DrizzleDatabase;
		id: number;
		content: string;
		isCorrect: boolean;
	}) => {
		const [answer] = await db
			.update(questionAnswerOption)
			.set({ content, isCorrect })
			.where(eq(questionAnswerOption.id, id))
			.returning();
		return answer;
	},

	deleteAnswer: async ({ db = defaultDb, id }: { db?: DrizzleDatabase; id: number }) => {
		const [answer] = await db.delete(questionAnswerOption).where(eq(questionAnswerOption.id, id)).returning();
		return answer;
	},
};
