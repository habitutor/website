import { describe, expect, it } from "bun:test";
import { parseDescription } from "./rich-description";

describe("parseDescription", () => {
  const template = [
    "Lagi bingung mulai belajar TKA dari mana? Tenang, kita bedah bareng!",
    "",
    "Tutor: Kak Zhafir, mahasiswa FH UGM, peraih skor UTBK tinggi.",
    "",
    "YANG KALIAN DAPET:",
    "- Pola soal yang sering keluar",
    "- Teknik nembak MTK, B.Indo, B.Ing",
    "- Strategi manajemen waktu",
    "",
    "Bonus: PDF Cheatsheet + Latsol 20 soal",
    "",
    "Ada pertanyaan? DM IG @habitutor.id",
  ].join("\n");

  it("memisahkan hook, judul bagian, daftar, dan penutup", () => {
    const blocks = parseDescription(template);
    expect(blocks.map((b) => b.kind)).toEqual(["paragraph", "paragraph", "heading", "list", "paragraph", "paragraph"]);
    expect(blocks[2]).toEqual({ kind: "heading", text: "YANG KALIAN DAPET" });
    expect(blocks[3]).toEqual({
      kind: "list",
      items: ["Pola soal yang sering keluar", "Teknik nembak MTK, B.Indo, B.Ing", "Strategi manajemen waktu"],
    });
  });

  it("mengenali judul bagian yang diawali emoji", () => {
    expect(parseDescription("🎁 BONUS:")[0]).toEqual({ kind: "heading", text: "🎁 BONUS" });
  });

  it("menganggap baris berawalan emoji berurutan sebagai daftar", () => {
    const blocks = parseDescription("✅ Pola soal\n✅ Teknik nembak\n✅ Strategi waktu");
    expect(blocks.some((b) => b.kind === "list")).toBe(true);
  });

  it("daftar bernomor dikenali dan nomornya dibuang", () => {
    expect(parseDescription("1. Satu\n2. Dua")[0]).toEqual({ kind: "list", items: ["Satu", "Dua"] });
  });

  it("kalimat biasa dengan huruf kecil tidak dijadikan judul", () => {
    expect(parseDescription("Ini kalimat biasa.")[0]?.kind).toBe("paragraph");
  });

  it("teks kosong menghasilkan tanpa blok", () => {
    expect(parseDescription("  \n \n")).toEqual([]);
  });
});
