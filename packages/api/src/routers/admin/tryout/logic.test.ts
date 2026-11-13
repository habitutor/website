import { describe, expect, test } from "bun:test";
import { type ImportSoalInput, validateImportSoal } from "./logic";

const valid = (overrides: Partial<ImportSoalInput> = {}): ImportSoalInput => ({
  pertanyaan: "Nilai 2 + 3?",
  tipe: "pilgan",
  poin: 20,
  pembahasan: null,
  pilihan: [
    { label: "A", isi: "4", isBenar: false },
    { label: "B", isi: "5", isBenar: true },
  ],
  ...overrides,
});

describe("validateImportSoal", () => {
  test("menerima soal valid", () => {
    expect(validateImportSoal([valid()])).toBeNull();
    expect(
      validateImportSoal([
        valid({
          tipe: "multiple",
          pilihan: [
            { label: "A", isi: "2", isBenar: true },
            { label: "B", isi: "3", isBenar: false },
            { label: "C", isi: "4", isBenar: true },
          ],
        }),
      ]),
    ).toBeNull();
  });

  test("menolak batch kosong dan batch terlalu besar", () => {
    expect(validateImportSoal([])).toContain("Tidak ada soal");
    expect(validateImportSoal(Array.from({ length: 201 }, () => valid()))).toContain("Maksimal 200");
  });

  test("menolak data yang akan merusak tampilan atau penilaian siswa", () => {
    expect(validateImportSoal([valid({ pertanyaan: "   " })])).toContain("pertanyaan kosong");
    expect(validateImportSoal([valid({ poin: 0 })])).toContain("poin");
    expect(validateImportSoal([valid({ poin: 1.5 })])).toContain("poin");
    expect(validateImportSoal([valid({ pilihan: [{ label: "A", isi: "x", isBenar: true }] })])).toContain("minimal 2");
    expect(
      validateImportSoal([
        valid({
          pilihan: [
            { label: "A", isi: "x", isBenar: true },
            { label: "C", isi: "y", isBenar: false },
          ],
        }),
      ]),
    ).toContain("berurutan");
    expect(
      validateImportSoal([
        valid({
          pilihan: [
            { label: "A", isi: "x", isBenar: true },
            { label: "B", isi: " ", isBenar: false },
          ],
        }),
      ]),
    ).toContain("pilihan B kosong");
    expect(
      validateImportSoal([
        valid({
          pilihan: [
            { label: "A", isi: "x", isBenar: false },
            { label: "B", isi: "y", isBenar: false },
          ],
        }),
      ]),
    ).toContain("belum ada kunci");
    expect(
      validateImportSoal([
        valid({
          pilihan: [
            { label: "A", isi: "x", isBenar: true },
            { label: "B", isi: "y", isBenar: true },
          ],
        }),
      ]),
    ).toContain("hanya boleh satu kunci");
  });

  test("pesan error menyebut urutan soal yang bermasalah", () => {
    expect(validateImportSoal([valid(), valid(), valid({ pertanyaan: "" })])).toStartWith("Soal ke-3");
  });
});
