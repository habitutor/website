import type { auth } from "@habitutor/auth";
import { Snap } from "midtrans-client";

function getMidtransKeys() {
  return {
    serverKey: (process.env.MIDTRANS_SERVER_KEY || "").trim(),
    clientKey: (process.env.MIDTRANS_CLIENT_KEY || "").trim(),
  };
}

function isPlaceholderMidtransKey(value: string) {
  return value.length === 0 || value.includes("YOURKEYHERE");
}

export function validateMidtransConfig() {
  const { serverKey, clientKey } = getMidtransKeys();

  if (
    isPlaceholderMidtransKey(serverKey) ||
    isPlaceholderMidtransKey(clientKey)
  ) {
    throw new Error(
      "Midtrans configuration is missing or still using placeholder values. Update MIDTRANS_SERVER_KEY and MIDTRANS_CLIENT_KEY.",
    );
  }

  return { serverKey, clientKey };
}

function resolveMidtransProductionMode() {
  const explicitMode = process.env.MIDTRANS_IS_PRODUCTION;

  if (explicitMode === "true") return true;
  if (explicitMode === "false") return false;

  const { serverKey } = getMidtransKeys();
  return serverKey.length > 0 && !serverKey.startsWith("SB-");
}

export function getMidtransBaseUrl() {
  return `https://api${resolveMidtransProductionMode() ? "" : ".sandbox"}.midtrans.com`;
}

function createSnapClient() {
  const { serverKey, clientKey } = validateMidtransConfig();

  return new Snap({
    isProduction: resolveMidtransProductionMode(),
    serverKey,
    clientKey,
  });
}

export async function createSubscriptionTransaction({
  id,
  name,
  price,
  session,
}: {
  id: string;
  name: string;
  price: string;
  session: typeof auth.$Infer.Session;
}) {
  const params = {
    transaction_details: {
      order_id: id,
      gross_amount: price,
    },
    item_details: [
      {
        price: price,
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

  const snap = createSnapClient();
  const snapTransaction = await snap.createTransaction(params);

  return {
    token: snapTransaction.token,
    redirectUrl: snapTransaction.redirect_url,
  };
}
