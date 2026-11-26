import { db as defaultDb, type DrizzleDatabase } from "@habitutor/db";
import {
  ptnTourEvent,
  ptnTourMaterial,
  ptnTourExportLog,
  ptnTourPayment,
  ptnTourProof,
  ptnTourRegistration,
  ptnTourSetting,
} from "@habitutor/db/schema/ptn-tour";
import { user } from "@habitutor/db/schema/user";
import { and, asc, desc, eq, gt, inArray, lt, lte, sql } from "drizzle-orm";
import { uploadTryoutImage } from "../../lib/cloudinary";
import {
  canAttend,
  DEFAULT_SETTINGS,
  getEndsAt,
  getPhase,
  getRecordingAccess,
  isDayReminderDue,
  isHourReminderDue,
  isJoinWindowOpen,
  isMaterialUnlocked,
  isRecordingPremiumOnly,
  normalizePhone,
  PROOF_RETENTION_DAYS,
  PtnTourError,
  SETTING_KEYS,
  type SettingKey,
  validateProofs,
  toPublicSpots,
} from "./logic";

type EventRow = typeof ptnTourEvent.$inferSelect;
type EventInsert = typeof ptnTourEvent.$inferInsert;
type MaterialInsert = typeof ptnTourMaterial.$inferInsert;

type Viewer = { userId?: string; isPremium?: boolean };

function isUniqueViolation(error: unknown) {
  const code =
    (error as { code?: string; cause?: { code?: string } })?.code ?? (error as { cause?: { code?: string } })?.cause?.code;
  return code === "23505";
}

// Di dalam subquery mentah, kolom harus dikualifikasi penuh; jika tidak, "id" terbaca sebagai id tabel registrasi.
const eventIdRef = sql.raw('"ptn_tour_event"."id"');

/** Pendaftar yang membeli paket Premium setelah event dimulai (konversi). */
const purchasedAfterEventSql = sql`exists (
  select 1 from "transaction" t
  inner join "product" p on p.id = t.product_id
  where t.user_id = "ptn_tour_registration"."user_id"
    and t.status = 'success'
    and p.type = 'subscription'
    and t.paid_at >= (select e.starts_at from "ptn_tour_event" e where e.id = "ptn_tour_registration"."event_id")
)`;

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
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    subjects: row.subjects,
    description: row.description,
    longDescription: row.longDescription,
    rundown: row.rundown,
    tutor: row.tutor,
    campus: row.campus,
    tutorPhotoUrl: row.tutorPhotoUrl,
    tutorAchievement: row.tutorAchievement,
    reward: row.reward,
    posterUrl: row.posterUrl,
    startsAt: row.startsAt,
    endsAt,
    durationMinutes: row.durationMinutes,
    accessMode: row.accessMode,
    scheduleStatus: row.scheduleStatus,
    ...toPublicSpots({
      quota: row.quota,
      registered: extra.registrationCount,
      shownByAdmin: row.displayParticipantCount,
      ended: phase === "ended",
    }),
    phase,
    hasRecording: Boolean(row.recordingUrl),
    recordingFreeDays: row.recordingFreeDays,
    registered: extra.registered,
    joinOpen: isJoinWindowOpen(row, now),
    whatsappGroupUrl: extra.registered ? row.whatsappGroupUrl : null,
    bonus: extra.bonus,
  };
}

async function loadSettings(db: DrizzleDatabase) {
  const rows = await db.select().from(ptnTourSetting);
  const stored = new Map(rows.map((row) => [row.key, row.value]));
  return Object.fromEntries(SETTING_KEYS.map((key) => [key, stored.get(key) ?? DEFAULT_SETTINGS[key]])) as Record<
    SettingKey,
    string
  >;
}

export const ptnTourRepo = {
  // ---------------------------------------------------------------- publik
  list: async ({
    db = defaultDb,
    userId,
    onlyRegistered,
  }: {
    db?: DrizzleDatabase;
    userId?: string;
    onlyRegistered?: boolean;
  }) => {
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
        toPublicEvent(
          row.event,
          {
            registrationCount: Number(row.registrationCount),
            registered: Boolean(row.registered),
            bonus: bonusByEvent.get(row.event.id) ?? [],
          },
          now,
        ),
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
    followProofs,
    shareProofs,
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
    followProofs: string[];
    shareProofs: string[];
  }) => {
    if (!consent) throw new PtnTourError("BAD_REQUEST", "Persetujuan penggunaan data wajib dicentang.");
    validateProofs({ follow: followProofs, share: shareProofs, required: !isPremium });
    const phone = normalizePhone(phoneNumber);
    const school = schoolName.trim();
    const level = classLevel.trim();
    if (!school || !level) throw new PtnTourError("BAD_REQUEST", "Asal sekolah dan kelas wajib diisi.");

    const [event0] = await db
      .select()
      .from(ptnTourEvent)
      .where(and(eq(ptnTourEvent.id, eventId), eq(ptnTourEvent.isPublished, true)))
      .limit(1);
    if (!event0) throw new PtnTourError("NOT_FOUND", "Event tidak ditemukan.");
    if (event0.scheduleStatus === "cancelled") throw new PtnTourError("BAD_REQUEST", "Event ini dibatalkan.");
    if (!canAttend({ accessMode: event0.accessMode, isPremium })) {
      throw new PtnTourError("FORBIDDEN", "Event ini khusus member Premium.");
    }

    // Cegah unggahan sia-sia kalau pengguna sudah terdaftar.
    const [already] = await db
      .select()
      .from(ptnTourRegistration)
      .where(and(eq(ptnTourRegistration.eventId, eventId), eq(ptnTourRegistration.userId, userId)))
      .limit(1);
    if (already) return { registration: already, alreadyRegistered: true };

    // Unggah bukti ke Cloudinary sebelum transaksi supaya baris event tidak terkunci selama unggahan.
    const uploaded = await Promise.all([
      ...followProofs.map(async (source) => ({
        kind: "follow",
        url: await uploadTryoutImage(source, "habitutor/ptn-tour/bukti"),
      })),
      ...shareProofs.map(async (source) => ({
        kind: "share",
        url: await uploadTryoutImage(source, "habitutor/ptn-tour/bukti"),
      })),
    ]);

    return db.transaction(async (tx) => {
      // Kunci baris event supaya hitungan kuota tidak balapan antar pendaftar.
      const [event] = await tx
        .select()
        .from(ptnTourEvent)
        .where(eq(ptnTourEvent.id, eventId))
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
      if (!registration) throw new PtnTourError("BAD_REQUEST", "Pendaftaran gagal disimpan.");
      if (uploaded.length) {
        await tx.insert(ptnTourProof).values(uploaded.map((proof) => ({ ...proof, registrationId: registration.id })));
      }
      return { registration, alreadyRegistered: false };
    });
  },

  join: async ({
    db = defaultDb,
    eventId,
    userId,
    isPremium,
  }: {
    db?: DrizzleDatabase;
    eventId: number;
    userId: string;
    isPremium: boolean;
  }) => {
    const [event] = await db
      .select()
      .from(ptnTourEvent)
      .where(and(eq(ptnTourEvent.id, eventId), eq(ptnTourEvent.isPublished, true)))
      .limit(1);
    if (!event) throw new PtnTourError("NOT_FOUND", "Event tidak ditemukan.");
    if (event.scheduleStatus === "cancelled") throw new PtnTourError("BAD_REQUEST", "Event ini dibatalkan.");
    if (!event.zoomUrl) throw new PtnTourError("NOT_FOUND", "Link Zoom untuk event ini belum tersedia.");
    if (!canAttend({ accessMode: event.accessMode, isPremium })) {
      throw new PtnTourError("FORBIDDEN", "Event ini khusus member Premium.");
    }

    const phase = getPhase(event);
    if (phase === "ended")
      throw new PtnTourError("BAD_REQUEST", "Event sudah selesai. Tonton rekamannya kalau sudah tersedia.");
    if (!isJoinWindowOpen(event)) {
      throw new PtnTourError("BAD_REQUEST", "Zoom belum dibuka. Tombol aktif 15 menit sebelum acara dimulai.");
    }

    const [registration] = await db
      .select()
      .from(ptnTourRegistration)
      .where(and(eq(ptnTourRegistration.eventId, eventId), eq(ptnTourRegistration.userId, userId)))
      .limit(1);

    // Premium tidak wajib daftar; kehadirannya tetap dicatat.
    if (!registration && !isPremium)
      throw new PtnTourError("FORBIDDEN", "Kamu harus terdaftar untuk mengikuti event ini.");

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

  watch: async ({
    db = defaultDb,
    slug,
    userId,
    isPremium,
  }: {
    db?: DrizzleDatabase;
    slug: string;
    userId: string;
    isPremium: boolean;
  }) => {
    const [event] = await db
      .select()
      .from(ptnTourEvent)
      .where(and(eq(ptnTourEvent.slug, slug), eq(ptnTourEvent.isPublished, true)))
      .limit(1);
    if (!event?.recordingUrl) throw new PtnTourError("NOT_FOUND", "Rekaman belum tersedia.");
    if (getPhase(event) !== "ended")
      throw new PtnTourError("BAD_REQUEST", "Rekaman baru tersedia setelah event selesai.");
    if (!isPremium && isRecordingPremiumOnly({ accessMode: event.accessMode })) {
      throw new PtnTourError("FORBIDDEN", "Rekaman event ini khusus member Premium.");
    }

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

  // -------------------------------------------------------------- pengaturan
  /** Pengaturan pusat (link channel WA, teks promo) dengan nilai bawaan kalau belum diubah admin. */
  getSettings: async ({ db = defaultDb }: { db?: DrizzleDatabase } = {}) => loadSettings(db),

  updateSettings: async ({
    db = defaultDb,
    values,
  }: {
    db?: DrizzleDatabase;
    values: Partial<Record<SettingKey, string>>;
  }) => {
    const entries = Object.entries(values).filter(([key]) => (SETTING_KEYS as string[]).includes(key));
    for (const [key, value] of entries) {
      const trimmed = String(value).trim();
      await db
        .insert(ptnTourSetting)
        .values({ key, value: trimmed })
        .onConflictDoUpdate({ target: ptnTourSetting.key, set: { value: trimmed, updatedAt: new Date() } });
    }
    return loadSettings(db);
  },

  // ----------------------------------------------------------------- admin
  adminList: async ({ db = defaultDb }: { db?: DrizzleDatabase } = {}) => {
    const rows = await db
      .select({
        event: ptnTourEvent,
        registrationCount: sql<number>`cast((select count(*) from ${ptnTourRegistration} r where r.event_id = ${eventIdRef}) as integer)`,
        attendedCount: sql<number>`cast((select count(*) from ${ptnTourRegistration} r where r.event_id = ${eventIdRef} and r.attended_at is not null) as integer)`,
        materialCount: sql<number>`cast((select count(*) from ${ptnTourMaterial} m where m.event_id = ${eventIdRef}) as integer)`,
        purchasedCount: sql<number>`cast((select count(*) from ${ptnTourRegistration} where "ptn_tour_registration"."event_id" = ${eventIdRef} and ${purchasedAfterEventSql}) as integer)`,
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
      purchasedCount: Number(row.purchasedCount),
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

  /**
   * Validasi + simpan data checkout berbayar. Pendaftaran sendiri baru dibuat setelah pembayaran terverifikasi
   * (activatePayment), jadi kuota tidak tertahan oleh checkout yang tidak dibayar.
   */
  prepareCheckout: async ({
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
  }) => {
    if (!consent) throw new PtnTourError("BAD_REQUEST", "Persetujuan penggunaan data wajib dicentang.");
    if (isPremium) throw new PtnTourError("BAD_REQUEST", "Member Premium tidak perlu membayar, langsung daftar saja.");
    const phone = normalizePhone(phoneNumber);
    const school = schoolName.trim();
    const level = classLevel.trim();
    if (!school || !level) throw new PtnTourError("BAD_REQUEST", "Asal sekolah dan kelas wajib diisi.");

    const [event] = await db
      .select()
      .from(ptnTourEvent)
      .where(and(eq(ptnTourEvent.id, eventId), eq(ptnTourEvent.isPublished, true)))
      .limit(1);
    if (!event) throw new PtnTourError("NOT_FOUND", "Event tidak ditemukan.");
    if (event.scheduleStatus === "cancelled") throw new PtnTourError("BAD_REQUEST", "Event ini dibatalkan.");
    if (!canAttend({ accessMode: event.accessMode, isPremium })) {
      throw new PtnTourError("FORBIDDEN", "Event ini khusus member Premium.");
    }
    const [already] = await db
      .select({ id: ptnTourRegistration.id })
      .from(ptnTourRegistration)
      .where(and(eq(ptnTourRegistration.eventId, eventId), eq(ptnTourRegistration.userId, userId)))
      .limit(1);
    if (already) throw new PtnTourError("CONFLICT", "Kamu sudah terdaftar di event ini.");
    if (event.quota !== null && getPhase(event) !== "ended") {
      const [row] = await db
        .select({ total: sql<number>`cast(count(*) as integer)` })
        .from(ptnTourRegistration)
        .where(eq(ptnTourRegistration.eventId, eventId));
      if (Number(row?.total ?? 0) >= event.quota) throw new PtnTourError("CONFLICT", "Kuota event ini sudah penuh.");
    }
    return { event, profile: { school, level, phone, dreamCampus, educationLevel } };
  },

  createPayment: async ({
    db = defaultDb,
    eventId,
    userId,
    transactionId,
    profile,
  }: {
    db?: DrizzleDatabase;
    eventId: number;
    userId: string;
    transactionId: string;
    profile: { school: string; level: string; phone: string; dreamCampus: string; educationLevel: string };
  }) => {
    await db.insert(ptnTourPayment).values({
      eventId,
      userId,
      transactionId,
      schoolName: profile.school,
      classLevel: profile.level,
      phoneNumber: profile.phone,
      dreamCampus: profile.dreamCampus,
      educationLevel: profile.educationLevel,
      consentAt: new Date(),
    });
  },

  /**
   * Dipanggil saat pembayaran settle: membuat pendaftaran (accessMethod "paid"). Idempoten; peserta yang sudah
   * membayar tidak ditolak walau kuota terlanjur penuh (uangnya sudah masuk).
   */
  activatePayment: async ({ db = defaultDb, transactionId }: { db?: DrizzleDatabase; transactionId: string }) => {
    const [payment] = await db
      .select()
      .from(ptnTourPayment)
      .where(eq(ptnTourPayment.transactionId, transactionId))
      .limit(1);
    if (!payment) return null;
    await db
      .update(user)
      .set({ phoneNumber: payment.phoneNumber, dreamCampus: payment.dreamCampus, educationLevel: payment.educationLevel })
      .where(eq(user.id, payment.userId));
    await db
      .insert(ptnTourRegistration)
      .values({
        eventId: payment.eventId,
        userId: payment.userId,
        schoolName: payment.schoolName,
        classLevel: payment.classLevel,
        dataConsentAt: payment.consentAt,
        accessMethod: "paid",
      })
      .onConflictDoNothing();
    await db
      .update(ptnTourPayment)
      .set({ activatedAt: payment.activatedAt ?? new Date() })
      .where(eq(ptnTourPayment.id, payment.id));
    return { userId: payment.userId, eventId: payment.eventId };
  },

  /** Refund/chargeback: cabut pendaftaran yang berasal dari pembayaran ini. */
  revokePayment: async ({ db = defaultDb, transactionId }: { db?: DrizzleDatabase; transactionId: string }) => {
    const [payment] = await db
      .select()
      .from(ptnTourPayment)
      .where(eq(ptnTourPayment.transactionId, transactionId))
      .limit(1);
    if (!payment) return;
    await db
      .delete(ptnTourRegistration)
      .where(
        and(
          eq(ptnTourRegistration.eventId, payment.eventId),
          eq(ptnTourRegistration.userId, payment.userId),
          eq(ptnTourRegistration.accessMethod, "paid"),
        ),
      );
    await db.update(ptnTourPayment).set({ activatedAt: null }).where(eq(ptnTourPayment.id, payment.id));
  },

  logExport: async ({
    db = defaultDb,
    eventId,
    adminId,
    format,
    rowCount,
  }: {
    db?: DrizzleDatabase;
    eventId: number;
    adminId: string;
    format: string;
    rowCount: number;
  }) => {
    await db.insert(ptnTourExportLog).values({ eventId, adminId, format, rowCount });
  },

  exportLog: async ({ db = defaultDb, eventId }: { db?: DrizzleDatabase; eventId: number }) =>
    db
      .select({
        id: ptnTourExportLog.id,
        format: ptnTourExportLog.format,
        rowCount: ptnTourExportLog.rowCount,
        createdAt: ptnTourExportLog.createdAt,
        adminName: user.name,
      })
      .from(ptnTourExportLog)
      .leftJoin(user, eq(user.id, ptnTourExportLog.adminId))
      .where(eq(ptnTourExportLog.eventId, eventId))
      .orderBy(desc(ptnTourExportLog.createdAt))
      .limit(5),

  /** Data event apa adanya (untuk membandingkan sebelum/sesudah edit). */
  getRaw: async ({ db = defaultDb, id }: { db?: DrizzleDatabase; id: number }) => {
    const [row] = await db.select().from(ptnTourEvent).where(eq(ptnTourEvent.id, id)).limit(1);
    return row ?? null;
  },

  /** Penerima pemberitahuan perubahan jadwal: semua yang terdaftar. */
  registrantContacts: async ({ db = defaultDb, eventId }: { db?: DrizzleDatabase; eventId: number }) =>
    db
      .select({ name: user.name, email: user.email })
      .from(ptnTourRegistration)
      .innerJoin(user, eq(user.id, ptnTourRegistration.userId))
      .where(eq(ptnTourRegistration.eventId, eventId)),

  adminUpdate: async ({
    db = defaultDb,
    id,
    input,
  }: {
    db?: DrizzleDatabase;
    id: number;
    input: Partial<EventInsert>;
  }) => {
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
        await tx
          .insert(ptnTourMaterial)
          .values(
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
        proofCount: sql<number>`cast((select count(*) from ${ptnTourProof} pr where pr.registration_id = "ptn_tour_registration"."id") as integer)`,
        purchasedAfter: sql<boolean>`${purchasedAfterEventSql}`,
      })
      .from(ptnTourRegistration)
      .innerJoin(user, eq(user.id, ptnTourRegistration.userId))
      .where(eq(ptnTourRegistration.eventId, eventId))
      .orderBy(asc(ptnTourRegistration.createdAt));
    const participants = rows.map((row) => ({
      ...row,
      proofCount: Number(row.proofCount),
      purchasedAfter: Boolean(row.purchasedAfter),
    }));
    return {
      participants,
      total: participants.length,
      attended: participants.filter((row) => row.attendedAt).length,
      premium: participants.filter((row) => row.accessMethod === "premium").length,
      purchased: participants.filter((row) => row.purchasedAfter).length,
    };
  },

  adminProofs: async ({ db = defaultDb, registrationId }: { db?: DrizzleDatabase; registrationId: number }) =>
    db
      .select({ id: ptnTourProof.id, kind: ptnTourProof.kind, url: ptnTourProof.url, createdAt: ptnTourProof.createdAt })
      .from(ptnTourProof)
      .where(eq(ptnTourProof.registrationId, registrationId))
      .orderBy(asc(ptnTourProof.id)),

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

  adminMaterialUpdate: async ({
    db = defaultDb,
    id,
    input,
  }: {
    db?: DrizzleDatabase;
    id: number;
    input: Partial<MaterialInsert>;
  }) => {
    const [material] = await db.update(ptnTourMaterial).set(input).where(eq(ptnTourMaterial.id, id)).returning();
    return material ?? null;
  },

  adminMaterialDelete: async ({ db = defaultDb, id }: { db?: DrizzleDatabase; id: number }) => {
    const [deleted] = await db
      .delete(ptnTourMaterial)
      .where(eq(ptnTourMaterial.id, id))
      .returning({ id: ptnTourMaterial.id });
    return Boolean(deleted);
  },

  // ---------------------------------------------------------------- job
  /** Pendaftar yang perlu diingatkan sekarang (H-1 atau 1 jam sebelum mulai) dan belum pernah dikirimi. */
  dueReminders: async ({ db = defaultDb, now = new Date() }: { db?: DrizzleDatabase; now?: Date } = {}) => {
    const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);
    const rows = await db
      .select({
        registrationId: ptnTourRegistration.id,
        reminderDayAt: ptnTourRegistration.reminderDayAt,
        reminderHourAt: ptnTourRegistration.reminderHourAt,
        name: user.name,
        email: user.email,
        title: ptnTourEvent.title,
        slug: ptnTourEvent.slug,
        startsAt: ptnTourEvent.startsAt,
        whatsappGroupUrl: ptnTourEvent.whatsappGroupUrl,
      })
      .from(ptnTourRegistration)
      .innerJoin(ptnTourEvent, eq(ptnTourEvent.id, ptnTourRegistration.eventId))
      .innerJoin(user, eq(user.id, ptnTourRegistration.userId))
      .where(
        and(
          eq(ptnTourEvent.isPublished, true),
          gt(ptnTourEvent.startsAt, now),
          lte(ptnTourEvent.startsAt, windowEnd),
          sql`(${ptnTourRegistration.reminderDayAt} is null or ${ptnTourRegistration.reminderHourAt} is null)`,
        ),
      )
      .limit(500);
    const due: Array<(typeof rows)[number] & { kind: "day" | "hour" }> = [];
    for (const row of rows) {
      if (!row.reminderHourAt && isHourReminderDue(row.startsAt, now)) due.push({ ...row, kind: "hour" });
      else if (!row.reminderDayAt && isDayReminderDue(row.startsAt, now)) due.push({ ...row, kind: "day" });
    }
    return due;
  },

  markReminderSent: async ({
    db = defaultDb,
    registrationId,
    kind,
  }: {
    db?: DrizzleDatabase;
    registrationId: number;
    kind: "day" | "hour";
  }) => {
    const sentAt = new Date();
    // Pengingat 1 jam sekaligus menandai H-1 sebagai terlewati supaya tidak dikirim berurutan.
    await db
      .update(ptnTourRegistration)
      .set(kind === "hour" ? { reminderHourAt: sentAt, reminderDayAt: sentAt } : { reminderDayAt: sentAt })
      .where(eq(ptnTourRegistration.id, registrationId));
  },

  /** Hapus bukti follow/share yang melewati masa simpan (baris DB). Mengembalikan URL gambar untuk dihapus dari Cloudinary. */
  purgeExpiredProofs: async ({ db = defaultDb, now = new Date() }: { db?: DrizzleDatabase; now?: Date } = {}) => {
    const cutoff = new Date(now.getTime() - PROOF_RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const expired = await db
      .select({ id: ptnTourProof.id, url: ptnTourProof.url })
      .from(ptnTourProof)
      .where(lt(ptnTourProof.createdAt, cutoff))
      .limit(500);
    if (!expired.length) return { deleted: 0, urls: [] as string[] };
    await db.delete(ptnTourProof).where(
      inArray(
        ptnTourProof.id,
        expired.map((row) => row.id),
      ),
    );
    return { deleted: expired.length, urls: expired.map((row) => row.url) };
  },
};
