import { Snap } from "midtrans-client";

let snapClient: Snap | null = null;

function getSnap() {
  if (!snapClient) {
    snapClient = new Snap({
      isProduction: process.env.NODE_ENV === "production",
      serverKey: process.env.MIDTRANS_SERVER_KEY || "",
      clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
    });
  }
  return snapClient;
}

export async function createSubscriptionTransaction({
  id,
  name,
  grossAmount,
  session,
}: {
  id: string;
  name: string;
  grossAmount: number;
  session: {
    user: {
      name: string;
      email: string;
    };
  };
}) {
  const normalizedGrossAmount = Math.round(grossAmount);

  const params = {
    transaction_details: {
      order_id: id,
      gross_amount: normalizedGrossAmount,
    },
    item_details: [
      {
        price: normalizedGrossAmount,
        quantity: 1,
        name: name,
      },
    ],
    customer_details: {
      first_name: session.user.name,
      email: session.user.email,
    },
    credit_card: { secure: true },
    callbacks: {
      finish: `${process.env.CORS_ORIGIN}/premium/payment/finish`,
      error: `${process.env.CORS_ORIGIN}/premium/payment/error`,
      pending: `${process.env.CORS_ORIGIN}/premium/payment/unfinish`,
    },
  };

  const snapTransaction = await getSnap().createTransaction(params);

  return {
    token: snapTransaction.token,
    redirectUrl: snapTransaction.redirect_url,
  };
}

interface MidtransChargeResponse {
  status_code: string;
  status_message?: string;
  qr_string?: string;
  actions?: { name: string; url: string }[];
  va_numbers?: { bank: string; va_number: string }[];
  expiry_time?: string;
}

/** Midtrans expiry_time is "YYYY-MM-DD HH:mm:ss" in WIB (UTC+7). */
function parseMidtransExpiry(value?: string): string | null {
  if (!value) return null;
  const parsed = new Date(`${value.replace(" ", "T")}+07:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

/**
 * Direct Core API charge for the in-app mobile checkout (QRIS or bank
 * transfer VA), unlike the web flow which uses the hosted Snap popup.
 */
export async function createMobileCharge({
  orderId,
  grossAmount,
  method,
  bank,
  customer,
}: {
  orderId: string;
  grossAmount: number;
  method: "qris" | "bank_transfer";
  bank?: "bca" | "bni" | "bri";
  customer: { name: string; email: string };
}) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
  const auth = Buffer.from(`${serverKey}:`).toString("base64");

  const base = {
    transaction_details: { order_id: orderId, gross_amount: Math.round(grossAmount) },
    customer_details: { first_name: customer.name, email: customer.email },
  };
  const payload =
    method === "qris"
      ? { payment_type: "qris", ...base, qris: { acquirer: "gopay" }, custom_expiry: { expiry_duration: 15, unit: "minute" } }
      : { payment_type: "bank_transfer", ...base, bank_transfer: { bank } };

  const response = await fetch(
    `https://api${process.env.NODE_ENV === "production" ? "" : ".sandbox"}.midtrans.com/v2/charge`,
    {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    },
  );

  const data = (await response.json()) as MidtransChargeResponse;
  // Midtrans returns HTTP 200 with an error status_code in the body.
  if (!response.ok || Number(data.status_code) >= 300) {
    throw new Error(`Midtrans charge failed (${data.status_code}): ${data.status_message ?? "unknown error"}`);
  }

  return {
    qrString: data.qr_string ?? null,
    qrImageUrl: data.actions?.find((action) => action.name === "generate-qr-code")?.url ?? null,
    vaNumber: data.va_numbers?.[0]?.va_number ?? null,
    expiresAt: parseMidtransExpiry(data.expiry_time),
  };
}
