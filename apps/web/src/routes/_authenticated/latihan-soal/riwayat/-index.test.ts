import { describe, expect, test } from "bun:test";
import { getAttemptStatusClassName, getAttemptStatusLabel } from "./index";

describe("riwayat status helpers", () => {
  test("maps status values to localized labels", () => {
    expect(getAttemptStatusLabel("finished")).toBe("Selesai");
    expect(getAttemptStatusLabel("ongoing")).toBe("Sedang Dikerjakan");
    expect(getAttemptStatusLabel("not_started")).toBe("Belum Dimulai");
  });

  test("maps status values to semantic color classes", () => {
    expect(getAttemptStatusClassName("finished")).toBe("text-green-600");
    expect(getAttemptStatusClassName("ongoing")).toBe("text-yellow-600");
    expect(getAttemptStatusClassName("not_started")).toBe("text-gray-600");
  });
});
