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
import { Paket2BulanCard } from "@/routes/home-premium/-components/paket-2-bulan-card";
import { PricingExtras } from "@/routes/home-premium/-components/pricing";

type PlanSlug = "perintis2027" | "paket2bulan";

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
  const [initiatedPlan, setInitiatedPlan] = useState<PlanSlug>();

  const isPremium = session?.user.isPremium ?? false;
  const pendingPlan = transactionMutation.isPending ? transactionMutation.variables?.name : undefined;

  useMidtransScript();
  usePremiumPaymentEffect({
    paymentToken,
    paymentRedirectUrl,
    paymentOrderId,
    invalidateRouter: router.invalidate,
    onCompleted: () => navigate({ to: "/premium" }),
  });

  const handleSubscribe = (plan: PlanSlug) => {
    if (transactionMutation.isPending) return;

    setInitiatedPlan(plan);
    transactionMutation.mutate(
      // Kode promo hanya berlaku untuk Paket Perintis; Paket 2 Bulan harga tetap.
      { name: plan, promoCode: plan === "perintis2027" ? promoCode.trim() || undefined : undefined },
      {
        onSuccess: (data) => {
          setPaymentToken(data.token);
          setPaymentRedirectUrl(data.redirectUrl);
          setPaymentOrderId(data.orderId);
        },
        onError: (error) => {
          setInitiatedPlan(undefined);
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
          <div
            className={
              isPremium
                ? ""
                : "mx-auto grid w-full max-w-4xl grid-cols-1 items-stretch gap-6 md:grid-cols-2 [&>*]:min-w-0"
            }
          >
            <Perintis2027Plan
              isPremium={isPremium}
              isPending={pendingPlan === "perintis2027"}
              onSubscribe={() => handleSubscribe("perintis2027")}
              promoCode={promoCode}
              onPromoCodeChange={(value) => {
                setPromoCode(value);
                setPromoFeedback(undefined);
              }}
              onValidatePromo={handleValidatePromo}
              promoFeedback={promoFeedback}
              isPromoValidating={validatePromoMutation.isPending}
              hasInitiatedPurchase={initiatedPlan === "perintis2027"}
            />
            {!isPremium && (
              <Paket2BulanCard
                mode="checkout"
                isPending={pendingPlan === "paket2bulan"}
                onSubscribe={() => handleSubscribe("paket2bulan")}
                hasInitiatedPurchase={initiatedPlan === "paket2bulan"}
              />
            )}
          </div>
          <PricingExtras />
        </div>
      </MotionStaggerItem>
    </MotionStagger>
  );
}
