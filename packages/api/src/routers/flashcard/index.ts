import { db } from "@habitutor/db";
import { user } from "@habitutor/db/schema/auth";
import { type } from "arktype";
import { eq, sql } from "drizzle-orm";
import { authed, premium } from "../../index";
import { getStartOfDay } from "@habitutor/shared/date";
import { convertToTiptap } from "../../lib/tiptap";
import {
  countCorrectAnswers,
  isAttemptExpired,
  resolveAttemptAnswer,
  shouldBlockStartSession,
  shouldIncrementFlashcardStreak,
} from "./logic";
import { flashcardRepo } from "./repo";

const FLASHCARD_SESSION_DURATION_MINUTES = 10;
const FLASHCARD_QUESTION_LIMIT = 5;
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

    const latestAttempt = await flashcardRepo.getLatestAttempt({
      db,
      userId: context.session.user.id,
    });
    const shouldBlock = shouldBlockStartSession({
      latestAttempt: latestAttempt ?? undefined,
      isPremium,
      today,
      now: Date.now(),
      gracePeriodSeconds: GRACE_PERIOD_SECONDS,
    });

    if (shouldBlock)
      throw errors.UNPROCESSABLE_CONTENT({
        message: "Kamu sudah memulai sesi flashcard hari ini.",
      });

    await db.transaction(async (tx) => {
      const attempt = await flashcardRepo.createAttempt({
        db: tx,
        userId: context.session.user.id,
        deadline,
      });

      if (!attempt)
        throw errors.INTERNAL_SERVER_ERROR({
          message: "Gagal membuat sesi flashcard.",
        });

      const randomQuestionIds = await flashcardRepo.getRandomFlashcardQuestionIds({
        db: tx,
        limit: FLASHCARD_QUESTION_LIMIT,
      });

      if (randomQuestionIds.length < FLASHCARD_QUESTION_LIMIT)
        throw errors.NOT_FOUND({
          message: "Belum cukup soal flashcard tersedia. Silahkan coba lagi nanti.",
        });

      const availableQuestions = await flashcardRepo.getQuestionsByIds({
        db: tx,
        ids: randomQuestionIds.map((q) => q.id),
      });

      if (availableQuestions.length < FLASHCARD_QUESTION_LIMIT)
        throw errors.NOT_FOUND({
          message: "Belum cukup soal flashcard tersedia. Silahkan coba lagi nanti.",
        });

      await flashcardRepo.insertQuestionAnswers({
        db: tx,
        answers: availableQuestions.map((q) => ({
          attemptId: attempt.id,
          assignedDate: today,
          questionId: q.id,
        })),
      });
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

    const attempt = await flashcardRepo.getLatestAttempt({
      db,
      userId: context.session.user.id,
    });

    if (!attempt) return { status };

    const assignedQuestionsRaw = await flashcardRepo.getUnansweredQuestions({ db, attemptId: attempt.id });
    const totalQuestionsCount = await flashcardRepo.countQuestionsForAttempt({ db, attemptId: attempt.id });

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
      totalQuestionsCount,
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
    const shouldIncrementStreak = shouldIncrementFlashcardStreak({
      lastCompletedFlashcardAt: context.session.user.lastCompletedFlashcardAt,
      today,
    });
    const hasDoneToday = !shouldIncrementStreak;

    const latestAttempt = await flashcardRepo.getLatestAttemptForToday({
      db,
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

    if (
      isAttemptExpired({ deadline: latestAttempt.deadline, now: Date.now(), gracePeriodSeconds: GRACE_PERIOD_SECONDS })
    ) {
      throw errors.UNPROCESSABLE_CONTENT({
        message: "Waktu sesi flashcard telah berakhir.",
      });
    }

    await db.transaction(async (tx) => {
      const attemptScore = await flashcardRepo.getAttemptScore({
        db: tx,
        attemptId: latestAttempt.id,
      });

      await flashcardRepo.markAttemptSubmitted({
        db: tx,
        attemptId: latestAttempt.id,
        score: attemptScore,
      });

      if (!hasDoneToday)
        await tx
          .update(user)
          .set({
            flashcardStreak: sql`${user.flashcardStreak} + 1`,
            totalScore: sql`${user.totalScore} + ${attemptScore}`,
            lastCompletedFlashcardAt: new Date(),
          })
          .where(eq(user.id, context.session.user.id));

      if (hasDoneToday)
        await tx
          .update(user)
          .set({ totalScore: sql`${user.totalScore} + ${attemptScore}` })
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
      db,
      userId: context.session.user.id,
      questionId: input.questionId,
      today,
    });

    if (!attempt) throw errors.NOT_FOUND();

    if (isAttemptExpired({ deadline: attempt.deadline, now: Date.now(), gracePeriodSeconds: GRACE_PERIOD_SECONDS })) {
      throw errors.UNPROCESSABLE_CONTENT({
        message: "Waktu sesi flashcard telah berakhir.",
      });
    }

    const answers = await flashcardRepo.getAnswersForQuestion({
      db,
      questionId: input.questionId,
    });

    if (!answers || answers.length === 0) {
      throw errors.NOT_FOUND();
    }
    const resolvedAnswer = resolveAttemptAnswer({ answers, userAnswerId: input.answerId });
    if (!resolvedAnswer) throw errors.NOT_FOUND();

    await flashcardRepo.updateQuestionAnswer({
      db,
      questionId: input.questionId,
      attemptId: attempt.id,
      selectedAnswerId: input.answerId,
      today,
    });

    return {
      isCorrect: resolvedAnswer.isCorrect,
      correctAnswerId: resolvedAnswer.correctAnswerId,
      userAnswerId: resolvedAnswer.userAnswerId,
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
      db,
      userId: context.session.user.id,
      attemptId: input.id,
    });

    if (!attempt)
      throw errors.NOT_FOUND({
        message: "Anda belom mengerjakan flashcard hari ini.",
      });

    const assignedQuestions = await flashcardRepo.getAttemptQuestionAnswers({
      db,
      attemptId: attempt.id,
    });

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

    const correct = countCorrectAnswers(formattedQuestions);

    return {
      streak: context.session.user.flashcardStreak,
      assignedQuestions: formattedQuestions,
      correctAnswersCount: correct,
      questionsCount: formattedQuestions.length,
      attemptId: attempt.id,
    };
  });

const history = premium
  .route({
    path: "/flashcard/history",
    method: "GET",
    tags: ["Flashcard"],
  })
  .handler(async ({ context }) => {
    return flashcardRepo.getUserHistory({ db, userId: context.session.user.id });
  });

const totalScore = authed
  .route({
    path: "/flashcard/total-score",
    method: "POST",
    tags: ["Flashcard"],
  })
  .output(
    type({
      totalScore: "number",
    }),
  )
  .handler(async ({ context }) => {
    const totalScore = await flashcardRepo.getUserTotalScore({
      db,
      userId: context.session.user.id,
    });

    return { totalScore };
  });

const leaderboard = authed
  .route({
    path: "/flashcard/leaderboard",
    method: "GET",
    tags: ["Flashcard"],
  })
  .output(
    type({
      entries: type({
        rank: "number",
        userId: "string",
        name: "string",
        "image?": "string | null",
        totalScore: "number",
        isCurrentUser: "boolean",
      }).array(),
    }),
  )
  .handler(async ({ context }) => {
    const entries = await flashcardRepo.getLeaderboardWithCurrentUser({
      db,
      currentUserId: context.session.user.id,
      limit: 10,
    });

    return {
      entries: entries.map((entry: (typeof entries)[number]) => ({
        rank: Number(entry.rank),
        userId: entry.userId,
        name: entry.name,
        image: entry.image,
        totalScore: entry.totalScore,
        isCurrentUser: entry.userId === context.session.user.id,
      })),
    };
  });

export const flashcardRouter = {
  start,
  get,
  save,
  totalScore,
  // Legacy aliases kept for compatibility
  session: get,
  submit,
  answer: save,
  result,
  history,
  score: totalScore,
  leaderboard,
};
