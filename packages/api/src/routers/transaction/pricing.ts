import {
  PREMIUM_PACKAGE_SLUGS,
  PREMIUM_PACKAGES,
  PREMIUM_PROMO_ENDS_AT,
  type PremiumPackageSlug,
} from "../../lib/constants";
import { addMonthsUtc } from "./premium-expiry";

type PremiumPackage = (typeof PREMIUM_PACKAGES)[PremiumPackageSlug];

function getFixedExpiry(pkg: PremiumPackage) {
  return "EXPIRES_AT" in pkg ? pkg.EXPIRES_AT : null;
}

export function isPromoActive(now = new Date()) {
  return now.getTime() <= PREMIUM_PROMO_ENDS_AT.getTime();
}

export function getPackagePrice(slug: PremiumPackageSlug, now = new Date()) {
  const pkg = PREMIUM_PACKAGES[slug];
  return isPromoActive(now) ? pkg.PROMO_PRICE : pkg.NORMAL_PRICE;
}

// Packages that run until a fixed date stop being sold once that date passes.
export function isPackageAvailable(slug: PremiumPackageSlug, now = new Date()) {
  const fixedExpiry = getFixedExpiry(PREMIUM_PACKAGES[slug]);
  return fixedExpiry === null || now.getTime() < fixedExpiry.getTime();
}

export function getPackageExpiry(slug: PremiumPackageSlug, paidAt: Date) {
  const pkg = PREMIUM_PACKAGES[slug];
  const fixedExpiry = getFixedExpiry(pkg);
  if (fixedExpiry) return fixedExpiry;
  return addMonthsUtc(paidAt, "DURATION_MONTHS" in pkg ? pkg.DURATION_MONTHS : 0);
}

export function listPremiumPackages(now = new Date()) {
  const promoActive = isPromoActive(now);

  return PREMIUM_PACKAGE_SLUGS.map((slug) => {
    const pkg = PREMIUM_PACKAGES[slug];
    const fixedExpiry = getFixedExpiry(pkg);

    return {
      slug,
      name: pkg.NAME,
      normalPrice: pkg.NORMAL_PRICE,
      promoPrice: pkg.PROMO_PRICE,
      currentPrice: getPackagePrice(slug, now),
      isPromo: promoActive,
      promoEndsAt: PREMIUM_PROMO_ENDS_AT.toISOString(),
      expiresAt: fixedExpiry ? fixedExpiry.toISOString() : null,
      durationMonths: "DURATION_MONTHS" in pkg ? pkg.DURATION_MONTHS : null,
      isAvailable: isPackageAvailable(slug, now),
    };
  });
}
