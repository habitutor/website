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
  callbackPaths,
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
  callbackPaths?: {
    finish: string;
    error: string;
    pending: string;
  };
}) {
  const normalizedGrossAmount = Math.round(grossAmount);
  const callbacks = callbackPaths ?? {
    finish: "/premium/payment/finish",
    error: "/premium/payment/error",
    pending: "/premium/payment/unfinish",
  };

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
      finish: `${process.env.CORS_ORIGIN}${callbacks.finish}`,
      error: `${process.env.CORS_ORIGIN}${callbacks.error}`,
      pending: `${process.env.CORS_ORIGIN}${callbacks.pending}`,
    },
  };

  const snapTransaction = await getSnap().createTransaction(params);

  return {
    token: snapTransaction.token,
    redirectUrl: snapTransaction.redirect_url,
  };
}
