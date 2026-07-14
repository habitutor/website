import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { user } from "@habitutor/db/schema/auth";
import { referralCode } from "@habitutor/db/schema/referral";
import { product, transaction } from "@habitutor/db/schema/transaction";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";

export const adminUserRepo = {
  listSubscriptionProducts: async ({ db = defaultDb }: { db?: DrizzleDatabase } = {}) => {
    return db
      .select({ name: product.name, slug: product.slug })
      .from(product)
      .where(eq(product.type, "subscription"))
      .orderBy(product.name);
  },

  list: async ({
    db = defaultDb,
    limit,
    cursorCreatedAt,
    cursorId,
    search,
    isPremium,
    packageSlug,
  }: {
    db?: DrizzleDatabase;
    limit: number;
    cursorCreatedAt: Date | null;
    cursorId: string | null;
    search: string;
    isPremium?: boolean;
    packageSlug?: string;
  }) => {
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
        packageSlug: sql<string | null>`(
					SELECT ${product.slug}
					FROM ${transaction}
					INNER JOIN ${product} ON ${transaction.productId} = ${product.id}
					WHERE ${transaction.userId} = ${user.id}
						AND ${transaction.status} = 'success'
						AND ${product.type} = 'subscription'
					ORDER BY ${transaction.paidAt} DESC NULLS LAST, ${transaction.orderedAt} DESC
					LIMIT 1
				)`,
        createdAt: user.createdAt,
      })
      .from(user)
      .leftJoin(referralCode, eq(user.id, referralCode.userId))
      .where(
        and(
          search.length > 0 ? or(ilike(user.name, `%${search}%`), ilike(user.email, `%${search}%`)) : undefined,
          isPremium === undefined ? undefined : eq(user.isPremium, isPremium),
          packageSlug
            ? sql`(
								SELECT ${product.slug}
								FROM ${transaction}
								INNER JOIN ${product} ON ${transaction.productId} = ${product.id}
								WHERE ${transaction.userId} = ${user.id}
									AND ${transaction.status} = 'success'
									AND ${product.type} = 'subscription'
								ORDER BY ${transaction.paidAt} DESC NULLS LAST, ${transaction.orderedAt} DESC
								LIMIT 1
							) = ${packageSlug}`
            : undefined,
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
