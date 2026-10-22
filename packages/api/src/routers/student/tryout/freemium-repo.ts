import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { tryoutFreemiumAccess, tryoutFreemiumCredit } from "@habitutor/db/schema/freemium";
import { tryout, tryoutSesi, tryoutSoal, tryoutSubtes } from "@habitutor/db/schema/tryout";
import { user } from "@habitutor/db/schema/user";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import {
  canStartTryout,
  FREEMIUM_GATE_ENABLED,
  FREEMIUM_PROOF_COUNT,
  FREEMIUM_REQUIRED_MESSAGE,
  type FreemiumAccessRow,
  validateRequirementProofs,
} from "./freemium-logic";
import { TryoutError } from "./logic";
import { uploadTryoutImage } from "../../../lib/cloudinary";

type Db = { db?: DrizzleDatabase };

async function getAccess({ db = defaultDb, userId }: Db & { userId: string }): Promise<FreemiumAccessRow | null> {
  const [row] = await db
    .select({
      requirementsCompletedAt: tryoutFreemiumAccess.requirementsCompletedAt,
      paidAt: tryoutFreemiumAccess.paidAt,
      pembahasanTryoutId: tryoutFreemiumAccess.pembahasanTryoutId,
    })
    .from(tryoutFreemiumAccess)
    .where(eq(tryoutFreemiumAccess.userId, userId))
    .limit(1);

  return row ?? null;
}

async function getCreditSummary({ db = defaultDb, userId }: Db & { userId: string }) {
  const rows = await db
    .select({ tryoutId: tryoutFreemiumCredit.tryoutId })
    .from(tryoutFreemiumCredit)
    .where(eq(tryoutFreemiumCredit.userId, userId));

  const unlockedTryoutIds = rows.map((row) => row.tryoutId).filter((id): id is string => id !== null);
  return { unlockedTryoutIds, hasUnusedCredit: rows.length > unlockedTryoutIds.length };
}

async function getStatus({ db = defaultDb, userId, tryoutId }: Db & { userId: string; tryoutId?: string }) {
  const [userRow] = await db
    .select({ role: user.role, isPremium: user.isPremium, premiumExpiresAt: user.premiumExpiresAt })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  const access = await getAccess({ db, userId });
  const credit = await getCreditSummary({ db, userId });

  let hasRunningSession = false;
  if (tryoutId) {
    const [running] = await db
      .select({ id: tryoutSesi.id })
      .from(tryoutSesi)
      .where(and(eq(tryoutSesi.userId, userId), eq(tryoutSesi.tryoutId, tryoutId), eq(tryoutSesi.status, "berjalan")))
      .limit(1);
    hasRunningSession = Boolean(running);
  }

  const allowed = canStartTryout({
    role: userRow?.role,
    isPremium: userRow?.isPremium,
    premiumExpiresAt: userRow?.premiumExpiresAt,
    access,
    hasRunningSession,
  });

  return {
    gateEnabled: FREEMIUM_GATE_ENABLED,
    hasAccess: !FREEMIUM_GATE_ENABLED || allowed,
    requirementsCompleted: Boolean(access?.requirementsCompletedAt),
    paid: Boolean(access?.paidAt),
    hasUnusedCredit: credit.hasUnusedCredit,
    unlockedTryoutIds: credit.unlockedTryoutIds,
  };
}

async function assertCanStartTryout({ db = defaultDb, userId, tryoutId }: Db & { userId: string; tryoutId: string }) {
  if (!FREEMIUM_GATE_ENABLED) return;

  const status = await getStatus({ db, userId, tryoutId });
  if (!status.hasAccess) {
    throw new TryoutError("FORBIDDEN", FREEMIUM_REQUIRED_MESSAGE);
  }
}

async function completeRequirements({
  db = defaultDb,
  userId,
  proofs,
}: Db & { userId: string; proofs: readonly string[] }) {
  const invalidMessage = validateRequirementProofs(proofs);
  if (invalidMessage) {
    throw new TryoutError("BAD_REQUEST", invalidMessage);
  }

  const uploaded = await Promise.all(proofs.map((proof) => uploadTryoutImage(proof, "habitutor/freemium/bukti")));
  const proofUrls = uploaded.filter((url) => url.startsWith("http"));

  await db
    .insert(tryoutFreemiumAccess)
    .values({ userId, requirementsCompletedAt: new Date(), requirementsProofUrls: proofUrls })
    .onConflictDoUpdate({
      target: tryoutFreemiumAccess.userId,
      set: {
        requirementsCompletedAt: sql`COALESCE(${tryoutFreemiumAccess.requirementsCompletedAt}, now())`,
        requirementsProofUrls: proofUrls,
        updatedAt: new Date(),
      },
    });

  return { proofCount: Math.min(proofUrls.length, FREEMIUM_PROOF_COUNT) };
}

async function activatePaid({
  db = defaultDb,
  userId,
  transactionId,
}: Db & { userId: string; transactionId?: string }) {
  await db
    .insert(tryoutFreemiumAccess)
    .values({ userId, paidAt: new Date() })
    .onConflictDoUpdate({
      target: tryoutFreemiumAccess.userId,
      set: {
        paidAt: sql`COALESCE(${tryoutFreemiumAccess.paidAt}, now())`,
        updatedAt: new Date(),
      },
    });

  if (transactionId) {
    await db
      .insert(tryoutFreemiumCredit)
      .values({ userId, transactionId })
      .onConflictDoNothing({ target: tryoutFreemiumCredit.transactionId });
    return;
  }

  // Aktivasi manual admin: tambah 1 jatah hanya kalau user belum punya jatah yang menganggur.
  const { hasUnusedCredit } = await getCreditSummary({ db, userId });
  if (!hasUnusedCredit) {
    await db.insert(tryoutFreemiumCredit).values({ userId });
  }
}

async function revokePaid({ db = defaultDb, userId, transactionId }: Db & { userId: string; transactionId: string }) {
  await db
    .delete(tryoutFreemiumCredit)
    .where(and(eq(tryoutFreemiumCredit.userId, userId), eq(tryoutFreemiumCredit.transactionId, transactionId)));

  const [remaining] = await db
    .select({ id: tryoutFreemiumCredit.id })
    .from(tryoutFreemiumCredit)
    .where(eq(tryoutFreemiumCredit.userId, userId))
    .limit(1);

  if (!remaining) {
    await db
      .update(tryoutFreemiumAccess)
      .set({ paidAt: null, updatedAt: new Date() })
      .where(eq(tryoutFreemiumAccess.userId, userId));
  }
}

async function getTryoutIdBySoal({ db = defaultDb, soalId }: Db & { soalId: string }): Promise<string | null> {
  const [row] = await db
    .select({ tryoutId: tryoutSubtes.tryoutId })
    .from(tryoutSoal)
    .innerJoin(tryoutSubtes, eq(tryoutSoal.subtesId, tryoutSubtes.id))
    .where(eq(tryoutSoal.id, soalId))
    .limit(1);

  return row?.tryoutId ?? null;
}

async function selectPembahasanTryout({ db = defaultDb, userId, tryoutId }: Db & { userId: string; tryoutId: string }) {
  const access = await getAccess({ db, userId });

  if (!access?.paidAt) {
    throw new TryoutError("FORBIDDEN", "Aktifkan akses freemium (Rp10.000) terlebih dahulu");
  }

  const credit = await getCreditSummary({ db, userId });
  if (credit.unlockedTryoutIds.includes(tryoutId)) {
    throw new TryoutError("CONFLICT", "Pembahasan TO ini sudah terbuka");
  }
  if (!credit.hasUnusedCredit) {
    throw new TryoutError("FORBIDDEN", "Jatah pembahasan habis. Bayar Rp10.000 lagi untuk membuka pembahasan TO lain");
  }

  const [target] = await db
    .select({ id: tryout.id })
    .from(tryout)
    .where(and(eq(tryout.id, tryoutId), eq(tryout.status, "published")))
    .limit(1);
  if (!target) {
    throw new TryoutError("NOT_FOUND", "Tryout tidak ditemukan");
  }

  const [finished] = await db
    .select({ id: tryoutSesi.id })
    .from(tryoutSesi)
    .where(
      and(
        eq(tryoutSesi.userId, userId),
        eq(tryoutSesi.tryoutId, tryoutId),
        inArray(tryoutSesi.status, ["selesai", "expired"]),
      ),
    )
    .limit(1);
  if (!finished) {
    throw new TryoutError("BAD_REQUEST", "Selesaikan TO ini terlebih dahulu sebelum membuka pembahasannya");
  }

  const [unused] = await db
    .select({ id: tryoutFreemiumCredit.id })
    .from(tryoutFreemiumCredit)
    .where(and(eq(tryoutFreemiumCredit.userId, userId), isNull(tryoutFreemiumCredit.tryoutId)))
    .limit(1);

  const claimed = unused
    ? await db
        .update(tryoutFreemiumCredit)
        .set({ tryoutId })
        .where(and(eq(tryoutFreemiumCredit.id, unused.id), isNull(tryoutFreemiumCredit.tryoutId)))
        .returning({ id: tryoutFreemiumCredit.id })
    : [];
  if (claimed.length === 0) {
    throw new TryoutError("CONFLICT", "Jatah pembahasan sudah terpakai");
  }

  return { pembahasanTryoutId: tryoutId };
}

export const freemiumRepo = {
  getAccess,
  getCreditSummary,
  getStatus,
  assertCanStartTryout,
  completeRequirements,
  activatePaid,
  revokePaid,
  getTryoutIdBySoal,
  selectPembahasanTryout,
};
