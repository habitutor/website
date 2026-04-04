import { describe, expect, test } from "bun:test";
import {
  addAnswerOption,
  removeAnswerOption,
  updateAnswerOption,
  validateQuestionFormSubmission,
  type AnswerOption,
} from "./question-form";

function createAnswerOptions(overrides?: Partial<AnswerOption>[]): AnswerOption[] {
  const defaults: AnswerOption[] = [
    { code: "A", content: "Option A", isCorrect: true },
    { code: "B", content: "Option B", isCorrect: false },
  ];
  return defaults.map((option, index) => ({ ...option, ...(overrides?.[index] ?? {}) }));
}

describe("question-form helpers", () => {
  test("validateQuestionFormSubmission rejects invalid content payload", () => {
    const result = validateQuestionFormSubmission({ content: "not-an-object", discussion: {} }, createAnswerOptions());
    expect(result).toEqual({ ok: false, error: "Please fill all required fields" });
  });

  test("validateQuestionFormSubmission rejects empty answer content", () => {
    const result = validateQuestionFormSubmission(
      { content: {}, discussion: {} },
      createAnswerOptions([{ content: "   " }]),
    );
    expect(result).toEqual({ ok: false, error: "All answer options must have content" });
  });

  test("validateQuestionFormSubmission rejects when no correct answer is selected", () => {
    const result = validateQuestionFormSubmission(
      { content: {}, discussion: {} },
      createAnswerOptions([{ isCorrect: false }, { isCorrect: false }]),
    );
    expect(result).toEqual({ ok: false, error: "Please mark at least one answer as correct" });
  });

  test("validateQuestionFormSubmission rejects when fewer than two answers are provided", () => {
    const result = validateQuestionFormSubmission({ content: {}, discussion: {} }, [
      { code: "A", content: "Only option", isCorrect: true },
    ]);
    expect(result).toEqual({ ok: false, error: "Please add at least 2 answer options" });
  });

  test("validateQuestionFormSubmission accepts a valid payload", () => {
    const result = validateQuestionFormSubmission({ content: {}, discussion: {} }, createAnswerOptions());
    expect(result).toEqual({ ok: true });
  });

  test("addAnswerOption appends the next code while under the limit", () => {
    const result = addAnswerOption(createAnswerOptions());
    expect(result).toEqual({
      ok: true,
      answerOptions: [
        { code: "A", content: "Option A", isCorrect: true },
        { code: "B", content: "Option B", isCorrect: false },
        { code: "C", content: "", isCorrect: false },
      ],
    });
  });

  test("addAnswerOption rejects when option count is at maximum", () => {
    const fullSet: AnswerOption[] = [
      { code: "A", content: "A", isCorrect: true },
      { code: "B", content: "B", isCorrect: false },
      { code: "C", content: "C", isCorrect: false },
      { code: "D", content: "D", isCorrect: false },
      { code: "E", content: "E", isCorrect: false },
      { code: "F", content: "F", isCorrect: false },
      { code: "G", content: "G", isCorrect: false },
      { code: "H", content: "H", isCorrect: false },
      { code: "I", content: "I", isCorrect: false },
      { code: "J", content: "J", isCorrect: false },
    ];
    const result = addAnswerOption(fullSet);
    expect(result).toEqual({ ok: false, error: "Maximum 10 answer options allowed" });
  });

  test("removeAnswerOption rejects when dropping below minimum options", () => {
    const result = removeAnswerOption(createAnswerOptions(), 0);
    expect(result).toEqual({ ok: false, error: "Minimum 2 answer options required" });
  });

  test("removeAnswerOption removes target and reassigns codes sequentially", () => {
    const result = removeAnswerOption(
      [
        { code: "A", content: "First", isCorrect: false },
        { code: "B", content: "Second", isCorrect: true },
        { code: "C", content: "Third", isCorrect: false },
      ],
      0,
    );
    expect(result).toEqual({
      ok: true,
      answerOptions: [
        { code: "A", content: "Second", isCorrect: true },
        { code: "B", content: "Third", isCorrect: false },
      ],
    });
  });

  test("updateAnswerOption updates the requested field", () => {
    const updated = updateAnswerOption(createAnswerOptions(), 1, "content", "Updated");
    expect(updated[1]).toEqual({ code: "B", content: "Updated", isCorrect: false });
  });

  test("updateAnswerOption ignores out-of-range index", () => {
    const answerOptions = createAnswerOptions();
    const updated = updateAnswerOption(answerOptions, 42, "content", "Updated");
    expect(updated).toBe(answerOptions);
  });
});
