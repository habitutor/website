// Premium Deadline config
export const PREMIUM_DEADLINE = new Date("2026-04-30");

// Perintis 2027 package config (single package sold until SNBT 2027).
// This is both the sales cutoff (availability window) AND the premium
// expiration date granted to every new purchase of this package.
export const SNBT_2027_DEADLINE = new Date("2027-05-30");

// Price is permanently 349k — it no longer increases once the early bird
// quota is claimed. EARLY_BIRD_QUOTA/soldCount are still tracked for
// scarcity messaging (slots remaining), but REGULAR_PRICE is kept equal to
// EARLY_BIRD_PRICE so currentPrice never rises further.
export const PERINTIS_2027 = {
  SLUG: "perintis2027",
  NAME: "Paket Perintis 2027",
  ORIGINAL_PRICE: 500_000,
  EARLY_BIRD_PRICE: 349_000,
  REGULAR_PRICE: 349_000,
  EARLY_BIRD_QUOTA: 50,
} as const;

// Group buy: 3 people pay the discounted price within 48 hours of group
// creation to unlock Premium for everyone. Nobody gets access until the
// group is full; if it expires first, each paid member either pays the
// difference to the full price or requests a manual refund.
export const GROUP_BUY = {
  SEAT_SLUG: "perintis2027-groupbuy",
  SEAT_NAME: "Paket Perintis 2027 (Patungan Bertiga)",
  TOPUP_SLUG: "perintis2027-groupbuy-topup",
  TOPUP_NAME: "Pelunasan Paket Perintis 2027 (Patungan)",
  SEAT_PRICE: 199_000,
  FULL_PRICE: PERINTIS_2027.REGULAR_PRICE,
  REQUIRED_MEMBERS: 3,
  WINDOW_HOURS: 48,
} as const;
