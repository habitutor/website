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
