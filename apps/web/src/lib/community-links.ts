export const COMMUNITY_LINKS = {
  discord: "https://discord.gg/v9WcZvD92x",
  whatsapp: "https://chat.whatsapp.com/BYJqvPu29KBK5ZjOHjqjIc?s=cl&p=i&mlu=4&ilr=4",
  premiumWhatsapp: "https://chat.whatsapp.com/Fb3B3h5VP4IFFeAe42n4hX?s=cl&p=i&ilr=2&amv=2",
  premium2BulanWhatsapp: "https://chat.whatsapp.com/FyKR63LN9mzKtZtxYWO7cA",
} as const;

export type PremiumPlan = "perintis2027" | "paket2bulan";

export function getPremiumWhatsappLink(plan: PremiumPlan | null | undefined) {
  return plan === "paket2bulan" ? COMMUNITY_LINKS.premium2BulanWhatsapp : COMMUNITY_LINKS.premiumWhatsapp;
}