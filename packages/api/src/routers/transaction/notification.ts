import { createHash, timingSafeEqual } from "node:crypto";
import { ORPCError } from "@orpc/server";
import { logger } from "@habitutor/shared/logger";
import { syncTransactionStatus } from "./sync";

export interface MidtransNotification {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status?: string;
  fraud_status?: string;
  transaction_id?: string;
  payment_type?: string;
}

export function createMidtransSignature(
  notification: Pick<MidtransNotification, "order_id" | "status_code" | "gross_amount">,
  serverKey: string,
) {
  return createHash("sha512")
    .update(`${notification.order_id}${notification.status_code}${notification.gross_amount}${serverKey}`)
    .digest("hex");
}

export function verifyMidtransSignature(notification: MidtransNotification, serverKey: string) {
  const expected = Buffer.from(createMidtransSignature(notification, serverKey), "hex");
  const received = Buffer.from(notification.signature_key, "hex");

  return received.length === expected.length && timingSafeEqual(received, expected);
}

export async function processMidtransNotification(notification: MidtransNotification) {
  const startedAt = Date.now();
  const serverKey = process.env.MIDTRANS_SERVER_KEY;

  if (!serverKey) {
    logger.error("Midtrans webhook is not configured", { orderId: notification.order_id });
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Payment webhook is not configured" });
  }

  if (!verifyMidtransSignature(notification, serverKey)) {
    logger.warn("Rejected Midtrans webhook with invalid signature", {
      orderId: notification.order_id,
      transactionId: notification.transaction_id,
    });
    throw new ORPCError("UNAUTHORIZED", { message: "Invalid Midtrans signature" });
  }

  logger.info("Processing Midtrans webhook", {
    orderId: notification.order_id,
    transactionId: notification.transaction_id,
    transactionStatus: notification.transaction_status,
    fraudStatus: notification.fraud_status,
    paymentType: notification.payment_type,
  });

  try {
    // Midtrans' status endpoint is the source of truth. This also prevents a
    // correctly signed, stale notification from regressing a newer status.
    const result = await syncTransactionStatus(notification.order_id, {
      expectedGrossAmount: notification.gross_amount,
    });

    if (!result) {
      logger.error("Midtrans webhook references an unknown order", {
        orderId: notification.order_id,
        transactionId: notification.transaction_id,
      });
      throw new ORPCError("NOT_FOUND", { message: "Transaction not found" });
    }

    logger.info("Processed Midtrans webhook", {
      orderId: notification.order_id,
      status: result.status,
      durationMs: Date.now() - startedAt,
    });

    return result;
  } catch (error) {
    logger.error("Failed to process Midtrans webhook", {
      orderId: notification.order_id,
      transactionId: notification.transaction_id,
      durationMs: Date.now() - startedAt,
      error,
    });
    throw error;
  }
}
