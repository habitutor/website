// Premium Deadline config
export const PREMIUM_DEADLINE = new Date("2026-04-30");

// Perintis 2027 package config (single package sold until SNBT 2027)
export const SNBT_2027_DEADLINE = new Date("2027-04-30");

export const PERINTIS_2027 = {
  SLUG: "perintis2027",
  NAME: "Paket Perintis 2027",
  ORIGINAL_PRICE: 499_000,
  EARLY_BIRD_PRICE: 199_000,
  REGULAR_PRICE: 299_000,
  EARLY_BIRD_QUOTA: 50,
} as const;
