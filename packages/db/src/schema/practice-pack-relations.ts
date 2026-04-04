import { relations } from "drizzle-orm";
import { question, questionAnswerOption } from "./question";
import { practicePack, practicePackQuestions } from "./practice-pack";

export const practicePackRelations = relations(practicePack, ({ many }) => ({
  questions: many(practicePackQuestions),
}));

export const practicePackQuestionsRelations = relations(practicePackQuestions, ({ one }) => ({
  practicePack: one(practicePack, {
    fields: [practicePackQuestions.practicePackId],
    references: [practicePack.id],
  }),
  question: one(question, {
    fields: [practicePackQuestions.questionId],
    references: [question.id],
  }),
}));

export const questionRelations = relations(question, ({ many }) => ({
  answerOptions: many(questionAnswerOption),
  practicePacks: many(practicePackQuestions),
}));

export const questionAnswerOptionRelations = relations(questionAnswerOption, ({ one }) => ({
  question: one(question, {
    fields: [questionAnswerOption.questionId],
    references: [question.id],
  }),
}));
