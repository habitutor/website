import { describe, expect, test } from "bun:test";
import { isInvalidPracticeHistoryId, parsePracticeHistoryParams } from "./$id";

describe("practice history detail route helpers", () => {
  test("parses route params to number id", () => {
    expect(parsePracticeHistoryParams({ id: "42" })).toEqual({ id: 42 });
    expect(parsePracticeHistoryParams({ id: "not-a-number" })).toEqual({ id: Number.NaN });
  });

  test("detects invalid id values", () => {
    expect(isInvalidPracticeHistoryId(Number.NaN)).toBe(true);
    expect(isInvalidPracticeHistoryId(7)).toBe(false);
  });
});
