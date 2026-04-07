import { type } from "arktype";
import { createInsertSchema, createSelectSchema } from "drizzle-arktype";
import {
  feedbackCategoryEnum,
  feedbackPriorityEnum,
  feedbackReport,
  feedbackStatusEnum,
} from "@habitutor/db/schema/feedback";

export const category = createSelectSchema(feedbackCategoryEnum);
export const status = createSelectSchema(feedbackStatusEnum);
export const priority = createSelectSchema(feedbackPriorityEnum);

export const createFeedbackInputSchema = createInsertSchema(feedbackReport).pick(
  "category",
  "description",
  "path",
  "questionId",
  "selectedAnswerId",
  "attemptId",
);

export const listFeedbackByUserInputSchema = type({
  "limit?": "number",
  "after?": "number",
});

export const listFeedbackForAdminInputSchema = type({
  "limit?": "number",
  "after?": "number",
  "before?": "number",
  "status?": status,
  "category?": category,
  "priority?": priority,
});
