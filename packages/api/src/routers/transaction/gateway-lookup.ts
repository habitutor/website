import { parseMidtransDate } from "../../lib/midtrans";

const CLOCK_TOLERANCE_MS = 5 * 60 * 1000;
const PAYMENT_START_WINDOW_MS = 24 * 60 * 60 * 1000;

/** Midtrans answers an unknown id with HTTP 200 and `status_code: "404"` in the body. */
export function isTransactionNotFound(status: { status_code?: string }) {
  return status.status_code === "404";
}

// BI SNAP payments can only be looked up by transaction id, and that response does not carry our
// order id. The transaction id is not part of the webhook signature, so the response must also
// agree with the local order on amount and timing before it is trusted.
export function isSamePaymentByTransactionId({
  status,
  orderId,
  transactionId,
  localGrossAmount,
  orderedAt,
}: {
  status: { order_id?: string; transaction_id?: string; gross_amount?: string; transaction_time?: string };
  orderId: string;
  transactionId: string;
  localGrossAmount: string | null;
  orderedAt: Date | null;
}) {
  if (status.transaction_id !== transactionId) return false;
  if (status.order_id !== orderId && status.order_id !== transactionId) return false;
  if (localGrossAmount === null || Number(localGrossAmount) !== Number(status.gross_amount)) return false;

  const paidFrom = parseMidtransDate(status.transaction_time);
  if (!paidFrom || !orderedAt) return false;
  const delay = paidFrom.getTime() - orderedAt.getTime();
  return delay >= -CLOCK_TOLERANCE_MS && delay <= PAYMENT_START_WINDOW_MS;
}
