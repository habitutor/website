import { pgEnum, pgTable, timestamp, text, integer, index } from "drizzle-orm/pg-core";

export const feedbackStatusEnum = pgEnum("feedback_status", ["open", "in_review", "resolved", "dismissed"]);

export type FeedbackStatus = (typeof feedbackStatusEnum.enumValues)[number];

export const feedbackCategoryEnum = pgEnum("feedback_category", [
  "wrong_answer",
  "bug_in_question",
  "unclear_discussion",
  "missing_option",
  "other",
]);

export const feedbackPriorityEnum = pgEnum("feedback_priority", ["p0", "p1", "p2", "p3"]);

export const feedbackReport = pgTable(
  "feedback_report",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: text("user_id").notNull(),
    path: text(),
    questionId: integer("question_id"),
    category: feedbackCategoryEnum("category").notNull(),
    description: text().notNull(),
    status: feedbackStatusEnum("status").notNull().default("open"),
    priority: feedbackPriorityEnum("priority"),
    selectedAnswerId: integer("selected_answer_id"),
    attemptId: integer("attempt_id"),
    adminNotes: text("admin_notes"),
    resolvedBy: text("resolved_by"),
    resolvedAt: timestamp("resolved_at"),
    userSeenAt: timestamp("user_seen_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_feedback_user").on(table.userId),
    index("idx_feedback_status").on(table.status),
    index("idx_feedback_priority").on(table.priority),
    index("idx_feedback_created").on(table.createdAt),
  ],
);
