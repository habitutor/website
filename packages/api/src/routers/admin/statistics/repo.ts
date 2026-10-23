import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { user } from "@habitutor/db/schema/auth";
import { practicePack } from "@habitutor/db/schema/practice-pack";
import { question } from "@habitutor/db/schema/question";
import { tryoutFreemiumAccess } from "@habitutor/db/schema/freemium";
import { product, transaction } from "@habitutor/db/schema/transaction";
import { and, count, eq, inArray, isNotNull, sql } from "drizzle-orm";

export const adminStatisticsRepo = {
  /** Transaksi sukses + total pendapatan per produk, dikelompokkan berdasarkan slug. */
  getProductSales: async ({ db = defaultDb, slugs }: { db?: DrizzleDatabase; slugs: string[] }) => {
    return db
      .select({
        slug: product.slug,
        soldCount: count(),
        revenue: sql<number>`coalesce(sum(${transaction.grossAmount}), 0)::int`,
      })
      .from(transaction)
      .innerJoin(product, eq(transaction.productId, product.id))
      .where(and(eq(transaction.status, "success"), inArray(product.slug, slugs)))
      .groupBy(product.slug);
  },

  countFreemiumRequirementsCompleted: async ({ db = defaultDb }: { db?: DrizzleDatabase } = {}) => {
    const [row] = await db
      .select({ count: count() })
      .from(tryoutFreemiumAccess)
      .where(isNotNull(tryoutFreemiumAccess.requirementsCompletedAt));
    return row?.count ?? 0;
  },

  getStats: async ({ db = defaultDb }: { db?: DrizzleDatabase }) => {
    const [totalUsers] = await db.select({ count: count() }).from(user);
    const [totalPacks] = await db.select({ count: count() }).from(practicePack);
    const [totalQuestions] = await db.select({ count: count() }).from(question);

    return {
      totalUsers: totalUsers?.count ?? 0,
      totalPracticePacks: totalPacks?.count ?? 0,
      totalQuestions: totalQuestions?.count ?? 0,
    };
  },
};
