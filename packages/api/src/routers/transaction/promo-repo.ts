import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { promoCode, transaction } from "@habitutor/db/schema/transaction";
import { and, count, eq, inArray } from "drizzle-orm";

export type PromoValidationReason =
  | "not_found"
  | "inactive"
  | "expired"
  | "usage_limit_reached"
  | "already_used"
  | "wrong_package";

export const promoRepo = {
  getByCode: async ({ db = defaultDb, code, lock = false }: { db?: DrizzleDatabase; code: string; lock?: boolean }) => {
    const query = db.select().from(promoCode).where(eq(promoCode.code, code.trim().toUpperCase())).limit(1);
    const [result] = lock ? await query.for("update") : await query;
    return result;
  },

  validate: async ({
    db = defaultDb,
    code,
    productId,
    userId,
    lock = false,
  }: {
    db?: DrizzleDatabase;
    code: string;
    productId: string;
    userId: string;
    lock?: boolean;
  }) => {
    const promo = await promoRepo.getByCode({ db, code, lock });
    if (!promo) return { ok: false as const, reason: "not_found" as const };
    if (!promo.isActive) return { ok: false as const, reason: "inactive" as const };
    if (promo.expiresAt && promo.expiresAt.getTime() <= Date.now()) {
      return { ok: false as const, reason: "expired" as const };
    }
    if (promo.productId !== productId) return { ok: false as const, reason: "wrong_package" as const };

    const activeStatuses = ["pending", "success"] as const;
    const [totalUsage, userUsage] = await Promise.all([
      db
        .select({ total: count() })
        .from(transaction)
        .where(and(eq(transaction.promoCodeId, promo.id), inArray(transaction.status, activeStatuses))),
      db
        .select({ total: count() })
        .from(transaction)
        .where(
          and(
            eq(transaction.promoCodeId, promo.id),
            eq(transaction.userId, userId),
            inArray(transaction.status, activeStatuses),
          ),
        ),
    ]);

    if (promo.totalUsageLimit !== null && (totalUsage[0]?.total ?? 0) >= promo.totalUsageLimit) {
      return { ok: false as const, reason: "usage_limit_reached" as const };
    }
    if ((userUsage[0]?.total ?? 0) >= promo.perUserLimit) {
      return { ok: false as const, reason: "already_used" as const };
    }

    return { ok: true as const, promo };
  },
};

export function calculatePromoPrice(originalPrice: number, discountType: "fixed_price" | "percentage", value: string) {
  const numericValue = Number(value);
  if (discountType === "fixed_price") return Math.round(numericValue);
  return Math.max(0, Math.ceil(originalPrice * (1 - numericValue / 100)));
}
