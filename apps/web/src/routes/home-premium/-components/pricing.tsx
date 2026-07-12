import { CheckIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { MotionScaleIn } from "@/components/motion/motion-components";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatRupiah, PERINTIS_DATA } from "./data";
import { usePerintisPricing } from "./use-perintis-pricing";

export function PerintisPricingCard() {
  const { pricing: copy } = PERINTIS_DATA;
  const pricing = usePerintisPricing();

  const ctaLabel = pricing.isEarlyBird ? `Amankan Slot Lo — Sisa ${pricing.earlyBirdRemaining}` : "Amankan Slot Lo";

  return (
    <div className="relative flex w-full flex-col overflow-hidden rounded-2xl border-2 border-primary-400 bg-primary-300 shadow-sm">
      <div className="pointer-events-none absolute -right-12 -bottom-20 z-0 size-45 rounded-full border-2 border-primary-500 bg-primary-400" />
      <div className="pointer-events-none absolute top-24 -left-10 z-0 size-24 rounded-full border-2 border-primary-500 bg-primary-400" />

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
          <span className="text-xs text-neutral-100">sekali bayar</span>
        </div>
        {pricing.isEarlyBird ? (
          <p className="mt-1 text-xs text-red-100">
            Harga naik jadi <span className="font-bold">{formatRupiah(pricing.regularPrice)}</span> setelah 50 pendaftar
            pertama
          </p>
        ) : (
          <p className="mt-1 text-xs text-red-100">Slot early bird udah habis — harga reguler berlaku</p>
        )}
        <hr className="mt-4 border-primary-100" />
      </div>

      {/* Features */}
      <div className="relative z-10 px-6 pb-5">
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
      </div>

      {/* CTA */}
      <div className="relative z-10 p-6 pt-0">
        <Link
          to="/premium"
          className={cn(
            buttonVariants({ variant: "darkBlue", size: "lg" }),
            "hover:bg-primary-600 w-full border border-neutral-1000 text-base font-bold tracking-wide uppercase",
          )}
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}

export function Pricing() {
  return (
    <div id="paket" className="container mx-auto px-4 md:px-0">
      <div className="flex items-end justify-center gap-0 md:gap-6">
        <div className="pointer-events-none relative hidden shrink-0 lg:block">
          <div className="absolute bottom-0 left-1/2 size-40 -translate-x-1/2 rounded-full border-2 border-tertiary-300 bg-tertiary-200" />
          <Image
            src="/avatar/premium-pricing-card-avatar.webp"
            alt="Maskot Habitutor"
            width={224}
            height={224}
            className="relative size-56 object-contain select-none"
          />
        </div>

        <MotionScaleIn className="w-full max-w-xl">
          <PerintisPricingCard />
        </MotionScaleIn>
      </div>
    </div>
  );
}
