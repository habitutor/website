import { db } from "@habitutor/db";
import { practicePack, practicePackQuestions, question, questionAnswerOption } from "@habitutor/db/schema/practice-pack";
import { user } from "@habitutor/db/schema/auth";
import { ORPCError } from "@orpc/server";
import { type } from "arktype";
import { and, count, eq, sql } from "drizzle-orm";
import { admin } from "../../index";

const getStatistics = admin
	.route({
		path: "/admin/statistics",
		method: "GET",
		tags: ["Admin - Statistics"],
	})
	.handler(async () => {
		const [totalUsers] = await db.select({ count: count() }).from(user);
		const [totalPacks] = await db.select({ count: count() }).from(practicePack);
		const [totalQuestions] = await db.select({ count: count() }).from(question);

		return {
			totalUsers: totalUsers?.count || 0,
			totalPracticePacks: totalPacks?.count || 0,
			totalQuestions: totalQuestions?.count || 0,
		};
	});

const listPacks = admin
	.route({
		path: "/admin/practice-packs",
		method: "GET",
		tags: ["Admin - Practice Packs"],
	})
	.input(
		type({
			"limit?": "number",
			"offset?": "number",
		}),
	)
	.handler(async ({ input }) => {
		const limit = input.limit || 20;
		const offset = input.offset || 0;

		const [totalCount] = await db.select({ count: count() }).from(practicePack);

		const packs = await db
			.select({
				id: practicePack.id,
				title: practicePack.title,
				description: practicePack.description,
			})
			.from(practicePack)
			.limit(limit)
			.offset(offset)
			.orderBy(practicePack.id);

		return {
			data: packs,
			total: totalCount?.count || 0,
			limit,
			offset,
		};
	});

const createPack = admin
	.route({
		path: "/admin/practice-packs",
		method: "POST",
		tags: ["Admin - Practice Packs"],
	})
	.input(
		type({
			title: "string",
			"description?": "string",
		}),
	)
	.handler(async ({ input }) => {
		const [pack] = await db
			.insert(practicePack)
			.values({
				...input,
			})
			.returning();

		if (!pack)
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Gagal membuat practice pack",
			});

		return pack;
	});

const updatePack = admin
	.route({
		path: "/admin/practice-packs/{id}",
		method: "PUT",
		tags: ["Admin - Practice Packs"],
	})
	.input(
		type({
			id: "number",
			title: "string",
			"description?": "string",
		}),
	)
	.handler(async ({ input }) => {
		const [pack] = await db
			.update(practicePack)
			.set({
				title: input.title,
				description: input.description,
			})
			.where(eq(practicePack.id, input.id))
			.returning();

		if (!pack)
			throw new ORPCError("NOT_FOUND", {
				message: "Practice pack tidak ditemukan",
			});

		return pack;
	});

const deletePack = admin
	.route({
		path: "/admin/practice-packs/{id}",
		method: "DELETE",
		tags: ["Admin - Practice Packs"],
	})
	.input(type({ id: "number" }))
	.handler(async ({ input }) => {
		const [pack] = await db.delete(practicePack).where(eq(practicePack.id, input.id)).returning();

		if (!pack)
			throw new ORPCError("NOT_FOUND", {
				message: "Practice pack tidak ditemukan",
			});

		return { message: "Berhasil menghapus practice pack" };
	});

const getPackQuestions = admin
	.route({
		path: "/admin/practice-packs/{id}/questions",
		method: "GET",
		tags: ["Admin - Practice Packs"],
	})
	.input(type({ id: "number" }))
	.handler(async ({ input }) => {
		const questions = await db
			.select({
				id: question.id,
				content: question.content,
				discussion: question.discussion,
				order: practicePackQuestions.order,
			})
			.from(practicePackQuestions)
			.innerJoin(question, eq(practicePackQuestions.questionId, question.id))
			.where(eq(practicePackQuestions.practicePackId, input.id))
			.orderBy(practicePackQuestions.order);

		return questions;
	});

// QUESTION CRUD

const listAllQuestions = admin
	.route({
		path: "/admin/questions",
		method: "GET",
		tags: ["Admin - Questions"],
	})
	.input(
		type({
			"limit?": "number",
			"offset?": "number",
			"unusedOnly?": "boolean",
		}),
	)
	.handler(async ({ input }) => {
		const limit = input.limit || 20;
		const offset = input.offset || 0;
		const unusedOnly = input.unusedOnly || false;

		// Get all questions with pack count
		const allQuestions = await db
			.select({
				id: question.id,
				content: question.content,
				discussion: question.discussion,
				packCount: sql<number>`cast(count(${practicePackQuestions.practicePackId}) as integer)`,
			})
			.from(question)
			.leftJoin(practicePackQuestions, eq(question.id, practicePackQuestions.questionId))
			.groupBy(question.id)
			.orderBy(question.id);

		// Filter unused if needed
		const filteredQuestions = unusedOnly ? allQuestions.filter((q) => q.packCount === 0) : allQuestions;

		// Apply pagination
		const total = filteredQuestions.length;
		const paginatedQuestions = filteredQuestions.slice(offset, offset + limit);

		return {
			data: paginatedQuestions,
			total,
			limit,
			offset,
		};
	});

const getQuestionDetail = admin
	.route({
		path: "/admin/questions/{id}",
		method: "GET",
		tags: ["Admin - Questions"],
	})
	.input(type({ id: "number" }))
	.handler(async ({ input }) => {
		const [q] = await db.select().from(question).where(eq(question.id, input.id)).limit(1);

		if (!q)
			throw new ORPCError("NOT_FOUND", {
				message: "Question tidak ditemukan",
			});

		const answers = await db
			.select()
			.from(questionAnswerOption)
			.where(eq(questionAnswerOption.questionId, input.id))
			.orderBy(questionAnswerOption.code);

		return {
			...q,
			answers,
		};
	});

const createQuestion = admin
	.route({
		path: "/admin/questions",
		method: "POST",
		tags: ["Admin - Questions"],
	})
	.input(
		type({
			content: "string",
			discussion: "string",
		}),
	)
	.handler(async ({ input }) => {
		const [q] = await db
			.insert(question)
			.values({
				content: input.content,
				discussion: input.discussion,
			})
			.returning();

		if (!q)
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Gagal membuat question",
			});

		return q;
	});

const updateQuestion = admin
	.route({
		path: "/admin/questions/{id}",
		method: "PUT",
		tags: ["Admin - Questions"],
	})
	.input(
		type({
			id: "number",
			content: "string",
			discussion: "string",
		}),
	)
	.handler(async ({ input }) => {
		const [q] = await db
			.update(question)
			.set({
				content: input.content,
				discussion: input.discussion,
			})
			.where(eq(question.id, input.id))
			.returning();

		if (!q)
			throw new ORPCError("NOT_FOUND", {
				message: "Question tidak ditemukan",
			});

		return q;
	});

const deleteQuestion = admin
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

// QUESTION - PRACTICE PACK RELATION

const addQuestionToPack = admin
	.route({
		path: "/admin/practice-packs/{practicePackId}/questions",
		method: "POST",
		tags: ["Admin - Practice Pack Questions"],
	})
	.input(
		type({
			practicePackId: "number",
			questionId: "number",
			order: "number",
		}),
	)
	.handler(async ({ input }) => {
		const [pack] = await db.select().from(practicePack).where(eq(practicePack.id, input.practicePackId)).limit(1);

		if (!pack)
			throw new ORPCError("NOT_FOUND", {
				message: "Practice pack tidak ditemukan",
			});

		const [q] = await db.select().from(question).where(eq(question.id, input.questionId)).limit(1);

		if (!q)
			throw new ORPCError("NOT_FOUND", {
				message: "Question tidak ditemukan",
			});

		await db
			.insert(practicePackQuestions)
			.values({
				practicePackId: input.practicePackId,
				questionId: input.questionId,
				order: input.order,
			})
			.onConflictDoNothing();

		return { message: "Berhasil menambahkan question ke practice pack" };
	});

const removeQuestionFromPack = admin
	.route({
		path: "/admin/practice-packs/{practicePackId}/questions/{questionId}",
		method: "DELETE",
		tags: ["Admin - Practice Pack Questions"],
	})
	.input(
		type({
			practicePackId: "number",
			questionId: "number",
		}),
	)
	.handler(async ({ input }) => {
		await db
			.delete(practicePackQuestions)
			.where(
				and(
					eq(practicePackQuestions.practicePackId, input.practicePackId),
					eq(practicePackQuestions.questionId, input.questionId),
				),
			);

		return { message: "Berhasil menghapus question dari practice pack" };
	});

const updateQuestionOrder = admin
	.route({
		path: "/admin/practice-packs/{practicePackId}/questions/{questionId}",
		method: "PATCH",
		tags: ["Admin - Practice Pack Questions"],
	})
	.input(
		type({
			practicePackId: "number",
			questionId: "number",
			order: "number",
		}),
	)
	.handler(async ({ input }) => {
		await db
			.update(practicePackQuestions)
			.set({ order: input.order })
			.where(
				and(
					eq(practicePackQuestions.practicePackId, input.practicePackId),
					eq(practicePackQuestions.questionId, input.questionId),
				),
			);

		return { message: "Berhasil mengupdate urutan question" };
	});

// ANSWER OPTION CRUD

const createAnswerOption = admin
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

const updateAnswerOption = admin
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

const deleteAnswerOption = admin
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

// EXPORT

export const adminPracticePackRouter = {
	// Statistics
	getStatistics,

	// Practice Pack
	listPacks,
	createPack,
	updatePack,
	deletePack,
	getPackQuestions,

	// Question
	listAllQuestions,
	getQuestionDetail,
	createQuestion,
	updateQuestion,
	deleteQuestion,

	// Question - Pack Relation
	addQuestionToPack,
	removeQuestionFromPack,
	updateQuestionOrder,

	// Answer Options
	createAnswerOption,
	updateAnswerOption,
	deleteAnswerOption,
};
