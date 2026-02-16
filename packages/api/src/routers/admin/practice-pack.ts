import { db } from "@habitutor/db";
import {
	practicePack,
	practicePackQuestions,
	question,
	questionAnswerOption,
} from "@habitutor/db/schema/practice-pack";
import { ORPCError } from "@orpc/server";
import { type } from "arktype";
import { and, count, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { admin } from "../../index";
import { convertToTiptap } from "../../lib/tiptap";

const list = admin
	.route({
		path: "/admin/practice-packs",
		method: "GET",
		tags: ["Admin - Practice Packs"],
	})
	.input(
		type({
			"limit?": "number",
			"offset?": "number",
			"search?": "string",
		}),
	)
	.handler(async ({ input }) => {
		const limit = input.limit || 20;
		const offset = input.offset || 0;
		const search = input.search || "";

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

		const [totalCount] = search
			? await db
					.select({ count: count() })
					.from(practicePack)
					.where(or(ilike(practicePack.title, `%${search}%`), ilike(practicePack.description, `%${search}%`)))
			: await db.select({ count: count() }).from(practicePack);

		const packs = await filteredQuery.limit(limit).offset(offset).orderBy(practicePack.id);

		return {
			data: packs,
			total: totalCount?.count || 0,
			limit,
			offset,
		};
	});

const get = admin
	.route({
		path: "/admin/practice-packs/{id}",
		method: "GET",
		tags: ["Admin - Practice Packs"],
	})
	.input(type({ id: "number" }))
	.handler(async ({ input }) => {
		const [pack] = await db
			.select({
				id: practicePack.id,
				title: practicePack.title,
				description: practicePack.description,
			})
			.from(practicePack)
			.where(eq(practicePack.id, input.id))
			.limit(1);

		if (!pack)
			throw new ORPCError("NOT_FOUND", {
				message: "Practice pack tidak ditemukan",
			});

		return pack;
	});

const create = admin
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

const update = admin
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

const delete_ = admin
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

const addQuestion = admin
	.route({
		path: "/admin/practice-packs/{practicePackId}/questions",
		method: "POST",
		tags: ["Admin - Practice Pack Questions"],
	})
	.input(
		type({
			practicePackId: "number",
			questionId: "number",
			"order?": "number",
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

		let orderValue = input.order;
		if (orderValue === undefined) {
			const [maxOrder] = await db
				.select({ maxOrder: sql<number>`COALESCE(MAX(${practicePackQuestions.order}), 0)` })
				.from(practicePackQuestions)
				.where(eq(practicePackQuestions.practicePackId, input.practicePackId));
			orderValue = (maxOrder?.maxOrder ?? 0) + 1;
		}

		await db
			.insert(practicePackQuestions)
			.values({
				practicePackId: input.practicePackId,
				questionId: input.questionId,
				order: orderValue,
			})
			.onConflictDoNothing();

		return { message: "Berhasil menambahkan question ke practice pack" };
	});

const removeQuestion = admin
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

const reorderQuestion = admin
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

const getQuestions = admin
	.route({
		path: "/admin/practice-packs/{id}/questions",
		method: "GET",
		tags: ["Admin - Practice Packs"],
	})
	.input(type({ id: "number" }))
	.handler(async ({ input }) => {
		const rows = await db
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
			.where(eq(practicePack.id, input.id));

		if (rows.length === 0) {
			const [pack] = await db.select().from(practicePack).where(eq(practicePack.id, input.id)).limit(1);
			if (!pack) {
				throw new ORPCError("NOT_FOUND", {
					message: "Practice pack not found",
				});
			}
			return { questions: [] };
		}

		const questionMap = new Map<
			number,
			{
				id: number;
				order: number;
				content: unknown;
				discussion: unknown;
				isFlashcard: boolean;
				answers: Array<{ id: number; content: string; code: string; isCorrect: boolean }>;
			}
		>();

		for (const row of rows) {
			if (!questionMap.has(row.questionId)) {
				questionMap.set(row.questionId, {
					id: row.questionId,
					order: row.questionOrder ?? 1,
					content: row.questionContentJson || convertToTiptap(row.questionContent),
					discussion: row.questionDiscussionJson || convertToTiptap(row.questionDiscussion),
					isFlashcard: row.questionIsFlashcard ?? true,
					answers: [],
				});
			}

			questionMap.get(row.questionId)?.answers.push({
				id: row.answerId,
				content: row.answerContent,
				code: row.answerCode,
				isCorrect: row.answerIsCorrect ?? false,
			});
		}

		const questions = Array.from(questionMap.values())
			.map((q) => ({
				...q,
				answers: q.answers.sort((a, b) => a.code.localeCompare(b.code)),
			}))
			.sort((a, b) => {
				if (a.order !== b.order) return a.order - b.order;
				return a.id - b.id;
			});

		return { questions };
	});

const toggleAvailableForFlashcard = admin
	.route({
		path: "/admin/practice-packs/{id}/toggle-available-for-flashcard",
		method: "POST",
		tags: ["Admin - Practice Packs"],
	})
	.input(
		type({
			id: "number",
			isFlashcardQuestion: "boolean",
		}),
	)
	.output(
		type({
			id: "number",
			message: "string",
			updatedCount: "number",
		}),
	)
	.handler(async ({ input, errors }) => {
		const [pack] = await db
			.select({ id: practicePack.id })
			.from(practicePack)
			.where(eq(practicePack.id, input.id))
			.limit(1);

		if (!pack) throw errors.NOT_FOUND({ message: "Practice pack tidak ditemukan" });

		const questionIds = await db
			.select({ questionId: practicePackQuestions.questionId })
			.from(practicePackQuestions)
			.where(eq(practicePackQuestions.practicePackId, input.id));

		if (questionIds.length === 0) {
			return {
				id: input.id,
				message: "Tidak ada pertanyaan di practice pack ini",
				updatedCount: 0,
			};
		}

		const ids = questionIds.map((q) => q.questionId);

		const result = await db
			.update(question)
			.set({ isFlashcardQuestion: input.isFlashcardQuestion })
			.where(inArray(question.id, ids))
			.returning({ id: question.id });

		return {
			id: input.id,
			message: input.isFlashcardQuestion
				? "Berhasil menjadikan semua pertanyaan available di Flashcard!"
				: "Berhasil menjadikan semua pertanyaan tidak available di Flashcard!",
			updatedCount: result.length,
		};
	});

export const adminPracticePackRouter = {
	list,
	get,
	create,
	update,
	delete: delete_,
	addQuestion,
	removeQuestion,
	reorderQuestion,
	getQuestions,
	toggleAvailableForFlashcard,
};
