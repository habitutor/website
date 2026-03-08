export const DEFAULT_PREMIUM_TIER = "premium" as const;

export type PremiumTier = "premium" | "premium2";

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

	if (premiumTier === "premium" || premiumTier === "premium2") {
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
