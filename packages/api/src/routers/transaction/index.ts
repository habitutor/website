import { isAdminRole } from "@habitutor/shared/auth-domain";
import { db } from "@habitutor/db";
import { logger } from "@habitutor/shared/logger";
import { type } from "arktype";
import { authed, pub } from "../../index";
import { PERINTIS_2027, SNBT_2027_DEADLINE } from "../../lib/constants";
import { createSubscriptionTransaction } from "../../lib/midtrans";
import { referralRepo } from "../referral/repo";
import { processMidtransNotification } from "./notification";
import { calculatePromoPrice, promoRepo, type PromoValidationReason } from "./promo-repo";
import { transactionRepo } from "./repo";
import { syncTransactionStatus } from "./sync";

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

const PROMO_ERROR_MESSAGES: Record<PromoValidationReason, string> = {
  not_found: "Kode promo tidak ditemukan.",
  inactive: "Kode promo sedang tidak aktif.",
  expired: "Kode promo sudah kedaluwarsa.",
  usage_limit_reached: "Kuota penggunaan kode promo sudah habis.",
  already_used: "Kamu sudah menggunakan kode promo ini.",
  wrong_package: "Kode promo tidak berlaku untuk paket ini.",
};

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
      "promoCode?": "string",
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
    const existingUsage = input.promoCode ? null : await referralRepo.getUserUsage({ userId: context.session.user.id });
    let appliedReferralCodeId: string | undefined;

    if (input.promoCode && input.referralCode) {
      throw errors.UNPROCESSABLE_CONTENT({ message: "Kode promo dan kode referral tidak dapat digabungkan." });
    }

    if (!input.promoCode && input.referralCode) {
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
    } else if (!input.promoCode && existingUsage && !existingUsage.transactionId) {
      // Referral submitted during registration should be applied automatically
      // to the first paid transaction.
      appliedReferralCodeId = existingUsage.referralCodeId;
    }

    if (appliedReferralCodeId) {
      const discounted = Math.ceil(Number(grossAmount) * 0.75);
      grossAmount = String(discounted);
    }

    const orderId = `tx_${crypto.randomUUID()}`;

    const createdTransaction = await db.transaction(async (trx) => {
      let promoCodeId: string | undefined;

      if (input.promoCode) {
        const validation = await promoRepo.validate({
          db: trx,
          code: input.promoCode,
          productId: plan.id,
          userId: context.session.user.id,
          lock: true,
        });
        if (!validation.ok) {
          throw errors.UNPROCESSABLE_CONTENT({ message: PROMO_ERROR_MESSAGES[validation.reason] });
        }

        grossAmount = String(
          calculatePromoPrice(Number(grossAmount), validation.promo.discountType, validation.promo.discountValue),
        );
        promoCodeId = validation.promo.id;
      }

      return transactionRepo.createTransaction({
        db: trx,
        id: orderId,
        productId: plan.id,
        grossAmount: String(grossAmount),
        userId: context.session.user.id,
        referralCodeId: appliedReferralCodeId,
        promoCodeId,
      });
    });
    if (!createdTransaction)
      throw errors.INTERNAL_SERVER_ERROR({ message: "Gagal membuat transaksi. Silahkan coba lagi." });

    let payment: Awaited<ReturnType<typeof createSubscriptionTransaction>>;
    try {
      payment = await createSubscriptionTransaction({
        id: orderId,
        session: context.session,
        name: plan.name,
        grossAmount: Number(grossAmount),
      });
    } catch (error) {
      await transactionRepo.updateTransactionStatus({ orderId, status: "failed" });
      logger.error("Failed to create Midtrans transaction", {
        orderId,
        userId: context.session.user.id,
        error,
      });
      throw error;
    }

    return {
      ...payment,
      orderId,
    };
  });

const validatePromo = authed
  .route({
    path: "/transactions/promo/validate",
    method: "POST",
    tags: ["Payment", "Promo"],
  })
  .input(type({ code: "string", productSlug: "'perintis2027'" }))
  .handler(async ({ input, context, errors }) => {
    const product = await transactionRepo.getProductBySlug({ slug: input.productSlug });
    if (!product) throw errors.NOT_FOUND({ message: "Produk tidak ditemukan." });

    const validation = await promoRepo.validate({
      code: input.code,
      productId: product.id,
      userId: context.session.user.id,
    });
    if (!validation.ok) {
      return { valid: false as const, reason: validation.reason, message: PROMO_ERROR_MESSAGES[validation.reason] };
    }

    const pricing = await getPerintisPricing();
    return {
      valid: true as const,
      discountedPrice: calculatePromoPrice(
        pricing.currentPrice,
        validation.promo.discountType,
        validation.promo.discountValue,
      ),
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
      status_code: "string",
      gross_amount: "string",
      signature_key: "string",
      "transaction_status?": "string",
      "fraud_status?": "string",
      "transaction_id?": "string",
      "payment_type?": "string",
    }),
  )
  .handler(async ({ input }) => {
    const result = await processMidtransNotification(input);
    return { status: "ok", transactionStatus: result.status };
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
  validatePromo,
  perintisAvailability: availability,
};
