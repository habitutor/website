import { index, integer, pgEnum, pgTable, primaryKey, text, timestamp, unique } from "drizzle-orm/pg-core";
import { question, questionAnswerOption } from "./question";
import { user } from "./user";

export const practicePack = pgTable("practice_pack", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: text().notNull(),
  description: text(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date()),
});

export const practicePackStatus = pgEnum("practice_pack_status", ["not_started", "ongoing", "finished"]);

export const practicePackAttempt = pgTable(
  "practice_pack_attempt",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    practicePackId: integer()
      .notNull()
      .references(() => practicePack.id, { onDelete: "cascade" }),
    startedAt: timestamp("started_at").notNull().defaultNow(),
    completedAt: timestamp("completed_at"),
    status: practicePackStatus("practice_pack_status").notNull().default("ongoing"),
  },
  (t) => [
    unique("user_attempt").on(t.userId, t.practicePackId),
    index("idx_pp_attempt_user").on(t.userId),
    index("idx_pp_attempt_pack").on(t.practicePackId),
  ],
);

export const practicePackQuestions = pgTable(
  "practice_pack_questions",
  {
    practicePackId: integer()
      .notNull()
      .references(() => practicePack.id, { onDelete: "cascade" }),
    questionId: integer()
      .notNull()
      .references(() => question.id, { onDelete: "cascade" }),
    order: integer().default(1),
  },
  (table) => [primaryKey({ columns: [table.practicePackId, table.questionId] })],
);

// we can save the user's responses with the table below
export const practicePackUserAnswer = pgTable(
  "practice_pack_user_answer",
  {
    attemptId: integer()
      .notNull()
      .references(() => practicePackAttempt.id, { onDelete: "cascade" }),
    questionId: integer()
      .notNull()
      .references(() => question.id, { onDelete: "cascade" }),
    selectedAnswerId: integer()
      .notNull()
      .references(() => questionAnswerOption.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.attemptId, t.questionId] }), index("idx_pp_user_answer_attempt").on(t.attemptId)],
);
