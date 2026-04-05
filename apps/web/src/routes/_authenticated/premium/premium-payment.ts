import { useEffect } from "react";
import { toast } from "sonner";
import { refreshAuthSession } from "@/lib/auth-session";
import { client } from "@/utils/orpc";

export type BundlingVariant = "premium" | "premium2";

const PREMIUM_ACTIVATION_MAX_RETRIES = 5;
const PREMIUM_ACTIVATION_RETRY_DELAY_MS = 1000;

function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForPremiumActivation(orderId: string) {
  for (let attempt = 0; attempt < PREMIUM_ACTIVATION_MAX_RETRIES; attempt += 1) {
    try {
      const syncResult = await client.transaction.status({ orderId });

      if (syncResult?.status === "success") {
        return true;
      }

      if (syncResult?.status === "failed") {
        return false;
      }
    } catch (error) {
      console.error("Failed to sync transaction status", error);
    }

    await sleep(PREMIUM_ACTIVATION_RETRY_DELAY_MS);
  }

  return false;
}

type PremiumPaymentEffectOptions = {
  paymentToken?: string;
  paymentRedirectUrl?: string;
  paymentOrderId?: string;
  invalidateRouter: () => Promise<void>;
  onCompleted: () => void;
};

export function usePremiumPaymentEffect({
  paymentToken,
  paymentRedirectUrl,
  paymentOrderId,
  invalidateRouter,
  onCompleted,
}: PremiumPaymentEffectOptions) {
  useEffect(() => {
    if (!paymentToken) return;

    const completePremiumUpgrade = async () => {
      await refreshAuthSession({
        invalidateRouter,
      });
      onCompleted();
    };

    if (window.snap) {
      window.snap.pay(paymentToken, {
        onSuccess: async () => {
          if (paymentOrderId) {
            await waitForPremiumActivation(paymentOrderId);
          }

          await completePremiumUpgrade();
        },
        onPending: () => {
          toast.info("Menunggu pembayaran...");
        },
        onError: () => {
          toast.error("Pembayaran gagal. Silakan coba lagi.");
        },
        onClose: () => {
          toast.warning("Pembayaran dibatalkan.");
        },
      });
      return;
    }

    if (paymentRedirectUrl) {
      window.location.href = paymentRedirectUrl;
    }
  }, [invalidateRouter, onCompleted, paymentOrderId, paymentRedirectUrl, paymentToken]);
}
