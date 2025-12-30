import { db } from "@habitutor/db";
import { user } from "@habitutor/db/schema/auth";
import { transaction } from "@habitutor/db/schema/transaction";
import { ORPCError } from "@orpc/client";
import { type } from "arktype";
import { eq } from "drizzle-orm";
import { Snap } from "midtrans-client";
import { authed, pub } from "..";

const PREMIUM_PRICE = 15_000;

const snap = new Snap({
	isProduction: false,
	serverKey: process.env.MIDTRANS_SERVER_KEY || "",
	clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

const premium = authed
	.route({
		path: "/transactions/premium",
		method: "POST",
		tags: ["Payment"],
	})
	.input(type("number"))
	.output(
		type({
			token: "string",
			redirectUrl: "string",
		}),
	)
	.handler(async ({ input, context }) => {
		const grossAmount = PREMIUM_PRICE;
		const orderId = String(input);
		await db
			.insert(transaction)
			.values({
				grossAmount: String(grossAmount),
				userId: context.session.user.id,
				type: "premium",
				orderId: orderId,
			})
			.returning();

		const params = {
			transaction_details: {
				order_id: String(input),
				gross_amount: grossAmount,
			},
			item_details: {
				price: PREMIUM_PRICE,
				quantity: 1,
				name: "Premium Access",
			},
			customer_details: {
				first_name: context.session.user.name,
				email: context.session.user.email,
			},
			credit_card: { secure: true },
		};

		const snapTransaction = await snap.createTransaction(params);

		return {
			token: snapTransaction.token,
			redirectUrl: snapTransaction.redirect_url,
		};
	});

const notification = pub
	.route({
		path: "/transactions/notification",
		method: "POST",
		tags: ["Payment"],
	})
	.input(type({} as Record<string, unknown>))
	.handler(async ({ input }) => {
		const statusResponse = await snap.transaction.notification(input);
		const orderId = statusResponse.order_id;
		const transactionStatus = statusResponse.transaction_status;
		const fraudStatus = statusResponse.fraud_status;

		console.log(
			`Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`,
		);

		const existingTransaction = await db.select().from(transaction).where(eq(transaction.orderId, orderId)).limit(1);

		if (existingTransaction.length === 0) {
			console.error(`Transaction not found for order ID: ${orderId}`);
			return { status: "not_found" };
		}

		const tx = existingTransaction[0]!;

		if (tx.paidAt) {
			console.log(`Transaction ${orderId} already processed`);
			return { status: "already_processed" };
		}

		if (transactionStatus === "capture") {
			if (fraudStatus === "accept") {
				await db.transaction(async (trx) => {
					await trx
						.update(transaction)
						.set({
							status: "success",
							paidAt: new Date(),
						})
						.where(eq(transaction.orderId, orderId));

					await trx.update(user).set({ isPremium: true }).where(eq(user.id, tx.userId));
				});
			}
		} else if (transactionStatus === "settlement") {
			await db.transaction(async (trx) => {
				await trx
					.update(transaction)
					.set({
						status: "success",
						paidAt: new Date(),
					})
					.where(eq(transaction.orderId, orderId));

				await trx.update(user).set({ isPremium: true }).where(eq(user.id, tx.userId));
			});
		} else if (transactionStatus === "cancel" || transactionStatus === "deny" || transactionStatus === "expire") {
			await db
				.update(transaction)
				.set({
					status: "failed",
				})
				.where(eq(transaction.orderId, orderId));
		} else if (transactionStatus === "pending") {
			await db
				.update(transaction)
				.set({
					status: "pending",
				})
				.where(eq(transaction.orderId, orderId));
		}

		return { status: "ok" };
	});

const getStatus = authed
	.route({
		path: "/transactions/status",
		method: "GET",
		tags: ["Payment"],
	})
	.input(type({ orderId: "string" }))
	.handler(async ({ input }) => {
		const tx = await db.select().from(transaction).where(eq(transaction.orderId, input.orderId)).limit(1);

		if (!tx.length) {
			throw new ORPCError("NOT_FOUND", {
				message: "Transaction not found",
			});
		}

		const row = tx[0]!;
		return {
			status: row.status,
			paidAt: row.paidAt,
		};
	});

export const transactionRouter = {
	premium,
	notification,
	getStatus,
};
