import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import {
  practicePack,
  practicePackAttempt,
  practicePackQuestions,
  practicePackUserAnswer,
} from "@habitutor/db/schema/practice-pack";
import { question, questionAnswerOption } from "@habitutor/db/schema/question";
import { and, count, desc, eq } from "drizzle-orm";
import type { Question } from "../../types/practice-pack";
import { convertToTiptap } from "../../lib/tiptap";

type QuestionMapRow = {
  questionId: number;
  questionOrder: number | null;
  questionContent: string;
  questionContentJson: unknown;
  questionDiscussion: string;
  questionDiscussionJson: unknown;
  answerId: number;
  answerContent: string;
  selectedAnswerId?: number | null;
  answerIsCorrect?: boolean | null;
};

type HistoryQuestionMapRow = QuestionMapRow & {
  selectedAnswerId: number | null;
  answerIsCorrect: boolean | null;
};

function toTiptapDoc(contentJson: unknown, fallback: string): Record<string, unknown> {
  if (contentJson && typeof contentJson === "object") {
    return contentJson as Record<string, unknown>;
  }
  return convertToTiptap(fallback) as Record<string, unknown>;
}

function buildQuestionMapBase(
  rows: QuestionMapRow[],
  includeCorrectness: boolean,
): Map<number, Question & { userAnswerIsCorrect?: boolean }> {
  const questionMap = new Map<number, Question & { userAnswerIsCorrect?: boolean }>();

  for (const row of rows) {
    if (!questionMap.has(row.questionId)) {
      questionMap.set(row.questionId, {
        id: row.questionId,
        order: row.questionOrder ?? 1,
        content: toTiptapDoc(row.questionContentJson, row.questionContent),
        discussion: toTiptapDoc(row.questionDiscussionJson, row.questionDiscussion),
        selectedAnswerId: row.selectedAnswerId ?? null,
        userAnswerIsCorrect: includeCorrectness ? false : undefined,
        answers: [],
      });
    }

    const currentQuestion = questionMap.get(row.questionId);
    if (!currentQuestion) {
      continue;
    }

    currentQuestion.answers.push({
      id: row.answerId,
      content: row.answerContent,
      isCorrect: includeCorrectness ? (row.answerIsCorrect ?? undefined) : undefined,
    });

    if (includeCorrectness && row.selectedAnswerId === row.answerId && row.answerIsCorrect === true) {
      currentQuestion.userAnswerIsCorrect = true;
    }
  }

  return questionMap;
}

export const practicePackRepo = {
  listWithAttempts: async ({ db = defaultDb, userId }: { db?: DrizzleDatabase; userId: string }) => {
    return db
      .select({
        id: practicePack.id,
        attemptId: practicePackAttempt.id,
        title: practicePack.title,
        status: practicePackAttempt.status ?? "not_started",
        startedAt: practicePackAttempt.startedAt,
        completedAt: practicePackAttempt.completedAt,
      })
      .from(practicePack)
      .leftJoin(
        practicePackAttempt,
        and(eq(practicePack.id, practicePackAttempt.practicePackId), eq(practicePackAttempt.userId, userId)),
      );
  },

  findWithQuestions: async ({
    db = defaultDb,
    packId,
    userId,
  }: {
    db?: DrizzleDatabase;
    packId: number;
    userId: string;
  }) => {
    return db
      .select({
        attemptId: practicePackAttempt.id,
        title: practicePack.title,
        status: practicePackAttempt.status,
        startedAt: practicePackAttempt.startedAt,
        completedAt: practicePackAttempt.completedAt,
        questionId: practicePackQuestions.questionId,
        questionOrder: practicePackQuestions.order,
        questionContent: question.content,
        questionContentJson: question.contentJson,
        questionDiscussion: question.discussion,
        questionDiscussionJson: question.discussionJson,
        answerId: questionAnswerOption.id,
        answerContent: questionAnswerOption.content,
        userSelectedAnswerId: practicePackUserAnswer.selectedAnswerId,
      })
      .from(practicePack)
      .innerJoin(practicePackAttempt, eq(practicePackAttempt.practicePackId, practicePack.id))
      .innerJoin(practicePackQuestions, eq(practicePackQuestions.practicePackId, practicePack.id))
      .innerJoin(question, eq(question.id, practicePackQuestions.questionId))
      .innerJoin(questionAnswerOption, eq(questionAnswerOption.questionId, question.id))
      .leftJoin(
        practicePackUserAnswer,
        and(
          eq(practicePackUserAnswer.questionId, question.id),
          eq(practicePackUserAnswer.attemptId, practicePackAttempt.id),
        ),
      )
      .where(and(eq(practicePack.id, packId), eq(practicePackAttempt.userId, userId)));
  },

  createAttempt: async ({
    db = defaultDb,
    packId,
    userId,
  }: {
    db?: DrizzleDatabase;
    packId: number;
    userId: string;
  }) => {
    const [attempt] = await db
      .insert(practicePackAttempt)
      .values({
        practicePackId: packId,
        userId,
      })
      .onConflictDoNothing()
      .returning();
    return attempt ?? null;
  },

  getAttempt: async ({ db = defaultDb, packId, userId }: { db?: DrizzleDatabase; packId: number; userId: string }) => {
    const [attempt] = await db
      .select({
        id: practicePackAttempt.id,
        userId: practicePackAttempt.userId,
        status: practicePackAttempt.status,
      })
      .from(practicePackAttempt)
      .where(and(eq(practicePackAttempt.practicePackId, packId), eq(practicePackAttempt.userId, userId)))
      .limit(1);
    return attempt ?? null;
  },

  saveAnswer: async ({
    db = defaultDb,
    attemptId,
    questionId,
    selectedAnswerId,
  }: {
    db?: DrizzleDatabase;
    attemptId: number;
    questionId: number;
    selectedAnswerId: number;
  }) => {
    return db
      .insert(practicePackUserAnswer)
      .values({
        attemptId,
        questionId,
        selectedAnswerId,
      })
      .onConflictDoUpdate({
        target: [practicePackUserAnswer.attemptId, practicePackUserAnswer.questionId],
        set: { selectedAnswerId },
      });
  },

  submitAttempt: async ({
    db = defaultDb,
    packId,
    userId,
  }: {
    db?: DrizzleDatabase;
    packId: number;
    userId: string;
  }) => {
    const [attempt] = await db
      .update(practicePackAttempt)
      .set({
        completedAt: new Date(),
        status: "finished",
      })
      .where(and(eq(practicePackAttempt.practicePackId, packId), eq(practicePackAttempt.userId, userId)))
      .returning();
    return attempt ?? null;
  },

  countAttempts: async ({ db = defaultDb, userId }: { db?: DrizzleDatabase; userId: string }) => {
    const [result] = await db
      .select({ count: count() })
      .from(practicePackAttempt)
      .where(eq(practicePackAttempt.userId, userId));
    return result?.count ?? 0;
  },

  getHistory: async ({
    db = defaultDb,
    userId,
    limit,
    offset,
  }: {
    db?: DrizzleDatabase;
    userId: string;
    limit: number;
    offset: number;
  }) => {
    return db
      .select({
        practicePackId: practicePackAttempt.practicePackId,
        startedAt: practicePackAttempt.startedAt,
        completedAt: practicePackAttempt.completedAt,
        status: practicePackAttempt.status,
      })
      .from(practicePackAttempt)
      .where(eq(practicePackAttempt.userId, userId))
      .orderBy(desc(practicePackAttempt.startedAt))
      .limit(limit)
      .offset(offset);
  },

  findHistoryByPack: async ({
    db = defaultDb,
    packId,
    userId,
  }: {
    db?: DrizzleDatabase;
    packId: number;
    userId: string;
  }) => {
    return db
      .select({
        attemptId: practicePackAttempt.id,
        title: practicePack.title,
        questionId: practicePackQuestions.questionId,
        questionOrder: practicePackQuestions.order,
        questionContent: question.content,
        questionContentJson: question.contentJson,
        questionDiscussion: question.discussion,
        questionDiscussionJson: question.discussionJson,
        answerId: questionAnswerOption.id,
        answerContent: questionAnswerOption.content,
        answerIsCorrect: questionAnswerOption.isCorrect,
        userSelectedAnswerId: practicePackUserAnswer.selectedAnswerId,
        startedAt: practicePackAttempt.startedAt,
        completedAt: practicePackAttempt.completedAt,
      })
      .from(practicePack)
      .innerJoin(practicePackAttempt, eq(practicePackAttempt.practicePackId, practicePack.id))
      .innerJoin(practicePackQuestions, eq(practicePackQuestions.practicePackId, practicePack.id))
      .innerJoin(question, eq(question.id, practicePackQuestions.questionId))
      .innerJoin(questionAnswerOption, eq(questionAnswerOption.questionId, question.id))
      .leftJoin(
        practicePackUserAnswer,
        and(
          eq(practicePackUserAnswer.questionId, question.id),
          eq(practicePackUserAnswer.attemptId, practicePackAttempt.id),
        ),
      )
      .where(
        and(
          eq(practicePack.id, packId),
          eq(practicePackAttempt.userId, userId),
          eq(practicePackAttempt.status, "finished"),
        ),
      );
  },
};

export function buildQuestionMap(rows: QuestionMapRow[]): Map<number, Question & { userAnswerIsCorrect?: boolean }> {
  return buildQuestionMapBase(rows, false);
}

export function buildHistoryQuestionMap(
  rows: HistoryQuestionMapRow[],
): Map<number, Question & { userAnswerIsCorrect: boolean }> {
  return buildQuestionMapBase(rows, true) as Map<number, Question & { userAnswerIsCorrect: boolean }>;
}

export function formatQuestions(rows: QuestionMapRow[]): Question[] {
  return Array.from(buildQuestionMap(rows).values()).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function formatHistoryQuestions(rows: HistoryQuestionMapRow[]): (Question & { userAnswerIsCorrect: boolean })[] {
  return Array.from(buildHistoryQuestionMap(rows).values()).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
