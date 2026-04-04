import type { auth } from "@habitutor/auth";
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
  session: auth["$Infer"]["Session"];
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
