import { CheckIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { MotionScaleIn } from "@/components/motion/motion-components";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveFakePurchase } from "@/lib/fake-recent-purchases";
import {
  PREMIUM_PACKAGE_COPY,
  PREMIUM_PRICING_COPY,
  type PremiumPackage,
  type PremiumPackageSlug,
  formatRupiah,
  formatWibDate,
  getAccessLabel,
} from "@/lib/premium-packages";
import { cn } from "@/lib/utils";
import { usePremiumPackages } from "./use-premium-packages";

function PricingFeature({ feature }: { feature: string }) {
  if (feature !== "TKA INTENSIF — Modul, latihan soal, dan 40+ live class TKA wajib dan pilihan") return feature;

  return <>40+ live class TKA wajib dan pilihan</>;
}

function FakePurchaseBubble() {
  const purchase = useActiveFakePurchase();

  return (
    <div className="mt-4 flex justify-center">
      <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-secondary-200 bg-background/95 px-4 py-2 text-xs font-medium text-foreground shadow-sm sm:text-sm">
        <span className="size-2 shrink-0 rounded-full bg-green-500" />
        <span className="truncate">
          {purchase.minutesAgo} menit yang lalu, {purchase.message}
        </span>
      </div>
    </div>
  );
}

export function PricingExtras() {
  return (
    <div className="mt-6">
      <p className="text-center text-xs font-semibold text-foreground sm:text-sm">{PREMIUM_PRICING_COPY.proofStrip}</p>
      <FakePurchaseBubble />
    </div>
  );
}

export function PremiumFeatureList() {
  return (
    <div className="mt-6 rounded-2xl border-2 border-primary-400 bg-primary-300 px-6 py-5">
      <p className="text-sm font-bold text-neutral-100">{PREMIUM_PRICING_COPY.featuresTitle}</p>
      <ul className="mt-3 grid gap-2 md:grid-cols-2">
        {PREMIUM_PRICING_COPY.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-neutral-100">
            <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-background p-0.5 text-secondary-1000">
              <CheckIcon weight="bold" size={12} />
            </span>
            <PricingFeature feature={feature} />
          </li>
        ))}
      </ul>
    </div>
  );
}

type PremiumPackageCardProps = {
  pkg: PremiumPackage;
  isPricePending?: boolean;
  mode?: "marketing" | "checkout";
  isSubscribed?: boolean;
  isPending?: boolean;
  isDisabled?: boolean;
  onSubscribe?: () => void;
  hasInitiatedPurchase?: boolean;
};

const CTA_CLASS_NAME = cn(
  buttonVariants({ variant: "darkBlue", size: "lg" }),
  "h-auto w-full border border-neutral-1000 py-3 text-base font-bold tracking-wide whitespace-normal uppercase",
);

export function PremiumPackageCard({
  pkg,
  isPricePending = false,
  mode = "marketing",
  isSubscribed = false,
  isPending = false,
  isDisabled = false,
  onSubscribe,
  hasInitiatedPurchase = false,
}: PremiumPackageCardProps) {
  const copy = PREMIUM_PACKAGE_COPY[pkg.slug];
  const buttonLabel = isSubscribed
    ? "Kamu sudah berlangganan paket ini!"
    : !pkg.isAvailable
      ? "Paket sudah tidak tersedia"
      : isPending
        ? "Memproses..."
        : copy.cta;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl border-2 border-primary-400 bg-primary-300 shadow-sm">
      <div className="pointer-events-none absolute -right-12 -bottom-20 z-0 size-45 rounded-full border-2 border-primary-500 bg-primary-400" />

      <div className="relative z-10 flex items-center justify-between gap-4 border-b-2 border-neutral-1000 bg-primary-500 px-6 py-4">
        <div>
          <h3 className="text-lg font-bold text-neutral-100">{pkg.name}</h3>
          <p className="text-xs font-medium text-tertiary-100">{copy.tagline}</p>
        </div>
        {pkg.isPromo && (
          <span className="rounded-full bg-secondary-700 px-3 py-1 text-xs font-bold whitespace-nowrap text-neutral-100">
            Promo
          </span>
        )}
      </div>

      <div className="relative z-10 px-6 py-5">
        {pkg.isPromo && (
          <div className="relative inline-block text-base font-bold text-neutral-100">
            {formatRupiah(pkg.normalPrice)}
            <span className="pointer-events-none absolute top-1/2 left-0 h-0.5 w-full -rotate-6 bg-red-400" />
          </div>
        )}
        <div className="flex flex-wrap items-baseline gap-2">
          {isPricePending ? (
            <Skeleton className="h-10 w-40 bg-primary-400" />
          ) : (
            <p className="text-4xl font-black text-secondary-200">{formatRupiah(pkg.currentPrice)}</p>
          )}
          <span className="text-xs text-neutral-100">sekali bayar</span>
        </div>
        <p className="mt-2 text-sm font-bold text-neutral-100">{getAccessLabel(pkg)}</p>
        {pkg.isPromo && (
          <p className="mt-1 text-xs text-tertiary-100">
            Harga promo sampai {formatWibDate(pkg.promoEndsAt)} pukul 23.59 WIB
          </p>
        )}
      </div>

      <div className="relative z-10 mt-auto space-y-3 p-6 pt-0">
        {mode === "checkout" ? (
          <>
            <button
              type="button"
              disabled={isSubscribed || isPending || isDisabled || !pkg.isAvailable}
              onClick={onSubscribe}
              className={cn(
                CTA_CLASS_NAME,
                "cursor-pointer disabled:cursor-default disabled:opacity-70",
                isSubscribed && "text-primary-600 bg-primary-100 opacity-100",
              )}
            >
              {buttonLabel}
            </button>
            {hasInitiatedPurchase && !isSubscribed && (
              <p className="rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-2 text-center text-xs font-semibold text-yellow-800">
                Tunggu 15 Menit — pembayaranmu sedang diproses, status premium akan aktif otomatis setelah
                terkonfirmasi.
              </p>
            )}
          </>
        ) : (
          <Link to="/premium" className={CTA_CLASS_NAME}>
            {copy.cta}
          </Link>
        )}
      </div>
    </div>
  );
}

type PremiumPackageGridProps = {
  mode?: "marketing" | "checkout";
  pendingSlug?: PremiumPackageSlug;
  initiatedSlug?: PremiumPackageSlug;
  isDisabled?: boolean;
  onSubscribe?: (slug: PremiumPackageSlug) => void;
};

export function PremiumPackageGrid({
  mode = "marketing",
  pendingSlug,
  initiatedSlug,
  isDisabled = false,
  onSubscribe,
}: PremiumPackageGridProps) {
  const { packages, isPending } = usePremiumPackages();

  return (
    <div>
      <div className="grid w-full grid-cols-1 items-stretch gap-6 md:grid-cols-2 [&>*]:min-w-0">
        {packages.map((pkg) => (
          <PremiumPackageCard
            key={pkg.slug}
            pkg={pkg}
            isPricePending={isPending}
            mode={mode}
            isPending={pendingSlug === pkg.slug}
            isDisabled={isDisabled}
            onSubscribe={() => onSubscribe?.(pkg.slug)}
            hasInitiatedPurchase={initiatedSlug === pkg.slug}
          />
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-foreground">{PREMIUM_PRICING_COPY.footerNote}</p>
      <PremiumFeatureList />
    </div>
  );
}

export function Pricing() {
  return (
    <div id="paket" className="container mx-auto px-4 md:px-0">
      <div className="flex flex-col items-center gap-6">
        <div className="pointer-events-none relative hidden shrink-0 md:block">
          <div className="absolute bottom-0 left-1/2 size-32 -translate-x-1/2 rounded-full border-2 border-tertiary-300 bg-tertiary-200" />
          <Image
            src="/avatar/premium-pricing-card-avatar.webp"
            alt="Maskot Habitutor"
            width={224}
            height={224}
            className="relative size-44 object-contain select-none"
          />
        </div>

        <MotionScaleIn className="w-full max-w-4xl min-w-0">
          <PremiumPackageGrid />
          <PricingExtras />
        </MotionScaleIn>
      </div>
    </div>
  );
}
