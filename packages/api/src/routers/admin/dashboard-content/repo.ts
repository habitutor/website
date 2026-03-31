import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { dashboardAnnouncement, dashboardLiveClass } from "@habitutor/db/schema/dashboard";
import { asc, eq, sql } from "drizzle-orm";

export const adminDashboardContentRepo = {
  cleanupExpiredLiveClasses: async ({ db = defaultDb }: { db?: DrizzleDatabase }) => {
    await db.delete(dashboardLiveClass).where(sql`(${dashboardLiveClass.date} + ${dashboardLiveClass.time}) < now()`);
  },

  listLiveClasses: async ({ db = defaultDb }: { db?: DrizzleDatabase }) => {
    return db
      .select({
        id: dashboardLiveClass.id,
        title: dashboardLiveClass.title,
        date: sql<string>`to_char(${dashboardLiveClass.date}, 'YYYY-MM-DD')`,
        time: sql<string>`to_char(${dashboardLiveClass.time}, 'HH24:MI')`,
        teacher: dashboardLiveClass.teacher,
        link: dashboardLiveClass.link,
        access: dashboardLiveClass.access,
        order: dashboardLiveClass.order,
      })
      .from(dashboardLiveClass)
      .orderBy(asc(dashboardLiveClass.order), asc(dashboardLiveClass.id));
  },

  createLiveClass: async ({
    db = defaultDb,
    input,
  }: {
    db?: DrizzleDatabase;
    input: {
      title: string;
      date: string;
      time: string;
      teacher: string;
      link: string;
      access: "3x" | "5x";
    };
  }) => {
    const [row] = await db
      .insert(dashboardLiveClass)
      .values({
        title: input.title,
        date: input.date,
        time: input.time,
        teacher: input.teacher,
        link: input.link,
        access: input.access,
        isPublished: true,
        order: 1,
      })
      .returning();
    return row;
  },

  updateLiveClass: async ({
    db = defaultDb,
    id,
    input,
  }: {
    db?: DrizzleDatabase;
    id: number;
    input: {
      title: string;
      date: string;
      time: string;
      teacher: string;
      link: string;
      access: "3x" | "5x";
    };
  }) => {
    const [existing] = await db.select().from(dashboardLiveClass).where(eq(dashboardLiveClass.id, id));
    if (!existing) return undefined;

    const [row] = await db
      .update(dashboardLiveClass)
      .set({
        title: input.title,
        date: input.date,
        time: input.time,
        teacher: input.teacher,
        link: input.link,
        access: input.access,
        isPublished: existing.isPublished,
        order: existing.order,
        updatedAt: new Date(),
      })
      .where(eq(dashboardLiveClass.id, id))
      .returning();
    return row;
  },

  deleteLiveClass: async ({ db = defaultDb, id }: { db?: DrizzleDatabase; id: number }) => {
    const [row] = await db.delete(dashboardLiveClass).where(eq(dashboardLiveClass.id, id)).returning();
    return row;
  },

  listAnnouncements: async ({ db = defaultDb }: { db?: DrizzleDatabase }) => {
    return db
      .select()
      .from(dashboardAnnouncement)
      .orderBy(asc(dashboardAnnouncement.order), asc(dashboardAnnouncement.id));
  },

  getAnnouncementById: async ({ db = defaultDb, id }: { db?: DrizzleDatabase; id: number }) => {
    const [row] = await db.select().from(dashboardAnnouncement).where(eq(dashboardAnnouncement.id, id));
    return row;
  },

  createAnnouncement: async ({
    db = defaultDb,
    input,
  }: {
    db?: DrizzleDatabase;
    input: {
      title: string;
      description: string;
      variant: "primary" | "cashback";
      ctaLink: string | null;
      ctaLabel: string | null;
      order: number;
      isPublished: boolean;
    };
  }) => {
    const [row] = await db.insert(dashboardAnnouncement).values(input).returning();
    return row;
  },

  updateAnnouncement: async ({
    db = defaultDb,
    id,
    input,
  }: {
    db?: DrizzleDatabase;
    id: number;
    input: {
      title: string;
      description: string;
      variant: "primary" | "cashback";
      ctaLink: string | null;
      ctaLabel: string | null;
      order: number;
      isPublished: boolean;
    };
  }) => {
    const [row] = await db
      .update(dashboardAnnouncement)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(dashboardAnnouncement.id, id))
      .returning();
    return row;
  },

  deleteAnnouncement: async ({ db = defaultDb, id }: { db?: DrizzleDatabase; id: number }) => {
    const [row] = await db.delete(dashboardAnnouncement).where(eq(dashboardAnnouncement.id, id)).returning();
    return row;
  },
};
