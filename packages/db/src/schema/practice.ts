import {
	boolean,
	integer,
	pgTable,
	primaryKey,
	serial,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

//Practice Pack
export const practicePack = pgTable("practice_pack", {
	id: serial("id").primaryKey(),
	title: text("title").notNull(),
});

//Practice Pack Attempt
export const practicePackAttempt = pgTable("practice_pack_attempt", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	practicePackId: integer("practice_pack_id")
		.notNull()
		.references(() => practicePack.id, { onDelete: "cascade" }),
	startedAt: timestamp("started_at"),
	completedAt: timestamp("completed_at"),
	status: text("status"),
});

//Question
export const question = pgTable("question", {
	id: serial("id").primaryKey(),
	content: text("content"),
	type: text("type").notNull(),
});

//Practice Pack Questions
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
	(table) => ({
		pk: primaryKey({ columns: [table.practicePackId, table.questionId] }),
	}),
);

//Question Response
export const questionResponse = pgTable("question_response", {
	id: uuid("id").primaryKey().defaultRandom(),
	attemptId: uuid("attempt_id")
		.notNull()
		.references(() => practicePackAttempt.id, { onDelete: "cascade" }),
	questionId: integer("question_id")
		.notNull()
		.references(() => question.id, { onDelete: "cascade" }),
	responseDataId: uuid("response_data_id"),
});

//Multiple Choice Answer
export const multipleChoiceAnswer = pgTable("multiple_choice_answer", {
	id: serial("id").primaryKey(),
	questionId: integer("question_id")
		.notNull()
		.references(() => question.id, { onDelete: "cascade" }),
	content: text("content"),
	isCorrect: boolean("is_correct").default(false),
});

//MCQ Response
export const mcqResponse = pgTable("mcq_response", {
	id: uuid("id").primaryKey().defaultRandom(),
	selectedMcqId: integer("selected_mcq_id")
		.notNull()
		.references(() => multipleChoiceAnswer.id, { onDelete: "cascade" }),
	isCorrect: boolean("is_correct"),
});

//Essay Answer
export const essayAnswer = pgTable("essay_answer", {
	id: serial("id").primaryKey(),
	questionId: integer("question_id")
		.notNull()
		.references(() => question.id, { onDelete: "cascade" }),
	correctAnswer: text("correct_answer"),
});

//Essay Response
export const essayResponse = pgTable("essay_response", {
	id: uuid("id").primaryKey().defaultRandom(),
	essayInput: text("essay_input"),
	essayAnswerId: integer("essay_answer_id").references(() => essayAnswer.id, {
		onDelete: "set null",
	}),
	gradingStatus: text("grading_status"),
	isCorrect: boolean("is_correct"),
});
