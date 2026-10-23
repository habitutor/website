// Premium Deadline config
export const PREMIUM_DEADLINE = new Date("2026-04-30");

// Perintis 2027: no longer sold (replaced by PREMIUM_PACKAGES). Kept so
// existing buyers keep their expiry and legacy orders still resolve.
// Perintis 2027 package config (single package sold until SNBT 2027).
// This is both the sales cutoff (availability window) AND the premium
// expiration date granted to every new purchase of this package.
export const SNBT_2027_DEADLINE = new Date("2027-05-30");

// Price is permanently 299k — it no longer increases once the early bird
// quota is claimed. EARLY_BIRD_QUOTA/soldCount are still tracked for
// scarcity messaging (slots remaining), but REGULAR_PRICE is kept equal to
// EARLY_BIRD_PRICE so currentPrice never rises further.
export const PERINTIS_2027 = {
  SLUG: "perintis2027",
  NAME: "Paket Perintis 2027",
  ORIGINAL_PRICE: 500_000,
  EARLY_BIRD_PRICE: 299_000,
  REGULAR_PRICE: 299_000,
  EARLY_BIRD_QUOTA: 50,
} as const;

// Paket 2 Bulan: no longer sold (replaced by PREMIUM_PACKAGES). Kept so
// existing buyers and late-settling pending orders still resolve correctly.
export const PAKET_2_BULAN = {
  SLUG: "paket2bulan",
  NAME: "Paket 2 Bulan",
  PRICE: 50_000,
  DURATION_MONTHS: 2,
} as const;

// Promo prices apply up to and including 31 Oct 2026 23:59 WIB.
export const PREMIUM_PROMO_ENDS_AT = new Date("2026-10-31T23:59:59.999+07:00");

// The only premium packages sold. Each grants the same premium access that
// Perintis 2027 had; they differ only in price and how long access lasts:
// either until a fixed date (EXPIRES_AT, also the sales cutoff) or for a
// number of calendar months from settlement (DURATION_MONTHS).
export const PREMIUM_PACKAGES = {
  paketmandiri2027: {
    SLUG: "paketmandiri2027",
    NAME: "Paket Sampai Mandiri",
    NORMAL_PRICE: 350_000,
    PROMO_PRICE: 280_000,
    EXPIRES_AT: new Date("2027-06-30T23:59:59.999+07:00"),
  },
  paketutbk2027: {
    SLUG: "paketutbk2027",
    NAME: "Paket Sampai UTBK",
    NORMAL_PRICE: 250_000,
    PROMO_PRICE: 200_000,
    EXPIRES_AT: new Date("2027-04-30T23:59:59.999+07:00"),
  },
  paket3bulan: {
    SLUG: "paket3bulan",
    NAME: "Paket 3 Bulan",
    NORMAL_PRICE: 150_000,
    PROMO_PRICE: 120_000,
    DURATION_MONTHS: 3,
  },
  paket1bulan: {
    SLUG: "paket1bulan",
    NAME: "Paket 1 Bulan",
    NORMAL_PRICE: 100_000,
    PROMO_PRICE: 50_000,
    DURATION_MONTHS: 1,
  },
} as const;

export type PremiumPackageSlug = keyof typeof PREMIUM_PACKAGES;
export const PREMIUM_PACKAGE_SLUGS = Object.keys(PREMIUM_PACKAGES) as PremiumPackageSlug[];

export function isPremiumPackageSlug(slug: string): slug is PremiumPackageSlug {
  return Object.hasOwn(PREMIUM_PACKAGES, slug);
}

// "Patungan Bertiga" group plan (mobile): three people each pay a discounted
// per-person price; premium unlocks for all members only once every member's
// payment settles within the completion window.
export const PATUNGAN_BERTIGA = {
  SLUG: "patungan-bertiga",
  NAME: "Patungan Bertiga",
  PRICE_PER_PERSON: 199_000,
  ORIGINAL_PRICE: 349_000,
  GROUP_SIZE: 3,
  WINDOW_HOURS: 48,
} as const;

// Paket 3 TryOut (Rp10.000): tiap pembelian menambah 3 TO pilihan, pembahasannya sudah termasuk.
// Slug lama dipertahankan; pembelian sebelum sistem pilihan TO tetap membuka semua TO (lihat freemium-logic).
export const FREEMIUM_PRODUCT = {
  SLUG: "tryout-freemium",
  NAME: "Paket 3 TryOut",
  PRICE: 10_000,
  TRYOUT_SLOTS: 3,
} as const;

// Pembahasan satu TO (Rp5.000) untuk TO yang sudah selesai dikerjakan.
export const FREEMIUM_PEMBAHASAN_PRODUCT = {
  SLUG: "tryout-pembahasan",
  NAME: "Pembahasan TryOut",
  PRICE: 5_000,
} as const;

// Jatah TO gratis setelah syarat promosi terpenuhi.
export const FREEMIUM_FREE_TRYOUT_SLOTS = 1;
