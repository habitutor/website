import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { user } from "@habitutor/db/schema/auth";
import { groupBuy, groupBuyMember } from "@habitutor/db/schema/group-buy";
import { and, asc, count, desc, eq, inArray, lte } from "drizzle-orm";

const INVITE_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const INVITE_CODE_LENGTH = 8;

export function generateInviteCode() {
  const bytes = new Uint8Array(INVITE_CODE_LENGTH);
  crypto.getRandomValues(bytes);
  let code = "";
  for (const byte of bytes) {
    code += INVITE_CODE_ALPHABET[byte % INVITE_CODE_ALPHABET.length];
  }
  return code;
}

export const groupBuyRepo = {
  createGroup: async ({
    db = defaultDb,
    inviteCode,
    creatorUserId,
    productId,
    seatPrice,
    fullPrice,
    requiredMembers,
    expiresAt,
  }: {
    db?: DrizzleDatabase;
    inviteCode: string;
    creatorUserId: string;
    productId: string;
    seatPrice: string;
    fullPrice: string;
    requiredMembers: number;
    expiresAt: Date;
  }) => {
    const [group] = await db
      .insert(groupBuy)
      .values({ inviteCode, creatorUserId, productId, seatPrice, fullPrice, requiredMembers, expiresAt })
      .returning();
    return group;
  },

  getGroupById: async ({ db = defaultDb, id, lock = false }: { db?: DrizzleDatabase; id: string; lock?: boolean }) => {
    const query = db.select().from(groupBuy).where(eq(groupBuy.id, id)).limit(1);
    const [group] = lock ? await query.for("update") : await query;
    return group;
  },

  getGroupByInviteCode: async ({
    db = defaultDb,
    inviteCode,
    lock = false,
  }: {
    db?: DrizzleDatabase;
    inviteCode: string;
    lock?: boolean;
  }) => {
    const query = db.select().from(groupBuy).where(eq(groupBuy.inviteCode, inviteCode)).limit(1);
    const [group] = lock ? await query.for("update") : await query;
    return group;
  },

  updateGroupStatus: async ({
    db = defaultDb,
    id,
    status,
    completedAt,
    onlyIfCurrentStatus,
  }: {
    db?: DrizzleDatabase;
    id: string;
    status: "active" | "completed" | "expired";
    completedAt?: Date;
    onlyIfCurrentStatus?: "active" | "completed" | "expired";
  }) => {
    const [group] = await db
      .update(groupBuy)
      .set({ status, completedAt, updatedAt: new Date() })
      .where(
        onlyIfCurrentStatus ? and(eq(groupBuy.id, id), eq(groupBuy.status, onlyIfCurrentStatus)) : eq(groupBuy.id, id),
      )
      .returning();
    return group;
  },

  markGroupExpiredNotified: async ({ db = defaultDb, id }: { db?: DrizzleDatabase; id: string }) => {
    await db.update(groupBuy).set({ expiredNotifiedAt: new Date(), updatedAt: new Date() }).where(eq(groupBuy.id, id));
  },

  getDueActiveGroups: async ({
    db = defaultDb,
    now,
    limit = 50,
  }: {
    db?: DrizzleDatabase;
    now: Date;
    limit?: number;
  }) => {
    return db
      .select()
      .from(groupBuy)
      .where(and(eq(groupBuy.status, "active"), lte(groupBuy.expiresAt, now)))
      .orderBy(asc(groupBuy.expiresAt))
      .limit(limit);
  },

  createMember: async ({
    db = defaultDb,
    groupBuyId,
    userId,
    transactionId,
  }: {
    db?: DrizzleDatabase;
    groupBuyId: string;
    userId: string;
    transactionId?: string;
  }) => {
    const [member] = await db.insert(groupBuyMember).values({ groupBuyId, userId, transactionId }).returning();
    return member;
  },

  getMemberByGroupAndUser: async ({
    db = defaultDb,
    groupBuyId,
    userId,
    lock = false,
  }: {
    db?: DrizzleDatabase;
    groupBuyId: string;
    userId: string;
    lock?: boolean;
  }) => {
    const query = db
      .select()
      .from(groupBuyMember)
      .where(and(eq(groupBuyMember.groupBuyId, groupBuyId), eq(groupBuyMember.userId, userId)))
      .limit(1);
    const [member] = lock ? await query.for("update") : await query;
    return member;
  },

  getMemberBySeatTransactionId: async ({
    db = defaultDb,
    transactionId,
    lock = false,
  }: {
    db?: DrizzleDatabase;
    transactionId: string;
    lock?: boolean;
  }) => {
    const query = db.select().from(groupBuyMember).where(eq(groupBuyMember.transactionId, transactionId)).limit(1);
    const [member] = lock ? await query.for("update") : await query;
    return member;
  },

  getMemberByTopupTransactionId: async ({
    db = defaultDb,
    transactionId,
    lock = false,
  }: {
    db?: DrizzleDatabase;
    transactionId: string;
    lock?: boolean;
  }) => {
    const query = db.select().from(groupBuyMember).where(eq(groupBuyMember.topupTransactionId, transactionId)).limit(1);
    const [member] = lock ? await query.for("update") : await query;
    return member;
  },

  getMembersWithUsers: async ({ db = defaultDb, groupBuyId }: { db?: DrizzleDatabase; groupBuyId: string }) => {
    return db
      .select({
        member: groupBuyMember,
        userName: user.name,
        userEmail: user.email,
      })
      .from(groupBuyMember)
      .innerJoin(user, eq(groupBuyMember.userId, user.id))
      .where(eq(groupBuyMember.groupBuyId, groupBuyId))
      .orderBy(asc(groupBuyMember.joinedAt));
  },

  countMembers: async ({ db = defaultDb, groupBuyId }: { db?: DrizzleDatabase; groupBuyId: string }) => {
    const [result] = await db
      .select({ total: count() })
      .from(groupBuyMember)
      .where(eq(groupBuyMember.groupBuyId, groupBuyId));
    return result?.total ?? 0;
  },

  getPaidMembers: async ({ db = defaultDb, groupBuyId }: { db?: DrizzleDatabase; groupBuyId: string }) => {
    return db
      .select()
      .from(groupBuyMember)
      .where(and(eq(groupBuyMember.groupBuyId, groupBuyId), eq(groupBuyMember.status, "paid")));
  },

  getMembershipsByUser: async ({
    db = defaultDb,
    userId,
    limit = 10,
  }: {
    db?: DrizzleDatabase;
    userId: string;
    limit?: number;
  }) => {
    return db
      .select({
        member: groupBuyMember,
        group: groupBuy,
      })
      .from(groupBuyMember)
      .innerJoin(groupBuy, eq(groupBuyMember.groupBuyId, groupBuy.id))
      .where(eq(groupBuyMember.userId, userId))
      .orderBy(desc(groupBuyMember.joinedAt))
      .limit(limit);
  },

  updateMemberSeatTransaction: async ({
    db = defaultDb,
    memberId,
    transactionId,
  }: {
    db?: DrizzleDatabase;
    memberId: string;
    transactionId: string;
  }) => {
    const [member] = await db
      .update(groupBuyMember)
      .set({ transactionId, updatedAt: new Date() })
      .where(eq(groupBuyMember.id, memberId))
      .returning();
    return member;
  },

  updateMemberTopupTransaction: async ({
    db = defaultDb,
    memberId,
    topupTransactionId,
  }: {
    db?: DrizzleDatabase;
    memberId: string;
    topupTransactionId: string;
  }) => {
    const [member] = await db
      .update(groupBuyMember)
      .set({ topupTransactionId, updatedAt: new Date() })
      .where(eq(groupBuyMember.id, memberId))
      .returning();
    return member;
  },

  markMemberPaid: async ({
    db = defaultDb,
    memberId,
    paidAt,
  }: {
    db?: DrizzleDatabase;
    memberId: string;
    paidAt: Date;
  }) => {
    const [member] = await db
      .update(groupBuyMember)
      .set({ status: "paid", paidAt, updatedAt: new Date() })
      .where(and(eq(groupBuyMember.id, memberId), eq(groupBuyMember.status, "pending_payment")))
      .returning();
    return member;
  },

  markMemberUpgraded: async ({ db = defaultDb, memberId }: { db?: DrizzleDatabase; memberId: string }) => {
    const [member] = await db
      .update(groupBuyMember)
      .set({ status: "upgraded", updatedAt: new Date() })
      .where(eq(groupBuyMember.id, memberId))
      .returning();
    return member;
  },

  requestMemberRefund: async ({
    db = defaultDb,
    memberId,
    bankName,
    accountNumber,
    accountHolder,
  }: {
    db?: DrizzleDatabase;
    memberId: string;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  }) => {
    const [member] = await db
      .update(groupBuyMember)
      .set({
        status: "refund_requested",
        refundBankName: bankName,
        refundAccountNumber: accountNumber,
        refundAccountHolder: accountHolder,
        refundRequestedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(groupBuyMember.id, memberId), eq(groupBuyMember.status, "paid")))
      .returning();
    return member;
  },

  markMemberRefunded: async ({ db = defaultDb, memberId }: { db?: DrizzleDatabase; memberId: string }) => {
    const [member] = await db
      .update(groupBuyMember)
      .set({ status: "refunded", refundedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(groupBuyMember.id, memberId), eq(groupBuyMember.status, "refund_requested")))
      .returning();
    return member;
  },

  adminListGroups: async ({
    db = defaultDb,
    status,
    page = 1,
    limit = 20,
  }: {
    db?: DrizzleDatabase;
    status?: "active" | "completed" | "expired";
    page?: number;
    limit?: number;
  }) => {
    const where = status ? eq(groupBuy.status, status) : undefined;

    const [rows, [totalRow]] = await Promise.all([
      db
        .select({
          group: groupBuy,
          creatorName: user.name,
          creatorEmail: user.email,
          memberCount: count(groupBuyMember.id),
        })
        .from(groupBuy)
        .innerJoin(user, eq(groupBuy.creatorUserId, user.id))
        .leftJoin(groupBuyMember, eq(groupBuyMember.groupBuyId, groupBuy.id))
        .where(where)
        .groupBy(groupBuy.id, user.name, user.email)
        .orderBy(desc(groupBuy.createdAt))
        .limit(limit)
        .offset((page - 1) * limit),
      db.select({ total: count() }).from(groupBuy).where(where),
    ]);

    return { rows, total: totalRow?.total ?? 0 };
  },

  adminCountPaidMembersByGroups: async ({
    db = defaultDb,
    groupBuyIds,
  }: {
    db?: DrizzleDatabase;
    groupBuyIds: string[];
  }) => {
    if (groupBuyIds.length === 0) return [];
    return db
      .select({ groupBuyId: groupBuyMember.groupBuyId, paidCount: count() })
      .from(groupBuyMember)
      .where(
        and(
          inArray(groupBuyMember.groupBuyId, groupBuyIds),
          inArray(groupBuyMember.status, ["paid", "upgraded", "refund_requested", "refunded"]),
        ),
      )
      .groupBy(groupBuyMember.groupBuyId);
  },

  adminListRefundRequests: async ({
    db = defaultDb,
    status = "refund_requested",
    page = 1,
    limit = 20,
  }: {
    db?: DrizzleDatabase;
    status?: "refund_requested" | "refunded";
    page?: number;
    limit?: number;
  }) => {
    const where = eq(groupBuyMember.status, status);

    const [rows, [totalRow]] = await Promise.all([
      db
        .select({
          member: groupBuyMember,
          userName: user.name,
          userEmail: user.email,
          userPhoneNumber: user.phoneNumber,
          inviteCode: groupBuy.inviteCode,
          seatPrice: groupBuy.seatPrice,
        })
        .from(groupBuyMember)
        .innerJoin(user, eq(groupBuyMember.userId, user.id))
        .innerJoin(groupBuy, eq(groupBuyMember.groupBuyId, groupBuy.id))
        .where(where)
        .orderBy(desc(groupBuyMember.refundRequestedAt))
        .limit(limit)
        .offset((page - 1) * limit),
      db.select({ total: count() }).from(groupBuyMember).where(where),
    ]);

    return { rows, total: totalRow?.total ?? 0 };
  },
};
