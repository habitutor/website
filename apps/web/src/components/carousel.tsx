"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { Image } from "@unpic/react";
import type React from "react";
import { useEffect, useState } from "react";

export interface CarouselItem {
  id: string | number;
  name: string;
  major: string;
  university?: string;
  score_snbt?: number | null;
  mentor?: string | null;
  image: string;
  [key: string]: unknown; // Replace 'any' with 'unknown'
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
  cardWidth = 220, // 72 * 4 = 288px
  cardHeight = 292, // 96 * 4 = 384px
  showNavigation = true,
  autoPlay = false,
  autoPlayInterval = 3000,
  onItemClick,
  renderCard,
}) => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const cardGap = 20;

  // Create extended array for infinite scroll effect
  const extendedItems =
    items.length > 0
      ? [
          items[items.length - 1], // Last item at beginning
          ...items,
          items[0], // First item at end
        ]
      : [];

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index + 1); // +1 because of the extended array
  };

  // Handle infinite scroll reset
  useEffect(() => {
    const timer = setTimeout(
      () => {
        if (currentIndex === 0) {
          setCurrentIndex(items.length);
        } else if (currentIndex === extendedItems.length - 1) {
          setCurrentIndex(1);
        }

        setIsTransitioning(false);
      },
      isTransitioning ? 450 : 0,
    );

    return () => clearTimeout(timer);
  }, [currentIndex, items.length, extendedItems.length, isTransitioning]);
  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      if (!isTransitioning) {
        setCurrentIndex((prev) => prev + 1);
      }
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, isTransitioning]);

  const getCardStyle = (index: number) => {
    const translateX = (index - currentIndex) * (cardWidth + cardGap);

    return {
      transform: `translateX(${translateX}px)`,
      transition: isTransitioning
        ? "all 0.45s cubic-bezier(0.4, 0, 0.2, 1)"
        : "none",
    };
  };

  const defaultRenderCard = (item: CarouselItem) => {
    // Alternate between 2 colors based on item id
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
          className={`absolute border-2 rounded-full size-32 ${isEven ? "bg-secondary-400 border-secondary-600 -bottom-8" : "bg-fourtiary-100 border-fourtiary-200 left-27"}`}
        />
        <div
          className={`absolute size-15 border-2 rounded-full ${isEven ? "bg-secondary-400 border-secondary-600  -right-4" : "bg-fourtiary-100 border-fourtiary-200 -bottom-4 left-10"}`}
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
    <div className="z-30 flex h-80 w-full max-w-350 overflow-hidden">
      {/* Navigasi kiri-kanan untuk xl ke atas */}
      {showNavigation && (
        <>
          {/* Desktop Navigation */}
          <button
            type="button"
            onClick={prevSlide}
            disabled={isTransitioning}
            className="absolute left-0 top-1/2 z-40 hidden cursor-pointer -translate-x-1/2 -translate-y-1/2 rounded-xl bg-primary-200 p-3 text-neutral-100 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-primary-200/80 active:scale-95 disabled:opacity-50 md:flex"
          >
            <ArrowLeftIcon size={24} />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            disabled={isTransitioning}
            className="absolute right-0 top-1/2 z-40 hidden cursor-pointer translate-x-1/2 -translate-y-1/2 rounded-xl bg-primary-200 p-3 text-neutral-100 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-primary-200/80 active:scale-95 disabled:opacity-50 md:flex"
          >
            <ArrowRightIcon size={24} />
          </button>

          {/* Mobile Navigation */}
          <div className="absolute bottom-5 left-0 right-0 z-40 flex justify-between px-4 md:hidden">
            <button
              type="button"
              onClick={prevSlide}
              disabled={isTransitioning}
              className="rounded-xl bg-primary-200 p-3 text-neutral-100 shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              <ArrowLeftIcon size={20} />
            </button>

            <button
              type="button"
              onClick={nextSlide}
              disabled={isTransitioning}
              className="rounded-xl bg-primary-200 p-3 text-neutral-100 shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              <ArrowRightIcon size={20} />
            </button>
          </div>
        </>
      )}

      {/* Cards */}
      <div className="relative flex items-center justify-start">
        {extendedItems.map((item, index) => {
          if (!item) return null;
          return (
            <button
              key={`${item.id}-${index}`}
              type="button"
              className="absolute cursor-pointer"
              style={{
                width: cardWidth,
                height: cardHeight,
                ...getCardStyle(index),
              }}
              onClick={() => {
                const actualIndex = index - 1; // Account for extended array
                if (
                  actualIndex >= 0 &&
                  actualIndex < items.length &&
                  actualIndex !== currentIndex - 1
                ) {
                  goToSlide(actualIndex);
                }
                onItemClick?.(item, actualIndex);
              }}
            >
              {renderCard
                ? renderCard(item, index, index === currentIndex)
                : defaultRenderCard(item)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Carousel;
