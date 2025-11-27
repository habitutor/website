import { db } from "@habitutor/db";
import { userFlashcard } from "@habitutor/db/schema/flashcard";
import { ORPCError } from "@orpc/client";
import { type } from "arktype";
import { and, eq, gte } from "drizzle-orm";
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
        Date.now() - FLASHCARD_REPEAT_CUTOFF_LIMIT * 24 * 3600 * 1000,
      );

      const availableQuestion = await db.query.question.findFirst({
        where: and(
          eq(userFlashcard.userId, context.session.user.id),
          gte(userFlashcard.assignedDate, dateBoundary),
        ),
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

    if (!flashcard)
      throw new ORPCError("NOT_FOUND", {
        message: "Gagal menemukan flashcard hari ini.",
      });

    return flashcard;
  });

const saveAnswer = authed
  .input(type("number"))
  .handler(async ({ context, input }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await db
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
      );
  });

export const flashcardRouter = {
  today,
  saveAnswer,
};
