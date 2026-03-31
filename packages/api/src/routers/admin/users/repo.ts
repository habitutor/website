import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { user } from "@habitutor/db/schema/auth";
import { referralCode } from "@habitutor/db/schema/referral";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";

export const adminUserRepo = {
  list: async ({
    db = defaultDb,
    limit,
    cursorCreatedAt,
    cursorId,
    search,
  }: {
    db?: DrizzleDatabase;
    limit: number;
    cursorCreatedAt: Date | null;
    cursorId: string | null;
    search: string;
  }) => {
    return db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        referralUsage: referralCode.referralCount,
        isPremium: user.isPremium,
        premiumTier: user.premiumTier,
        premiumExpiresAt: user.premiumExpiresAt,
        createdAt: user.createdAt,
      })
      .from(user)
      .leftJoin(referralCode, eq(user.id, referralCode.userId))
      .where(
        and(
          search.length > 0 ? or(ilike(user.name, `%${search}%`), ilike(user.email, `%${search}%`)) : undefined,
          cursorCreatedAt && cursorId
            ? sql`(${user.createdAt}, ${user.id}) < (${cursorCreatedAt}, ${cursorId})`
            : undefined,
        ),
      )
      .orderBy(desc(user.createdAt), desc(user.id))
      .limit(limit + 1);
  },

  getById: async ({ db = defaultDb, id }: { db?: DrizzleDatabase; id: string }) => {
    const [u] = await db.select().from(user).where(eq(user.id, id)).limit(1);
    return u;
  },

  updatePremium: async ({
    db = defaultDb,
    id,
    isPremium,
    premiumTier,
    premiumExpiresAt,
  }: {
    db?: DrizzleDatabase;
    id: string;
    isPremium: boolean;
    premiumTier?: "premium" | "premium2" | null;
    premiumExpiresAt: Date | null;
  }) => {
    const [u] = await db
      .update(user)
      .set({
        isPremium,
        premiumTier: isPremium ? (premiumTier ?? "premium") : null,
        premiumExpiresAt,
      })
      .where(eq(user.id, id))
      .returning();
    return u;
  },
};
