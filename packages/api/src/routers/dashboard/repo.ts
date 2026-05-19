import { and, asc, desc, eq, sql } from "drizzle-orm";
import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { dashboardAnnouncement, dashboardLiveClass } from "@habitutor/db/schema/dashboard";
import { product, transaction } from "@habitutor/db/schema/transaction";

const DEFAULT_PRIMARY_ANNOUNCEMENT = {
  title: "Seleksi Semakin Kompetitif",
  description:
    "Dengan jumlah lulusan SMA yang besar dan daya tampung PTN terbatas, persaingan SNBT dan Ujian Mandiri diperkirakan tetap ketat dalam beberapa tahun ke depan. Bagi calon mahasiswa, memahami data, rasio persaingan, dan karakter seleksi menjadi kunci untuk meningkatkan peluang. Keberhasilan masuk PTN tidak hanya ditentukan nilai tinggi, tetapi juga strategi yang tepat dan kesiapan mental.",
} as const;

const LEGACY_PRIMARY_ANNOUNCEMENT = {
  title: "Lorem ipsum dolor sit amet, consectetur.",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor.",
} as const;

function normalizePrimaryAnnouncement(title: string, description: string) {
  if (title === LEGACY_PRIMARY_ANNOUNCEMENT.title && description === LEGACY_PRIMARY_ANNOUNCEMENT.description) {
    return DEFAULT_PRIMARY_ANNOUNCEMENT;
  }

  return { title, description };
}

export const dashboardRepo = {
  cleanupExpiredLiveClasses: async ({ db = defaultDb }: { db?: DrizzleDatabase }) => {
    await db.delete(dashboardLiveClass).where(sql`(${dashboardLiveClass.date} + ${dashboardLiveClass.time}) < now()`);
  },

  listPublishedAnnouncements: async ({ db = defaultDb }: { db?: DrizzleDatabase }) => {
    const rows = await db
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
      .orderBy(asc(dashboardAnnouncement.order), asc(dashboardAnnouncement.id))
      .limit(1);

    const row = rows[0];
    if (!row) return rows;

    const normalized = normalizePrimaryAnnouncement(row.title, row.description);
    if (normalized.title !== row.title || normalized.description !== row.description) {
      await db
        .update(dashboardAnnouncement)
        .set({
          title: normalized.title,
          description: normalized.description,
          updatedAt: new Date(),
        })
        .where(eq(dashboardAnnouncement.id, row.id));

      return [
        {
          ...row,
          title: normalized.title,
          description: normalized.description,
        },
      ];
    }

    return rows;
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
