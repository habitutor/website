import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MotionStagger, MotionStaggerItem } from "@/components/motion/motion-components";
import { useMidtransScript } from "@/lib/midtrans";
import { createMeta } from "@/lib/seo-utils";
import { orpc } from "@/utils/orpc";
import { Perintis2027Plan } from "./-components/perintis-2027-plan";
import { PremiumHeader } from "./-components/premium-header";
import { usePremiumPaymentEffect } from "./premium-payment";

export const Route = createFileRoute("/_authenticated/premium/")({
  head: () => ({
    meta: createMeta({
      title: "Premium",
      description: "Amankan Paket Perintis 2027 untuk akses penuh ke semua fitur dan materi Habitutor.",
      noIndex: true,
    }),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { session } = Route.useRouteContext();
  const router = useRouter();
  const navigate = useNavigate();
  const transactionMutation = useMutation(orpc.transaction.subscribe.mutationOptions());
  const validatePromoMutation = useMutation(orpc.transaction.validatePromo.mutationOptions());
  const [paymentToken, setPaymentToken] = useState<string>();
  const [paymentRedirectUrl, setPaymentRedirectUrl] = useState<string>();
  const [paymentOrderId, setPaymentOrderId] = useState<string>();
  const [promoCode, setPromoCode] = useState("");
  const [promoFeedback, setPromoFeedback] = useState<
    { valid: boolean; message: string; discountedPrice?: number } | undefined
  >();
  const [hasInitiatedPurchase, setHasInitiatedPurchase] = useState(false);

  const isPremium = session?.user.isPremium ?? false;

  useMidtransScript();
  usePremiumPaymentEffect({
    paymentToken,
    paymentRedirectUrl,
    paymentOrderId,
    invalidateRouter: router.invalidate,
    onCompleted: () => navigate({ to: "/premium" }),
  });

  const handleSubscribe = () => {
    if (transactionMutation.isPending) return;

    setHasInitiatedPurchase(true);
    transactionMutation.mutate(
      { name: "perintis2027", promoCode: promoCode.trim() || undefined },
      {
        onSuccess: (data) => {
          setPaymentToken(data.token);
          setPaymentRedirectUrl(data.redirectUrl);
          setPaymentOrderId(data.orderId);
        },
        onError: (error) => {
          setHasInitiatedPurchase(false);
          toast.error(error.message);
        },
      },
    );
  };

  const handleValidatePromo = () => {
    if (!promoCode.trim()) return;
    validatePromoMutation.mutate(
      { code: promoCode, productSlug: "perintis2027" },
      {
        onSuccess: (result) => {
          setPromoFeedback(
            result.valid
              ? {
                  valid: true,
                  message: "Kode promo valid.",
                  discountedPrice: result.discountedPrice,
                }
              : { valid: false, message: result.message },
          );
        },
        onError: (error) => setPromoFeedback({ valid: false, message: error.message }),
      },
    );
  };

  return (
    <MotionStagger className="mt-4 flex flex-col gap-6 sm:-mt-3">
      <MotionStaggerItem>
        <PremiumHeader session={session} />
      </MotionStaggerItem>

      <MotionStaggerItem>
        <div className="rounded-2xl border border-neutral-300 bg-neutral-100 p-6 sm:p-10">
          <Perintis2027Plan
            isPremium={isPremium}
            isPending={transactionMutation.isPending}
            onSubscribe={handleSubscribe}
            promoCode={promoCode}
            onPromoCodeChange={(value) => {
              setPromoCode(value);
              setPromoFeedback(undefined);
            }}
            onValidatePromo={handleValidatePromo}
            promoFeedback={promoFeedback}
            isPromoValidating={validatePromoMutation.isPending}
            hasInitiatedPurchase={hasInitiatedPurchase}
          />
        </div>
      </MotionStaggerItem>
    </MotionStagger>
  );
}
