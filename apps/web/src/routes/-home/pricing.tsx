import {
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { BundlingCard } from "@/components/pricing/bundling-card";
import { TryOutCard } from "@/components/pricing/tryout-card";
import { cn } from "@/lib/utils";
import { DATA } from "./data";

export function Pricing() {
  const { plans } = DATA.pricing;
  const planEntries = Object.values(plans);
  const tryout = Object.values(DATA.pricing_tryout);

  const basicHeaderStyles = [
    "bg-tertiary-100 border-tertiary-200",
    "bg-tertiary-300 border-tertiary-400",
    "bg-tertiary-500 border-tertiary-600",
  ];
  const basicCircleStyles = [
    "bg-tertiary-100 border-tertiary-200",
    "bg-tertiary-300 border-tertiary-400",
    "bg-tertiary-500 border-tertiary-600",
  ];

  const mobilePlanCards = planEntries.map((plan, index) =>
    index === planEntries.length - 1 ? (
      <BundlingCard key={plan.label} data={plan} variant="premium" span colors={{
        bg: "bg-primary-300",
        text: "text-neutral-100",
        price: "text-neutral-100",
        header: "bg-primary-500 border-neutral-1000",
        circle: "bg-primary-400 border-primary-500",
        button: "bg-primary-500 hover:bg-primary-600 text-neutral-100",
        checkBadge: "bg-secondary-200",
        medalBadge: "bg-secondary-700 text-neutral-100",
      }} />
    ) : (
      <BundlingCard
        key={plan.label}
        data={plan}
        variant="basic"
        colors={{
          header: basicHeaderStyles[index],
          circle: basicCircleStyles[index],
        }}
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
                <BundlingCard key={plan.label} data={plan} variant="premium" span colors={{
                  bg: "bg-primary-300",
                  text: "text-neutral-100",
                  price: "text-neutral-100",
                  header: "bg-primary-500 border-neutral-1000",
                  circle: "bg-primary-400 border-primary-500",
                  button: "bg-primary-500 hover:bg-primary-600 text-neutral-100",
                  checkBadge: "bg-secondary-200",
                  medalBadge: "bg-secondary-700 text-neutral-100",
                }} />
              ) : (
                <BundlingCard
                  key={plan.label}
                  data={plan}
                  variant="basic"
                  colors={{
                    header: basicHeaderStyles[index],
                    circle: basicCircleStyles[index],
                  }}
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

