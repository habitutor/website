import { describe, expect, test } from "bun:test";
import { getTableName } from "drizzle-orm";
import {
  practicePack,
  practicePackAttempt,
  practicePackQuestions,
  practicePackStatus,
  practicePackUserAnswer,
} from "./practice-pack";
import { question, questionAnswerOption } from "./question";
import { contentItem, subtest } from "./subtest";
import { user } from "./user";

describe("schema contract boundaries", () => {
  test("keeps stable learning-domain table names", () => {
    expect(getTableName(practicePack)).toBe("practice_pack");
    expect(getTableName(practicePackAttempt)).toBe("practice_pack_attempt");
    expect(getTableName(practicePackQuestions)).toBe("practice_pack_questions");
    expect(getTableName(practicePackUserAnswer)).toBe("practice_pack_user_answer");
  });

  test("keeps expected status enum values for practice pack attempts", () => {
    expect(practicePackStatus.enumValues).toEqual(["not_started", "ongoing", "finished"]);
  });

  test("keeps required cross-table columns for practice and question linkage", () => {
    expect("practicePackId" in practicePackQuestions).toBe(true);
    expect("questionId" in practicePackQuestions).toBe(true);
    expect("selectedAnswerId" in practicePackUserAnswer).toBe(true);

    expect("questionId" in questionAnswerOption).toBe(true);
    expect("subtestId" in contentItem).toBe(true);
    expect("isFlashcardQuestion" in question).toBe(true);
    expect("id" in subtest).toBe(true);
    expect("id" in user).toBe(true);
  });
});
