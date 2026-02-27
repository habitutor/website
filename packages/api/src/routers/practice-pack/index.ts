import { ORPCError } from "@orpc/client";
import { type } from "arktype";
import { authed } from "../..";
import { convertToTiptap } from "../../lib/tiptap";
import type { Question } from "../../types/practice-pack";
import { buildHistoryQuestionMap, buildQuestionMap, practicePackRepo } from "./repo";

const list = authed
	.route({
		path: "/practice-packs",
		method: "GET",
		tags: ["Practice Packs"],
	})
	.handler(async ({ context }) => {
		const attempts = await practicePackRepo.listWithAttempts({ userId: context.session.user.id });

		if (!attempts)
			throw new ORPCError("NOT_FOUND", {
				message: "Gagal menemukan latihan soal",
			});

		return attempts;
	});

const find = authed
	.route({
		path: "/practice-packs/{id}",
		method: "GET",
		tags: ["Practice Packs"],
	})
	.input(type({ id: "number" }))
	.handler(async ({ input, context }) => {
		const rows = await practicePackRepo.findWithQuestions({ packId: input.id, userId: context.session.user.id });

		if (rows.length === 0 || !rows[0])
			throw new ORPCError("NOT_FOUND", {
				message: "Gagal menemukan latihan soal",
			});

		const pack = {
			attemptId: rows[0].attemptId,
			title: rows[0].title,
			status: rows[0].status,
			startedAt: rows[0].startedAt,
			completedAt: rows[0].completedAt,
			questions: [] as Question[],
		};

		const questionMap = buildQuestionMap(
			rows.map(
				(row: {
					questionId: number;
					questionOrder: number | null;
					questionContent: string;
					questionContentJson: unknown;
					questionDiscussion: string;
					questionDiscussionJson: unknown;
					answerId: number;
					answerContent: string;
					userSelectedAnswerId: number | null;
				}) => ({
					questionId: row.questionId,
					questionOrder: row.questionOrder,
					questionContent: row.questionContent,
					questionContentJson: row.questionContentJson,
					questionDiscussion: row.questionDiscussion,
					questionDiscussionJson: row.questionDiscussionJson,
					answerId: row.answerId,
					answerContent: row.answerContent,
					selectedAnswerId: row.userSelectedAnswerId,
				}),
			),
		);

		for (const [id, q] of questionMap) {
			questionMap.set(id, {
				...q,
				content:
					q.content ||
					convertToTiptap(
						rows.find((r: { questionId: number; questionContent: string }) => r.questionId === id)?.questionContent ||
							"",
					),
				discussion:
					q.discussion ||
					convertToTiptap(
						rows.find((r: { questionId: number; questionDiscussion: string }) => r.questionId === id)
							?.questionDiscussion || "",
					),
			});
		}

		pack.questions = Array.from(questionMap.values()).sort((a, b) => a.order - b.order);

		return pack;
	});

const startAttempt = authed
	.route({
		path: "/practice-packs/{id}/start",
		method: "POST",
		tags: ["Practice Packs"],
	})
	.input(type({ id: "number" }))
	.output(type({ message: "string", attemptId: "number" }))
	.handler(async ({ input, context }) => {
		const attempt = await practicePackRepo.createAttempt({ packId: input.id, userId: context.session.user.id });

		if (!attempt)
			throw new ORPCError("NOT_FOUND", {
				message: "Gagal menemukan sesi pengerjaan latihan soal",
			});

		return {
			message: "Memulai latihan soal",
			attemptId: attempt.id,
		};
	});

const saveAnswer = authed
	.route({
		path: "/practice-packs/{id}/{questionId}/save",
		method: "POST",
		tags: ["Practice Packs"],
	})
	.input(
		type({
			id: "number",
			questionId: "number",
			selectedAnswerId: "number",
		}),
	)
	.output(
		type({
			message: "string",
		}),
	)
	.handler(async ({ input, context }) => {
		const currentAttempt = await practicePackRepo.getAttempt({
			packId: input.id,
			userId: context.session.user.id,
		});

		if (!currentAttempt)
			throw new ORPCError("NOT_FOUND", {
				message: "Gagal menemukan sesi pengerjaan latihan soal",
			});

		if (currentAttempt.userId !== context.session.user.id)
			throw new ORPCError("UNAUTHORIZED", {
				message: "Sesi pengerjaan latihan soal ini bukan milikmu",
			});

		if (currentAttempt.status !== "ongoing")
			throw new ORPCError("UNPROCESSABLE_CONTENT", {
				message: "Tidak bisa menyimpan jawaban pada latihan soal yang tidak sedang berlangsung",
			});

		await practicePackRepo.saveAnswer({
			attemptId: currentAttempt.id,
			questionId: input.questionId,
			selectedAnswerId: input.selectedAnswerId,
		});

		return { message: "Berhasil menyimpan jawaban!" };
	});

const submitAttempt = authed
	.route({
		path: "/practice-packs/{id}/submit",
		method: "POST",
		tags: ["Practice Packs"],
	})
	.input(
		type({
			id: "number",
		}),
	)
	.output(type({ message: "string" }))
	.handler(async ({ context, input }) => {
		const attempt = await practicePackRepo.submitAttempt({ packId: input.id, userId: context.session.user.id });

		if (!attempt)
			throw new ORPCError("NOT_FOUND", {
				message: "Gagal menemukan sesi latihan soal",
			});

		return {
			message: "Berhasil mengumpul latihan soal",
		};
	});

const history = authed
	.route({
		path: "/practice-packs/history",
		method: "GET",
		tags: ["Practice Packs"],
	})
	.input(
		type({
			"limit?": "number",
			"offset?": "number",
		}),
	)
	.handler(async ({ context, input }) => {
		const limit = Math.min(input.limit ?? 20, 100);
		const offset = input.offset ?? 0;

		const total = await practicePackRepo.countAttempts({ userId: context.session.user.id });

		const attempts = await practicePackRepo.getHistory({
			userId: context.session.user.id,
			limit,
			offset,
		});

		return {
			packsFinished: attempts.filter((pack) => pack.status === "finished").length,
			data: attempts,
			pagination: {
				limit,
				offset,
				total,
			},
		};
	});

const historyByPack = authed
	.route({
		path: "/practice-packs/{id}/history",
		method: "GET",
		tags: ["Practice Packs"],
	})
	.input(
		type({
			id: "number",
		}),
	)
	.handler(async ({ input, context }) => {
		const rows = await practicePackRepo.findHistoryByPack({ packId: input.id, userId: context.session.user.id });

		if (rows.length === 0 || !rows[0])
			throw new ORPCError("NOT_FOUND", {
				message: "Gagal menemukan latihan soal",
			});

		const pack = {
			attemptId: rows[0].attemptId,
			title: rows[0].title,
			startedAt: rows[0].startedAt,
			completedAt: rows[0].completedAt,
			questions: [] as (Question & { userAnswerIsCorrect: boolean })[],
		};

		const questionMap = buildHistoryQuestionMap(
			rows.map(
				(row: {
					questionId: number;
					questionOrder: number | null;
					questionContent: string;
					questionContentJson: unknown;
					questionDiscussion: string;
					questionDiscussionJson: unknown;
					answerId: number;
					answerContent: string;
					answerIsCorrect: boolean | null;
					userSelectedAnswerId: number | null;
				}) => ({
					questionId: row.questionId,
					questionOrder: row.questionOrder,
					questionContent: row.questionContent,
					questionContentJson: row.questionContentJson,
					questionDiscussion: row.questionDiscussion,
					questionDiscussionJson: row.questionDiscussionJson,
					answerId: row.answerId,
					answerContent: row.answerContent,
					answerIsCorrect: row.answerIsCorrect,
					selectedAnswerId: row.userSelectedAnswerId,
				}),
			),
		);

		for (const [id, q] of questionMap) {
			questionMap.set(id, {
				...q,
				content:
					q.content ||
					convertToTiptap(
						rows.find((r: { questionId: number; questionContent: string }) => r.questionId === id)?.questionContent ||
							"",
					),
				discussion:
					q.discussion ||
					convertToTiptap(
						rows.find((r: { questionId: number; questionDiscussion: string }) => r.questionId === id)
							?.questionDiscussion || "",
					),
			});
		}

		pack.questions = Array.from(questionMap.values()).sort((a, b) => a.order - b.order);

		return pack;
	});

export const practicePackRouter = {
	list,
	find,
	startAttempt,
	submitAttempt,
	saveAnswer,
	history,
	historyByPack,
};
