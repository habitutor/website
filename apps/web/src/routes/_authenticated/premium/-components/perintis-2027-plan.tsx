import { CheckIcon } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatRupiah, PERINTIS_DATA } from "@/routes/home-premium/-components/data";
import { usePerintisPricing } from "@/routes/home-premium/-components/use-perintis-pricing";

type Perintis2027PlanProps = {
  isPremium: boolean;
  isPending: boolean;
  onSubscribe: () => void;
};

export function Perintis2027Plan({ isPremium, isPending, onSubscribe }: Perintis2027PlanProps) {
  const { pricing: copy, benefits } = PERINTIS_DATA;
  const pricing = usePerintisPricing();

  const buttonLabel = isPremium
    ? "Kamu sudah berlangganan paket ini!"
    : isPending
      ? "Memproses..."
      : pricing.isEarlyBird
        ? `Amankan Slot Lo — Sisa ${pricing.earlyBirdRemaining}`
        : "Amankan Slot Lo";

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="relative flex w-full flex-col overflow-hidden rounded-2xl border-2 border-primary-400 bg-primary-300 shadow-sm">
        <div className="pointer-events-none absolute -right-12 -bottom-20 z-0 size-45 rounded-full border-2 border-primary-500 bg-primary-400" />
        <div className="pointer-events-none absolute top-28 -left-10 z-0 size-24 rounded-full border-2 border-primary-500 bg-primary-400" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between gap-4 border-b-2 border-neutral-1000 bg-primary-500 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-neutral-100">{copy.label}</h3>
            <p className="text-xs font-medium text-tertiary-100">{copy.suffix}</p>
          </div>
          <span className="rounded-full bg-secondary-700 px-3 py-1 text-xs font-bold whitespace-nowrap text-neutral-100">
            Satu-satunya paket
          </span>
        </div>

        {/* Price */}
        <div className="relative z-10 px-6 py-5">
          <div className="relative inline-block text-base font-bold text-neutral-100">
            {formatRupiah(pricing.originalPrice)}
            <span className="pointer-events-none absolute top-1/2 left-0 h-0.5 w-full -rotate-6 bg-red-400" />
          </div>
          <div className="flex flex-wrap items-baseline gap-2">
            {pricing.isPending ? (
              <Skeleton className="h-10 w-44 bg-primary-400" />
            ) : (
              <p className="text-4xl font-black text-secondary-200">{formatRupiah(pricing.currentPrice)}</p>
            )}
            <span className="text-xs text-neutral-100">sekali bayar, akses penuh sampai SNBT 2027</span>
          </div>
          {pricing.isEarlyBird ? (
            <p className="mt-1 text-xs text-red-100">
              Harga naik jadi <span className="font-bold">{formatRupiah(pricing.regularPrice)}</span> setelah 50
              pendaftar pertama
            </p>
          ) : (
            <p className="mt-1 text-xs text-red-100">Slot early bird udah habis — harga reguler berlaku</p>
          )}
          <hr className="mt-4 border-primary-100" />
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-3 px-6 pb-5">
          <ul className="grid gap-2 sm:grid-cols-2">
            {copy.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-neutral-100">
                <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-background p-0.5 text-secondary-1000">
                  <CheckIcon weight="bold" size={12} />
                </span>
                {feature}
              </li>
            ))}
          </ul>
          <ul className="space-y-1">
            {benefits.map((benefit) => (
              <li key={benefit.title} className="text-xs text-tertiary-100">
                {benefit.description}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="relative z-10 p-6 pt-0">
          <button
            type="button"
            disabled={isPremium || isPending}
            onClick={onSubscribe}
            className={cn(
              "flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-neutral-1000 px-4 py-3 text-sm font-bold tracking-wide uppercase transition-colors",
              isPremium
                ? "text-primary-600 cursor-default bg-primary-100"
                : "hover:bg-primary-600 bg-primary-500 text-neutral-100 disabled:opacity-70",
            )}
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
