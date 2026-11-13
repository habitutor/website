import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { affiliateCommission, affiliatePayout } from "@habitutor/db/schema/affiliate";
import { referralCode, referralUsage } from "@habitutor/db/schema/referral";
import { product, transaction } from "@habitutor/db/schema/transaction";
import { user } from "@habitutor/db/schema/user";
import { and, desc, eq, sql } from "drizzle-orm";
import { referralRepo } from "../referral/repo";
import { computeBalance, FRIENDLY_CODE_LENGTH, generateFriendlyCode, maskName, validatePayoutRequest } from "./logic";

export class AffiliateError extends Error {
  constructor(
    public code: "BAD_REQUEST" | "NOT_FOUND" | "CONFLICT",
    message: string,
  ) {
    super(message);
  }
}

/** Pembeli dianggap "baru" kalau belum pernah punya pembelian Premium yang sukses. */
async function hasSuccessfulPremium(db: DrizzleDatabase, userId: string) {
  const [row] = await db
    .select({ id: transaction.id })
    .from(transaction)
    .innerJoin(product, eq(transaction.productId, product.id))
    .where(and(eq(transaction.userId, userId), eq(transaction.status, "success"), eq(product.type, "subscription")))
    .limit(1);
  return Boolean(row);
}

export const affiliateRepo = {
  /**
   * Menentukan apakah checkout Premium ini berhak diskon. Kode yang diketik di checkout dipakai (dan dicatat sebagai
   * pemakaian tertunda); kalau kosong, kode yang dulu dimasukkan saat daftar dipakai. Mengembalikan null bila tidak berhak.
   * `strict` = pengguna mengetik kode sendiri, jadi alasan penolakan dikembalikan sebagai galat.
   */
  resolveDiscount: async ({
    db = defaultDb,
    userId,
    code,
  }: {
    db?: DrizzleDatabase;
    userId: string;
    code?: string;
  }) => {
    const typed = code?.trim();
    if (await hasSuccessfulPremium(db, userId)) {
      if (typed) throw new AffiliateError("BAD_REQUEST", "Kode referral hanya berlaku untuk pembelian Premium pertama.");
      return null;
    }

    if (typed) {
      const validation = await referralRepo.validateCodeForUser({ db, userId, code: typed, allowPendingSameCode: true });
      if (!validation.ok) {
        const message = {
          invalid_length: "Kode referral tidak valid.",
          not_found: "Kode referral tidak ditemukan.",
          own_code: "Kamu tidak bisa memakai kode referral milikmu sendiri.",
          already_used: "Kamu sudah memakai kode referral lain.",
        }[validation.reason];
        throw new AffiliateError(validation.reason === "not_found" ? "NOT_FOUND" : "BAD_REQUEST", message);
      }
      if (!validation.existingUsage) {
        await db.transaction(async (trx) => {
          await referralRepo.createUsage({ db: trx, userId, referralCodeId: validation.codeRecord.id });
          await referralRepo.incrementReferralCount({ db: trx, referralCodeId: validation.codeRecord.id });
        });
      }
      return validation.codeRecord;
    }

    const usage = await referralRepo.getUserUsage({ db, userId });
    if (!usage || usage.transactionId) return null;
    const [record] = await db.select().from(referralCode).where(eq(referralCode.id, usage.referralCodeId)).limit(1);
    return record && record.userId !== userId ? record : null;
  },

  /**
   * Kode lama (11 karakter dengan simbol) susah dibagikan. Selama belum ada teman yang memakainya, pemilik boleh
   * menukarnya dengan kode pendek yang baru; kode yang sudah dipakai teman tidak diubah agar tautan lama tetap jalan.
   */
  refreshLegacyCode: async ({ db = defaultDb, userId }: { db?: DrizzleDatabase; userId: string }) => {
    const current = await referralRepo.getCodeByUserId({ db, userId });
    if (!current) return referralRepo.generateAndStoreCode({ db, userId });
    if (current.code.length === FRIENDLY_CODE_LENGTH) return current;
    const [used] = await db
      .select({ id: referralUsage.id })
      .from(referralUsage)
      .where(eq(referralUsage.referralCodeId, current.id))
      .limit(1);
    if (used) throw new AffiliateError("CONFLICT", "Kodemu sudah dipakai teman, jadi tidak bisa diganti.");
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        const [row] = await db
          .update(referralCode)
          .set({ code: generateFriendlyCode() })
          .where(eq(referralCode.id, current.id))
          .returning();
        if (row) return row;
      } catch {
        // bentrok kode unik: coba lagi dengan kode lain
      }
    }
    throw new AffiliateError("CONFLICT", "Gagal membuat kode baru. Coba lagi.");
  },

  getCodeOwner: async ({ db = defaultDb, referralCodeId }: { db?: DrizzleDatabase; referralCodeId: string }) => {
    const [row] = await db
      .select({ userId: referralCode.userId })
      .from(referralCode)
      .where(eq(referralCode.id, referralCodeId))
      .limit(1);
    return row?.userId ?? null;
  },

  createCommission: async ({
    db = defaultDb,
    affiliateUserId,
    buyerUserId,
    transactionId,
    baseAmount,
    ratePercent,
    amount,
    availableAt,
  }: {
    db?: DrizzleDatabase;
    affiliateUserId: string;
    buyerUserId: string;
    transactionId: string;
    baseAmount: number;
    ratePercent: number;
    amount: number;
    availableAt: Date;
  }) => {
    await db
      .insert(affiliateCommission)
      .values({ affiliateUserId, buyerUserId, transactionId, baseAmount, ratePercent, amount, availableAt })
      .onConflictDoNothing({ target: affiliateCommission.transactionId });
  },

  /** Refund/chargeback: komisi dari transaksi itu tidak lagi dihitung ke saldo. */
  voidCommission: async ({ db = defaultDb, transactionId }: { db?: DrizzleDatabase; transactionId: string }) => {
    await db
      .update(affiliateCommission)
      .set({ status: "void" })
      .where(eq(affiliateCommission.transactionId, transactionId));
  },

  getBalance: async ({ db = defaultDb, userId }: { db?: DrizzleDatabase; userId: string }) => {
    const [commissions, payouts] = await Promise.all([
      db.select().from(affiliateCommission).where(eq(affiliateCommission.affiliateUserId, userId)),
      db.select().from(affiliatePayout).where(eq(affiliatePayout.userId, userId)),
    ]);
    return { balance: computeBalance(commissions, payouts), commissions, payouts };
  },

  /** Ringkasan untuk halaman afiliasi siswa. Nama teman disamarkan. */
  getOverview: async ({ db = defaultDb, userId }: { db?: DrizzleDatabase; userId: string }) => {
    let codeRecord = await referralRepo.getCodeByUserId({ db, userId });
    if (!codeRecord) codeRecord = await referralRepo.generateAndStoreCode({ db, userId });

    const { balance, payouts } = await affiliateRepo.getBalance({ db, userId });
    const referred = await db
      .select({
        name: user.name,
        joinedAt: referralUsage.createdAt,
        transactionId: referralUsage.transactionId,
        txStatus: transaction.status,
        commission: affiliateCommission.amount,
        commissionStatus: affiliateCommission.status,
        availableAt: affiliateCommission.availableAt,
      })
      .from(referralUsage)
      .innerJoin(user, eq(user.id, referralUsage.userId))
      .leftJoin(transaction, eq(transaction.id, referralUsage.transactionId))
      .leftJoin(affiliateCommission, eq(affiliateCommission.transactionId, referralUsage.transactionId))
      .where(eq(referralUsage.referralCodeId, codeRecord.id))
      .orderBy(desc(referralUsage.createdAt))
      .limit(100);

    const now = Date.now();
    const referrals = referred.map((row) => ({
      name: maskName(row.name),
      joinedAt: row.joinedAt,
      status:
        row.commissionStatus === "void" || row.txStatus === "failed"
          ? ("refunded" as const)
          : row.commission !== null && row.commissionStatus === "active"
            ? row.availableAt && row.availableAt.getTime() > now
              ? ("holding" as const)
              : ("earned" as const)
            : ("signed_up" as const),
      commission: row.commissionStatus === "active" ? row.commission : null,
    }));

    return {
      code: codeRecord.code,
      signupCount: referred.length,
      buyerCount: referrals.filter((r) => r.status === "holding" || r.status === "earned").length,
      balance,
      referrals,
      payouts: payouts
        .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime())
        .slice(0, 20)
        .map((p) => ({
          id: p.id,
          amount: p.amount,
          status: p.status,
          requestedAt: p.requestedAt,
          processedAt: p.processedAt,
          reference: p.reference,
          note: p.status === "rejected" ? p.note : null,
        })),
    };
  },

  requestPayout: async ({
    db = defaultDb,
    userId,
    amount,
    bankName,
    accountNumber,
    accountName,
  }: {
    db?: DrizzleDatabase;
    userId: string;
    amount: number;
    bankName: string;
    accountNumber: string;
    accountName: string;
  }) =>
    db.transaction(async (trx) => {
      // Kunci per pengguna supaya dua klik cepat tidak membuat dua permintaan atau melampaui saldo.
      await trx.execute(sql`select pg_advisory_xact_lock(hashtext(${`affiliate-payout:${userId}`}))`);
      const { balance, payouts } = await affiliateRepo.getBalance({ db: trx, userId });
      const message = validatePayoutRequest({
        amount,
        available: balance.available,
        hasOpenRequest: payouts.some((p) => p.status === "requested"),
        bankName,
        accountNumber,
        accountName,
      });
      if (message) throw new AffiliateError("BAD_REQUEST", message);
      const [row] = await trx
        .insert(affiliatePayout)
        .values({
          userId,
          amount,
          bankName: bankName.trim(),
          accountNumber: accountNumber.trim(),
          accountName: accountName.trim(),
        })
        .returning();
      return row;
    }),

  // ---------------------------------------------------------------- admin
  adminSummary: async ({ db = defaultDb }: { db?: DrizzleDatabase } = {}) => {
    const [row] = await db
      .select({
        affiliates: sql<number>`cast(count(distinct ${affiliateCommission.affiliateUserId}) as integer)`,
        buyers: sql<number>`cast(count(*) filter (where ${affiliateCommission.status} = 'active') as integer)`,
        revenue: sql<number>`cast(coalesce(sum(${affiliateCommission.baseAmount}) filter (where ${affiliateCommission.status} = 'active'), 0) as integer)`,
        commissions: sql<number>`cast(coalesce(sum(${affiliateCommission.amount}) filter (where ${affiliateCommission.status} = 'active'), 0) as integer)`,
      })
      .from(affiliateCommission);
    const [payoutRow] = await db
      .select({
        requested: sql<number>`cast(coalesce(sum(${affiliatePayout.amount}) filter (where ${affiliatePayout.status} = 'requested'), 0) as integer)`,
        requestedCount: sql<number>`cast(count(*) filter (where ${affiliatePayout.status} = 'requested') as integer)`,
        paid: sql<number>`cast(coalesce(sum(${affiliatePayout.amount}) filter (where ${affiliatePayout.status} = 'paid'), 0) as integer)`,
      })
      .from(affiliatePayout);
    const [signups] = await db.select({ total: sql<number>`cast(count(*) as integer)` }).from(referralUsage);
    return {
      affiliates: row?.affiliates ?? 0,
      signups: signups?.total ?? 0,
      buyers: row?.buyers ?? 0,
      revenue: row?.revenue ?? 0,
      commissions: row?.commissions ?? 0,
      requested: payoutRow?.requested ?? 0,
      requestedCount: payoutRow?.requestedCount ?? 0,
      paid: payoutRow?.paid ?? 0,
    };
  },

  adminAffiliates: async ({ db = defaultDb }: { db?: DrizzleDatabase } = {}) => {
    const rows = await db
      .select({
        userId: referralCode.userId,
        name: user.name,
        email: user.email,
        code: referralCode.code,
        signups: sql<number>`cast((select count(*) from referral_usage ru where ru.referral_code_id = ${referralCode.id}) as integer)`,
        buyers: sql<number>`cast((select count(*) from affiliate_commission ac where ac.affiliate_user_id = ${referralCode.userId} and ac.status = 'active') as integer)`,
        earned: sql<number>`cast((select coalesce(sum(ac.amount), 0) from affiliate_commission ac where ac.affiliate_user_id = ${referralCode.userId} and ac.status = 'active') as integer)`,
        paid: sql<number>`cast((select coalesce(sum(ap.amount), 0) from affiliate_payout ap where ap.user_id = ${referralCode.userId} and ap.status = 'paid') as integer)`,
      })
      .from(referralCode)
      .innerJoin(user, eq(user.id, referralCode.userId))
      .where(sql`exists (select 1 from referral_usage ru where ru.referral_code_id = ${referralCode.id})`)
      .orderBy(
        desc(
          sql`(select coalesce(sum(ac.amount), 0) from affiliate_commission ac where ac.affiliate_user_id = ${referralCode.userId} and ac.status = 'active')`,
        ),
      )
      .limit(200);
    return rows;
  },

  adminPayouts: async ({
    db = defaultDb,
    status,
  }: {
    db?: DrizzleDatabase;
    status?: "requested" | "paid" | "rejected";
  }) =>
    db
      .select({
        id: affiliatePayout.id,
        amount: affiliatePayout.amount,
        status: affiliatePayout.status,
        bankName: affiliatePayout.bankName,
        accountNumber: affiliatePayout.accountNumber,
        accountName: affiliatePayout.accountName,
        reference: affiliatePayout.reference,
        note: affiliatePayout.note,
        requestedAt: affiliatePayout.requestedAt,
        processedAt: affiliatePayout.processedAt,
        userName: user.name,
        userEmail: user.email,
      })
      .from(affiliatePayout)
      .innerJoin(user, eq(user.id, affiliatePayout.userId))
      .where(status ? eq(affiliatePayout.status, status) : undefined)
      .orderBy(desc(affiliatePayout.requestedAt))
      .limit(200),

  /** requested -> paid/rejected. Hanya permintaan yang masih terbuka yang bisa diproses (aman dari klik ganda). */
  processPayout: async ({
    db = defaultDb,
    id,
    adminId,
    outcome,
    reference,
    note,
  }: {
    db?: DrizzleDatabase;
    id: string;
    adminId: string;
    outcome: "paid" | "rejected";
    reference?: string;
    note?: string;
  }) => {
    if (outcome === "paid" && !reference?.trim()) {
      throw new AffiliateError("BAD_REQUEST", "Isi nomor referensi transfer.");
    }
    if (outcome === "rejected" && !note?.trim()) {
      throw new AffiliateError("BAD_REQUEST", "Isi alasan penolakan agar afiliator tahu.");
    }
    const [row] = await db
      .update(affiliatePayout)
      .set({
        status: outcome,
        reference: reference?.trim() || null,
        note: note?.trim() || null,
        processedAt: new Date(),
        processedBy: adminId,
      })
      .where(and(eq(affiliatePayout.id, id), eq(affiliatePayout.status, "requested")))
      .returning();
    if (!row) throw new AffiliateError("CONFLICT", "Permintaan tidak ditemukan atau sudah diproses.");
    return row;
  },
};
