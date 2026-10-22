import { describe, expect, test } from "bun:test";
import { buildBroadcastText, getCountdownLine, getRegistrationLabel } from "./freemium-links";

// 12:00 WIB = 05:00 UTC
const wib = (month: number, day: number) => new Date(Date.UTC(2026, month - 1, day, 5, 0, 0));

describe("broadcast text otomatis", () => {
  test("H-N dihitung dari 26 Oktober 2026", () => {
    expect(getCountdownLine(wib(10, 22))).toContain("H-4 TKA");
    expect(getCountdownLine(wib(10, 25))).toContain("H-1 TKA");
  });

  test("saat TKA berlangsung tidak ada H-0 atau negatif", () => {
    expect(getCountdownLine(wib(10, 26))).toContain("TKA sudah dimulai");
    expect(getCountdownLine(wib(11, 8))).toContain("TKA sudah dimulai");
  });

  test("TO 1 sampai 24 Oktober, lalu per 3 hari", () => {
    expect(getRegistrationLabel(wib(10, 22))).toBe("sampai 24 Oktober 2026");
    expect(getRegistrationLabel(wib(10, 24))).toBe("sampai 24 Oktober 2026");
    expect(getRegistrationLabel(wib(10, 25))).toBe("25–27 Oktober 2026");
    expect(getRegistrationLabel(wib(10, 27))).toBe("25–27 Oktober 2026");
    expect(getRegistrationLabel(wib(10, 28))).toBe("28–30 Oktober 2026");
    expect(getRegistrationLabel(wib(10, 31))).toBe("31 Oktober – 2 November 2026");
  });

  test("zona WIB: 23:30 WIB masih dihitung hari itu", () => {
    const lateNight = new Date(Date.UTC(2026, 9, 24, 16, 30)); // 23:30 WIB 24 Okt
    expect(getRegistrationLabel(lateNight)).toBe("sampai 24 Oktober 2026");
  });

  test("tidak ada placeholder tersisa", () => {
    const text = buildBroadcastText(wib(10, 22));
    expect(text).not.toMatch(/\[X\]|\[tanggal\]/);
  });
});
