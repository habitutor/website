export const EVENT_CATEGORIES = ["Masterclass", "Kelas Gratis PTN Tour", "Intensif"] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export const ACCESS_MODES = ["free", "premium", "mixed"] as const;
export type AccessMode = (typeof ACCESS_MODES)[number];

export const MATERIAL_UNLOCKS = ["after_register", "after_event"] as const;
export type MaterialUnlock = (typeof MATERIAL_UNLOCKS)[number];

/** Tombol Join Zoom aktif sekian menit sebelum acara dimulai. */
export const JOIN_OPENS_BEFORE_MS = 15 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type PtnTourErrorCode = "NOT_FOUND" | "FORBIDDEN" | "BAD_REQUEST" | "CONFLICT";

/** Galat bisnis yang dipetakan ke kode oRPC di router (bukan galat 500). */
export class PtnTourError extends Error {
  constructor(
    public readonly code: PtnTourErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "PtnTourError";
  }
}

export type EventPhase = "upcoming" | "live" | "ended";

export function getEndsAt(startsAt: Date, durationMinutes: number) {
  return new Date(startsAt.getTime() + durationMinutes * 60 * 1000);
}

/** upcoming = belum mulai, live = sedang berlangsung, ended = sudah selesai. */
export function getPhase(event: { startsAt: Date; durationMinutes: number }, now = new Date()): EventPhase {
  if (now.getTime() < event.startsAt.getTime()) return "upcoming";
  if (now.getTime() < getEndsAt(event.startsAt, event.durationMinutes).getTime()) return "live";
  return "ended";
}

/** Join Zoom dibuka 15 menit sebelum mulai sampai acara selesai. */
export function isJoinWindowOpen(event: { startsAt: Date; durationMinutes: number }, now = new Date()) {
  const opensAt = event.startsAt.getTime() - JOIN_OPENS_BEFORE_MS;
  return now.getTime() >= opensAt && now.getTime() < getEndsAt(event.startsAt, event.durationMinutes).getTime();
}

export type RecordingAccess =
  | { allowed: true; expiresAt: Date | null }
  | { allowed: false; reason: "not_registered" | "expired" | "not_ended" };

/**
 * Aturan rekaman: premium selamanya; akun gratis harus terdaftar dan hanya
 * dalam {freeDays} hari setelah event selesai (0 = tanpa batas).
 */
export function getRecordingAccess({
  isPremium,
  registered,
  endsAt,
  freeDays,
  now = new Date(),
}: {
  isPremium: boolean;
  registered: boolean;
  endsAt: Date;
  freeDays: number;
  now?: Date;
}): RecordingAccess {
  if (isPremium) return { allowed: true, expiresAt: null };
  if (!registered) return { allowed: false, reason: "not_registered" };
  if (freeDays <= 0) return { allowed: true, expiresAt: null };
  const expiresAt = new Date(endsAt.getTime() + freeDays * DAY_MS);
  if (now.getTime() > expiresAt.getTime()) return { allowed: false, reason: "expired" };
  return { allowed: true, expiresAt };
}

/** Materi terbuka kalau peserta berhak, dan (untuk "after_event") event sudah selesai. */
export function isMaterialUnlocked({
  eligible,
  unlockAt,
  phase,
}: {
  eligible: boolean;
  unlockAt: MaterialUnlock | string;
  phase: EventPhase;
}) {
  if (!eligible) return false;
  return unlockAt === "after_event" ? phase === "ended" : true;
}

export function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

/** Alamat internal (mis. /event-placeholder.svg) atau URL http(s) penuh. */
export function isValidAssetUrl(value: string) {
  return value.startsWith("/") || isValidHttpUrl(value);
}

export function parseDateOrThrow(value: string, label: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new PtnTourError("BAD_REQUEST", `${label} tidak valid.`);
  return date;
}

export function assertSlug(slug: string) {
  if (!SLUG_PATTERN.test(slug)) {
    throw new PtnTourError("BAD_REQUEST", "Slug hanya boleh huruf kecil, angka, dan tanda hubung (contoh: intro-snbt-2027).");
  }
}

export function assertOptionalUrl(value: string | null | undefined, label: string) {
  if (value && !isValidHttpUrl(value)) throw new PtnTourError("BAD_REQUEST", `${label} harus berupa tautan http(s) yang valid.`);
}

/** Nomor WA Indonesia sederhana: 08xx / 628xx / +628xx, 9-14 digit. */
export function normalizePhone(value: string) {
  const digits = value.replace(/[\s().-]/g, "");
  const match = digits.match(/^(?:\+?62|0)(8\d{7,12})$/);
  if (!match) throw new PtnTourError("BAD_REQUEST", "Nomor WhatsApp tidak valid. Gunakan format 08xxxxxxxxxx.");
  return `0${match[1]}`;
}

export const EVENT_SUBJECTS = ["PU", "PK", "Literasi", "TKA", "Strategi"] as const;

export function normalizeSubjects(values: readonly string[]) {
  const allowed = new Set<string>(EVENT_SUBJECTS);
  const unique = Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
  const invalid = unique.find((value) => !allowed.has(value));
  if (invalid) throw new PtnTourError("BAD_REQUEST", `Subtes "${invalid}" tidak dikenal.`);
  return unique;
}

/** Batas bukti: follow maks 5 gambar, share maks 10 gambar, masing-masing minimal 1 untuk akun gratis. */
export const MAX_FOLLOW_PROOFS = 5;
export const MAX_SHARE_PROOFS = 10;
export const MAX_PROOF_LENGTH = 450_000; // karakter data URL; klien mengompres gambar sebelum kirim
const PROOF_PATTERN = /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/;

export function validateProofs({ follow, share, required }: { follow: readonly string[]; share: readonly string[]; required: boolean }) {
  if (required && (follow.length < 1 || share.length < 1)) {
    throw new PtnTourError("BAD_REQUEST", "Unggah minimal 1 screenshot follow dan 1 screenshot share poster.");
  }
  if (follow.length > MAX_FOLLOW_PROOFS) throw new PtnTourError("BAD_REQUEST", `Screenshot follow maksimal ${MAX_FOLLOW_PROOFS} gambar.`);
  if (share.length > MAX_SHARE_PROOFS) throw new PtnTourError("BAD_REQUEST", `Screenshot share maksimal ${MAX_SHARE_PROOFS} gambar.`);
  for (const proof of [...follow, ...share]) {
    if (proof.length > MAX_PROOF_LENGTH || !PROOF_PATTERN.test(proof)) {
      throw new PtnTourError("BAD_REQUEST", "Bukti harus berupa gambar PNG, JPG, atau WebP dengan ukuran wajar.");
    }
  }
}

/** Event khusus Premium hanya bisa didaftar/diikuti member Premium. */
export const SCHEDULE_STATUSES = ["normal", "rescheduled", "cancelled"] as const;

export function canAttend({ accessMode, isPremium }: { accessMode: string; isPremium: boolean }) {
  return accessMode !== "premium" || isPremium;
}

/** Event campuran: live gratis, tetapi rekamannya khusus Premium. */
export function isRecordingPremiumOnly({ accessMode }: { accessMode: string }) {
  return accessMode === "mixed" || accessMode === "premium";
}

const HOUR_MS = 60 * 60 * 1000;

/** Reminder H-1: dikirim saat sisa waktu <= 24 jam tetapi masih > 1 jam (jangan menimpa reminder 1 jam). */
export function isDayReminderDue(startsAt: Date, now = new Date()) {
  const remaining = startsAt.getTime() - now.getTime();
  return remaining <= 24 * HOUR_MS && remaining > HOUR_MS;
}

/** Reminder 1 jam: dikirim saat sisa waktu <= 1 jam dan acara belum mulai. */
export function isHourReminderDue(startsAt: Date, now = new Date()) {
  const remaining = startsAt.getTime() - now.getTime();
  return remaining <= HOUR_MS && remaining > 0;
}

export const PROOF_RETENTION_DAYS = 60;

export const DEFAULT_SETTINGS = {
  whatsapp_channel_url: "https://whatsapp.com/channel/0029Vb8B01GLCoWsj02Zwd0e",
  promo_title: "Siap lanjut belajar lebih serius?",
  promo_text: "Premium membuka live class, semua rekaman event, dan bank soal lengkap untuk SNBT.",
  promo_cta_label: "Lihat Paket Premium",
  promo_cta_url: "/premium",
  // Total peserta sejak PTN Tour pertama (termasuk sebelum ada website), diisi admin. Kosong = disembunyikan.
  hero_participants: "",
  show_event_counts: "true",
} as const;
export type SettingKey = keyof typeof DEFAULT_SETTINGS;
export const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS) as SettingKey[];

/**
 * Angka peserta yang boleh dilihat publik. Penuh atau tidaknya selalu dari pendaftar asli; angka isian admin hanya
 * untuk tampilan. quota dan spotsLeft tetap dikirim sebagai null supaya web versi lama tidak rusak saat rilis.
 */
export function toPublicSpots(input: {
  quota: number | null;
  registered: number;
  shownByAdmin: number | null;
  ended: boolean;
}) {
  return {
    registrationCount: input.shownByAdmin ?? input.registered,
    quota: null,
    spotsLeft: null,
    isFull: !input.ended && input.quota !== null && input.registered >= input.quota,
  };
}
