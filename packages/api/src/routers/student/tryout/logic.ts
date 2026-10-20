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

export const SKOR_MINIMUM = 200;
export const SKOR_MAKSIMUM = 800;

/**
 * Konversi poin mentah ke skala 200-800 (linear, bukan IRT).
 */
export function hitungSkorSkala(poinDidapat: number, poinMaksimal: number): number {
  if (poinMaksimal <= 0) return SKOR_MINIMUM;
  const rasio = Math.min(Math.max(poinDidapat / poinMaksimal, 0), 1);
  return Math.round(SKOR_MINIMUM + rasio * (SKOR_MAKSIMUM - SKOR_MINIMUM));
}

/**
 * Rata-rata skor subtes. Subtes yang belum dikerjakan dihitung SKOR_MINIMUM.
 */
export function hitungRataRataSkor(skorSubtes: number[], jumlahSubtes: number): number {
  const pembagi = Math.max(jumlahSubtes, skorSubtes.length);
  if (pembagi === 0) return SKOR_MINIMUM;
  const belumDikerjakan = pembagi - skorSubtes.length;
  const jumlah = skorSubtes.reduce((total, skor) => total + skor, 0) + belumDikerjakan * SKOR_MINIMUM;
  return Math.round(jumlah / pembagi);
}
