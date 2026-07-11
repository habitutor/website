import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { session, user } from "@habitutor/db/schema/auth";
import { product, transaction } from "@habitutor/db/schema/transaction";
import { and, count, countDistinct, desc, eq, gte, isNotNull, lt, or, sql } from "drizzle-orm";

const DAY_MS = 24 * 60 * 60 * 1000;

function daysAgo(days: number) {
  return new Date(Date.now() - days * DAY_MS);
}

function daysFromNow(days: number) {
  return new Date(Date.now() + days * DAY_MS);
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function fillDailySeries(rows: { day: string; value: number }[], days: number) {
  const byDay = new Map(rows.map((row) => [row.day, row.value]));
  const series: { date: string; value: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const key = toDateKey(daysAgo(i));
    series.push({ date: key, value: byDay.get(key) ?? 0 });
  }
  return series;
}

const dayOf = (column: unknown) => sql<string>`to_char(date_trunc('day', ${column}), 'YYYY-MM-DD')`;

export const adminMetricsRepo = {
  getBusinessOverview: async ({ db = defaultDb }: { db?: DrizzleDatabase }) => {
    const now = new Date();
    const premiumNotExpired = or(sql`${user.premiumExpiresAt} IS NULL`, gte(user.premiumExpiresAt, now));

    const [
      [totalUsers],
      [verifiedUsers],
      [newUsers7d],
      [newUsers30d],
      [activePremium],
      [expiredPremium],
      [expiringPremium30d],
      premiumByTier,
      [dau],
      [wau],
      [mau],
      [payingUsers],
      [revenueTotal],
      [revenue30d],
      transactionsByStatus,
    ] = await Promise.all([
      db.select({ count: count() }).from(user),
      db.select({ count: count() }).from(user).where(eq(user.emailVerified, true)),
      db
        .select({ count: count() })
        .from(user)
        .where(gte(user.createdAt, daysAgo(7))),
      db
        .select({ count: count() })
        .from(user)
        .where(gte(user.createdAt, daysAgo(30))),
      db
        .select({ count: count() })
        .from(user)
        .where(and(eq(user.isPremium, true), premiumNotExpired)),
      db
        .select({ count: count() })
        .from(user)
        .where(and(isNotNull(user.premiumExpiresAt), lt(user.premiumExpiresAt, now))),
      db
        .select({ count: count() })
        .from(user)
        .where(
          and(eq(user.isPremium, true), gte(user.premiumExpiresAt, now), lt(user.premiumExpiresAt, daysFromNow(30))),
        ),
      db
        .select({ tier: user.premiumTier, count: count() })
        .from(user)
        .where(and(eq(user.isPremium, true), premiumNotExpired, isNotNull(user.premiumTier)))
        .groupBy(user.premiumTier),
      db
        .select({ count: countDistinct(session.userId) })
        .from(session)
        .where(gte(session.updatedAt, daysAgo(1))),
      db
        .select({ count: countDistinct(session.userId) })
        .from(session)
        .where(gte(session.updatedAt, daysAgo(7))),
      db
        .select({ count: countDistinct(session.userId) })
        .from(session)
        .where(gte(session.updatedAt, daysAgo(30))),
      db
        .select({ count: countDistinct(transaction.userId) })
        .from(transaction)
        .where(eq(transaction.status, "success")),
      db
        .select({ total: sql<string>`coalesce(sum(${transaction.grossAmount}::numeric), 0)` })
        .from(transaction)
        .where(eq(transaction.status, "success")),
      db
        .select({ total: sql<string>`coalesce(sum(${transaction.grossAmount}::numeric), 0)` })
        .from(transaction)
        .where(and(eq(transaction.status, "success"), gte(transaction.paidAt, daysAgo(30)))),
      db.select({ status: transaction.status, count: count() }).from(transaction).groupBy(transaction.status),
    ]);

    const total = totalUsers?.count ?? 0;
    const active30d = mau?.count ?? 0;
    const churnedPremium = expiredPremium?.count ?? 0;
    const premiumEver = (activePremium?.count ?? 0) + churnedPremium;

    return {
      accounts: {
        total,
        verified: verifiedUsers?.count ?? 0,
        newLast7Days: newUsers7d?.count ?? 0,
        newLast30Days: newUsers30d?.count ?? 0,
      },
      activity: {
        dau: dau?.count ?? 0,
        wau: wau?.count ?? 0,
        mau: active30d,
        inactiveLast30Days: Math.max(total - active30d, 0),
      },
      premium: {
        active: activePremium?.count ?? 0,
        expired: churnedPremium,
        expiringNext30Days: expiringPremium30d?.count ?? 0,
        byTier: premiumByTier.map((row) => ({ tier: row.tier ?? "unknown", count: row.count })),
        payingUsers: payingUsers?.count ?? 0,
        conversionRate: total > 0 ? (payingUsers?.count ?? 0) / total : 0,
        churnRate: premiumEver > 0 ? churnedPremium / premiumEver : 0,
      },
      revenue: {
        total: Number(revenueTotal?.total ?? 0),
        last30Days: Number(revenue30d?.total ?? 0),
        transactionsByStatus: transactionsByStatus.map((row) => ({ status: row.status, count: row.count })),
      },
    };
  },

  getTimeSeries: async ({ days, db = defaultDb }: { days: number; db?: DrizzleDatabase }) => {
    const since = daysAgo(days);

    const [signups, activeUsers, revenue, premiumPurchases] = await Promise.all([
      db
        .select({ day: dayOf(user.createdAt), value: count() })
        .from(user)
        .where(gte(user.createdAt, since))
        .groupBy(dayOf(user.createdAt)),
      db
        .select({ day: dayOf(session.createdAt), value: countDistinct(session.userId) })
        .from(session)
        .where(gte(session.createdAt, since))
        .groupBy(dayOf(session.createdAt)),
      db
        .select({
          day: dayOf(transaction.paidAt),
          value: sql<number>`coalesce(sum(${transaction.grossAmount}::numeric), 0)::float`,
        })
        .from(transaction)
        .where(and(eq(transaction.status, "success"), gte(transaction.paidAt, since)))
        .groupBy(dayOf(transaction.paidAt)),
      db
        .select({ day: dayOf(transaction.paidAt), value: count() })
        .from(transaction)
        .innerJoin(product, eq(transaction.productId, product.id))
        .where(and(eq(transaction.status, "success"), eq(product.type, "subscription"), gte(transaction.paidAt, since)))
        .groupBy(dayOf(transaction.paidAt)),
    ]);

    return {
      signups: fillDailySeries(signups, days),
      activeUsers: fillDailySeries(activeUsers, days),
      revenue: fillDailySeries(revenue, days),
      premiumPurchases: fillDailySeries(premiumPurchases, days),
    };
  },

  getAudienceInsights: async ({ db = defaultDb }: { db?: DrizzleDatabase }) => {
    const [topDreamCampuses, topDreamMajors] = await Promise.all([
      db
        .select({ name: user.dreamCampus, count: count() })
        .from(user)
        .where(and(isNotNull(user.dreamCampus), sql`${user.dreamCampus} <> ''`))
        .groupBy(user.dreamCampus)
        .orderBy(desc(count()))
        .limit(10),
      db
        .select({ name: user.dreamMajor, count: count() })
        .from(user)
        .where(and(isNotNull(user.dreamMajor), sql`${user.dreamMajor} <> ''`))
        .groupBy(user.dreamMajor)
        .orderBy(desc(count()))
        .limit(10),
    ]);

    return {
      topDreamCampuses: topDreamCampuses.map((row) => ({ name: row.name ?? "", count: row.count })),
      topDreamMajors: topDreamMajors.map((row) => ({ name: row.name ?? "", count: row.count })),
    };
  },
};
