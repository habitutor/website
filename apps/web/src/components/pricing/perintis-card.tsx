import { ArrowRightIcon, CheckIcon, MedalIcon, XIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PerintisCardProps {
  data: any;
  colors?: {
    bg?: string;
    border?: string;
  };
}

export function PerintisCard({ data, colors }: PerintisCardProps) {
  const defaultColors = {
    bg: "bg-blue-100",
    border: "border-blue-200",
  };

  const cardColors = { ...defaultColors, ...colors };

  return (
    <motion.div
      className={cn(
        "relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white shadow-sm w-full max-w-110 min-h-110 h-fit",
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      {/* Decorative circles */}
      <div
        className={cn(
          "absolute -bottom-20 -right-12 size-45 rounded-full border-2 z-1",
          cardColors.bg,
          cardColors.border
        )}
      />
      <div
        className={cn(
          "absolute bottom-13 left-1/2 size-9 -translate-x-1/2 rounded-full z-0", cardColors.bg
        )}
      />

      {/* Header */}
      <div className={cn("relative z-10 px-6 py-4 border-2 rounded-t-2xl text-neutral-1000", cardColors.bg, cardColors.border)}>
        <h3 className="font-bold text-base text-neutral-1000">{data.label}</h3>
      </div>

      {/* Price Section */}
      <div className="border-2 border-b-0 relative z-10 px-6 py-4">
        {data.price_monthly && (
          <div className="flex items-baseline gap-1 mb-1">
            <p className={cn("font-bold text-[16px] text-neutral-1000")}>{data.price_monthly}</p>
            <span className="text-[12px]">/ bulan</span>
          </div>
        )}
        <div className="flex items-baseline gap-1">
          <p className="text-3xl font-black text-primary-300">{data.price_full}</p>
          <span className="text-[12px] text-neutral-1000">sampai SNBT</span>
        </div>
        <hr className="mt-4 border-neutral-200" />
      </div>

      {/* Features Section */}
      <div className="relative z-10 flex-1 px-6 py-4 border-x-2">
        <ul className={cn(
          "mt-2 grid grid-cols-2 gap-2"
        )}>
          {data.features.map((feature: any) => (
            <li key={feature.label} className="flex items-center gap-2 text-xs">
              <FeatureIcon status={feature.status} colors={cardColors} />
              <span
                className={cn(
                  "text-neutral-1000",
                  feature.status === "excluded" && "line-through opacity-60"
                )}
              >
                {feature.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Button Section */}
      <div className="relative z-10 p-6 border-2 border-t-0 rounded-b-2xl border-neutral-200">
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

function FeatureIcon({ status, colors }: { status: any; colors?: any }) {
  const base =
    "flex size-4 items-center justify-center rounded-full p-0.5 text-white flex-shrink-0";

  if (status === "included")
    return (
      <div className={cn(base, colors?.checkBadge || "bg-primary-300")}>
        <CheckIcon weight="bold" size={12} />
      </div>
    );

  if (status === "limited")
    return (
      <div className={cn(base, colors?.limitedBadge || "bg-secondary-700")}>
        <MedalIcon size={12} />
      </div>
    );

  return (
    <div className={cn(base, "bg-neutral-400")}>
      <XIcon weight="bold" size={12} />
    </div>
  );
}