import type { DrizzleDatabase } from "@habitutor/db";
import { PREMIUM_PACKAGES, type PremiumPackageSlug } from "../../lib/constants";
import { applyPromoDiscount, PROMO_PAYMENT_WINDOW_MINUTES, PROMO_REJECTION_MESSAGES } from "./promo-pricing";
import { promoRepo } from "./promo-repo";
import { transactionRepo } from "./repo";

export type PromoQuote =
  | { ok: true; promoId: string; originalPrice: number; finalPrice: number }
  | { ok: false; message: string };

// With `lock: true` the promo row is locked (FOR UPDATE), so call it inside a
// db.transaction and pass that transaction as `db`.
// `preview: true` only judges the code. A payment the buyer already started for this
// package still quotes fine (so it stays resumable), and a pending payment elsewhere is
// reported at checkout, not here.
export async function quotePromo({
  db,
  code,
  slug,
  userId,
  lock = false,
  preview = false,
}: {
  db?: DrizzleDatabase;
  code: string;
  slug: PremiumPackageSlug;
  userId: string;
  lock?: boolean;
  preview?: boolean;
}): Promise<PromoQuote> {
  const product = await transactionRepo.getProductBySlug({ db, slug });
  if (!product) return { ok: false, message: PROMO_REJECTION_MESSAGES.wrong_package };

  const originalPrice = PREMIUM_PACKAGES[slug].NORMAL_PRICE;

  if (preview) {
    const promo = await promoRepo.getByCode({ db, code });
    const resumable = promo
      ? await transactionRepo.findResumablePromoPayment({
          db,
          userId,
          productId: product.id,
          promoCodeId: promo.id,
          orderedAfter: new Date(Date.now() - PROMO_PAYMENT_WINDOW_MINUTES * 60_000),
        })
      : undefined;
    if (promo && resumable) {
      const finalPrice = applyPromoDiscount(originalPrice, promo.discountType, promo.discountValue);
      return { ok: true, promoId: promo.id, originalPrice, finalPrice };
    }
  }

  const result = await promoRepo.validate({ db, code, productId: product.id, userId, lock, ignoreOwnPending: preview });
  if (!result.ok) return { ok: false, message: PROMO_REJECTION_MESSAGES[result.reason] };

  const finalPrice = applyPromoDiscount(originalPrice, result.promo.discountType, result.promo.discountValue);
  if (finalPrice < 1) return { ok: false, message: "Kode promo tidak bisa digunakan untuk paket ini." };

  return { ok: true, promoId: result.promo.id, originalPrice, finalPrice };
}
