import { CheckIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button";
import { PERINTIS_PRICING_COPY, formatRupiah } from "@/lib/perintis-pricing-copy";
import { cn } from "@/lib/utils";

// Harus sama dengan PAKET_2_BULAN.PRICE di packages/api/src/lib/constants.ts
// (server yang menentukan nominal tagihan; angka ini hanya untuk tampilan).
const HARGA = 50_000;

// Isi angka ini HANYA kalau 50k memang harga promo (harga normal yang benar-benar pernah berlaku).
// Kalau 50k adalah harga biasa, biarkan null supaya tidak ada harga coret.
const HARGA_NORMAL = null as number | null;

// Sembilan fasilitas inti yang sama dengan Paket Perintis 2027
const FASILITAS = PERINTIS_PRICING_COPY.features.slice(0, 9);

type Paket2BulanCardProps = {
  mode?: "marketing" | "checkout";
  isPending?: boolean;
  onSubscribe?: () => void;
  hasInitiatedPurchase?: boolean;
    isPremium?: boolean;
};

const CTA_CLASS_NAME = cn(
  buttonVariants({ variant: "darkBlue", size: "lg" }),
  "w-full border border-neutral-1000 text-base font-bold tracking-wide uppercase",
);

export function Paket2BulanCard({
  mode = "marketing",
  isPremium = false,
  isPending = false,
  onSubscribe,
  hasInitiatedPurchase = false,
}: Paket2BulanCardProps) {
  return (
    <div className="h-full w-full">
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl border-2 border-primary-400 bg-primary-300 shadow-sm">
        <div className="pointer-events-none absolute -right-12 -bottom-20 z-0 size-45 rounded-full border-2 border-primary-500 bg-primary-400" />

        <div className="relative z-10 flex items-center justify-between gap-4 border-b-2 border-neutral-1000 bg-primary-500 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-neutral-100">Paket 2 Bulan</h3>
            <p className="text-xs font-medium text-tertiary-100">coba dulu, tanpa komitmen panjang</p>
          </div>
          <span className="rounded-full bg-secondary-700 px-3 py-1 text-xs font-bold whitespace-nowrap text-neutral-100">
            Paket Coba
          </span>
        </div>

        <div className="relative z-10 px-6 py-5">
          {HARGA_NORMAL !== null && (
            <div className="relative inline-block text-base font-bold text-neutral-100">
              {formatRupiah(HARGA_NORMAL)}
              <span className="pointer-events-none absolute top-1/2 left-0 h-0.5 w-full -rotate-6 bg-red-400" />
            </div>
          )}
          <div className="flex flex-wrap items-baseline gap-2">
            <p className="text-4xl font-black text-secondary-200">{formatRupiah(HARGA)}</p>
            <span className="text-xs text-neutral-100">untuk 2 bulan</span>
          </div>
          <p className="mt-2 text-lg font-black text-neutral-100">cuma {formatRupiah(HARGA / 2)} / bulan</p>
          <p className="text-sm font-semibold text-neutral-100">kurang dari Rp850 / hari</p>
          <p className="mt-3 text-sm leading-relaxed text-neutral-100">
            Semua fasilitas Paket Perintis 2027, tanpa harus komit sampai hari-H. Cocok buat yang mau coba dulu atau
            persiapan jangka pendek.
          </p>
          <hr className="mt-4 border-primary-100" />
        </div>

        <div className="relative z-10 px-6 pb-5">
          <ul className="grid gap-2">
            {FASILITAS.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-neutral-100">
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-background p-0.5 text-secondary-1000">
                  <CheckIcon weight="bold" size={12} />
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 mt-auto space-y-3 p-6 pt-0">
          {mode === "checkout" ? (
            <>
              <button
                type="button"
                disabled={isPremium || isPending}
                onClick={onSubscribe}
                className={cn(
                  CTA_CLASS_NAME,
                  "cursor-pointer disabled:cursor-default disabled:opacity-70",
                  isPremium && "bg-primary-100 text-primary-600 opacity-100",
                )}
              >
                {isPremium ? "Kamu sudah berlangganan paket ini!" : isPending ? "Memproses..." : "Ambil Paket 2 Bulan"}
              </button>
              {hasInitiatedPurchase && !isPremium && (
                <p className="rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-2 text-center text-xs font-semibold text-yellow-800">
                  Tunggu 15 Menit — pembayaranmu sedang diproses, status premium akan aktif otomatis setelah
                  terkonfirmasi.
                </p>
              )} 
          </>
          ) : (
            <Link to="/premium" className={CTA_CLASS_NAME}>
              Ambil Paket 2 Bulan
            </Link>
          )}
          <p className="text-center text-xs text-tertiary-100">
            Sekali bayar untuk 2 bulan · Tanpa biaya bulanan · Aktif otomatis setelah pembayaran
          </p>
        </div>
      </div>
    </div>
  );
}
