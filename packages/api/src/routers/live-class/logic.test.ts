import { describe, expect, test } from "bun:test";
import { getLiveClassLock, getLiveClassTiming } from "./logic";

// Kelas Selasa 27 Okt 2026 19.00 WIB = 12.00 UTC, durasi 60 menit.
const schedule = { date: "2026-10-27", time: "19:00", durationMinutes: 60 };
const at = (iso: string) => new Date(iso);

describe("getLiveClassTiming", () => {
  test("jam mulai dibaca sebagai WIB", () => {
    const { startsAt, endsAt } = getLiveClassTiming({ ...schedule, now: at("2026-10-27T00:00:00Z") });
    expect(startsAt.toISOString()).toBe("2026-10-27T12:00:00.000Z");
    expect(endsAt.toISOString()).toBe("2026-10-27T13:00:00.000Z");
  });

  test("tombol Gabung baru aktif 15 menit sebelum mulai", () => {
    expect(getLiveClassTiming({ ...schedule, now: at("2026-10-27T11:44:59Z") }).isJoinOpen).toBe(false);
    const open = getLiveClassTiming({ ...schedule, now: at("2026-10-27T11:45:00Z") });
    expect(open.isJoinOpen).toBe(true);
    expect(open.status).toBe("upcoming");
  });

  test("sedang berlangsung, lalu selesai", () => {
    const live = getLiveClassTiming({ ...schedule, now: at("2026-10-27T12:30:00Z") });
    expect(live.status).toBe("live");
    expect(live.isJoinOpen).toBe(true);
    const ended = getLiveClassTiming({ ...schedule, now: at("2026-10-27T13:00:00Z") });
    expect(ended.status).toBe("ended");
    expect(ended.isJoinOpen).toBe(false);
  });
});

describe("getLiveClassLock", () => {
  const premium = {
    isAdmin: false,
    isPremium: true,
    isPremiumTier2: false,
    hasMandiriPackage: false,
    category: "SNBT" as const,
    access: "5x" as const,
  };

  test("non-premium terkunci", () => {
    expect(getLiveClassLock({ ...premium, isPremium: false })).toBe("premium");
  });

  test("premium bisa kelas TKA dan SNBT", () => {
    expect(getLiveClassLock(premium)).toBeNull();
    expect(getLiveClassLock({ ...premium, category: "TKA" })).toBeNull();
  });

  test("kelas Mandiri hanya untuk pembeli Paket Sampai Mandiri", () => {
    expect(getLiveClassLock({ ...premium, category: "MANDIRI" })).toBe("mandiri");
    expect(getLiveClassLock({ ...premium, category: "MANDIRI", hasMandiriPackage: true })).toBeNull();
  });

  test("tier premium2 lama hanya kelas 3x", () => {
    expect(getLiveClassLock({ ...premium, isPremiumTier2: true })).toBe("tier");
    expect(getLiveClassLock({ ...premium, isPremiumTier2: true, access: "3x" })).toBeNull();
  });

  test("admin selalu bisa", () => {
    expect(getLiveClassLock({ ...premium, isAdmin: true, isPremium: false, category: "MANDIRI" })).toBeNull();
  });
});
