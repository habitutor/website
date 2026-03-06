import {
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { BundlingCard } from "@/components/pricing/bundling-card";
import { cn } from "@/lib/utils";
import { DATA } from "@/routes/home-premium/-components/data";

export function Bundling() {
  const premiumPlans = Object.values(DATA.premium);
  const basicPlans = Object.values(DATA.basic);
  const allPlans = [...premiumPlans, ...basicPlans];

  const premiumColors = [
    {
      bg: "bg-primary-300 border-primary-400",
      border: "border-primary-400",
      text: "text-neutral-100",
      price: "text-secondary-200",
      promo: "text-red-100",
      header: "bg-primary-500 border-neutral-1000",
      circle: "bg-primary-400 border-primary-500",
      button: "bg-primary-500 hover:bg-primary-600 text-neutral-100 border-neutral-1000",
      checkBadge: "bg-background text-secondary-1000",
      medalBadge: "bg-secondary-700 text-neutral-100",
      divider: "border-primary-100",
    },
    {
      bg: "bg-secondary-400 border-secondary-600",
      border: "border-secondary-600",
      text: "text-neutral-1000",
      price: "text-neutral-1000",
      promo: "text-red-500",
      header: "bg-secondary-900 border-secondary-1000",
      circle: "bg-secondary-500 border-secondary-600",
      button: "bg-secondary-900 hover:bg-secondary-1000 text-neutral-100 border-neutral-1000",
      checkBadge: "bg-primary-200",
      medalBadge: "bg-primary-400 text-neutral-100",
      divider: "border-neutral-1000",
    },
  ];

  const basicHeaderStyles = [
    "bg-tertiary-100 border-tertiary-200",
    "bg-tertiary-300 border-tertiary-400",
  ];
  const basicCircleStyles = [
    "bg-tertiary-100 border-tertiary-200",
    "bg-tertiary-300 border-tertiary-400",
  ];

  const mobilePlanCards = allPlans.map((plan, index) =>
    index < 2 ? (
      <BundlingCard key={plan.label} data={plan} variant="premium" span={index === 0} colors={premiumColors[index]} />
    ) : (
      <BundlingCard
        key={plan.label}
        data={plan}
        variant="basic"
        colors={{
          header: basicHeaderStyles[index - 2],
          circle: basicCircleStyles[index - 2],
        }}
      />
    ),
  );

  return (
    <div className="container px-4 md:px-0 space-y-11 items-center gap-8 mx-auto">

      {/* Main Plans Section */}
      <div className="w-full bg-neutral-100 rounded-2xl p-6 border border-neutral-300">
        <MobileCarousel items={mobilePlanCards} paginationLabel="Paket Belajar" />

        <div className="hidden w-full gap-6 sm:flex flex-wrap justify-center">
          {allPlans.map((plan, index) =>
            index < 2 ? (
              <BundlingCard key={plan.label} data={plan} variant="premium" span={index === 0} colors={premiumColors[index]} />
            ) : (
              <BundlingCard
                key={plan.label}
                data={plan}
                variant="basic"
                colors={{
                  header: basicHeaderStyles[index - 2],
                  circle: basicCircleStyles[index - 2],
                }}
              />
            ),
          )}
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

        <div className="overflow-hidden">
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
