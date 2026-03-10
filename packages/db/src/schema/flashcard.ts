import { relations, sql } from "drizzle-orm";
import { date, index, integer, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "#schema/auth";
import { question, questionAnswerOption } from "#schema/practice-pack";

export const userFlashcardQuestionAnswer = pgTable(
	"user_flashcard_question_answer",
	{
		assignedDate: date({ mode: "date" }).notNull(),
		questionId: integer()
			.notNull()
			.references(() => question.id, { onDelete: "cascade" }),
		selectedAnswerId: integer().references(() => questionAnswerOption.id, { onDelete: "set null" }),
		attemptId: integer().references(() => userFlashcardAttempt.id, {
			onDelete: "set null",
		}),
		answeredAt: timestamp(),
		createdAt: timestamp().notNull().defaultNow(),
	},
	(t) => [
		primaryKey({ columns: [t.attemptId, t.assignedDate, t.questionId] }),
		index("idx_flashcard_answer_attempt").on(t.attemptId),
	],
);

export const userFlashcardQuestionAnswerRelations = relations(userFlashcardQuestionAnswer, ({ one }) => ({
	question: one(question, {
		fields: [userFlashcardQuestionAnswer.questionId],
		references: [question.id],
	}),
	selectedAnswer: one(questionAnswerOption, {
		fields: [userFlashcardQuestionAnswer.selectedAnswerId],
		references: [questionAnswerOption.id],
	}),
	attempt: one(userFlashcardAttempt, {
		fields: [userFlashcardQuestionAnswer.attemptId],
		references: [userFlashcardAttempt.id],
	}),
}));

export const userFlashcardAttempt = pgTable(
	"user_flashcard_attempt",
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		userId: text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		date: date({ mode: "date" }).notNull().default(sql`CURRENT_DATE`),
		startedAt: timestamp().notNull().defaultNow(),
		deadline: timestamp().notNull(),
		submittedAt: timestamp(),
	},
	(t) => [
		index("idx_flashcard_attempt_user").on(t.userId),
		index("idx_flashcard_attempt_user_started").on(t.userId, t.startedAt),
	],
);

export const userFlashcardAttemptRelations = relations(userFlashcardAttempt, ({ one, many }) => ({
	user: one(user, {
		fields: [userFlashcardAttempt.userId],
		references: [user.id],
	}),
	assignedQuestions: many(userFlashcardQuestionAnswer),
}));
