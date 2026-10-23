import type { PremiumPlan } from "@/lib/premium-packages";

export const COMMUNITY_LINKS = {
  discord: "https://discord.gg/v9WcZvD92x",
  whatsapp: "https://chat.whatsapp.com/BYJqvPu29KBK5ZjOHjqjIc?s=cl&p=i&mlu=4&ilr=4",
  premiumWhatsapp: "https://chat.whatsapp.com/Fb3B3h5VP4IFFeAe42n4hX?s=cl&p=i&ilr=2&amv=2",
  premium2BulanWhatsapp: "https://chat.whatsapp.com/FyKR63LN9mzKtZtxYWO7cA",
} as const;

// Each package has its own WhatsApp group. Fill in a group link here once it
// exists; while a link is null the invite is hidden instead of showing a broken button.
export const PREMIUM_WHATSAPP_LINKS: Record<PremiumPlan, string | null> = {
  paketmandiri2027: null,
  paketutbk2027: null,
  paket3bulan: null,
  paket1bulan: null,
  perintis2027: COMMUNITY_LINKS.premiumWhatsapp,
  paket2bulan: COMMUNITY_LINKS.premium2BulanWhatsapp,
};

// Premium without a purchased package (granted by an admin or via Patungan
// Bertiga) keeps the original premium group.
export function getPremiumWhatsappLink(plan: PremiumPlan | null | undefined) {
  return plan ? PREMIUM_WHATSAPP_LINKS[plan] : COMMUNITY_LINKS.premiumWhatsapp;
}

export function shouldShowPremiumWhatsappInvite({
  isPremium,
  profile,
}: {
  isPremium: boolean | null | undefined;
  profile: { hasJoinedPremiumWhatsapp: boolean; premiumPlan: PremiumPlan | null } | undefined;
}) {
  return Boolean(
    isPremium && profile && !profile.hasJoinedPremiumWhatsapp && getPremiumWhatsappLink(profile.premiumPlan),
  );
}
