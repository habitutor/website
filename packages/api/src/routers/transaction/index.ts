import { PREMIUM_TIERS, isAdminRole } from "@habitutor/shared/auth-domain";
import { logger } from "@habitutor/shared/logger";
import { type } from "arktype";
import { authed, pub } from "../../index";
import { PREMIUM_DEADLINE } from "../../lib/constants";
import { createSubscriptionTransaction } from "../../lib/midtrans";
import { referralRepo } from "../referral/repo";
import { transactionRepo } from "./repo";
import { markTransactionAsSuccess, syncTransactionStatus } from "./sync";

const subscribe = authed
  .route({
    path: "/subscribe",
    method: "POST",
    tags: ["Payment", "Subscription"],
  })
  .input(
    //add premium2 tier on input validation
    type({
      name: "'premium' | 'premium2' | 'basic'",
      "referralCode?": "string",
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
    const isPremiumPlanName = input.name === PREMIUM_TIERS.PREMIUM || input.name === PREMIUM_TIERS.PREMIUM_2;

    if (isPremiumPlanName && context.session.user.isPremium)
      throw errors.UNPROCESSABLE_CONTENT({ message: "Kamu sudah menjadi member premium." });
    if (isPremiumPlanName && Date.now() > PREMIUM_DEADLINE.getTime())
      throw errors.UNPROCESSABLE_CONTENT({ message: "Produk premium tidak tersedia lagi." });

    const plan = await transactionRepo.getProductBySlug({ slug: input.name });
    if (!plan) throw errors.NOT_FOUND({ message: "Produk tidak ditemukan." });

    let grossAmount = plan.price;
    const existingUsage = await referralRepo.getUserUsage({ userId: context.session.user.id });
    let appliedReferralCodeId: string | undefined;

    if (input.referralCode) {
      const code = input.referralCode.trim();
      const validation = await referralRepo.validateCodeForUser({
        userId: context.session.user.id,
        code,
        allowPendingSameCode: true,
      });

      if (!validation.ok) {
        if (validation.reason === "invalid_length") {
          throw errors.UNPROCESSABLE_CONTENT({ message: "Kode referral harus 11 karakter." });
        }
        if (validation.reason === "not_found") {
          throw errors.NOT_FOUND({ message: "Kode referral tidak ditemukan." });
        }
        if (validation.reason === "own_code") {
          throw errors.UNPROCESSABLE_CONTENT({
            message: "Kamu tidak bisa menggunakan kode referral milikmu sendiri.",
          });
        }
        throw errors.UNPROCESSABLE_CONTENT({ message: "Kamu sudah pernah menggunakan kode referral." });
      }

      appliedReferralCodeId = validation.codeRecord.id;
    } else if (existingUsage && !existingUsage.transactionId) {
      // Referral submitted during registration should be applied automatically
      // to the first paid transaction.
      appliedReferralCodeId = existingUsage.referralCodeId;
    }

    if (appliedReferralCodeId) {
      const discounted = Math.ceil(Number(grossAmount) * 0.75);
      grossAmount = String(discounted);
    }

    const orderId = `tx_${crypto.randomUUID()}`;

    const createdTransaction = await transactionRepo.createTransaction({
      id: orderId,
      productId: plan.id,
      grossAmount: String(grossAmount),
      userId: context.session.user.id,
      referralCodeId: appliedReferralCodeId,
    });
    if (!createdTransaction)
      throw errors.INTERNAL_SERVER_ERROR({ message: "Gagal membuat transaksi. Silahkan coba lagi." });

    const payment = await createSubscriptionTransaction({
      id: orderId,
      session: context.session,
      name: plan.name,
      grossAmount: Number(grossAmount),
    });

    return {
      ...payment,
      orderId,
    };
  });

const notification = pub
  .route({
    path: "/transactions/notification",
    method: "POST",
    tags: ["Payment", "Webhook"],
  })
  .input(
    type({
      order_id: "string",
      "transaction_status?": "string",
      "fraud_status?": "string",
    }),
  )
  .handler(async ({ input }) => {
    const orderId = input.order_id;

    if (
      input.transaction_status &&
      (input.transaction_status === "settlement" ||
        (input.transaction_status === "capture" && input.fraud_status === "accept"))
    ) {
      await markTransactionAsSuccess(orderId);
      return { status: "ok" };
    }

    const syncResult = await syncTransactionStatus(orderId);

    if (!syncResult) {
      logger.error("Transaction not found", { orderId });
      return { status: "not_found" };
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
  .handler(async ({ input, context, errors }) => {
    const tx = await transactionRepo.getTransactionById({
      orderId: input.orderId,
    });

    if (!tx) {
      throw errors.NOT_FOUND({ message: "Transaction not found" });
    }

    if (!isAdminRole(context.session.user.role) && tx.userId !== context.session.user.id) {
      throw errors.FORBIDDEN({
        message: "Kamu tidak memiliki akses ke transaksi ini.",
      });
    }

    const syncResult = await syncTransactionStatus(input.orderId);
    if (!syncResult) {
      throw errors.NOT_FOUND({ message: "Transaction not found" });
    }

    return {
      status: syncResult.status,
      paidAt: syncResult.paidAt,
    };
  });

export const transactionRouter = {
  subscribe,
  webhook: notification,
  status: getStatus,
};
