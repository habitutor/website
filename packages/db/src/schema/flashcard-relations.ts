import { relations } from "drizzle-orm";
import { question, questionAnswerOption } from "./question";
import { user } from "./user";
import { userFlashcardAttempt, userFlashcardQuestionAnswer } from "./flashcard";

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

export const userFlashcardAttemptRelations = relations(userFlashcardAttempt, ({ one, many }) => ({
  user: one(user, {
    fields: [userFlashcardAttempt.userId],
    references: [user.id],
  }),
  assignedQuestions: many(userFlashcardQuestionAnswer),
}));
