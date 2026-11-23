import type { DrizzleDatabase } from "@habitutor/db";
import { PREMIUM_PACKAGES, type PremiumPackageSlug } from "../../lib/constants";
import { applyPromoDiscount, PROMO_REJECTION_MESSAGES } from "./promo-pricing";
import { promoRepo } from "./promo-repo";
import { transactionRepo } from "./repo";

export type PromoQuote =
  | { ok: true; promoId: string; originalPrice: number; finalPrice: number }
  | { ok: false; message: string };

// With `lock: true` the promo row is locked (FOR UPDATE), so call it inside a
// db.transaction and pass that transaction as `db`.
export async function quotePromo({
  db,
  code,
  slug,
  userId,
  lock = false,
}: {
  db?: DrizzleDatabase;
  code: string;
  slug: PremiumPackageSlug;
  userId: string;
  lock?: boolean;
}): Promise<PromoQuote> {
  const product = await transactionRepo.getProductBySlug({ db, slug });
  if (!product) return { ok: false, message: PROMO_REJECTION_MESSAGES.wrong_package };

  const result = await promoRepo.validate({ db, code, productId: product.id, userId, lock });
  if (!result.ok) return { ok: false, message: PROMO_REJECTION_MESSAGES[result.reason] };

  const originalPrice = PREMIUM_PACKAGES[slug].NORMAL_PRICE;
  const finalPrice = applyPromoDiscount(originalPrice, result.promo.discountType, result.promo.discountValue);
  if (finalPrice < 1) return { ok: false, message: "Kode promo tidak bisa digunakan untuk paket ini." };

  return { ok: true, promoId: result.promo.id, originalPrice, finalPrice };
}
