import { sql } from "drizzle-orm";
import { index, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { question } from "./question";

/** Laporan siswa atas soal Brain Gym. Terbuka selama resolvedAt masih kosong. */
export const questionReport = pgTable(
  "question_report",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    questionId: integer("question_id")
      .notNull()
      .references(() => question.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    reason: text().notNull(),
    note: text(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    resolvedAt: timestamp("resolved_at"),
    /** "fixed" atau "disabled", diisi saat admin menyelesaikan laporan. */
    resolution: text(),
  },
  (t) => [
    uniqueIndex("question_report_open_unique")
      .on(t.questionId, t.userId)
      .where(sql`resolved_at is null`),
    index("idx_question_report_question").on(t.questionId),
    index("idx_question_report_user_created").on(t.userId, t.createdAt),
  ],
);
