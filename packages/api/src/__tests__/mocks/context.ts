import type { Context } from "../../context";

type SessionUser = NonNullable<Context["session"]>["user"];
type SessionData = NonNullable<Context["session"]>;

type MockUser = Partial<SessionUser> & { id: string };

type SessionRole = NonNullable<SessionUser["role"]>;
type SessionBoolean = NonNullable<SessionUser["isPremium"]>;
type SessionFlashcardStreak = NonNullable<SessionUser["flashcardStreak"]>;

function createMockSession(user?: MockUser): SessionData {
  const defaultUser = {
    id: "test-user-id",
    name: "Test User",
    email: "test@example.com",
    emailVerified: true,
    role: "user" as SessionRole,
    isPremium: false as SessionBoolean,
    flashcardStreak: 0 as SessionFlashcardStreak,
    totalScore: 0,
    lastCompletedFlashcardAt: null,
    premiumExpiresAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    image: null,
  } as unknown as SessionUser;

  const mergedUser = {
    ...defaultUser,
    ...user,
  } as SessionUser;

  return {
    session: {
      id: "test-session-id",
      userId: defaultUser.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      token: "test-token",
      createdAt: new Date(),
      updatedAt: new Date(),
      ipAddress: null,
      userAgent: null,
    },
    user: mergedUser,
  } as SessionData;
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
