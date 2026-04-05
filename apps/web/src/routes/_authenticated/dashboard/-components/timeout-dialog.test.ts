import { describe, expect, test } from "bun:test";
import { finishFlashcardTimeout } from "./timeout-dialog";

describe("finishFlashcardTimeout", () => {
  test("closes dialog and navigates to flashcard result route", () => {
    const openStates: boolean[] = [];
    const navigateCalls: Array<{ to: "/dashboard/flashcard/result" }> = [];

    finishFlashcardTimeout({
      onOpenChange: (open) => openStates.push(open),
      navigate: (args) => navigateCalls.push(args),
    });

    expect(openStates).toEqual([false]);
    expect(navigateCalls).toEqual([{ to: "/dashboard/flashcard/result" }]);
  });
});
