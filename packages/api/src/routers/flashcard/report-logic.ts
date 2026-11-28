import { REPORT_NOTE_MAX } from "@habitutor/shared/question-report";

export type { ReportReason } from "@habitutor/shared/question-report";

export const DAILY_REPORT_LIMIT = 3;
export const REPORTERS_TO_HOLD_AFTER_FIX = 3;
export const SESSION_QUESTION_COUNT = 5;

/**
 * Satu soal per sesi boleh dilewati lewat laporan. Soal yang sudah dijawab tidak pernah dihapus, supaya laporan
 * tidak bisa dipakai membuang jawaban salah dari skor.
 */
export function checkReport({
  reportsToday,
  questionsInAttempt,
  answered,
}: {
  reportsToday: number;
  questionsInAttempt: number;
  answered: boolean;
}) {
  if (reportsToday >= DAILY_REPORT_LIMIT) return { allowed: false, skip: false };
  return { allowed: true, skip: !answered && questionsInAttempt >= SESSION_QUESTION_COUNT };
}

export function normalizeReportNote(note: string | undefined) {
  return note?.trim().slice(0, REPORT_NOTE_MAX) || null;
}
