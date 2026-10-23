import { describe, expect, it } from "bun:test";
import { PREMIUM_PACKAGE_SLUGS } from "../../lib/constants";
import { getPackageExpiry, getPackagePrice, isPackageAvailable, isPromoActive, listPremiumPackages } from "./pricing";

const LAST_PROMO_MOMENT = new Date("2026-10-31T16:59:59.999Z"); // 31 Okt 23.59.59 WIB
const FIRST_NORMAL_MOMENT = new Date("2026-10-31T17:00:00.000Z"); // 1 Nov 00.00 WIB

describe("premium package pricing", () => {
  it("sells exactly four packages", () => {
    expect(PREMIUM_PACKAGE_SLUGS).toEqual(["paketmandiri2027", "paketutbk2027", "paket3bulan", "paket1bulan"]);
  });

  it("uses promo prices until 31 Oktober 2026 23.59 WIB", () => {
    expect(isPromoActive(LAST_PROMO_MOMENT)).toBe(true);
    expect(getPackagePrice("paketmandiri2027", LAST_PROMO_MOMENT)).toBe(280_000);
    expect(getPackagePrice("paketutbk2027", LAST_PROMO_MOMENT)).toBe(200_000);
    expect(getPackagePrice("paket3bulan", LAST_PROMO_MOMENT)).toBe(120_000);
    expect(getPackagePrice("paket1bulan", LAST_PROMO_MOMENT)).toBe(50_000);
  });

  it("uses normal prices from 1 November 2026 00.00 WIB", () => {
    expect(isPromoActive(FIRST_NORMAL_MOMENT)).toBe(false);
    expect(getPackagePrice("paketmandiri2027", FIRST_NORMAL_MOMENT)).toBe(350_000);
    expect(getPackagePrice("paketutbk2027", FIRST_NORMAL_MOMENT)).toBe(250_000);
    expect(getPackagePrice("paket3bulan", FIRST_NORMAL_MOMENT)).toBe(150_000);
    expect(getPackagePrice("paket1bulan", FIRST_NORMAL_MOMENT)).toBe(100_000);
  });

  it("lists each package with the price in effect", () => {
    const packages = listPremiumPackages(FIRST_NORMAL_MOMENT);
    expect(packages).toHaveLength(4);
    expect(packages.every((pkg) => !pkg.isPromo && pkg.currentPrice === pkg.normalPrice)).toBe(true);
  });
});

describe("premium package expiry", () => {
  const paidAt = new Date("2026-10-25T03:00:00.000Z");

  it("ends fixed-date packages at 23.59 WIB on their end date", () => {
    expect(getPackageExpiry("paketutbk2027", paidAt).toISOString()).toBe("2027-05-01T16:59:59.999Z");
    expect(getPackageExpiry("paketmandiri2027", paidAt).toISOString()).toBe("2027-06-30T16:59:59.999Z");
  });

  it("counts monthly packages from settlement", () => {
    expect(getPackageExpiry("paket1bulan", paidAt).toISOString()).toBe("2026-11-25T03:00:00.000Z");
    expect(getPackageExpiry("paket3bulan", paidAt).toISOString()).toBe("2027-01-25T03:00:00.000Z");
  });

  it("stops selling fixed-date packages after their end date", () => {
    const afterUtbk = new Date("2027-05-01T17:00:00.000Z");
    expect(isPackageAvailable("paketutbk2027", afterUtbk)).toBe(false);
    expect(isPackageAvailable("paketmandiri2027", afterUtbk)).toBe(true);
    expect(isPackageAvailable("paket1bulan", afterUtbk)).toBe(true);
  });
});
