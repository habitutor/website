import { ORPCError } from "@orpc/server";
import { type } from "arktype";
import { admin } from "../../..";
import { convertToTiptap } from "../../../lib/tiptap";
import { adminPracticePackRepo } from "./repo";

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

		const packs = await adminPracticePackRepo.list({ limit, offset, search });
		const total = await adminPracticePackRepo.count({ search });

		return {
			data: packs,
			total,
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
		const pack = await adminPracticePackRepo.getById({ id: input.id });

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
		const pack = await adminPracticePackRepo.create({
			title: input.title,
			description: input.description,
		});

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
		const pack = await adminPracticePackRepo.update({
			id: input.id,
			title: input.title,
			description: input.description,
		});

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
		const pack = await adminPracticePackRepo.delete({ id: input.id });

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
		const pack = await adminPracticePackRepo.getPracticePackById({ id: input.practicePackId });

		if (!pack)
			throw new ORPCError("NOT_FOUND", {
				message: "Practice pack tidak ditemukan",
			});

		const q = await adminPracticePackRepo.getQuestionById({ id: input.questionId });

		if (!q)
			throw new ORPCError("NOT_FOUND", {
				message: "Question tidak ditemukan",
			});

		let orderValue = input.order;
		if (orderValue === undefined) {
			const maxOrder = await adminPracticePackRepo.getMaxQuestionOrder({ practicePackId: input.practicePackId });
			orderValue = maxOrder + 1;
		}

		await adminPracticePackRepo.addQuestion({
			practicePackId: input.practicePackId,
			questionId: input.questionId,
			order: orderValue ?? 1,
		});

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
		await adminPracticePackRepo.removeQuestion({
			practicePackId: input.practicePackId,
			questionId: input.questionId,
		});

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
		await adminPracticePackRepo.updateQuestionOrder({
			practicePackId: input.practicePackId,
			questionId: input.questionId,
			order: input.order,
		});

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
		const rows = await adminPracticePackRepo.getQuestionsForPack({ packId: input.id });

		if (rows.length === 0) {
			const pack = await adminPracticePackRepo.getPracticePackById({ id: input.id });
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
		const pack = await adminPracticePackRepo.getPracticePackById({ id: input.id });

		if (!pack) throw errors.NOT_FOUND({ message: "Practice pack tidak ditemukan" });

		const questionIds = await adminPracticePackRepo.getQuestionIdsForPack({ packId: input.id });

		if (questionIds.length === 0) {
			return {
				id: input.id,
				message: "Tidak ada pertanyaan di practice pack ini",
				updatedCount: 0,
			};
		}

		const ids = questionIds.map((q: { questionId: number }) => q.questionId);

		const result = await adminPracticePackRepo.updateQuestionsFlashcard({
			questionIds: ids,
			isFlashcardQuestion: input.isFlashcardQuestion,
		});

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
