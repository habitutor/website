import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { dashboardAnnouncement, dashboardLiveClass } from "@habitutor/db/schema/dashboard";
import { product, transaction } from "@habitutor/db/schema/transaction";
import { and, asc, desc, eq, sql } from "drizzle-orm";

export const dashboardRepo = {
  cleanupExpiredLiveClasses: async ({ db = defaultDb }: { db?: DrizzleDatabase }) => {
    await db.delete(dashboardLiveClass).where(sql`(${dashboardLiveClass.date} + ${dashboardLiveClass.time}) < now()`);
  },

  listPublishedAnnouncements: async ({ db = defaultDb }: { db?: DrizzleDatabase }) => {
    return db
      .select({
        id: dashboardAnnouncement.id,
        title: dashboardAnnouncement.title,
        description: dashboardAnnouncement.description,
        variant: dashboardAnnouncement.variant,
        ctaLink: dashboardAnnouncement.ctaLink,
        ctaLabel: dashboardAnnouncement.ctaLabel,
        order: dashboardAnnouncement.order,
      })
      .from(dashboardAnnouncement)
      .where(and(eq(dashboardAnnouncement.isPublished, true), eq(dashboardAnnouncement.variant, "primary")))
      .orderBy(asc(dashboardAnnouncement.order), asc(dashboardAnnouncement.id));
  },

  getUserSubscriptionTier: async ({ db = defaultDb, userId }: { db?: DrizzleDatabase; userId: string }) => {
    const [row] = await db
      .select({ slug: product.slug })
      .from(transaction)
      .innerJoin(product, eq(transaction.productId, product.id))
      .where(and(eq(transaction.userId, userId), eq(transaction.status, "success"), eq(product.type, "subscription")))
      .orderBy(desc(transaction.orderedAt), desc(transaction.paidAt))
      .limit(1);

    return row?.slug ?? null;
  },

  listLiveClasses: async ({ db = defaultDb, onlyThreeX }: { db?: DrizzleDatabase; onlyThreeX: boolean }) => {
    return db
      .select({
        id: dashboardLiveClass.id,
        title: dashboardLiveClass.title,
        date: sql<string>`to_char(${dashboardLiveClass.date}, 'DD-MM-YYYY')`,
        time: sql<string>`to_char(${dashboardLiveClass.time}, 'HH24:MI')`,
        teacher: dashboardLiveClass.teacher,
        link: dashboardLiveClass.link,
        access: dashboardLiveClass.access,
        order: dashboardLiveClass.order,
      })
      .from(dashboardLiveClass)
      .where(
        and(eq(dashboardLiveClass.isPublished, true), onlyThreeX ? eq(dashboardLiveClass.access, "3x") : undefined),
      )
      .orderBy(asc(dashboardLiveClass.order), asc(dashboardLiveClass.id));
  },
};
