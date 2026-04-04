import { boolean, char, index, integer, jsonb, pgTable, text, unique } from "drizzle-orm/pg-core";

export const question = pgTable(
  "question",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    content: text().notNull(),
    discussion: text().notNull(),
    contentJson: jsonb(),
    discussionJson: jsonb(),
    isFlashcardQuestion: boolean().notNull().default(true),
  },
  (t) => [index("idx_question_flashcard").on(t.isFlashcardQuestion)],
);

export const questionAnswerOption = pgTable(
  "question_answer_option",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    code: char({ length: 1 }).notNull(),
    questionId: integer()
      .notNull()
      .references(() => question.id, { onDelete: "cascade" }),
    content: text().notNull(),
    isCorrect: boolean().notNull().default(false),
  },
  (t) => [
    unique("question_answer_option_question_id_code_unique").on(t.questionId, t.code),
    index("idx_answer_option_question").on(t.questionId),
  ],
);
