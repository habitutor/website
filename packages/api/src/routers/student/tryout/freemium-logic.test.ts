import { describe, expect, test } from "bun:test";
import { canStartTryout, canViewFreemiumPembahasan, hasFreemiumAccess } from "./freemium-logic";

const now = new Date("2026-10-20T00:00:00.000Z");
const future = new Date("2027-01-01T00:00:00.000Z");
const past = new Date("2026-01-01T00:00:00.000Z");

const base = {
  role: "user",
  isPremium: false,
  premiumExpiresAt: null,
  access: null,
  hasRunningSession: false,
  now,
};

describe("hasFreemiumAccess", () => {
  test("tanpa data akses = false", () => {
    expect(hasFreemiumAccess(null)).toBe(false);
  });

  test("baris ada tapi syarat dan bayar kosong = false", () => {
    expect(hasFreemiumAccess({ requirementsCompletedAt: null, paidAt: null, pembahasanTryoutId: null })).toBe(false);
  });

  test("syarat terpenuhi = true", () => {
    expect(hasFreemiumAccess({ requirementsCompletedAt: now, paidAt: null, pembahasanTryoutId: null })).toBe(true);
  });

  test("sudah bayar = true", () => {
    expect(hasFreemiumAccess({ requirementsCompletedAt: null, paidAt: now, pembahasanTryoutId: null })).toBe(true);
  });
});

describe("canStartTryout", () => {
  test("user biasa tanpa akses ditolak", () => {
    expect(canStartTryout(base)).toBe(false);
  });

  test("admin selalu boleh", () => {
    expect(canStartTryout({ ...base, role: "admin" })).toBe(true);
  });

  test("premium aktif boleh", () => {
    expect(canStartTryout({ ...base, isPremium: true, premiumExpiresAt: future })).toBe(true);
  });

  test("premium tanpa tanggal berakhir dianggap aktif", () => {
    expect(canStartTryout({ ...base, isPremium: true })).toBe(true);
  });

  test("premium kedaluwarsa tanpa akses ditolak", () => {
    expect(canStartTryout({ ...base, isPremium: true, premiumExpiresAt: past })).toBe(false);
  });

  test("sesi yang sedang berjalan boleh dilanjutkan", () => {
    expect(canStartTryout({ ...base, hasRunningSession: true })).toBe(true);
  });

  test("syarat terpenuhi boleh", () => {
    expect(
      canStartTryout({
        ...base,
        access: { requirementsCompletedAt: now, paidAt: null, pembahasanTryoutId: null },
      }),
    ).toBe(true);
  });

  test("sudah bayar boleh", () => {
    expect(
      canStartTryout({
        ...base,
        access: { requirementsCompletedAt: null, paidAt: now, pembahasanTryoutId: null },
      }),
    ).toBe(true);
  });
});

describe("canViewFreemiumPembahasan", () => {
  test("hanya memenuhi syarat tidak dapat pembahasan", () => {
    expect(
      canViewFreemiumPembahasan({ requirementsCompletedAt: now, paidAt: null, pembahasanTryoutId: "to-1" }, "to-1"),
    ).toBe(false);
  });

  test("sudah bayar tapi belum memilih TO tidak dapat pembahasan", () => {
    expect(
      canViewFreemiumPembahasan({ requirementsCompletedAt: null, paidAt: now, pembahasanTryoutId: null }, "to-1"),
    ).toBe(false);
  });

  test("sudah bayar dan TO sama dapat pembahasan", () => {
    expect(
      canViewFreemiumPembahasan({ requirementsCompletedAt: null, paidAt: now, pembahasanTryoutId: "to-1" }, "to-1"),
    ).toBe(true);
  });

  test("sudah bayar tapi TO berbeda tidak dapat pembahasan", () => {
    expect(
      canViewFreemiumPembahasan({ requirementsCompletedAt: null, paidAt: now, pembahasanTryoutId: "to-1" }, "to-2"),
    ).toBe(false);
  });
});
