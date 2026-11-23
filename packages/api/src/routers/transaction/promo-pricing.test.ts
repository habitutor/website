import { describe, expect, it } from "bun:test";
import { applyPromoDiscount, evaluatePromo, getPromoHoldCutoff, type PromoFacts } from "./promo-pricing";

describe("applyPromoDiscount", () => {
  it("takes 70 percent off in whole rupiah", () => {
    expect(applyPromoDiscount(200_000, "percentage", "70")).toBe(60_000);
    expect(applyPromoDiscount(250_000, "percentage", "70")).toBe(75_000);
    expect(applyPromoDiscount(350_000, "percentage", "70")).toBe(105_000);
  });

  it("handles a full discount and fixed prices", () => {
    expect(applyPromoDiscount(200_000, "percentage", 100)).toBe(0);
    expect(applyPromoDiscount(200_000, "fixed_price", "150000")).toBe(150_000);
  });

  it("never raises the price above the base", () => {
    expect(applyPromoDiscount(200_000, "fixed_price", 300_000)).toBe(200_000);
  });
});

describe("getPromoHoldCutoff", () => {
  it("is 32 minutes before now", () => {
    expect(getPromoHoldCutoff(new Date("2026-11-23T10:32:00Z")).toISOString()).toBe("2026-11-23T10:00:00.000Z");
  });
});

describe("evaluatePromo", () => {
  const now = new Date("2026-11-23T10:00:00Z");
  const base: PromoFacts = {
    isActive: true,
    expiresAt: null,
    perUserLimit: 1,
    packageUsageLimit: 100,
    packageUsage: 0,
    userSuccess: 0,
    userHeldPending: 0,
    now,
  };

  it("accepts a valid promo", () => {
    expect(evaluatePromo(base)).toEqual({ ok: true });
  });

  it("rejects an inactive code", () => {
    expect(evaluatePromo({ ...base, isActive: false })).toEqual({ ok: false, reason: "inactive" });
  });

  it("rejects an expired code", () => {
    expect(evaluatePromo({ ...base, expiresAt: new Date("2026-11-23T09:59:59Z") })).toEqual({
      ok: false,
      reason: "expired",
    });
  });

  it("rejects a package the code does not cover", () => {
    expect(evaluatePromo({ ...base, packageUsageLimit: undefined })).toEqual({ ok: false, reason: "wrong_package" });
  });

  it("rejects when the package quota is used up", () => {
    expect(evaluatePromo({ ...base, packageUsage: 100 })).toEqual({ ok: false, reason: "usage_limit_reached" });
  });

  it("ignores usage when the package has no limit", () => {
    expect(evaluatePromo({ ...base, packageUsageLimit: null, packageUsage: 5000 })).toEqual({ ok: true });
  });

  it("rejects a user who already used it", () => {
    expect(evaluatePromo({ ...base, userSuccess: 1 })).toEqual({ ok: false, reason: "already_used" });
  });

  it("rejects a user with a payment in progress", () => {
    expect(evaluatePromo({ ...base, userSuccess: 0, userHeldPending: 1 })).toEqual({
      ok: false,
      reason: "payment_in_progress",
    });
  });
});
