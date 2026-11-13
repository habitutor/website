import { db as defaultDb, type DrizzleDatabase } from "@habitutor/db";
import { ptnTourEvent, ptnTourMaterial, ptnTourRegistration } from "@habitutor/db/schema/ptn-tour";
import { user } from "@habitutor/db/schema/user";
import { and, asc, eq, sql } from "drizzle-orm";

export const ptnTourRepo = {
  adminList: async ({ db = defaultDb }: { db?: DrizzleDatabase } = {}) =>
    db.select().from(ptnTourEvent).orderBy(asc(ptnTourEvent.startsAt)),
  adminCreate: async ({ db = defaultDb, input }: { db?: DrizzleDatabase; input: typeof ptnTourEvent.$inferInsert }) => {
    const [event] = await db.insert(ptnTourEvent).values(input).returning();
    return event;
  },
  adminUpdate: async ({
    db = defaultDb,
    id,
    input,
  }: {
    db?: DrizzleDatabase;
    id: number;
    input: Partial<typeof ptnTourEvent.$inferInsert>;
  }) => {
    const [event] = await db
      .update(ptnTourEvent)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(ptnTourEvent.id, id))
      .returning();
    return event;
  },
  adminDuplicate: async ({ db = defaultDb, id, slug }: { db?: DrizzleDatabase; id: number; slug: string }) => {
    const [source] = await db.select().from(ptnTourEvent).where(eq(ptnTourEvent.id, id)).limit(1);
    if (!source) return null;
    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...copy } = source;
    const [event] = await db
      .insert(ptnTourEvent)
      .values({ ...copy, slug, title: `${source.title} (Copy)`, isPublished: false })
      .returning();
    return event;
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
        registeredAt: ptnTourRegistration.createdAt,
        attendedAt: ptnTourRegistration.attendedAt,
      })
      .from(ptnTourRegistration)
      .innerJoin(user, eq(user.id, ptnTourRegistration.userId))
      .where(eq(ptnTourRegistration.eventId, eventId));
    return { participants: rows, total: rows.length, attended: rows.filter((row) => row.attendedAt).length };
  },
  list: async ({ db = defaultDb, userId }: { db?: DrizzleDatabase; userId?: string }) => {
    const rows = await db
      .select({
        id: ptnTourEvent.id,
        slug: ptnTourEvent.slug,
        title: ptnTourEvent.title,
        category: ptnTourEvent.category,
        description: ptnTourEvent.description,
        tutor: ptnTourEvent.tutor,
        campus: ptnTourEvent.campus,
        posterUrl: ptnTourEvent.posterUrl,
        startsAt: ptnTourEvent.startsAt,
        quota: ptnTourEvent.quota,
        recordingUrl: ptnTourEvent.recordingUrl,
        whatsappGroupUrl: ptnTourEvent.whatsappGroupUrl,
        zoomUrl: ptnTourEvent.zoomUrl,
        registered: userId
          ? sql<boolean>`exists (select 1 from ${ptnTourRegistration} r where r.event_id = ${ptnTourEvent.id} and r.user_id = ${userId})`
          : sql<boolean>`false`,
        registrationCount: sql<number>`(select count(*) from ${ptnTourRegistration} r where r.event_id = ${ptnTourEvent.id})`,
      })
      .from(ptnTourEvent)
      .where(eq(ptnTourEvent.isPublished, true))
      .orderBy(asc(ptnTourEvent.startsAt));
    return rows.map((row) => ({
      ...row,
      status: row.recordingUrl ? "Selesai" : "Akan datang",
      spotsLeft: row.quota === null ? null : Math.max(0, row.quota - Number(row.registrationCount)),
    }));
  },

  getBySlug: async ({ db = defaultDb, slug, userId }: { db?: DrizzleDatabase; slug: string; userId?: string }) => {
    const rows = await ptnTourRepo.list({ db, userId });
    return rows.find((event) => event.slug === slug) ?? null;
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
    if (!event?.recordingUrl) return null;
    const [registration] = await db
      .select()
      .from(ptnTourRegistration)
      .where(and(eq(ptnTourRegistration.eventId, event.id), eq(ptnTourRegistration.userId, userId)))
      .limit(1);
    if (!registration && !isPremium) throw new Error("Daftar event terlebih dahulu untuk menonton rekaman.");
    const freeUntil = event.startsAt.getTime() + 30 * 24 * 60 * 60 * 1000;
    if (!isPremium && Date.now() > freeUntil)
      throw new Error("Akses rekaman gratis sudah berakhir. Upgrade Premium untuk menonton selamanya.");
    return { recordingUrl: event.recordingUrl, expiresAt: isPremium ? null : new Date(freeUntil) };
  },

  register: async ({
    db = defaultDb,
    eventId,
    userId,
    schoolName,
    classLevel,
    phoneNumber,
    dreamCampus,
    educationLevel,
  }: {
    db?: DrizzleDatabase;
    eventId: number;
    userId: string;
    schoolName: string;
    classLevel: string;
    phoneNumber: string;
    dreamCampus: string;
    educationLevel: string;
  }) => {
    const [event] = await db
      .select()
      .from(ptnTourEvent)
      .where(and(eq(ptnTourEvent.id, eventId), eq(ptnTourEvent.isPublished, true)))
      .limit(1);
    if (!event) return null;
    const [existing] = await db
      .select()
      .from(ptnTourRegistration)
      .where(and(eq(ptnTourRegistration.eventId, eventId), eq(ptnTourRegistration.userId, userId)))
      .limit(1);
    if (existing) return existing;
    if (event.quota !== null) {
      const [{ total }] = await db
        .select({ total: sql<number>`count(*)` })
        .from(ptnTourRegistration)
        .where(eq(ptnTourRegistration.eventId, eventId));
      if (Number(total) >= event.quota) throw new Error("Event sudah penuh");
    }
    await db.update(user).set({ phoneNumber, dreamCampus, educationLevel }).where(eq(user.id, userId));
    const [registered] = await db
      .insert(ptnTourRegistration)
      .values({ eventId, userId, schoolName, classLevel, dataConsentAt: new Date() })
      .returning();
    return registered;
  },

  join: async ({ db = defaultDb, eventId, userId }: { db?: DrizzleDatabase; eventId: number; userId: string }) => {
    const [event] = await db
      .select()
      .from(ptnTourEvent)
      .where(and(eq(ptnTourEvent.id, eventId), eq(ptnTourEvent.isPublished, true)))
      .limit(1);
    if (!event || !event.zoomUrl) return null;
    const now = Date.now();
    const opensAt = event.startsAt.getTime() - 15 * 60 * 1000;
    if (now < opensAt) throw new Error("Zoom belum dibuka. Tombol aktif 15 menit sebelum acara dimulai.");
    const [registration] = await db
      .select()
      .from(ptnTourRegistration)
      .where(and(eq(ptnTourRegistration.eventId, eventId), eq(ptnTourRegistration.userId, userId)))
      .limit(1);
    if (!registration) throw new Error("Kamu harus terdaftar untuk mengikuti event ini.");
    await db
      .update(ptnTourRegistration)
      .set({ attendedAt: registration.attendedAt ?? new Date() })
      .where(eq(ptnTourRegistration.id, registration.id));
    return { zoomUrl: event.zoomUrl, attendedAt: registration.attendedAt ?? new Date() };
  },

  materials: async ({ db = defaultDb, slug, userId }: { db?: DrizzleDatabase; slug: string; userId: string }) => {
    const [event] = await db
      .select({ id: ptnTourEvent.id })
      .from(ptnTourEvent)
      .where(and(eq(ptnTourEvent.slug, slug), eq(ptnTourEvent.isPublished, true)))
      .limit(1);
    if (!event) return null;
    const [registration] = await db
      .select({ id: ptnTourRegistration.id })
      .from(ptnTourRegistration)
      .where(and(eq(ptnTourRegistration.eventId, event.id), eq(ptnTourRegistration.userId, userId)))
      .limit(1);
    if (!registration) throw new Error("Daftar event terlebih dahulu untuk membuka materi.");
    return db
      .select({
        id: ptnTourMaterial.id,
        label: ptnTourMaterial.label,
        fileUrl: ptnTourMaterial.fileUrl,
        fileType: ptnTourMaterial.fileType,
      })
      .from(ptnTourMaterial)
      .where(and(eq(ptnTourMaterial.eventId, event.id), eq(ptnTourMaterial.isPublished, true)));
  },
};
