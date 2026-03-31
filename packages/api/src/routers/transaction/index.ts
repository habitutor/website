import { db } from "@habitutor/db";
import { ORPCError } from "@orpc/client";
import { type } from "arktype";
import { authed, pub } from "../../index";
import { PREMIUM_DEADLINE } from "../../lib/constants";
import { createSubscriptionTransaction } from "../../lib/midtrans";
import { referralRepo } from "../referral/repo";
import { transactionRepo } from "./repo";

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
			name: "'premium' | 'basic'",
			"referralCode?": "string",
		}),
	)
	.output(
		type({
			token: "string",
			redirectUrl: "string",
		}),
	)
	.handler(async ({ input, context, errors }) => {
		if (input.name === "premium" && context.session.user.isPremium)
			throw errors.UNPROCESSABLE_CONTENT({ message: "Kamu sudah menjadi member premium." });
		if (input.name === "premium" && Date.now() > PREMIUM_DEADLINE.getTime())
			throw errors.UNPROCESSABLE_CONTENT({ message: "Produk premium tidak tersedia lagi." });

    const plan = await transactionRepo.getProductBySlug({ slug: input.name });
    if (!plan) throw errors.NOT_FOUND({ message: "Produk tidak ditemukan." });

		let grossAmount = plan.price;
		let validatedReferralCodeId: string | undefined;

		if (input.referralCode) {
			const code = input.referralCode.trim();

			if (code.length !== 11) {
				throw errors.UNPROCESSABLE_CONTENT({ message: "Kode referral harus 11 karakter." });
			}

			const codeRecord = await referralRepo.getCodeByCode({ code });
			if (!codeRecord) {
				throw errors.NOT_FOUND({ message: "Kode referral tidak ditemukan." });
			}

			if (codeRecord.userId === context.session.user.id) {
				throw errors.UNPROCESSABLE_CONTENT({
					message: "Kamu tidak bisa menggunakan kode referral milikmu sendiri.",
				});
			}

			const existingUsage = await referralRepo.getUserUsage({ userId: context.session.user.id });
			if (existingUsage) {
				throw errors.UNPROCESSABLE_CONTENT({ message: "Kamu sudah pernah menggunakan kode referral." });
			}

			validatedReferralCodeId = codeRecord.id;
			const discounted = Math.ceil(Number(grossAmount) * 0.75);
			grossAmount = String(discounted);
		}

    const orderId = `tx_${crypto.randomUUID()}`;

		const createdTransaction = await transactionRepo.createTransaction({
			id: orderId,
			productId: plan.id,
			grossAmount: String(grossAmount),
			userId: context.session.user.id,
			referralCodeId: validatedReferralCodeId,
		});
		if (!createdTransaction)
			throw errors.INTERNAL_SERVER_ERROR({ message: "Gagal membuat transaksi. Silahkan coba lagi." });

		return await createSubscriptionTransaction({
			id: orderId,
			session: context.session,
			name: plan.name,
			price: grossAmount,
		});
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

		const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
		const auth = Buffer.from(`${serverKey}:`).toString("base64");

		const statusResponse = await fetch(
			`https://api${process.env.NODE_ENV === "production" ? "" : ".sandbox"}.midtrans.com/v2/${order_id}/status`,
			{
				headers: {
					Authorization: `Basic ${auth}`,
					"Content-Type": "application/json",
				},
			},
		);

		if (!statusResponse.ok) {
			console.error(`Midtrans API error: ${statusResponse.status}`);
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

		const existingTransaction = await transactionRepo.getTransactionWithProduct({ orderId: order_id });

		if (!existingTransaction) {
			console.error(`Transaction not found for order ID: ${order_id}`);
			return { status: "not_found" };
		}

		const tx = existingTransaction.tx;
		const isPremiumSubscription =
			existingTransaction.prodType === "subscription" && existingTransaction.prodSlug === "premium";

		if (tx.paidAt) {
			console.log(`Transaction ${order_id} already processed`);
			return { status: "already_processed" };
		}

		if (transactionStatus === "capture" || transactionStatus === "settlement") {
			const isValid = transactionStatus === "capture" ? fraudStatus === "accept" : true;

			if (isValid) {
				await db.transaction(async (trx) => {
					await transactionRepo.updateTransactionStatus({
						db: trx,
						orderId: order_id,
						status: "success",
						paidAt: new Date(),
					});

					if (isPremiumSubscription && tx.userId) {
						await transactionRepo.updateUserPremium({
							db: trx,
							userId: tx.userId,
							isPremium: true,
							premiumExpiresAt: PREMIUM_DEADLINE,
						});
					}

					if (tx.referralCodeId && tx.userId) {
						const alreadyRecorded = await referralRepo.getUsageByTransactionId({
							db: trx,
							transactionId: order_id,
						});
						if (!alreadyRecorded) {
							const originalProduct = await transactionRepo.getProductBySlug({
								db: trx,
								slug: existingTransaction.prodSlug,
							});
							const cashback = originalProduct ? String(Math.floor(Number(originalProduct.price) * 0.25)) : "0";

							try {
								await referralRepo.createUsage({
									db: trx,
									userId: tx.userId,
									referralCodeId: tx.referralCodeId,
									transactionId: order_id,
									cashbackAmount: cashback,
								});
								await referralRepo.incrementReferralCount({
									db: trx,
									referralCodeId: tx.referralCodeId,
								});
							} catch (err) {
								// Unique constraint violation means referral was already recorded
								const isUniqueViolation =
									err instanceof Error && "code" in err && (err as { code: string }).code === "23505";
								if (!isUniqueViolation) throw err;
							}
						}
					}
				});
			}
		} else if (transactionStatus === "cancel" || transactionStatus === "deny" || transactionStatus === "expire") {
			await transactionRepo.updateTransactionStatus({
				orderId: order_id,
				status: "failed",
			});
		} else if (transactionStatus === "pending") {
			await transactionRepo.updateTransactionStatus({
				orderId: order_id,
				status: "pending",
			});
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
