export const PROMO_PAYMENT_WINDOW_MINUTES = 30;
export const PROMO_SLOT_GRACE_MINUTES = 2;
export const PROMO_SLOT_HOLD_MINUTES = PROMO_PAYMENT_WINDOW_MINUTES + PROMO_SLOT_GRACE_MINUTES;

export function getPromoHoldCutoff(now: Date): Date {
  return new Date(now.getTime() - PROMO_SLOT_HOLD_MINUTES * 60_000);
}

export function applyPromoDiscount(
  basePrice: number,
  discountType: "fixed_price" | "percentage",
  discountValue: string | number,
): number {
  const value = Number(discountValue);
  if (discountType === "fixed_price") {
    return Math.max(0, Math.min(basePrice, Math.round(value)));
  }
  return Math.max(0, Math.round((basePrice * (100 - value)) / 100));
}

export type PromoRejection =
  | "not_found"
  | "inactive"
  | "expired"
  | "wrong_package"
  | "usage_limit_reached"
  | "already_used"
  | "payment_in_progress";

export type PromoFacts = {
  isActive: boolean;
  expiresAt: Date | null;
  perUserLimit: number;
  packageUsageLimit: number | null | undefined;
  packageUsage: number;
  userSuccess: number;
  userHeldPending: number;
  now: Date;
};

export function evaluatePromo(facts: PromoFacts): { ok: true } | { ok: false; reason: PromoRejection } {
  if (!facts.isActive) return { ok: false, reason: "inactive" };
  if (facts.expiresAt && facts.expiresAt.getTime() <= facts.now.getTime()) return { ok: false, reason: "expired" };
  if (facts.packageUsageLimit === undefined) return { ok: false, reason: "wrong_package" };
  if (facts.packageUsageLimit !== null && facts.packageUsage >= facts.packageUsageLimit) {
    return { ok: false, reason: "usage_limit_reached" };
  }
  if (facts.userSuccess >= facts.perUserLimit) return { ok: false, reason: "already_used" };
  if (facts.userSuccess + facts.userHeldPending >= facts.perUserLimit) {
    return { ok: false, reason: "payment_in_progress" };
  }
  return { ok: true };
}

export const PROMO_REJECTION_MESSAGES: Record<PromoRejection, string> = {
  not_found: "Kode promo tidak ditemukan.",
  inactive: "Kode promo sudah tidak aktif.",
  expired: "Kode promo sudah kedaluwarsa.",
  wrong_package: "Kode promo tidak berlaku untuk paket ini.",
  usage_limit_reached: "Kuota kode promo untuk paket ini sudah habis.",
  already_used: "Kamu sudah pernah memakai kode promo ini.",
  payment_in_progress: "Kamu masih punya pembayaran yang menunggu dengan kode ini. Selesaikan dulu.",
};
