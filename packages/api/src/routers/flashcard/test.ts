import { describe, expect, test } from "bun:test";

import {
  countCorrectAnswers,
  isAttemptExpired,
  resolveAttemptAnswer,
  shouldBlockStartSession,
  shouldIncrementFlashcardStreak,
} from "./logic";

const GRACE_PERIOD_SECONDS = 5;

describe("flashcard start logic", () => {
  const today = new Date("2026-03-10T00:00:00.000Z");

  test("blocks free user with an attempt started today", () => {
    expect(
      shouldBlockStartSession({
        isPremium: false,
        today,
        latestAttempt: {
          startedAt: new Date("2026-03-10T02:00:00.000Z"),
          submittedAt: null,
        },
      }),
    ).toBe(true);
  });

  test("blocks premium user only when latest attempt is still ongoing", () => {
    expect(
      shouldBlockStartSession({
        isPremium: true,
        today,
        latestAttempt: {
          startedAt: new Date("2026-03-10T02:00:00.000Z"),
          submittedAt: null,
        },
      }),
    ).toBe(true);

    expect(
      shouldBlockStartSession({
        isPremium: true,
        today,
        latestAttempt: {
          startedAt: new Date("2026-03-10T02:00:00.000Z"),
          submittedAt: new Date("2026-03-10T02:10:00.000Z"),
        },
      }),
    ).toBe(false);
  });

  test("does not block when latest attempt is from a previous day", () => {
    expect(
      shouldBlockStartSession({
        isPremium: false,
        today,
        latestAttempt: {
          startedAt: new Date("2026-03-09T23:59:59.000Z"),
          submittedAt: null,
        },
      }),
    ).toBe(false);
  });
});

describe("flashcard submit logic", () => {
  test("marks attempt as expired only after grace period", () => {
    const deadline = new Date("2026-03-10T10:00:00.000Z");

    expect(
      isAttemptExpired({
        deadline,
        now: new Date("2026-03-10T10:00:04.000Z").getTime(),
        gracePeriodSeconds: GRACE_PERIOD_SECONDS,
      }),
    ).toBe(false);

    expect(
      isAttemptExpired({
        deadline,
        now: new Date("2026-03-10T10:00:06.000Z").getTime(),
        gracePeriodSeconds: GRACE_PERIOD_SECONDS,
      }),
    ).toBe(true);
  });

  test("increments streak only when user has not completed flashcard today", () => {
    const today = new Date("2026-03-10T00:00:00.000Z");

    expect(
      shouldIncrementFlashcardStreak({
        today,
        lastCompletedFlashcardAt: new Date("2026-03-09T22:00:00.000Z"),
      }),
    ).toBe(true);

    expect(
      shouldIncrementFlashcardStreak({
        today,
        lastCompletedFlashcardAt: new Date("2026-03-10T01:00:00.000Z"),
      }),
    ).toBe(false);
  });
});

describe("flashcard save logic", () => {
  test("returns scoring payload when user answer exists", () => {
    expect(
      resolveAttemptAnswer({
        answers: [
          { id: 1, isCorrect: false },
          { id: 2, isCorrect: true },
        ],
        userAnswerId: 1,
      }),
    ).toEqual({
      correctAnswerId: 2,
      userAnswerId: 1,
      isCorrect: false,
    });
  });

  test("returns undefined when user answer id is invalid", () => {
    expect(
      resolveAttemptAnswer({
        answers: [
          { id: 1, isCorrect: false },
          { id: 2, isCorrect: true },
        ],
        userAnswerId: 999,
      }),
    ).toBeUndefined();
  });
});

describe("flashcard result logic", () => {
  test("counts only correctly selected answers", () => {
    expect(
      countCorrectAnswers([
        { selectedAnswerId: 1, question: { answerOptions: [{ id: 1, isCorrect: true }] } },
        { selectedAnswerId: 2, question: { answerOptions: [{ id: 2, isCorrect: false }] } },
        { selectedAnswerId: 3, question: { answerOptions: [{ id: 3, isCorrect: true }] } },
      ]),
    ).toBe(2);
  });

  test("ignores unanswered and mismatched selections", () => {
    expect(
      countCorrectAnswers([
        { selectedAnswerId: null, question: { answerOptions: [{ id: 1, isCorrect: true }] } },
        { selectedAnswerId: 10, question: { answerOptions: [{ id: 1, isCorrect: true }] } },
        { selectedAnswerId: 2, question: { answerOptions: [{ id: 2, isCorrect: true }] } },
      ]),
    ).toBe(1);
  });
});
