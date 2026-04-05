import { ROLES } from "./roles";
export { ROLES, type Role } from "./roles";

export const PREMIUM_TIERS = {
  PREMIUM: "premium",
  PREMIUM_2: "premium2",
} as const;

export type PremiumTier = (typeof PREMIUM_TIERS)[keyof typeof PREMIUM_TIERS];

export function isAdminRole(role: string | null | undefined) {
  return role === ROLES.ADMIN;
}

export function isPremiumTier(value: string | null | undefined): value is PremiumTier {
  return value === PREMIUM_TIERS.PREMIUM || value === PREMIUM_TIERS.PREMIUM_2;
}
