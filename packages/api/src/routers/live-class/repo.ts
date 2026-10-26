import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { dashboardLiveClass } from "@habitutor/db/schema/dashboard";
import { product, transaction } from "@habitutor/db/schema/transaction";
import { and, asc, eq, gte, lt, sql } from "drizzle-orm";
import { PREMIUM_PACKAGES } from "../../lib/constants";

export const liveClassRepo = {
  /** Kelas terpublikasi dengan tanggal di rentang [from, to), tanggal format YYYY-MM-DD. */
  listPublishedBetween: async ({ db = defaultDb, from, to }: { db?: DrizzleDatabase; from: string; to: string }) => {
    return db
      .select({
        id: dashboardLiveClass.id,
        title: dashboardLiveClass.title,
        teacher: dashboardLiveClass.teacher,
        date: sql<string>`to_char(${dashboardLiveClass.date}, 'YYYY-MM-DD')`,
        time: sql<string>`to_char(${dashboardLiveClass.time}, 'HH24:MI')`,
        durationMinutes: dashboardLiveClass.durationMinutes,
        category: dashboardLiveClass.category,
        access: dashboardLiveClass.access,
        link: dashboardLiveClass.link,
      })
      .from(dashboardLiveClass)
      .where(
        and(
          eq(dashboardLiveClass.isPublished, true),
          gte(dashboardLiveClass.date, from),
          lt(dashboardLiveClass.date, to),
        ),
      )
      .orderBy(asc(dashboardLiveClass.date), asc(dashboardLiveClass.time), asc(dashboardLiveClass.id));
  },

  hasMandiriPackage: async ({ db = defaultDb, userId }: { db?: DrizzleDatabase; userId: string }) => {
    const [row] = await db
      .select({ id: transaction.id })
      .from(transaction)
      .innerJoin(product, eq(transaction.productId, product.id))
      .where(
        and(
          eq(transaction.userId, userId),
          eq(transaction.status, "success"),
          eq(product.slug, PREMIUM_PACKAGES.paketmandiri2027.SLUG),
        ),
      )
      .limit(1);
    return Boolean(row);
  },
};
