import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { promoCode, promoCodePackage, transaction } from "@habitutor/db/schema/transaction";
import { and, count, eq, gt, or } from "drizzle-orm";
import { evaluatePromo, getPromoHoldCutoff, type PromoRejection } from "./promo-pricing";

type PromoCodeRow = typeof promoCode.$inferSelect;

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
    now = new Date(),
    lock = false,
    ignoreOwnPending = false,
  }: {
    db?: DrizzleDatabase;
    code: string;
    productId: string;
    userId: string;
    now?: Date;
    lock?: boolean;
    // Preview only judges the code itself; a payment the buyer already started is dealt with at checkout.
    ignoreOwnPending?: boolean;
  }): Promise<{ ok: true; promo: PromoCodeRow } | { ok: false; reason: PromoRejection }> => {
    const promo = await promoRepo.getByCode({ db, code, lock });
    if (!promo) return { ok: false, reason: "not_found" };

    const [packageRow] = await db
      .select({ usageLimit: promoCodePackage.usageLimit })
      .from(promoCodePackage)
      .where(and(eq(promoCodePackage.promoCodeId, promo.id), eq(promoCodePackage.productId, productId)))
      .limit(1);

    const holdCutoff = getPromoHoldCutoff(now);
    const isSuccess = eq(transaction.status, "success");
    const isHeldPending = and(eq(transaction.status, "pending"), gt(transaction.orderedAt, holdCutoff));
    const holdsQuota = or(isSuccess, isHeldPending);

    const [packageUsage, userSuccess, userHeldPending] = await Promise.all([
      db
        .select({ total: count() })
        .from(transaction)
        .where(and(eq(transaction.promoCodeId, promo.id), eq(transaction.productId, productId), holdsQuota)),
      db
        .select({ total: count() })
        .from(transaction)
        .where(and(eq(transaction.promoCodeId, promo.id), eq(transaction.userId, userId), isSuccess)),
      db
        .select({ total: count() })
        .from(transaction)
        .where(and(eq(transaction.promoCodeId, promo.id), eq(transaction.userId, userId), isHeldPending)),
    ]);

    const verdict = evaluatePromo({
      isActive: promo.isActive,
      expiresAt: promo.expiresAt,
      perUserLimit: promo.perUserLimit,
      packageUsageLimit: packageRow ? packageRow.usageLimit : undefined,
      packageUsage: packageUsage[0]?.total ?? 0,
      userSuccess: userSuccess[0]?.total ?? 0,
      userHeldPending: ignoreOwnPending ? 0 : (userHeldPending[0]?.total ?? 0),
      now,
    });
    if (!verdict.ok) return { ok: false, reason: verdict.reason };

    return { ok: true, promo };
  },
};
