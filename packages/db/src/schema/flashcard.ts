import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { question, questionAnswerOption } from "./practice-pack";

export const userFlashcard = pgTable("user_flashcard", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  questionId: integer("question_id")
    .notNull()
    .references(() => question.id, { onDelete: "cascade" }),
  assignedDate: date("assigned_date").notNull(),
  answeredAt: timestamp("answered_at"),
  selectedAnswerId: integer("selected_answer_id").references(
    () => questionAnswerOption.id,
    { onDelete: "set null" }
  ),
  isCorrect: boolean("is_correct"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

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

// Relations
export const userFlashcardRelations = relations(userFlashcard, ({ one }) => ({
  user: one(user, {
    fields: [userFlashcard.userId],
    references: [user.id],
  }),
  question: one(question, {
    fields: [userFlashcard.questionId],
    references: [question.id],
  }),
  selectedAnswer: one(questionAnswerOption, {
    fields: [userFlashcard.selectedAnswerId],
    references: [questionAnswerOption.id],
  }),
}));

export const userFlashcardStreakRelations = relations(
  userFlashcardStreak,
  ({ one }) => ({
    user: one(user, {
      fields: [userFlashcardStreak.userId],
      references: [user.id],
    }),
  })
);
