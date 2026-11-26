import { describe, expect, test } from "bun:test";
import { formatMidtransStartTime, parseMidtransDate } from "./midtrans";

describe("formatMidtransStartTime", () => {
  test("formats the instant in WIB with a +0700 offset", () => {
    expect(formatMidtransStartTime(new Date("2026-11-23T03:00:00Z"))).toBe("2026-11-23 10:00:00 +0700");
  });

  test("rolls the date over when UTC is late in the day", () => {
    expect(formatMidtransStartTime(new Date("2026-11-23T20:05:09Z"))).toBe("2026-11-24 03:05:09 +0700");
  });
});

describe("parseMidtransDate", () => {
  test("reads a gateway timestamp as WIB, whatever the server time zone", () => {
    expect(parseMidtransDate("2026-10-31 23:23:32")?.toISOString()).toBe("2026-10-31T16:23:32.000Z");
  });

  test("keeps a late-month WIB payment inside its month", () => {
    expect(parseMidtransDate("2026-11-01 00:30:00")?.toISOString()).toBe("2026-10-31T17:30:00.000Z");
  });

  test("returns undefined for a missing or unreadable value", () => {
    expect(parseMidtransDate(undefined)).toBeUndefined();
    expect(parseMidtransDate("")).toBeUndefined();
    expect(parseMidtransDate("not a date")).toBeUndefined();
  });
});
