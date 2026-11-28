export const REPORT_REASONS = {
  missing_context: "Gambar atau teks acuan tidak muncul",
  wrong_answer: "Jawaban atau pembahasan salah",
  broken: "Tulisan atau pilihan jawaban rusak",
  other: "Lainnya",
} as const;

export type ReportReason = keyof typeof REPORT_REASONS;

export const REPORT_NOTE_MAX = 300;
