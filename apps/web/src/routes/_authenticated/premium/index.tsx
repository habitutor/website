import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MotionStagger, MotionStaggerItem } from "@/components/motion/motion-components";
import { MobileCarousel } from "@/components/pricing/mobile-carousel";
import { TryOutCard } from "@/components/pricing/tryout-card";
import { refreshAuthSession } from "@/lib/auth-session";
import { useMidtransScript } from "@/lib/midtrans";
import { createMeta } from "@/lib/seo-utils";
import { DATA } from "@/routes/home-premium/-components/data";
import { client, orpc } from "@/utils/orpc";
import { BundlingCard } from "./-components/bundling-card";
import { PerintisClassroomCard } from "./-components/perintis-card";
import { PremiumHeader } from "./-components/premium-header";
import { PrivilegeCard } from "./-components/privilege-card";

type BundlingVariant = "premium" | "premium2";

function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForPremiumActivation(orderId: string) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
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

    await sleep(1000);
  }

  return false;
}

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
  const invalidateRouter = router.invalidate;
  const tryoutPlans = Object.values(DATA.pricing_tryout);
  const transactionMutation = useMutation(orpc.transaction.subscribe.mutationOptions());
  const [paymentToken, setPaymentToken] = useState<string>();
  const [paymentRedirectUrl, setPaymentRedirectUrl] = useState<string>();
  const [paymentOrderId, setPaymentOrderId] = useState<string>();
  const [activeVariant, setActiveVariant] = useState<BundlingVariant | null>(null);
  const sessionUser = session?.user as { isPremium?: boolean; premiumTier?: BundlingVariant | null } | undefined;
  const isPremium = sessionUser?.isPremium ?? false;
  const currentTier = isPremium ? (sessionUser?.premiumTier ?? "premium") : null;
  const navigate = useNavigate();

  useMidtransScript();

  useEffect(() => {
    if (!paymentToken) return;

    const completePremiumUpgrade = async () => {
      await refreshAuthSession({
        invalidateRouter,
      });
      navigate({ to: "/premium" });
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
  }, [invalidateRouter, navigate, paymentOrderId, paymentRedirectUrl, paymentToken]);

  const handleSubscribe = (variant: BundlingVariant) => {
    if (transactionMutation.isPending) return;

    setActiveVariant(variant);
    const payload = { name: variant } as Parameters<typeof transactionMutation.mutate>[0];
    transactionMutation.mutate(payload, {
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
    });
  };
  // const tierCards = [
  // 	<TierCard key="free" variant="free" isPremium={isPremium} />,
  // 	<TierCard
  // 		key="premium"
  // 		variant="premium"
  // 		isPremium={isPremium}
  // 		isPending={transactionMutation.isPending}
  // 		mutate={transactionMutation.mutate}
  // 	/>,
  // ];
  const bundlingCards = [
    <BundlingCard
      key="premium"
      variant="premium"
      isCurrentPlan={currentTier === "premium"}
      isSubscribed={isPremium && currentTier !== "premium"}
      isPending={transactionMutation.isPending && activeVariant === "premium"}
      buttonDisabled={false}
      onSubscribe={handleSubscribe}
    />,
    <BundlingCard
      key="premium2"
      variant="premium2"
      isCurrentPlan={currentTier === "premium2"}
      isSubscribed={isPremium && currentTier !== "premium2"}
      isPending={transactionMutation.isPending && activeVariant === "premium2"}
      buttonDisabled={false}
      onSubscribe={handleSubscribe}
    />,
  ];
  const privilegeCards = [
    <PrivilegeCard key="privilege1" variant="privilege1" />,
    <PrivilegeCard key="privilege2" variant="privilege2" />,
  ];
  const perintisCards = [
    <PerintisClassroomCard key="perintis1" variant="perintis1" />,
    <PerintisClassroomCard key="perintis2" variant="perintis2" />,
    <PerintisClassroomCard key="classroom" variant="classroom" />,
  ];
  const tryoutCards = tryoutPlans.map((plan) => <TryOutCard key={plan.label} data={plan} />);

  return (
    <MotionStagger className="mt-4 flex flex-col gap-6 sm:-mt-3">
      <MotionStaggerItem>
        <PremiumHeader session={session} />
      </MotionStaggerItem>

      {/* <MotionStaggerItem>
				<div className="space-y-4">
					<MobileCarousel items={tierCards} paginationLabel="Tier Premium" />
					<div className="hidden gap-6 sm:grid sm:grid-cols-2">
						{tierCards}
					</div>
				</div>
			</MotionStaggerItem> */}

      <MotionStaggerItem>
        <div className="space-y-6 rounded-2xl border border-neutral-300 bg-neutral-100 p-6 sm:p-10">
          <div className="flex flex-col">
            <span className="text-lg font-bold sm:text-2xl">Ultimate Bundling</span>
            <span className="text-sm font-medium sm:text-lg">
              Paket yang paling worth it!!! Paling lengkap + murah!!
            </span>
          </div>
          <MobileCarousel items={bundlingCards} paginationLabel="Ultimate Bundling" itemClassName="w-full shrink-0" />
          <div className="hidden gap-6 sm:grid sm:grid-cols-2">{bundlingCards}</div>
        </div>
      </MotionStaggerItem>

      <MotionStaggerItem>
        <div className="space-y-6 rounded-2xl border border-neutral-300 bg-neutral-100 p-6 sm:p-10">
          <div className="flex flex-col">
            <span className="text-lg font-bold sm:text-2xl">Privilege</span>
            <span className="text-sm font-medium sm:text-lg">
              Pilihan paket belajar yang lebih ringan dengan benefit terarah.
            </span>
          </div>
          <MobileCarousel items={privilegeCards} paginationLabel="Privilege" itemClassName="w-full shrink-0" />
          <div className="hidden gap-6 sm:grid sm:grid-cols-2">{privilegeCards}</div>
        </div>
      </MotionStaggerItem>

      <MotionStaggerItem>
        <div className="space-y-6 rounded-2xl border border-neutral-300 bg-neutral-100 p-6 sm:p-10">
          <div className="flex flex-col">
            <span className="text-lg font-bold sm:text-2xl">Perintis & Classroom</span>
            <span className="text-sm font-medium sm:text-lg">
              Pilihan belajar bertahap dengan isi dan warna yang sama seperti section perintis.
            </span>
          </div>
          <MobileCarousel
            items={perintisCards}
            paginationLabel="Perintis dan Classroom"
            itemClassName="w-full shrink-0"
          />
          <div className="hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-3">{perintisCards}</div>
        </div>
      </MotionStaggerItem>

      <MotionStaggerItem>
        <div className="space-y-6 rounded-2xl border border-neutral-300 bg-neutral-100 p-6 sm:p-10">
          <div className="flex flex-col">
            <span className="text-lg font-bold sm:text-2xl">Paket Try Out</span>
            <span className="text-sm font-medium sm:text-lg">
              Pilih paket try out sesuai intensitas latihan yang kamu butuhkan.
            </span>
          </div>
          <MobileCarousel items={tryoutCards} paginationLabel="Paket Try Out" itemClassName="w-full shrink-0" />
          <div className="hidden gap-6 md:grid md:grid-cols-2 xl:grid-cols-3">{tryoutCards}</div>
        </div>
      </MotionStaggerItem>
    </MotionStagger>
  );
}
