import { logger } from "@habitutor/shared/logger";
import { type } from "arktype";
import { authed, pub } from "../../index";
import { PATUNGAN_BERTIGA, PERINTIS_2027, SNBT_2027_DEADLINE } from "../../lib/constants";
import { createMobileCharge } from "../../lib/midtrans";
import { getPerintisPricing } from "./pricing";
import { transactionRepo } from "./repo";
import { markTransactionAsSuccess } from "./sync";

const QRIS_EXPIRY_MINUTES = 15;
const VA_EXPIRY_HOURS = 24;

/**
 * In-app checkout without a payment gateway account: charges are stored as
 * simulation transactions and settled through the simulatePay endpoint.
 * Never active in production.
 */
function isSimulationMode() {
  return process.env.NODE_ENV !== "production" && process.env.ENABLE_MOBILE_PAYMENT_SIMULATION === "true";
}

function generateInviteCode() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
}

const plans = pub
  .route({
    path: "/mobile/plans",
    method: "GET",
    tags: ["Payment", "Mobile"],
  })
  .handler(async () => {
    const pricing = await getPerintisPricing();

    return {
      solo: {
        slug: PERINTIS_2027.SLUG,
        name: PERINTIS_2027.NAME,
        price: pricing.currentPrice,
        originalPrice: PERINTIS_2027.ORIGINAL_PRICE,
        isAvailable: Date.now() <= SNBT_2027_DEADLINE.getTime(),
      },
      group: {
        slug: PATUNGAN_BERTIGA.SLUG,
        name: PATUNGAN_BERTIGA.NAME,
        pricePerPerson: PATUNGAN_BERTIGA.PRICE_PER_PERSON,
        originalPrice: PATUNGAN_BERTIGA.ORIGINAL_PRICE,
        groupSize: PATUNGAN_BERTIGA.GROUP_SIZE,
        windowHours: PATUNGAN_BERTIGA.WINDOW_HOURS,
      },
    };
  });

const charge = authed
  .route({
    path: "/mobile/charge",
    method: "POST",
    tags: ["Payment", "Mobile"],
  })
  .input(
    type({
      plan: "'perintis2027' | 'patungan-bertiga'",
      method: "'qris' | 'bank_transfer'",
      "bank?": "'bca' | 'bni' | 'bri'",
      "groupInviteCode?": "string",
    }),
  )
  .handler(async ({ input, context, errors }) => {
    if (context.session.user.isPremium)
      throw errors.UNPROCESSABLE_CONTENT({ message: "Kamu sudah menjadi member premium." });
    if (Date.now() > SNBT_2027_DEADLINE.getTime())
      throw errors.UNPROCESSABLE_CONTENT({ message: "Produk premium tidak tersedia lagi." });
    if (input.method === "bank_transfer" && !input.bank)
      throw errors.UNPROCESSABLE_CONTENT({ message: "Pilih bank tujuan transfer terlebih dahulu." });

    const product = await transactionRepo.getProductBySlug({ slug: input.plan });
    if (!product) throw errors.NOT_FOUND({ message: "Produk tidak ditemukan." });

    let amount: number;
    let paymentGroupId: string | undefined;
    let groupInviteCode: string | undefined;

    if (input.plan === PATUNGAN_BERTIGA.SLUG) {
      amount = PATUNGAN_BERTIGA.PRICE_PER_PERSON;

      if (input.groupInviteCode) {
        const group = await transactionRepo.getPaymentGroupByInviteCode({
          inviteCode: input.groupInviteCode.trim().toUpperCase(),
        });
        if (!group) throw errors.NOT_FOUND({ message: "Kode grup tidak ditemukan." });
        if (group.status !== "pending" || group.expiresAt.getTime() < Date.now())
          throw errors.UNPROCESSABLE_CONTENT({ message: "Grup ini sudah tidak menerima anggota baru." });
        paymentGroupId = group.id;
        groupInviteCode = group.inviteCode;
      } else {
        const group = await transactionRepo.createPaymentGroup({
          inviteCode: generateInviteCode(),
          creatorUserId: context.session.user.id,
          expiresAt: new Date(Date.now() + PATUNGAN_BERTIGA.WINDOW_HOURS * 60 * 60 * 1000),
        });
        if (!group) throw errors.INTERNAL_SERVER_ERROR({ message: "Gagal membuat grup. Silahkan coba lagi." });
        paymentGroupId = group.id;
        groupInviteCode = group.inviteCode;
      }
    } else {
      const pricing = await getPerintisPricing();
      amount = pricing.currentPrice;
    }

    const orderId = `tx_${crypto.randomUUID()}`;
    const simulated = isSimulationMode();

    const createdTransaction = await transactionRepo.createTransaction({
      id: orderId,
      productId: product.id,
      grossAmount: String(amount),
      userId: context.session.user.id,
      isSimulation: simulated,
      paymentGroupId,
    });
    if (!createdTransaction)
      throw errors.INTERNAL_SERVER_ERROR({ message: "Gagal membuat transaksi. Silahkan coba lagi." });

    if (simulated) {
      const expiryMs =
        input.method === "qris" ? QRIS_EXPIRY_MINUTES * 60 * 1000 : VA_EXPIRY_HOURS * 60 * 60 * 1000;
      await transactionRepo.updateGatewayMetadata({
        orderId,
        gatewayStatus: "simulated_pending",
        paymentType: input.method,
      });

      return {
        orderId,
        amount,
        method: input.method,
        bank: input.bank ?? null,
        qrString: input.method === "qris" ? `HABITUTOR-SIM|${orderId}|${amount}` : null,
        qrImageUrl: null,
        vaNumber: input.method === "bank_transfer" ? "1234 5678 9010" : null,
        expiresAt: new Date(Date.now() + expiryMs).toISOString(),
        groupInviteCode: groupInviteCode ?? null,
        simulated: true,
      };
    }

    let payment: Awaited<ReturnType<typeof createMobileCharge>>;
    try {
      payment = await createMobileCharge({
        orderId,
        grossAmount: amount,
        method: input.method,
        bank: input.bank,
        customer: { name: context.session.user.name, email: context.session.user.email },
      });
    } catch (error) {
      await transactionRepo.updateTransactionStatus({ orderId, status: "failed" });
      logger.error("Failed to create Midtrans mobile charge", {
        orderId,
        userId: context.session.user.id,
        error,
      });
      throw error;
    }

    return {
      orderId,
      amount,
      method: input.method,
      bank: input.bank ?? null,
      qrString: payment.qrString,
      qrImageUrl: payment.qrImageUrl,
      vaNumber: payment.vaNumber,
      expiresAt: payment.expiresAt,
      groupInviteCode: groupInviteCode ?? null,
      simulated: false,
    };
  });

const simulatePay = authed
  .route({
    path: "/mobile/simulate-pay",
    method: "POST",
    tags: ["Payment", "Mobile"],
  })
  .input(type({ orderId: "string" }))
  .handler(async ({ input, context, errors }) => {
    if (!isSimulationMode()) {
      throw errors.FORBIDDEN({ message: "Payment simulation is disabled in this environment." });
    }

    const tx = await transactionRepo.getTransactionById({ orderId: input.orderId });
    if (!tx || tx.userId !== context.session.user.id)
      throw errors.NOT_FOUND({ message: "Transaction not found" });
    if (!tx.isSimulation) throw errors.FORBIDDEN({ message: "Only simulated transactions can be settled here." });
    if (tx.status !== "pending") return { status: tx.status };

    await transactionRepo.updateGatewayMetadata({
      orderId: input.orderId,
      gatewayTransactionId: input.orderId,
      gatewayStatus: "simulated_settlement",
      paymentType: tx.paymentType ?? "simulation",
      statusCode: "200",
    });
    const result = await markTransactionAsSuccess(input.orderId);
    return { status: result?.status ?? "pending" };
  });

export const mobileTransactionRouter = {
  plans,
  charge,
  simulatePay,
};
