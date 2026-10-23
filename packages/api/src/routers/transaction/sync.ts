import { db } from "@habitutor/db";
import { ORPCError } from "@orpc/client";
import { PREMIUM_TIERS } from "@habitutor/shared/auth-domain";
import { logger } from "@habitutor/shared/logger";
import {
  FREEMIUM_PEMBAHASAN_PRODUCT,
  FREEMIUM_PRODUCT,
  PAKET_2_BULAN,
  PATUNGAN_BERTIGA,
  PERINTIS_2027,
  PREMIUM_DEADLINE,
  SNBT_2027_DEADLINE,
  isPremiumPackageSlug,
} from "../../lib/constants";
import { notifyUser } from "../notification/service";
import { referralRepo } from "../referral/repo";
import { freemiumRepo } from "../student/tryout/freemium-repo";
import { addMonthsUtc, resolveExpiryWithoutShortening } from "./premium-expiry";
import { getPackageExpiry } from "./pricing";
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

async function fetchMidtransTransactionStatus(orderId: string): Promise<MidtransStatusResponse | null> {
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

  // Midtrans returns 404 until the customer initiates a payment attempt.
  // Treat it as "no gateway state yet" instead of an error so reconciliation
  // can move on to other transactions.
  if (statusResponse.status === 404) {
    return null;
  }

  if (!statusResponse.ok) {
    logger.error("Midtrans API error", { status: statusResponse.status, orderId });
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Failed to verify transaction status",
    });
  }

  return (await statusResponse.json()) as MidtransStatusResponse;
}

function resolvePremiumExpiry(productSlug: string, paidAt: Date) {
  if (isPremiumPackageSlug(productSlug)) return getPackageExpiry(productSlug, paidAt);
  if (productSlug === PAKET_2_BULAN.SLUG) return addMonthsUtc(paidAt, PAKET_2_BULAN.DURATION_MONTHS);
  if (productSlug === PERINTIS_2027.SLUG) return SNBT_2027_DEADLINE;
  return PREMIUM_DEADLINE;
}

function getFreemiumPurchaseKind(productSlug: string) {
  if (productSlug === FREEMIUM_PRODUCT.SLUG) return "paket" as const;
  if (productSlug === FREEMIUM_PEMBAHASAN_PRODUCT.SLUG) return "pembahasan" as const;
  return null;
}

// paidAt is the stable settlement time stored on the transaction, so replaying
// the same webhook/status poll always yields the same expiry.
function getPremiumDetails(productSlug: string, paidAt: Date) {
  const isPremium =
    isPremiumPackageSlug(productSlug) ||
    productSlug === PERINTIS_2027.SLUG ||
    productSlug === PAKET_2_BULAN.SLUG ||
    productSlug === PREMIUM_TIERS.PREMIUM ||
    productSlug === PREMIUM_TIERS.PREMIUM_2;

  if (!isPremium) return null;

  return {
    tier: productSlug === PREMIUM_TIERS.PREMIUM_2 ? PREMIUM_TIERS.PREMIUM_2 : PREMIUM_TIERS.PREMIUM,
    expiresAt: resolvePremiumExpiry(productSlug, paidAt),
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
      existingTransaction.prodType === "subscription"
        ? getPremiumDetails(existingTransaction.prodSlug, resolvedPaidAt)
        : null;
    const alreadySuccessful = tx.status === "success";
    const premiumUnlockedUserIds: string[] = [];
    const freemiumUnlocked: { userId: string; kind: "paket" | "pembahasan" }[] = [];

    await transactionRepo.updateTransactionStatus({
      db: trx,
      orderId,
      status: "success",
      paidAt: resolvedPaidAt,
    });

    if (premiumDetails && tx.userId) {
      // A short package settling late must never cut a longer active plan.
      const currentPremium = await transactionRepo.getUserPremiumState({ db: trx, userId: tx.userId });
      await transactionRepo.updateUserPremium({
        db: trx,
        userId: tx.userId,
        isPremium: true,
        premiumTier: premiumDetails.tier,
        premiumExpiresAt: resolveExpiryWithoutShortening({
          computedExpiresAt: premiumDetails.expiresAt,
          currentIsPremium: currentPremium?.isPremium,
          currentExpiresAt: currentPremium?.premiumExpiresAt,
        }),
      });
      if (!alreadySuccessful) {
        premiumUnlockedUserIds.push(tx.userId);
        // Only on the first transition into success, so replayed webhooks
        // never re-open the invite for someone who already joined.
        await transactionRepo.resetPremiumWhatsappJoined({ db: trx, userId: tx.userId });
      }
    }

    // Paket 3 TryOut (Rp10.000) / pembahasan TO (Rp5.000): aktif otomatis begitu pembayaran settle.
    const freemiumKind = getFreemiumPurchaseKind(existingTransaction.prodSlug);
    if (freemiumKind && tx.userId) {
      await freemiumRepo.activatePurchase({ db: trx, userId: tx.userId, transactionId: orderId, kind: freemiumKind });
      if (!alreadySuccessful) freemiumUnlocked.push({ userId: tx.userId, kind: freemiumKind });
    }

    // Patungan Bertiga: premium unlocks for every member only once the whole
    // group has paid (getPremiumDetails intentionally excludes this slug).
    if (existingTransaction.prodSlug === PATUNGAN_BERTIGA.SLUG && tx.paymentGroupId) {
      const payers = await transactionRepo.countSuccessfulGroupPayers({ db: trx, groupId: tx.paymentGroupId });
      if (payers >= PATUNGAN_BERTIGA.GROUP_SIZE) {
        await transactionRepo.markPaymentGroupComplete({ db: trx, groupId: tx.paymentGroupId });
        const memberIds = await transactionRepo.getSuccessfulGroupPayerIds({ db: trx, groupId: tx.paymentGroupId });
        for (const memberId of memberIds) {
          await transactionRepo.updateUserPremium({
            db: trx,
            userId: memberId,
            isPremium: true,
            premiumTier: "premium",
            premiumExpiresAt: SNBT_2027_DEADLINE,
          });
          premiumUnlockedUserIds.push(memberId);
        }
      }
    }

    return {
      resolvedPaidAt,
      premiumUnlockedUserIds,
      freemiumUnlocked,
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

  // Inbox + push happen outside the DB transaction: delivery must never roll
  // back a successful payment.
  for (const userId of result.premiumUnlockedUserIds) {
    try {
      await notifyUser({
        userId,
        type: "premium_unlocked",
        title: "Premium aktif! 🎉",
        body: "Akun premium kamu sudah aktif. Semua kelas dan fitur kini terbuka.",
      });
    } catch (err) {
      logger.error("Failed to send premium notification", { userId, error: err });
    }
  }

  for (const { userId, kind } of result.freemiumUnlocked) {
    try {
      await notifyUser({
        userId,
        type: "system",
        title: kind === "paket" ? "Paket 3 TryOut aktif! 🎉" : "Pembahasan TO terbuka! 🎉",
        body:
          kind === "paket"
            ? "Pembayaran Rp10.000 berhasil. Pilih 3 TO yang ingin kamu kerjakan, pembahasannya sudah termasuk."
            : "Pembayaran Rp5.000 berhasil. Pembahasan TO pilihanmu sudah bisa dibuka di halaman hasil.",
      });
    } catch (err) {
      logger.error("Failed to send freemium notification", { userId, error: err });
    }
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

    // Only refunds/chargebacks may take down a settled transaction. Any other
    // failure status against a success row means gateway state is inconsistent;
    // keep the paid state instead of silently splitting status and premium.
    if (wasSuccessful && !revokeSuccessfulPayment) {
      logger.error("Refusing to downgrade a successful transaction to failed", { orderId });
      return {
        status: "success" as const,
        paidAt: existingTransaction.tx.paidAt,
      };
    }

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
      const replacementPaidAt = replacement?.paidAt ?? replacement?.orderedAt ?? new Date();
      const replacementCandidate = replacement ? getPremiumDetails(replacement.prodSlug, replacementPaidAt) : null;
      // A replacement that has already run out (e.g. a finished 2-month plan)
      // must not bring premium back.
      const replacementPremium =
        replacementCandidate && replacementCandidate.expiresAt.getTime() > Date.now() ? replacementCandidate : null;

      await transactionRepo.updateUserPremium({
        db: trx,
        userId: existingTransaction.tx.userId,
        isPremium: Boolean(replacementPremium),
        premiumTier: replacementPremium?.tier ?? null,
        premiumExpiresAt: replacementPremium?.expiresAt ?? null,
      });
    }

    if (
      revokeSuccessfulPayment &&
      wasSuccessful &&
      existingTransaction.tx.userId &&
      getFreemiumPurchaseKind(existingTransaction.prodSlug)
    ) {
      await freemiumRepo.revokePurchase({
        db: trx,
        userId: existingTransaction.tx.userId,
        transactionId: orderId,
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

  // Simulated transactions never exist at the gateway; local state is truth.
  if (tx.isSimulation) {
    return {
      status: tx.status,
      paidAt: tx.paidAt,
    };
  }

  const statusData = await fetchMidtransTransactionStatus(orderId);

  // No payment attempt recorded at Midtrans yet — keep local state untouched.
  if (!statusData) {
    return {
      status: tx.status,
      paidAt: tx.paidAt,
    };
  }

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

  // The Midtrans fetch above is not atomic with this write: a concurrent
  // webhook may have settled the transaction in the meantime. Only write
  // "pending" if the row is still pending, then report whatever won.
  const updatedTx = await transactionRepo.updateTransactionStatus({
    orderId,
    status: "pending",
    onlyIfCurrentStatus: "pending",
  });

  if (!updatedTx) {
    const currentTx = await transactionRepo.getTransactionById({ orderId });
    return {
      status: currentTx?.status ?? tx.status,
      paidAt: currentTx?.paidAt ?? tx.paidAt,
    };
  }

  return {
    status: updatedTx.status,
    paidAt: updatedTx.paidAt ?? null,
  };
}

// Sync every pending subscription the user has, not just the newest one: a
// user who paid an older attempt and then started a newer one would otherwise
// never have the paid transaction reconciled.
export async function reconcilePendingTransactions(userId: string) {
  const pendingTxs = await transactionRepo.getPendingSubscriptionsByUserId({ userId });

  for (const pendingTx of pendingTxs) {
    try {
      await syncTransactionStatus(pendingTx.id);
    } catch (error) {
      logger.error("Failed to reconcile pending transaction", { orderId: pendingTx.id, userId, error });
    }
  }
}

const STALE_PENDING_MIN_AGE_MS = 10 * 60 * 1000;
const STALE_PENDING_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// Safety net for lost webhooks: verify long-pending transactions against
// Midtrans and settle/fail them (including the premium grant) even if the
// user never returns to the site.
export async function reconcileStalePendingTransactions() {
  const now = Date.now();
  const staleTxs = await transactionRepo.getStalePendingTransactions({
    orderedBefore: new Date(now - STALE_PENDING_MIN_AGE_MS),
    orderedAfter: new Date(now - STALE_PENDING_MAX_AGE_MS),
  });

  let resolved = 0;
  let failures = 0;

  for (const staleTx of staleTxs) {
    try {
      const result = await syncTransactionStatus(staleTx.id);
      if (result && result.status !== "pending") {
        resolved += 1;
      }
    } catch (error) {
      failures += 1;
      logger.error("Failed to reconcile stale pending transaction", { orderId: staleTx.id, error });
    }
  }

  if (staleTxs.length > 0) {
    logger.info("Reconciled stale pending transactions", { checked: staleTxs.length, resolved, failures });
  }

  return { checked: staleTxs.length, resolved, failures };
}
