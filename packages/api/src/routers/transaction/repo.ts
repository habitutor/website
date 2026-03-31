import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { user } from "@habitutor/db/schema/auth";
import { product, transaction } from "@habitutor/db/schema/transaction";
import { and, desc, eq, sql } from "drizzle-orm";
import { resolvePremiumTierForUpdate } from "./premium-tier";

export const transactionRepo = {
  getProductBySlug: async ({ db = defaultDb, slug }: { db?: DrizzleDatabase; slug: string }) => {
    const [prod] = await db.select().from(product).where(eq(product.slug, slug)).limit(1);
    return prod;
  },

	createTransaction: async ({
		db = defaultDb,
		id,
		productId,
		grossAmount,
		userId,
		referralCodeId,
	}: {
		db?: DrizzleDatabase;
		id: string;
		productId: string;
		grossAmount: string;
		userId: string;
		referralCodeId?: string;
	}) => {
		const [tx] = await db
			.insert(transaction)
			.values({
				id,
				productId,
				grossAmount,
				userId,
				referralCodeId,
			})
			.returning();
		return tx;
	},

  getTransactionWithProduct: async ({ db = defaultDb, orderId }: { db?: DrizzleDatabase; orderId: string }) => {
    const [result] = await db
      .select({
        tx: transaction,
        prodType: product.type,
        prodSlug: product.slug,
      })
      .from(transaction)
      .innerJoin(product, eq(transaction.productId, product.id))
      .where(eq(transaction.id, orderId))
      .limit(1);
    return result;
  },

  getLatestSuccessfulPremiumTierByUserId: async ({
    db = defaultDb,
    userId,
  }: {
    db?: DrizzleDatabase;
    userId: string;
  }) => {
    const [result] = await db
      .select({
        prodSlug: product.slug,
      })
      .from(transaction)
      .innerJoin(product, eq(transaction.productId, product.id))
      .where(and(eq(transaction.userId, userId), eq(transaction.status, "success"), eq(product.type, "subscription")))
      .orderBy(desc(transaction.paidAt), desc(transaction.orderedAt))
      .limit(1);

    if (result?.prodSlug === "premium" || result?.prodSlug === "premium2") {
      return result.prodSlug;
    }

    return null;
  },

  updateTransactionStatus: async ({
    db = defaultDb,
    orderId,
    status,
    paidAt,
  }: {
    db?: DrizzleDatabase;
    orderId: string;
    status: "success" | "failed" | "pending";
    paidAt?: Date;
  }) => {
    const [tx] = await db
      .update(transaction)
      .set({
        status,
        paidAt,
      })
      .where(eq(transaction.id, orderId))
      .returning();
    return tx;
  },

  updateUserPremium: async ({
    db = defaultDb,
    userId,
    isPremium,
    premiumTier,
    premiumExpiresAt,
  }: {
    db?: DrizzleDatabase;
    userId: string;
    isPremium: boolean;
    premiumTier?: "premium" | "premium2" | null;
    premiumExpiresAt: Date | null;
  }) => {
    const resolvedPremiumTier = resolvePremiumTierForUpdate({
      isPremium,
      premiumTier,
      premiumExpiresAt,
    });

    const updates = [
      sql`is_premium = ${isPremium}`,
      sql`premium_expires_at = ${premiumExpiresAt}`,
      sql`updated_at = now()`,
    ];

    if (resolvedPremiumTier !== undefined) {
      updates.push(sql`premium_tier = ${resolvedPremiumTier}`);
    }

    await db.execute(sql`UPDATE "user" SET ${sql.join(updates, sql`, `)} WHERE id = ${userId}`);

    const [updatedUser] = await db.select().from(user).where(eq(user.id, userId)).limit(1);
    return updatedUser;
  },

  getTransactionById: async ({ db = defaultDb, orderId }: { db?: DrizzleDatabase; orderId: string }) => {
    const txs = await db.select().from(transaction).where(eq(transaction.id, orderId)).limit(1);
    return txs[0];
  },
};
