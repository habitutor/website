import { and, asc, desc, eq, gt, gte, lt } from "drizzle-orm";
import type { DrizzleDatabase } from "@habitutor/db";
import { db as defaultDb } from "@habitutor/db";
import { type FeedbackCategory, type FeedbackStatus, feedbackReport } from "@habitutor/db/schema/feedback";

export const feedbackRepo = {
  create: async ({
    db = defaultDb,
    userId,
    path,
    questionId,
    category,
    description,
    selectedAnswerId,
    attemptId,
  }: {
    db?: DrizzleDatabase;
    userId: string;
    path?: string | null;
    questionId?: number | null;
    category: FeedbackCategory;
    description: string;
    selectedAnswerId?: number | null;
    attemptId?: number | null;
  }) => {
    const [feedback] = await db
      .insert(feedbackReport)
      .values({
        userId,
        path,
        questionId,
        category,
        description,
        selectedAnswerId,
        attemptId,
      })
      .returning();
    return feedback;
  },

  listForAdmin: async ({
    db = defaultDb,
    limit = 20,
    after,
    before,
    status,
    category,
    priority,
  }: {
    db?: DrizzleDatabase;
    limit?: number;
    after?: number | null;
    before?: number | null;
    status?: FeedbackStatus | null;
    category?: string | null;
    priority?: string | null;
  }) => {
    let data;
    let hasNext = false;
    let hasPrevious = false;

    if (before !== null && before !== undefined) {
      const items = await db
        .select()
        .from(feedbackReport)
        .where(
          and(
            status ? eq(feedbackReport.status, status) : undefined,
            category ? eq(feedbackReport.category, category as "error" | "question_bug" | "other") : undefined,
            priority ? eq(feedbackReport.priority, priority as "p0" | "p1" | "p2" | "p3") : undefined,
            lt(feedbackReport.id, before),
          ),
        )
        .orderBy(desc(feedbackReport.id))
        .limit(limit + 1);

      if (items.length > limit) {
        hasPrevious = true;
        items.pop();
      }

      data = items.reverse();
      hasNext = true;
    } else {
      const items = await db
        .select()
        .from(feedbackReport)
        .where(
          and(
            status ? eq(feedbackReport.status, status) : undefined,
            category ? eq(feedbackReport.category, category as "error" | "question_bug" | "other") : undefined,
            priority ? eq(feedbackReport.priority, priority as "p0" | "p1" | "p2" | "p3") : undefined,
            after !== null && after !== undefined ? gt(feedbackReport.id, after) : undefined,
          ),
        )
        .orderBy(asc(feedbackReport.id))
        .limit(limit + 1);

      if (items.length > limit) {
        hasNext = true;
        items.pop();
      }

      data = items;
      if (after !== null && after !== undefined) {
        hasPrevious = true;
      }
    }

    return {
      data,
      nextCursor: hasNext && data.length > 0 ? data[data.length - 1]!.id : null,
      prevCursor: hasPrevious && data.length > 0 ? data[0]!.id : null,
      hasNext,
      hasPrevious,
    };
  },

  getById: async ({ db = defaultDb, id }: { db?: DrizzleDatabase; id: number }) => {
    const [feedback] = await db.select().from(feedbackReport).where(eq(feedbackReport.id, id)).limit(1);
    return feedback ?? null;
  },

  update: async ({
    db = defaultDb,
    id,
    status,
    priority,
    adminNotes,
    resolvedBy,
    resolvedAt,
  }: {
    db?: DrizzleDatabase;
    id: number;
    status?: FeedbackStatus | null;
    priority?: "p0" | "p1" | "p2" | "p3" | null;
    adminNotes?: string | null;
    resolvedBy?: string | null;
    resolvedAt?: Date | null;
  }) => {
    const [feedback] = await db
      .update(feedbackReport)
      .set({
        ...(status !== undefined &&
          status !== null && {
            status,
            resolvedAt,
          }),
        ...(priority !== undefined && { priority }),
        ...(adminNotes !== undefined && { adminNotes }),
        ...(resolvedBy !== undefined && { resolvedBy }),
      })
      .where(eq(feedbackReport.id, id))
      .returning();
    return feedback;
  },

  listByUser: async ({
    db = defaultDb,
    userId,
    limit = 20,
    afterId,
  }: {
    db?: DrizzleDatabase;
    userId: string;
    limit?: number;
    afterId?: number | null;
  }) => {
    const items = await db
      .select()
      .from(feedbackReport)
      .where(
        afterId
          ? and(eq(feedbackReport.userId, userId), gte(feedbackReport.id, afterId))
          : eq(feedbackReport.userId, userId),
      )
      .orderBy(desc(feedbackReport.id))
      .limit(limit + 1);

    const hasMore = items.length > limit;
    if (hasMore) {
      items.pop();
    }

    return {
      data: items,
      nextCursor: hasMore ? items[items.length - 1]!.id : null,
    };
  },
};
