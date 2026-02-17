import { ORPCError } from "@orpc/client";
import { type } from "arktype";
import { authed, authedRateLimited } from "../..";
import { canAccessContent } from "../../lib/content-access";
import { convertToTiptap } from "../../lib/tiptap";
import { subtestRepo } from "./repo";

const listSubtests = authed
	.route({
		path: "/subtests",
		method: "GET",
		tags: ["Content"],
	})
	.input(
		type({
			limit: "number = 50",
			offset: "number = 0",
		}),
	)
	.handler(async ({ input }) => {
		const subtests = await subtestRepo.listSubtests({
			limit: input.limit,
			offset: input.offset,
		});

		return {
			data: subtests,
			limit: input.limit,
			offset: input.offset,
		};
	});

const listContentByCategory = authedRateLimited
	.route({
		path: "/subtests/{subtestId}/content",
		method: "GET",
		tags: ["Content"],
	})
	.input(
		type({
			subtestId: "number",
			category: type("'material' | 'tips_and_trick'").optional(),
			search: type("string").optional(),
			limit: type("number >= 1").optional(),
			offset: type("number >= 0").optional(),
		}),
	)
	.handler(async ({ input, context }) => {
		const targetSubtest = await subtestRepo.getSubtestOrder({ subtestId: input.subtestId });

		if (!targetSubtest) {
			throw new ORPCError("NOT_FOUND", { message: "Subtest tidak ditemukan" });
		}

		return subtestRepo.listContentByCategory({
			subtestId: input.subtestId,
			category: input.category,
			search: input.search,
			limit: input.limit ?? 20,
			offset: input.offset ?? 0,
			userId: context.session.user.id,
		});
	});

const getContentById = authedRateLimited
	.route({
		path: "/content/{contentId}",
		method: "GET",
		tags: ["Content"],
	})
	.input(
		type({
			contentId: "number",
		}),
	)
	.handler(async ({ input, context }) => {
		const row = await subtestRepo.getContentWithMaterials({ contentId: input.contentId });

		if (!row) {
			throw new ORPCError("NOT_FOUND", { message: "Konten tidak ditemukan" });
		}

		const hasAccess = canAccessContent(
			context.session.user.isPremium,
			context.session.user.role,
			row.subtestOrder,
			row.order,
		);

		if (!hasAccess) {
			throw new ORPCError("FORBIDDEN", { message: "Konten ini memerlukan akun premium" });
		}

		const practiceQuestionsRows = await subtestRepo.getPracticeQuestionsForContent({
			contentId: input.contentId,
		});

		const questionMap = new Map<
			number,
			{
				questionId: number;
				order: number;
				question: string;
				discussion: string;
				answers: Array<{
					id: number;
					content: string;
					code: string;
					isCorrect: boolean;
				}>;
			}
		>();

		for (const row of practiceQuestionsRows) {
			if (!questionMap.has(row.questionId)) {
				questionMap.set(row.questionId, {
					questionId: row.questionId,
					order: row.order,
					question: row.questionContentJson || convertToTiptap(row.questionContent),
					discussion: row.questionDiscussionJson || convertToTiptap(row.questionDiscussion),
					answers: [],
				});
			}
			questionMap.get(row.questionId)?.answers.push({
				id: row.answerId,
				content: row.answerContent,
				code: row.answerCode,
				isCorrect: row.answerIsCorrect,
			});
		}

		const questions = Array.from(questionMap.values())
			.map((q) => ({
				...q,
				answers: q.answers.sort((a, b) => a.code.localeCompare(b.code)),
			}))
			.sort((a, b) => a.order - b.order);

		return {
			id: row.id,
			title: row.title,
			type: row.type,
			subtestId: row.subtestId,
			video: row.videoId
				? {
						id: row.videoId,
						videoUrl: row.videoUrl,
						content: row.videoContent,
					}
				: null,
			note: row.noteId
				? {
						id: row.noteId,
						content: row.noteContent,
					}
				: null,
			practiceQuestions:
				questions.length > 0
					? {
							questions,
						}
					: null,
		};
	});

const trackView = authed
	.route({
		path: "/content/{id}/view",
		method: "POST",
		tags: ["Content"],
	})
	.input(type({ id: "number" }))
	.output(type({ message: "string" }))
	.handler(async ({ input, context }) => {
		const item = await subtestRepo.getContentById({ contentId: input.id });

		if (!item)
			throw new ORPCError("NOT_FOUND", {
				message: "Konten tidak ditemukan",
			});

		await subtestRepo.recordContentView({ userId: context.session.user.id, contentItemId: input.id });

		return { message: "Berhasil mencatat aktivitas" };
	});

const getRecentViews = authedRateLimited
	.route({
		path: "/content/recent",
		method: "GET",
		tags: ["Content"],
	})
	.handler(async ({ context }) => {
		return subtestRepo.getRecentContentViews({ userId: context.session.user.id });
	});

const updateProgress = authed
	.route({
		path: "/content/{id}/progress",
		method: "PATCH",
		tags: ["Content"],
	})
	.input(
		type({
			id: "number",
			videoCompleted: "boolean?",
			noteCompleted: "boolean?",
			practiceQuestionsCompleted: "boolean?",
		}),
	)
	.output(type({ message: "string" }))
	.handler(async ({ input, context }) => {
		const item = await subtestRepo.getContentById({ contentId: input.id });

		if (!item)
			throw new ORPCError("NOT_FOUND", {
				message: "Konten tidak ditemukan",
			});

		await subtestRepo.upsertUserProgress({
			userId: context.session.user.id,
			contentItemId: input.id,
			videoCompleted: input.videoCompleted,
			noteCompleted: input.noteCompleted,
			practiceQuestionsCompleted: input.practiceQuestionsCompleted,
		});

		return { message: "Progress berhasil disimpan" };
	});

const getProgressStats = authed
	.route({
		path: "/content/progress/stats",
		method: "GET",
		tags: ["Content"],
	})
	.handler(async ({ context }) => {
		const stats = await subtestRepo.getProgressStats({ userId: context.session.user.id });

		return {
			materialsCompleted: Number(stats?.materialsCompleted ?? 0),
		};
	});

export const subtestRouter = {
	listSubtests,
	listContentByCategory,
	getContentById,
	trackView,
	getRecentViews,
	updateProgress,
	getProgressStats,
};
