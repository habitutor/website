import { CalendarBlankIcon, CaretDownIcon, CheckIcon, SpinnerIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { motion } from "motion/react";
import { MotionFadeUp, MotionScaleIn } from "@/components/motion/motion-components";
import { buttonVariants } from "@/components/ui/button";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveFakePurchase } from "@/lib/fake-recent-purchases";
import {
  MANDIRI_PACKAGE_EXTRAS,
  PREMIUM_PACKAGE_COPY,
  PREMIUM_PRICING_COPY,
  type PremiumPackage,
  type PremiumPackageSlug,
  formatRupiah,
  formatWibDate,
  getAccessLabel,
} from "@/lib/premium-packages";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/routes/-home/motion-bits";
import { usePremiumPackages } from "./use-premium-packages";

function CheckBadge() {
  return (
    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-sr-sun-500 text-sr-ink shadow-sr-1 transition-transform duration-300 ease-sr-spring group-hover/feature:scale-125 group-hover/feature:rotate-12">
      <CheckIcon weight="bold" size={12} />
    </span>
  );
}

function PricingFeature({ feature }: { feature: string }) {
  if (feature !== "TKA INTENSIF — Modul, latihan soal, dan 40+ live class TKA wajib dan pilihan") return feature;

  return <>40+ live class TKA wajib dan pilihan</>;
}

function FakePurchaseBubble() {
  const purchase = useActiveFakePurchase();

  return (
    <div className="mt-4 flex justify-center">
      <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-sr-sun-200 bg-sr-sun-100 px-4 py-2 text-xs font-medium text-sr-ink shadow-sr-1 sm:text-sm">
        <span className="size-2 shrink-0 animate-pulse rounded-full bg-sr-live" />
        <span className="truncate">
          {purchase.minutesAgo} menit yang lalu, {purchase.message}
        </span>
      </div>
    </div>
  );
}

const MARKER =
  "bg-[linear-gradient(transparent_62%,var(--color-sr-sun-400)_62%,var(--color-sr-sun-400)_90%,transparent_90%)] px-0.5 font-extrabold";

// Angka di teks (60% dan 2x) diberi stabilo kuning; persen dihitung naik saat terlihat. Teksnya tidak diubah.
function ProofStrip({ text }: { text: string }) {
  return (
    <p className="mx-auto max-w-2xl animate-sr-rise rounded-sr-md border border-sr-sun-200 bg-linear-to-r from-sr-sun-100 via-white to-sr-sun-100 px-5 py-3 text-center text-sm font-semibold text-sr-ink shadow-sr-1 sm:text-base">
      {text.split(/(\d+%|\d+x)/).map((part, i) =>
        /^\d+%$/.test(part) ? (
          <span key={i} className={MARKER}>
            <NumberTicker value={Number.parseInt(part, 10)} />%
          </span>
        ) : /^\d+x$/.test(part) ? (
          <span key={i} className={MARKER}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </p>
  );
}

export function PricingExtras() {
  return (
    <div className="mt-6">
      <ProofStrip text={PREMIUM_PRICING_COPY.proofStrip} />
      <FakePurchaseBubble />
    </div>
  );
}

export function PremiumFeatureList() {
  return (
    <MotionFadeUp className="mt-6 rounded-sr-lg border border-sr-line bg-white px-6 py-6 shadow-sr-1">
      <p className="text-sm font-extrabold text-sr-ink">{PREMIUM_PRICING_COPY.featuresTitle}</p>
      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {PREMIUM_PRICING_COPY.features.map((feature) => (
          <li
            key={feature}
            className="group/feature -mx-3 flex items-start gap-3 rounded-sr-sm px-3 py-2 text-sm font-medium text-sr-ink-2 transition-all duration-300 ease-sr hover:translate-x-1 hover:bg-sr-blue-50 hover:text-sr-ink"
          >
            <CheckBadge />
            <PricingFeature feature={feature} />
          </li>
        ))}
      </ul>
    </MotionFadeUp>
  );
}

function MandiriExtras() {
  const { summary, exams, facilities } = MANDIRI_PACKAGE_EXTRAS;

  return (
    <div className="relative z-10 space-y-3 px-6 pb-5">
      <p className="text-sm text-white/90">{summary}</p>
      <ul className="flex flex-wrap gap-1.5" aria-label="Kampus ujian mandiri">
        {exams.map(({ campus }) => (
          <li
            key={campus}
            className="rounded-full border border-white/25 bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white"
          >
            {campus}
          </li>
        ))}
        <li className="rounded-full px-1 py-0.5 text-xs font-semibold text-sr-sun-200">+ PTN lainnya</li>
      </ul>

      <details className="group overflow-hidden rounded-sr-sm border border-white/25 bg-white/10 transition-colors hover:bg-white/15">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-bold text-white [&::-webkit-details-marker]:hidden">
          Lihat fasilitas khusus Mandiri
          <CaretDownIcon weight="bold" className="size-4 shrink-0 transition-transform group-open:rotate-180" />
        </summary>
        <div className="space-y-4 px-4 pb-4 group-open:animate-sr-rise">
          <div>
            <p className="text-xs font-semibold tracking-wide text-sr-sun-200 uppercase">Ujian mandiri</p>
            <ul className="mt-2 grid gap-1 text-sm text-white sm:grid-cols-2">
              {exams.map(({ campus, exam }) => (
                <li key={campus}>
                  <span className="font-semibold">{campus}</span> · {exam}
                </li>
              ))}
              <li>dan PTN lainnya</li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wide text-sr-sun-200 uppercase">Fasilitas Mandiri</p>
            <ul className="mt-2 grid gap-2">
              {facilities.map((facility) => (
                <li key={facility} className="flex items-start gap-3 text-sm text-white">
                  <CheckBadge />
                  {facility}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </details>
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
  buttonVariants({ variant: "secondary", size: "lg" }),
  "sr-sheen h-auto w-full py-3 text-center text-base font-extrabold whitespace-normal active:shadow-[inset_0_3px_8px_rgb(0_0_0/0.22)]",
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
    <div className="relative h-full w-full pt-3">
      {pkg.isPromo && (
        <span className="absolute top-0 right-6 z-20 rounded-full border border-sr-sun-200 bg-sr-sun-100 px-3 py-1 text-xs font-extrabold whitespace-nowrap text-sr-amber-700 shadow-sr-1">
          Promo
        </span>
      )}
      <div
        className={cn(
          "relative flex h-full w-full flex-col overflow-hidden rounded-sr-lg sr-card-blue",
          pkg.isAvailable ? "sr-lift" : "opacity-85 saturate-50",
          isSubscribed && "ring-2 ring-sr-sun-500 ring-offset-2 ring-offset-sr-ivory",
        )}
      >
        <div className="pointer-events-none absolute -top-16 -right-12 z-0 size-48 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -right-12 -bottom-20 z-0 size-45 rounded-full bg-white/5" />

        <div className="relative z-10 px-6 pt-6">
          <h3 className="text-lg font-extrabold text-sr-sun-200">{pkg.name}</h3>
          <p className="text-xs font-medium text-white/80">{copy.tagline}</p>
        </div>

        <div className="relative z-10 px-6 py-5">
          {pkg.isPromo && (
            <div className="relative inline-block text-base font-bold text-white/70">
              {formatRupiah(pkg.normalPrice)}
              <span className="pointer-events-none absolute top-1/2 left-0 h-0.5 w-full -rotate-6 bg-sr-orange-500" />
            </div>
          )}
          <div className="flex flex-wrap items-baseline gap-2">
            {isPricePending ? (
              <Skeleton className="h-12 w-44 bg-white/20" />
            ) : (
              <p className="text-4xl font-black tracking-tight text-sr-sun-200 sm:text-5xl">
                {formatRupiah(pkg.currentPrice)}
              </p>
            )}
            <span className="text-xs text-white/80">/ sekali bayar</span>
          </div>
          <div className="mt-4 flex items-start gap-3 rounded-sr-sm border border-white/25 bg-white/10 px-4 py-3">
            <CalendarBlankIcon size={22} weight="duotone" className="mt-0.5 shrink-0 text-sr-sun-200" />
            <p className="text-sm font-bold text-white">{getAccessLabel(pkg)}</p>
          </div>
          {pkg.isPromo && (
            <p className="mt-2 text-xs text-white/75">
              Harga promo sampai {formatWibDate(pkg.promoEndsAt)} pukul 23.59 WIB
            </p>
          )}
        </div>

        {pkg.slug === "paketmandiri2027" && <MandiriExtras />}

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
                  isSubscribed && "bg-white/20 bg-none text-white opacity-100 shadow-none",
                  isPending && "opacity-100",
                )}
              >
                {isPending && <SpinnerIcon weight="bold" className="size-5 animate-spin" />}
                {buttonLabel}
              </button>
              {hasInitiatedPurchase && !isSubscribed && (
                <p className="rounded-lg border border-sr-sun-400 bg-sr-sun-100 px-3 py-2 text-center text-xs font-semibold text-sr-amber-700">
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
        {packages.map((pkg, index) => (
          <motion.div
            key={pkg.slug}
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: index * 0.12, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <PremiumPackageCard
              pkg={pkg}
              isPricePending={isPending}
              mode={mode}
              isPending={pendingSlug === pkg.slug}
              isDisabled={isDisabled}
              onSubscribe={() => onSubscribe?.(pkg.slug)}
              hasInitiatedPurchase={initiatedSlug === pkg.slug}
            />
          </motion.div>
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-sr-muted">{PREMIUM_PRICING_COPY.footerNote}</p>
      <PremiumFeatureList />
    </div>
  );
}

export function Pricing() {
  return (
    <div id="paket" className="container mx-auto scroll-mt-24 px-4 md:px-0">
      <div className="flex flex-col items-center gap-6">
        <div className="pointer-events-none relative hidden shrink-0 md:block">
          <div className="absolute bottom-0 left-1/2 size-32 -translate-x-1/2 animate-sr-halo rounded-full bg-sr-sun-200" />
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 220, damping: 14 }}
          >
            <Image
              src="/avatar/premium-pricing-card-avatar.webp"
              alt="Maskot Habitutor"
              width={224}
              height={224}
              className="relative size-44 animate-sr-drift object-contain drop-shadow-[0_14px_14px_rgba(20,34,78,0.2)] select-none"
            />
          </motion.div>
        </div>

        <SectionHeading
          eyebrow="Pilih Paket"
          title={
            <>
              Pilih Paket yang <span className="font-sr-serif text-sr-blue-600 italic">Pas Buat Lo</span>
            </>
          }
          description="Bandingin isi dan masa aktifnya, terus pilih yang paling cocok buat target lo."
        />

        <MotionScaleIn className="w-full max-w-4xl min-w-0">
          <PremiumPackageGrid />
          <PricingExtras />
        </MotionScaleIn>
      </div>
    </div>
  );
}
