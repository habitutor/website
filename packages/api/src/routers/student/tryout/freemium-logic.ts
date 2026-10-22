import { isAdminRole } from "@habitutor/shared/auth-domain";

/**
 * Saklar gerbang freemium. true = siswa harus memenuhi syarat atau bayar sebelum mengerjakan TO.
 * Kembalikan ke false (PR satu baris) untuk membuka TO bagi semua siswa seperti semula.
 */
export const FREEMIUM_GATE_ENABLED = true;

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
 * Pembahasan lewat jalur freemium: TO tersebut sudah dibuka user dengan salah satu jatah pembahasannya.
 */
export function canViewFreemiumPembahasan(unlockedTryoutIds: readonly string[], tryoutId: string): boolean {
  return unlockedTryoutIds.includes(tryoutId);
}

export const FREEMIUM_PROOF_COUNT = 3;
const FREEMIUM_PROOF_MAX_LENGTH = 6_000_000;
const FREEMIUM_PROOF_PATTERN = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/;

/**
 * Bukti syarat: tepat 3 foto (Instagram, TikTok, share BC) dalam bentuk data URL gambar.
 * Mengembalikan pesan error, atau null kalau valid.
 */
export function validateRequirementProofs(proofs: readonly string[]): string | null {
  if (proofs.length !== FREEMIUM_PROOF_COUNT) {
    return `Upload ${FREEMIUM_PROOF_COUNT} foto bukti: follow Instagram, follow TikTok, dan share BC ke 5 grup WA`;
  }
  const invalid = proofs.some(
    (proof) => proof.length > FREEMIUM_PROOF_MAX_LENGTH || !FREEMIUM_PROOF_PATTERN.test(proof),
  );
  return invalid ? "Bukti harus berupa gambar PNG, JPG, atau WebP dengan ukuran wajar" : null;
}
