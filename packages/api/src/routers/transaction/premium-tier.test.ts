import { describe, expect, test } from "bun:test";
import { DEFAULT_PREMIUM_TIER, resolvePremiumTierForUpdate, shouldBackfillPremiumTier } from "./premium-tier";

describe("shouldBackfillPremiumTier", () => {
  const now = new Date("2026-03-08T10:00:00.000Z");

  test("returns true for active premium user with null tier", () => {
    expect(
      shouldBackfillPremiumTier({
        isPremium: true,
        premiumTier: null,
        premiumExpiresAt: new Date("2026-03-09T10:00:00.000Z"),
        now,
      }),
    ).toBe(true);
  });

  test("returns false when premium has expired", () => {
    expect(
      shouldBackfillPremiumTier({
        isPremium: true,
        premiumTier: null,
        premiumExpiresAt: new Date("2026-03-07T10:00:00.000Z"),
        now,
      }),
    ).toBe(false);
  });

  test("returns false when user is not premium", () => {
    expect(
      shouldBackfillPremiumTier({
        isPremium: false,
        premiumTier: null,
        premiumExpiresAt: new Date("2026-03-09T10:00:00.000Z"),
        now,
      }),
    ).toBe(false);
  });
});

describe("resolvePremiumTierForUpdate", () => {
  const now = new Date("2026-03-08T10:00:00.000Z");

  test("defaults to premium for active premium user with null tier", () => {
    expect(
      resolvePremiumTierForUpdate({
        isPremium: true,
        premiumTier: null,
        premiumExpiresAt: new Date("2026-03-09T10:00:00.000Z"),
        now,
      }),
    ).toBe(DEFAULT_PREMIUM_TIER);
  });

  test("keeps null tier for non-premium user", () => {
    expect(
      resolvePremiumTierForUpdate({
        isPremium: false,
        premiumTier: null,
        premiumExpiresAt: new Date("2026-03-09T10:00:00.000Z"),
        now,
      }),
    ).toBeNull();
  });

  test("preserves explicit premium2 tier", () => {
    expect(
      resolvePremiumTierForUpdate({
        isPremium: true,
        premiumTier: "premium2",
        premiumExpiresAt: new Date("2026-03-09T10:00:00.000Z"),
        now,
      }),
    ).toBe("premium2");
  });

  test("does not overwrite tier when update omits premiumTier", () => {
    expect(
      resolvePremiumTierForUpdate({
        isPremium: false,
        premiumExpiresAt: null,
        now,
      }),
    ).toBeUndefined();
  });
});
