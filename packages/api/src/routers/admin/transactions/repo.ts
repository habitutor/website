import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { user } from "@habitutor/db/schema/auth";
import { product, transaction } from "@habitutor/db/schema/transaction";
import { and, asc, count, desc, eq, gte, ilike, isNotNull, lte, or } from "drizzle-orm";

type TransactionSort = "date" | "amount" | "status" | "paymentType" | "user" | "package";

export const adminTransactionRepo = {
  list: async ({
    db = defaultDb,
    limit,
    offset,
    search,
    status,
    paymentType,
    from,
    to,
    sortBy,
    sortDirection,
  }: {
    db?: DrizzleDatabase;
    limit: number;
    offset: number;
    search?: string;
    status?: string;
    paymentType?: string;
    from?: Date;
    to?: Date;
    sortBy: TransactionSort;
    sortDirection: "asc" | "desc";
  }) => {
    const filters = and(
      search
        ? or(
            ilike(transaction.id, `%${search}%`),
            ilike(transaction.gatewayTransactionId, `%${search}%`),
            ilike(user.name, `%${search}%`),
            ilike(user.email, `%${search}%`),
          )
        : undefined,
      status
        ? or(eq(transaction.gatewayStatus, status), eq(transaction.status, status as "pending" | "success" | "failed"))
        : undefined,
      paymentType ? eq(transaction.paymentType, paymentType) : undefined,
      from ? gte(transaction.orderedAt, from) : undefined,
      to ? lte(transaction.orderedAt, to) : undefined,
    );
    const sortColumns = {
      date: transaction.orderedAt,
      amount: transaction.grossAmount,
      status: transaction.gatewayStatus,
      paymentType: transaction.paymentType,
      user: user.name,
      package: product.name,
    } as const;
    const sort = sortDirection === "asc" ? asc : desc;

    const base = db
      .select({
        orderId: transaction.id,
        transactionId: transaction.gatewayTransactionId,
        amount: transaction.grossAmount,
        status: transaction.status,
        gatewayStatus: transaction.gatewayStatus,
        paymentType: transaction.paymentType,
        fraudStatus: transaction.fraudStatus,
        isSimulation: transaction.isSimulation,
        orderedAt: transaction.orderedAt,
        paidAt: transaction.paidAt,
        userId: transaction.userId,
        userName: user.name,
        userEmail: user.email,
        productId: transaction.productId,
        productName: product.name,
        productSlug: product.slug,
      })
      .from(transaction)
      .leftJoin(user, eq(transaction.userId, user.id))
      .leftJoin(product, eq(transaction.productId, product.id))
      .where(filters);

    const [rows, totals] = await Promise.all([
      base.orderBy(sort(sortColumns[sortBy]), desc(transaction.id)).limit(limit).offset(offset),
      db
        .select({ total: count() })
        .from(transaction)
        .leftJoin(user, eq(transaction.userId, user.id))
        .leftJoin(product, eq(transaction.productId, product.id))
        .where(filters),
    ]);

    return { rows, total: totals[0]?.total ?? 0 };
  },

  filterOptions: async ({ db = defaultDb }: { db?: DrizzleDatabase } = {}) => {
    const [statuses, paymentTypes] = await Promise.all([
      db
        .selectDistinct({ value: transaction.gatewayStatus })
        .from(transaction)
        .where(isNotNull(transaction.gatewayStatus)),
      db.selectDistinct({ value: transaction.paymentType }).from(transaction).where(isNotNull(transaction.paymentType)),
    ]);

    return {
      statuses: statuses.flatMap(({ value }) => (value ? [value] : [])),
      paymentTypes: paymentTypes.flatMap(({ value }) => (value ? [value] : [])),
    };
  },
};
