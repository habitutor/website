import { and, asc, count, desc, eq, gt, gte, lt, sql } from "drizzle-orm";
import type { DrizzleDatabase } from "@habitutor/db";
import { db as defaultDb } from "@habitutor/db";
import { feedbackReport } from "@habitutor/db";

type FeedbackStatus = "open" | "in_review" | "resolved" | "dismissed";

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
    category: "wrong_answer" | "bug_in_question" | "unclear_discussion" | "missing_option" | "other";
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
    afterCursor,
    beforeCursor,
    status,
    category,
    priority,
  }: {
    db?: DrizzleDatabase;
    limit?: number;
    afterCursor?: number | null;
    beforeCursor?: number | null;
    status?: FeedbackStatus | null;
    category?: string | null;
    priority?: string | null;
  }) => {
    let data;
    let hasNext = false;
    let hasPrevious = false;

    if (beforeCursor !== null && beforeCursor !== undefined) {
      const items = await db
        .select()
        .from(feedbackReport)
        .where(
          and(
            status ? eq(feedbackReport.status, status) : undefined,
            category
              ? eq(
                  feedbackReport.category,
                  category as "wrong_answer" | "bug_in_question" | "unclear_discussion" | "missing_option" | "other",
                )
              : undefined,
            priority ? eq(feedbackReport.priority, priority as "p0" | "p1" | "p2" | "p3") : undefined,
            lt(feedbackReport.id, beforeCursor),
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
            category
              ? eq(
                  feedbackReport.category,
                  category as "wrong_answer" | "bug_in_question" | "unclear_discussion" | "missing_option" | "other",
                )
              : undefined,
            priority ? eq(feedbackReport.priority, priority as "p0" | "p1" | "p2" | "p3") : undefined,
            afterCursor !== null && afterCursor !== undefined ? gt(feedbackReport.id, afterCursor) : undefined,
          ),
        )
        .orderBy(asc(feedbackReport.id))
        .limit(limit + 1);

      if (items.length > limit) {
        hasNext = true;
        items.pop();
      }

      data = items;
      if (afterCursor !== null && afterCursor !== undefined) {
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
  }: {
    db?: DrizzleDatabase;
    id: number;
    status?: FeedbackStatus | null;
    priority?: "p0" | "p1" | "p2" | "p3" | null;
    adminNotes?: string | null;
    resolvedBy?: string | null;
  }) => {
    const [feedback] = await db
      .update(feedbackReport)
      .set({
        ...(status !== undefined &&
          status !== null && {
            status,
            resolvedAt: status === "resolved" || status === "dismissed" ? new Date() : undefined,
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
    cursorId,
  }: {
    db?: DrizzleDatabase;
    userId: string;
    limit?: number;
    cursorId?: number | null;
  }) => {
    const items = await db
      .select()
      .from(feedbackReport)
      .where(
        cursorId
          ? and(eq(feedbackReport.userId, userId), gte(feedbackReport.id, cursorId))
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

  countOpen: async ({ db = defaultDb }: { db?: DrizzleDatabase }) => {
    const [result] = await db.select({ count: count() }).from(feedbackReport).where(eq(feedbackReport.status, "open"));
    return result?.count ?? 0;
  },

  countUnseenResolved: async ({ db = defaultDb, userId }: { db?: DrizzleDatabase; userId: string }) => {
    const [result] = await db
      .select({ count: count() })
      .from(feedbackReport)
      .where(
        and(
          eq(feedbackReport.userId, userId),
          eq(feedbackReport.status, "resolved"),
          sql`(user_seen_at < resolved_at OR user_seen_at IS NULL)`,
        ),
      );

    return result?.count ?? 0;
  },

  markSeen: async ({ db = defaultDb, ids }: { db?: DrizzleDatabase; ids: number[] }) => {
    if (ids.length === 0) return;

    await db
      .update(feedbackReport)
      .set({ userSeenAt: new Date() })
      .where(sql`id = ANY(${ids})`);
  },
};
