import { CheckIcon, MedalIcon, XIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { DATA } from "@/routes/home-premium/-components/data";

interface BundlingCardProps {
  variant: "premium" | "premium2";
  isCurrentPlan?: boolean;
  isSubscribed?: boolean;
  isPending?: boolean;
  buttonLabel?: string;
  buttonDisabled?: boolean;
  onSubscribe?: (variant: "premium" | "premium2") => void;
}

interface BundlingFeature {
  label: string;
  status: string;
  value?: string;
}

interface BundlingPlan {
  label: string;
  suffix: string;
  price_now: string;
  original_price: string;
  percentage: string;
  promo_end: string;
  features: BundlingFeature[];
  badge?: string;
  cta: {
    label: string;
    url: string;
  };
  price_monthly?: string;
}

const bundlingPlans: Record<"premium" | "premium2", BundlingPlan> = {
  premium: DATA.premium.ultimate_bundling1,
  premium2: DATA.premium.ultimate_bundling2,
};

const bundlingColors = {
  premium: {
    bg: "bg-primary-300 border-primary-400",
    border: "border-primary-400",
    text: "text-neutral-100",
    price: "text-secondary-200",
    header: "bg-primary-500 border-neutral-1000",
    circle: "bg-primary-400 border-primary-500",
    button: "bg-primary-500 hover:bg-primary-600 text-neutral-100 border-neutral-1000",
    checkBadge: "bg-background text-secondary-1000",
    medalBadge: "bg-secondary-700 text-neutral-100",
    divider: "border-primary-100",
  },
  premium2: {
    bg: "bg-secondary-400 border-secondary-600",
    border: "border-secondary-600",
    text: "text-neutral-1000",
    price: "text-neutral-1000",
    header: "bg-secondary-900 border-secondary-1000",
    circle: "bg-secondary-500 border-secondary-600",
    button: "bg-secondary-900 hover:bg-secondary-1000 text-neutral-100 border-neutral-1000",
    checkBadge: "bg-secondary-200 text-secondary-1000",
    medalBadge: "bg-secondary-1000 text-secondary-200",
    divider: "border-neutral-1000",
  },
} as const;

export function BundlingCard({
  variant,
  isCurrentPlan = false,
  isSubscribed = false,
  isPending = false,
  buttonLabel,
  buttonDisabled = false,
  onSubscribe,
}: BundlingCardProps) {
  const data = bundlingPlans[variant];
  const colors = bundlingColors[variant];
  const monthlyPrice = "price_monthly" in data ? data.price_monthly : undefined;
  const displayPrice = data.price_now;
  const defaultButtonLabel = buttonLabel ?? data.cta.label;

  return (
    <div
      className={cn(
        "relative flex h-fit min-h-110 w-full max-w-110 flex-col justify-between overflow-hidden rounded-2xl shadow-sm",
        colors.bg,
      )}
    >
      <div className={cn("absolute -right-12 -bottom-20 z-1 size-45 rounded-full border-2", colors.circle)} />
      <div
        className={cn("absolute bottom-13 left-1/2 z-0 size-9 -translate-x-1/2 rounded-full border-2", colors.circle)}
      />

      {/* Header */}
      <div
        className={cn(
          "relative z-10 flex items-center justify-between rounded-t-2xl border-2 px-6 py-4",
          colors.header,
        )}
      >
        <h3 className="font-bold text-base text-neutral-100">{data.label}</h3>
      </div>

      {/* Price Section */}
      <div className={cn("relative z-10 border-2 border-b-0 px-6 py-4", colors.border)}>
        <div className={cn("relative inline-block font-bold text-base", colors.text)}>
          {data.original_price}
          <span className="pointer-events-none absolute top-1/2 left-0 h-0.5 w-full -origin-center -rotate-6 bg-red-400" />
        </div>
        {monthlyPrice && (
          <div className="mb-1 flex items-baseline gap-1">
            <p className={cn("font-bold text-[16px]", colors.text)}>{monthlyPrice}</p>
            <span className={cn("text-[12px]", colors.text)}>/ bulan</span>
          </div>
        )}
        <div className="flex items-baseline gap-1">
          <p className={cn("font-black text-3xl", colors.price)}>{displayPrice}</p>
          <span className={cn("text-[12px]", colors.text)}>{data.suffix ?? "sampai SNBT"}</span>
        </div>
        <p className={cn("text-[12px]", colors.text)}>
          promo <span className="font-bold">hemat {data.percentage}</span> sampai {data.promo_end}
        </p>
        <hr className={cn("mt-4", colors.divider)} />
      </div>

      {/* Features Section */}
      <div className={cn("relative z-10 flex-1 border-x-2 px-6 py-4", colors.border)}>
        <ul className={cn("mt-2 grid grid-cols-2 gap-2")}>
          {data.features.map((feature) => (
            <li key={feature.label} className="flex items-center gap-2 text-xs">
              <FeatureIcon status={feature.status} variant={variant} />
              <span className={cn(colors.text, feature.status === "excluded" && "line-through opacity-60")}>
                {feature.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Button Section */}
      <div className={cn("relative z-10 rounded-b-2xl border-2 border-t-0 p-6", colors.border)}>
        <TierButton
          variant={variant}
          isCurrentPlan={isCurrentPlan}
          isSubscribed={isSubscribed}
          isPending={isPending}
          buttonLabel={defaultButtonLabel}
          buttonDisabled={buttonDisabled}
          onSubscribe={onSubscribe}
        />
      </div>
    </div>
  );
}

function FeatureIcon({ status, variant }: { status: string; variant: "premium" | "premium2" }) {
  const base = "flex size-4 items-center justify-center rounded-full p-0.5 text-white flex-shrink-0";
  const colors = bundlingColors[variant];

  if (status === "included")
    return (
      <div className={cn(base, colors.checkBadge)}>
        <CheckIcon weight="bold" size={12} />
      </div>
    );

  if (status === "limited")
    return (
      <div className={cn(base, colors.medalBadge)}>
        <MedalIcon size={12} />
      </div>
    );

  return (
    <div className={cn(base, "bg-neutral-400")}>
      <XIcon weight="bold" size={12} />
    </div>
  );
}

function TierButton({
  variant,
  isCurrentPlan,
  isSubscribed,
  isPending,
  buttonLabel,
  buttonDisabled,
  onSubscribe,
}: {
  variant: "premium" | "premium2";
  isCurrentPlan: boolean;
  isSubscribed: boolean;
  isPending: boolean;
  buttonLabel?: string;
  buttonDisabled: boolean;
  onSubscribe?: (variant: "premium" | "premium2") => void;
}) {
  const isDisabled = buttonDisabled || isCurrentPlan || isSubscribed || isPending;

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => {
        if (isDisabled || !onSubscribe) return;
        onSubscribe(variant);
      }}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium text-sm transition-colors",
        isCurrentPlan
          ? variant === "premium2"
            ? "bg-secondary-200 text-secondary-900"
            : "bg-primary-100 text-primary-600"
          : bundlingColors[variant].button, 
      )}
    >
      {isCurrentPlan
        ? variant === "premium2"
          ? "Kamu sudah berlangganan paket ini!"
          : "Kamu sudah berlangganan paket ini!"
        : isPending
          ? "Memproses..."
          : isSubscribed
            ? "Kamu sudah premium"
            : (buttonLabel ?? "Langganan Sekarang")}
    </button>
  );
}
