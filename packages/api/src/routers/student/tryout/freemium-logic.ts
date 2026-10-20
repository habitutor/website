import { isAdminRole } from "@habitutor/shared/auth-domain";

/**
 * Saklar gerbang freemium. Biarkan false sampai tampilan siswa (dialog syarat/bayar) sudah live,
 * lalu ubah jadi true lewat PR terpisah.
 */
export const FREEMIUM_GATE_ENABLED = false;

export const FREEMIUM_REQUIRED_MESSAGE = "Selesaikan syarat atau bayar Rp10.000 untuk mulai mengerjakan TO";

export type FreemiumAccessRow = {
  requirementsCompletedAt: Date | null;
  paidAt: Date | null;
  pembahasanTryoutId: string | null;
};

type FreemiumAccess = FreemiumAccessRow | null | undefined;

export function hasFreemiumAccess(access: FreemiumAccess): boolean {
  return Boolean(access?.requirementsCompletedAt || access?.paidAt);
}

function hasActivePremium(params: {
  isPremium: boolean | null | undefined;
  premiumExpiresAt: Date | null | undefined;
  now: Date;
}): boolean {
  if (!params.isPremium) return false;
  if (!params.premiumExpiresAt) return true;
  return params.now < params.premiumExpiresAt;
}

export function canStartTryout(params: {
  role: string | null | undefined;
  isPremium: boolean | null | undefined;
  premiumExpiresAt: Date | null | undefined;
  access: FreemiumAccess;
  hasRunningSession: boolean;
  now?: Date;
}): boolean {
  const now = params.now ?? new Date();
  if (isAdminRole(params.role)) return true;
  if (hasActivePremium({ isPremium: params.isPremium, premiumExpiresAt: params.premiumExpiresAt, now })) return true;
  if (params.hasRunningSession) return true;
  return hasFreemiumAccess(params.access);
}

/**
 * Pembahasan lewat jalur freemium: harus sudah bayar dan TO tersebut adalah TO pilihannya.
 */
export function canViewFreemiumPembahasan(access: FreemiumAccess, tryoutId: string): boolean {
  if (!access?.paidAt) return false;
  return access.pembahasanTryoutId === tryoutId;
}
