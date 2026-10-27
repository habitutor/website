import { ArrowRightIcon, CrownSimpleIcon, SealCheckIcon, SparkleIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { motion } from "motion/react";
import { buttonVariants } from "@/components/ui/button";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CountUp, Float } from "@/routes/-home/motion-bits";
import { PREMIUM_DATA } from "./data";
import { usePremiumPackages } from "./use-premium-packages";

const EASE = [0.2, 0.7, 0.2, 1] as const;
const LEAD_WORDS = ["Persiapan"];
const ACCENT_WORDS = ["SNBT", "&", "TKA", "2027,"];
const TAIL_WORDS = ["mulai", "sekarang."];

const FLOATING_PROPS = [
  { src: "/decorations/graduation-cap.webp", className: "top-28 left-[4%] w-24 lg:w-36", rotate: -10, delay: 0 },
  { src: "/decorations/acorn-cards.webp", className: "top-40 right-[4%] w-24 lg:w-36", rotate: 8, delay: 0.5 },
  { src: "/decorations/book-mirror.webp", className: "bottom-24 left-[10%] w-20 lg:w-28", rotate: 6, delay: 1 },
  { src: "/decorations/pencil.webp", className: "bottom-28 right-[9%] w-24 lg:w-32", rotate: -14, delay: 0.3 },
];

function Word({ text, delay, className }: { text: string; delay: number; className?: string }) {
  return (
    <>
      <motion.span
        className={cn("inline-block", className)}
        initial={{ opacity: 0, y: 28, rotateX: -70 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.55, delay, ease: EASE }}
      >
        {text}
      </motion.span>{" "}
    </>
  );
}

function Headline() {
  let i = 0;
  const next = () => 0.15 + i++ * 0.07;

  return (
    <h1
      className="font-sans text-3xl leading-tight font-extrabold tracking-tight text-pretty text-sr-ink sm:text-4xl md:text-6xl md:leading-[1.1]"
      style={{ perspective: 800 }}
    >
      {LEAD_WORDS.map((w) => (
        <Word key={w} text={w} delay={next()} />
      ))}
      <span className="relative inline-block">
        {ACCENT_WORDS.map((w) => (
          <Word
            key={w}
            text={w}
            delay={next()}
            className="animate-sr-sheen bg-[linear-gradient(100deg,#1b44c4_0%,#2f6bff_30%,#8fb2ff_45%,#2f6bff_60%,#1b44c4_100%)] bg-size-[250%_100%] bg-clip-text pb-1 text-transparent"
          />
        ))}
        <svg
          aria-hidden
          viewBox="0 0 300 20"
          preserveAspectRatio="none"
          className="absolute -bottom-1 left-0 -z-1 h-3 w-[95%] md:h-5"
        >
          <motion.path
            d="M4 14 C 60 4, 140 4, 296 10"
            fill="none"
            stroke="#ffc83d"
            strokeWidth="9"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.85 }}
            transition={{ duration: 0.8, delay: 0.8, ease: "easeInOut" }}
          />
        </svg>
      </span>
      {TAIL_WORDS.map((w) => (
        <Word key={w} text={w} delay={next()} />
      ))}
    </h1>
  );
}

function PriceTag() {
  const pricing = usePremiumPackages();
  const { hero } = PREMIUM_DATA;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.75, ease: [0.34, 1.56, 0.64, 1] }}
      className="relative flex flex-col items-center gap-1 rounded-sr-xl border-2 border-sr-sun-400 bg-white/90 px-6 py-4 shadow-sr-sun backdrop-blur sm:px-10"
    >
      <span className="absolute -top-3 inline-flex items-center gap-1 rounded-full bg-sr-sun-500 px-3 py-0.5 text-[11px] font-bold text-sr-ink shadow-sr-1">
        <SparkleIcon weight="fill" className="size-3" />
        Sekali bayar
      </span>
      <div className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1">
        <span className="text-base font-bold text-sr-muted sm:text-xl">mulai dari</span>
        {pricing.isPending ? (
          <Skeleton className="h-10 w-40 sm:h-12" />
        ) : (
          <CountUp
            to={pricing.cheapestPrice}
            prefix="Rp"
            duration={1.2}
            className="text-4xl font-black text-sr-blue-600 sm:text-5xl"
          />
        )}
      </div>
      <span className="text-center text-xs font-semibold text-sr-ink-2 sm:text-base">{hero.priceSuffix}</span>
    </motion.div>
  );
}

function ProofBar() {
  const [point] = PREMIUM_DATA.proofPoints;

  return (
    <div className="relative z-1 overflow-hidden sr-card-blue">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 w-1/3 bg-linear-to-r from-transparent via-white/20 to-transparent"
        animate={{ left: ["-35%", "110%"] }}
        transition={{ duration: 3.2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1.5, ease: "easeInOut" }}
      />
      <div className="relative container mx-auto flex items-center justify-center gap-3 px-4 py-4 text-center text-xs font-semibold sm:text-sm md:text-base">
        <SealCheckIcon weight="fill" className="hidden size-6 shrink-0 text-sr-sun-400 sm:block" />
        <p>
          {point.split(/(\d+%|\d+x)/).map((part, i) =>
            /^\d+%$/.test(part) ? (
              <span key={i} className="text-lg font-black text-sr-sun-400 md:text-xl">
                <NumberTicker value={Number.parseInt(part, 10)} className="text-sr-sun-400" />%
              </span>
            ) : /^\d+x$/.test(part) ? (
              <span key={i} className="text-lg font-black text-sr-sun-400 md:text-xl">
                {part}
              </span>
            ) : (
              part
            ),
          )}
        </p>
      </div>
    </div>
  );
}

export function Hero() {
  const { hero } = PREMIUM_DATA;

  return (
    <section className="relative overflow-hidden bg-linear-to-b from-sr-ivory via-white to-sr-blue-50">
      <div className="pointer-events-none absolute -top-32 -left-32 size-96 rounded-full bg-sr-sun-200/50 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 size-96 rounded-full bg-sr-blue-200/50 blur-3xl" />

      {FLOATING_PROPS.map((prop) => (
        <motion.div
          key={prop.src}
          className={cn("pointer-events-none absolute z-0 hidden md:block", prop.className)}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 + prop.delay, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <Float distance={12} duration={4 + prop.delay} delay={prop.delay} rotate={prop.rotate}>
            <Image
              src={prop.src}
              alt=""
              width={160}
              height={160}
              className="h-auto w-full drop-shadow-[0_14px_14px_rgba(20,34,78,0.22)]"
            />
          </Float>
        </motion.div>
      ))}

      <div className="relative mx-auto flex w-full flex-col items-center justify-center px-4 pt-22 pb-14 md:pb-20">
        <div className="z-1 container flex shrink-0 flex-col items-center space-y-8 pt-8 md:mx-auto md:pt-16">
          <div className="flex max-w-4xl flex-col items-center gap-4 text-center md:gap-5">
            <motion.span
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="sr-sheen inline-flex items-center gap-2 rounded-full border border-sr-sun-400 bg-linear-to-r from-sr-sun-100 via-white to-sr-blue-50 py-1.5 pr-4 pl-1.5 text-xs font-semibold text-sr-ink-2 shadow-sr-sun md:text-sm"
            >
              <span className="relative flex size-6 items-center justify-center rounded-full bg-sr-sun-500 text-sr-ink md:size-7">
                <span className="absolute inset-0 animate-sr-halo rounded-full bg-sr-sun-400" />
                <CrownSimpleIcon weight="fill" className="relative size-3.5 md:size-4" />
              </span>
              Paket Premium Habitutor
            </motion.span>

            <Headline />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="max-w-3xl text-sm text-pretty text-sr-ink-2 sm:text-lg"
            >
              {hero.subtitle}
            </motion.p>

            <PriceTag />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.95 }}
            className="relative flex w-full flex-col items-center gap-3"
          >
            <span className="pointer-events-none absolute top-0 hidden h-12 w-64 animate-sr-halo rounded-full bg-sr-blue-300/40 sm:block" />
            <Link
              to="/premium"
              className={cn(
                buttonVariants({ variant: "lightBlue", size: "lg" }),
                "group sr-sheen relative w-full text-base font-bold tracking-wide uppercase hover:bg-primary-400 sm:w-auto sm:px-14",
              )}
            >
              {hero.cta}
              <ArrowRightIcon weight="bold" className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <a
              href="#paket"
              className="text-sm font-semibold text-sr-blue-600 underline-offset-4 transition-colors hover:text-sr-blue-700 hover:underline"
            >
              Bandingkan paket dulu ↓
            </a>
          </motion.div>
        </div>
      </div>

      <ProofBar />
    </section>
  );
}
