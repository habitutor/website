import { isAdminRole } from "@habitutor/shared/auth-domain";
import { FREEMIUM_FREE_TRYOUT_SLOTS, FREEMIUM_PRODUCT } from "../../../lib/constants";

/**
 * Saklar gerbang freemium. true = siswa harus memenuhi syarat atau bayar sebelum mengerjakan TO.
 * Kembalikan ke false (PR satu baris) untuk membuka TO bagi semua siswa seperti semula.
 */
export const FREEMIUM_GATE_ENABLED = true;

export const FREEMIUM_REQUIRED_MESSAGE =
  "Pilih TO ini dulu dengan jatah gratis atau Paket 3 TryOut untuk mulai mengerjakan";

export type FreemiumAccessRow = {
  requirementsCompletedAt: Date | null;
  paidAt: Date | null;
  pembahasanTryoutId: string | null;
};

export type FreemiumSelectionSource = "gratis" | "paket";

export type FreemiumSnapshot = {
  requirementsCompleted: boolean;
  /** Pembelian Rp10.000 di sistem lama: dihitung sebagai 1 Paket 3 TryOut. */
  legacyPaid: boolean;
  activePackageCount: number;
  selections: readonly { tryoutId: string; source: FreemiumSelectionSource }[];
  /** TO yang pernah dimulai user (punya sesi apa pun), urut dari yang pertama dikerjakan. */
  startedTryoutIds: readonly string[];
  purchasedPembahasanTryoutIds: readonly string[];
  /** Jatah pembahasan sistem lama yang sudah dipakai. */
  legacyCreditTryoutIds: readonly string[];
};

function slot(total: number, used: number) {
  return { total, used, remaining: Math.max(total - used, 0) };
}

export function summarizeFreemium(snapshot: FreemiumSnapshot) {
  const selectedIds = new Set(snapshot.selections.map((selection) => selection.tryoutId));
  // TO yang sudah dikerjakan sebelum ada sistem pilihan TO tetap bisa dibuka ulang dan dihitung sebagai jatah:
  // pembeli Rp10.000 lama memakai jatah paketnya, user gratis lama memakai jatah gratisnya.
  const hasLegacyAccess = snapshot.legacyPaid || snapshot.requirementsCompleted;
  const implicitIds = hasLegacyAccess ? snapshot.startedTryoutIds.filter((id) => !selectedIds.has(id)) : [];
  const implicitPackageIds = snapshot.legacyPaid ? implicitIds : [];
  const implicitFreeIds = snapshot.legacyPaid ? [] : implicitIds;

  const freeUsed = snapshot.selections.filter((selection) => selection.source === "gratis").length;
  const packageIds = snapshot.selections
    .filter((selection) => selection.source === "paket")
    .map((selection) => selection.tryoutId);
  // Pembelian Rp10.000 lama = 1 Paket 3 TryOut; pembahasannya untuk 3 TO pertama yang dikerjakan.
  const packageCount = snapshot.activePackageCount + (snapshot.legacyPaid ? 1 : 0);

  return {
    freeSlots: slot(snapshot.requirementsCompleted ? FREEMIUM_FREE_TRYOUT_SLOTS : 0, freeUsed + implicitFreeIds.length),
    packageSlots: slot(packageCount * FREEMIUM_PRODUCT.TRYOUT_SLOTS, packageIds.length + implicitPackageIds.length),
    startableTryoutIds: [...new Set([...selectedIds, ...implicitIds])],
    pembahasanTryoutIds: [
      ...new Set([
        ...packageIds,
        ...implicitPackageIds.slice(0, FREEMIUM_PRODUCT.TRYOUT_SLOTS),
        ...snapshot.purchasedPembahasanTryoutIds,
        ...snapshot.legacyCreditTryoutIds,
      ]),
    ],
  };
}

export type FreemiumSummary = ReturnType<typeof summarizeFreemium>;

/** Paket dipakai lebih dulu karena sudah termasuk pembahasan. */
export function pickSelectionSource(summary: FreemiumSummary): FreemiumSelectionSource | null {
  if (summary.packageSlots.remaining > 0) return "paket";
  if (summary.freeSlots.remaining > 0) return "gratis";
  return null;
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
  summary: FreemiumSummary;
  tryoutId: string;
  hasRunningSession: boolean;
  now?: Date;
}): boolean {
  const now = params.now ?? new Date();
  if (isAdminRole(params.role)) return true;
  if (hasActivePremium({ isPremium: params.isPremium, premiumExpiresAt: params.premiumExpiresAt, now })) return true;
  if (params.hasRunningSession) return true;
  return params.summary.startableTryoutIds.includes(params.tryoutId);
}

export function canViewFreemiumPembahasan(summary: FreemiumSummary, tryoutId: string): boolean {
  return summary.pembahasanTryoutIds.includes(tryoutId);
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
