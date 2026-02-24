import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { referralCode, referralUsage } from "@habitutor/db/schema/referral";
import { transaction } from "@habitutor/db/schema/transaction";
import { eq, sql } from "drizzle-orm";

const REFERRAL_CODE_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*-_";
const REFERRAL_CODE_LENGTH = 11;

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
		transactionId: string;
		cashbackAmount: string;
	}) => {
		const [result] = await db
			.insert(referralUsage)
			.values({ userId, referralCodeId, transactionId, cashbackAmount })
			.returning();
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
};
