import { describe, expect, test } from "bun:test";
import { FAKE_PURCHASE_RECORDS, getActiveFakePurchase } from "./fake-recent-purchases";

describe("getActiveFakePurchase", () => {
  test("returns 100 hardcoded records", () => {
    expect(FAKE_PURCHASE_RECORDS).toHaveLength(100);
  });

  test("formats masked last name and major", () => {
    const purchase = getActiveFakePurchase(new Date("2026-07-13T10:00:00+07:00"));
    expect(purchase.message).toMatch(/^[A-Za-z]+ [A-Z]\*\*\* baru saja membeli paket belajar \(.+\)$/);
    expect(purchase.minutesAgo).toBeGreaterThan(0);
  });

  test("changes record order by day", () => {
    const dayOne = getActiveFakePurchase(new Date("2026-07-13T10:00:00+07:00"));
    const dayTwo = getActiveFakePurchase(new Date("2026-07-14T10:00:00+07:00"));
    expect(dayOne.message).not.toBe(dayTwo.message);
  });
});
