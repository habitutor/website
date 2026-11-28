import { describe, expect, test } from "bun:test";
import { checkReport, DAILY_REPORT_LIMIT, normalizeReportNote } from "./report-logic";

describe("checkReport", () => {
  const base = { reportsToday: 0, questionsInAttempt: 5, answered: false };

  test("skips an unanswered question on the first report of a session", () => {
    expect(checkReport(base)).toEqual({ allowed: true, skip: true });
  });

  test("allows only one skip per session", () => {
    expect(checkReport({ ...base, questionsInAttempt: 4 })).toEqual({ allowed: true, skip: false });
  });

  test("never removes an answered question, so a wrong answer cannot be erased", () => {
    expect(checkReport({ ...base, answered: true })).toEqual({ allowed: true, skip: false });
  });

  test("stops after the daily limit", () => {
    expect(checkReport({ ...base, reportsToday: DAILY_REPORT_LIMIT })).toEqual({ allowed: false, skip: false });
  });
});

describe("normalizeReportNote", () => {
  test("trims, caps the length and turns blank into null", () => {
    expect(normalizeReportNote("  gambar hilang  ")).toBe("gambar hilang");
    expect(normalizeReportNote("   ")).toBeNull();
    expect(normalizeReportNote(undefined)).toBeNull();
    expect(normalizeReportNote("a".repeat(500))).toHaveLength(300);
  });
});
