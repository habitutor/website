import { db } from "@habitutor/db";
import { user } from "@habitutor/db/schema/auth";
import { type } from "arktype";
import { eq, sql } from "drizzle-orm";
import { authed, premium } from "../..";
import { convertToTiptap } from "../../lib/tiptap";
import { getStartOfDay } from "../../utils/date";
import { flashcardRepo } from "./repo";

const FLASHCARD_SESSION_DURATION_MINUTES = 10;
const GRACE_PERIOD_SECONDS = 5;

const start = authed
	.route({
		path: "/flashcard/start",
		method: "POST",
		tags: ["Flashcard"],
	})
	.handler(async ({ context, errors }) => {
		const deadline = new Date(Date.now() + FLASHCARD_SESSION_DURATION_MINUTES * 60_000);
		const today = getStartOfDay();
		const isPremium = context.session.user.isPremium;

		return db.transaction(async (tx) => {
			const latestAttempt = await flashcardRepo.getLatestAttempt({ db: tx, userId: context.session.user.id });

			if (latestAttempt && !isPremium && latestAttempt.startedAt.getTime() >= today.getTime())
				throw errors.UNPROCESSABLE_CONTENT({
					message: "Kamu sudah memulai sesi flashcard hari ini.",
				});

			if (
				latestAttempt &&
				isPremium &&
				!latestAttempt.submittedAt &&
				latestAttempt.startedAt.getTime() >= today.getTime()
			)
				throw errors.UNPROCESSABLE_CONTENT({
					message: "Mohon selesaikan sesi flashcard yang ada terlebih dahulu.",
				});

			const attempt = await flashcardRepo.createAttempt({ db: tx, userId: context.session.user.id, deadline });

			if (!attempt)
				throw errors.INTERNAL_SERVER_ERROR({
					message: "Gagal membuat sesi flashcard.",
				});

			const randomQuestionIds = await flashcardRepo.getRandomFlashcardQuestionIds({ db: tx });

			if (randomQuestionIds.length < 5)
				throw errors.NOT_FOUND({
					message: "Belum cukup soal flashcard tersedia. Silahkan coba lagi nanti.",
				});

			const availableQuestions = await flashcardRepo.getQuestionsByIds({
				db: tx,
				ids: randomQuestionIds.map((q) => q.id),
			});

			await flashcardRepo.insertQuestionAnswers({
				db: tx,
				answers: availableQuestions.map((q: { id: number }) => ({
					attemptId: attempt.id,
					assignedDate: today,
					questionId: q.id,
				})),
			});

			return "Sukses memulai sesi flashcard!";
		});
	});

const get = authed
	.route({
		path: "/flashcard",
		method: "GET",
		tags: ["Flashcard"],
	})
	.handler(async ({ context }) => {
		let status: "not_started" | "ongoing" | "submitted" = "not_started";

		const attempt = await flashcardRepo.getLatestAttempt({ userId: context.session.user.id });

		if (!attempt) return { status };

		const assignedQuestionsRaw = await flashcardRepo.getUnansweredQuestions({ attemptId: attempt.id });

		const assignedQuestions = assignedQuestionsRaw.map((aq) => ({
			...aq,
			question: {
				...aq.question,
				content: aq.question.contentJson || convertToTiptap(aq.question.content),
				answerOptions: aq.question.answerOptions.map((ao) => ({
					...ao,
					content: convertToTiptap(ao.content),
				})),
			},
		}));

		status = attempt.submittedAt ? "submitted" : "ongoing";

		return {
			...attempt,
			assignedQuestions,
			status,
		};
	});

const submit = authed
	.route({
		path: "/flashcard/submit",
		method: "POST",
		tags: ["Flashcard"],
	})
	.handler(async ({ context, errors }) => {
		const today = getStartOfDay();
		const hasDoneToday =
			context.session.user.lastCompletedFlashcardAt &&
			context.session.user.lastCompletedFlashcardAt.getTime() >= today.getTime();

		const latestAttempt = await flashcardRepo.getLatestAttemptForToday({
			userId: context.session.user.id,
			today,
		});

		if (!latestAttempt) {
			throw errors.NOT_FOUND({
				message: "Kamu belum memulai sesi flashcard hari ini.",
			});
		}

		if (latestAttempt.submittedAt) {
			throw errors.UNPROCESSABLE_CONTENT({
				message: "Kamu sudah mengerjakan flashcard terbaru yang tersedia.",
			});
		}

		if (Date.now() > latestAttempt.deadline.getTime() + GRACE_PERIOD_SECONDS * 1000) {
			throw errors.UNPROCESSABLE_CONTENT({
				message: "Waktu sesi flashcard telah berakhir.",
			});
		}

		await db.transaction(async (tx) => {
			await flashcardRepo.markAttemptSubmitted({ db: tx, attemptId: latestAttempt.id });
			if (!hasDoneToday)
				await tx
					.update(user)
					.set({ flashcardStreak: sql`${user.flashcardStreak} + 1`, lastCompletedFlashcardAt: new Date() })
					.where(eq(user.id, context.session.user.id));
		});

		return { message: "Berhasil mengerjakan flashcard hari ini!" };
	});

const save = authed
	.route({
		path: "/flashcard",
		method: "POST",
		tags: ["Flashcard"],
	})
	.input(
		type({
			questionId: "number",
			answerId: "number",
		}),
	)
	.output(
		type({
			isCorrect: "boolean",
			correctAnswerId: "number",
			userAnswerId: "number",
		}),
	)
	.handler(async ({ input, context, errors }) => {
		const today = getStartOfDay();

		const attempt = await flashcardRepo.getAttemptForQuestion({
			userId: context.session.user.id,
			questionId: input.questionId,
			today,
		});

		if (!attempt) throw errors.NOT_FOUND();

		if (Date.now() > attempt.deadline.getTime() + GRACE_PERIOD_SECONDS * 1000) {
			throw errors.UNPROCESSABLE_CONTENT({
				message: "Waktu sesi flashcard telah berakhir.",
			});
		}

		const answers = await flashcardRepo.getAnswersForQuestion({ questionId: input.questionId });

		if (!answers || answers.length === 0) {
			throw errors.NOT_FOUND();
		}
		const correctAnswer = answers.find((answer: { id: number; isCorrect: boolean }) => answer.isCorrect);
		const userAnswer = answers.find((answer: { id: number; isCorrect: boolean }) => answer.id === input.answerId);
		if (!correctAnswer || !userAnswer) throw errors.NOT_FOUND();

		await flashcardRepo.updateQuestionAnswer({
			questionId: input.questionId,
			attemptId: attempt.id,
			selectedAnswerId: input.answerId,
			today,
		});

		return {
			isCorrect: userAnswer.isCorrect,
			correctAnswerId: correctAnswer.id,
			userAnswerId: userAnswer.id,
		};
	});

const result = authed
	.route({
		path: "/flashcard/result",
		method: "GET",
		tags: ["Flashcard"],
	})
	.input(
		type({
			"id?": "number",
		}),
	)
	.handler(async ({ context, errors, input }) => {
		const attempt = await flashcardRepo.getAttemptWithOptionalId({
			userId: context.session.user.id,
			attemptId: input.id,
		});

		if (!attempt)
			throw errors.NOT_FOUND({
				message: "Anda belom mengerjakan flashcard hari ini.",
			});

		const assignedQuestions = await flashcardRepo.getAttemptQuestionAnswers({ attemptId: attempt.id });

		const formattedQuestions = assignedQuestions.map((aq) => ({
			...aq,
			question: {
				...aq.question,
				content: aq.question.contentJson || convertToTiptap(aq.question.content),
				discussion: aq.question.discussionJson || convertToTiptap(aq.question.discussion),
				answerOptions: aq.question.answerOptions.map((ao) => ({
					...ao,
					content: convertToTiptap(ao.content),
				})),
			},
		}));

		let correct = 0;
		for (const assignedQuestion of formattedQuestions) {
			const answerMap = new Map<number, boolean>();
			for (const answerOption of assignedQuestion.question.answerOptions) {
				answerMap.set(answerOption.id, answerOption.isCorrect);
			}

			if (answerMap.get(assignedQuestion.selectedAnswerId || 0)) correct++;
		}

		return {
			...attempt,
			assignedQuestions: formattedQuestions,
			correctAnswersCount: correct,
			questionsCount: formattedQuestions.length,
		};
	});

const history = premium
	.route({
		path: "/flashcard/history",
		method: "GET",
		tags: ["Flashcard"],
	})
	.handler(async ({ context }) => {
		return flashcardRepo.getUserHistory({ userId: context.session.user.id });
	});

export const flashcardRouter = {
	start,
	get,
	submit,
	save,
	result,
	history,
};
