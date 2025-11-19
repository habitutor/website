import {
  boolean,
  integer,
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
  status: text("status"),
});

export const question = pgTable("question", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  content: text("content"),
  type: text("type").notNull(),
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

export const multipleChoiceAnswer = pgTable("multiple_choice_answer", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  questionId: integer("question_id")
    .notNull()
    .references(() => question.id, { onDelete: "cascade" }),
  content: text("content"),
  isCorrect: boolean("is_correct").default(false),
});

export const essayAnswer = pgTable("essay_answer", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  questionId: integer("question_id")
    .notNull()
    .references(() => question.id, { onDelete: "cascade" }),
  correctAnswer: text("correct_answer"),
});

export const questionResponse = pgTable("question_response", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  attemptId: integer("attempt_id")
    .notNull()
    .references(() => practicePackAttempt.id, { onDelete: "cascade" }),
  questionId: integer("question_id")
    .notNull()
    .references(() => question.id, { onDelete: "cascade" }),
  responseDataId: integer("response_data_id"),
});

export const mcqResponse = pgTable("mcq_response", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  selectedMcqId: integer("selected_mcq_id")
    .notNull()
    .references(() => multipleChoiceAnswer.id, { onDelete: "cascade" }),
  isCorrect: boolean("is_correct"),
});

export const essayResponse = pgTable("essay_response", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  essayInput: text("essay_input"),
  essayAnswerId: integer("essay_answer_id").references(() => essayAnswer.id, {
    onDelete: "set null",
  }),
  gradingStatus: text("grading_status"),
  isCorrect: boolean("is_correct"),
});
