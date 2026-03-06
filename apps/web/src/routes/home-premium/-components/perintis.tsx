import {
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { PerintisCard } from "@/components/pricing/perintis-card";
import { cn } from "@/lib/utils";
import { DATA } from "@/routes/home-premium/data";

export function Perintis() {
  const perintisPlans = Object.values(DATA.perintis);
  const classroomPlans = [DATA.classroom];
  const allPlans = [...perintisPlans, ...classroomPlans];

  const colors = [
    {
      bg: "bg-tertiary-100",
      border: "border-tertiary-200",
    },
    {
      bg: "bg-secondary-100 border-secondary-200",
      border: "border-secondary-600",
    },
    {
      bg: "bg-[#C5F5DC]",
      border: "border-fourtiary-100",
    },
  ];

  const mobilePlanCards = allPlans.map((plan, index) =>
    <PerintisCard key={plan.label} data={plan} colors={colors[index]} />
  );

  return (
    <div className="container px-4 md:px-0 space-y-6 items-center gap-8 mx-auto">

      <div className="flex flex-col items-center justify-end h-full z-10 relative">
        <p className="text-lg md:text-2xl font-bold text-center">Ultimate Bundling & Privilege</p>
        <p className="text-sm md:text-lg text-center">Paket yang paling worth it, Paling lengkap dan murah!!</p>
      </div>
      {/* Main Plans Section */}
      <div className="w-full bg-neutral-100 rounded-2xl p-6 border border-neutral-300">
        <MobileCarousel items={mobilePlanCards} paginationLabel="Paket Belajar" />

        <div className="hidden w-full gap-6 lg:grid lg:grid-cols-3 md:flex md:flex-wrap justify-center">
          {allPlans.map((plan, index) =>
            <PerintisCard key={plan.label} data={plan} colors={colors[index]} />
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

