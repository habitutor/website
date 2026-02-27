"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import type React from "react";
import { useEffect, useRef, useState, useCallback } from "react";
import { Container } from "./ui/container";
import { Image } from "@unpic/react";
import { motion } from "motion/react";

export interface CarouselItem {
  id: string | number;
  desc: string;
  name: string;
  title: string;
  [key: string]: unknown;
}

interface CarouselProps {
  items: CarouselItem[];
  cardWidth?: number;
  cardHeight?: number;
  gap?: number;
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
  cardWidth = 408,
  cardHeight = 211,
  gap = 9,
  className = "",
  showNavigation = true,
  showDots = true,
  autoPlay = true,
  autoPlayInterval = 3000,
  onItemClick,
  renderCard,
}) => {
  const [current, setCurrent] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const update = () => {
      setContainerWidth(containerRef.current!.offsetWidth);
    };

    update();

    const obs = new ResizeObserver(update);
    obs.observe(containerRef.current);

    return () => obs.disconnect();
  }, []);

  const getVisible = () => {
    if (containerWidth < 640) return 1;
    if (containerWidth < 1024) return 2;
    return 3;
  };

  const visible = getVisible();

  const getCardWidth = () => {
    if (containerWidth < 640) {
      return containerWidth;
    }

    return cardWidth;
  };

  const realCardWidth = getCardWidth();

  const maxIndex = Math.max(0, items.length - visible);

  const next = useCallback(() => {
    setCurrent((p) => {
      if (items.length <= visible) {
        return (p + 1) % items.length;
      }

      return p >= maxIndex ? 0 : p + 1;
    });
  }, [items.length, visible, maxIndex]);

  const prev = useCallback(() => {
    setCurrent((p) => {
      if (items.length <= visible) {
        return p === 0 ? items.length - 1 : p - 1;
      }

      return p <= 0 ? maxIndex : p - 1;
    });
  }, [items.length, visible, maxIndex]);

  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;

    const timer = setInterval(() => {
      next();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, next, items.length]);

  const defaultRenderCard = (item: CarouselItem) => {
    const itemId =
      typeof item.id === "number"
        ? item.id
        : Number.parseInt(item.id as string, 10) || 0;

    const colors = ["bg-secondary-400", "bg-green-100", "bg-primary-100"];
    const borderColors = [
      "border-secondary-600",
      "border-fourtiary-200",
      "border-primary-200",
    ];

    const bgColor = colors[itemId % 3];
    const borderColor = borderColors[itemId % 3];

    return (
      <div className="flex h-full mx-auto w-full max-w-100 flex-col overflow-hidden rounded-xl border border-primary-100 shadow-sm transition">
        <div className="relative flex flex-1 flex-col justify-between text-pretty p-4 text-left overflow-hidden">
          <p className="font-medium max-h-full overflow-y-auto text-sm">
            {item.desc}
          </p>

          <div className="flex flex-row justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">{item.name}</h3>
              <h4 className="text-sm">{item.title}</h4>
            </div>

            <div>
              {typeof item.avatar === "string" && item.avatar && (
                <Image
                  src={item.avatar}
                  alt={item.name}
                  width={160}
                  height={160}
                  className="object-cover z-3 absolute top-22 md:top-29.5 lg:top-29.5 right-5 overflow-hidden"
                />
              )}

              <motion.div
                className={`z-2 size-48 rounded-full ${bgColor} ${borderColor} border-2 absolute top-32 md:top-39 lg:top-39 right-4 overflow-hidden`}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full flex flex-col items-center ${className}`}>
      <div
        ref={containerRef}
        className="relative w-full max-w-7xl overflow-hidden"
        style={{ height: cardHeight }}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            gap,
            transform: `translateX(-${current * (realCardWidth + gap)}px)`,
          }}
        >
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              style={{
                width: realCardWidth,
                minWidth: realCardWidth,
                height: cardHeight,
              }}
              onClick={() => {
                if (i < current) prev();
                else if (i >= current + visible) next();
                onItemClick?.(item, i);
              }}
            >
              {renderCard
                ? renderCard(item, i, i === current)
                : defaultRenderCard(item)}
            </button>
          ))}
        </div>
      </div>

      {showNavigation && (
        <Container className="pt-5 lg:hidden w-full">
          <div className="flex justify-between">
            <button
              onClick={prev}
              className="rounded-lg bg-primary-200 p-2 text-white"
            >
              <ArrowLeftIcon size={22} />
            </button>

            <button
              onClick={next}
              className="rounded-lg bg-primary-200 p-2 text-white"
            >
              <ArrowRightIcon size={22} />
            </button>
          </div>
        </Container>
      )}

      {showDots && (
        <div className="mt-4 flex gap-2">
          {Array.from({
            length: Math.max(1, items.length - visible + 1),
          }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 w-2 rounded-full ${
                i === current ? "bg-dot-active scale-125" : "bg-dot-inactive"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;
