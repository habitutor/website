import { ArrowRightIcon, CheckIcon, MedalIcon, XIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BundlingCardProps {
  data: any;
  variant: "basic" | "premium";
  span?: boolean;
  colors?: {
    bg?: string;
    border?: string;
    text?: string;
    price?: string;
    promo?: string;
    header?: string;
    circle?: string;
    button?: string;
    checkBadge?: string;
    limitedBadge?: string;
    medalBadge?: string;
    divider?: string;
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
      promo: "",
      header: "bg-primary-500 border-neutral-1000",
      circle: "bg-primary-400 border-primary-500",
      button: "bg-primary-500 hover:bg-primary-600 text-white",
      checkBadge: "bg-secondary-200",
      medalBadge: "bg-secondary-700",
      divider: "border-white",
    };

    const premiumColors = { ...defaultPremiumColors, ...colors };

    return (
      <motion.div className={cn("relative flex flex-col overflow-hidden rounded-2xl shadow-lg w-full max-w-110 md:max-w-70 shrink-0 h-131.25", premiumColors.bg, premiumColors.text)}>
        <div className={cn("absolute -bottom-20 -right-12 size-45 rounded-full border-2 z-1", premiumColors.circle)} />
        <div className={cn("absolute bottom-13 left-1/2 size-9 -translate-x-1/2 rounded-full border-2 z-1", premiumColors.circle)} />
        <div className={cn("relative z-10 px-6 py-4 flex justify-between text-neutral-100 items-center border-2 rounded-t-2xl", premiumColors.header)}>
          <h3 className="font-bold text-base">{data.label}</h3>
          {span && (
            <span className="rounded-xl bg-red-100 px-2 py-0.5 text-[10px] font-medium uppercase text-black">
              Terlengkap!
            </span>
          )}
        </div>
        <div className={cn("relative z-10 px-6 py-4 border-2 border-b-0", premiumColors.border)}>
          <div className={cn("relative inline-block font-bold text-base", premiumColors.text)}>
            {data.original_price}
            <span className="pointer-events-none absolute top-1/2 left-0 h-0.5 w-full -origin-center -rotate-6 bg-red-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <p className={cn("text-3xl font-black", premiumColors.price)}>{data.price_now}</p>
            <span className="text-[10px] whitespace-nowrap">sampai SNBT</span>
          </div>
          <p className={cn("text-[12px]")}>
            promo <span className={cn("font-bold", premiumColors.promo)}>hemat {data.percentage}</span>{" "}
            sampai {data.promo_end}
          </p>
          <hr className={cn("mt-4", premiumColors.divider)} />
        </div>
        <div className={cn("relative z-10 flex-1 px-6 pb-4 border-x-2", premiumColors.border)}>
          <ul className="space-y-2 mt-4">
            {data.features.map((feature: any) => (
              <li key={feature.label} className="flex items-center gap-2 text-xs">
                <FeatureIcon status={feature.status} premium colors={premiumColors} />
                <span>{feature.label}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={cn("relative z-10 p-6 border-2 border-t-0", premiumColors.border)}>
          <Link
            to={data.cta.url as string}
            className={cn(
              buttonVariants({ size: "sm" }),
              "w-full border", premiumColors.button
            )}
          >
            {data.cta.label} <ArrowRightIcon size={16} weight="bold" />
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm w-full max-w-110 md:max-w-70 shrink-0 h-131.25">
      <div
        className={cn(
          "absolute -bottom-20 -right-12 size-45 rounded-full z-1 border-2",
          colors?.circle,
        )}
      />
      <div
        className={cn(
          "absolute bottom-13 left-1/2 size-9 -translate-x-1/2 rounded-full z-0 border-2",
          colors?.circle,
        )}
      />
      <div
        className={cn(
          "relative z-10 px-6 py-4 border-2 rounded-t-2xl",
          colors?.header,
        )}
      >
        <h3 className="font-bold text-base text-neutral-1000">{data.label}</h3>
      </div>
      <div className="relative z-10 px-6 py-4 border-2 border-b-0 border-neutral-200">
        {data.price_monthly && (
          <div className="flex items-baseline gap-1">
            <p className="font-bold text-[16px]">{data.price_monthly}</p>
            <span className="font-regular text-[12px]">/ bulan</span>
          </div>
        )}
        <div className="flex items-baseline gap-1">
          <p className="text-2xl font-bold text-[#3650A2]">{data.price_full}</p>
          <span className="text-[12px]">sampai SNBT</span>
        </div>
        <hr className="mt-4 border-slate-100" />
      </div>
      <div className="relative z-10 flex-1 px-6 pb-4 border-x-2 border-neutral-200">
        <ul className="space-y-2 mt-2">
          {data.features.map((feature: any) => (
            <li key={feature.label} className="flex items-center gap-2 text-xs">
              <FeatureIcon status={feature.status} />
              <span
                className={cn(
                  feature.status === "excluded" && "text-neutral-1000",
                )}
              >
                {feature.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="relative z-10 p-6 border-2 border-t-0 border-neutral-200 rounded-b-2xl">
        <Link
          to={data.cta.url as string}
          className={cn(
            buttonVariants({ size: "sm", variant: "outline" }),
            "w-full hover:bg-neutral-200",
          )}
        >
          {data.cta.label} <ArrowRightIcon size={16} weight="bold" />
        </Link>
      </div>
    </motion.div>
  );
}

function FeatureIcon({ status, premium, colors }: { status: any; premium?: boolean; colors?: any }) {
  const base =
    "flex size-4 items-center justify-center rounded-full p-0.5 text-white";
  if (status === "included")
    return (
      <div className={cn(base, premium && colors?.checkBadge ? colors.checkBadge : premium ? "bg-[#1A2855]" : "bg-primary-300")}>
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