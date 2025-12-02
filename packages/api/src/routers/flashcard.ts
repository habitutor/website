import { db } from "@habitutor/db";
import { userFlashcard } from "@habitutor/db/schema/flashcard";
import { question } from "@habitutor/db/schema/practice-pack";
import { ORPCError } from "@orpc/client";
import { type } from "arktype";
import { and, eq, gte, inArray, not } from "drizzle-orm";
import { authed } from "..";

// Cutoff in 30 Days
const FLASHCARD_REPEAT_CUTOFF_LIMIT = 30;

const today = authed
	.route({
		path: "/flashcard/today",
		method: "GET",
		tags: ["Flashcard"],
	})
	.handler(async ({ context }) => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		let flashcard = await db.query.userFlashcard.findFirst({
			where: and(
				eq(userFlashcard.userId, context.session.user.id),
				eq(userFlashcard.assignedDate, today),
			),
			with: {
				question: {
					with: {
						answerOptions: true,
					},
				},
			},
		});

		if (!flashcard) {
			const dateBoundary = new Date(
				today.getTime() - FLASHCARD_REPEAT_CUTOFF_LIMIT * 24 * 3600 * 1000,
			);

			const recentlyAssignedSubquery = db
				.select({ id: userFlashcard.questionId })
				.from(userFlashcard)
				.where(
					and(
						eq(userFlashcard.userId, context.session.user.id),
						gte(userFlashcard.assignedDate, dateBoundary),
					),
				)
				.as("recentlyAssigned");

			const availableQuestion = await db.query.question.findFirst({
				where: not(inArray(question.id, recentlyAssignedSubquery)),
				with: {
					answerOptions: true,
				},
			});

			if (!availableQuestion)
				throw new ORPCError("NOT_FOUND", {
					message: "Gagal menemukan flashcard hari ini.",
					cause: "Gagal menemukan pertanyaan yang tersedia.",
				});

			const [createdFlashcard] = await db
				.insert(userFlashcard)
				.values({
					userId: context.session.user.id,
					assignedDate: today,
					questionId: availableQuestion.id,
				})
				.returning();

			if (!createdFlashcard)
				throw new ORPCError("NOT_FOUND", {
					message: "Gagal menemukan flashcard hari ini.",
					cause: "Gagal membuat flashcard baru.",
				});

			flashcard = {
				...createdFlashcard,
				question: availableQuestion,
			};
		}

		return flashcard;
	});

const saveAnswer = authed
	.route({
		path: "/flashcard",
		method: "POST",
		tags: ["Flashcard"],
	})
	.input(type("number"))
	.handler(async ({ context, input }) => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const [flashcard] = await db
			.update(userFlashcard)
			.set({
				selectedAnswerId: input,
				answeredAt: new Date(),
			})
			.where(
				and(
					eq(userFlashcard.userId, context.session.user.id),
					eq(userFlashcard.assignedDate, today),
				),
			)
			.returning();

		if (!flashcard)
			throw new ORPCError("NOT_FOUND", {
				message: "Gagal menemukan flashcard hari ini.",
			});
		return { message: "Berhasil menyimpan jawaban flashcard!" };
	});

export const flashcardRouter = {
	today,
	saveAnswer,
};
