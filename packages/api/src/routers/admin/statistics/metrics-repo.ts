import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { session, user } from "@habitutor/db/schema/auth";
import { product, transaction } from "@habitutor/db/schema/transaction";
import { and, count, countDistinct, desc, eq, gte, isNotNull, lt, or, sql } from "drizzle-orm";
import { FREEMIUM_PEMBAHASAN_PRODUCT, FREEMIUM_PRODUCT } from "../../../lib/constants";

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

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
const MONTHLY_REPORT_MIN_YEAR = 2024;

const monthOf = (column: unknown) =>
  sql<string>`to_char(date_trunc('month', (${column} AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Jakarta'), 'YYYY-MM')`;

function getWibYearMonth(date = new Date()) {
  const wib = new Date(date.getTime() + WIB_OFFSET_MS);
  return { year: wib.getUTCFullYear(), month: wib.getUTCMonth() + 1 };
}

function splitRevenue(row?: { total: number; premium: number; to10k: number; to5k: number }) {
  const total = row?.total ?? 0;
  const premium = row?.premium ?? 0;
  const to10k = row?.to10k ?? 0;
  const to5k = row?.to5k ?? 0;
  return {
    revenue: total,
    revenuePremium: premium,
    revenueTo10k: to10k,
    revenueTo5k: to5k,
    revenueOther: Math.max(total - premium - to10k - to5k, 0),
  };
}

function wibMonthStart(year: number, month: number) {
  return new Date(Date.UTC(year, month - 1, 1) - WIB_OFFSET_MS);
}

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

  getMonthlyStats: async ({
    year: requestedYear,
    fromMonth: requestedFrom,
    toMonth: requestedTo,
    db = defaultDb,
  }: {
    year?: number;
    fromMonth?: number;
    toMonth?: number;
    db?: DrizzleDatabase;
  }) => {
    const current = getWibYearMonth();
    const year = Math.min(Math.max(Math.trunc(requestedYear ?? current.year), MONTHLY_REPORT_MIN_YEAR), current.year);
    const latestMonth = year === current.year ? current.month : 12;
    const toMonth = Math.min(Math.max(Math.trunc(requestedTo ?? latestMonth), 1), latestMonth);
    const fromMonth = Math.min(Math.max(Math.trunc(requestedFrom ?? 1), 1), toMonth);
    const from = wibMonthStart(year, fromMonth);
    const to = wibMonthStart(year, toMonth + 1);
    const paidInYear = and(
      eq(transaction.status, "success"),
      eq(transaction.isSimulation, false),
      gte(transaction.paidAt, from),
      lt(transaction.paidAt, to),
    );

    const [signups, [usersBefore], revenue, premium, [premiumYear]] = await Promise.all([
      db
        .select({ month: monthOf(user.createdAt), value: count() })
        .from(user)
        .where(and(gte(user.createdAt, from), lt(user.createdAt, to)))
        .groupBy(monthOf(user.createdAt)),
      db.select({ value: count() }).from(user).where(lt(user.createdAt, from)),
      db
        .select({
          month: monthOf(transaction.paidAt),
          total: sql<number>`coalesce(sum(${transaction.grossAmount}::numeric), 0)::float`,
          premium: sql<number>`coalesce(sum(${transaction.grossAmount}::numeric) filter (where ${product.type} = 'subscription'), 0)::float`,
          to10k: sql<number>`coalesce(sum(${transaction.grossAmount}::numeric) filter (where ${product.slug} = ${FREEMIUM_PRODUCT.SLUG}), 0)::float`,
          to5k: sql<number>`coalesce(sum(${transaction.grossAmount}::numeric) filter (where ${product.slug} = ${FREEMIUM_PEMBAHASAN_PRODUCT.SLUG}), 0)::float`,
        })
        .from(transaction)
        .leftJoin(product, eq(transaction.productId, product.id))
        .where(paidInYear)
        .groupBy(monthOf(transaction.paidAt)),
      db
        .select({
          month: monthOf(transaction.paidAt),
          customers: countDistinct(transaction.userId),
          purchases: count(),
        })
        .from(transaction)
        .innerJoin(product, eq(transaction.productId, product.id))
        .where(and(paidInYear, eq(product.type, "subscription")))
        .groupBy(monthOf(transaction.paidAt)),
      db
        .select({ customers: countDistinct(transaction.userId) })
        .from(transaction)
        .innerJoin(product, eq(transaction.productId, product.id))
        .where(and(paidInYear, eq(product.type, "subscription"))),
    ]);

    const signupByMonth = new Map(signups.map((row) => [row.month, row.value]));
    const revenueByMonth = new Map(revenue.map((row) => [row.month, row]));
    const premiumByMonth = new Map(premium.map((row) => [row.month, row]));

    let runningTotal = usersBefore?.value ?? 0;
    const months = Array.from({ length: toMonth - fromMonth + 1 }, (_, index) => {
      const key = `${year}-${String(fromMonth + index).padStart(2, "0")}`;
      const newUsers = signupByMonth.get(key) ?? 0;
      runningTotal += newUsers;
      return {
        month: key,
        signups: newUsers,
        totalUsers: runningTotal,
        premiumCustomers: premiumByMonth.get(key)?.customers ?? 0,
        premiumPurchases: premiumByMonth.get(key)?.purchases ?? 0,
        ...splitRevenue(revenueByMonth.get(key)),
      };
    });

    return {
      year,
      fromMonth,
      toMonth,
      months,
      totals: {
        signups: months.reduce((sum, row) => sum + row.signups, 0),
        premiumCustomers: premiumYear?.customers ?? 0,
        premiumPurchases: months.reduce((sum, row) => sum + row.premiumPurchases, 0),
        revenue: months.reduce((sum, row) => sum + row.revenue, 0),
        revenuePremium: months.reduce((sum, row) => sum + row.revenuePremium, 0),
        revenueTo10k: months.reduce((sum, row) => sum + row.revenueTo10k, 0),
        revenueTo5k: months.reduce((sum, row) => sum + row.revenueTo5k, 0),
        revenueOther: months.reduce((sum, row) => sum + row.revenueOther, 0),
      },
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
