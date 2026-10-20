import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { tryoutFreemiumAccess } from "@habitutor/db/schema/freemium";
import { tryout, tryoutSesi, tryoutSoal, tryoutSubtes } from "@habitutor/db/schema/tryout";
import { user } from "@habitutor/db/schema/user";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import {
  canStartTryout,
  FREEMIUM_GATE_ENABLED,
  FREEMIUM_REQUIRED_MESSAGE,
  type FreemiumAccessRow,
} from "./freemium-logic";
import { TryoutError } from "./logic";

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

async function getStatus({ db = defaultDb, userId, tryoutId }: Db & { userId: string; tryoutId?: string }) {
  const [userRow] = await db
    .select({ role: user.role, isPremium: user.isPremium, premiumExpiresAt: user.premiumExpiresAt })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  const access = await getAccess({ db, userId });

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
    pembahasanTryoutId: access?.pembahasanTryoutId ?? null,
  };
}

async function assertCanStartTryout({ db = defaultDb, userId, tryoutId }: Db & { userId: string; tryoutId: string }) {
  if (!FREEMIUM_GATE_ENABLED) return;

  const status = await getStatus({ db, userId, tryoutId });
  if (!status.hasAccess) {
    throw new TryoutError("FORBIDDEN", FREEMIUM_REQUIRED_MESSAGE);
  }
}

async function completeRequirements({ db = defaultDb, userId }: Db & { userId: string }) {
  await db
    .insert(tryoutFreemiumAccess)
    .values({ userId, requirementsCompletedAt: new Date() })
    .onConflictDoUpdate({
      target: tryoutFreemiumAccess.userId,
      set: {
        requirementsCompletedAt: sql`COALESCE(${tryoutFreemiumAccess.requirementsCompletedAt}, now())`,
        updatedAt: new Date(),
      },
    });
}

async function activatePaid({ db = defaultDb, userId }: Db & { userId: string }) {
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
  if (access.pembahasanTryoutId) {
    throw new TryoutError("CONFLICT", "TO pembahasan sudah dipilih dan tidak bisa diganti");
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

  const updated = await db
    .update(tryoutFreemiumAccess)
    .set({ pembahasanTryoutId: tryoutId, updatedAt: new Date() })
    .where(and(eq(tryoutFreemiumAccess.userId, userId), isNull(tryoutFreemiumAccess.pembahasanTryoutId)))
    .returning({ userId: tryoutFreemiumAccess.userId });
  if (updated.length === 0) {
    throw new TryoutError("CONFLICT", "TO pembahasan sudah dipilih dan tidak bisa diganti");
  }

  return { pembahasanTryoutId: tryoutId };
}

export const freemiumRepo = {
  getAccess,
  getStatus,
  assertCanStartTryout,
  completeRequirements,
  activatePaid,
  getTryoutIdBySoal,
  selectPembahasanTryout,
};
