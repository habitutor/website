import { isAdminRole } from "@habitutor/shared/auth-domain";
import { logger } from "@habitutor/shared/logger";
import { type } from "arktype";
import { authed, pub } from "../../index";
import { PERINTIS_2027, SNBT_2027_DEADLINE } from "../../lib/constants";
import { createSubscriptionTransaction } from "../../lib/midtrans";
import { referralRepo } from "../referral/repo";
import { transactionRepo } from "./repo";
import { markTransactionAsSuccess, syncTransactionStatus } from "./sync";

async function getPerintisPricing() {
  const soldCount = await transactionRepo.countSuccessfulTransactionsBySlug({ slug: PERINTIS_2027.SLUG });
  const earlyBirdRemaining = Math.max(PERINTIS_2027.EARLY_BIRD_QUOTA - soldCount, 0);
  const isEarlyBird = earlyBirdRemaining > 0;

  return {
    soldCount,
    earlyBirdRemaining,
    isEarlyBird,
    currentPrice: isEarlyBird ? PERINTIS_2027.EARLY_BIRD_PRICE : PERINTIS_2027.REGULAR_PRICE,
  };
}

const availability = pub
  .route({
    path: "/transactions/perintis-2027",
    method: "GET",
    tags: ["Payment", "Subscription"],
  })
  .output(
    type({
      slug: "string",
      originalPrice: "number",
      earlyBirdPrice: "number",
      regularPrice: "number",
      currentPrice: "number",
      earlyBirdQuota: "number",
      earlyBirdRemaining: "number",
      isEarlyBird: "boolean",
      isAvailable: "boolean",
    }),
  )
  .handler(async () => {
    const pricing = await getPerintisPricing();

    return {
      slug: PERINTIS_2027.SLUG,
      originalPrice: PERINTIS_2027.ORIGINAL_PRICE,
      earlyBirdPrice: PERINTIS_2027.EARLY_BIRD_PRICE,
      regularPrice: PERINTIS_2027.REGULAR_PRICE,
      currentPrice: pricing.currentPrice,
      earlyBirdQuota: PERINTIS_2027.EARLY_BIRD_QUOTA,
      earlyBirdRemaining: pricing.earlyBirdRemaining,
      isEarlyBird: pricing.isEarlyBird,
      isAvailable: Date.now() <= SNBT_2027_DEADLINE.getTime(),
    };
  });

const subscribe = authed
  .route({
    path: "/subscribe",
    method: "POST",
    tags: ["Payment", "Subscription"],
  })
  .input(
    // Older packages (premium, premium2, basic) are no longer sold; the only
    // purchasable package is Perintis 2027.
    type({
      name: "'perintis2027'",
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
    if (context.session.user.isPremium)
      throw errors.UNPROCESSABLE_CONTENT({ message: "Kamu sudah menjadi member premium." });
    if (Date.now() > SNBT_2027_DEADLINE.getTime())
      throw errors.UNPROCESSABLE_CONTENT({ message: "Produk premium tidak tersedia lagi." });

    const plan = await transactionRepo.getProductBySlug({ slug: input.name });
    if (!plan) throw errors.NOT_FOUND({ message: "Produk tidak ditemukan." });

    // Early-bird price for the first 50 successful payments, then the regular price.
    const pricing = await getPerintisPricing();
    let grossAmount = String(pricing.currentPrice);
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

    if (!isAdminRole(context.session.user.role ?? "user") && tx.userId !== context.session.user.id) {
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
  perintisAvailability: availability,
};
