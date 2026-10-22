import { describe, expect, test } from "bun:test";
import {
  canStartTryout,
  canViewFreemiumPembahasan,
  hasFreemiumAccess,
  validateRequirementProofs,
} from "./freemium-logic";

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
  test("tanpa TO yang dibuka = false", () => {
    expect(canViewFreemiumPembahasan([], "to-1")).toBe(false);
  });

  test("TO yang sudah dibuka = true", () => {
    expect(canViewFreemiumPembahasan(["to-1"], "to-1")).toBe(true);
  });

  test("TO lain yang belum dibuka = false", () => {
    expect(canViewFreemiumPembahasan(["to-1"], "to-2")).toBe(false);
  });

  test("beli jatah lagi: beberapa TO bisa terbuka bersamaan", () => {
    expect(canViewFreemiumPembahasan(["to-1", "to-2"], "to-1")).toBe(true);
    expect(canViewFreemiumPembahasan(["to-1", "to-2"], "to-2")).toBe(true);
    expect(canViewFreemiumPembahasan(["to-1", "to-2"], "to-3")).toBe(false);
  });
});

describe("validateRequirementProofs", () => {
  const png = "data:image/png;base64,iVBORw0KGgo=";

  test("menerima tepat 3 gambar valid", () => {
    expect(validateRequirementProofs([png, png, png])).toBeNull();
  });

  test("menolak jumlah bukti selain 3", () => {
    expect(validateRequirementProofs([])).not.toBeNull();
    expect(validateRequirementProofs([png, png])).not.toBeNull();
    expect(validateRequirementProofs([png, png, png, png])).not.toBeNull();
  });

  test("menolak data yang bukan gambar", () => {
    expect(validateRequirementProofs([png, png, "https://evil.example/x.png"])).not.toBeNull();
    expect(validateRequirementProofs([png, png, "data:text/html;base64,PHNjcmlwdD4="])).not.toBeNull();
  });

  test("menolak gambar yang terlalu besar", () => {
    const huge = `data:image/png;base64,${"A".repeat(6_000_001)}`;
    expect(validateRequirementProofs([png, png, huge])).not.toBeNull();
  });
});
