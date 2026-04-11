import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { practicePackQuestions } from "@habitutor/db/schema/practice-pack";
import { question, questionAnswerOption } from "@habitutor/db/schema/question";
import { and, asc, desc, eq, ilike, sql } from "drizzle-orm";

export const adminQuestionRepo = {
  list: async ({
    db = defaultDb,
    limit,
    afterId,
    beforeId,
    search,
    isFlashcardQuestion,
  }: {
    db?: DrizzleDatabase;
    limit: number;
    afterId: number | null;
    beforeId: number | null;
    search: string;
    isFlashcardQuestion?: boolean;
  }) => {
    if (beforeId) {
      const items = await db
        .select({
          id: question.id,
          content: question.content,
          contentJson: question.contentJson,
          discussion: question.discussion,
          discussionJson: question.discussionJson,
          isFlashcardQuestion: question.isFlashcardQuestion,
          packCount: sql<number>`cast(count(${practicePackQuestions.practicePackId}) as integer)`,
        })
        .from(question)
        .where(
          and(
            search.length > 0 ? ilike(question.content, `%${search}%`) : undefined,
            sql`${question.id} > ${beforeId}`,
            isFlashcardQuestion !== undefined ? eq(question.isFlashcardQuestion, isFlashcardQuestion) : undefined,
          ),
        )
        .leftJoin(practicePackQuestions, eq(question.id, practicePackQuestions.questionId))
        .groupBy(question.id)
        .orderBy(asc(question.id))
        .limit(limit + 1);

      return items.reverse();
    }

    return db
      .select({
        id: question.id,
        content: question.content,
        contentJson: question.contentJson,
        discussion: question.discussion,
        discussionJson: question.discussionJson,
        isFlashcardQuestion: question.isFlashcardQuestion,
        packCount: sql<number>`cast(count(${practicePackQuestions.practicePackId}) as integer)`,
      })
      .from(question)
      .where(
        and(
          search.length > 0 ? ilike(question.content, `%${search}%`) : undefined,
          afterId ? sql`${question.id} < ${afterId}` : undefined,
          isFlashcardQuestion !== undefined ? eq(question.isFlashcardQuestion, isFlashcardQuestion) : undefined,
        ),
      )
      .leftJoin(practicePackQuestions, eq(question.id, practicePackQuestions.questionId))
      .groupBy(question.id)
      .orderBy(desc(question.id))
      .limit(limit + 1);
  },

  getById: async ({ db = defaultDb, id }: { db?: DrizzleDatabase; id: number }) => {
    return db.query.question.findFirst({
      where: eq(question.id, id),
      with: {
        answerOptions: {
          orderBy: (answerOptions, { asc }) => [asc(answerOptions.code)],
        },
      },
    });
  },

  create: async ({
    db = defaultDb,
    values,
  }: {
    db?: DrizzleDatabase;
    values: Omit<typeof question.$inferInsert, "id">;
  }) => {
    const [q] = await db.insert(question).values(values).returning();
    return q;
  },

  update: async ({
    db = defaultDb,
    id,
    data,
  }: {
    db?: DrizzleDatabase;
    id: number;
    data: Partial<Omit<typeof question.$inferInsert, "id">>;
  }) => {
    const [q] = await db.update(question).set(data).where(eq(question.id, id)).returning();
    return q;
  },

  delete: async ({ db = defaultDb, id }: { db?: DrizzleDatabase; id: number }) => {
    const [q] = await db.delete(question).where(eq(question.id, id)).returning();
    return q;
  },

  getQuestionById: async ({ db = defaultDb, id }: { db?: DrizzleDatabase; id: number }) => {
    const [q] = await db.select().from(question).where(eq(question.id, id)).limit(1);
    return q;
  },

  createAnswer: async ({
    db = defaultDb,
    values,
  }: {
    db?: DrizzleDatabase;
    values: Omit<typeof questionAnswerOption.$inferInsert, "id">;
  }) => {
    const [answer] = await db.insert(questionAnswerOption).values(values).returning();
    return answer;
  },

  updateAnswer: async ({
    db = defaultDb,
    id,
    data,
  }: {
    db?: DrizzleDatabase;
    id: number;
    data: Partial<Omit<typeof questionAnswerOption.$inferInsert, "id" | "questionId" | "code">>;
  }) => {
    const [answer] = await db.update(questionAnswerOption).set(data).where(eq(questionAnswerOption.id, id)).returning();
    return answer;
  },

  deleteAnswer: async ({ db = defaultDb, id }: { db?: DrizzleDatabase; id: number }) => {
    const [answer] = await db.delete(questionAnswerOption).where(eq(questionAnswerOption.id, id)).returning();
    return answer;
  },
};
