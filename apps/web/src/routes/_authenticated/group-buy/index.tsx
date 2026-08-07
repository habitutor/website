import { ArrowRightIcon, CheckCircleIcon, HourglassIcon, UsersThreeIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { type ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";
import { GroupBuyProgress } from "@/components/group-buy/group-progress";
import { GroupBuyPriceRow, GroupBuyTerms } from "@/components/group-buy/group-buy-terms";
import { GroupBuySharePanel } from "@/components/group-buy/share-panel";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { refreshAuthSession } from "@/lib/auth-session";
import { GROUP_BUY_COPY, GROUP_BUY_FALLBACK } from "@/lib/group-buy-copy";
import { useMidtransScript } from "@/lib/midtrans";
import { formatRupiah } from "@/lib/perintis-pricing-copy";
import { createMeta } from "@/lib/seo-utils";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";
import { usePremiumPaymentEffect } from "../premium/premium-payment";

export const Route = createFileRoute("/_authenticated/group-buy/")({
  head: () => ({
    meta: createMeta({
      title: "Patungan Bertiga",
      description: "Ajak 2 teman patungan Paket Perintis 2027 dan semua bayar lebih murah.",
      noIndex: true,
    }),
  }),
  component: RouteComponent,
});

type GroupState = NonNullable<ReturnType<typeof useGroupBuyMine>["data"]>;

function useGroupBuyMine() {
  return useQuery(
    orpc.groupBuy.mine.queryOptions({
      refetchInterval: 15_000,
    }),
  );
}

function RouteComponent() {
  const { session } = Route.useRouteContext();
  const router = useRouter();
  const queryClient = useQueryClient();
  const groupQuery = useGroupBuyMine();

  const [paymentToken, setPaymentToken] = useState<string>();
  const [paymentRedirectUrl, setPaymentRedirectUrl] = useState<string>();
  const [paymentOrderId, setPaymentOrderId] = useState<string>();

  useMidtransScript();
  usePremiumPaymentEffect({
    paymentToken,
    paymentRedirectUrl,
    paymentOrderId,
    invalidateRouter: router.invalidate,
    onCompleted: () => {
      queryClient.invalidateQueries({ queryKey: orpc.groupBuy.mine.queryKey() });
    },
  });

  const handlePaymentCreated = (data: { token: string; redirectUrl: string; orderId: string }) => {
    setPaymentToken(data.token);
    setPaymentRedirectUrl(data.redirectUrl);
    setPaymentOrderId(data.orderId);
  };

  const startMutation = useMutation(
    orpc.groupBuy.start.mutationOptions({
      onSuccess: handlePaymentCreated,
      onError: (error) => toast.error(error.message),
    }),
  );
  const retryMutation = useMutation(
    orpc.groupBuy.retryPayment.mutationOptions({
      onSuccess: handlePaymentCreated,
      onError: (error) => toast.error(error.message),
    }),
  );

  const group = groupQuery.data;
  const isPremium = session?.user.isPremium ?? false;

  // Premium can be granted while the user is away (webhook settles the last
  // seat) — pull a fresh session so the rest of the app unlocks too.
  useEffect(() => {
    if (!isPremium && (group?.status === "completed" || group?.viewer?.memberStatus === "upgraded")) {
      refreshAuthSession({ invalidateRouter: router.invalidate });
    }
  }, [group?.status, group?.viewer?.memberStatus, isPremium, router.invalidate]);

  if (groupQuery.isPending) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl pb-16">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold sm:text-3xl">
          <UsersThreeIcon weight="fill" className="size-8 text-primary-400" />
          Patungan Bertiga
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{GROUP_BUY_COPY.tagline}</p>
      </div>

      {!group ? (
        isPremium ? (
          <AlreadyPremiumCard />
        ) : (
          <StartGroupCard onStart={() => startMutation.mutate({})} isPending={startMutation.isPending} />
        )
      ) : group.status === "active" ? (
        <ActiveGroupCard
          group={group}
          onRetryPayment={() => retryMutation.mutate({})}
          isRetryPending={retryMutation.isPending}
        />
      ) : group.status === "completed" ? (
        <CompletedGroupCard group={group} />
      ) : (
        <ExpiredGroupCard
          group={group}
          onPaymentCreated={handlePaymentCreated}
          onStartNew={() => startMutation.mutate({})}
          isStartPending={startMutation.isPending}
        />
      )}
    </div>
  );
}

function CardShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border-2 border-neutral-300 bg-white p-6 shadow-sm sm:p-8", className)}>
      {children}
    </div>
  );
}

function AlreadyPremiumCard() {
  return (
    <CardShell className="text-center">
      <CheckCircleIcon weight="fill" className="mx-auto size-12 text-green-500" />
      <h2 className="mt-3 text-xl font-bold">Kamu sudah premium!</h2>
      <p className="mt-1 text-sm text-muted-foreground">Akses penuh kamu sudah aktif, gak perlu patungan lagi.</p>
      <Link to="/dashboard" className={cn(buttonVariants({ variant: "darkBlue" }), "mt-5")}>
        Ke Dashboard
        <ArrowRightIcon weight="bold" />
      </Link>
    </CardShell>
  );
}

function StartGroupCard({ onStart, isPending }: { onStart: () => void; isPending: boolean }) {
  return (
    <CardShell>
      <GroupBuyPriceRow />
      <GroupBuyTerms className="mt-5" />
      <Button
        type="button"
        variant="darkBlue"
        size="lg"
        className="mt-6 w-full border border-neutral-1000 font-bold tracking-wide uppercase"
        onClick={onStart}
        isPending={isPending}
      >
        {GROUP_BUY_COPY.ctaStart} — Bayar {formatRupiah(GROUP_BUY_FALLBACK.price)}
      </Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Lebih suka beli sendiri tanpa nunggu teman?{" "}
        <Link to="/premium" className="font-bold text-primary underline">
          Beli dengan harga normal
        </Link>
      </p>
    </CardShell>
  );
}

function MemberList({ group }: { group: GroupState }) {
  const emptySlots = Math.max(group.requiredMembers - group.members.length, 0);

  return (
    <ul className="space-y-2">
      {group.members.map((member) => (
        <li
          key={`${member.name}-${member.isCreator}`}
          className="flex items-center justify-between rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-2"
        >
          <span className="text-sm font-semibold">
            {member.name}
            {member.isCreator && (
              <span className="ml-1.5 text-xs font-medium text-muted-foreground">(pembuat grup)</span>
            )}
          </span>
          {member.hasPaid ? (
            <span className="flex items-center gap-1 text-xs font-bold text-green-600">
              <CheckCircleIcon weight="fill" className="size-4" />
              Sudah bayar
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-bold text-yellow-700">
              <HourglassIcon weight="fill" className="size-4" />
              Menunggu
            </span>
          )}
        </li>
      ))}
      {Array.from({ length: emptySlots }, (_, index) => (
        <li
          key={index}
          className="flex items-center justify-between rounded-lg border border-dashed border-neutral-400 px-3 py-2"
        >
          <span className="text-sm text-muted-foreground">Slot kosong — ajak teman kamu!</span>
        </li>
      ))}
    </ul>
  );
}

function ActiveGroupCard({
  group,
  onRetryPayment,
  isRetryPending,
}: {
  group: GroupState;
  onRetryPayment: () => void;
  isRetryPending: boolean;
}) {
  const viewerHasPaid = group.viewer?.memberStatus === "paid";

  return (
    <div className="space-y-4">
      <CardShell>
        <GroupBuyProgress
          paidCount={group.paidCount}
          requiredMembers={group.requiredMembers}
          expiresAt={group.expiresAt}
          isActive
        />
        <div className="mt-5">
          <MemberList group={group} />
        </div>

        {viewerHasPaid ? (
          <>
            <p className="mt-5 text-sm font-semibold">
              Tinggal {Math.max(group.requiredMembers - group.paidCount, 0)} orang lagi buat buka Premium untuk
              semuanya. Sebarkan link undangan kamu:
            </p>
            <GroupBuySharePanel
              inviteCode={group.inviteCode}
              paidCount={group.paidCount}
              requiredMembers={group.requiredMembers}
              className="mt-3"
            />
          </>
        ) : (
          <>
            <p className="mt-5 rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm font-semibold text-yellow-800">
              Pembayaran kamu belum selesai. Selesaikan sekarang supaya slot kamu terhitung.
            </p>
            <Button
              type="button"
              variant="darkBlue"
              size="lg"
              className="mt-3 w-full border border-neutral-1000 font-bold tracking-wide uppercase"
              onClick={onRetryPayment}
              isPending={isRetryPending}
            >
              Bayar {formatRupiah(group.seatPrice)} Sekarang
            </Button>
          </>
        )}
      </CardShell>

      <CardShell>
        <p className="text-sm font-bold">Pengingat aturan patungan</p>
        <GroupBuyTerms className="mt-3" />
      </CardShell>
    </div>
  );
}

function CompletedGroupCard({ group }: { group: GroupState }) {
  return (
    <CardShell className="text-center">
      <CheckCircleIcon weight="fill" className="mx-auto size-14 text-green-500" />
      <h2 className="mt-3 text-2xl font-extrabold">Grup lengkap! 🎉</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {group.requiredMembers} orang sudah bayar — akses Premium untuk semua anggota grup sudah aktif.
      </p>
      <div className="mt-5">
        <MemberList group={group} />
      </div>
      <Link
        to="/dashboard"
        className={cn(buttonVariants({ variant: "darkBlue", size: "lg" }), "mt-6 w-full font-bold")}
      >
        Mulai Belajar
        <ArrowRightIcon weight="bold" />
      </Link>
    </CardShell>
  );
}

function ExpiredGroupCard({
  group,
  onPaymentCreated,
  onStartNew,
  isStartPending,
}: {
  group: GroupState;
  onPaymentCreated: (data: { token: string; redirectUrl: string; orderId: string }) => void;
  onStartNew: () => void;
  isStartPending: boolean;
}) {
  const viewerStatus = group.viewer?.memberStatus;

  return (
    <div className="space-y-4">
      <CardShell>
        <GroupBuyProgress
          paidCount={group.paidCount}
          requiredMembers={group.requiredMembers}
          expiresAt={group.expiresAt}
          isActive={false}
        />
        <p className="mt-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
          Waktu 48 jam sudah habis dan grup belum terisi {group.requiredMembers} orang, jadi grup ini berakhir.
        </p>
      </CardShell>

      {viewerStatus === "paid" && <ExpiredPaidOptions group={group} onPaymentCreated={onPaymentCreated} />}

      {viewerStatus === "refund_requested" && (
        <CardShell>
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <HourglassIcon weight="fill" className="size-5 text-yellow-600" />
            Refund kamu sedang diproses
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Refund sebesar {formatRupiah(group.seatPrice)} diproses manual oleh tim kami dan bisa memakan waktu hingga 7
            hari kerja sejak permintaan dikirim. Kami transfer ke rekening yang kamu daftarkan.
          </p>
        </CardShell>
      )}

      {viewerStatus === "refunded" && (
        <CardShell>
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <CheckCircleIcon weight="fill" className="size-5 text-green-500" />
            Refund selesai
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Refund {formatRupiah(group.seatPrice)} sudah dikirim ke rekening kamu. Kalau mau, kamu tetap bisa beli Paket
            Perintis 2027 kapan saja.
          </p>
          <Link to="/premium" className={cn(buttonVariants({ variant: "darkBlue" }), "mt-4")}>
            Lihat Paket
          </Link>
        </CardShell>
      )}

      {viewerStatus === "upgraded" && (
        <CardShell>
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <CheckCircleIcon weight="fill" className="size-5 text-green-500" />
            Premium kamu aktif!
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Kamu sudah melunasi selisih harga — akses Premium kamu aktif sepenuhnya.
          </p>
          <Link to="/dashboard" className={cn(buttonVariants({ variant: "darkBlue" }), "mt-4")}>
            Mulai Belajar
          </Link>
        </CardShell>
      )}

      {viewerStatus === "pending_payment" && (
        <CardShell>
          <p className="text-sm text-muted-foreground">
            Kamu belum sempat bayar di grup ini, jadi tidak ada dana yang perlu dikembalikan. Mau coba lagi?
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="darkBlue" className="flex-1" onClick={onStartNew} isPending={isStartPending}>
              Mulai Grup Baru
            </Button>
            <Link to="/premium" className={cn(buttonVariants({ variant: "outline" }), "flex-1")}>
              Beli Harga Normal
            </Link>
          </div>
        </CardShell>
      )}
    </div>
  );
}

function ExpiredPaidOptions({
  group,
  onPaymentCreated,
}: {
  group: GroupState;
  onPaymentCreated: (data: { token: string; redirectUrl: string; orderId: string }) => void;
}) {
  const queryClient = useQueryClient();
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");

  const payDifferenceMutation = useMutation(
    orpc.groupBuy.payDifference.mutationOptions({
      onSuccess: onPaymentCreated,
      onError: (error) => toast.error(error.message),
    }),
  );
  const refundMutation = useMutation(
    orpc.groupBuy.requestRefund.mutationOptions({
      onSuccess: () => {
        toast.success("Permintaan refund terkirim. Maksimal 7 hari kerja ya!");
        queryClient.invalidateQueries({ queryKey: orpc.groupBuy.mine.queryKey() });
      },
      onError: (error) => toast.error(error.message),
    }),
  );

  const canSubmitRefund = bankName.trim() && accountNumber.trim() && accountHolder.trim();

  return (
    <CardShell>
      <h2 className="text-lg font-bold">Kamu sudah bayar {formatRupiah(group.seatPrice)} — pilih salah satu:</h2>

      <div className="mt-4 space-y-3">
        <div className="rounded-xl border-2 border-primary-400 p-4">
          <p className="font-bold">1. Bayar selisihnya, langsung Premium</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tambah {formatRupiah(group.topupAmount)} untuk melunasi harga normal ({formatRupiah(group.fullPrice)}) dan
            akses Premium kamu langsung aktif.
          </p>
          <Button
            type="button"
            variant="darkBlue"
            className="mt-3 w-full font-bold"
            onClick={() => payDifferenceMutation.mutate({})}
            isPending={payDifferenceMutation.isPending}
          >
            Bayar Selisih {formatRupiah(group.topupAmount)}
          </Button>
        </div>

        <div className="rounded-xl border-2 border-neutral-300 p-4">
          <p className="font-bold">2. Minta refund penuh</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Kami kembalikan {formatRupiah(group.seatPrice)} ke rekening kamu. Refund diproses manual, jadi bisa memakan
            waktu hingga <strong>7 hari kerja</strong>.
          </p>

          {showRefundForm ? (
            <form
              className="mt-3 space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                if (!canSubmitRefund) return;
                refundMutation.mutate({ bankName, accountNumber, accountHolder });
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="refund-bank">Nama bank / e-wallet</Label>
                <Input
                  id="refund-bank"
                  value={bankName}
                  onChange={(event) => setBankName(event.target.value)}
                  placeholder="contoh: BCA, Mandiri, GoPay"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="refund-account">Nomor rekening / e-wallet</Label>
                <Input
                  id="refund-account"
                  value={accountNumber}
                  onChange={(event) => setAccountNumber(event.target.value)}
                  placeholder="contoh: 1234567890"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="refund-holder">Nama pemilik rekening</Label>
                <Input
                  id="refund-holder"
                  value={accountHolder}
                  onChange={(event) => setAccountHolder(event.target.value)}
                  placeholder="Sesuai buku tabungan"
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                className="w-full font-bold"
                disabled={!canSubmitRefund}
                isPending={refundMutation.isPending}
              >
                Kirim Permintaan Refund
              </Button>
            </form>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="mt-3 w-full font-bold"
              onClick={() => setShowRefundForm(true)}
            >
              Minta Refund
            </Button>
          )}
        </div>
      </div>
    </CardShell>
  );
}
