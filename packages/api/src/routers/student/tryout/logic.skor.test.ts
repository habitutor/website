import { describe, expect, test } from "bun:test";
import { hitungRataRataSkor, hitungSkorSkala } from "./logic";

describe("hitungSkorSkala", () => {
  test("semua salah menghasilkan 200", () => {
    expect(hitungSkorSkala(0, 600)).toBe(200);
  });

  test("semua benar menghasilkan 800", () => {
    expect(hitungSkorSkala(600, 600)).toBe(800);
  });

  test("setengah benar menghasilkan 500", () => {
    expect(hitungSkorSkala(300, 600)).toBe(500);
  });

  test("sepertiga benar menghasilkan 400", () => {
    expect(hitungSkorSkala(100, 300)).toBe(400);
  });

  test("poin maksimal 0 menghasilkan 200", () => {
    expect(hitungSkorSkala(10, 0)).toBe(200);
  });

  test("poin melebihi maksimal dibatasi 800", () => {
    expect(hitungSkorSkala(700, 600)).toBe(800);
  });

  test("poin negatif dibatasi 200", () => {
    expect(hitungSkorSkala(-5, 600)).toBe(200);
  });
});

describe("hitungRataRataSkor", () => {
  test("rata-rata semua subtes", () => {
    expect(hitungRataRataSkor([800, 400], 2)).toBe(600);
  });

  test("subtes belum dikerjakan dihitung 200", () => {
    expect(hitungRataRataSkor([800], 2)).toBe(500);
  });

  test("tanpa subtes menghasilkan 200", () => {
    expect(hitungRataRataSkor([], 0)).toBe(200);
  });

  test("hasil dibulatkan", () => {
    expect(hitungRataRataSkor([500, 501], 2)).toBe(501);
  });
});
