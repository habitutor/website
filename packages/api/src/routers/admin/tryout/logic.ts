/**
 * Business logic untuk fitur Tryout
 */

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
