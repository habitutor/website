"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { Image } from "@unpic/react";
import { motion } from "motion/react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Container } from "./ui/container";

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
  renderCard?: (item: CarouselItem, index?: number, isActive?: boolean) => React.ReactNode;
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
    const itemId = typeof item.id === "number" ? item.id : Number.parseInt(item.id as string, 10) || 0;

    const colors = ["bg-secondary-400", "bg-green-100", "bg-primary-100"];
    const borderColors = ["border-secondary-600", "border-fourtiary-200", "border-primary-200"];

    const bgColor = colors[itemId % 3];
    const borderColor = borderColors[itemId % 3];

    return (
      <div className="mx-auto flex h-full w-full max-w-100 flex-col overflow-hidden rounded-xl border border-primary-100 shadow-sm transition">
        <div className="relative flex flex-1 flex-col justify-between overflow-hidden p-4 text-left text-pretty">
          <p className="max-h-full overflow-y-auto text-sm font-medium">{item.desc}</p>

          <div className="flex flex-row items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">{item.name}</h3>
              <h4 className="text-sm">{item.title}</h4>
            </div>

            <div>
              {typeof item.avatar === "string" && item.avatar && (
                <Image
                  src={item.avatar}
                  alt={item.name}
                  width={160}
                  height={160}
                  className="absolute right-5 bottom-0 z-3 overflow-hidden object-cover"
                />
              )}

              <motion.div
                className={`z-2 size-48 rounded-full ${bgColor} ${borderColor} absolute top-32 right-4 overflow-hidden border-2 md:top-39 lg:top-39`}
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
    <div className={`flex w-full flex-col items-center ${className}`}>
      <div ref={containerRef} className="relative w-full max-w-7xl overflow-hidden" style={{ height: cardHeight }}>
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
              {renderCard ? renderCard(item, i, i === current) : defaultRenderCard(item)}
            </button>
          ))}
        </div>
      </div>

      {showNavigation && (
        <Container className="w-full pt-5 lg:hidden">
          <div className="flex justify-between">
            <button onClick={prev} className="rounded-lg bg-primary-200 p-2 text-white">
              <ArrowLeftIcon size={22} />
            </button>

            <button onClick={next} className="rounded-lg bg-primary-200 p-2 text-white">
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
              className={`h-2 w-2 rounded-full ${i === current ? "bg-dot-active scale-125" : "bg-dot-inactive"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;
