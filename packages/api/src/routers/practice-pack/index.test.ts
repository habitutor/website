import { describe, expect, test } from "bun:test";
import { countFinishedPacks, normalizeHistoryPagination } from "./index";

describe("practice pack history helpers", () => {
  test("normalizes pagination bounds and defaults", () => {
    expect(normalizeHistoryPagination({})).toEqual({ limit: 20, offset: 0 });
    expect(normalizeHistoryPagination({ limit: 10, offset: 5 })).toEqual({ limit: 10, offset: 5 });
    expect(normalizeHistoryPagination({ limit: 999, offset: 0 })).toEqual({ limit: 100, offset: 0 });
  });

  test("counts finished attempts only", () => {
    expect(
      countFinishedPacks([
        { status: "finished" },
        { status: "ongoing" },
        { status: "finished" },
        { status: "not_started" },
      ]),
    ).toBe(2);
  });
});
