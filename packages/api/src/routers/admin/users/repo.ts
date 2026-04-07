import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { user } from "@habitutor/db/schema/auth";
import { referralCode } from "@habitutor/db/schema/referral";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";

export const adminUserRepo = {
  list: async ({
    db = defaultDb,
    limit,
    afterCreatedAt,
    afterId,
    beforeCreatedAt,
    beforeId,
    search,
  }: {
    db?: DrizzleDatabase;
    limit: number;
    afterCreatedAt: Date | null;
    afterId: string | null;
    beforeCreatedAt: Date | null;
    beforeId: string | null;
    search: string;
  }) => {
    if (beforeCreatedAt && beforeId) {
      const items = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          referralUsage: referralCode.referralCount,
          phoneNumber: user.phoneNumber,
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
            sql`(${user.createdAt}, ${user.id}) > (${beforeCreatedAt}, ${beforeId})`,
          ),
        )
        .orderBy(asc(user.createdAt), asc(user.id))
        .limit(limit + 1);

      return items.reverse();
    }

    return db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        referralUsage: referralCode.referralCount,
        phoneNumber: user.phoneNumber,
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
          afterCreatedAt && afterId
            ? sql`(${user.createdAt}, ${user.id}) < (${afterCreatedAt}, ${afterId})`
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
