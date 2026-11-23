import { describe, expect, test } from "bun:test";
import { formatMidtransStartTime } from "./midtrans";

describe("formatMidtransStartTime", () => {
  test("formats the instant in WIB with a +0700 offset", () => {
    expect(formatMidtransStartTime(new Date("2026-11-23T03:00:00Z"))).toBe("2026-11-23 10:00:00 +0700");
  });

  test("rolls the date over when UTC is late in the day", () => {
    expect(formatMidtransStartTime(new Date("2026-11-23T20:05:09Z"))).toBe("2026-11-24 03:05:09 +0700");
  });
});
