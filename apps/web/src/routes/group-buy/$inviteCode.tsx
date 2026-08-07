import { ArrowLeftIcon, CheckCircleIcon, UsersThreeIcon, XCircleIcon } from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { GroupBuyProgress } from "@/components/group-buy/group-progress";
import { GroupBuyPriceRow, GroupBuyTerms } from "@/components/group-buy/group-buy-terms";
import { clearPendingGroupInvite, storePendingGroupInvite } from "@/components/group-buy/use-pending-invite";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { GROUP_BUY_COPY } from "@/lib/group-buy-copy";
import { useMidtransScript } from "@/lib/midtrans";
import { formatRupiah } from "@/lib/perintis-pricing-copy";
import { createMeta } from "@/lib/seo-utils";
import { cn } from "@/lib/utils";
import { usePremiumPaymentEffect } from "@/routes/_authenticated/premium/premium-payment";
import { client, orpc } from "@/utils/orpc";

export const Route = createFileRoute("/group-buy/$inviteCode")({
  head: () => ({
    meta: createMeta({
      title: "Undangan Patungan",
      description: "Kamu diundang patungan Paket Perintis 2027 di Habitutor. Bertiga bayar lebih murah!",
      noIndex: true,
    }),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { inviteCode } = Route.useParams();
  const router = useRouter();
  const navigate = useNavigate();
  const session = authClient.useSession();

  const groupQuery = useQuery({
    queryKey: orpc.groupBuy.get.queryKey({ input: { inviteCode } }),
    queryFn: () => client.groupBuy.get({ inviteCode }),
    refetchInterval: 15_000,
    retry: false,
  });

  const [paymentToken, setPaymentToken] = useState<string>();
  const [paymentRedirectUrl, setPaymentRedirectUrl] = useState<string>();
  const [paymentOrderId, setPaymentOrderId] = useState<string>();

  useMidtransScript();
  usePremiumPaymentEffect({
    paymentToken,
    paymentRedirectUrl,
    paymentOrderId,
    invalidateRouter: router.invalidate,
    onCompleted: () => navigate({ to: "/group-buy" }),
  });

  const joinMutation = useMutation(
    orpc.groupBuy.join.mutationOptions({
      onSuccess: (data) => {
        setPaymentToken(data.token);
        setPaymentRedirectUrl(data.redirectUrl);
        setPaymentOrderId(data.orderId);
      },
      onError: (error) => toast.error(error.message),
    }),
  );

  const isLoggedIn = Boolean(session.data);
  const isSessionPending = session.isPending;

  // Friends usually need to register/login first — remember the invite so we
  // can bring them straight back here afterwards.
  useEffect(() => {
    if (isSessionPending) return;
    if (isLoggedIn) {
      clearPendingGroupInvite();
    } else {
      storePendingGroupInvite(inviteCode);
    }
  }, [inviteCode, isLoggedIn, isSessionPending]);

  const group = groupQuery.data;
  const creator = group?.members.find((member) => member.isCreator);

  return (
    <main className="min-h-screen bg-[#FFFBF3] px-4 py-10">
      <div className="mx-auto w-full max-w-lg">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
          <ArrowLeftIcon weight="bold" />
          Habitutor
        </Link>

        {groupQuery.isPending ? (
          <Skeleton className="h-96 w-full rounded-2xl" />
        ) : groupQuery.isError || !group ? (
          <div className="rounded-2xl border-2 border-neutral-300 bg-white p-8 text-center shadow-sm">
            <XCircleIcon weight="fill" className="mx-auto size-12 text-red-400" />
            <h1 className="mt-3 text-xl font-bold">Undangan tidak ditemukan</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Link undangan ini tidak valid atau grupnya sudah dihapus. Minta teman kamu kirim ulang linknya, atau mulai
              grup kamu sendiri.
            </p>
            <Link to="/group-buy" className={cn(buttonVariants({ variant: "darkBlue" }), "mt-5")}>
              Mulai Patungan Sendiri
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border-2 border-primary-400 bg-white shadow-sm">
            <div className="border-b-2 border-neutral-1000 bg-primary-500 px-6 py-5 text-neutral-100">
              <p className="flex items-center gap-2 text-xs font-bold tracking-wide uppercase">
                <UsersThreeIcon weight="fill" className="size-4" />
                Undangan Patungan Bertiga
              </p>
              <h1 className="mt-1 text-xl font-extrabold">
                {creator ? `${creator.name} ngajak lo patungan` : "Kamu diajak patungan"} Paket Perintis 2027!
              </h1>
            </div>

            <div className="space-y-5 px-6 py-6">
              <GroupBuyPriceRow seatPrice={group.seatPrice} fullPrice={group.fullPrice} />

              <GroupBuyProgress
                paidCount={group.paidCount}
                requiredMembers={group.requiredMembers}
                expiresAt={group.expiresAt}
                isActive={group.status === "active"}
              />

              {group.status === "completed" ? (
                <div className="rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-sm font-semibold text-green-800">
                  <CheckCircleIcon weight="fill" className="mr-1 inline size-4" />
                  Grup ini sudah penuh dan selesai. Kamu masih bisa mulai grup baru bareng teman lain!
                </div>
              ) : group.status === "expired" ? (
                <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
                  Yah, waktu grup ini sudah habis. Tapi kamu bisa mulai grup baru bareng teman-teman kamu.
                </div>
              ) : (
                <GroupBuyTerms />
              )}

              <InviteActions
                groupStatus={group.status}
                seatPrice={group.seatPrice}
                isMember={Boolean(group.viewer)}
                isLoggedIn={isLoggedIn}
                isSessionPending={isSessionPending}
                isPremium={Boolean(session.data?.user.isPremium)}
                onJoin={() => joinMutation.mutate({ inviteCode })}
                isJoinPending={joinMutation.isPending}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function InviteActions({
  groupStatus,
  seatPrice,
  isMember,
  isLoggedIn,
  isSessionPending,
  isPremium,
  onJoin,
  isJoinPending,
}: {
  groupStatus: "active" | "completed" | "expired";
  seatPrice: number;
  isMember: boolean;
  isLoggedIn: boolean;
  isSessionPending: boolean;
  isPremium: boolean;
  onJoin: () => void;
  isJoinPending: boolean;
}) {
  if (isSessionPending) {
    return <Skeleton className="h-12 w-full" />;
  }

  if (isMember) {
    return (
      <Link to="/group-buy" className={cn(buttonVariants({ variant: "darkBlue", size: "lg" }), "w-full font-bold")}>
        Lihat Status Grup Kamu
      </Link>
    );
  }

  if (groupStatus !== "active") {
    return (
      <Link to="/group-buy" className={cn(buttonVariants({ variant: "darkBlue", size: "lg" }), "w-full font-bold")}>
        Mulai Grup Baru
      </Link>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="space-y-2">
        <Link
          to="/register"
          className={cn(
            buttonVariants({ variant: "darkBlue", size: "lg" }),
            "w-full border border-neutral-1000 font-bold tracking-wide uppercase",
          )}
        >
          Daftar & Gabung Grup
        </Link>
        <p className="text-center text-xs text-muted-foreground">
          Sudah punya akun?{" "}
          <Link to="/login" className="font-bold text-primary underline">
            Masuk dulu
          </Link>{" "}
          — setelah itu kamu langsung dibawa balik ke undangan ini.
        </p>
      </div>
    );
  }

  if (isPremium) {
    return (
      <p className="rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-2 text-center text-sm text-muted-foreground">
        Kamu sudah premium, jadi tidak perlu ikut patungan ini. Bagikan ke teman lain ya!
      </p>
    );
  }

  return (
    <Button
      type="button"
      variant="darkBlue"
      size="lg"
      className="w-full border border-neutral-1000 font-bold tracking-wide uppercase"
      onClick={onJoin}
      isPending={isJoinPending}
    >
      {GROUP_BUY_COPY.ctaJoin} {formatRupiah(seatPrice)}
    </Button>
  );
}
