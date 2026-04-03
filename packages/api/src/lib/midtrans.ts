import type { auth } from "@habitutor/auth";
import { Snap } from "midtrans-client";

export const snap = new Snap({
  isProduction: process.env.NODE_ENV === "production",
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

export async function createSubscriptionTransaction({
  id,
  name,
  grossAmount,
  session,
}: {
  id: string;
  name: string;
  grossAmount: number;
  session: typeof auth.$Infer.Session;
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

  const snapTransaction = await snap.createTransaction(params);

  return {
    token: snapTransaction.token,
    redirectUrl: snapTransaction.redirect_url,
  };
}
