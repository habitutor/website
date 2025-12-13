import { db } from "@habitutor/db";
import { user } from "@habitutor/db/schema/auth";
import {
  userFlashcardAttempt,
  userFlashcardQuestionAnswer,
} from "@habitutor/db/schema/flashcard";
import { question } from "@habitutor/db/schema/practice-pack";
import { ORPCError } from "@orpc/client";
import { type } from "arktype";
import { and, desc, eq, gte, inArray, not, sql } from "drizzle-orm";
import { authed } from "..";

// Cutoff in 30 Days
const FLASHCARD_REPEAT_CUTOFF_LIMIT = 30;
// Grace period to allow submitting after deadline
const GRACE_PERIOD_SECONDS = 5;

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
                id: true,
                content: true,
              },
              with: {
                answerOptions: {
                  columns: {
                    id: true,
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
    type(
      {
        questionId: "number",
        answerId: "number",
      },
      "[]",
    ),
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
        message: "Kamu belum memulai sesi flashcard hari ini.",
      });
    }

    // Grace period for submitting
    if (
      new Date(Date.now() + GRACE_PERIOD_SECONDS * 1000) >
      latestAttempt.deadline
    ) {
      throw new ORPCError("UNPROCESSABLE_CONTENT", {
        message: "Waktu sesi flashcard telah berakhir.",
      });
    }

    try {
      await db.transaction(async (tx) => {
        await Promise.all(
          input.map((answer) =>
            tx
              .update(userFlashcardQuestionAnswer)
              .set({
                selectedAnswerId: answer.answerId,
                answeredAt: new Date(),
              })
              .where(
                and(
                  eq(userFlashcardQuestionAnswer.attemptId, latestAttempt.id),
                  eq(userFlashcardQuestionAnswer.assignedDate, today),
                  eq(userFlashcardQuestionAnswer.questionId, answer.questionId),
                ),
              ),
          ),
        );

        await tx
          .update(userFlashcardAttempt)
          .set({
            submittedAt: new Date(),
          })
          .where(eq(userFlashcardAttempt.id, latestAttempt.id));

        await tx
          .update(user)
          .set({
            flashcardStreak: sql`${user.flashcardStreak} + 1`,
          })
          .where(eq(user.id, context.session.user.id));
      });
    } catch (err) {
      console.error(err);
      throw new ORPCError("INTERNAL_SERVER_ERROR");
    }

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
      lastCompletedDate: "Date | null",
    }),
  )
  .handler(async ({ context }) => {
    const [streak] = await db
      .select({
        streak: user.flashcardStreak,
        lastCompletedDate: user.lastCompletedFlashcardAt,
      })
      .from(user)
      .where(eq(user.id, context.session.user.id))
      .limit(1);

    if (!streak) throw new ORPCError("NOT_FOUND");

    return streak;
  });

export const flashcardRouter = {
  start,
  get,
  submit,
  streak,
};
