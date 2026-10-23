import { isAdminRole } from "@habitutor/shared/auth-domain";
import { db } from "@habitutor/db";
import { logger } from "@habitutor/shared/logger";
import { ORPCError } from "@orpc/server";
import { type } from "arktype";
import type { Context } from "../../context";
import { authed, pub } from "../../index";
import { FREEMIUM_PEMBAHASAN_PRODUCT, FREEMIUM_PRODUCT } from "../../lib/constants";
import { createSubscriptionTransaction } from "../../lib/midtrans";
import { freemiumRepo } from "../student/tryout/freemium-repo";
import { mobileTransactionRouter } from "./mobile";
import { processMidtransNotification } from "./notification";
import { getPackagePrice, isPackageAvailable, listPremiumPackages } from "./pricing";
import { transactionRepo } from "./repo";
import { syncTransactionStatus } from "./sync";

const packages = pub
  .route({
    path: "/transactions/premium-packages",
    method: "GET",
    tags: ["Payment", "Subscription"],
  })
  .output(
    type({
      slug: "'paketmandiri2027' | 'paketutbk2027' | 'paket3bulan' | 'paket1bulan'",
      name: "string",
      normalPrice: "number",
      promoPrice: "number",
      currentPrice: "number",
      isPromo: "boolean",
      promoEndsAt: "string",
      expiresAt: "string | null",
      durationMonths: "number | null",
      isAvailable: "boolean",
    }).array(),
  )
  .handler(() => listPremiumPackages());

const subscribe = authed
  .route({
    path: "/subscribe",
    method: "POST",
    tags: ["Payment", "Subscription"],
  })
  .input(
    // Only the four premium packages are sold; referral and promo codes do not apply.
    type({
      name: "'paketmandiri2027' | 'paketutbk2027' | 'paket3bulan' | 'paket1bulan'",
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
    if (!isPackageAvailable(input.name))
      throw errors.UNPROCESSABLE_CONTENT({ message: "Paket ini sudah tidak tersedia." });

    const plan = await transactionRepo.getProductBySlug({ slug: input.name });
    if (!plan) throw errors.NOT_FOUND({ message: "Produk tidak ditemukan." });

    // The amount is decided here, never by the client; Midtrans settlement is
    // later checked against this stored amount.
    const grossAmount = getPackagePrice(input.name);
    const orderId = `tx_${crypto.randomUUID()}`;

    const createdTransaction = await transactionRepo.createTransaction({
      id: orderId,
      productId: plan.id,
      grossAmount: String(grossAmount),
      userId: context.session.user.id,
    });
    if (!createdTransaction)
      throw errors.INTERNAL_SERVER_ERROR({ message: "Gagal membuat transaksi. Silahkan coba lagi." });

    let payment: Awaited<ReturnType<typeof createSubscriptionTransaction>>;
    try {
      payment = await createSubscriptionTransaction({
        id: orderId,
        session: context.session,
        name: plan.name,
        grossAmount,
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

const FREEMIUM_CHECKOUT_OUTPUT = type({
  token: "string",
  redirectUrl: "string",
  orderId: "string",
});

async function createFreemiumCheckout({
  session,
  product,
  kind,
  tryoutId,
  returnPath,
}: {
  session: NonNullable<Context["session"]>;
  product: typeof FREEMIUM_PRODUCT | typeof FREEMIUM_PEMBAHASAN_PRODUCT;
  kind: "paket" | "pembahasan";
  tryoutId?: string;
  returnPath: string;
}) {
  const userId = session.user.id;
  const plan = await transactionRepo.getProductBySlug({ slug: product.SLUG });
  if (!plan) throw new ORPCError("NOT_FOUND", { message: "Produk tidak ditemukan." });

  // Nominal ditentukan server; pembayaran Midtrans nanti dicocokkan dengan nominal yang tersimpan.
  const grossAmount = product.PRICE;
  const orderId = `tx_${crypto.randomUUID()}`;

  const createdTransaction = await db.transaction(async (trx) => {
    const created = await transactionRepo.createTransaction({
      db: trx,
      id: orderId,
      productId: plan.id,
      grossAmount: String(grossAmount),
      userId,
    });
    await freemiumRepo.createPurchase({ db: trx, userId, transactionId: orderId, kind, tryoutId });
    return created;
  });
  if (!createdTransaction)
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Gagal membuat transaksi. Silahkan coba lagi." });

  try {
    const payment = await createSubscriptionTransaction({
      id: orderId,
      session,
      name: plan.name,
      grossAmount,
      returnPath,
    });
    return { ...payment, orderId };
  } catch (error) {
    await transactionRepo.updateTransactionStatus({ orderId, status: "failed" });
    logger.error("Failed to create Midtrans freemium transaction", {
      orderId,
      userId,
      kind,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

const subscribeFreemium = authed
  .route({
    path: "/transactions/freemium",
    method: "POST",
    tags: ["Payment", "Freemium"],
  })
  .output(FREEMIUM_CHECKOUT_OUTPUT)
  .handler(async ({ context, errors }) => {
    if (context.session.user.isPremium)
      throw errors.UNPROCESSABLE_CONTENT({ message: "Kamu sudah premium, semua TO dan pembahasan sudah terbuka." });

    const summary = await freemiumRepo.getSummary({ userId: context.session.user.id });
    if (summary.unlimited) throw errors.UNPROCESSABLE_CONTENT({ message: "Akses kamu sudah mencakup semua TO." });
    if (summary.packageSlots.remaining > 0)
      throw errors.UNPROCESSABLE_CONTENT({
        message: `Kamu masih punya ${summary.packageSlots.remaining} jatah TO dari paket. Pilih TO-nya dulu ya.`,
      });

    return createFreemiumCheckout({
      session: context.session,
      product: FREEMIUM_PRODUCT,
      kind: "paket",
      returnPath: "/tryout",
    });
  });

const subscribeFreemiumPembahasan = authed
  .route({
    path: "/transactions/freemium/pembahasan",
    method: "POST",
    tags: ["Payment", "Freemium"],
  })
  .input(type({ tryoutId: "string" }))
  .output(FREEMIUM_CHECKOUT_OUTPUT)
  .handler(async ({ input, context, errors }) => {
    const userId = context.session.user.id;

    if (context.session.user.isPremium)
      throw errors.UNPROCESSABLE_CONTENT({ message: "Kamu sudah premium, semua pembahasan sudah terbuka." });
    if (!(await freemiumRepo.hasFinishedTryout({ userId, tryoutId: input.tryoutId })))
      throw errors.UNPROCESSABLE_CONTENT({
        message: "Selesaikan TO ini terlebih dahulu sebelum membuka pembahasannya.",
      });
    if (await freemiumRepo.canViewPembahasan({ userId, tryoutId: input.tryoutId }))
      throw errors.UNPROCESSABLE_CONTENT({ message: "Pembahasan TO ini sudah terbuka." });

    return createFreemiumCheckout({
      session: context.session,
      product: FREEMIUM_PEMBAHASAN_PRODUCT,
      kind: "pembahasan",
      tryoutId: input.tryoutId,
      returnPath: "/tryout",
    });
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
  subscribeFreemium,
  subscribeFreemiumPembahasan,
  webhook: notification,
  status: getStatus,
  packages,
  mobile: mobileTransactionRouter,
};
