import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { product, promoCode, transaction } from "@habitutor/db/schema/transaction";
import { and, count, desc, eq, inArray } from "drizzle-orm";

interface PromoValues {
  code: string;
  productId: string;
  discountType: "fixed_price" | "percentage";
  discountValue: string;
  expiresAt: Date | null;
  totalUsageLimit: number | null;
  perUserLimit: number;
  isActive: boolean;
}

export const adminPromoRepo = {
  getById: async ({ db = defaultDb, id }: { db?: DrizzleDatabase; id: string }) => {
    const [result] = await db.select().from(promoCode).where(eq(promoCode.id, id)).limit(1);
    return result;
  },

  list: async ({ db = defaultDb }: { db?: DrizzleDatabase } = {}) => {
    return db
      .select({
        id: promoCode.id,
        code: promoCode.code,
        productId: promoCode.productId,
        productName: product.name,
        productSlug: product.slug,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
        expiresAt: promoCode.expiresAt,
        totalUsageLimit: promoCode.totalUsageLimit,
        perUserLimit: promoCode.perUserLimit,
        isActive: promoCode.isActive,
        createdAt: promoCode.createdAt,
        usageCount: count(transaction.id),
      })
      .from(promoCode)
      .innerJoin(product, eq(promoCode.productId, product.id))
      .leftJoin(
        transaction,
        and(eq(transaction.promoCodeId, promoCode.id), inArray(transaction.status, ["pending", "success"] as const)),
      )
      .groupBy(promoCode.id, product.id)
      .orderBy(desc(promoCode.createdAt));
  },

  create: async ({ db = defaultDb, values }: { db?: DrizzleDatabase; values: PromoValues }) => {
    const [created] = await db.insert(promoCode).values(values).returning();
    return created;
  },

  update: async ({
    db = defaultDb,
    id,
    values,
  }: {
    db?: DrizzleDatabase;
    id: string;
    values: Partial<PromoValues>;
  }) => {
    const [updated] = await db
      .update(promoCode)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(promoCode.id, id))
      .returning();
    return updated;
  },
};
