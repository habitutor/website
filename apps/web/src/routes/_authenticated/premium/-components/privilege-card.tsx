import { ArrowRightIcon, CheckIcon, MedalIcon, XIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DATA } from "@/routes/home-premium/-components/data";

interface PrivilegeCardProps {
  variant: "privilege1" | "privilege2";
}

interface PrivilegeFeature {
  label: string;
  status: string;
  value?: string;
}

interface PrivilegePlan {
  label: string;
  price_full: string;
  suffix: string;
  percentage?: string;
  promo_end?: string;
  features: PrivilegeFeature[];
  cta: {
    label: string;
    url: string;
  };
}

const privilegePlans: Record<"privilege1" | "privilege2", PrivilegePlan> = {
  privilege1: DATA.basic.privilege1,
  privilege2: DATA.basic.privilege2,
};

const privilegeColors = {
  privilege1: {
    header: "bg-tertiary-100 border-tertiary-200",
    circle: "bg-tertiary-100 border-tertiary-200",
  },
  privilege2: {
    header: "bg-tertiary-300 border-tertiary-400",
    circle: "bg-tertiary-300 border-tertiary-400",
  },
} as const;

export function PrivilegeCard({ variant }: PrivilegeCardProps) {
  const data = privilegePlans[variant];
  const colors = privilegeColors[variant];

  return (
    <div className="relative flex h-fit min-h-110 w-full flex-col justify-between overflow-hidden rounded-2xl shadow-sm">
      <div className={cn("absolute -right-12 -bottom-20 z-1 size-45 rounded-full border-2", colors.circle)} />
      <div
        className={cn("absolute bottom-13 left-1/2 z-0 size-9 -translate-x-1/2 rounded-full border-2", colors.circle)}
      />

      <div className={cn("relative z-10 rounded-t-2xl border-2 px-6 py-4", colors.header)}>
        <h3 className="text-base font-bold text-neutral-1000">{data.label}</h3>
      </div>

      <div className="relative z-10 border-2 border-b-0 border-neutral-200 px-6 py-4">
        <div className="flex items-baseline gap-1">
          <p className="text-2xl font-bold text-[#3650A2]">{data.price_full}</p>
          <span className="text-[12px]">{data.suffix}</span>
        </div>
        {data.percentage && data.promo_end && (
          <p className="text-[12px] text-neutral-700">
            promo <span className="font-bold text-red-500">hemat {data.percentage}</span> sampai {data.promo_end}
          </p>
        )}
        <hr className="mt-4 border-slate-100" />
      </div>

      <div className="relative z-10 flex-1 border-x-2 border-neutral-200 px-6 pb-4">
        <ul className={cn("mt-2 grid grid-cols-2 gap-2")}>
          {data.features.map((feature) => (
            <li key={feature.label} className="flex items-center gap-2 text-xs">
              <FeatureIcon status={feature.status} />
              <span className={cn(feature.status === "excluded" && "line-through opacity-60")}>{feature.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative z-10 rounded-b-2xl border-2 border-t-0 border-neutral-200 p-6">
        <Link
          to={data.cta.url}
          className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full hover:bg-neutral-200")}
        >
          {data.cta.label} <ArrowRightIcon size={16} weight="bold" />
        </Link>
      </div>
    </div>
  );
}

function FeatureIcon({ status }: { status: string }) {
  const base = "flex size-4 items-center justify-center rounded-full p-0.5 text-white";

  if (status === "included")
    return (
      <div className={cn(base, "bg-primary-300")}>
        <CheckIcon weight="bold" />
      </div>
    );

  if (status === "limited")
    return (
      <div className={cn(base, "bg-secondary-700")}>
        <MedalIcon />
      </div>
    );

  return (
    <div className={cn(base, "bg-neutral-500")}>
      <XIcon weight="bold" />
    </div>
  );
}
