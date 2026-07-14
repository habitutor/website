import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { user } from "@habitutor/db/schema/auth";
import { product, transaction } from "@habitutor/db/schema/transaction";
import { and, count, desc, eq, ne, sql } from "drizzle-orm";
import { resolvePremiumTierForUpdate } from "./premium-tier";

export const transactionRepo = {
  getProductBySlug: async ({ db = defaultDb, slug }: { db?: DrizzleDatabase; slug: string }) => {
    const [prod] = await db.select().from(product).where(eq(product.slug, slug)).limit(1);
    return prod;
  },

  getProductById: async ({ db = defaultDb, id }: { db?: DrizzleDatabase; id: string }) => {
    const [prod] = await db.select().from(product).where(eq(product.id, id)).limit(1);
    return prod;
  },

  countSuccessfulTransactionsBySlug: async ({ db = defaultDb, slug }: { db?: DrizzleDatabase; slug: string }) => {
    const [result] = await db
      .select({ total: count() })
      .from(transaction)
      .innerJoin(product, eq(transaction.productId, product.id))
      .where(and(eq(product.slug, slug), eq(transaction.status, "success"), eq(transaction.isSimulation, false)));
    return result?.total ?? 0;
  },

  createTransaction: async ({
    db = defaultDb,
    id,
    productId,
    grossAmount,
    userId,
    referralCodeId,
    promoCodeId,
    isSimulation = false,
  }: {
    db?: DrizzleDatabase;
    id: string;
    productId: string;
    grossAmount: string;
    userId: string;
    referralCodeId?: string;
    promoCodeId?: string;
    isSimulation?: boolean;
  }) => {
    const [tx] = await db
      .insert(transaction)
      .values({
        id,
        productId,
        grossAmount,
        userId,
        referralCodeId,
        promoCodeId,
        isSimulation,
      })
      .returning();
    return tx;
  },

  getTransactionWithProduct: async ({
    db = defaultDb,
    orderId,
    lock = false,
  }: {
    db?: DrizzleDatabase;
    orderId: string;
    lock?: boolean;
  }) => {
    const query = db
      .select({
        tx: transaction,
        prodType: product.type,
        prodSlug: product.slug,
      })
      .from(transaction)
      .innerJoin(product, eq(transaction.productId, product.id))
      .where(eq(transaction.id, orderId))
      .limit(1);
    const [result] = lock ? await query.for("update") : await query;
    return result;
  },

  getLatestSuccessfulSubscriptionByUserId: async ({
    db = defaultDb,
    userId,
    excludeOrderId,
  }: {
    db?: DrizzleDatabase;
    userId: string;
    excludeOrderId?: string;
  }) => {
    const [result] = await db
      .select({
        prodSlug: product.slug,
      })
      .from(transaction)
      .innerJoin(product, eq(transaction.productId, product.id))
      .where(
        and(
          eq(transaction.userId, userId),
          eq(transaction.status, "success"),
          eq(product.type, "subscription"),
          excludeOrderId ? ne(transaction.id, excludeOrderId) : undefined,
        ),
      )
      .orderBy(desc(transaction.paidAt), desc(transaction.orderedAt))
      .limit(1);

    return result ?? null;
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

  getLatestPendingSubscriptionByUserId: async ({
    db = defaultDb,
    userId,
  }: {
    db?: DrizzleDatabase;
    userId: string;
  }) => {
    const [result] = await db
      .select({
        id: transaction.id,
        orderedAt: transaction.orderedAt,
      })
      .from(transaction)
      .innerJoin(product, eq(transaction.productId, product.id))
      .where(and(eq(transaction.userId, userId), eq(transaction.status, "pending"), eq(product.type, "subscription")))
      .orderBy(desc(transaction.orderedAt))
      .limit(1);

    return result ?? null;
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
        updatedAt: new Date(),
      })
      .where(eq(transaction.id, orderId))
      .returning();
    return tx;
  },

  updateGatewayMetadata: async ({
    db = defaultDb,
    orderId,
    gatewayTransactionId,
    gatewayStatus,
    paymentType,
    fraudStatus,
    statusCode,
  }: {
    db?: DrizzleDatabase;
    orderId: string;
    gatewayTransactionId?: string;
    gatewayStatus?: string;
    paymentType?: string;
    fraudStatus?: string;
    statusCode?: string;
  }) => {
    const [tx] = await db
      .update(transaction)
      .set({
        gatewayTransactionId,
        gatewayStatus,
        paymentType,
        fraudStatus,
        statusCode,
        updatedAt: new Date(),
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
