import type { user } from "@habitutor/db/schema/auth";

type UserSelect = typeof user.$inferSelect;

export function createTestUser(overrides?: Partial<UserSelect>): UserSelect {
	return {
		id: "test-user-id",
		name: "Test User",
		email: "test@example.com",
		emailVerified: true,
		image: null,
		createdAt: new Date(),
		updatedAt: new Date(),
		role: "user",
		isPremium: false,
		flashcardStreak: 0,
		lastCompletedFlashcardAt: null,
		premiumExpiresAt: null,
		...overrides,
	};
}

export function createPremiumTestUser(overrides?: Partial<UserSelect>): UserSelect {
	return createTestUser({
		id: "premium-user-id",
		isPremium: true,
		premiumExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
		...overrides,
	});
}

export function createAdminTestUser(overrides?: Partial<UserSelect>): UserSelect {
	return createTestUser({
		id: "admin-user-id",
		role: "admin",
		...overrides,
	});
}
