import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MotionStagger, MotionStaggerItem } from "@/components/motion/motion-components";
import { useMidtransScript } from "@/lib/midtrans";
import type { PremiumPackageSlug } from "@/lib/premium-packages";
import { createMeta } from "@/lib/seo-utils";
import { PremiumFeatureList, PremiumPackageGrid, PricingExtras } from "@/routes/home-premium/-components/pricing";
import { orpc } from "@/utils/orpc";
import { PremiumHeader } from "./-components/premium-header";
import { usePremiumPaymentEffect } from "./premium-payment";

export const Route = createFileRoute("/_authenticated/premium/")({
  head: () => ({
    meta: createMeta({
      title: "Premium",
      description: "Pilih paket Premium Habitutor untuk akses penuh ke semua fitur dan materi.",
      noIndex: true,
    }),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { session } = Route.useRouteContext();
  const router = useRouter();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const transactionMutation = useMutation(orpc.transaction.subscribe.mutationOptions());
  const [paymentToken, setPaymentToken] = useState<string>();
  const [paymentRedirectUrl, setPaymentRedirectUrl] = useState<string>();
  const [paymentOrderId, setPaymentOrderId] = useState<string>();
  const [initiatedPlan, setInitiatedPlan] = useState<PremiumPackageSlug>();

  const isPremium = session?.user.isPremium ?? false;
  const pendingPlan = transactionMutation.isPending ? transactionMutation.variables?.name : undefined;

  // premiumTier sama untuk semua paket, jadi paket yang dibeli dibaca dari profil.
  const { data: profile, isPending: isProfilePending } = useQuery(orpc.profile.me.queryOptions());
  const isPlanLoading = isPremium && isProfilePending;

  useMidtransScript();
  usePremiumPaymentEffect({
    paymentToken,
    paymentRedirectUrl,
    paymentOrderId,
    invalidateRouter: router.invalidate,
    onCompleted: () => {
      // Paket yang dibeli berubah, jadi profil (premiumPlan) harus dimuat ulang.
      void queryClient.invalidateQueries({ queryKey: orpc.profile.me.queryKey() });
      navigate({ to: "/premium" });
    },
    onClosed: () => {
      setPaymentToken(undefined);
      setPaymentRedirectUrl(undefined);
      setPaymentOrderId(undefined);
      setInitiatedPlan(undefined);
    },
  });

  const handleSubscribe = (plan: PremiumPackageSlug) => {
    if (transactionMutation.isPending) return;

    setInitiatedPlan(plan);
    transactionMutation.mutate(
      { name: plan },
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

  return (
    <MotionStagger className="flex flex-col gap-5 sm:gap-6">
      <MotionStaggerItem>
        <PremiumHeader session={session} subscribedPlan={isPlanLoading ? undefined : profile?.premiumPlan} />
      </MotionStaggerItem>

      <MotionStaggerItem>
        <div className="rounded-sr-xl border border-sr-line bg-white/80 p-4 shadow-sr-1 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-4xl">
            {isPremium ? (
              <PremiumFeatureList />
            ) : (
              <PremiumPackageGrid
                mode="checkout"
                pendingSlug={pendingPlan}
                initiatedSlug={initiatedPlan}
                isDisabled={transactionMutation.isPending}
                onSubscribe={handleSubscribe}
              />
            )}
          </div>
          <PricingExtras />
        </div>
      </MotionStaggerItem>
    </MotionStagger>
  );
}
