import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ReferralPromoCard } from "@/components/affiliate/referral-promo-card";
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
  const [referralInput, setReferralInput] = useState("");
  const [appliedReferral, setAppliedReferral] = useState<string>();

  const isPremium = session?.user.isPremium ?? false;
  const pendingPlan = transactionMutation.isPending ? transactionMutation.variables?.name : undefined;

  // premiumTier sama untuk semua paket, jadi paket yang dibeli dibaca dari profil.
  const { data: profile, isPending: isProfilePending } = useQuery(orpc.profile.me.queryOptions());
  const isPlanLoading = isPremium && isProfilePending;

  const { data: discount } = useQuery({ ...orpc.affiliate.discount.queryOptions(), enabled: !isPremium });
  // Kode yang diketik pembeli di sini, atau kode dari teman yang dipakai saat daftar.
  const activeReferral = appliedReferral ?? (discount?.eligible ? (discount.code ?? undefined) : undefined);
  const discountPercent = activeReferral ? (discount?.percent ?? 15) : 0;

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
      { name: plan, referralCode: activeReferral },
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
              <>
                <ReferralPromoCard variant="purchase" className="mb-6" />
                <PremiumFeatureList />
              </>
            ) : (
              <>
                <ReferralBox
                  activeCode={activeReferral}
                  percent={discount?.percent ?? 15}
                  input={referralInput}
                  onInputChange={setReferralInput}
                  onApply={() => setAppliedReferral(referralInput.trim() || undefined)}
                  onClear={() => {
                    setAppliedReferral(undefined);
                    setReferralInput("");
                  }}
                />
              <PremiumPackageGrid
                referralDiscountPercent={discountPercent}
                mode="checkout"
                pendingSlug={pendingPlan}
                initiatedSlug={initiatedPlan}
                isDisabled={transactionMutation.isPending}
                onSubscribe={handleSubscribe}
              />
              </>
            )}
          </div>
          <PricingExtras />
        </div>
      </MotionStaggerItem>
    </MotionStagger>
  );
}

function ReferralBox({
  activeCode,
  percent,
  input,
  onInputChange,
  onApply,
  onClear,
}: {
  activeCode?: string;
  percent: number;
  input: string;
  onInputChange: (value: string) => void;
  onApply: () => void;
  onClear: () => void;
}) {
  if (activeCode) {
    return (
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-sr-lg border border-sr-sun-300 bg-sr-sun-100 px-4 py-3">
        <p className="text-sm font-bold text-sr-amber-700">
          Kode referral <span className="font-black">{activeCode}</span> dipakai. Kamu hemat {percent}% di pembelian
          pertama.
        </p>
        <button type="button" onClick={onClear} className="text-xs font-bold text-sr-amber-700 underline">
          Ganti kode
        </button>
      </div>
    );
  }
  return (
    <div className="mb-5 flex flex-col gap-2 rounded-sr-lg border border-sr-line bg-sr-ivory/70 px-4 py-3 sm:flex-row sm:items-center">
      <p className="text-sm font-bold text-sr-ink sm:flex-1">Punya kode referral dari teman? Hemat {percent}%.</p>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          placeholder="Masukkan kode"
          aria-label="Kode referral"
          className="h-10 w-40 rounded-full border-2 border-sr-line-2 bg-white px-4 text-sm outline-none focus:border-sr-blue-500"
        />
        <button
          type="button"
          disabled={!input.trim()}
          onClick={onApply}
          className="h-10 rounded-full bg-sr-blue-500 px-5 text-sm font-bold text-white disabled:opacity-50"
        >
          Pakai
        </button>
      </div>
    </div>
  );
}
