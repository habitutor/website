import { db } from "@habitutor/db";
import { ORPCError } from "@orpc/client";
import { type } from "arktype";
import { authed, pub } from "#index";
import { PREMIUM_DEADLINE } from "#lib/constants";
import { createSubscriptionTransaction } from "#lib/midtrans";
import { transactionRepo } from "#routers/transaction/repo";

function getMidtransStatusBaseUrls() {
	const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
	const defaultBaseUrl = `https://api${process.env.NODE_ENV === "production" ? "" : ".sandbox"}.midtrans.com`;
	const keyBasedBaseUrl = serverKey.startsWith("SB-") ? "https://api.sandbox.midtrans.com" : "https://api.midtrans.com";

	return Array.from(new Set([defaultBaseUrl, keyBasedBaseUrl]));
}

async function syncTransactionFromMidtrans({ orderId }: { orderId: string }) {
	const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
	const auth = Buffer.from(`${serverKey}:`).toString("base64");

	let statusResponse: Response | null = null;

	for (const baseUrl of getMidtransStatusBaseUrls()) {
		const response = await fetch(`${baseUrl}/v2/${orderId}/status`, {
			headers: {
				Authorization: `Basic ${auth}`,
				"Content-Type": "application/json",
			},
		});

		statusResponse = response;

		if (response.ok) {
			break;
		}

		if (response.status !== 401 && response.status !== 404) {
			break;
		}
	}

	if (!statusResponse || !statusResponse.ok) {
		const errorBody = statusResponse ? await statusResponse.text().catch(() => "") : "";
		console.error("Midtrans API error", {
			orderId,
			status: statusResponse?.status ?? "unknown",
			body: errorBody,
		});
		throw new ORPCError("INTERNAL_SERVER_ERROR", {
			message: "Failed to verify transaction status",
		});
	}

	const statusData = (await statusResponse.json()) as {
		transaction_status: string;
		fraud_status: string;
	};
	const transactionStatus = statusData.transaction_status;
	const fraudStatus = statusData.fraud_status;

	const existingTransaction = await transactionRepo.getTransactionWithProduct({
		orderId,
	});

	if (!existingTransaction) {
		console.error(`Transaction not found for order ID: ${orderId}`);
		return { status: "not_found" as const, paidAt: null };
	}

	const tx = existingTransaction.tx;
	const premiumTier =
		existingTransaction.prodType === "subscription" &&
		(existingTransaction.prodSlug === "premium" || existingTransaction.prodSlug === "premium2")
			? existingTransaction.prodSlug
			: null;

	if (tx.paidAt) {
		return { status: tx.status, paidAt: tx.paidAt ?? null };
	}

	if (transactionStatus === "capture" || transactionStatus === "settlement") {
		const isValid = transactionStatus === "capture" ? fraudStatus === "accept" : true;

		if (isValid) {
			const paidAt = new Date();

			await db.transaction(async (trx) => {
				await transactionRepo.updateTransactionStatus({
					db: trx,
					orderId,
					status: "success",
					paidAt,
				});

				if (premiumTier && tx.userId) {
					await transactionRepo.updateUserPremium({
						db: trx,
						userId: tx.userId,
						isPremium: true,
						premiumTier,
						premiumExpiresAt: PREMIUM_DEADLINE,
					});
				}
			});

			return { status: "success" as const, paidAt };
		}
	}

	if (transactionStatus === "cancel" || transactionStatus === "deny" || transactionStatus === "expire") {
		const updated = await transactionRepo.updateTransactionStatus({
			orderId,
			status: "failed",
		});

		return {
			status: updated?.status ?? "failed",
			paidAt: updated?.paidAt ?? null,
		};
	}

	if (transactionStatus === "pending") {
		const updated = await transactionRepo.updateTransactionStatus({
			orderId,
			status: "pending",
		});

		return {
			status: updated?.status ?? "pending",
			paidAt: updated?.paidAt ?? null,
		};
	}

	return { status: tx.status, paidAt: tx.paidAt ?? null };
}

const subscribe = authed
	.route({
		path: "/subscribe",
		method: "POST",
		tags: ["Payment", "Subscription"],
	})
	.input(
		type({
			name: "'premium' | 'premium2' | 'basic'",
		}),
	)
	.output(
		type({
			token: "string",
			redirectUrl: "string",
			orderId: "string",
		}),
	)
	.handler(async ({ input, context, errors }) => {
		if ((input.name === "premium" || input.name === "premium2") && context.session.user.isPremium)
			throw errors.UNPROCESSABLE_CONTENT({
				message: "Kamu sudah menjadi member premium.",
			});
		if ((input.name === "premium" || input.name === "premium2") && Date.now() > PREMIUM_DEADLINE.getTime())
			throw errors.UNPROCESSABLE_CONTENT({
				message: "Produk premium tidak tersedia lagi.",
			});

		const plan = await transactionRepo.getProductBySlug({ slug: input.name });
		if (!plan) throw errors.NOT_FOUND({ message: "Produk tidak ditemukan." });

		const grossAmount = plan.price;

		const orderId = `tx_${crypto.randomUUID()}`;

		const createdTransaction = await transactionRepo.createTransaction({
			id: orderId,
			productId: plan.id,
			grossAmount: String(grossAmount),
			userId: context.session.user.id,
		});
		if (!createdTransaction)
			throw errors.INTERNAL_SERVER_ERROR({
				message: "Gagal membuat transaksi. Silahkan coba lagi.",
			});

		const snapTransaction = await createSubscriptionTransaction({
			id: orderId,
			session: context.session,
			name: plan.name,
			price: plan.price,
		});

		return {
			...snapTransaction,
			orderId,
		};
	});

const notification = pub
	.route({
		path: "/transactions/notification",
		method: "POST",
		tags: ["Payment", "Webhook"],
	})
	.input(type({} as Record<string, unknown>))
	.handler(async ({ input }) => {
		const { order_id } = input as {
			order_id: string;
		};

		await syncTransactionFromMidtrans({ orderId: order_id });

		return { status: "ok" };
	});

const syncStatus = authed
	.route({
		path: "/transactions/sync-status",
		method: "POST",
		tags: ["Payment"],
	})
	.input(type({ orderId: "string" }))
	.output(
		type({
			status: "'pending' | 'success' | 'failed' | 'not_found'",
			"paidAt?": "Date | null",
		}),
	)
	.handler(async ({ input, context }) => {
		const tx = await transactionRepo.getTransactionById({
			orderId: input.orderId,
		});

		if (!tx) {
			throw new ORPCError("NOT_FOUND", {
				message: "Transaction not found",
			});
		}

		if (tx.userId !== context.session.user.id) {
			throw new ORPCError("FORBIDDEN", {
				message: "You are not allowed to sync this transaction",
			});
		}

		return await syncTransactionFromMidtrans({ orderId: input.orderId });
	});

const getStatus = authed
	.route({
		path: "/transactions/status",
		method: "GET",
		tags: ["Payment"],
	})
	.input(type({ orderId: "string" }))
	.handler(async ({ input }) => {
		const tx = await transactionRepo.getTransactionById({
			orderId: input.orderId,
		});

		if (!tx) {
			throw new ORPCError("NOT_FOUND", {
				message: "Transaction not found",
			});
		}

		return {
			status: tx.status,
			paidAt: tx.paidAt,
		};
	});

export const transactionRouter = {
	subscribe,
	notification,
	syncStatus,
	getStatus,
};
