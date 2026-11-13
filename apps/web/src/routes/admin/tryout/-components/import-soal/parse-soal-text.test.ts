import { describe, expect, test } from "bun:test";
import { parseKeyLabels, parseSoalText, parseTipe, toImportPayload } from "./parse-soal-text";

const BASIC = `
1. Nilai dari 2 + 3 adalah ...
A. 4
B. 5
C. 6
D. 7
E. 8
Kunci: B
Pembahasan: 2 + 3 = 5.

2. Ibu kota Indonesia adalah ...
A. Bandung
B. Surabaya
C. Jakarta
D. Medan
E. Makassar
Kunci: C
Pembahasan: Jakarta.
`;

describe("parseSoalText — format standar", () => {
  test("membaca soal, pilihan, kunci, dan pembahasan", () => {
    const { soal, errors } = parseSoalText(BASIC);
    expect(errors).toEqual([]);
    expect(soal).toHaveLength(2);
    expect(soal[0]).toMatchObject({
      nomor: 1,
      pertanyaan: "Nilai dari 2 + 3 adalah ...",
      kunci: ["B"],
      tipe: "pilgan",
      pembahasan: "2 + 3 = 5.",
      errors: [],
    });
    expect(soal[0]!.pilihan.map((p) => `${p.label}:${p.isi}`)).toEqual(["A:4", "B:5", "C:6", "D:7", "E:8"]);
    expect(soal[1]!.kunci).toEqual(["C"]);
  });

  test("menerima variasi penanda: 1), (A), a., Jawaban:", () => {
    const { soal } = parseSoalText(`1) Pilih yang benar
(A) satu
(B) dua
c. tiga
D) empat
Jawaban: (c)`);
    expect(soal[0]!.pilihan.map((p) => p.label)).toEqual(["A", "B", "C", "D"]);
    expect(soal[0]!.kunci).toEqual(["C"]);
    expect(soal[0]!.errors).toEqual([]);
  });

  test("pertanyaan dan pembahasan multi-baris tetap utuh, pilihan multi-baris digabung", () => {
    const { soal } = parseSoalText(`1. Perhatikan pernyataan berikut.
(1) Air mendidih pada 100°C.
(2) Es mencair pada 0°C.
Pernyataan yang benar adalah ...
A. hanya (1)
B. hanya (2)
C. (1) dan
(2) keduanya
D. tidak ada
Kunci: C
Pembahasan:
Langkah pertama cek (1).
Langkah kedua cek (2).`);
    const s = soal[0]!;
    expect(s.pertanyaan.split("\n")).toHaveLength(4);
    expect(s.pilihan[2]!.isi).toBe("(1) dan (2) keduanya");
    expect(s.pembahasan).toBe("Langkah pertama cek (1).\nLangkah kedua cek (2).");
  });

  test("pernyataan bernomor di dalam pertanyaan tidak memecah soal", () => {
    const { soal } = parseSoalText(`1. Perhatikan pernyataan:
1. Pernyataan satu
2. Pernyataan dua
Mana yang benar?
A. 1 saja
B. 2 saja
Kunci: A`);
    expect(soal).toHaveLength(1);
    expect(soal[0]!.pertanyaan).toContain("2. Pernyataan dua");
    expect(soal[0]!.errors).toEqual([]);
  });

  test("langkah bernomor di pembahasan tidak dianggap soal baru", () => {
    const { soal } = parseSoalText(`1. Soal satu
A. a
B. b
Kunci: A
Pembahasan:
1. Hitung dulu
2. Lalu bagi
3. Selesai

2. Soal dua
A. x
B. y
Kunci: B`);
    expect(soal).toHaveLength(2);
    expect(soal[0]!.pembahasan).toBe("1. Hitung dulu\n2. Lalu bagi\n3. Selesai");
    expect(soal[1]!.pertanyaan).toBe("Soal dua");
    expect(soal[1]!.kunci).toEqual(["B"]);
  });

  test("teks sebelum soal pertama diabaikan dengan pemberitahuan", () => {
    const { soal, notices } = parseSoalText(`PAKET SOAL TPS\nKerjakan dengan teliti\n\n${BASIC}`);
    expect(soal).toHaveLength(2);
    expect(notices.some((n) => n.includes("2 baris"))).toBe(true);
  });

  test("Windows line ending, tab, dan spasi tak terlihat dibersihkan", () => {
    const { soal } = parseSoalText("1.\tSoal satu\r\nA.\tya\r\nB.\ttidak\r\nKunci:​ A\r\n");
    expect(soal[0]).toMatchObject({ pertanyaan: "Soal satu", kunci: ["A"], errors: [] });
  });
});

describe("parseSoalText — kunci jawaban", () => {
  test("tabel kunci di akhir dokumen", () => {
    const { soal, errors } = parseSoalText(`1. Satu
A. a
B. b
2. Dua
A. a
B. b
C. c

Kunci Jawaban
1. B   2. C`);
    expect(errors).toEqual([]);
    expect(soal.map((s) => s.kunci)).toEqual([["B"], ["C"]]);
    expect(soal.every((s) => s.errors.length === 0)).toBe(true);
  });

  test("tabel kunci satu baris", () => {
    const { soal } = parseSoalText(`1. Satu
A. a
B. b
2. Dua
A. a
B. b
Kunci Jawaban: 1. A, 2. B`);
    expect(soal.map((s) => s.kunci)).toEqual([["A"], ["B"]]);
  });

  test("kunci di baris berikutnya setelah judul 'Kunci Jawaban:'", () => {
    const { soal } = parseSoalText(`1. Satu
A. a
B. b
Kunci Jawaban:
B
Pembahasan: karena b`);
    expect(soal[0]).toMatchObject({ kunci: ["B"], pembahasan: "karena b", errors: [] });
  });

  test("lebih dari satu kunci menjadi tipe multiple", () => {
    const { soal } = parseSoalText(`1. Pilih semua bilangan genap
A. 2
B. 3
C. 4
Kunci: A dan C`);
    expect(soal[0]!.tipe).toBe("multiple");
    expect(soal[0]!.kunci).toEqual(["A", "C"]);
    expect(soal[0]!.errors).toEqual([]);
  });

  test("baris Tipe: Multiple Answer membuat soal multiple walau kuncinya satu", () => {
    const { soal } = parseSoalText(`1. Pilih semua bilangan prima genap
Tipe: Multiple Answer
A. 2
B. 4
C. 6
Kunci: A`);
    expect(soal[0]).toMatchObject({ tipe: "multiple", kunci: ["A"], errors: [] });
    expect(soal[0]!.pertanyaan).toBe("Pilih semua bilangan prima genap");
  });

  test("penulisan tipe: Multiple Choice = pilihan ganda biasa, Multiple Answer dan Jawaban Ganda = multiple", () => {
    expect(parseTipe("Multiple Choice")).toBe("pilgan");
    expect(parseTipe("multiple-choice")).toBe("pilgan");
    expect(parseTipe("Pilihan Ganda")).toBe("pilgan");
    expect(parseTipe("Multiple Answer")).toBe("multiple");
    expect(parseTipe("Jawaban Ganda")).toBe("multiple");
    expect(parseTipe("Pilihan Ganda Kompleks")).toBe("multiple");
    expect(parseTipe("esai")).toBeNull();

    const { soal } = parseSoalText(`1. Satu
Tipe: Multiple Choice
A. a
B. b
Kunci: B`);
    expect(soal[0]).toMatchObject({ tipe: "pilgan", kunci: ["B"], errors: [] });
  });

  test("Tipe: Pilihan Ganda dengan dua kunci menjadi error, tipe tak dikenal juga error", () => {
    const { soal } = parseSoalText(`1. Satu
Tipe: Pilihan Ganda
A. a
B. b
Kunci: A, B
2. Dua
Tipe: esai
A. a
B. b
Kunci: A`);
    expect(soal[0]!.errors.some((e) => e.includes("hanya boleh satu kunci"))).toBe(true);
    expect(soal[1]!.errors.some((e) => e.includes("tidak dikenali"))).toBe(true);
  });

  test("tipe soal pada tabel kunci di akhir tetap terbaca", () => {
    const { soal } = parseSoalText(`1. Pilih yang benar
A. a
B. b
C. c
Kunci Jawaban
1. A, C`);
    expect(soal[0]).toMatchObject({ tipe: "multiple", kunci: ["A", "C"], errors: [] });
  });

  test("toImportPayload menandai semua kunci soal multiple sebagai benar", () => {
    const { soal } = parseSoalText(`1. Genap?
A. 2
B. 3
C. 4
Kunci: A, C`);
    expect(toImportPayload(soal, 10)[0]!.pilihan.map((p) => p.isBenar)).toEqual([true, false, true]);
    expect(toImportPayload(soal, 10)[0]!.tipe).toBe("multiple");
  });

  test("kunci tidak valid dan kunci di luar pilihan menjadi error", () => {
    const { soal } = parseSoalText(`1. Satu
A. a
B. b
Kunci: F
2. Dua
A. a
B. b
Kunci: D`);
    expect(soal[0]!.errors.some((e) => e.includes("tidak terbaca"))).toBe(true);
    expect(soal[1]!.errors).toContain("Kunci D tidak ada di pilihan jawaban");
  });

  test("kunci inline dan tabel yang berbeda menjadi error", () => {
    const { soal } = parseSoalText(`1. Satu
A. a
B. b
Kunci: A
Kunci Jawaban
1. B`);
    expect(soal[0]!.errors.some((e) => e.includes("berbeda"))).toBe(true);
  });

  test("parseKeyLabels", () => {
    expect(parseKeyLabels("c")).toEqual(["C"]);
    expect(parseKeyLabels("(B)")).toEqual(["B"]);
    expect(parseKeyLabels("A, c & E")).toEqual(["A", "C", "E"]);
    expect(parseKeyLabels("C. 3 m/s")).toEqual(["C"]);
    expect(parseKeyLabels("Benar")).toBeNull();
    expect(parseKeyLabels("F")).toBeNull();
  });
});

describe("parseSoalText — validasi", () => {
  test("soal tanpa kunci, tanpa pilihan, atau pilihan kosong ditandai error", () => {
    const { soal } = parseSoalText(`1. Tanpa kunci
A. a
B. b
2. Pilihan kosong
A.
B. b
Kunci: A`);
    expect(soal[0]!.errors).toContain("Kunci jawaban belum ada");
    expect(soal[1]!.errors).toContain("Pilihan A kosong");
  });

  test("pilihan yang terlewat terdeteksi", () => {
    const { soal } = parseSoalText(`1. Soal
A. a
B. b
D. d
Kunci: A`);
    expect(soal[0]!.errors.some((e) => e.includes("Pilihan C tidak ditemukan"))).toBe(true);
  });

  test("nama seperti 'B. J. Habibie' di pertanyaan tidak dianggap pilihan", () => {
    const { soal } = parseSoalText(`1. Siapa presiden ketiga?
B. J. Habibie adalah tokoh yang dimaksud jika ...
A. benar
B. salah
Kunci: A`);
    expect(soal[0]!.pertanyaan).toContain("B. J. Habibie");
    expect(soal[0]!.pilihan.map((p) => p.label)).toEqual(["A", "B"]);
  });

  test("nomor soal tidak terbaca menimbulkan error pilihan A berulang", () => {
    const { soal } = parseSoalText(`1. Satu
A. a
B. b
Soal berikutnya tanpa nomor
A. x
B. y
Kunci: A`);
    expect(soal[0]!.errors.some((e) => e.includes("Pilihan A muncul lagi"))).toBe(true);
  });

  test("nomor berulang (mis. hasil daftar Google Docs) tetap dipecah dengan peringatan", () => {
    const { soal } = parseSoalText(`1. Satu
A. a
B. b
Kunci: A
1. Dua
A. a
B. b
Kunci: B`);
    expect(soal).toHaveLength(2);
    expect(soal[1]!.warnings.some((w) => w.includes("tidak berurutan"))).toBe(true);
  });

  test("peringatan untuk gambar, pembahasan kosong, dan duplikat", () => {
    const { soal } = parseSoalText(`1. Perhatikan grafik berikut
A. a
B. b
Kunci: A
2. Perhatikan grafik berikut
A. a
B. b
Kunci: A`);
    expect(soal[0]!.warnings.some((w) => w.includes("gambar"))).toBe(true);
    expect(soal[0]!.warnings.some((w) => w.includes("Pembahasan kosong"))).toBe(true);
    expect(soal[1]!.warnings.some((w) => w.includes("sama persis dengan soal #1"))).toBe(true);
  });

  test("lebih dari 200 soal ditolak", () => {
    const text = Array.from({ length: 201 }, (_, i) => `${i + 1}. Soal\nA. a\nB. b\nKunci: A`).join("\n");
    const { soal, errors } = parseSoalText(text);
    expect(soal).toHaveLength(201);
    expect(errors.some((e) => e.includes("Maksimal 200"))).toBe(true);
  });
});

describe("parseSoalText — bacaan bersama", () => {
  test("blok [Bacaan] dengan rentang disalin ke soal yang dimaksud saja", () => {
    const { soal } = parseSoalText(`[Bacaan untuk soal 1-2]
Paragraf bacaan pertama.
1. Ini nomor satu bukan soal
[/Bacaan]

1. Ide pokok bacaan adalah ...
A. a
B. b
Kunci: A
2. Judul yang tepat ...
A. a
B. b
Kunci: B
3. Soal mandiri
A. a
B. b
Kunci: A`);
    expect(soal).toHaveLength(3);
    expect(soal[0]!.pertanyaan).toBe(
      "Paragraf bacaan pertama.\n1. Ini nomor satu bukan soal\n\nIde pokok bacaan adalah ...",
    );
    expect(soal[1]!.pertanyaan.startsWith("Paragraf bacaan pertama.")).toBe(true);
    expect(soal[2]!.pertanyaan).toBe("Soal mandiri");
  });

  test("blok [Bacaan] tanpa rentang berlaku sampai blok bacaan berikutnya", () => {
    const { soal } = parseSoalText(`[Bacaan]
Teks A.
1. Soal satu
A. a
B. b
Kunci: A
[Bacaan]
Teks B.
2. Soal dua
A. a
B. b
Kunci: A`);
    expect(soal[0]!.pertanyaan).toBe("Teks A.\n\nSoal satu");
    expect(soal[1]!.pertanyaan).toBe("Teks B.\n\nSoal dua");
  });

  test("soal yang merujuk bacaan tanpa blok [Bacaan] diberi peringatan", () => {
    const { soal } = parseSoalText(`1. Gagasan utama teks di atas adalah ...
A. a
B. b
Kunci: A`);
    expect(soal[0]!.warnings.some((w) => w.includes("[Bacaan]"))).toBe(true);
  });
});

describe("toImportPayload", () => {
  test("menandai isBenar sesuai kunci dan memakai poin yang dipilih", () => {
    const { soal } = parseSoalText(BASIC);
    const payload = toImportPayload(soal, 15);
    expect(payload[0]).toEqual({
      pertanyaan: "Nilai dari 2 + 3 adalah ...",
      tipe: "pilgan",
      poin: 15,
      pembahasan: "2 + 3 = 5.",
      pilihan: [
        { label: "A", isi: "4", isBenar: false },
        { label: "B", isi: "5", isBenar: true },
        { label: "C", isi: "6", isBenar: false },
        { label: "D", isi: "7", isBenar: false },
        { label: "E", isi: "8", isBenar: false },
      ],
    });
  });
});
