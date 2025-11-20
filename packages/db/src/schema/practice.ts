import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const practicePack = pgTable("practice_pack", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
});

export const practicePackStatus = pgEnum("practice_pack_status", [
  "not_started",
  "ongoing",
  "finished",
]);

export const practicePackAttempt = pgTable("practice_pack_attempt", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "set null" }),
  practicePackId: integer("practice_pack_id")
    .notNull()
    .references(() => practicePack.id, { onDelete: "cascade" }),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  status: practicePackStatus("practice_pack_status")
    .notNull()
    .default("ongoing"),
});

export const practicePackQuestions = pgTable(
  "practice_pack_questions",
  {
    practicePackId: integer("practice_pack_id")
      .notNull()
      .references(() => practicePack.id, { onDelete: "cascade" }),
    questionId: integer("question_id")
      .notNull()
      .references(() => question.id, { onDelete: "cascade" }),
    order: integer("order"),
  },
  (table) => [
    primaryKey({ columns: [table.practicePackId, table.questionId] }),
  ],
);

export const question = pgTable("question", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  content: text("content"),
  type: text("type").notNull(),
});

export const questionAnswerOption = pgTable("question_answer_option", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  questionId: integer("question_id")
    .notNull()
    .references(() => question.id, { onDelete: "cascade" }),
  content: text("content"),
  isCorrect: boolean("is_correct").default(false),
});

// we can save the user's responses with the table below
export const practicePackUserAnswer = pgTable("practice_pack_user_answer", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  attemptId: integer("attempt_id")
    .notNull()
    .references(() => practicePackAttempt.id, { onDelete: "cascade" }),
  questionId: integer("question_id")
    .notNull()
    .references(() => question.id, { onDelete: "cascade" }),
  selectedAnswerId: integer("selected_answer_id")
    .notNull()
    .references(() => questionAnswerOption.id, { onDelete: "set null" }),
});
