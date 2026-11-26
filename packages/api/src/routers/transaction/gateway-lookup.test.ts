import { describe, expect, test } from "bun:test";
import { isSamePaymentByTransactionId, isTransactionNotFound } from "./gateway-lookup";

// Shape taken from a real BI SNAP (BSI virtual account) status response: order_id echoes the transaction id.
const status = {
  status_code: "200",
  transaction_id: "A120261026100227abc",
  order_id: "A120261026100227abc",
  gross_amount: "10000.00",
  transaction_status: "settlement",
  transaction_time: "2026-10-26 17:02:27",
};

const input = {
  status,
  orderId: "tx_a77e",
  transactionId: "A120261026100227abc",
  localGrossAmount: "10000",
  orderedAt: new Date("2026-10-26T10:02:08Z"),
};

describe("isTransactionNotFound", () => {
  test("reads Midtrans' 404 body, which arrives on a successful HTTP response", () => {
    expect(isTransactionNotFound({ status_code: "404" })).toBe(true);
    expect(isTransactionNotFound(status)).toBe(false);
  });
});

describe("isSamePaymentByTransactionId", () => {
  test("accepts a BI SNAP response for this order", () => {
    expect(isSamePaymentByTransactionId(input)).toBe(true);
  });

  test("accepts a response that names our order id", () => {
    expect(isSamePaymentByTransactionId({ ...input, status: { ...status, order_id: "tx_a77e" } })).toBe(true);
  });

  test("rejects a response naming another order", () => {
    expect(isSamePaymentByTransactionId({ ...input, status: { ...status, order_id: "tx_other" } })).toBe(false);
  });

  test("rejects a different transaction id", () => {
    expect(isSamePaymentByTransactionId({ ...input, status: { ...status, transaction_id: "A1other" } })).toBe(false);
  });

  test("rejects a different amount", () => {
    expect(isSamePaymentByTransactionId({ ...input, localGrossAmount: "280000" })).toBe(false);
    expect(isSamePaymentByTransactionId({ ...input, localGrossAmount: null })).toBe(false);
  });

  test("rejects a payment made before the order existed or more than a day after it", () => {
    expect(isSamePaymentByTransactionId({ ...input, orderedAt: new Date("2026-10-26T11:00:00Z") })).toBe(false);
    expect(isSamePaymentByTransactionId({ ...input, orderedAt: new Date("2026-10-24T10:00:00Z") })).toBe(false);
    expect(isSamePaymentByTransactionId({ ...input, orderedAt: null })).toBe(false);
  });
});
