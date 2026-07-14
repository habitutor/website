import { CheckIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { MotionScaleIn } from "@/components/motion/motion-components";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveFakePurchase } from "@/lib/fake-recent-purchases";
import { PERINTIS_PRICING_COPY, formatRupiah } from "@/lib/perintis-pricing-copy";
import { cn } from "@/lib/utils";
import { usePerintisPricing } from "./use-perintis-pricing";

type PerintisPricingCardProps = {
  mode?: "marketing" | "checkout";
  isPremium?: boolean;
  isPending?: boolean;
  onSubscribe?: () => void;
  showExtras?: boolean;
  promoCode?: string;
  onPromoCodeChange?: (value: string) => void;
  onValidatePromo?: () => void;
  promoFeedback?: { valid: boolean; message: string; discountedPrice?: number };
  isPromoValidating?: boolean;
};

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

export function PerintisPricingCard({
  mode = "marketing",
  isPremium = false,
  isPending = false,
  onSubscribe,
  showExtras = true,
  promoCode = "",
  onPromoCodeChange,
  onValidatePromo,
  promoFeedback,
  isPromoValidating = false,
}: PerintisPricingCardProps) {
  const copy = PERINTIS_PRICING_COPY;
  const pricing = usePerintisPricing();

  const buttonLabel = isPremium ? "Kamu sudah berlangganan paket ini!" : isPending ? "Memproses..." : copy.ctaLabel;

  const urgencyText = pricing.isEarlyBird ? copy.urgencyEarlyBird(pricing.regularPrice) : copy.urgencyRegular;

  return (
    <div className="w-full">
      <div className="relative flex w-full flex-col overflow-hidden rounded-2xl border-2 border-primary-400 bg-primary-300 shadow-sm">
        <div className="pointer-events-none absolute -right-12 -bottom-20 z-0 size-45 rounded-full border-2 border-primary-500 bg-primary-400" />
        <div className="pointer-events-none absolute top-24 -left-10 z-0 size-24 rounded-full border-2 border-primary-500 bg-primary-400" />

        <div className="relative z-10 flex items-center justify-between gap-4 border-b-2 border-neutral-1000 bg-primary-500 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-neutral-100">{copy.label}</h3>
            <p className="text-xs font-medium text-tertiary-100">{copy.suffix}</p>
          </div>
          <span className="rounded-full bg-secondary-700 px-3 py-1 text-xs font-bold whitespace-nowrap text-neutral-100">
            Satu-satunya paket
          </span>
        </div>

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
            <span className="text-xs text-neutral-100">{copy.priceSuffix}</span>
          </div>
          <p className="mt-1 text-xs text-red-100">{urgencyText}</p>
          <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-neutral-100">{copy.comparison}</p>
          <hr className="mt-4 border-primary-100" />
        </div>

        <div className="relative z-10 px-6 pb-5">
          <ul className="grid gap-2">
            {copy.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-neutral-100">
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-background p-0.5 text-secondary-1000">
                  <CheckIcon weight="bold" size={12} />
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 space-y-3 p-6 pt-0">
          {mode === "checkout" ? (
            <>
              <div className="space-y-1">
                <div className="flex gap-2">
                  <input
                    value={promoCode}
                    onChange={(event) => onPromoCodeChange?.(event.target.value.toUpperCase())}
                    placeholder="Kode promo"
                    aria-label="Kode promo"
                    className="min-w-0 flex-1 rounded-lg border border-neutral-1000 bg-background px-3 py-2 text-sm text-foreground uppercase"
                  />
                  <button
                    type="button"
                    disabled={!promoCode.trim() || isPromoValidating}
                    onClick={onValidatePromo}
                    className="rounded-lg border border-neutral-1000 bg-secondary-200 px-4 py-2 text-sm font-bold text-neutral-1000 disabled:opacity-60"
                  >
                    {isPromoValidating ? "Cek..." : "Pakai"}
                  </button>
                </div>
                {promoFeedback && (
                  <p className={cn("text-xs", promoFeedback.valid ? "text-green-100" : "text-red-100")}>
                    {promoFeedback.message}
                    {promoFeedback.valid && promoFeedback.discountedPrice !== undefined
                      ? ` Harga akhir ${formatRupiah(promoFeedback.discountedPrice)}.`
                      : ""}
                  </p>
                )}
              </div>
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
            </>
          ) : (
            <Link
              to="/premium"
              className={cn(
                buttonVariants({ variant: "darkBlue", size: "lg" }),
                "hover:bg-primary-600 w-full border border-neutral-1000 text-base font-bold tracking-wide uppercase",
              )}
            >
              {copy.ctaLabel}
            </Link>
          )}
          <p className="text-center text-xs text-tertiary-100">{copy.footerNote}</p>
        </div>
      </div>

      {showExtras && (
        <>
          <p className="mt-4 text-center text-xs font-semibold text-foreground sm:text-sm">{copy.proofStrip}</p>
          <FakePurchaseBubble />
        </>
      )}
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
