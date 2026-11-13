import { db as defaultDb, type DrizzleDatabase } from "@habitutor/db";
import { ptnTourEvent, ptnTourMaterial, ptnTourRegistration } from "@habitutor/db/schema/ptn-tour";
import { user } from "@habitutor/db/schema/user";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import {
  getEndsAt,
  getPhase,
  getRecordingAccess,
  isJoinWindowOpen,
  isMaterialUnlocked,
  normalizePhone,
  PtnTourError,
} from "./logic";

type EventRow = typeof ptnTourEvent.$inferSelect;
type EventInsert = typeof ptnTourEvent.$inferInsert;
type MaterialInsert = typeof ptnTourMaterial.$inferInsert;

type Viewer = { userId?: string; isPremium?: boolean };

// Di dalam subquery mentah, kolom harus dikualifikasi penuh; jika tidak, "id" terbaca sebagai id tabel registrasi.
const eventIdRef = sql.raw('"ptn_tour_event"."id"');

function isUniqueViolation(error: unknown) {
  const code = (error as { code?: string; cause?: { code?: string } })?.code ?? (error as { cause?: { code?: string } })?.cause?.code;
  return code === "23505";
}

/**
 * Bentuk event untuk publik. Tautan Zoom dan rekaman TIDAK pernah ikut terkirim:
 * keduanya hanya lewat endpoint join/watch yang memeriksa hak akses di server.
 * Tautan grup WA hanya dikirim ke peserta yang sudah terdaftar.
 */
function toPublicEvent(
  row: EventRow,
  extra: { registrationCount: number; registered: boolean; bonus: string[] },
  now = new Date(),
) {
  const endsAt = getEndsAt(row.startsAt, row.durationMinutes);
  const phase = getPhase(row, now);
  const spotsLeft = row.quota === null ? null : Math.max(0, row.quota - extra.registrationCount);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    description: row.description,
    longDescription: row.longDescription,
    rundown: row.rundown,
    tutor: row.tutor,
    campus: row.campus,
    posterUrl: row.posterUrl,
    startsAt: row.startsAt,
    endsAt,
    durationMinutes: row.durationMinutes,
    accessMode: row.accessMode,
    quota: row.quota,
    registrationCount: extra.registrationCount,
    spotsLeft,
    isFull: spotsLeft === 0 && phase !== "ended",
    phase,
    hasRecording: Boolean(row.recordingUrl),
    recordingFreeDays: row.recordingFreeDays,
    registered: extra.registered,
    joinOpen: isJoinWindowOpen(row, now),
    whatsappGroupUrl: extra.registered ? row.whatsappGroupUrl : null,
    bonus: extra.bonus,
  };
}

export const ptnTourRepo = {
  // ---------------------------------------------------------------- publik
  list: async ({ db = defaultDb, userId, onlyRegistered }: { db?: DrizzleDatabase; userId?: string; onlyRegistered?: boolean }) => {
    const rows = await db
      .select({
        event: ptnTourEvent,
        registrationCount: sql<number>`cast((select count(*) from ${ptnTourRegistration} r where r.event_id = ${eventIdRef}) as integer)`,
        registered: userId
          ? sql<boolean>`exists (select 1 from ${ptnTourRegistration} r where r.event_id = ${eventIdRef} and r.user_id = ${userId})`
          : sql<boolean>`false`,
      })
      .from(ptnTourEvent)
      .where(eq(ptnTourEvent.isPublished, true))
      .orderBy(asc(ptnTourEvent.startsAt));

    const ids = rows.map((row) => row.event.id);
    const materials = ids.length
      ? await db
          .select({ eventId: ptnTourMaterial.eventId, label: ptnTourMaterial.label })
          .from(ptnTourMaterial)
          .where(and(inArray(ptnTourMaterial.eventId, ids), eq(ptnTourMaterial.isPublished, true)))
          .orderBy(asc(ptnTourMaterial.sortOrder), asc(ptnTourMaterial.id))
      : [];
    const bonusByEvent = new Map<number, string[]>();
    for (const material of materials) {
      bonusByEvent.set(material.eventId, [...(bonusByEvent.get(material.eventId) ?? []), material.label]);
    }

    const now = new Date();
    return rows
      .map((row) =>
        toPublicEvent(row.event, {
          registrationCount: Number(row.registrationCount),
          registered: Boolean(row.registered),
          bonus: bonusByEvent.get(row.event.id) ?? [],
        }, now),
      )
      .filter((event) => (onlyRegistered ? event.registered : true));
  },

  getBySlug: async ({ db = defaultDb, slug, userId }: { db?: DrizzleDatabase; slug: string; userId?: string }) => {
    const events = await ptnTourRepo.list({ db, userId });
    return events.find((event) => event.slug === slug) ?? null;
  },

  register: async ({
    db = defaultDb,
    eventId,
    userId,
    isPremium,
    schoolName,
    classLevel,
    phoneNumber,
    dreamCampus,
    educationLevel,
    consent,
    confirmedSteps,
  }: {
    db?: DrizzleDatabase;
    eventId: number;
    userId: string;
    isPremium: boolean;
    schoolName: string;
    classLevel: string;
    phoneNumber: string;
    dreamCampus: string;
    educationLevel: string;
    consent: boolean;
    confirmedSteps: boolean;
  }) => {
    if (!consent) throw new PtnTourError("BAD_REQUEST", "Persetujuan penggunaan data wajib dicentang.");
    if (!isPremium && !confirmedSteps) {
      throw new PtnTourError("BAD_REQUEST", "Konfirmasi dulu bahwa kamu sudah follow akun Habitutor dan membagikan poster event.");
    }
    const phone = normalizePhone(phoneNumber);
    const school = schoolName.trim();
    const level = classLevel.trim();
    if (!school || !level) throw new PtnTourError("BAD_REQUEST", "Asal sekolah dan kelas wajib diisi.");

    return db.transaction(async (tx) => {
      // Kunci baris event supaya hitungan kuota tidak balapan antar pendaftar.
      const [event] = await tx
        .select()
        .from(ptnTourEvent)
        .where(and(eq(ptnTourEvent.id, eventId), eq(ptnTourEvent.isPublished, true)))
        .for("update")
        .limit(1);
      if (!event) throw new PtnTourError("NOT_FOUND", "Event tidak ditemukan.");

      const [existing] = await tx
        .select()
        .from(ptnTourRegistration)
        .where(and(eq(ptnTourRegistration.eventId, eventId), eq(ptnTourRegistration.userId, userId)))
        .limit(1);
      if (existing) return { registration: existing, alreadyRegistered: true };

      if (event.quota !== null && getPhase(event) !== "ended") {
        const [row] = await tx
          .select({ total: sql<number>`cast(count(*) as integer)` })
          .from(ptnTourRegistration)
          .where(eq(ptnTourRegistration.eventId, eventId));
        if (Number(row?.total ?? 0) >= event.quota) throw new PtnTourError("CONFLICT", "Kuota event ini sudah penuh.");
      }

      await tx.update(user).set({ phoneNumber: phone, dreamCampus, educationLevel }).where(eq(user.id, userId));
      const [registration] = await tx
        .insert(ptnTourRegistration)
        .values({
          eventId,
          userId,
          schoolName: school,
          classLevel: level,
          dataConsentAt: new Date(),
          accessMethod: isPremium ? "premium" : "share",
        })
        .returning();
      return { registration, alreadyRegistered: false };
    });
  },

  join: async ({ db = defaultDb, eventId, userId, isPremium }: { db?: DrizzleDatabase; eventId: number; userId: string; isPremium: boolean }) => {
    const [event] = await db
      .select()
      .from(ptnTourEvent)
      .where(and(eq(ptnTourEvent.id, eventId), eq(ptnTourEvent.isPublished, true)))
      .limit(1);
    if (!event) throw new PtnTourError("NOT_FOUND", "Event tidak ditemukan.");
    if (!event.zoomUrl) throw new PtnTourError("NOT_FOUND", "Link Zoom untuk event ini belum tersedia.");

    const phase = getPhase(event);
    if (phase === "ended") throw new PtnTourError("BAD_REQUEST", "Event sudah selesai. Tonton rekamannya kalau sudah tersedia.");
    if (!isJoinWindowOpen(event)) {
      throw new PtnTourError("BAD_REQUEST", "Zoom belum dibuka. Tombol aktif 15 menit sebelum acara dimulai.");
    }

    const [registration] = await db
      .select()
      .from(ptnTourRegistration)
      .where(and(eq(ptnTourRegistration.eventId, eventId), eq(ptnTourRegistration.userId, userId)))
      .limit(1);

    // Premium tidak wajib daftar; kehadirannya tetap dicatat.
    if (!registration && !isPremium) throw new PtnTourError("FORBIDDEN", "Kamu harus terdaftar untuk mengikuti event ini.");

    const attendedAt = registration?.attendedAt ?? new Date();
    if (!registration) {
      await db
        .insert(ptnTourRegistration)
        .values({ eventId, userId, accessMethod: "premium", attendedAt })
        .onConflictDoNothing({ target: [ptnTourRegistration.eventId, ptnTourRegistration.userId] });
    } else if (!registration.attendedAt) {
      await db.update(ptnTourRegistration).set({ attendedAt }).where(eq(ptnTourRegistration.id, registration.id));
    }
    return { zoomUrl: event.zoomUrl, attendedAt };
  },

  watch: async ({ db = defaultDb, slug, userId, isPremium }: { db?: DrizzleDatabase; slug: string; userId: string; isPremium: boolean }) => {
    const [event] = await db
      .select()
      .from(ptnTourEvent)
      .where(and(eq(ptnTourEvent.slug, slug), eq(ptnTourEvent.isPublished, true)))
      .limit(1);
    if (!event?.recordingUrl) throw new PtnTourError("NOT_FOUND", "Rekaman belum tersedia.");
    if (getPhase(event) !== "ended") throw new PtnTourError("BAD_REQUEST", "Rekaman baru tersedia setelah event selesai.");

    const [registration] = await db
      .select({ id: ptnTourRegistration.id })
      .from(ptnTourRegistration)
      .where(and(eq(ptnTourRegistration.eventId, event.id), eq(ptnTourRegistration.userId, userId)))
      .limit(1);

    const access = getRecordingAccess({
      isPremium,
      registered: Boolean(registration),
      endsAt: getEndsAt(event.startsAt, event.durationMinutes),
      freeDays: event.recordingFreeDays,
    });
    if (!access.allowed) {
      throw new PtnTourError(
        "FORBIDDEN",
        access.reason === "not_registered"
          ? "Daftar event terlebih dahulu untuk menonton rekaman."
          : "Akses rekaman gratis sudah berakhir. Upgrade Premium untuk menonton selamanya.",
      );
    }
    return { recordingUrl: event.recordingUrl, expiresAt: access.expiresAt };
  },

  /** Daftar materi selalu tampil; tautan file hanya dikirim kalau terbuka untuk peserta ini. */
  materials: async ({ db = defaultDb, slug, userId, isPremium }: { db?: DrizzleDatabase; slug: string } & Viewer) => {
    const [event] = await db
      .select()
      .from(ptnTourEvent)
      .where(and(eq(ptnTourEvent.slug, slug), eq(ptnTourEvent.isPublished, true)))
      .limit(1);
    if (!event) throw new PtnTourError("NOT_FOUND", "Event tidak ditemukan.");

    let registered = false;
    if (userId) {
      const [registration] = await db
        .select({ id: ptnTourRegistration.id })
        .from(ptnTourRegistration)
        .where(and(eq(ptnTourRegistration.eventId, event.id), eq(ptnTourRegistration.userId, userId)))
        .limit(1);
      registered = Boolean(registration);
    }
    const eligible = registered || Boolean(isPremium);
    const phase = getPhase(event);

    const rows = await db
      .select()
      .from(ptnTourMaterial)
      .where(and(eq(ptnTourMaterial.eventId, event.id), eq(ptnTourMaterial.isPublished, true)))
      .orderBy(asc(ptnTourMaterial.sortOrder), asc(ptnTourMaterial.id));

    return rows.map((row) => {
      const unlocked = isMaterialUnlocked({ eligible, unlockAt: row.unlockAt, phase });
      return {
        id: row.id,
        label: row.label,
        fileType: row.fileType,
        unlockAt: row.unlockAt,
        locked: !unlocked,
        fileUrl: unlocked ? row.fileUrl : null,
      };
    });
  },

  // ----------------------------------------------------------------- admin
  adminList: async ({ db = defaultDb }: { db?: DrizzleDatabase } = {}) => {
    const rows = await db
      .select({
        event: ptnTourEvent,
        registrationCount: sql<number>`cast((select count(*) from ${ptnTourRegistration} r where r.event_id = ${eventIdRef}) as integer)`,
        attendedCount: sql<number>`cast((select count(*) from ${ptnTourRegistration} r where r.event_id = ${eventIdRef} and r.attended_at is not null) as integer)`,
        materialCount: sql<number>`cast((select count(*) from ${ptnTourMaterial} m where m.event_id = ${eventIdRef}) as integer)`,
      })
      .from(ptnTourEvent)
      .orderBy(asc(ptnTourEvent.startsAt));
    const now = new Date();
    return rows.map((row) => ({
      ...row.event,
      endsAt: getEndsAt(row.event.startsAt, row.event.durationMinutes),
      phase: getPhase(row.event, now),
      registrationCount: Number(row.registrationCount),
      attendedCount: Number(row.attendedCount),
      materialCount: Number(row.materialCount),
    }));
  },

  adminGet: async ({ db = defaultDb, id }: { db?: DrizzleDatabase; id: number }) => {
    const [event] = await db.select().from(ptnTourEvent).where(eq(ptnTourEvent.id, id)).limit(1);
    return event ?? null;
  },

  adminCreate: async ({ db = defaultDb, input }: { db?: DrizzleDatabase; input: EventInsert }) => {
    try {
      const [event] = await db.insert(ptnTourEvent).values(input).returning();
      if (!event) throw new PtnTourError("BAD_REQUEST", "Event gagal disimpan.");
      return event;
    } catch (error) {
      if (isUniqueViolation(error)) throw new PtnTourError("CONFLICT", "Slug sudah dipakai event lain.");
      throw error;
    }
  },

  adminUpdate: async ({ db = defaultDb, id, input }: { db?: DrizzleDatabase; id: number; input: Partial<EventInsert> }) => {
    try {
      const [event] = await db
        .update(ptnTourEvent)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(ptnTourEvent.id, id))
        .returning();
      return event ?? null;
    } catch (error) {
      if (isUniqueViolation(error)) throw new PtnTourError("CONFLICT", "Slug sudah dipakai event lain.");
      throw error;
    }
  },

  adminDelete: async ({ db = defaultDb, id }: { db?: DrizzleDatabase; id: number }) => {
    const [deleted] = await db.delete(ptnTourEvent).where(eq(ptnTourEvent.id, id)).returning({ id: ptnTourEvent.id });
    return Boolean(deleted);
  },

  adminDuplicate: async ({ db = defaultDb, id, slug }: { db?: DrizzleDatabase; id: number; slug: string }) => {
    return db.transaction(async (tx) => {
      const [source] = await tx.select().from(ptnTourEvent).where(eq(ptnTourEvent.id, id)).limit(1);
      if (!source) return null;
      const { id: _id, createdAt: _c, updatedAt: _u, ...copy } = source;
      let event: EventRow | undefined;
      try {
        [event] = await tx
          .insert(ptnTourEvent)
          .values({ ...copy, slug, title: `${source.title} (Salinan)`, isPublished: false, recordingUrl: null })
          .returning();
      } catch (error) {
        if (isUniqueViolation(error)) throw new PtnTourError("CONFLICT", "Slug salinan sudah dipakai. Coba lagi.");
        throw error;
      }
      if (!event) return null;
      const materials = await tx.select().from(ptnTourMaterial).where(eq(ptnTourMaterial.eventId, id));
      if (materials.length) {
        await tx.insert(ptnTourMaterial).values(
          materials.map(({ id: _mid, createdAt: _mc, eventId: _e, ...rest }) => ({ ...rest, eventId: event.id })),
        );
      }
      return event;
    });
  },

  adminParticipants: async ({ db = defaultDb, eventId }: { db?: DrizzleDatabase; eventId: number }) => {
    const rows = await db
      .select({
        id: ptnTourRegistration.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        schoolName: ptnTourRegistration.schoolName,
        classLevel: ptnTourRegistration.classLevel,
        dreamCampus: user.dreamCampus,
        accessMethod: ptnTourRegistration.accessMethod,
        isPremium: user.isPremium,
        registeredAt: ptnTourRegistration.createdAt,
        attendedAt: ptnTourRegistration.attendedAt,
      })
      .from(ptnTourRegistration)
      .innerJoin(user, eq(user.id, ptnTourRegistration.userId))
      .where(eq(ptnTourRegistration.eventId, eventId))
      .orderBy(asc(ptnTourRegistration.createdAt));
    return {
      participants: rows,
      total: rows.length,
      attended: rows.filter((row) => row.attendedAt).length,
      premium: rows.filter((row) => row.accessMethod === "premium").length,
    };
  },

  adminMaterials: async ({ db = defaultDb, eventId }: { db?: DrizzleDatabase; eventId: number }) =>
    db
      .select()
      .from(ptnTourMaterial)
      .where(eq(ptnTourMaterial.eventId, eventId))
      .orderBy(asc(ptnTourMaterial.sortOrder), asc(ptnTourMaterial.id)),

  adminMaterialCreate: async ({ db = defaultDb, input }: { db?: DrizzleDatabase; input: MaterialInsert }) => {
    const [material] = await db.insert(ptnTourMaterial).values(input).returning();
    return material;
  },

  adminMaterialUpdate: async ({ db = defaultDb, id, input }: { db?: DrizzleDatabase; id: number; input: Partial<MaterialInsert> }) => {
    const [material] = await db.update(ptnTourMaterial).set(input).where(eq(ptnTourMaterial.id, id)).returning();
    return material ?? null;
  },

  adminMaterialDelete: async ({ db = defaultDb, id }: { db?: DrizzleDatabase; id: number }) => {
    const [deleted] = await db.delete(ptnTourMaterial).where(eq(ptnTourMaterial.id, id)).returning({ id: ptnTourMaterial.id });
    return Boolean(deleted);
  },
};
