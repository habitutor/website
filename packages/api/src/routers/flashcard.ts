import { db } from "@habitutor/db";
import {
  userFlashcard,
  userFlashcardStreak,
} from "@habitutor/db/schema/flashcard";
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

    const flashcards = await db.query.userFlashcard.findMany({
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

    const needed = 5 - flashcards.length;

    if (needed > 0) {
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

      const availableQuestions = await db.query.question.findMany({
        where: not(inArray(question.id, recentlyAssignedSubquery)),
        with: {
          answerOptions: true,
        },
        limit: needed,
      });

      if (availableQuestions.length === 0 && flashcards.length === 0) {
        console.error("No available questions for flashcards today.");
        throw new ORPCError("NOT_FOUND", {
          message: "Gagal menemukan flashcard hari ini.",
          cause: "Gagal menemukan pertanyaan yang tersedia.",
        });
      }

      if (availableQuestions.length > 0) {
        const newFlashcards = await db
          .insert(userFlashcard)
          .values(
            availableQuestions.map((q) => ({
              userId: context.session.user.id,
              assignedDate: today,
              questionId: q.id,
            })),
          )
          .returning();

        flashcards.push(
          ...newFlashcards.map((f) => ({
            ...f,
            question: availableQuestions.find(
              (question) => question.id === f.questionId,
            )!,
          })),
        );
      }
    }

    return flashcards;
  });

const saveAnswer = authed
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
  .handler(async ({ context, input }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [flashcard] = await db
      .update(userFlashcard)
      .set({
        selectedAnswerId: input.answerId,
        answeredAt: new Date(),
      })
      .where(
        and(
          eq(userFlashcard.userId, context.session.user.id),
          eq(userFlashcard.assignedDate, today),
          eq(userFlashcard.questionId, input.questionId),
        ),
      )
      .returning();

    if (!flashcard)
      throw new ORPCError("NOT_FOUND", {
        message: "Gagal menemukan flashcard hari ini.",
      });
    return { message: "Berhasil menyimpan jawaban flashcard!" };
  });

const streak = authed
  .route({
    path: "/flashcard/streak",
    method: "GET",
    tags: ["Flashcard"],
  })
  .output(
    type({
      streak: "number",
      lastCompletedDate: "string | null",
    }),
  )
  .handler(async ({ context }) => {
    const [flashcard] = await db
      .select({
        streak: userFlashcardStreak.currentStreak,
        lastCompletedDate: userFlashcardStreak.lastCompletedDate,
      })
      .from(userFlashcardStreak)
      .where(eq(userFlashcardStreak.userId, context.session.user.id))
      .limit(1);

    if (!flashcard)
      return {
        streak: 0,
        lastCompletedDate: null,
      };

    return flashcard;
  });

export const flashcardRouter = {
  today,
  saveAnswer,
  streak,
};

