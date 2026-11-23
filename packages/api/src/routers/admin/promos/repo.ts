import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { product, promoCode, promoCodePackage, transaction } from "@habitutor/db/schema/transaction";
import { and, count, desc, eq, gt, inArray, or } from "drizzle-orm";
import { getPromoHoldCutoff } from "../../transaction/promo-pricing";

interface PromoValues {
  code: string;
  discountType: "fixed_price" | "percentage";
  discountValue: string;
  expiresAt: Date | null;
  perUserLimit: number;
  isActive: boolean;
}

interface PromoPackageInput {
  productId: string;
  usageLimit: number | null;
}

export const adminPromoRepo = {
  getById: async ({ db = defaultDb, id }: { db?: DrizzleDatabase; id: string }) => {
    const [result] = await db.select().from(promoCode).where(eq(promoCode.id, id)).limit(1);
    return result;
  },

  list: async ({ db = defaultDb, now = new Date() }: { db?: DrizzleDatabase; now?: Date } = {}) => {
    const promos = await db.select().from(promoCode).orderBy(desc(promoCode.createdAt));
    if (promos.length === 0) return [];

    const packageRows = await db
      .select({
        promoCodeId: promoCodePackage.promoCodeId,
        productId: promoCodePackage.productId,
        productName: product.name,
        productSlug: product.slug,
        usageLimit: promoCodePackage.usageLimit,
      })
      .from(promoCodePackage)
      .innerJoin(product, eq(promoCodePackage.productId, product.id))
      .where(
        inArray(
          promoCodePackage.promoCodeId,
          promos.map((promo) => promo.id),
        ),
      )
      .orderBy(product.name);

    // Same rule as the buyer-side quota: paid, or still inside the payment hold window.
    const usageRows = await db
      .select({
        promoCodeId: transaction.promoCodeId,
        productId: transaction.productId,
        usageCount: count(transaction.id),
      })
      .from(transaction)
      .where(
        and(
          inArray(
            transaction.promoCodeId,
            promos.map((promo) => promo.id),
          ),
          or(
            eq(transaction.status, "success"),
            and(eq(transaction.status, "pending"), gt(transaction.orderedAt, getPromoHoldCutoff(now))),
          ),
        ),
      )
      .groupBy(transaction.promoCodeId, transaction.productId);

    const usageByKey = new Map(usageRows.map((row) => [`${row.promoCodeId}:${row.productId}`, Number(row.usageCount)]));

    return promos.map((promo) => ({
      ...promo,
      packages: packageRows
        .filter((row) => row.promoCodeId === promo.id)
        .map((row) => ({
          productId: row.productId,
          productName: row.productName,
          productSlug: row.productSlug,
          usageLimit: row.usageLimit,
          usageCount: usageByKey.get(`${promo.id}:${row.productId}`) ?? 0,
        })),
    }));
  },

  create: async ({
    db = defaultDb,
    values,
    packages,
  }: {
    db?: DrizzleDatabase;
    values: PromoValues;
    packages: PromoPackageInput[];
  }) => {
    return db.transaction(async (tx) => {
      const [created] = await tx.insert(promoCode).values(values).returning();
      if (!created) throw new Error("Failed to create promo code");
      await tx.insert(promoCodePackage).values(packages.map((pkg) => ({ ...pkg, promoCodeId: created.id })));
      return created;
    });
  },

  update: async ({
    db = defaultDb,
    id,
    values,
    packages,
  }: {
    db?: DrizzleDatabase;
    id: string;
    values: Partial<PromoValues>;
    packages: PromoPackageInput[];
  }) => {
    return db.transaction(async (tx) => {
      const [updated] = await tx
        .update(promoCode)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(promoCode.id, id))
        .returning();
      await tx.delete(promoCodePackage).where(eq(promoCodePackage.promoCodeId, id));
      await tx.insert(promoCodePackage).values(packages.map((pkg) => ({ ...pkg, promoCodeId: id })));
      return updated;
    });
  },
};
