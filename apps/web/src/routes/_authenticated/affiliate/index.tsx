import {
  ClockIcon,
  CopyIcon,
  CoinsIcon,
  ShareNetworkIcon,
  UserPlusIcon,
  UsersThreeIcon,
  WalletIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { MotionStagger, MotionStaggerItem } from "@/components/motion/motion-components";
import { useAffiliateSeen } from "@/hooks/data/use-affiliate-seen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah, formatWibDate } from "@/lib/premium-packages";
import { createMeta } from "@/lib/seo-utils";
import { cn } from "@/lib/utils";
import { CountUp } from "@/routes/-home/motion-bits";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/affiliate/")({
  head: () => ({
    meta: createMeta({
      title: "Ajak Teman",
      description: "Ajak teman belajar di Habitutor, teman hemat 15% dan kamu dapat komisi 10%.",
    }),
  }),
  component: RouteComponent,
});

const REFERRAL_STATUS = {
  signed_up: { label: "Sudah daftar", tone: "bg-sr-blue-50 text-sr-blue-600" },
  holding: { label: "Komisi ditahan", tone: "bg-sr-sun-100 text-sr-amber-700" },
  earned: { label: "Komisi masuk", tone: "bg-emerald-50 text-emerald-700" },
  refunded: { label: "Dibatalkan", tone: "bg-sr-line text-sr-muted" },
} as const;

const PAYOUT_STATUS = {
  requested: { label: "Diproses admin", tone: "bg-sr-sun-100 text-sr-amber-700" },
  paid: { label: "Sudah ditransfer", tone: "bg-emerald-50 text-emerald-700" },
  rejected: { label: "Ditolak", tone: "bg-destructive/10 text-destructive" },
} as const;

function RouteComponent() {
  const { markSeen } = useAffiliateSeen();
  useEffect(() => {
    markSeen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { data, isPending, isError, error, refetch } = useQuery(orpc.affiliate.overview.queryOptions());
  const { data: rules } = useQuery(orpc.affiliate.rules.queryOptions());
  const discountPercent = rules?.buyerDiscountPercent ?? 15;
  const commissionPercent = rules?.commissionPercent ?? 10;

  const origin = typeof window === "undefined" ? "https://habitutor.id" : window.location.origin;
  const link = data ? `${origin}/r/${encodeURIComponent(data.code)}` : "";
  const shareText = `Aku belajar SNBT/UTBK di Habitutor. Daftar pakai linkku, kamu dapat diskon ${discountPercent}% pas beli paket Premium: ${link}`;

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} disalin`);
    } catch {
      toast.error("Gagal menyalin. Salin manual ya.");
    }
  };

  return (
    <MotionStagger className="flex flex-col gap-5 sm:gap-6">
      <MotionStaggerItem>
        <div className="relative overflow-hidden rounded-sr-xl sr-card-blue px-5 py-7 sm:px-8 sm:py-9">
          <div className="pointer-events-none absolute -top-24 -right-20 size-72 rounded-full bg-white/8" />
          <h1 className="relative text-[26px] leading-tight font-extrabold text-balance text-white sm:text-3xl">
            Ajak teman belajar, dapat {commissionPercent}% dari setiap paket Premium
          </h1>
          <p className="relative mt-2.5 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
            Temanmu langsung hemat {discountPercent}% saat beli Premium pertamanya. Kamu dapat komisi{" "}
            {commissionPercent}% dari yang mereka bayar, masuk ke saldo di akunmu.
          </p>
        </div>
      </MotionStaggerItem>

      {isError && (
        <MotionStaggerItem>
          <div className="flex flex-col gap-2 rounded-sr-xl border border-destructive/30 bg-destructive/5 p-5">
            <p className="font-black text-sr-ink">Data afiliasi belum bisa dimuat</p>
            <p className="text-sm text-sr-muted">
              {error?.message ?? "Terjadi kesalahan."} Pastikan server API versi terbaru sedang berjalan, lalu coba
              lagi.
            </p>
            <Button variant="outline" className="w-fit rounded-full" onClick={() => refetch()}>
              Coba lagi
            </Button>
          </div>
        </MotionStaggerItem>
      )}

      <MotionStaggerItem>
        <section className="rounded-sr-xl border border-sr-line bg-white p-5 shadow-sr-1 transition-shadow duration-300 hover:shadow-sr-2 sm:p-6">
          <h2 className="font-black text-sr-ink">Kode dan link ajakanmu</h2>
          {isPending ? (
            <Skeleton className="mt-3 h-24 w-full" />
          ) : (
            <div className="mt-3 grid gap-3">
              <CopyRow label="Kode referral" value={data?.code ?? ""} onCopy={() => copy(data?.code ?? "", "Kode")} mono />
              {data && data.code.length !== 8 && data.signupCount === 0 && <RefreshCodeButton />}
              <CopyRow label="Link ajakan" value={link} onCopy={() => copy(link, "Link")} />
              <div className="flex flex-wrap gap-2">
                <Button asChild className="rounded-full">
                  <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer">
                    <ShareNetworkIcon weight="bold" /> Bagikan ke WhatsApp
                  </a>
                </Button>
                <Button variant="outline" className="rounded-full" onClick={() => copy(shareText, "Teks ajakan")}>
                  <CopyIcon /> Salin teks ajakan
                </Button>
              </div>
              <ol className="grid gap-2 rounded-sr-lg bg-sr-ivory/70 p-4 text-sm text-sr-ink-2 sm:grid-cols-3">
                <li>
                  <strong className="block text-sr-ink">1. Bagikan</strong>Kirim link atau kodemu ke teman.
                </li>
                <li>
                  <strong className="block text-sr-ink">2. Teman beli</strong>Dia hemat {discountPercent}% di Premium
                  pertamanya.
                </li>
                <li>
                  <strong className="block text-sr-ink">3. Kamu dapat {commissionPercent}%</strong>Komisi masuk saldo
                  setelah {rules?.holdDays ?? 7} hari.
                </li>
              </ol>
            </div>
          )}
        </section>
      </MotionStaggerItem>

      <MotionStaggerItem>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat icon={<UserPlusIcon weight="fill" />} label="Teman daftar" value={data ? <CountUp to={data.signupCount} /> : undefined} pending={isPending} />
          <Stat icon={<UsersThreeIcon weight="fill" />} label="Teman beli" value={data ? <CountUp to={data.buyerCount} /> : undefined} pending={isPending} />
          <Stat
            icon={<ClockIcon weight="fill" />}
            label="Komisi ditahan"
            value={data ? <CountUp to={data.balance.pending} prefix="Rp" /> : undefined}
            hint={`Cair setelah ${rules?.holdDays ?? 7} hari`}
            pending={isPending}
          />
          <Stat
            icon={<WalletIcon weight="fill" />}
            label="Saldo bisa dicairkan"
            value={data ? <CountUp to={data.balance.available} prefix="Rp" /> : undefined}
            highlight
            pending={isPending}
          />
        </div>
      </MotionStaggerItem>

      <MotionStaggerItem>
        <PayoutCard
          available={data?.balance.available ?? 0}
          requested={data?.balance.requested ?? 0}
          paid={data?.balance.paid ?? 0}
          minPayout={rules?.minPayout ?? 50_000}
          hasOpenRequest={Boolean(data?.payouts.some((p) => p.status === "requested"))}
        />
      </MotionStaggerItem>

      <MotionStaggerItem>
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-sr-xl border border-sr-line bg-white p-5 shadow-sr-1 transition-shadow duration-300 hover:shadow-sr-2">
            <h2 className="font-black text-sr-ink">Progres teman yang kamu ajak</h2>
            {isPending ? (
              <Skeleton className="mt-3 h-28 w-full" />
            ) : data?.referrals.length ? (
              <ul className="mt-3 divide-y divide-sr-line">
                {data.referrals.map((item, index) => (
                  <li key={`${item.name}-${index}`} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-sr-ink">{item.name}</p>
                      <p className="text-xs text-sr-muted">{formatWibDate(item.joinedAt)}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", REFERRAL_STATUS[item.status].tone)}>
                        {REFERRAL_STATUS[item.status].label}
                      </span>
                      {item.commission !== null && (
                        <span className="text-xs font-bold text-sr-ink">+{formatRupiah(item.commission)}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 rounded-sr-md bg-sr-ivory/70 p-4 text-sm text-sr-muted">
                Belum ada teman yang daftar lewat kodemu. Bagikan link di atas untuk mulai.
              </p>
            )}
          </section>

          <section className="rounded-sr-xl border border-sr-line bg-white p-5 shadow-sr-1 transition-shadow duration-300 hover:shadow-sr-2">
            <h2 className="font-black text-sr-ink">Riwayat pencairan</h2>
            {isPending ? (
              <Skeleton className="mt-3 h-28 w-full" />
            ) : data?.payouts.length ? (
              <ul className="mt-3 divide-y divide-sr-line">
                {data.payouts.map((payout) => (
                  <li key={payout.id} className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <p className="text-sm font-bold text-sr-ink">{formatRupiah(payout.amount)}</p>
                      <p className="text-xs text-sr-muted">
                        {formatWibDate(payout.requestedAt)}
                        {payout.reference ? ` · Ref ${payout.reference}` : ""}
                        {payout.note ? ` · ${payout.note}` : ""}
                      </p>
                    </div>
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", PAYOUT_STATUS[payout.status as keyof typeof PAYOUT_STATUS]?.tone)}>
                      {PAYOUT_STATUS[payout.status as keyof typeof PAYOUT_STATUS]?.label ?? payout.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 rounded-sr-md bg-sr-ivory/70 p-4 text-sm text-sr-muted">Belum ada pencairan.</p>
            )}
          </section>
        </div>
      </MotionStaggerItem>

      <MotionStaggerItem>
        <p className="text-xs leading-relaxed text-sr-muted">
          Ketentuan: diskon dan komisi berlaku untuk pembelian paket Premium pertama teman. Komisi dihitung dari jumlah
          yang dibayar teman setelah diskon, ditahan {rules?.holdDays ?? 7} hari, dan dibatalkan bila pembayaran
          dikembalikan. Kode tidak bisa dipakai untuk akun sendiri.
        </p>
      </MotionStaggerItem>
    </MotionStagger>
  );
}

/** Kode lama panjang dan penuh simbol; selama belum dipakai teman, boleh ditukar dengan kode pendek. */
function RefreshCodeButton() {
  const queryClient = useQueryClient();
  const refresh = useMutation(
    orpc.affiliate.refreshCode.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: orpc.affiliate.overview.queryKey() });
        toast.success("Kode barumu sudah aktif");
      },
      onError: (error) => toast.error("Belum bisa mengganti kode", { description: error.message }),
    }),
  );
  return (
    <button
      type="button"
      onClick={() => refresh.mutate({})}
      disabled={refresh.isPending}
      className="w-fit text-xs font-bold text-sr-blue-600 underline disabled:opacity-60"
    >
      Kodemu panjang? Ganti dengan kode pendek yang mudah diingat
    </button>
  );
}

function CopyRow({ label, value, onCopy, mono }: { label: string; value: string; onCopy: () => void; mono?: boolean }) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input readOnly aria-label={label} value={value} className={cn("h-11", mono && "font-mono text-lg font-black tracking-widest")} />
        <Button type="button" variant="outline" className="h-11 rounded-full" onClick={onCopy}>
          <CopyIcon /> Salin
        </Button>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  hint,
  highlight,
  pending,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  hint?: string;
  highlight?: boolean;
  pending?: boolean;
}) {
  return (
    <div className={cn(
        "rounded-sr-lg border p-4 shadow-sr-1 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sr-2",
        highlight ? "border-sr-sun-300 bg-sr-sun-100" : "border-sr-line bg-white",
      )}>
      <div className="flex items-center gap-1.5 text-xs font-bold text-sr-muted [&>svg]:size-4">
        {icon}
        {label}
      </div>
      {pending ? <Skeleton className="mt-2 h-7 w-20" /> : <p className="mt-1 text-xl font-black text-sr-ink">{value ?? 0}</p>}
      {hint && <p className="mt-0.5 text-[11px] text-sr-muted">{hint}</p>}
    </div>
  );
}

function PayoutCard({
  available,
  requested,
  paid,
  minPayout,
  hasOpenRequest,
}: {
  available: number;
  requested: number;
  paid: number;
  minPayout: number;
  hasOpenRequest: boolean;
}) {
  const queryClient = useQueryClient();
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [amount, setAmount] = useState("");

  const request = useMutation(
    orpc.affiliate.requestPayout.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: orpc.affiliate.overview.queryKey() });
        setAmount("");
        toast.success("Permintaan pencairan terkirim. Admin akan mentransfer ke rekeningmu.");
      },
      onError: (error) => toast.error("Pencairan belum berhasil", { description: error.message }),
    }),
  );

  const canRequest = available >= minPayout && !hasOpenRequest;
  const amountNumber = Number(amount.replace(/\D/g, "")) || 0;

  return (
    <section className="rounded-sr-xl border border-sr-line bg-white p-5 shadow-sr-1 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-black text-sr-ink">
          <CoinsIcon weight="fill" className="size-5 text-sr-amber-700" /> Cairkan saldo
        </h2>
        <p className="text-xs text-sr-muted">
          Sudah ditransfer {formatRupiah(paid)} · Sedang diproses {formatRupiah(requested)}
        </p>
      </div>

      {hasOpenRequest ? (
        <p className="mt-3 rounded-sr-md bg-sr-sun-100 p-3 text-sm text-sr-amber-700">
          Permintaan pencairanmu sedang diproses admin. Setelah ditransfer, statusnya berubah di riwayat.
        </p>
      ) : !canRequest ? (
        <p className="mt-3 rounded-sr-md bg-sr-ivory/70 p-3 text-sm text-sr-muted">
          Saldo bisa dicairkan mulai {formatRupiah(minPayout)}. Saldomu saat ini {formatRupiah(available)}.
        </p>
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="po-amount">Jumlah (maks {formatRupiah(available)})</Label>
            <Input
              id="po-amount"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={String(available)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="po-bank">Bank / e-wallet</Label>
            <Input id="po-bank" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Contoh: BCA" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="po-number">Nomor rekening</Label>
            <Input id="po-number" inputMode="numeric" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="po-name">Nama pemilik rekening</Label>
            <Input id="po-name" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
          </div>
          <Button
            className="sm:col-span-2"
            disabled={request.isPending || amountNumber < minPayout}
            onClick={() => request.mutate({ amount: amountNumber, bankName, accountNumber, accountName })}
          >
            {request.isPending ? "Mengirim…" : "Ajukan Pencairan"}
          </Button>
        </div>
      )}
    </section>
  );
}
