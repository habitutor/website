"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { Image } from "@unpic/react";
import type React from "react";
import { useEffect, useState } from "react";

export interface CarouselItem {
  id: string | number;
  name?: string;
  major?: string;
  university?: string;
  score_snbt?: number | null;
  mentor?: string | null;
  image: string;
  [key: string]: unknown;
}

interface CarouselProps {
  items: CarouselItem[];
  cardWidth?: number;
  cardHeight?: number;
  className?: string;
  showNavigation?: boolean;
  showDots?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  onItemClick?: (item: CarouselItem, index: number) => void;
  renderCard?: (
    item: CarouselItem,
    index?: number,
    isActive?: boolean,
  ) => React.ReactNode;
}

const Carousel: React.FC<CarouselProps> = ({
  items,
  cardWidth = 220,
  cardHeight = 292,
  showNavigation = true,
  autoPlay = false,
  autoPlayInterval = 3000,
  onItemClick,
  renderCard,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [animatedIndex, setAnimatedIndex] = useState(0);

  const cardGap = 20;
  const visibleCount = 10;
  const total = items.length;

  const getItem = (index: number) => {
    if (total === 0) return null;

    const realIndex = ((index % total) + total) % total;

    return items[realIndex];
  };

  const nextSlide = () => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setCurrentIndex((i) => i + 1);
  };

  const prevSlide = () => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setCurrentIndex((i) => i - 1);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (!isTransitioning) return;

    setAnimatedIndex(currentIndex);

    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [currentIndex, isTransitioning]);

  useEffect(() => {
    if (!autoPlay || isTransitioning || total === 0) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((i) => i + 1);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, isTransitioning, total]);

  const getCardStyle = (index: number) => {
    const translateX =
      (index - Math.floor(visibleCount / 3) - animatedIndex + currentIndex) *
      (cardWidth + cardGap);

    return {
      transform: `translateX(${translateX}px)`,
      transition: isTransitioning
        ? "transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)"
        : "none",
    };
  };

  const defaultRenderCard = (item: CarouselItem) => {
    const itemId =
      typeof item.id === "number"
        ? item.id
        : Number.parseInt(item.id as string, 10) || 0;

    const isEven = itemId % 2 === 0;

    return (
      <div className="relative h-full w-full overflow-hidden rounded-2xl border-2 border-primary-100 bg-white p-5 shadow-md">
        <div className="z-10 text-left">
          <div className="border-b-2 pb-2 border-primary-100">
            <h3 className="font-bold text-base">{item.name}</h3>
            <p className="inline-block text-sm whitespace-nowrap">
              {item.major}
            </p>
            <p className="text-sm">{item.university}</p>
          </div>
          <div className="pt-2 space-y-0.5 text-sm font-italic">
            <p className="text-xs">
              {item.mentor ? `Pengajar ${item.mentor}` : ""}
            </p>
            <p className="text-xs">
              {item.score_snbt ? `${item.score_snbt} pada SNBT'25` : ""}
            </p>
          </div>
        </div>

        <div
          className={`absolute border-2 rounded-full size-32 ${isEven
            ? "bg-secondary-400 border-secondary-600 -bottom-8"
            : "bg-fourtiary-100 border-fourtiary-200 left-27"
            }`}
        />
        <div
          className={`absolute size-15 border-2 rounded-full ${isEven
            ? "bg-secondary-400 border-secondary-600  -right-4"
            : "bg-fourtiary-100 border-fourtiary-200 -bottom-4 left-10"
            }`}
        />
        <Image
          src={item.image}
          alt={item.name}
          width={140}
          height={140}
          className="relative z-10 h-auto w-43 translate-x-1/3"
        />
      </div>
    );
  };

  return (
    <div className="z-30 w-full space-y-4">
      {/* Desktop carousel with side buttons */}
      <div className="hidden md:flex items-center gap-4 justify-center">
        {showNavigation && (
          <button
            type="button"
            onClick={prevSlide}
            disabled={isTransitioning}
            className="flex cursor-pointer rounded-xl bg-primary-200 p-3 text-neutral-100 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-primary-200/80 active:scale-95 disabled:opacity-50 shrink-0"
          >
            <ArrowLeftIcon size={24} />
          </button>
        )}

        <div className="relative flex h-80 w-full overflow-hidden">
          <div className="relative px-2 flex flex-row items-center justify-start">
            {Array.from({ length: visibleCount }).map((_, i) => {
              const virtualIndex =
                currentIndex + i - Math.floor(visibleCount / 2);

              const item = getItem(virtualIndex);

              if (!item) return null;

              const realIndex =
                ((virtualIndex % total) + total) % total;

              return (
                <button
                  key={`${item.id}-${i}`}
                  type="button"
                  className="absolute shrink-0 cursor-pointer"
                  style={{
                    width: cardWidth,
                    height: cardHeight,
                    ...getCardStyle(i),
                  }}
                  onClick={() => {
                    if (realIndex !== currentIndex) {
                      goToSlide(realIndex);
                    }

                    onItemClick?.(item, realIndex);
                  }}
                >
                  {renderCard
                    ? renderCard(item, realIndex, i === Math.floor(visibleCount / 2))
                    : defaultRenderCard(item)}
                </button>
              );
            })}
          </div>
        </div>

        {showNavigation && (
          <button
            type="button"
            onClick={nextSlide}
            disabled={isTransitioning}
            className="flex cursor-pointer rounded-xl bg-primary-200 p-3 text-neutral-100 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-primary-200/80 active:scale-95 disabled:opacity-50 shrink-0"
          >
            <ArrowRightIcon size={24} />
          </button>
        )}
      </div>

      {/* Mobile carousel */}
      <div className="md:hidden relative flex h-80 w-full overflow-hidden">
        <div className="relative px-2 flex flex-row items-center justify-start">
          {Array.from({ length: visibleCount }).map((_, i) => {
            const virtualIndex =
              currentIndex + i - Math.floor(visibleCount / 2);

            const item = getItem(virtualIndex);

            if (!item) return null;

            const realIndex =
              ((virtualIndex % total) + total) % total;

            return (
              <button
                key={`${item.id}-${i}`}
                type="button"
                className="absolute shrink-0 cursor-pointer"
                style={{
                  width: cardWidth,
                  height: cardHeight,
                  ...getCardStyle(i),
                }}
                onClick={() => {
                  if (realIndex !== currentIndex) {
                    goToSlide(realIndex);
                  }

                  onItemClick?.(item, realIndex);
                }}
              >
                {renderCard
                  ? renderCard(item, realIndex, i === Math.floor(visibleCount / 2))
                  : defaultRenderCard(item)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile navigation buttons */}
      {showNavigation && (
        <div className="w-full md:hidden">
          <div className="flex justify-between">
            <button
              type="button"
              onClick={prevSlide}
              disabled={isTransitioning}
              className="rounded-lg bg-primary-200 p-2 text-white disabled:opacity-50"
            >
              <ArrowLeftIcon size={22} />
            </button>

            <button
              type="button"
              onClick={nextSlide}
              disabled={isTransitioning}
              className="rounded-lg bg-primary-200 p-2 text-white disabled:opacity-50"
            >
              <ArrowRightIcon size={22} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Carousel;