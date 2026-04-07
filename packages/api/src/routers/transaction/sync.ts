import { db } from "@habitutor/db";
import { ORPCError } from "@orpc/client";
import { PREMIUM_TIERS } from "@habitutor/shared/auth-domain";
import { logger } from "@habitutor/shared/logger";
import { PREMIUM_DEADLINE } from "../../lib/constants";
import { referralRepo } from "../referral/repo";
import { transactionRepo } from "./repo";

type MidtransStatusResponse = {
  transaction_status: string;
  fraud_status: string;
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

export async function markTransactionAsSuccess(orderId: string) {
  const existingTransaction = await transactionRepo.getTransactionWithProduct({ orderId });

  if (!existingTransaction) {
    return null;
  }

  const tx = existingTransaction.tx;
  const paidAt = tx.paidAt ?? new Date();
  const isPremiumSubscription =
    existingTransaction.prodType === "subscription" &&
    (existingTransaction.prodSlug === PREMIUM_TIERS.PREMIUM ||
      existingTransaction.prodSlug === PREMIUM_TIERS.PREMIUM_2);

  await db.transaction(async (trx) => {
    await transactionRepo.updateTransactionStatus({
      db: trx,
      orderId,
      status: "success",
      paidAt,
    });

    if (isPremiumSubscription && tx.userId) {
      const premiumTier =
        existingTransaction.prodSlug === PREMIUM_TIERS.PREMIUM_2 ? PREMIUM_TIERS.PREMIUM_2 : PREMIUM_TIERS.PREMIUM;

      await transactionRepo.updateUserPremium({
        db: trx,
        userId: tx.userId,
        isPremium: true,
        premiumTier,
        premiumExpiresAt: PREMIUM_DEADLINE,
      });
    }

    if (tx.referralCodeId && tx.userId) {
      const alreadyRecorded = await referralRepo.getUsageByTransactionId({
        db: trx,
        transactionId: orderId,
      });

      if (!alreadyRecorded) {
        const originalProduct = await transactionRepo.getProductBySlug({
          db: trx,
          slug: existingTransaction.prodSlug,
        });
        const cashback = originalProduct ? String(Math.floor(Number(originalProduct.price) * 0.25)) : "0";

        try {
          const linkedUsage = await referralRepo.attachPendingUsageToTransaction({
            db: trx,
            userId: tx.userId,
            referralCodeId: tx.referralCodeId,
            transactionId: orderId,
            cashbackAmount: cashback,
          });

          if (!linkedUsage) {
            await referralRepo.createUsage({
              db: trx,
              userId: tx.userId,
              referralCodeId: tx.referralCodeId,
              transactionId: orderId,
              cashbackAmount: cashback,
            });
            await referralRepo.incrementReferralCount({
              db: trx,
              referralCodeId: tx.referralCodeId,
            });
          }
        } catch (err) {
          const isUniqueViolation = err instanceof Error && "code" in err && (err as { code: string }).code === "23505";
          if (!isUniqueViolation) throw err;
        }
      }
    }
  });

  const updatedTx = await transactionRepo.getTransactionById({ orderId });

  return {
    status: "success" as const,
    paidAt: updatedTx?.paidAt ?? paidAt,
  };
}

export async function syncTransactionStatus(orderId: string) {
  const tx = await transactionRepo.getTransactionById({ orderId });

  if (!tx) {
    return null;
  }

  if (tx.status === "success" && tx.paidAt) {
    return {
      status: tx.status,
      paidAt: tx.paidAt,
    };
  }

  const statusData = await fetchMidtransTransactionStatus(orderId);
  const transactionStatus = statusData.transaction_status;
  const fraudStatus = statusData.fraud_status;

  if (transactionStatus === "capture" || transactionStatus === "settlement") {
    const isValid = transactionStatus === "capture" ? fraudStatus === "accept" : true;
    if (isValid) {
      return await markTransactionAsSuccess(orderId);
    }
  }

  if (transactionStatus === "cancel" || transactionStatus === "deny" || transactionStatus === "expire") {
    const updatedTx = await transactionRepo.updateTransactionStatus({
      orderId,
      status: "failed",
    });

    return {
      status: updatedTx?.status ?? "failed",
      paidAt: updatedTx?.paidAt ?? null,
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