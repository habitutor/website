import type { Context } from "../../context";

type SessionUser = NonNullable<Context["session"]>["user"];
type SessionData = NonNullable<Context["session"]>;

type MockUser = Partial<SessionUser> & { id: string };

function createMockSession(user?: MockUser): SessionData {
	const defaultUser: MockUser = {
		id: "test-user-id",
		name: "Test User",
		email: "test@example.com",
		emailVerified: true,
		role: "user",
		isPremium: false,
		flashcardStreak: 0,
		lastCompletedFlashcardAt: undefined,
		premiumExpiresAt: undefined,
		createdAt: new Date(),
		updatedAt: new Date(),
		image: undefined,
		...user,
	};

	return {
		session: {
			id: "test-session-id",
			userId: defaultUser.id,
			expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
			token: "test-token",
			createdAt: new Date(),
			updatedAt: new Date(),
			ipAddress: undefined,
			userAgent: undefined,
		},
		user: defaultUser as SessionUser,
	};
}

export function createMockContext(user?: MockUser): Context {
	return { session: createMockSession(user) };
}

export function createPremiumMockContext(overrides?: Partial<MockUser>): Context {
	return createMockContext({
		id: "premium-user-id",
		isPremium: true,
		premiumExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
		...overrides,
	});
}

export function createAdminMockContext(overrides?: Partial<MockUser>): Context {
	return createMockContext({
		id: "admin-user-id",
		role: "admin",
		...overrides,
	});
}
