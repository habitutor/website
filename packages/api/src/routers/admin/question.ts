import { db } from "@habitutor/db";
import { practicePackQuestions, question, questionAnswerOption } from "@habitutor/db/schema/practice-pack";
import { ORPCError } from "@orpc/server";
import { type } from "arktype";
import { and, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import { admin } from "../../index";
import { convertToTiptap } from "../../lib/tiptap";

interface CursorData {
	id: number;
}

function encodeCursor(data: CursorData): string {
	return Buffer.from(JSON.stringify(data)).toString("base64url");
}

function decodeCursor(cursor: string): CursorData {
	try {
		return JSON.parse(Buffer.from(cursor, "base64url").toString());
	} catch {
		throw new ORPCError("BAD_REQUEST", { message: "Invalid cursor" });
	}
}

const list = admin
	.route({
		path: "/admin/questions",
		method: "GET",
		tags: ["Admin - Questions"],
	})
	.input(
		type({
			"limit?": "number",
			"cursor?": "string",
			"search?": "string",
		}),
	)
	.handler(async ({ input }) => {
		const limit = Math.min(input.limit || 20, 50);
		const search = input.search || "";
		const cursorData = input.cursor ? decodeCursor(input.cursor) : null;

		const rawData = await db
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
					cursorData ? sql`${question.id} < ${cursorData.id}` : undefined,
				),
			)
			.leftJoin(practicePackQuestions, eq(question.id, practicePackQuestions.questionId))
			.groupBy(question.id)
			.orderBy(desc(question.id))
			.limit(limit + 1);

		const hasMore = rawData.length > limit;
		const data = hasMore ? rawData.slice(0, limit) : rawData;

		const lastItem = data[data.length - 1];
		const nextCursor = hasMore && lastItem ? encodeCursor({ id: lastItem.id }) : null;

		return {
			data: data.map((q) => ({
				id: q.id,
				packCount: q.packCount,
				content: q.contentJson || convertToTiptap(q.content),
				discussion: q.discussionJson || convertToTiptap(q.discussion),
				isFlashcardQuestion: q.isFlashcardQuestion,
			})),
			nextCursor,
			hasMore,
		};
	});

const get = admin
	.route({
		path: "/admin/questions/{id}",
		method: "GET",
		tags: ["Admin - Questions"],
	})
	.input(type({ id: "number" }))
	.handler(async ({ input }) => {
		const q = await db.query.question.findFirst({
			where: eq(question.id, input.id),
			with: {
				answerOptions: {
					orderBy: (answerOptions, { asc }) => [asc(answerOptions.code)],
				},
			},
		});

		if (!q)
			throw new ORPCError("NOT_FOUND", {
				message: "Question tidak ditemukan",
			});

		return {
			...q,
			content: q.contentJson || convertToTiptap(q.content),
			discussion: q.discussionJson || convertToTiptap(q.discussion),
			answers: q.answerOptions,
		};
	});

const create = admin
	.route({
		path: "/admin/questions",
		method: "POST",
		tags: ["Admin - Questions"],
	})
	.input(
		type({
			content: "unknown",
			discussion: "unknown",
			"isFlashcardQuestion?": "boolean",
		}),
	)
	.handler(async ({ input }) => {
		const contentJson = typeof input.content === "object" ? input.content : null;
		const discussionJson = typeof input.discussion === "object" ? input.discussion : null;

		const contentText = typeof input.content === "string" ? input.content : JSON.stringify(input.content);
		const discussionText = typeof input.discussion === "string" ? input.discussion : JSON.stringify(input.discussion);

		const [q] = await db
			.insert(question)
			.values({
				content: contentText,
				discussion: discussionText,
				contentJson,
				discussionJson,
				isFlashcardQuestion: input.isFlashcardQuestion ?? true,
			})
			.returning();

		if (!q)
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Gagal membuat question",
			});

		return q;
	});

const update = admin
	.route({
		path: "/admin/questions/{id}",
		method: "PUT",
		tags: ["Admin - Questions"],
	})
	.input(
		type({
			id: "number",
			"content?": "unknown",
			"discussion?": "unknown",
			"isFlashcardQuestion?": "boolean",
		}),
	)
	.handler(async ({ input }) => {
		const updateData: Record<string, unknown> = {};

		if (input.content !== undefined) {
			updateData.contentJson = typeof input.content === "object" ? input.content : null;
			updateData.content = typeof input.content === "string" ? input.content : JSON.stringify(input.content);
		}

		if (input.discussion !== undefined) {
			updateData.discussionJson = typeof input.discussion === "object" ? input.discussion : null;
			updateData.discussion =
				typeof input.discussion === "string" ? input.discussion : JSON.stringify(input.discussion);
		}

		if (input.isFlashcardQuestion !== undefined) {
			updateData.isFlashcardQuestion = input.isFlashcardQuestion;
		}

		const [q] = await db.update(question).set(updateData).where(eq(question.id, input.id)).returning();

		if (!q)
			throw new ORPCError("NOT_FOUND", {
				message: "Question tidak ditemukan",
			});

		return q;
	});

const delete_ = admin
	.route({
		path: "/admin/questions/{id}",
		method: "DELETE",
		tags: ["Admin - Questions"],
	})
	.input(type({ id: "number" }))
	.handler(async ({ input }) => {
		const [q] = await db.delete(question).where(eq(question.id, input.id)).returning();

		if (!q)
			throw new ORPCError("NOT_FOUND", {
				message: "Question tidak ditemukan",
			});

		return { message: "Berhasil menghapus question" };
	});

const bulkUpdateFlashcard = admin
	.route({
		path: "/admin/questions/bulk-flashcard",
		method: "PATCH",
		tags: ["Admin - Questions"],
	})
	.input(
		type({
			questionIds: "number[]",
			isFlashcard: "boolean",
		}),
	)
	.output(type({ message: "string", updatedCount: "number" }))
	.handler(async ({ input }) => {
		if (!Array.isArray(input.questionIds) || input.questionIds.length === 0) {
			throw new ORPCError("BAD_REQUEST", {
				message: "questionIds harus berupa array dengan setidaknya satu ID",
			});
		}

		if (input.questionIds.length > 100) {
			throw new ORPCError("BAD_REQUEST", {
				message: "Maksimal 100 questionId dapat diproses sekaligus",
			});
		}

		const existingQuestions = await db
			.select({ id: question.id })
			.from(question)
			.where(inArray(question.id, input.questionIds));

		if (existingQuestions.length !== input.questionIds.length) {
			throw new ORPCError("NOT_FOUND", {
				message: "Beberapa pertanyaan tidak ditemukan",
			});
		}

		await db
			.update(question)
			.set({ isFlashcardQuestion: input.isFlashcard })
			.where(inArray(question.id, input.questionIds));

		return {
			message: input.isFlashcard
				? "Pertanyaan berhasil ditandai sebagai flashcard"
				: "Pertanyaan berhasil dicoret dari flashcard",
			updatedCount: input.questionIds.length,
		};
	});

const createAnswer = admin
	.route({
		path: "/admin/questions/{questionId}/answers",
		method: "POST",
		tags: ["Admin - Answer Options"],
	})
	.input(
		type({
			questionId: "number",
			content: "string",
			isCorrect: "boolean",
			code: "string",
		}),
	)
	.handler(async ({ input }) => {
		const [q] = await db.select().from(question).where(eq(question.id, input.questionId)).limit(1);

		if (!q)
			throw new ORPCError("NOT_FOUND", {
				message: "Question tidak ditemukan",
			});

		const [answer] = await db
			.insert(questionAnswerOption)
			.values({
				questionId: input.questionId,
				content: input.content,
				isCorrect: input.isCorrect,
				code: input.code,
			})
			.returning();

		if (!answer)
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Gagal membuat answer option",
			});

		return answer;
	});

const updateAnswer = admin
	.route({
		path: "/admin/answers/{id}",
		method: "PUT",
		tags: ["Admin - Answer Options"],
	})
	.input(
		type({
			id: "number",
			content: "string",
			isCorrect: "boolean",
		}),
	)
	.handler(async ({ input }) => {
		const [answer] = await db
			.update(questionAnswerOption)
			.set({
				content: input.content,
				isCorrect: input.isCorrect,
			})
			.where(eq(questionAnswerOption.id, input.id))
			.returning();

		if (!answer)
			throw new ORPCError("NOT_FOUND", {
				message: "Answer option tidak ditemukan",
			});

		return answer;
	});

const deleteAnswer = admin
	.route({
		path: "/admin/answers/{id}",
		method: "DELETE",
		tags: ["Admin - Answer Options"],
	})
	.input(type({ id: "number" }))
	.handler(async ({ input }) => {
		const [answer] = await db.delete(questionAnswerOption).where(eq(questionAnswerOption.id, input.id)).returning();

		if (!answer)
			throw new ORPCError("NOT_FOUND", {
				message: "Answer option tidak ditemukan",
			});

		return { message: "Berhasil menghapus answer option" };
	});

export const adminQuestionRouter = {
	list,
	get,
	create,
	update,
	delete: delete_,
	bulkUpdateFlashcard,
	createAnswer,
	updateAnswer,
	deleteAnswer,
};
