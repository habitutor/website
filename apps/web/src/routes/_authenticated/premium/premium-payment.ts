import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { refreshAuthSession } from "@/lib/auth-session";
import { client } from "@/utils/orpc";

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
  onClosed?: () => void; // baru: reset state token di parent
};

export function usePremiumPaymentEffect({
  paymentToken,
  paymentRedirectUrl,
  paymentOrderId,
  invalidateRouter,
  onCompleted,
  onClosed,
}: PremiumPaymentEffectOptions) {
  const latest = useRef({ invalidateRouter, onCompleted, onClosed, paymentOrderId });
  latest.current = { invalidateRouter, onCompleted, onClosed, paymentOrderId };

  const openedTokenRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!paymentToken) return;
    if (openedTokenRef.current === paymentToken) return; // cegah double-call
    openedTokenRef.current = paymentToken;

    const reset = () => {
      openedTokenRef.current = undefined;
      latest.current.onClosed?.();
    };

    if (window.snap) {
      try {
        window.snap.hide?.(); // pastikan state Snap bersih
      } catch {}

      window.snap.pay(paymentToken, {
        onSuccess: async () => {
          const orderId = latest.current.paymentOrderId;
          if (orderId) await waitForPremiumActivation(orderId);
          await refreshAuthSession({ invalidateRouter: latest.current.invalidateRouter });
          latest.current.onCompleted();
          reset();
        },
        onPending: () => {
          toast.info("Menunggu pembayaran...");
          reset();
        },
        onError: () => {
          toast.error("Pembayaran gagal. Silakan coba lagi.");
          reset();
        },
        onClose: () => {
          toast.warning("Pembayaran dibatalkan.");
          reset();
        },
      });
      return;
    }

    if (paymentRedirectUrl) {
      window.location.href = paymentRedirectUrl;
    }
  }, [paymentToken, paymentRedirectUrl]);
}
