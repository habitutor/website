import { relations } from "drizzle-orm";
import {
	boolean,
	integer,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { question } from "./practice-pack";

export const subtest = pgTable("subtest", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	name: text().notNull(),
	shortName: text("short_name").notNull(),
	description: text(),
	order: integer().default(1),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const subtestContentType = pgEnum("subtest_content_type", [
	"materi",
	"tips_and_trick",
]);

export const subtestContent = pgTable("subtest_content", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	subtestId: integer("subtest_id")
		.notNull()
		.references(() => subtest.id, { onDelete: "cascade" }),
	type: subtestContentType("type").notNull(),
	title: text().notNull(),
	order: integer().default(1),
	videoUrl: text("video_url"),
	notes: text(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const subtestContentQuestions = pgTable(
	"subtest_content_questions",
	{
		subtestContentId: integer("subtest_content_id")
			.notNull()
			.references(() => subtestContent.id, { onDelete: "cascade" }),
		questionId: integer("question_id")
			.notNull()
			.references(() => question.id, { onDelete: "cascade" }),
		order: integer().default(1),
	},
	(t) => [primaryKey({ columns: [t.subtestContentId, t.questionId] })],
);

export const userSubtestProgress = pgTable(
	"user_subtest_progress",
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		subtestContentId: integer("subtest_content_id")
			.notNull()
			.references(() => subtestContent.id, { onDelete: "cascade" }),
		videoWatched: boolean("video_watched").default(false),
		notesRead: boolean("notes_read").default(false),
		quizCompleted: boolean("quiz_completed").default(false),
		quizScore: integer("quiz_score"),
		lastAccessedAt: timestamp("last_accessed_at").notNull().defaultNow(),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(t) => [unique("user_content_progress").on(t.userId, t.subtestContentId)],
);

export const userRecentSubtest = pgTable(
	"user_recent_subtest",
	{
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		subtestId: integer("subtest_id")
			.notNull()
			.references(() => subtest.id, { onDelete: "cascade" }),
		accessedAt: timestamp("accessed_at").notNull().defaultNow(),
	},
	(t) => [primaryKey({ columns: [t.userId, t.subtestId] })],
);

export const subtestRelations = relations(subtest, ({ many }) => ({
	contents: many(subtestContent),
	userRecentSubtests: many(userRecentSubtest),
}));

export const subtestContentRelations = relations(
	subtestContent,
	({ one, many }) => ({
		subtest: one(subtest, {
			fields: [subtestContent.subtestId],
			references: [subtest.id],
		}),
		questions: many(subtestContentQuestions),
		userProgress: many(userSubtestProgress),
	}),
);

export const subtestContentQuestionsRelations = relations(
	subtestContentQuestions,
	({ one }) => ({
		subtestContent: one(subtestContent, {
			fields: [subtestContentQuestions.subtestContentId],
			references: [subtestContent.id],
		}),
		question: one(question, {
			fields: [subtestContentQuestions.questionId],
			references: [question.id],
		}),
	}),
);

export const userSubtestProgressRelations = relations(
	userSubtestProgress,
	({ one }) => ({
		user: one(user, {
			fields: [userSubtestProgress.userId],
			references: [user.id],
		}),
		subtestContent: one(subtestContent, {
			fields: [userSubtestProgress.subtestContentId],
			references: [subtestContent.id],
		}),
	}),
);

export const userRecentSubtestRelations = relations(
	userRecentSubtest,
	({ one }) => ({
		user: one(user, {
			fields: [userRecentSubtest.userId],
			references: [user.id],
		}),
		subtest: one(subtest, {
			fields: [userRecentSubtest.subtestId],
			references: [subtest.id],
		}),
	}),
);
