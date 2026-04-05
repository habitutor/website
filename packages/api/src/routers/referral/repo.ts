import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { referralCode, referralUsage } from "@habitutor/db/schema/referral";
import { transaction } from "@habitutor/db/schema/transaction";
import { and, desc, eq, or, sql } from "drizzle-orm";

const REFERRAL_CODE_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*-_";
const REFERRAL_CODE_LENGTH = 11;

export type ReferralValidationReason = "invalid_length" | "not_found" | "own_code" | "already_used";

type ReferralValidationResult =
  | {
      ok: true;
      codeRecord: typeof referralCode.$inferSelect;
      existingUsage?: typeof referralUsage.$inferSelect;
    }
  | {
      ok: false;
      reason: ReferralValidationReason;
    };

function generateCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(REFERRAL_CODE_LENGTH));
  return Array.from(bytes)
    .map((byte) => REFERRAL_CODE_CHARS[byte % REFERRAL_CODE_CHARS.length])
    .join("");
}

export const referralRepo = {
  getCodeByUserId: async ({ db = defaultDb, userId }: { db?: DrizzleDatabase; userId: string }) => {
    const [result] = await db.select().from(referralCode).where(eq(referralCode.userId, userId)).limit(1);
    return result;
  },

  getCodeByCode: async ({ db = defaultDb, code }: { db?: DrizzleDatabase; code: string }) => {
    const [result] = await db.select().from(referralCode).where(eq(referralCode.code, code)).limit(1);
    return result;
  },

  getUserUsage: async ({ db = defaultDb, userId }: { db?: DrizzleDatabase; userId: string }) => {
    const [result] = await db.select().from(referralUsage).where(eq(referralUsage.userId, userId)).limit(1);
    return result;
  },

  validateCodeForUser: async ({
    db = defaultDb,
    userId,
    code,
    allowPendingSameCode = false,
  }: {
    db?: DrizzleDatabase;
    userId: string;
    code: string;
    allowPendingSameCode?: boolean;
  }): Promise<ReferralValidationResult> => {
    if (code.length !== REFERRAL_CODE_LENGTH) {
      return { ok: false, reason: "invalid_length" };
    }

    const codeRecord = await referralRepo.getCodeByCode({ db, code });
    if (!codeRecord) {
      return { ok: false, reason: "not_found" };
    }

    if (codeRecord.userId === userId) {
      return { ok: false, reason: "own_code" };
    }

    const existingUsage = await referralRepo.getUserUsage({ db, userId });
    if (existingUsage) {
      const canReusePendingSameCode =
        allowPendingSameCode && existingUsage.referralCodeId === codeRecord.id && existingUsage.transactionId == null;

      if (!canReusePendingSameCode) {
        return { ok: false, reason: "already_used" };
      }
    }

    return { ok: true, codeRecord, existingUsage: existingUsage ?? undefined };
  },

  generateAndStoreCode: async ({
    db = defaultDb,
    userId,
  }: {
    db?: DrizzleDatabase;
    userId: string;
  }): Promise<typeof referralCode.$inferSelect> => {
    const maxRetries = 5;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const code = generateCode();
      try {
        const [result] = await db
          .insert(referralCode)
          .values({ code, userId })
          .onConflictDoNothing({ target: referralCode.code })
          .returning();
        if (result) return result;
      } catch {
        // Retry on conflict (e.g., userId already has a code from a race condition)
        const existing = await db.select().from(referralCode).where(eq(referralCode.userId, userId)).limit(1);
        if (existing[0]) return existing[0];
      }
    }
    throw new Error("Failed to generate a unique referral code after multiple attempts.");
  },

  createUsage: async ({
    db = defaultDb,
    userId,
    referralCodeId,
    transactionId,
    cashbackAmount,
  }: {
    db?: DrizzleDatabase;
    userId: string;
    referralCodeId: string;
    transactionId?: string | null;
    cashbackAmount?: string | null;
  }) => {
    const values: typeof referralUsage.$inferInsert = { userId, referralCodeId };
    if (transactionId) values.transactionId = transactionId;
    if (cashbackAmount) values.cashbackAmount = cashbackAmount;

    const [result] = await db.insert(referralUsage).values(values).returning();
    return result;
  },

  incrementReferralCount: async ({
    db = defaultDb,
    referralCodeId,
  }: {
    db?: DrizzleDatabase;
    referralCodeId: string;
  }) => {
    await db
      .update(referralCode)
      .set({ referralCount: sql`${referralCode.referralCount} + 1` })
      .where(eq(referralCode.id, referralCodeId));
  },

  getTransactionReferralCodeId: async ({
    db = defaultDb,
    transactionId,
  }: {
    db?: DrizzleDatabase;
    transactionId: string;
  }) => {
    const [result] = await db
      .select({ referralCodeId: transaction.referralCodeId })
      .from(transaction)
      .where(eq(transaction.id, transactionId))
      .limit(1);
    return result?.referralCodeId;
  },

  getUsageByTransactionId: async ({
    db = defaultDb,
    transactionId,
  }: {
    db?: DrizzleDatabase;
    transactionId: string;
  }) => {
    const [result] = await db
      .select()
      .from(referralUsage)
      .where(eq(referralUsage.transactionId, transactionId))
      .limit(1);
    return result;
  },

  attachPendingUsageToTransaction: async ({
    db = defaultDb,
    userId,
    referralCodeId,
    transactionId,
    cashbackAmount,
  }: {
    db?: DrizzleDatabase;
    userId: string;
    referralCodeId: string;
    transactionId: string;
    cashbackAmount: string;
  }) => {
    const [updated] = await db
      .update(referralUsage)
      .set({
        transactionId,
        cashbackAmount,
      })
      .where(
        and(
          eq(referralUsage.userId, userId),
          eq(referralUsage.referralCodeId, referralCodeId),
          sql`${referralUsage.transactionId} is null`,
        ),
      )
      .returning();

    return updated;
  },

  listAdminReferralTransactions: async ({
    db = defaultDb,
    limit,
    cursorCreatedAt,
    cursorId,
    search,
  }: {
    db?: DrizzleDatabase;
    limit: number;
    cursorCreatedAt: Date | null;
    cursorId: string | null;
    search: string;
  }) => {
    const likeKeyword = `%${search}%`;

    return db
      .select({
        usageId: referralUsage.id,
        usedAt: referralUsage.createdAt,
        transactionId: referralUsage.transactionId,
        transactionStatus: transaction.status,
        transactionGrossAmount: transaction.grossAmount,
        cashbackAmount: referralUsage.cashbackAmount,
        paidAt: transaction.paidAt,
        referralCode: referralCode.code,
        usedByUserId: referralUsage.userId,
        usedByName: sql<string>`(
          select u.name
          from "user" u
          where u.id = ${referralUsage.userId}
          limit 1
        )`,
        usedByEmail: sql<string>`(
          select u.email
          from "user" u
          where u.id = ${referralUsage.userId}
          limit 1
        )`,
        ownerUserId: referralCode.userId,
        ownerName: sql<string>`(
          select u.name
          from "user" u
          where u.id = ${referralCode.userId}
          limit 1
        )`,
        ownerEmail: sql<string>`(
          select u.email
          from "user" u
          where u.id = ${referralCode.userId}
          limit 1
        )`,
      })
      .from(referralUsage)
      .innerJoin(referralCode, eq(referralUsage.referralCodeId, referralCode.id))
      .innerJoin(transaction, eq(referralUsage.transactionId, transaction.id))
      .where(
        and(
          search.length > 0
            ? or(
                sql`${referralCode.code} ilike ${likeKeyword}`,
                sql`exists (
                  select 1
                  from "user" used_u
                  where used_u.id = ${referralUsage.userId}
                    and (used_u.name ilike ${likeKeyword} or used_u.email ilike ${likeKeyword})
                )`,
                sql`exists (
                  select 1
                  from "user" owner_u
                  where owner_u.id = ${referralCode.userId}
                    and (owner_u.name ilike ${likeKeyword} or owner_u.email ilike ${likeKeyword})
                )`,
                sql`${referralUsage.transactionId} ilike ${likeKeyword}`,
              )
            : undefined,
          cursorCreatedAt && cursorId
            ? sql`(${referralUsage.createdAt}, ${referralUsage.id}) < (${cursorCreatedAt}, ${cursorId})`
            : undefined,
        ),
      )
      .orderBy(desc(referralUsage.createdAt), desc(referralUsage.id))
      .limit(limit + 1);
  },
};
