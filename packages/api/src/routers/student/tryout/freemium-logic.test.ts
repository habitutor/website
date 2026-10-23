import { describe, expect, test } from "bun:test";
import {
  canStartTryout,
  canViewFreemiumPembahasan,
  type FreemiumSnapshot,
  pickSelectionSource,
  summarizeFreemium,
  validateRequirementProofs,
} from "./freemium-logic";

const now = new Date("2026-10-20T00:00:00.000Z");
const future = new Date("2027-01-01T00:00:00.000Z");
const past = new Date("2026-01-01T00:00:00.000Z");

const empty: FreemiumSnapshot = {
  requirementsCompleted: false,
  legacyPaid: false,
  activePackageCount: 0,
  selections: [],
  startedTryoutIds: [],
  purchasedPembahasanTryoutIds: [],
  legacyCreditTryoutIds: [],
};

function summary(overrides: Partial<FreemiumSnapshot> = {}) {
  return summarizeFreemium({ ...empty, ...overrides });
}

const base = {
  role: "user",
  isPremium: false,
  premiumExpiresAt: null,
  summary: summary(),
  tryoutId: "to-1",
  hasRunningSession: false,
  now,
};

describe("summarizeFreemium: jatah TO", () => {
  test("belum memenuhi syarat dan belum beli = tanpa jatah", () => {
    const result = summary();
    expect(result.freeSlots.total).toBe(0);
    expect(result.packageSlots.total).toBe(0);
    expect(pickSelectionSource(result)).toBeNull();
  });

  test("syarat terpenuhi = 1 TO gratis", () => {
    const result = summary({ requirementsCompleted: true });
    expect(result.freeSlots).toEqual({ total: 1, used: 0, remaining: 1 });
    expect(pickSelectionSource(result)).toBe("gratis");
  });

  test("tiap Paket 3 TryOut = +3 TO, dan paket dipakai lebih dulu", () => {
    const result = summary({ requirementsCompleted: true, activePackageCount: 2 });
    expect(result.packageSlots.total).toBe(6);
    expect(pickSelectionSource(result)).toBe("paket");
  });

  test("gratis 1 + paket 3 = 4 TO, lalu jatah habis", () => {
    const result = summary({
      requirementsCompleted: true,
      activePackageCount: 1,
      selections: [
        { tryoutId: "a", source: "paket" },
        { tryoutId: "b", source: "paket" },
        { tryoutId: "c", source: "paket" },
        { tryoutId: "d", source: "gratis" },
      ],
    });
    expect(result.startableTryoutIds).toEqual(["a", "b", "c", "d"]);
    expect(pickSelectionSource(result)).toBeNull();
  });

  test("user gratis lama: TO yang sudah dikerjakan dihitung sebagai pilihan gratis", () => {
    const result = summary({ requirementsCompleted: true, startedTryoutIds: ["lama-1", "lama-2"] });
    expect(result.startableTryoutIds).toEqual(["lama-1", "lama-2"]);
    expect(result.freeSlots.remaining).toBe(0);
  });

  test("user gratis lama tanpa riwayat tetap dapat 1 TO", () => {
    expect(summary({ requirementsCompleted: true }).freeSlots.remaining).toBe(1);
  });

  test("riwayat TO tanpa syarat (sebelum ada gerbang) tidak membuka TO", () => {
    expect(summary({ startedTryoutIds: ["lama-1"] }).startableTryoutIds).toEqual([]);
  });

  test("pembeli Rp10.000 sistem lama tetap semua TO", () => {
    expect(summary({ legacyPaid: true }).unlimited).toBe(true);
  });
});

describe("summarizeFreemium: pembahasan", () => {
  test("TO dari paket langsung termasuk pembahasan, TO gratis tidak", () => {
    const result = summary({
      requirementsCompleted: true,
      activePackageCount: 1,
      selections: [
        { tryoutId: "paket-1", source: "paket" },
        { tryoutId: "gratis-1", source: "gratis" },
      ],
    });
    expect(canViewFreemiumPembahasan(result, "paket-1")).toBe(true);
    expect(canViewFreemiumPembahasan(result, "gratis-1")).toBe(false);
  });

  test("pembahasan Rp5.000 dan jatah lama membuka TO-nya saja", () => {
    const result = summary({ purchasedPembahasanTryoutIds: ["to-5k"], legacyCreditTryoutIds: ["to-lama"] });
    expect(canViewFreemiumPembahasan(result, "to-5k")).toBe(true);
    expect(canViewFreemiumPembahasan(result, "to-lama")).toBe(true);
    expect(canViewFreemiumPembahasan(result, "to-lain")).toBe(false);
  });
});

describe("canStartTryout", () => {
  test("user biasa tanpa pilihan = tidak boleh", () => {
    expect(canStartTryout(base)).toBe(false);
  });

  test("TO yang dipilih = boleh, TO lain = tidak", () => {
    const withSelection = summary({
      requirementsCompleted: true,
      selections: [{ tryoutId: "to-1", source: "gratis" }],
    });
    expect(canStartTryout({ ...base, summary: withSelection })).toBe(true);
    expect(canStartTryout({ ...base, summary: withSelection, tryoutId: "to-2" })).toBe(false);
  });

  test("admin selalu boleh", () => {
    expect(canStartTryout({ ...base, role: "admin" })).toBe(true);
  });

  test("premium aktif boleh, premium kedaluwarsa tidak", () => {
    expect(canStartTryout({ ...base, isPremium: true, premiumExpiresAt: future })).toBe(true);
    expect(canStartTryout({ ...base, isPremium: true, premiumExpiresAt: past })).toBe(false);
  });

  test("sesi yang sedang berjalan tetap boleh dilanjutkan", () => {
    expect(canStartTryout({ ...base, hasRunningSession: true })).toBe(true);
  });

  test("pembeli Rp10.000 sistem lama boleh semua TO", () => {
    expect(canStartTryout({ ...base, summary: summary({ legacyPaid: true }) })).toBe(true);
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
