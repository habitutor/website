import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { user } from "@habitutor/db/schema/auth";
import { userFlashcardAttempt, userFlashcardQuestionAnswer } from "@habitutor/db/schema/flashcard";
import { question, questionAnswerOption } from "@habitutor/db/schema/question";
import { and, desc, eq, gte, inArray, isNull, sql } from "drizzle-orm";

type ExecuteRowsResult<T> = T[] | { rows?: T[] };

function extractExecuteRows<T>(result: ExecuteRowsResult<T>): T[] {
  if (Array.isArray(result)) {
    return result;
  }

  if (result && typeof result === "object" && "rows" in result && Array.isArray(result.rows)) {
    return result.rows;
  }

  return [];
}

export const flashcardRepo = {
  getLatestAttempt: async ({ db = defaultDb, userId }: { db?: DrizzleDatabase; userId: string }) => {
    const [attempt] = await db
      .select()
      .from(userFlashcardAttempt)
      .where(eq(userFlashcardAttempt.userId, userId))
      .orderBy(desc(userFlashcardAttempt.startedAt))
      .limit(1);
    return attempt ?? null;
  },

  getLatestAttemptForToday: async ({
    db = defaultDb,
    userId,
    today,
  }: {
    db?: DrizzleDatabase;
    userId: string;
    today: Date;
  }) => {
    const [attempt] = await db
      .select()
      .from(userFlashcardAttempt)
      .where(and(eq(userFlashcardAttempt.userId, userId), gte(userFlashcardAttempt.startedAt, today)))
      .orderBy(desc(userFlashcardAttempt.startedAt))
      .limit(1);
    return attempt ?? null;
  },

  createAttempt: async ({
    db = defaultDb,
    userId,
    deadline,
  }: {
    db?: DrizzleDatabase;
    userId: string;
    deadline: Date;
  }) => {
    const [attempt] = await db
      .insert(userFlashcardAttempt)
      .values({
        userId,
        startedAt: new Date(),
        deadline,
      })
      .returning();
    return attempt ?? null;
  },

  getRandomFlashcardQuestionIds: async ({ db = defaultDb, limit = 5 }: { db?: DrizzleDatabase; limit?: number }) => {
    const result = await db.execute(sql<{ id: number }>`
      SELECT q.id
      FROM (
        SELECT DISTINCT ${question.id} AS id
        FROM ${question}
        INNER JOIN ${questionAnswerOption}
          ON ${questionAnswerOption.questionId} = ${question.id}
        WHERE ${question.isFlashcardQuestion} = true
      ) q
      ORDER BY RANDOM()
      LIMIT ${limit}
    `);

    return extractExecuteRows(result);
  },

  getQuestionsByIds: async ({ db = defaultDb, ids }: { db?: DrizzleDatabase; ids: number[] }) => {
    return db.query.question.findMany({
      where: inArray(question.id, ids),
      with: {
        answerOptions: true,
      },
    });
  },

  insertQuestionAnswers: async ({
    db = defaultDb,
    answers,
  }: {
    db?: DrizzleDatabase;
    answers: Array<{
      attemptId: number;
      assignedDate: Date;
      questionId: number;
    }>;
  }) => {
    return db.insert(userFlashcardQuestionAnswer).values(answers);
  },

  countQuestionsForAttempt: async ({ db = defaultDb, attemptId }: { db?: DrizzleDatabase; attemptId: number }) => {
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(userFlashcardQuestionAnswer)
      .where(eq(userFlashcardQuestionAnswer.attemptId, attemptId));
    return row?.count ?? 0;
  },

  getUnansweredQuestions: async ({ db = defaultDb, attemptId }: { db?: DrizzleDatabase; attemptId: number }) => {
    return db.query.userFlashcardQuestionAnswer.findMany({
      where: and(
        eq(userFlashcardQuestionAnswer.attemptId, attemptId),
        isNull(userFlashcardQuestionAnswer.selectedAnswerId),
      ),
      with: {
        question: {
          columns: {
            id: true,
            content: true,
            contentJson: true,
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
    });
  },

  getAttemptById: async ({ db = defaultDb, attemptId }: { db?: DrizzleDatabase; attemptId: number }) => {
    const [attempt] = await db
      .select()
      .from(userFlashcardAttempt)
      .where(eq(userFlashcardAttempt.id, attemptId))
      .limit(1);
    return attempt ?? null;
  },

  markAttemptSubmitted: async ({
    db = defaultDb,
    attemptId,
    score,
  }: {
    db?: DrizzleDatabase;
    attemptId: number;
    score: number;
  }) => {
    const [attempt] = await db
      .update(userFlashcardAttempt)
      .set({ submittedAt: new Date(), score })
      .where(eq(userFlashcardAttempt.id, attemptId))
      .returning();
    return attempt ?? null;
  },

  getAttemptScore: async ({ db = defaultDb, attemptId }: { db?: DrizzleDatabase; attemptId: number }) => {
    const result = await db.execute(sql<{ score: number }>`
      SELECT
        CASE
          WHEN COUNT(aq.question_id) > 0 THEN ROUND((COALESCE(SUM(CASE WHEN ao.is_correct THEN 1 ELSE 0 END), 0)::numeric * 100) / COUNT(aq.question_id))::int
          ELSE 0
        END AS score
      FROM ${userFlashcardQuestionAnswer} aq
      LEFT JOIN ${questionAnswerOption} ao ON ao.id = aq.selected_answer_id
      WHERE aq.attempt_id = ${attemptId}
    `);

    const rows = extractExecuteRows(result);
    const row = rows[0];

    return row?.score ?? 0;
  },

  getAttemptForQuestion: async ({
    db = defaultDb,
    userId,
    questionId,
    today,
  }: {
    db?: DrizzleDatabase;
    userId: string;
    questionId: number;
    today: Date;
  }) => {
    const [attempt] = await db
      .select({
        id: userFlashcardAttempt.id,
        deadline: userFlashcardAttempt.deadline,
      })
      .from(userFlashcardQuestionAnswer)
      .innerJoin(userFlashcardAttempt, eq(userFlashcardQuestionAnswer.attemptId, userFlashcardAttempt.id))
      .where(
        and(
          eq(userFlashcardQuestionAnswer.questionId, questionId),
          eq(userFlashcardQuestionAnswer.assignedDate, today),
          eq(userFlashcardAttempt.userId, userId),
        ),
      )
      .orderBy(desc(userFlashcardAttempt.startedAt))
      .limit(1);
    return attempt ?? null;
  },

  getAnswersForQuestion: async ({ db = defaultDb, questionId }: { db?: DrizzleDatabase; questionId: number }) => {
    return db
      .select({
        id: questionAnswerOption.id,
        isCorrect: questionAnswerOption.isCorrect,
      })
      .from(questionAnswerOption)
      .where(eq(questionAnswerOption.questionId, questionId));
  },

  updateQuestionAnswer: async ({
    db = defaultDb,
    questionId,
    attemptId,
    selectedAnswerId,
    today,
  }: {
    db?: DrizzleDatabase;
    questionId: number;
    attemptId: number;
    selectedAnswerId: number;
    today: Date;
  }) => {
    return db
      .update(userFlashcardQuestionAnswer)
      .set({ selectedAnswerId })
      .where(
        and(
          eq(userFlashcardQuestionAnswer.questionId, questionId),
          eq(userFlashcardQuestionAnswer.assignedDate, today),
          eq(userFlashcardQuestionAnswer.attemptId, attemptId),
        ),
      );
  },

  getAttemptWithOptionalId: async ({
    db = defaultDb,
    userId,
    attemptId,
  }: {
    db?: DrizzleDatabase;
    userId: string;
    attemptId?: number;
  }) => {
    const [attempt] = await db
      .select()
      .from(userFlashcardAttempt)
      .where(
        and(eq(userFlashcardAttempt.userId, userId), attemptId ? eq(userFlashcardAttempt.id, attemptId) : undefined),
      )
      .orderBy(desc(userFlashcardAttempt.startedAt))
      .limit(1);
    return attempt ?? null;
  },

  getAttemptQuestionAnswers: async ({ db = defaultDb, attemptId }: { db?: DrizzleDatabase; attemptId: number }) => {
    return db.query.userFlashcardQuestionAnswer.findMany({
      where: eq(userFlashcardQuestionAnswer.attemptId, attemptId),
      columns: {
        selectedAnswerId: true,
        questionId: true,
      },
      with: {
        question: {
          columns: {
            id: true,
            content: true,
            contentJson: true,
            discussion: true,
            discussionJson: true,
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
    });
  },

  getUserHistory: async ({
    db = defaultDb,
    userId,
    limit = 50,
  }: {
    db?: DrizzleDatabase;
    userId: string;
    limit?: number;
  }) => {
    return db
      .select({
        id: userFlashcardAttempt.id,
        startedAt: userFlashcardAttempt.startedAt,
        submittedAt: userFlashcardAttempt.submittedAt,
      })
      .from(userFlashcardAttempt)
      .where(eq(userFlashcardAttempt.userId, userId))
      .orderBy(desc(userFlashcardAttempt.startedAt))
      .limit(limit);
  },

  getUserTotalScore: async ({ db = defaultDb, userId }: { db?: DrizzleDatabase; userId: string }) => {
    const [row] = await db.select({ totalScore: user.totalScore }).from(user).where(eq(user.id, userId)).limit(1);

    return row?.totalScore ?? 0;
  },

  getLeaderboardWithCurrentUser: async ({
    db = defaultDb,
    currentUserId,
    limit = 10,
  }: {
    db?: DrizzleDatabase;
    currentUserId: string;
    limit?: number;
  }) => {
    const result = await db.execute(
      sql<{
        userId: string;
        name: string;
        image: string | null;
        totalScore: number;
        rank: number;
      }>`
				WITH ranked AS (
					SELECT
						u.id AS user_id,
						u.name,
						u.image,
						u.total_score,
						ROW_NUMBER() OVER (ORDER BY u.total_score DESC, u.name ASC, u.id ASC)::int AS rank
					FROM ${user} u
          WHERE u.total_score > 0 OR u.id = ${currentUserId}
				)
				SELECT
					user_id AS "userId",
					name,
					image,
					total_score AS "totalScore",
					rank
				FROM ranked
				WHERE rank <= ${limit} OR user_id = ${currentUserId}
				ORDER BY
					CASE WHEN rank <= ${limit} THEN rank ELSE 999999 END,
					rank
			`,
    );

    return extractExecuteRows(result);
  },
};
