import { ArrowRightIcon, CheckIcon, MedalIcon, XIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TryOutFeatureStatus = "included" | "limited" | "excluded";

type TryOutFeature = string | { label: string; status: TryOutFeatureStatus };

interface TryOutPricingData {
  label: string;
  price?: string;
  price_full?: string;
  features: readonly TryOutFeature[];
  cta: {
    label: string;
    url: string;
  };
}

export function TryOutCard({ data }: { data: TryOutPricingData }) {
  const displayPrice = data.price_full ?? data.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative flex h-100 w-full flex-col justify-between overflow-hidden rounded-2xl border bg-white shadow-sm 2xl:min-w-80"
    >
      <div className="space-y-2 border-b bg-background p-6">
        <h3 className="text-sm font-medium text-neutral-1000">{data.label}</h3>
        {displayPrice && <p className="text-3xl font-bold text-primary-300">{displayPrice}</p>}
      </div>
      <ul className="mt-4 flex-1 space-y-2 px-6">
        {data.features.map((feature) => {
          const normalizedFeature = normalizeFeature(feature);

          return (
            <li key={normalizedFeature.label} className="flex items-center gap-2 text-sm">
              <TryoutFeatureIcon status={normalizedFeature.status} />
              <span className={cn(normalizedFeature.status === "excluded" && "line-through opacity-60")}>
                {normalizedFeature.label}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="p-6">
        <Link to={data.cta.url as string} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full")}>
          {data.cta.label}
          <ArrowRightIcon size={16} weight="bold" />
        </Link>
      </div>
    </motion.div>
  );
}

function normalizeFeature(feature: TryOutFeature): { label: string; status: TryOutFeatureStatus } {
  if (typeof feature === "string") {
    return { label: feature, status: "included" };
  }

  return feature;
}

function TryoutFeatureIcon({ status }: { status: TryOutFeatureStatus }) {
  const base = "flex size-4 items-center justify-center rounded-full p-0.5 text-white";

  if (status === "limited") {
    return (
      <div className={cn(base, "bg-secondary-700")}>
        <MedalIcon size={12} />
      </div>
    );
  }

  if (status === "excluded") {
    return (
      <div className={cn(base, "bg-neutral-400")}>
        <XIcon weight="bold" size={12} />
      </div>
    );
  }

  return (
    <div className={cn(base, "bg-primary-300")}>
      <CheckIcon weight="bold" />
    </div>
  );
}
