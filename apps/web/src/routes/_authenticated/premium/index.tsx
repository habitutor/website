import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useMidtransScript } from "@/lib/midtrans";
import { createMeta } from "@/lib/seo-utils";
import { orpc } from "@/utils/orpc";
import { PremiumPlansSections } from "./-components/premium-plans-sections";
import { type BundlingVariant, usePremiumPaymentEffect } from "./premium-payment";

export const Route = createFileRoute("/_authenticated/premium/")({
  head: () => ({
    meta: createMeta({
      title: "Premium",
      description: "Upgrade ke premium untuk akses penuh ke semua fitur dan materi Habitutor.",
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
  const [paymentToken, setPaymentToken] = useState<string>();
  const [paymentRedirectUrl, setPaymentRedirectUrl] = useState<string>();
  const [paymentOrderId, setPaymentOrderId] = useState<string>();
  const [activeVariant, setActiveVariant] = useState<BundlingVariant | null>(null);

  const sessionUser = session?.user as { isPremium?: boolean; premiumTier?: BundlingVariant | null } | undefined;
  const isPremium = sessionUser?.isPremium ?? false;
  const currentTier = isPremium ? (sessionUser?.premiumTier ?? "premium") : null;

  useMidtransScript();
  usePremiumPaymentEffect({
    paymentToken,
    paymentRedirectUrl,
    paymentOrderId,
    invalidateRouter: router.invalidate,
    onCompleted: () => navigate({ to: "/premium" }),
  });

  const handleSubscribe = (variant: BundlingVariant) => {
    if (transactionMutation.isPending) return;

    setActiveVariant(variant);
    transactionMutation.mutate(
      { name: variant },
      {
        onSuccess: (data) => {
          const transactionData = data as typeof data & { orderId?: string };
          setPaymentToken(transactionData.token);
          setPaymentRedirectUrl(transactionData.redirectUrl);
          setPaymentOrderId(transactionData.orderId);
          setActiveVariant(null);
        },
        onError: (error) => {
          toast.error(error.message);
          setActiveVariant(null);
        },
      },
    );
  };

  return (
    <PremiumPlansSections
      session={session}
      isPremium={isPremium}
      currentTier={currentTier}
      isTransactionPending={transactionMutation.isPending}
      activeVariant={activeVariant}
      onSubscribe={handleSubscribe}
    />
  );
}
