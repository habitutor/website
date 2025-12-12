import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { question, questionAnswerOption } from "./practice-pack";

export const userFlashcardQuestionAnswer = pgTable(
  "user_flashcard_question_answer",
  {
    assignedDate: date("assigned_date", { mode: "date" }).notNull(),
    questionId: integer("question_id")
      .notNull()
      .references(() => question.id, { onDelete: "cascade" }),
    selectedAnswerId: integer("selected_answer_id").references(
      () => questionAnswerOption.id,
      { onDelete: "set null" },
    ),
    attemptId: integer("attempt_id").references(() => userFlashcardAttempt.id, {
      onDelete: "set null",
    }),
    answeredAt: timestamp("answered_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.attemptId, t.assignedDate, t.questionId] })],
);

export const userFlashcardQuestionAnswerRelations = relations(
  userFlashcardQuestionAnswer,
  ({ one }) => ({
    question: one(question, {
      fields: [userFlashcardQuestionAnswer.questionId],
      references: [question.id],
    }),
    selectedAnswer: one(questionAnswerOption, {
      fields: [userFlashcardQuestionAnswer.selectedAnswerId],
      references: [questionAnswerOption.id],
    }),
  }),
);

export const userFlashcardAttempt = pgTable("user_flashcard_attempt", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  startedAt: timestamp().notNull().defaultNow(),
  deadline: timestamp().notNull(),
  submittedAt: timestamp(),
});

export const userFlashcardAttemptRelations = relations(
  userFlashcardAttempt,
  ({ one, many }) => ({
    user: one(user, {
      fields: [userFlashcardAttempt.userId],
      references: [user.id],
    }),
    assignedQuestions: many(userFlashcardQuestionAnswer),
  }),
);

export const userFlashcardStreak = pgTable("user_flashcard_streak", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  currentStreak: integer("current_streak").notNull().default(0),
  lastCompletedDate: date("last_completed_date"),
  lastCheckedDate: date("last_checked_date"),
  isActive: boolean("is_active").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userFlashcardStreakRelations = relations(
  userFlashcardStreak,
  ({ one }) => ({
    user: one(user, {
      fields: [userFlashcardStreak.userId],
      references: [user.id],
    }),
  }),
);
