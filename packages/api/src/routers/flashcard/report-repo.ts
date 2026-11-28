import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { user } from "@habitutor/db/schema/auth";
import { userFlashcardQuestionAnswer } from "@habitutor/db/schema/flashcard";
import { question } from "@habitutor/db/schema/question";
import { questionReport } from "@habitutor/db/schema/question-report";
import { and, asc, eq, gte, isNull, sql } from "drizzle-orm";
import { REPORTERS_TO_HOLD_AFTER_FIX, type ReportReason } from "./report-logic";

/** Jumlah siswa berbeda yang laporannya atas soal ini masih terbuka. */
export const openReportCount = sql<number>`cast((
  select count(distinct r.user_id) from ${questionReport} r
  where r.question_id = ${question.id} and r.resolved_at is null
) as integer)`;

/**
 * Soal ditahan dari Brain Gym kalau laporan terbukanya mencapai ambang: satu laporan, atau tiga siswa kalau admin
 * pernah menandai soal ini sudah diperbaiki (supaya satu orang tidak bisa menahannya berulang-ulang).
 */
export const isHeldByReports = sql<boolean>`(${openReportCount} >= case when exists (
  select 1 from ${questionReport} f where f.question_id = ${question.id} and f.resolution = 'fixed'
) then ${sql.raw(String(REPORTERS_TO_HOLD_AFTER_FIX))} else 1 end)`;

export const questionReportRepo = {
  countByUserSince: async ({
    db = defaultDb,
    userId,
    since,
  }: {
    db?: DrizzleDatabase;
    userId: string;
    since: Date;
  }) => {
    const [row] = await db
      .select({ total: sql<number>`cast(count(*) as integer)` })
      .from(questionReport)
      .where(and(eq(questionReport.userId, userId), gte(questionReport.createdAt, since)));
    return row?.total ?? 0;
  },

  /** Mengembalikan null kalau siswa ini masih punya laporan terbuka untuk soal yang sama. */
  create: async ({
    db = defaultDb,
    ...values
  }: {
    db?: DrizzleDatabase;
    questionId: number;
    userId: string;
    reason: ReportReason;
    note: string | null;
  }) => {
    const [report] = await db.insert(questionReport).values(values).onConflictDoNothing().returning();
    return report ?? null;
  },

  /** Keluarkan soal yang belum dijawab dari sesi, supaya tidak ikut dihitung dalam skor. */
  removeUnansweredFromAttempt: async ({
    db = defaultDb,
    attemptId,
    questionId,
  }: {
    db?: DrizzleDatabase;
    attemptId: number;
    questionId: number;
  }) => {
    const removed = await db
      .delete(userFlashcardQuestionAnswer)
      .where(
        and(
          eq(userFlashcardQuestionAnswer.attemptId, attemptId),
          eq(userFlashcardQuestionAnswer.questionId, questionId),
          isNull(userFlashcardQuestionAnswer.selectedAnswerId),
        ),
      )
      .returning({ questionId: userFlashcardQuestionAnswer.questionId });
    return removed.length > 0;
  },

  listOpen: async ({ db = defaultDb, questionId }: { db?: DrizzleDatabase; questionId: number }) => {
    return db
      .select({
        id: questionReport.id,
        reason: questionReport.reason,
        note: questionReport.note,
        createdAt: questionReport.createdAt,
        reporterName: user.name,
        reporterEmail: user.email,
      })
      .from(questionReport)
      .innerJoin(user, eq(user.id, questionReport.userId))
      .where(and(eq(questionReport.questionId, questionId), isNull(questionReport.resolvedAt)))
      .orderBy(asc(questionReport.createdAt));
  },

  resolve: async ({
    db = defaultDb,
    questionId,
    resolution,
  }: {
    db?: DrizzleDatabase;
    questionId: number;
    resolution: "fixed" | "disabled";
  }) => {
    return db.transaction(async (tx) => {
      const resolved = await tx
        .update(questionReport)
        .set({ resolvedAt: new Date(), resolution })
        .where(and(eq(questionReport.questionId, questionId), isNull(questionReport.resolvedAt)))
        .returning({ id: questionReport.id });
      if (resolved.length > 0 && resolution === "disabled") {
        await tx.update(question).set({ isFlashcardQuestion: false }).where(eq(question.id, questionId));
      }
      return resolved.length;
    });
  },

  /** Ringkasan untuk admin: soal yang menunggu dicek, yang ditahan, dan stok Brain Gym yang masih bisa diacak. */
  summary: async ({ db = defaultDb }: { db?: DrizzleDatabase } = {}) => {
    const [row] = await db
      .select({
        pending: sql<number>`cast(count(*) filter (where ${openReportCount} > 0) as integer)`,
        held: sql<number>`cast(count(*) filter (where ${question.isFlashcardQuestion} and ${isHeldByReports}) as integer)`,
        available: sql<number>`cast(count(*) filter (where ${question.isFlashcardQuestion} and not ${isHeldByReports}
          and exists (select 1 from question_answer_option o where o.question_id = ${question.id})) as integer)`,
      })
      .from(question);
    return row ?? { pending: 0, held: 0, available: 0 };
  },
};
