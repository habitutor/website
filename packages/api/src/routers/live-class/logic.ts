export const LIVE_CLASS_JOIN_OPEN_MINUTES = 15;

export type LiveClassCategory = "TKA" | "SNBT" | "MANDIRI";
export type LiveClassStatus = "upcoming" | "live" | "ended";
export type LiveClassLockReason = "premium" | "mandiri" | "tier";

const MINUTE_MS = 60_000;

/** Jadwal disimpan sebagai tanggal & jam WIB. */
export function toLiveClassStart(date: string, time: string) {
  return new Date(`${date}T${time}:00+07:00`);
}

export function getLiveClassTiming({
  date,
  time,
  durationMinutes,
  now = new Date(),
}: {
  date: string;
  time: string;
  durationMinutes: number;
  now?: Date;
}) {
  const startsAt = toLiveClassStart(date, time);
  const endsAt = new Date(startsAt.getTime() + durationMinutes * MINUTE_MS);
  const joinOpensAt = new Date(startsAt.getTime() - LIVE_CLASS_JOIN_OPEN_MINUTES * MINUTE_MS);
  const status: LiveClassStatus = now >= endsAt ? "ended" : now >= startsAt ? "live" : "upcoming";

  return { startsAt, endsAt, joinOpensAt, status, isJoinOpen: now >= joinOpensAt && now < endsAt };
}

/**
 * Semua kelas khusus premium; kelas MANDIRI hanya untuk pembeli Paket Sampai Mandiri.
 * Tier premium2 (paket lama) hanya bisa kelas "3x".
 */
export function getLiveClassLock({
  isAdmin,
  isPremium,
  isPremiumTier2,
  hasMandiriPackage,
  category,
  access,
}: {
  isAdmin: boolean;
  isPremium: boolean;
  isPremiumTier2: boolean;
  hasMandiriPackage: boolean;
  category: LiveClassCategory;
  access: "3x" | "5x";
}): LiveClassLockReason | null {
  if (isAdmin) return null;
  if (!isPremium) return "premium";
  if (category === "MANDIRI" && !hasMandiriPackage) return "mandiri";
  if (access === "5x" && isPremiumTier2) return "tier";
  return null;
}
