import type { PremiumPlan } from "@/lib/premium-packages";

export const COMMUNITY_LINKS = {
  discord: "https://discord.gg/v9WcZvD92x",
  whatsapp: "https://chat.whatsapp.com/BYJqvPu29KBK5ZjOHjqjIc?s=cl&p=i&mlu=4&ilr=4",
  premiumWhatsapp: "https://chat.whatsapp.com/Fb3B3h5VP4IFFeAe42n4hX?s=cl&p=i&ilr=2&amv=2",
  premium2BulanWhatsapp: "https://chat.whatsapp.com/FyKR63LN9mzKtZtxYWO7cA",
  // Channel WA untuk semua user yang punya akses (premium, pembeli TryOut, lolos syarat gratis).
  whatsappChannel: "https://whatsapp.com/channel/0029Vb8B01GLCoWsj02Zwd0e",
} as const;

// Grup WhatsApp per paket. Paket tanpa link (null) tidak menampilkan undangan.
export const PREMIUM_WHATSAPP_LINKS: Record<PremiumPlan, string | null> = {
  paketmandiri2027: "https://chat.whatsapp.com/JiPFDTc6Bhv4tLsrjSrPmF",
  paketutbk2027: COMMUNITY_LINKS.premiumWhatsapp,
  paket3bulan: "https://chat.whatsapp.com/L4pqYNAHbijDgIlF0V0aQn",
  paket1bulan: COMMUNITY_LINKS.premium2BulanWhatsapp,
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
