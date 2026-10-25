import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import {
  tryoutFreemiumAccess,
  tryoutFreemiumCredit,
  tryoutFreemiumPurchase,
  tryoutFreemiumSelection,
} from "@habitutor/db/schema/freemium";
import { tryout, tryoutSesi, tryoutSoal, tryoutSubtes } from "@habitutor/db/schema/tryout";
import { user } from "@habitutor/db/schema/user";
import { and, desc, eq, inArray, isNotNull, isNull, min, sql } from "drizzle-orm";
import {
  canStartTryout,
  canViewFreemiumPembahasan,
  FREEMIUM_GATE_ENABLED,
  FREEMIUM_PROOF_COUNT,
  FREEMIUM_REQUIRED_MESSAGE,
  type FreemiumAccessRow,
  pickSelectionSource,
  summarizeFreemium,
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

async function getSnapshot({ db = defaultDb, userId }: Db & { userId: string }) {
  const [access, credit, purchases, selections, started] = await Promise.all([
    getAccess({ db, userId }),
    getCreditSummary({ db, userId }),
    db
      .select({ kind: tryoutFreemiumPurchase.kind, tryoutId: tryoutFreemiumPurchase.tryoutId })
      .from(tryoutFreemiumPurchase)
      .where(and(eq(tryoutFreemiumPurchase.userId, userId), isNotNull(tryoutFreemiumPurchase.activatedAt))),
    db
      .select({ tryoutId: tryoutFreemiumSelection.tryoutId, source: tryoutFreemiumSelection.source })
      .from(tryoutFreemiumSelection)
      .where(eq(tryoutFreemiumSelection.userId, userId))
      .orderBy(tryoutFreemiumSelection.createdAt),
    db
      .select({ tryoutId: tryoutSesi.tryoutId })
      .from(tryoutSesi)
      .where(eq(tryoutSesi.userId, userId))
      .groupBy(tryoutSesi.tryoutId)
      .orderBy(min(tryoutSesi.mulaiAt)),
  ]);

  return {
    credit,
    snapshot: {
      requirementsCompleted: Boolean(access?.requirementsCompletedAt),
      legacyPaid: Boolean(access?.paidAt),
      activePackageCount: purchases.filter((purchase) => purchase.kind === "paket").length,
      selections,
      startedTryoutIds: started.map((row) => row.tryoutId),
      purchasedPembahasanTryoutIds: purchases.flatMap((purchase) =>
        purchase.kind === "pembahasan" && purchase.tryoutId ? [purchase.tryoutId] : [],
      ),
      legacyCreditTryoutIds: credit.unlockedTryoutIds,
    },
  };
}

async function getSummary({ db = defaultDb, userId }: Db & { userId: string }) {
  const { snapshot } = await getSnapshot({ db, userId });
  return summarizeFreemium(snapshot);
}

async function getStatus({ db = defaultDb, userId, tryoutId }: Db & { userId: string; tryoutId?: string }) {
  const [userRow] = await db
    .select({ role: user.role, isPremium: user.isPremium, premiumExpiresAt: user.premiumExpiresAt })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  const { snapshot, credit } = await getSnapshot({ db, userId });
  const summary = summarizeFreemium(snapshot);

  let hasRunningSession = false;
  if (tryoutId) {
    const [running] = await db
      .select({ id: tryoutSesi.id })
      .from(tryoutSesi)
      .where(and(eq(tryoutSesi.userId, userId), eq(tryoutSesi.tryoutId, tryoutId), eq(tryoutSesi.status, "berjalan")))
      .limit(1);
    hasRunningSession = Boolean(running);
  }

  const accessParams = {
    role: userRow?.role,
    isPremium: userRow?.isPremium,
    premiumExpiresAt: userRow?.premiumExpiresAt,
    summary,
  };
  // Tanpa TO tertentu dan tanpa sesi berjalan: true hanya kalau user boleh mengerjakan semua TO.
  const fullAccess =
    !FREEMIUM_GATE_ENABLED || canStartTryout({ ...accessParams, tryoutId: "", hasRunningSession: false });
  const startedIds = new Set(snapshot.startedTryoutIds);

  return {
    gateEnabled: FREEMIUM_GATE_ENABLED,
    fullAccess,
    canStartTryout: tryoutId ? fullAccess || canStartTryout({ ...accessParams, tryoutId, hasRunningSession }) : null,
    requirementsCompleted: snapshot.requirementsCompleted,
    hasPackage: snapshot.activePackageCount > 0 || snapshot.legacyPaid,
    hasPembahasanPurchase: snapshot.purchasedPembahasanTryoutIds.length > 0,
    freeSlots: summary.freeSlots,
    packageSlots: summary.packageSlots,
    selections: snapshot.selections.map((selection) => ({
      ...selection,
      started: startedIds.has(selection.tryoutId),
    })),
    startableTryoutIds: summary.startableTryoutIds,
    pembahasanTryoutIds: summary.pembahasanTryoutIds,
    // Sistem lama: pembeli Rp10.000 sebelum ada pilihan TO.
    paid: snapshot.legacyPaid,
    hasUnusedCredit: credit.hasUnusedCredit,
    unlockedTryoutIds: credit.unlockedTryoutIds,
  };
}

async function assertCanStartTryout({ db = defaultDb, userId, tryoutId }: Db & { userId: string; tryoutId: string }) {
  if (!FREEMIUM_GATE_ENABLED) return;

  const status = await getStatus({ db, userId, tryoutId });
  if (!status.canStartTryout) {
    throw new TryoutError("FORBIDDEN", FREEMIUM_REQUIRED_MESSAGE);
  }
}

async function canViewPembahasan({ db = defaultDb, userId, tryoutId }: Db & { userId: string; tryoutId: string }) {
  return canViewFreemiumPembahasan(await getSummary({ db, userId }), tryoutId);
}

async function assertPublishedTryout({ db = defaultDb, tryoutId }: Db & { tryoutId: string }) {
  const [target] = await db
    .select({ id: tryout.id })
    .from(tryout)
    .where(and(eq(tryout.id, tryoutId), eq(tryout.status, "published")))
    .limit(1);
  if (!target) {
    throw new TryoutError("NOT_FOUND", "Tryout tidak ditemukan");
  }
}

async function hasFinishedTryout({ db = defaultDb, userId, tryoutId }: Db & { userId: string; tryoutId: string }) {
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
  return Boolean(finished);
}

// Serialisasi perubahan jatah per user supaya klik ganda tidak memakai slot dua kali.
async function lockUser(db: DrizzleDatabase, userId: string) {
  await db.execute(sql`select pg_advisory_xact_lock(hashtext(${"freemium:" + userId}))`);
}

async function selectTryout({ db = defaultDb, userId, tryoutId }: Db & { userId: string; tryoutId: string }) {
  await assertPublishedTryout({ db, tryoutId });

  return db.transaction(async (trx) => {
    await lockUser(trx, userId);
    const summary = await getSummary({ db: trx, userId });

    if (summary.startableTryoutIds.includes(tryoutId)) {
      throw new TryoutError("CONFLICT", "TO ini sudah kamu pilih");
    }

    const source = pickSelectionSource(summary);
    if (!source) {
      throw new TryoutError("FORBIDDEN", "Jatah TO kamu sudah habis. Beli Paket 3 TryOut untuk menambah 3 TO");
    }

    await trx.insert(tryoutFreemiumSelection).values({ userId, tryoutId, source });
    return { tryoutId, source };
  });
}

/** Ganti pilihan: TO yang belum pernah dimulai boleh dilepas supaya jatahnya bisa dipakai untuk TO lain. */
async function unselectTryout({ db = defaultDb, userId, tryoutId }: Db & { userId: string; tryoutId: string }) {
  return db.transaction(async (trx) => {
    await lockUser(trx, userId);

    const [started] = await trx
      .select({ id: tryoutSesi.id })
      .from(tryoutSesi)
      .where(and(eq(tryoutSesi.userId, userId), eq(tryoutSesi.tryoutId, tryoutId)))
      .limit(1);
    if (started) {
      throw new TryoutError("CONFLICT", "TO yang sudah mulai dikerjakan tidak bisa diganti");
    }

    const removed = await trx
      .delete(tryoutFreemiumSelection)
      .where(and(eq(tryoutFreemiumSelection.userId, userId), eq(tryoutFreemiumSelection.tryoutId, tryoutId)))
      .returning({ id: tryoutFreemiumSelection.id });
    if (removed.length === 0) {
      throw new TryoutError("NOT_FOUND", "TO ini belum kamu pilih");
    }

    return { tryoutId };
  });
}

/** Catat pembelian saat checkout; baru berlaku setelah activatePurchase dari pembayaran terverifikasi. */
async function createPurchase({
  db = defaultDb,
  userId,
  transactionId,
  kind,
  tryoutId,
}: Db & { userId: string; transactionId: string; kind: "paket" | "pembahasan"; tryoutId?: string }) {
  await db.insert(tryoutFreemiumPurchase).values({ userId, transactionId, kind, tryoutId });
}

/** Idempoten: webhook/polling yang berulang tidak menambah jatah. */
async function activatePurchase({
  db = defaultDb,
  userId,
  transactionId,
  kind,
}: Db & { userId: string; transactionId: string; kind: "paket" | "pembahasan" }) {
  await db
    .insert(tryoutFreemiumPurchase)
    .values({ userId, transactionId, kind, activatedAt: new Date() })
    .onConflictDoUpdate({
      target: tryoutFreemiumPurchase.transactionId,
      set: { activatedAt: sql`COALESCE(${tryoutFreemiumPurchase.activatedAt}, now())` },
    });
}

/** Pemberian manual admin: satu Paket 3 TryOut. */
async function grantPackage({ db = defaultDb, userId }: Db & { userId: string }) {
  await db.insert(tryoutFreemiumPurchase).values({ userId, kind: "paket", activatedAt: new Date() });
}

/** Pembayaran yang dibatalkan setelah sukses: cabut pembelian dan lepas pilihan paket yang melebihi jatah. */
async function revokePurchase({
  db = defaultDb,
  userId,
  transactionId,
}: Db & { userId: string; transactionId: string }) {
  await db
    .update(tryoutFreemiumPurchase)
    .set({ activatedAt: null })
    .where(and(eq(tryoutFreemiumPurchase.userId, userId), eq(tryoutFreemiumPurchase.transactionId, transactionId)));

  const summary = await getSummary({ db, userId });
  const excess = summary.packageSlots.used - summary.packageSlots.total;
  if (excess > 0) {
    const newest = await db
      .select({ id: tryoutFreemiumSelection.id })
      .from(tryoutFreemiumSelection)
      .where(and(eq(tryoutFreemiumSelection.userId, userId), eq(tryoutFreemiumSelection.source, "paket")))
      .orderBy(desc(tryoutFreemiumSelection.createdAt))
      .limit(excess);
    await db.delete(tryoutFreemiumSelection).where(
      inArray(
        tryoutFreemiumSelection.id,
        newest.map((row) => row.id),
      ),
    );
  }

  await revokePaid({ db, userId, transactionId });
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

/** Sistem lama: cabut jatah pembahasan dari pembelian Rp10.000 sebelum ada pilihan TO. */
async function revokePaid({ db = defaultDb, userId, transactionId }: Db & { userId: string; transactionId: string }) {
  const removed = await db
    .delete(tryoutFreemiumCredit)
    .where(and(eq(tryoutFreemiumCredit.userId, userId), eq(tryoutFreemiumCredit.transactionId, transactionId)))
    .returning({ id: tryoutFreemiumCredit.id });
  if (removed.length === 0) return;

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

/** Sistem lama: pakai jatah pembahasan dari pembelian Rp10.000 sebelum ada pilihan TO. */
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

  await assertPublishedTryout({ db, tryoutId });
  if (!(await hasFinishedTryout({ db, userId, tryoutId }))) {
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
  getSummary,
  getStatus,
  assertCanStartTryout,
  canViewPembahasan,
  hasFinishedTryout,
  completeRequirements,
  selectTryout,
  unselectTryout,
  createPurchase,
  activatePurchase,
  grantPackage,
  revokePurchase,
  getTryoutIdBySoal,
  selectPembahasanTryout,
};
