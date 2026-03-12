import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import * as m from "motion/react-m";
import { isValidElement, type ReactNode, useEffect, useState } from "react";

import { TryOutCard } from "@/components/pricing/tryout-card";
import { cn } from "@/lib/utils";
import { DATA } from "@/routes/home-premium/-components/data";

export function Tryout() {
  const tryout = Object.values(DATA.pricing_tryout);

  const mobilePlanCards = tryout.map((tryout) => <TryOutCard key={tryout.label} data={tryout} />);

  return (
    <div className="container mx-auto items-center gap-8 space-y-6 px-4 md:px-0">
      <div className="relative z-10 flex h-full flex-col items-center justify-end">
        <p className="text-center text-lg font-bold md:text-2xl">Ultimate Bundling & Privilege</p>
        <p className="text-center text-sm md:text-lg">Paket yang paling worth it, Paling lengkap dan murah!!</p>
      </div>
      {/* Main Plans Section */}
      <div className="w-full rounded-2xl border border-neutral-300 bg-neutral-100 p-6">
        <MobileCarousel items={mobilePlanCards} paginationLabel="Paket Belajar" />

        <div className="hidden w-full justify-center gap-6 md:flex md:flex-wrap lg:grid lg:grid-cols-3">
          {tryout.map((tryout) => (
            <TryOutCard key={tryout.label} data={tryout} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MobileCarousel({ items, paginationLabel }: { items: ReactNode[]; paginationLabel: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalItems = items.length;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalItems - 1;
  const itemKeys = items.map((item, index) =>
    isValidElement(item) && item.key != null ? String(item.key) : `${paginationLabel}-item-${index}`,
  );

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
          className="absolute top-1/2 left-0 z-40 ml-2 flex -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-lg bg-primary-200 p-2 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-primary-200/80 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeftIcon size={22} />
        </button>

        <button
          type="button"
          onClick={goNext}
          disabled={isLast}
          aria-label={`Selanjutnya ${paginationLabel}`}
          className="absolute top-1/2 right-0 z-40 mr-2 flex translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-lg bg-primary-200 p-2 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-primary-200/80 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowRightIcon size={22} />
        </button>

        <div className="overflow-hidden">
          <m.div
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
              <div key={itemKeys[index]} className="w-full shrink-0 pr-2.5 pl-2.5">
                {item}
              </div>
            ))}
          </m.div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        {items.map((_, index) => (
          <button
            key={`${itemKeys[index]}-dot`}
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
