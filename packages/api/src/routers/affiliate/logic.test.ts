import { describe, expect, it } from "bun:test";
import {
  AFFILIATE,
  applyBuyerDiscount,
  computeBalance,
  computeCommission,
  generateFriendlyCode,
  getCommissionAvailableAt,
  isPlausibleReferralCode,
  maskName,
  normalizeReferralCode,
  validatePayoutRequest,
} from "./logic";

const day = 24 * 60 * 60 * 1000;

describe("affiliate pricing", () => {
  it("memberi teman diskon 15% dan afiliator 10% dari yang dibayar", () => {
    const paid = applyBuyerDiscount(200_000);
    expect(paid).toBe(170_000);
    expect(computeCommission(paid)).toBe(17_000);
  });
  it("membulatkan komisi ke bawah", () => {
    expect(computeCommission(99_999)).toBe(9_999);
  });
  it("komisi tidak pernah melebihi uang yang masuk", () => {
    for (const price of [10_000, 149_000, 299_000, 599_000]) {
      expect(computeCommission(applyBuyerDiscount(price))).toBeLessThan(applyBuyerDiscount(price));
    }
  });
});

describe("referral codes", () => {
  it("membuat kode 8 karakter tanpa huruf yang membingungkan", () => {
    for (let i = 0; i < 50; i++) expect(generateFriendlyCode()).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ2-9]{8}$/);
  });
  it("kode baru tidak peka huruf besar/kecil, kode lama dibiarkan", () => {
    expect(normalizeReferralCode(" ab3d5fgh ")).toBe("AB3D5FGH");
    expect(normalizeReferralCode("aB3!d5fGh@#")).toBe("aB3!d5fGh@#");
  });
  it("mengenali bentuk kode yang masuk akal", () => {
    expect(isPlausibleReferralCode("AB3D5FGH")).toBe(true);
    expect(isPlausibleReferralCode("aB3!d5fGh@#")).toBe(true);
    expect(isPlausibleReferralCode("abc")).toBe(false);
  });
});

describe("balance", () => {
  const now = new Date("2026-11-20T00:00:00Z");
  const released = { amount: 17_000, status: "active", availableAt: new Date(now.getTime() - day) };
  const held = { amount: 10_000, status: "active", availableAt: new Date(now.getTime() + 3 * day) };
  it("komisi tertahan belum bisa dicairkan", () => {
    const balance = computeBalance([released, held], [], now);
    expect(balance).toMatchObject({ pending: 10_000, available: 17_000, totalEarned: 27_000 });
  });
  it("komisi yang di-void tidak dihitung", () => {
    expect(computeBalance([{ ...released, status: "void" }], [], now).totalEarned).toBe(0);
  });
  it("pencairan diminta/dibayar mengurangi saldo, yang ditolak tidak", () => {
    const balance = computeBalance(
      [released, { ...released, amount: 50_000 }],
      [
        { amount: 20_000, status: "requested" },
        { amount: 10_000, status: "paid" },
        { amount: 99_000, status: "rejected" },
      ],
      now,
    );
    expect(balance).toMatchObject({ available: 37_000, requested: 20_000, paid: 10_000 });
  });
  it("saldo tidak pernah negatif", () => {
    expect(computeBalance([{ ...released, status: "void" }], [{ amount: 5_000, status: "paid" }], now).available).toBe(
      0,
    );
  });
  it("komisi bisa dicairkan setelah masa tahan", () => {
    const paidAt = new Date("2026-11-01T00:00:00Z");
    expect(getCommissionAvailableAt(paidAt).getTime() - paidAt.getTime()).toBe(AFFILIATE.HOLD_DAYS * day);
  });
});

describe("payout validation", () => {
  const ok = {
    amount: 60_000,
    available: 80_000,
    hasOpenRequest: false,
    bankName: "BCA",
    accountNumber: "1234567890",
    accountName: "Budi",
  };
  it("menerima permintaan yang valid", () => expect(validatePayoutRequest(ok)).toBeNull());
  it("menolak di bawah minimum", () => expect(validatePayoutRequest({ ...ok, amount: 10_000 })).toContain("Minimal"));
  it("menolak melebihi saldo", () => expect(validatePayoutRequest({ ...ok, amount: 90_000 })).toContain("melebihi"));
  it("menolak jika masih ada permintaan terbuka", () =>
    expect(validatePayoutRequest({ ...ok, hasOpenRequest: true })).toContain("diproses"));
  it("menolak rekening yang bukan angka", () =>
    expect(validatePayoutRequest({ ...ok, accountNumber: "12ab" })).toContain("rekening"));
});

describe("maskName", () => {
  it("menyamarkan nama belakang", () => {
    expect(maskName("Budi Santoso")).toBe("Budi S.");
    expect(maskName("Sari")).toBe("Sari");
    expect(maskName("  ")).toBe("Pengguna");
  });
});
