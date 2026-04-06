import { type } from "arktype";

export const createFeedbackInputSchema = type({
  "category?": "'wrong_answer' | 'bug_in_question' | 'unclear_discussion' | 'missing_option' | 'other'",
  description: "string",
  "path?": "string",
  "questionId?": "number",
  "selectedAnswerId?": "number",
  "attemptId?": "number",
});

export const listFeedbackByUserInputSchema = type({
  "limit?": "number",
  "cursor?": "number",
});

export const listFeedbackForAdminInputSchema = type({
  "limit?": "number",
  "afterCursor?": "number",
  "beforeCursor?": "number",
  "status?": "'open' | 'in_review' | 'resolved' | 'dismissed'",
  "category?": "'wrong_answer' | 'bug_in_question' | 'unclear_discussion' | 'missing_option' | 'other'",
  "priority?": "'p0' | 'p1' | 'p2' | 'p3'",
});
