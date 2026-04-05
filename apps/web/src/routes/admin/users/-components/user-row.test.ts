import { describe, expect, test } from "bun:test";
import { getDisplayDate, getDisplayPhoneNumber, getDisplayReferralUsage, getDisplayRole } from "./user-row";

describe("user row display helpers", () => {
  test("falls back role to default user", () => {
    expect(getDisplayRole(null)).toBe("user");
    expect(getDisplayRole("admin")).toBe("admin");
  });

  test("normalizes referral usage and phone placeholders", () => {
    expect(getDisplayReferralUsage(null)).toBe(0);
    expect(getDisplayReferralUsage(12)).toBe(12);
    expect(getDisplayPhoneNumber(null)).toBe("N/A");
    expect(getDisplayPhoneNumber("08123")).toBe("08123");
  });

  test("formats dates consistently", () => {
    expect(getDisplayDate(new Date("2026-04-01T12:00:00.000Z"))).toBe("Apr 1, 2026");
  });
});
