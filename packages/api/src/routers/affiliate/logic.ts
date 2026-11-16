/**
 * Aturan program afiliasi. Semua angka bisnis ada di AFFILIATE supaya gampang disesuaikan dan diuji.
 * Fungsi di file ini murni (tanpa database) agar perilakunya bisa dites dan dijelaskan ke tim.
 */
import { FRIENDLY_CODE_LENGTH, LEGACY_CODE_LENGTH, generateFriendlyCode } from "@habitutor/shared/referral-code";

export { FRIENDLY_CODE_LENGTH, LEGACY_CODE_LENGTH, generateFriendlyCode };

export const AFFILIATE = {
  /** Potongan yang langsung didapat teman di checkout (pembelian Premium pertama). */
  BUYER_DISCOUNT_PERCENT: 15,
  /** Komisi afiliator dari jumlah yang benar-benar dibayar teman (setelah diskon). */
  COMMISSION_PERCENT: 10,
  /** Komisi baru bisa dicairkan setelah masa tahan, supaya refund/chargeback tidak membuat saldo minus. */
  HOLD_DAYS: 7,
  MIN_PAYOUT: 50_000,
} as const;

/** Kode lama (11 karakter, peka huruf besar/kecil) dibiarkan apa adanya; kode baru tidak peka huruf besar/kecil. */
export function normalizeReferralCode(raw: string) {
  const code = raw.trim();
  return code.length === LEGACY_CODE_LENGTH ? code : code.toUpperCase();
}

export function isPlausibleReferralCode(code: string) {
  return code.length === LEGACY_CODE_LENGTH || (code.length === FRIENDLY_CODE_LENGTH && /^[A-Z0-9]+$/.test(code));
}

export function applyBuyerDiscount(price: number) {
  return Math.round((price * (100 - AFFILIATE.BUYER_DISCOUNT_PERCENT)) / 100);
}

/** Komisi dibulatkan ke bawah supaya tidak pernah lebih besar dari 10% uang yang masuk. */
export function computeCommission(paidAmount: number) {
  return Math.floor((paidAmount * AFFILIATE.COMMISSION_PERCENT) / 100);
}

export function getCommissionAvailableAt(paidAt: Date) {
  return new Date(paidAt.getTime() + AFFILIATE.HOLD_DAYS * 24 * 60 * 60 * 1000);
}

export type CommissionLike = { amount: number; status: string; availableAt: Date };
export type PayoutLike = { amount: number; status: string };

/**
 * Saldo: komisi aktif yang masa tahannya sudah lewat, dikurangi pencairan yang masih diminta atau sudah dibayar.
 * Pencairan yang ditolak tidak mengurangi saldo.
 */
export function computeBalance(commissions: CommissionLike[], payouts: PayoutLike[], now = new Date()) {
  let pending = 0;
  let released = 0;
  for (const commission of commissions) {
    if (commission.status !== "active") continue;
    if (commission.availableAt.getTime() > now.getTime()) pending += commission.amount;
    else released += commission.amount;
  }
  let requested = 0;
  let paid = 0;
  for (const payout of payouts) {
    if (payout.status === "requested") requested += payout.amount;
    else if (payout.status === "paid") paid += payout.amount;
  }
  return {
    pending,
    available: Math.max(0, released - requested - paid),
    requested,
    paid,
    totalEarned: pending + released,
  };
}

export type PayoutInput = {
  amount: number;
  available: number;
  hasOpenRequest: boolean;
  bankName: string;
  accountNumber: string;
  accountName: string;
};

/** Mengembalikan pesan galat berbahasa Indonesia, atau null kalau permintaan boleh diproses. */
export function validatePayoutRequest(input: PayoutInput) {
  if (input.hasOpenRequest) return "Masih ada permintaan pencairan yang sedang diproses.";
  if (!input.bankName.trim() || !input.accountName.trim() || !/^\d{5,20}$/.test(input.accountNumber.trim()))
    return "Lengkapi nama bank, nama pemilik, dan nomor rekening (angka saja).";
  if (!Number.isInteger(input.amount) || input.amount < AFFILIATE.MIN_PAYOUT)
    return `Minimal pencairan Rp${AFFILIATE.MIN_PAYOUT.toLocaleString("id-ID")}.`;
  if (input.amount > input.available) return "Jumlah melebihi saldo yang bisa dicairkan.";
  return null;
}

/** "Budi Santoso" -> "Budi S." supaya afiliator melihat progres tanpa membuka identitas lengkap temannya. */
export function maskName(name: string) {
  const [first, ...rest] = name.trim().split(/\s+/);
  if (!first) return "Pengguna";
  const initial = rest[0]?.[0];
  return initial ? `${first} ${initial.toUpperCase()}.` : first;
}
