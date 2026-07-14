import { db } from "@habitutor/db";
import { ORPCError } from "@orpc/client";
import { PREMIUM_TIERS } from "@habitutor/shared/auth-domain";
import { logger } from "@habitutor/shared/logger";
import { PERINTIS_2027, PREMIUM_DEADLINE, SNBT_2027_DEADLINE } from "../../lib/constants";
import { referralRepo } from "../referral/repo";
import { transactionRepo } from "./repo";

type MidtransStatusResponse = {
  transaction_status: string;
  fraud_status?: string;
  gross_amount: string;
  settlement_time?: string;
  transaction_time?: string;
  transaction_id?: string;
  payment_type?: string;
  status_code?: string;
};

async function fetchMidtransTransactionStatus(orderId: string): Promise<MidtransStatusResponse> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
  const auth = Buffer.from(`${serverKey}:`).toString("base64");

  const statusResponse = await fetch(
    `https://api${process.env.NODE_ENV === "production" ? "" : ".sandbox"}.midtrans.com/v2/${orderId}/status`,
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!statusResponse.ok) {
    logger.error("Midtrans API error", { status: statusResponse.status, orderId });
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Failed to verify transaction status",
    });
  }

  return (await statusResponse.json()) as MidtransStatusResponse;
}

function getPremiumDetails(productSlug: string) {
  const isPerintis2027 = productSlug === PERINTIS_2027.SLUG;
  const isPremium = isPerintis2027 || productSlug === PREMIUM_TIERS.PREMIUM || productSlug === PREMIUM_TIERS.PREMIUM_2;

  if (!isPremium) return null;

  return {
    tier: productSlug === PREMIUM_TIERS.PREMIUM_2 ? PREMIUM_TIERS.PREMIUM_2 : PREMIUM_TIERS.PREMIUM,
    expiresAt: isPerintis2027 ? SNBT_2027_DEADLINE : PREMIUM_DEADLINE,
  };
}

// Referral cashback runs in its own transaction after the grant commits, so a
// referral failure can never roll back a legitimately paid premium upgrade.
async function processReferralReward(input: {
  orderId: string;
  userId: string;
  referralCodeId: string;
  productSlug: string;
}) {
  try {
    await db.transaction(async (trx) => {
      const alreadyRecorded = await referralRepo.getUsageByTransactionId({
        db: trx,
        transactionId: input.orderId,
      });
      if (alreadyRecorded) return;

      const originalProduct = await transactionRepo.getProductBySlug({ db: trx, slug: input.productSlug });
      const cashback = originalProduct ? String(Math.floor(Number(originalProduct.price) * 0.25)) : "0";

      const linkedUsage = await referralRepo.attachPendingUsageToTransaction({
        db: trx,
        userId: input.userId,
        referralCodeId: input.referralCodeId,
        transactionId: input.orderId,
        cashbackAmount: cashback,
      });

      if (!linkedUsage) {
        await referralRepo.createUsage({
          db: trx,
          userId: input.userId,
          referralCodeId: input.referralCodeId,
          transactionId: input.orderId,
          cashbackAmount: cashback,
        });
        await referralRepo.incrementReferralCount({
          db: trx,
          referralCodeId: input.referralCodeId,
        });
      }
    });
  } catch (err) {
    const isUniqueViolation = err instanceof Error && "code" in err && (err as { code: string }).code === "23505";
    if (!isUniqueViolation) {
      logger.error("Failed to process referral reward after successful payment", {
        orderId: input.orderId,
        referralCodeId: input.referralCodeId,
        error: err,
      });
    }
  }
}

export async function markTransactionAsSuccess(orderId: string, paidAtFromGateway?: Date) {
  const result = await db.transaction(async (trx) => {
    const existingTransaction = await transactionRepo.getTransactionWithProduct({ db: trx, orderId, lock: true });

    if (!existingTransaction) return null;

    const tx = existingTransaction.tx;
    const resolvedPaidAt = tx.paidAt ?? paidAtFromGateway ?? new Date();
    const premiumDetails =
      existingTransaction.prodType === "subscription" ? getPremiumDetails(existingTransaction.prodSlug) : null;
    const alreadySuccessful = tx.status === "success";

    await transactionRepo.updateTransactionStatus({
      db: trx,
      orderId,
      status: "success",
      paidAt: resolvedPaidAt,
    });

    if (premiumDetails && tx.userId) {
      await transactionRepo.updateUserPremium({
        db: trx,
        userId: tx.userId,
        isPremium: true,
        premiumTier: premiumDetails.tier,
        premiumExpiresAt: premiumDetails.expiresAt,
      });
    }

    return {
      resolvedPaidAt,
      // Only process referral once, on the transition into success.
      referral:
        !alreadySuccessful && tx.referralCodeId && tx.userId
          ? { userId: tx.userId, referralCodeId: tx.referralCodeId, productSlug: existingTransaction.prodSlug }
          : null,
    };
  });

  if (!result) return null;

  if (result.referral) {
    await processReferralReward({ orderId, ...result.referral });
  }

  return {
    status: "success" as const,
    paidAt: result.resolvedPaidAt,
  };
}

async function markTransactionAsFailed(orderId: string, revokeSuccessfulPayment: boolean) {
  return db.transaction(async (trx) => {
    const existingTransaction = await transactionRepo.getTransactionWithProduct({ db: trx, orderId, lock: true });
    if (!existingTransaction) return null;

    const wasSuccessful = existingTransaction.tx.status === "success";
    const updatedTx = await transactionRepo.updateTransactionStatus({
      db: trx,
      orderId,
      status: "failed",
    });

    if (
      revokeSuccessfulPayment &&
      wasSuccessful &&
      existingTransaction.tx.userId &&
      existingTransaction.prodType === "subscription"
    ) {
      const replacement = await transactionRepo.getLatestSuccessfulSubscriptionByUserId({
        db: trx,
        userId: existingTransaction.tx.userId,
        excludeOrderId: orderId,
      });
      const replacementPremium = replacement ? getPremiumDetails(replacement.prodSlug) : null;

      await transactionRepo.updateUserPremium({
        db: trx,
        userId: existingTransaction.tx.userId,
        isPremium: Boolean(replacementPremium),
        premiumTier: replacementPremium?.tier ?? null,
        premiumExpiresAt: replacementPremium?.expiresAt ?? null,
      });
    }

    return {
      status: updatedTx?.status ?? ("failed" as const),
      paidAt: updatedTx?.paidAt ?? null,
    };
  });
}

function parseMidtransDate(value?: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function amountsMatch(first: string | null, second: string) {
  return first !== null && Number(first) === Number(second);
}

export async function syncTransactionStatus(orderId: string, options?: { expectedGrossAmount?: string }) {
  const tx = await transactionRepo.getTransactionById({ orderId });

  if (!tx) {
    return null;
  }

  const statusData = await fetchMidtransTransactionStatus(orderId);
  const transactionStatus = statusData.transaction_status;
  const fraudStatus = statusData.fraud_status;

  if (
    !amountsMatch(tx.grossAmount, statusData.gross_amount) ||
    (options?.expectedGrossAmount && !amountsMatch(tx.grossAmount, options.expectedGrossAmount))
  ) {
    logger.error("Midtrans transaction amount mismatch", {
      orderId,
      localGrossAmount: tx.grossAmount,
      midtransGrossAmount: statusData.gross_amount,
      notificationGrossAmount: options?.expectedGrossAmount,
    });
    throw new ORPCError("BAD_REQUEST", { message: "Transaction amount mismatch" });
  }

  await transactionRepo.updateGatewayMetadata({
    orderId,
    gatewayTransactionId: statusData.transaction_id,
    gatewayStatus: transactionStatus,
    paymentType: statusData.payment_type,
    fraudStatus,
    statusCode: statusData.status_code,
  });

  if (transactionStatus === "capture" || transactionStatus === "settlement") {
    const isValid = transactionStatus === "capture" ? fraudStatus === "accept" : true;
    if (isValid) {
      return await markTransactionAsSuccess(
        orderId,
        parseMidtransDate(statusData.settlement_time ?? statusData.transaction_time),
      );
    }
  }

  if (["refund", "partial_refund", "chargeback"].includes(transactionStatus)) {
    return markTransactionAsFailed(orderId, true);
  }

  if (["cancel", "deny", "expire", "failure"].includes(transactionStatus)) {
    return markTransactionAsFailed(orderId, false);
  }

  // Never downgrade an already-settled transaction on an unexpected/pending status.
  if (tx.status === "success") {
    return {
      status: "success" as const,
      paidAt: tx.paidAt,
    };
  }

  const updatedTx = await transactionRepo.updateTransactionStatus({
    orderId,
    status: "pending",
  });

  return {
    status: updatedTx?.status ?? "pending",
    paidAt: updatedTx?.paidAt ?? null,
  };
}

export async function reconcileLatestPendingTransaction(userId: string) {
  const pendingTx = await transactionRepo.getLatestPendingSubscriptionByUserId({ userId });

  if (!pendingTx) {
    return null;
  }

  return syncTransactionStatus(pendingTx.id);
}
