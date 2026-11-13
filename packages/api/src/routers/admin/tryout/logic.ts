import { ORPCError } from "@orpc/server";

/**
 * Business logic untuk fitur Tryout
 */

export type TryoutErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_SERVER_ERROR";

export class TryoutError extends Error {
  code: TryoutErrorCode;

  constructor(code: TryoutErrorCode, message: string) {
    super(message);
    this.name = "TryoutError";
    this.code = code;
  }
}

export function toOrpcError(error: unknown, fallbackMessage: string): ORPCError<TryoutErrorCode, { message: string }> {
  if (error instanceof ORPCError) {
    return error as ORPCError<TryoutErrorCode, { message: string }>;
  }

  if (error instanceof TryoutError) {
    return new ORPCError(error.code, { data: { message: error.message } });
  }

  return new ORPCError("INTERNAL_SERVER_ERROR", {
    data: {
      message: error instanceof Error ? error.message : fallbackMessage,
    },
  });
}

/**
 * Fisher-Yates Shuffle - acak array dengan algoritma yang baik
 */
export function fisherYatesShuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i]!;
    result[i] = result[j]!;
    result[j] = temp;
  }
  return result;
}

/**
 * Hitung skor subtest berdasarkan jawaban yang benar dan poin
 */
export function hitungSkorSubtest(answers: Array<{ isBenar: boolean | null; poinDapat: number | null }>) {
  return answers.reduce((total, answer) => {
    if (answer.isBenar && answer.poinDapat) {
      return total + answer.poinDapat;
    }
    return total;
  }, 0);
}

/**
 * Hitung statistik jawaban (benar, salah, kosong)
 */
export function hitungStatistikJawaban(
  answers: Array<{
    isBenar: boolean | null;
    isDijawab: boolean;
  }>,
) {
  return {
    benar: answers.filter((a) => a.isDijawab && a.isBenar).length,
    salah: answers.filter((a) => a.isDijawab && !a.isBenar).length,
    kosong: answers.filter((a) => !a.isDijawab).length,
  };
}

/**
 * Cek apakah user berhak mengakses pembahasan
 */
export function checkPembahasanAccess(isPremium: boolean, premiumExpiresAt: Date | null): boolean {
  if (!isPremium) return false;
  if (!premiumExpiresAt) return false;
  return new Date() < premiumExpiresAt;
}

export const IMPORT_SOAL_MAX_BATCH = 200;
export const IMPORT_TEXT_MAX_LENGTH = 20000;
const IMPORT_LABELS = ["A", "B", "C", "D", "E"] as const;

export type ImportSoalInput = {
  pertanyaan: string;
  tipe: "pilgan" | "multiple";
  poin: number;
  pembahasan?: string | null;
  pilihan: Array<{ label: string; isi: string; isBenar: boolean }>;
};

/**
 * Validasi impor soal massal. Mengembalikan pesan error pertama, atau null jika valid.
 * Aturannya sama dengan yang dibutuhkan halaman siswa agar soal tampil dan dinilai dengan benar.
 */
export function validateImportSoal(items: ImportSoalInput[]): string | null {
  if (items.length === 0) return "Tidak ada soal untuk diimpor";
  if (items.length > IMPORT_SOAL_MAX_BATCH) return `Maksimal ${IMPORT_SOAL_MAX_BATCH} soal per impor`;

  for (const [index, item] of items.entries()) {
    const nomor = `Soal ke-${index + 1}`;
    if (!item.pertanyaan.trim()) return `${nomor}: pertanyaan kosong`;
    if (item.pertanyaan.length > IMPORT_TEXT_MAX_LENGTH) return `${nomor}: pertanyaan terlalu panjang`;
    if ((item.pembahasan?.length ?? 0) > IMPORT_TEXT_MAX_LENGTH) return `${nomor}: pembahasan terlalu panjang`;
    if (!Number.isInteger(item.poin) || item.poin < 1 || item.poin > 1000) return `${nomor}: poin harus 1–1000`;
    if (item.pilihan.length < 2) return `${nomor}: minimal 2 pilihan jawaban`;
    if (item.pilihan.length > IMPORT_LABELS.length) return `${nomor}: maksimal 5 pilihan jawaban`;

    for (const [i, opt] of item.pilihan.entries()) {
      if (opt.label !== IMPORT_LABELS[i]) return `${nomor}: label pilihan harus berurutan mulai dari A`;
      if (!opt.isi.trim()) return `${nomor}: pilihan ${opt.label} kosong`;
      if (opt.isi.length > IMPORT_TEXT_MAX_LENGTH) return `${nomor}: pilihan ${opt.label} terlalu panjang`;
    }

    const correct = item.pilihan.filter((opt) => opt.isBenar).length;
    if (correct === 0) return `${nomor}: belum ada kunci jawaban`;
    if (item.tipe === "pilgan" && correct > 1) return `${nomor}: pilihan ganda hanya boleh satu kunci jawaban`;
  }

  return null;
}
