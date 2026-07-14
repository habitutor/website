import { describe, expect, test } from "bun:test";
import { createMidtransSignature, type MidtransNotification, verifyMidtransSignature } from "./notification";

const serverKey = "Mid-server-test-key";
const notification: MidtransNotification = {
  order_id: "tx_123",
  status_code: "200",
  gross_amount: "149000.00",
  signature_key: "",
  transaction_status: "settlement",
};

describe("Midtrans notification signatures", () => {
  test("matches Midtrans' SHA-512 signature specification", () => {
    expect(createMidtransSignature(notification, serverKey)).toBe(
      "c54ca795bf9f6bc5f2d55a47c79a0b337a307d17950530fe1e1ee2c506f39ee1b5ed66bb69b4bed3c6f812bd85ef51b0d7675966e3558838f1a619807cc4a978",
    );
  });

  test("accepts the expected signature", () => {
    const signed = {
      ...notification,
      signature_key: createMidtransSignature(notification, serverKey),
    };

    expect(verifyMidtransSignature(signed, serverKey)).toBe(true);
  });

  test("rejects a changed amount and malformed signatures", () => {
    const signatureKey = createMidtransSignature(notification, serverKey);

    expect(
      verifyMidtransSignature({ ...notification, gross_amount: "1.00", signature_key: signatureKey }, serverKey),
    ).toBe(false);
    expect(verifyMidtransSignature({ ...notification, signature_key: "not-a-hash" }, serverKey)).toBe(false);
  });
});
