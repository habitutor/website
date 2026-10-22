import { describe, expect, test } from "bun:test";
import { addMonthsUtc, resolveExpiryWithoutShortening } from "./premium-expiry";

describe("addMonthsUtc", () => {
  test("adds two calendar months", () => {
    expect(addMonthsUtc(new Date("2026-10-22T03:00:00.000Z"), 2).toISOString()).toBe("2026-12-22T03:00:00.000Z");
  });

  test("rolls over the year boundary", () => {
    expect(addMonthsUtc(new Date("2026-11-15T10:30:00.000Z"), 2).toISOString()).toBe("2027-01-15T10:30:00.000Z");
  });

  test("clamps to the last day of a shorter month", () => {
    expect(addMonthsUtc(new Date("2026-12-31T00:00:00.000Z"), 2).toISOString()).toBe("2027-02-28T00:00:00.000Z");
    expect(addMonthsUtc(new Date("2027-12-31T00:00:00.000Z"), 2).toISOString()).toBe("2028-02-29T00:00:00.000Z");
    expect(addMonthsUtc(new Date("2026-08-31T00:00:00.000Z"), 2).toISOString()).toBe("2026-10-31T00:00:00.000Z");
  });

  test("does not mutate the input date", () => {
    const input = new Date("2026-10-22T03:00:00.000Z");
    addMonthsUtc(input, 2);
    expect(input.toISOString()).toBe("2026-10-22T03:00:00.000Z");
  });

  test("is deterministic for the same paid-at (idempotent re-processing)", () => {
    const paidAt = new Date("2026-10-22T03:00:00.000Z");
    expect(addMonthsUtc(paidAt, 2).getTime()).toBe(addMonthsUtc(paidAt, 2).getTime());
  });
});

describe("resolveExpiryWithoutShortening", () => {
  const now = new Date("2026-10-22T00:00:00.000Z");
  const computed = new Date("2026-12-22T00:00:00.000Z");

  test("uses the computed expiry for a non-premium user", () => {
    expect(
      resolveExpiryWithoutShortening({
        computedExpiresAt: computed,
        currentIsPremium: false,
        currentExpiresAt: null,
        now,
      }),
    ).toEqual(computed);
  });

  test("keeps a longer active premium instead of shortening it", () => {
    const longer = new Date("2027-05-30T00:00:00.000Z");
    expect(
      resolveExpiryWithoutShortening({
        computedExpiresAt: computed,
        currentIsPremium: true,
        currentExpiresAt: longer,
        now,
      }),
    ).toEqual(longer);
  });

  test("ignores an already expired premium", () => {
    expect(
      resolveExpiryWithoutShortening({
        computedExpiresAt: computed,
        currentIsPremium: true,
        currentExpiresAt: new Date("2026-09-01T00:00:00.000Z"),
        now,
      }),
    ).toEqual(computed);
  });

  test("extends when the new expiry is later than the active one", () => {
    expect(
      resolveExpiryWithoutShortening({
        computedExpiresAt: computed,
        currentIsPremium: true,
        currentExpiresAt: new Date("2026-11-01T00:00:00.000Z"),
        now,
      }),
    ).toEqual(computed);
  });
});
