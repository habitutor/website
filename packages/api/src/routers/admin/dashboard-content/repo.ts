import { asc, eq, sql } from "drizzle-orm";
import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { dashboardAnnouncement, dashboardLiveClass } from "@habitutor/db/schema/dashboard";

export const adminDashboardContentRepo = {
  ensurePrimaryAnnouncement: async ({ db = defaultDb }: { db?: DrizzleDatabase }) => {
    const existing = await adminDashboardContentRepo.getPrimaryAnnouncement({ db });
    if (existing) return existing;

    const [row] = await db
      .insert(dashboardAnnouncement)
      .values({
        title: "Lorem ipsum dolor sit amet, consectetur.",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor.",
        variant: "primary",
        ctaLink: null,
        ctaLabel: null,
        isPublished: true,
        order: 1,
      })
      .returning();
    return row;
  },

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

  countLiveClasses: async ({ db = defaultDb }: { db?: DrizzleDatabase }) => {
    const rows = await db.query.dashboardLiveClass.findMany({
      columns: { id: true },
    });
    return rows.length;
  },

  createLiveClass: async ({
    db = defaultDb,
    values,
  }: {
    db?: DrizzleDatabase;
    values: Omit<typeof dashboardLiveClass.$inferInsert, "id" | "createdAt" | "updatedAt">;
  }) => {
    const existingRows = await db.query.dashboardLiveClass.findMany({
      columns: { order: true },
    });

    const nextOrder = existingRows.length > 0 ? Math.max(...existingRows.map((row) => row.order)) + 1 : 1;

    const [row] = await db
      .insert(dashboardLiveClass)
      .values({
        ...values,
        order: nextOrder,
      })
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

  getPrimaryAnnouncement: async ({ db = defaultDb }: { db?: DrizzleDatabase }) => {
    const [row] = await db
      .select()
      .from(dashboardAnnouncement)
      .where(eq(dashboardAnnouncement.variant, "primary"))
      .orderBy(asc(dashboardAnnouncement.order), asc(dashboardAnnouncement.id));
    return row;
  },

  createAnnouncement: async ({
    db = defaultDb,
    values,
  }: {
    db?: DrizzleDatabase;
    values: Omit<typeof dashboardAnnouncement.$inferInsert, "id" | "createdAt" | "updatedAt">;
  }) => {
    const [row] = await db.insert(dashboardAnnouncement).values(values).returning();
    return row;
  },

  updateAnnouncement: async ({
    db = defaultDb,
    id,
    values,
  }: {
    db?: DrizzleDatabase;
    id: number;
    values: Omit<typeof dashboardAnnouncement.$inferInsert, "id" | "createdAt" | "updatedAt">;
  }) => {
    const [row] = await db
      .update(dashboardAnnouncement)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(dashboardAnnouncement.id, id))
      .returning();
    return row;
  },
};
