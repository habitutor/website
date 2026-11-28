import { sql } from "drizzle-orm";
import { boolean, index, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { question, questionAnswerOption } from "./question";
import { contentItem } from "./subtest";

/**
 * Jawaban siswa pada latihan soal di Kelas. Percobaan yang sedang berjalan adalah baris dengan archivedAt kosong;
 * "Ulangi" mengarsipkan baris lama, jadi percobaan pertama tetap tersimpan.
 */
export const contentPracticeAnswer = pgTable(
  "content_practice_answer",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    contentItemId: integer("content_item_id")
      .notNull()
      .references(() => contentItem.id, { onDelete: "cascade" }),
    questionId: integer("question_id")
      .notNull()
      .references(() => question.id, { onDelete: "cascade" }),
    selectedAnswerId: integer("selected_answer_id")
      .notNull()
      .references(() => questionAnswerOption.id, { onDelete: "cascade" }),
    isCorrect: boolean("is_correct").notNull(),
    answeredAt: timestamp("answered_at").notNull().defaultNow(),
    archivedAt: timestamp("archived_at"),
  },
  (t) => [
    uniqueIndex("content_practice_answer_current_unique")
      .on(t.userId, t.contentItemId, t.questionId)
      .where(sql`archived_at is null`),
    index("idx_content_practice_answer_question").on(t.questionId),
  ],
);
