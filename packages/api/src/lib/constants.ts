// Premium Deadline config
export const PREMIUM_DEADLINE = new Date("2026-04-30");

// Perintis 2027 package config (single package sold until SNBT 2027).
// This is both the sales cutoff (availability window) AND the premium
// expiration date granted to every new purchase of this package.
export const SNBT_2027_DEADLINE = new Date("2027-05-30");

// Price is permanently 249k — it no longer increases once the early bird
// quota is claimed. EARLY_BIRD_QUOTA/soldCount are still tracked for
// scarcity messaging (slots remaining), but REGULAR_PRICE is kept equal to
// EARLY_BIRD_PRICE so currentPrice never rises to 349k.
export const PERINTIS_2027 = {
  SLUG: "perintis2027",
  NAME: "Paket Perintis 2027",
  ORIGINAL_PRICE: 500_000,
  EARLY_BIRD_PRICE: 249_000,
  REGULAR_PRICE: 249_000,
  EARLY_BIRD_QUOTA: 50,
} as const;
