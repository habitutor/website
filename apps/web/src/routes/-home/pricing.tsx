import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  MedalIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DATA } from "./data";

export function Pricing() {
  const { plans } = DATA.pricing;
  const planEntries = Object.values(plans);
  const tryout = Object.values(DATA.pricing_tryout);

  const basicHeaderStyles = [
    "bg-tertiary-100",
    "bg-tertiary-300",
    "bg-tertiary-500",
  ];
  const basicHeaderBorder = [
    "border-tertiary-200",
    "border-tertiary-400",
    "border-tertiary-600",
  ];

  const mobilePlanCards = planEntries.map((plan, index) =>
    index === planEntries.length - 1 ? (
      <PremiumCard key={plan.label} data={plan} />
    ) : (
      <BasicCard
        key={plan.label}
        data={plan}
        headerBg={basicHeaderStyles[index]}
        headerBorder={basicHeaderBorder[index]}
      />
    ),
  );

  const mobileTryoutCards = tryout.map((plan) => (
    <TryOutCard key={plan.label} data={plan} />
  ));

  return (
    <div className="flex py-16 bg-[#FFFCF3] border-2 border-secondary-100">
      <div className="container space-y-11 items-center gap-8 px-4 mx-auto">
        <div className="space-y-2 text-center *:text-pretty">
          <h2 className="font-extrabold text-2xl sm:text-3xl">
            Investasi Cerdas untuk Hasil yang{" "}
            <span className="text-primary-300">Maksimal</span>
          </h2>
          <p className="text-pretty font-medium text-sm md:text-lg">
            Dapatkan materi lengkap plus strategi rahasia dari kakak-kakak TOP
            PTN!
          </p>
        </div>

        {/* Main Plans Section */}
        <div className="w-full">
          <MobileCarousel items={mobilePlanCards} paginationLabel="Paket Belajar" />

          <div className="hidden w-full gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-4">
            {planEntries.map((plan, index) =>
              index === planEntries.length - 1 ? (
                <PremiumCard key={plan.label} data={plan} />
              ) : (
                <BasicCard
                  key={plan.label}
                  data={plan}
                  headerBg={basicHeaderStyles[index]}
                  headerBorder={basicHeaderBorder[index]}
                />
              ),
            )}
          </div>
        </div>

        {/* Paket Try Out Section */}
        <div className="flex w-full flex-col items-center justify-center gap-11">
          <div className="flex h-11 w-full items-center justify-center rounded-2xl border border-[#FEE086] bg-[#FEEAAE] text-center *:text-pretty">
            <h3 className="font-bold text-base">Paket Try Out</h3>
          </div>

          <div className="w-full">
            <MobileCarousel items={mobileTryoutCards} paginationLabel="Paket Try Out" />

            <div className="hidden w-full gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-3">
              {tryout.map((plan) => (
                <TryOutCard key={plan.label} data={plan} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileCarousel({
  items,
  paginationLabel,
}: {
  items: ReactNode[];
  paginationLabel: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalItems = items.length;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalItems - 1;

  const goPrev = () => {
    if (isFirst) return;
    setCurrentIndex((prev) => prev - 1);
  };

  const goNext = () => {
    if (isLast) return;
    setCurrentIndex((prev) => prev + 1);
  };

  useEffect(() => {
    if (currentIndex > totalItems - 1) {
      setCurrentIndex(Math.max(0, totalItems - 1));
    }
  }, [currentIndex, totalItems]);

  if (totalItems === 0) return null;

  return (
    <div className="w-full space-y-4 sm:hidden">
      <div className="relative">
        <button
          type="button"
          onClick={goPrev}
          disabled={isFirst}
          aria-label={`Sebelumnya ${paginationLabel}`}
          className="absolute left-0 top-1/2 z-40 ml-2 flex cursor-pointer -translate-x-1/2 -translate-y-1/2 rounded-lg bg-primary-200 p-2 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-primary-200/80 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeftIcon size={22} />
        </button>

        <button
          type="button"
          onClick={goNext}
          disabled={isLast}
          aria-label={`Selanjutnya ${paginationLabel}`}
          className="absolute right-0 top-1/2 z-40 mr-2 flex cursor-pointer translate-x-1/2 -translate-y-1/2 rounded-lg bg-primary-200 p-2 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-primary-200/80 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowRightIcon size={22} />
        </button>

        <div className="overflow-hidden px-8">
          <motion.div
            className="flex"
            animate={{ x: `-${currentIndex * 100}%` }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.08}
            onDragEnd={(_, info) => {
              const dragThreshold = 50;

              if (info.offset.x <= -dragThreshold && !isLast) {
                goNext();
                return;
              }

              if (info.offset.x >= dragThreshold && !isFirst) {
                goPrev();
              }
            }}
          >
            {items.map((item, index) => (
              <div
                key={`${paginationLabel}-${index}`}
                className="w-full shrink-0 pl-2.5 pr-2.5"
              >
                {item}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        {items.map((_, index) => (
          <button
            key={`${paginationLabel}-dot-${index}`}
            type="button"
            onClick={() => setCurrentIndex(index)}
            aria-label={`${paginationLabel} ${index + 1}`}
            className={cn(
              "h-2.5 w-2.5 rounded-full transition-all duration-200",
              currentIndex === index ? "bg-primary-300" : "bg-primary-100",
            )}
          />
        ))}
      </div>
    </div>
  );
}

function TryOutCard({ data }: { data: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      /* Changed w-full here so it fills the 292px wrapper on mobile and grid cell on desktop */
      className="relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white shadow-sm w-full 2xl:min-w-80 h-[400px]"
    >
      <div className="space-y-2 border-b bg-background p-6">
        <h3 className="font-medium text-sm text-slate-500">{data.label}</h3>
        {data.price && (
          <p className="font-bold text-3xl text-[#4A62A8]">{data.price}</p>
        )}
      </div>
      <ul className="mt-4 space-y-2 px-6 flex-1">
        {data.features.map((feature: string) => (
          <li key={feature} className="flex items-center gap-2 text-sm">
            <div className="flex size-4 items-center justify-center rounded-full bg-[#4A62A8] p-0.5 text-white">
              <CheckIcon weight="bold" />
            </div>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <div className="p-6">
        <Link
          to={data.cta.url as string}
          className={cn(
            buttonVariants({ size: "sm", variant: "outline" }),
            "w-full radius-8 border-[2px] bg-white text-[#24356B] hover:bg-slate-100",
          )}
        >
          {data.cta.label}
          <ArrowRightIcon size={16} weight="bold" />
        </Link>
      </div>
    </motion.div>
  );
}

function BasicCard({
  data,
  headerBg,
  headerBorder,
}: {
  data: any;
  headerBg?: string;
  headerBorder?: string;
}) {
  return (
    <motion.div className="relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm w-full shrink-0 h-131.25">
      <div
        className={cn(
          "absolute -bottom-20 -right-12 size-45 border-2 rounded-full z-0",
          headerBg,
          headerBorder,
        )}
      />
      <div
        className={cn(
          "absolute bottom-13 left-1/2 size-9 -translate-x-1/2 border-2 rounded-full z-0",
          headerBg,
          headerBorder,
        )}
      />
      <div
        className={cn(
          "relative z-10 px-6 py-4 border-2 rounded-t-2xl",
          headerBg,
          headerBorder,
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
            "w-full radius-8 border-2 bg-white text-[#24356B] hover:bg-slate-100",
          )}
        >
          {data.cta.label} <ArrowRightIcon size={16} weight="bold" />
        </Link>
      </div>
    </motion.div>
  );
}

function PremiumCard({ data }: { data: any }) {
  return (
    <motion.div className="relative flex flex-col overflow-hidden rounded-2xl bg-[#3650A2] text-white shadow-lg w-full shrink-0 h-131.25">
      <div className="absolute -bottom-20 -right-12 size-45 rounded-full border-[#151F3F] border-2 bg-[#24356B] z-0" />
      <div className="absolute bottom-13 left-1/2 size-9 -translate-x-1/2 rounded-full border-[#151F3F] border-2 bg-[#24356B] z-0" />
      <div className="relative z-10 px-6 py-4 flex justify-between items-center bg-primary-500 border-2 rounded-t-2xl border-neutral-1000">
        <h3 className="font-bold text-base">{data.label}</h3>
        <span className="rounded-xl bg-[#FEBCC2] px-2 py-0.5 text-[10px] font-medium uppercase text-black">
          Terlengkap!
        </span>
      </div>
      <div className="relative z-10 px-6 py-4 border-2 border-b-0 border-primary-400">
        <div className="relative inline-block font-bold text-base text-white">
          {data.original_price}
          <span className="pointer-events-none absolute top-1/2 left-0 h-0.5 w-full -origin-center -rotate-6 bg-red-400" />
        </div>
        <div className="flex items-baseline gap-1">
          <p className="text-3xl font-black text-[#FEEAAE]">{data.price_now}</p>
          <span className="text-[10px]">sampai SNBT</span>
        </div>
        <p className="text-[12px]">
          promo <span className="font-bold text-[#FFBABA]">hemat 75%</span>{" "}
          sampai 1 Maret
        </p>
        <hr className="mt-4 border-white/10" />
      </div>
      <div className="relative z-10 flex-1 px-6 pb-4 border-x-2 border-primary-400">
        <ul className="space-y-2 mt-4">
          {data.features.map((feature: any) => (
            <li key={feature.label} className="flex items-center gap-2 text-xs">
              <FeatureIcon status={feature.status} premium />
              <span>{feature.label}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="relative z-10 p-6 border-2 border-t-0 border-primary-400">
        <Link
          to={data.cta.url as string}
          className={cn(
            buttonVariants({ size: "sm" }),
            "bg-[#151F3F] border-neutral-1000 w-full text-white font-regular shadow-md",
          )}
        >
          {data.cta.label} <ArrowRightIcon size={16} weight="bold" />
        </Link>
      </div>
    </motion.div>
  );
}

function FeatureIcon({ status, premium }: { status: any; premium?: boolean }) {
  const base =
    "flex size-4 items-center justify-center rounded-full p-0.5 text-white";
  if (status === "included")
    return (
      <div className={cn(base, premium ? "bg-[#1A2855]" : "bg-primary-300")}>
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
    <div className={cn(base, premium ? "bg-[#FF4D4D]" : "bg-neutral-500")}>
      <XIcon weight="bold" />
    </div>
  );
}
