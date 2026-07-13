import { Link } from "@tanstack/react-router";
import * as m from "motion/react-m";
import { MotionPulse } from "@/components/motion/motion-components";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatRupiah, PERINTIS_DATA } from "./data";
import { usePerintisPricing } from "./use-perintis-pricing";

export function Hero() {
  const { hero, proofPoints } = PERINTIS_DATA;
  const pricing = usePerintisPricing();

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <MotionPulse>
          <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full border-2 border-secondary-200 bg-secondary-100 md:top-90 md:-left-25 md:h-66 md:w-66" />
        </MotionPulse>

        <MotionPulse>
          <div className="top-70 left-10 hidden h-23 w-23 rounded-full border-2 border-green-100 bg-[#C5F5DC] md:absolute md:flex" />
        </MotionPulse>

        <MotionPulse>
          <div className="top-70 right-5 hidden h-23 w-23 rounded-full border-2 border-secondary-200 bg-secondary-100 md:absolute md:flex" />
        </MotionPulse>

        <MotionPulse>
          <div className="absolute -right-10 -bottom-10 h-30 w-30 rounded-full border-2 border-tertiary-200 bg-tertiary-100 md:top-90 md:-right-20 md:h-75 md:w-75" />
        </MotionPulse>

        <MotionPulse>
          <div className="top-50 left-30 hidden h-15 w-15 rounded-full border-2 border-neutral-200 bg-neutral-100 md:absolute md:flex" />
        </MotionPulse>
      </div>

      <div className="relative mx-auto flex w-full flex-col items-center justify-center px-4 pt-22 pb-14 md:pb-20">
        <div className="z-1 container flex shrink-0 flex-col items-center space-y-8 pt-8 md:mx-auto md:pt-16">
          <div className="flex max-w-4xl flex-col items-center gap-3 text-center md:gap-4">
            <m.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="font-sans text-3xl leading-10 font-extrabold text-pretty sm:text-4xl md:text-5xl md:leading-16"
            >
              Perintis <span className="text-primary-300">SNBT & TKA 2027</span>, mulai sekarang.
            </m.h1>

            <m.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="max-w-3xl text-sm text-pretty sm:text-lg"
            >
              {hero.subtitle}
            </m.p>

            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 pt-2"
            >
              <span className="relative text-lg font-bold text-neutral-600 sm:text-2xl">
                {formatRupiah(pricing.originalPrice)}
                <span className="pointer-events-none absolute top-1/2 left-0 h-0.5 w-full -rotate-6 bg-red-400" />
              </span>
              {pricing.isPending ? (
                <Skeleton className="h-10 w-40 sm:h-12" />
              ) : (
                <span className="text-4xl font-black text-primary-300 sm:text-5xl">
                  {formatRupiah(pricing.currentPrice)}
                </span>
              )}
              <span className="w-full text-sm font-semibold sm:w-auto sm:text-lg">{hero.priceSuffix}</span>
            </m.div>
          </div>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="flex w-full flex-col items-center gap-3"
          >
            <Link
              to="/premium"
              className={cn(
                buttonVariants({ variant: "lightBlue", size: "lg" }),
                "w-full text-base font-bold tracking-wide uppercase hover:bg-primary-400 sm:w-auto sm:px-14",
              )}
            >
              {hero.cta}
            </Link>
          </m.div>
        </div>
      </div>

      {/* Proof strip */}
      <div className="relative z-1 border-y-2 border-secondary-600 bg-secondary-400">
        <ul className="container mx-auto flex flex-col items-center justify-center gap-x-3 gap-y-1 px-4 py-4 text-center text-xs font-semibold text-neutral-1000 sm:text-sm md:flex-row">
          {proofPoints.map((point, index) => (
            <li key={point} className="flex items-center gap-3">
              {index > 0 && <span className="hidden text-secondary-1000 md:inline">·</span>}
              {point}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
