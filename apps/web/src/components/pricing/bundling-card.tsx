import { ArrowRightIcon, CheckIcon, MedalIcon, XIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PricingFeature {
  label: string;
  status: string;
}

interface PricingData {
  label: string;
  original_price?: string;
  price_now?: string;
  price_monthly?: string;
  price_full?: string;
  features: readonly PricingFeature[];
  cta: {
    label: string;
    url: string;
  };
}

interface BundlingCardProps {
  data: PricingData;
  variant: "basic" | "premium";
  span?: boolean;
  colors?: {
    bg?: string;
    text?: string;
    price?: string;
    header?: string;
    circle?: string;
    button?: string;
    checkBadge?: string;
    limitedBadge?: string;
    medalBadge?: string;
  };
}

export function BundlingCard({ data, variant, span, colors }: BundlingCardProps) {
  const isPremium = variant === "premium";

  if (isPremium) {
    // Default colors for premium
    const defaultPremiumColors = {
      bg: "bg-primary-300",
      text: "text-white",
      price: "text-white",
      header: "bg-primary-500 border-neutral-1000",
      circle: "bg-primary-400 border-primary-500",
      button: "bg-primary-500 hover:bg-primary-600 text-white",
      checkBadge: "bg-secondary-200",
      medalBadge: "bg-secondary-700",
    };

    const premiumColors = { ...defaultPremiumColors, ...colors };

    return (
      <motion.div
        className={cn(
          "relative flex h-131.25 w-full shrink-0 flex-col overflow-hidden rounded-2xl shadow-lg",
          premiumColors.bg,
          premiumColors.text,
        )}
      >
        <div className={cn("absolute -right-12 -bottom-20 z-0 size-45 rounded-full border-2", premiumColors.circle)} />
        <div
          className={cn(
            "absolute bottom-13 left-1/2 z-0 size-9 -translate-x-1/2 rounded-full border-2",
            premiumColors.circle,
          )}
        />
        <div
          className={cn(
            "relative z-10 flex items-center justify-between rounded-t-2xl border-2 px-6 py-4",
            premiumColors.header,
          )}
        >
          <h3 className="text-base font-bold">{data.label}</h3>
          {span && (
            <span className="rounded-xl bg-red-100 px-2 py-0.5 text-[10px] font-medium text-black uppercase">
              Terlengkap!
            </span>
          )}
        </div>
        <div className="relative z-10 border-2 border-b-0 border-primary-400 px-6 py-4">
          <div className={cn("relative inline-block text-base font-bold", premiumColors.price)}>
            {data.original_price}
            <span className="-origin-center pointer-events-none absolute top-1/2 left-0 h-0.5 w-full -rotate-6 bg-red-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-black text-[#FEEAAE]">{data.price_now}</p>
            <span className="text-[10px]">sampai SNBT</span>
          </div>
          <p className="text-[12px]">
            promo <span className="font-bold text-[#FFBABA]">hemat 75%</span> sampai 1 Mei
          </p>
          <hr className="mt-4 border-white/10" />
        </div>
        <div className={cn("relative z-10 flex-1 border-x-2 border-primary-400 px-6 pb-4", premiumColors.bg)}>
          <ul className="mt-4 space-y-2">
            {data.features.map((feature: PricingFeature) => (
              <li key={feature.label} className="flex items-center gap-2 text-xs">
                <FeatureIcon status={feature.status} premium colors={premiumColors} />
                <span>{feature.label}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative z-10 border-2 border-t-0 border-primary-400 p-6">
          <Link
            to={data.cta.url as string}
            className={cn(buttonVariants({ size: "sm" }), "w-full", premiumColors.button)}
          >
            {data.cta.label} <ArrowRightIcon size={16} weight="bold" />
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="relative flex h-131.25 w-full shrink-0 flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className={cn("absolute -right-12 -bottom-20 z-0 size-45 rounded-full border-2", colors?.circle)} />
      <div
        className={cn("absolute bottom-13 left-1/2 z-0 size-9 -translate-x-1/2 rounded-full border-2", colors?.circle)}
      />
      <div className={cn("relative z-10 rounded-t-2xl border-2 px-6 py-4", colors?.header)}>
        <h3 className="text-base font-bold text-neutral-1000">{data.label}</h3>
      </div>
      <div className="relative z-10 border-2 border-b-0 border-neutral-200 px-6 py-4">
        {data.price_monthly && (
          <div className="flex items-baseline gap-1">
            <p className="text-[16px] font-bold">{data.price_monthly}</p>
            <span className="font-regular text-[12px]">/ bulan</span>
          </div>
        )}
        <div className="flex items-baseline gap-1">
          <p className="text-2xl font-bold text-[#3650A2]">{data.price_full}</p>
          <span className="text-[12px]">sampai SNBT</span>
        </div>
        <hr className="mt-4 border-slate-100" />
      </div>
      <div className="relative z-10 flex-1 border-x-2 border-neutral-200 px-6 pb-4">
        <ul className="mt-2 space-y-2">
          {data.features.map((feature: PricingFeature) => (
            <li key={feature.label} className="flex items-center gap-2 text-xs">
              <FeatureIcon status={feature.status} />
              <span className={cn(feature.status === "excluded" && "text-neutral-1000")}>{feature.label}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="relative z-10 rounded-b-2xl border-2 border-t-0 border-neutral-200 p-6">
        <Link
          to={data.cta.url as string}
          className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full hover:bg-neutral-200")}
        >
          {data.cta.label} <ArrowRightIcon size={16} weight="bold" />
        </Link>
      </div>
    </motion.div>
  );
}

function FeatureIcon({
  status,
  premium,
  colors,
}: {
  status: string;
  premium?: boolean;
  colors?: BundlingCardProps["colors"];
}) {
  const base = "flex size-4 items-center justify-center rounded-full p-0.5 text-white";
  if (status === "included")
    return (
      <div
        className={cn(
          base,
          premium && colors?.checkBadge ? colors.checkBadge : premium ? "bg-[#1A2855]" : "bg-primary-300",
        )}
      >
        <CheckIcon weight="bold" />
      </div>
    );
  if (status === "limited")
    return (
      <div className={cn(base, premium && colors?.medalBadge ? colors.medalBadge : "bg-secondary-700")}>
        <MedalIcon />
      </div>
    );
  return (
    <div className={cn(base, premium ? "bg-[#FF4D4D]" : "bg-neutral-500")}>
      <XIcon weight="bold" />
    </div>
  );
}
