import { db } from "@habitutor/db";
import { practicePack, practicePackQuestions, question, questionAnswerOption } from "@habitutor/db/schema/practice-pack";
import { ORPCError } from "@orpc/server";
import { type } from "arktype";
import { and, eq } from "drizzle-orm";
import { admin } from "../../index";

const listPacks = admin
	.route({
		path: "/admin/practice-packs",
		method: "GET",
		tags: ["Admin - Practice Packs"],
	})
	.handler(async () => {
		const packs = await db
			.select({
				id: practicePack.id,
				title: practicePack.title,
				description: practicePack.description,
			})
			.from(practicePack);

		return packs;
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

// QUESTION CRUD

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
		await db.delete(practicePackQuestions).where(and(eq(practicePackQuestions.practicePackId, input.practicePackId), eq(practicePackQuestions.questionId, input.questionId)));

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
			.where(and(eq(practicePackQuestions.practicePackId, input.practicePackId), eq(practicePackQuestions.questionId, input.questionId)));

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
	// Practice Pack
	listPacks,
	createPack,
	updatePack,
	deletePack,

	// Question
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
