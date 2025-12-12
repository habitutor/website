import { db } from "@habitutor/db";
import {
  userFlashcardAttempt,
  userFlashcardQuestionAnswer,
  userFlashcardStreak,
} from "@habitutor/db/schema/flashcard";
import { question } from "@habitutor/db/schema/practice-pack";
import { ORPCError } from "@orpc/client";
import { type } from "arktype";
import { and, desc, eq, gte, inArray, not } from "drizzle-orm";
import { authed } from "..";

// Cutoff in 30 Days
const FLASHCARD_REPEAT_CUTOFF_LIMIT = 30;

const start = authed
  .route({
    path: "/flashcard/start",
    method: "POST",
    tags: ["Flashcard"],
  })
  .handler(async ({ context }) => {
    const deadline = new Date(Date.now() + 10 * 60_000);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      const [attempt] = await db
        .insert(userFlashcardAttempt)
        .values({
          userId: context.session.user.id,
          startedAt: new Date(),
          deadline: deadline,
        })
        .returning();

      if (!attempt) throw new ORPCError("NOT_FOUND");

      const dateBoundary = new Date(
        today.getTime() - FLASHCARD_REPEAT_CUTOFF_LIMIT * 24 * 3600 * 1000,
      );

      const recentlyAssignedSubquery = db
        .select({ id: userFlashcardQuestionAnswer.questionId })
        .from(userFlashcardQuestionAnswer)
        .innerJoin(
          userFlashcardAttempt,
          eq(userFlashcardQuestionAnswer.attemptId, userFlashcardAttempt.id),
        )
        .where(
          and(
            eq(userFlashcardAttempt.userId, context.session.user.id),
            gte(userFlashcardQuestionAnswer.assignedDate, dateBoundary),
          ),
        );

      const availableQuestions = await db.query.question.findMany({
        where: not(inArray(question.id, recentlyAssignedSubquery)),
        with: {
          answerOptions: true,
        },
        limit: 5,
      });

      if (availableQuestions.length > 0) {
        await db
          .insert(userFlashcardQuestionAnswer)
          .values(
            availableQuestions.map((q) => ({
              attemptId: attempt?.id,
              assignedDate: today,
              questionId: q.id,
            })),
          )
          .returning();
      }
    } catch (err) {
      console.error(err);
      throw new ORPCError("INTERNAL_SERVER_ERROR");
    }

    return "Sukses memulai sesi flashcard!";
  });

const get = authed
  .route({
    path: "/flashcard",
    method: "GET",
    tags: ["Flashcard"],
  })
  .handler(async ({ context }) => {
    const today = new Date().setHours(0, 0, 0, 0);

    const attempt = await db.query.userFlashcardAttempt.findFirst({
      where: eq(userFlashcardAttempt.userId, context.session.user.id),
      with: {
        assignedQuestions: {
          where: eq(userFlashcardQuestionAnswer.assignedDate, new Date(today)),
          columns: {
            selectedAnswerId: true,
          },
          with: {
            question: {
              columns: {
                content: true,
              },
              with: {
                answerOptions: {
                  columns: {
                    content: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!attempt)
      throw new ORPCError("NOT_FOUND", {
        message: "Sesi flashcard tidak ditemukan.",
      });

    return attempt;
  });

const submit = authed
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

    const [latestAttempt] = await db
      .select()
      .from(userFlashcardAttempt)
      .where(
        and(
          eq(userFlashcardAttempt.userId, context.session.user.id),
          gte(userFlashcardAttempt.startedAt, today),
        ),
      )
      .orderBy(desc(userFlashcardAttempt.startedAt))
      .limit(1);

    if (!latestAttempt) {
      throw new ORPCError("NOT_FOUND", {
        message: "Gagal menemukan sesi flashcard hari ini.",
      });
    }

    const [flashcard] = await db
      .update(userFlashcardQuestionAnswer)
      .set({
        selectedAnswerId: input.answerId,
        answeredAt: new Date(),
      })
      .where(
        and(
          eq(userFlashcardQuestionAnswer.attemptId, latestAttempt.id),
          eq(userFlashcardQuestionAnswer.assignedDate, today),
          eq(userFlashcardQuestionAnswer.questionId, input.questionId),
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
  start,
  get,
  submit,
  streak,
};
