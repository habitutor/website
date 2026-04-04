import { PREMIUM_TIERS, type PremiumTier, isPremiumTier } from "@habitutor/shared";

export const DEFAULT_PREMIUM_TIER = PREMIUM_TIERS.PREMIUM;

export function shouldBackfillPremiumTier({
  isPremium,
  premiumTier,
  premiumExpiresAt,
  now = new Date(),
}: {
  isPremium: boolean;
  premiumTier?: PremiumTier | null;
  premiumExpiresAt: Date | null;
  now?: Date;
}) {
  return isPremium && premiumTier == null && premiumExpiresAt !== null && premiumExpiresAt.getTime() > now.getTime();
}

export function resolvePremiumTierForUpdate({
  isPremium,
  premiumTier,
  premiumExpiresAt,
  now = new Date(),
}: {
  isPremium: boolean;
  premiumTier?: PremiumTier | null;
  premiumExpiresAt: Date | null;
  now?: Date;
}) {
  if (!isPremium) {
    return premiumTier === undefined ? undefined : null;
  }

  if (isPremiumTier(premiumTier)) {
    return premiumTier;
  }

  if (
    shouldBackfillPremiumTier({
      isPremium,
      premiumTier,
      premiumExpiresAt,
      now,
    })
  ) {
    return DEFAULT_PREMIUM_TIER;
  }

  return premiumTier;
}
