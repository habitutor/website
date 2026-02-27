import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { user } from "@habitutor/db/schema/auth";
import { product, transaction } from "@habitutor/db/schema/transaction";
import { eq } from "drizzle-orm";

export const transactionRepo = {
	getProductBySlug: async ({ db = defaultDb, slug }: { db?: DrizzleDatabase; slug: string }) => {
		const [prod] = await db.select().from(product).where(eq(product.slug, slug)).limit(1);
		return prod;
	},

	createTransaction: async ({
		db = defaultDb,
		id,
		productId,
		grossAmount,
		userId,
		referralCodeId,
	}: {
		db?: DrizzleDatabase;
		id: string;
		productId: string;
		grossAmount: string;
		userId: string;
		referralCodeId?: string;
	}) => {
		const [tx] = await db
			.insert(transaction)
			.values({
				id,
				productId,
				grossAmount,
				userId,
				referralCodeId,
			})
			.returning();
		return tx;
	},

	getTransactionWithProduct: async ({ db = defaultDb, orderId }: { db?: DrizzleDatabase; orderId: string }) => {
		const [result] = await db
			.select({
				tx: transaction,
				prodType: product.type,
				prodSlug: product.slug,
			})
			.from(transaction)
			.innerJoin(product, eq(transaction.productId, product.id))
			.where(eq(transaction.id, orderId))
			.limit(1);
		return result;
	},

	updateTransactionStatus: async ({
		db = defaultDb,
		orderId,
		status,
		paidAt,
	}: {
		db?: DrizzleDatabase;
		orderId: string;
		status: "success" | "failed" | "pending";
		paidAt?: Date;
	}) => {
		const [tx] = await db
			.update(transaction)
			.set({
				status,
				paidAt,
			})
			.where(eq(transaction.id, orderId))
			.returning();
		return tx;
	},

	updateUserPremium: async ({
		db = defaultDb,
		userId,
		isPremium,
		premiumExpiresAt,
	}: {
		db?: DrizzleDatabase;
		userId: string;
		isPremium: boolean;
		premiumExpiresAt: Date | null;
	}) => {
		const [u] = await db.update(user).set({ isPremium, premiumExpiresAt }).where(eq(user.id, userId)).returning();
		return u;
	},

	getTransactionById: async ({ db = defaultDb, orderId }: { db?: DrizzleDatabase; orderId: string }) => {
		const txs = await db.select().from(transaction).where(eq(transaction.id, orderId)).limit(1);
		return txs[0];
	},
};
