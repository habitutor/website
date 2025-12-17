import { db } from "@habitutor/db";
import { user } from "@habitutor/db/schema/auth";
import { userFlashcardAttempt, userFlashcardQuestionAnswer } from "@habitutor/db/schema/flashcard";
import { question, questionAnswerOption } from "@habitutor/db/schema/practice-pack";
import { ORPCError } from "@orpc/client";
import { type } from "arktype";
import { and, desc, eq, gte, inArray, not, sql } from "drizzle-orm";
import { authed } from "..";

// Cutoff in 30 Days
const FLASHCARD_REPEAT_CUTOFF_LIMIT = 30;
const FLASHCARD_SESSION_DURATION_MINUTES = 10;
// Grace period to allow submitting after deadline
const GRACE_PERIOD_SECONDS = 5;

const start = authed
  .route({
    path: "/flashcard/start",
    method: "POST",
    tags: ["Flashcard"],
  })
  .handler(async ({ context, errors }) => {
    const deadline = new Date(Date.now() + FLASHCARD_SESSION_DURATION_MINUTES * 60_000);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateBoundary = new Date(today.getTime() - FLASHCARD_REPEAT_CUTOFF_LIMIT * 24 * 3600 * 1000);

    await db.transaction(async (tx) => {
      const [attempt] = await tx
        .insert(userFlashcardAttempt)
        .values({
          userId: context.session.user.id,
          startedAt: new Date(),
          deadline: deadline,
        })
        .onConflictDoNothing()
        .returning();

      if (!attempt || Date.now() > new Date(attempt?.deadline).getTime() || attempt?.submittedAt)
        throw new ORPCError("UNPROCESSABLE_CONTENT", {
          message: "Kamu sudah memulai sesi flashcard hari ini.",
        });

      const recentlyAssignedSubquery = tx
        .select({ id: userFlashcardQuestionAnswer.questionId })
        .from(userFlashcardQuestionAnswer)
        .innerJoin(userFlashcardAttempt, eq(userFlashcardQuestionAnswer.attemptId, userFlashcardAttempt.id))
        .where(
          and(
            eq(userFlashcardAttempt.userId, context.session.user.id),
            gte(userFlashcardQuestionAnswer.assignedDate, dateBoundary),
          ),
        );

      const availableQuestions = await tx.query.question.findMany({
        where: not(inArray(question.id, recentlyAssignedSubquery)),
        with: {
          answerOptions: true,
        },
        orderBy: sql`RANDOM()`,
        limit: 5,
      });

      if (availableQuestions.length < 5)
        throw errors.NOT_FOUND({
          message: "Kamu sudah mengerjakan semua flashcard yang tersedia untuk bulan ini.",
        });

      await tx.insert(userFlashcardQuestionAnswer).values(
        availableQuestions.map((q) => ({
          attemptId: attempt?.id,
          assignedDate: today,
          questionId: q.id,
        })),
      );
    });

    return "Sukses memulai sesi flashcard!";
  });

const get = authed
  .route({
    path: "/flashcard",
    method: "GET",
    tags: ["Flashcard"],
  })
  .handler(async ({ context }) => {
    let status: "not_started" | "ongoing" | "submitted" = "not_started";

    const attempt = await db.query.userFlashcardAttempt.findFirst({
      where: and(eq(userFlashcardAttempt.date, new Date()), eq(userFlashcardAttempt.userId, context.session.user.id)),
      with: {
        assignedQuestions: {
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
                    code: true,
                  },
                  orderBy: (answers, { asc }) => [asc(answers.code)],
                },
              },
            },
          },
        },
      },
    });

    if (!attempt || attempt.assignedQuestions.length === 0) return { status };

    status = attempt.submittedAt ? "submitted" : "ongoing";
    return {
      ...attempt,
      status,
    };
  });

const submit = authed
  .route({
    path: "/flashcard",
    method: "POST",
    tags: ["Flashcard"],
  })
  .handler(async ({ context, errors }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [latestAttempt] = await db
      .select()
      .from(userFlashcardAttempt)
      .where(and(eq(userFlashcardAttempt.userId, context.session.user.id), gte(userFlashcardAttempt.startedAt, today)))
      .orderBy(desc(userFlashcardAttempt.startedAt))
      .limit(1);

    if (latestAttempt?.submittedAt)
      throw new ORPCError("UNPROCESSABLE_CONTENT", {
        message: "Kamu sudah mengerjakan flashcard hari ini.",
      });
    if (!latestAttempt) {
      throw errors.NOT_FOUND({
        message: "Kamu belum memulai sesi flashcard hari ini.",
      });
    }

    // Grace period for submitting
    if (Date.now() > latestAttempt.deadline.getTime() + GRACE_PERIOD_SECONDS * 1000) {
      throw errors.UNPROCESSABLE_CONTENT({
        message: "Waktu sesi flashcard telah berakhir.",
      });
    }

    await db.transaction(async (tx) => {
      await tx
        .update(userFlashcardAttempt)
        .set({ submittedAt: new Date() })
        .where(eq(userFlashcardAttempt.id, latestAttempt.id));
      await tx
        .update(user)
        .set({ flashcardStreak: sql`${user.flashcardStreak} + 1`, lastCompletedFlashcardAt: today })
        .where(eq(user.id, context.session.user.id));
    });

    return { message: "Berhasil mengerjakan flashcard hari ini!" };
  });

const save = authed
  .route({
    path: "/flashcard",
    method: "POST",
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await db.transaction(async (tx) => {
      const [attempt] = await tx
        .select({
          id: userFlashcardAttempt.id,
          deadline: userFlashcardAttempt.deadline,
        })
        .from(userFlashcardQuestionAnswer)
        .innerJoin(userFlashcardAttempt, eq(userFlashcardQuestionAnswer.attemptId, userFlashcardAttempt.id))
        .where(
          and(
            eq(userFlashcardQuestionAnswer.questionId, input.questionId),
            eq(userFlashcardQuestionAnswer.assignedDate, today),
            eq(userFlashcardAttempt.userId, context.session.user.id),
          ),
        );

      if (!attempt) throw errors.NOT_FOUND();

      if (Date.now() > attempt.deadline.getTime() + GRACE_PERIOD_SECONDS * 1000) {
        throw errors.UNPROCESSABLE_CONTENT({
          message: "Waktu sesi flashcard telah berakhir.",
        });
      }

      const answers = await tx
        .select({
          id: questionAnswerOption.id,
          isCorrect: questionAnswerOption.isCorrect,
        })
        .from(questionAnswerOption)
        .where(eq(questionAnswerOption.questionId, input.questionId));

      if (!answers || answers.length === 0) {
        throw errors.NOT_FOUND();
      }
      const correctAnswer = answers.find((answer) => answer.isCorrect);
      const userAnswer = answers.find((answer) => answer.id === input.answerId);
      if (!correctAnswer || !userAnswer) throw errors.NOT_FOUND();

      await tx
        .update(userFlashcardQuestionAnswer)
        .set({
          selectedAnswerId: input.answerId,
        })
        .where(
          and(
            eq(userFlashcardQuestionAnswer.questionId, input.questionId),
            eq(userFlashcardQuestionAnswer.assignedDate, today),
            eq(userFlashcardQuestionAnswer.attemptId, attempt.id),
          ),
        );

      return {
        isCorrect: userAnswer.isCorrect,
        correctAnswerId: correctAnswer.id,
        userAnswerId: userAnswer.id,
      };
    });
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
      status: "'submitted' | 'not_submitted'",
    }),
  )
  .handler(async ({ context }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const streak = context.session.user.flashcardStreak || 0;
    const lastCompletedDate = context.session.user.lastCompletedFlashcardAt as Date | null;

    if (lastCompletedDate && today.getTime() - lastCompletedDate.getTime() > 2 * 24 * 3600 * 1000)
      await db.update(user).set({ flashcardStreak: 0 }).where(eq(user.id, context.session.user.id));

    return {
      streak,
      lastCompletedDate,
      status: lastCompletedDate?.getTime() === today.getTime() ? "submitted" : "not_submitted",
    };
  });

const result = authed.handler(async ({ context, errors }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
              discussion: true,
            },
            with: {
              answerOptions: {
                columns: {
                  id: true,
                  content: true,
                  code: true,
                  isCorrect: true,
                },
                orderBy: (answers, { asc }) => [asc(answers.code)],
              },
            },
          },
        },
      },
    },
  });

  if (!attempt)
    throw errors.NOT_FOUND({
      message: "Anda belom mengerjakan flashcard hari ini.",
    });

  let correct = 0;
  for (const assignedQuestion of attempt.assignedQuestions) {
    const answerMap = new Map<number, boolean>();
    for (const answerOption of assignedQuestion.question.answerOptions) {
      answerMap.set(answerOption.id, answerOption.isCorrect);
    }

    // 0 as fallback ID if user didn't fill in their answer
    if (answerMap.get(assignedQuestion.selectedAnswerId || 0)) correct++;
  }

  return {
    ...attempt,
    correctAnswersCount: correct,
    questionsCount: attempt.assignedQuestions.length,
  };
});

export const flashcardRouter = {
  start,
  get,
  submit,
  save,
  streak,
  result,
};
