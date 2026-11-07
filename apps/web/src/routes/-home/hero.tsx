import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { ArrowRightIcon, SparkleIcon } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { MotionPulse } from "@/components/motion/motion-components";
import { buttonVariants } from "@/components/ui/button";
import { useIsBreakpoint } from "@/hooks/browser/use-is-breakpoint";
import { cn } from "@/lib/utils";
import { CountUp } from "./motion-bits";

const bars = [
  {
    height: 78,
    border: "border-tertiary-300",
    bg: "bg-tertiary-200",
    circleBorder: "border-primary-200",
    circleBg: "bg-primary-100",
    isHidden: true,
    image: "/decorations/acorn-mirror.webp",
    imageClassName: "translate-y-[-8px] scale-105",
  },
  {
    height: 120,
    border: "border-fourtiary-200",
    bg: "bg-fourtiary-100",
    circleBorder: "border-secondary-400",
    circleBg: "bg-secondary-300",
    isHidden: true,
    image: "/decorations/book-mirror.webp",
    imageClassName: "translate-y-[20px] scale-90",
  },
  {
    height: 156,
    border: "border-primary-200",
    bg: "bg-primary-100",
    circleBorder: "border-red-200",
    circleBg: "bg-red-100",
    isHidden: false,
    image: "/decorations/pencil.webp",
    imageClassName: "rotate-345 translate-y-[10px] scale-130",
  },
  {
    height: 208,
    border: "border-tertiary-600",
    bg: "bg-tertiary-500",
    circleBorder: "border-tertiary-200",
    circleBg: "bg-tertiary-100",
    isHidden: false,
    image: "/decorations/graduation-cap.webp",
    imageClassName: "translate-y-[-10px] scale-110 rotate-40",
  },
  {
    height: 293,
    border: "border-red-200",
    bg: "bg-red-100",
    circleBorder: "border-red-300",
    circleBg: "bg-red-200",
    isHidden: false,
    image: "/decorations/acorn-cards.webp",
    imageClassName: "scale-130",
  },
  {
    height: 370,
    border: "border-primary-300",
    bg: "bg-primary-200",
    circleBorder: "border-secondary-400",
    circleBg: "bg-secondary-300",
    isHidden: false,
    image: "/avatar/tupai-hero.webp",
    imageClassName: "scale-150 md:translate-y-[-30px]",
  },
] as const;

const HEADLINE_LEAD = ["Ubah", "Persiapan", "Ujian", "Menjadi"];
const HEADLINE_ACCENT = ["Investasi", "Masa", "Depan"];
const WORD_EASE = [0.2, 0.7, 0.2, 1] as const;

function HeroBadge() {
  return (
    <motion.span
      initial={{ opacity: 0, y: -12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      whileHover={{ y: -2 }}
      className="sr-sheen inline-flex items-center gap-2 rounded-full border border-sr-sun-400 bg-linear-to-r from-sr-sun-100 via-white to-sr-blue-50 py-1.5 pr-4 pl-1.5 text-xs font-medium text-sr-ink-2 shadow-sr-sun md:text-sm"
    >
      <span className="relative flex size-6 shrink-0 items-center justify-center rounded-full bg-sr-sun-500 text-sr-ink md:size-7">
        <span className="absolute inset-0 animate-sr-halo rounded-full bg-sr-sun-400" />
        <SparkleIcon weight="fill" className="relative size-3.5 md:size-4" />
      </span>
      <span>
        Selama <CountUp to={2} duration={0.8} className="font-bold text-sr-blue-600" /> Tahun Berdiri, Sudah Membantu{" "}
        <CountUp to={20000} suffix="+" className="font-bold text-sr-blue-600" /> Siswa Meraih Mimpinya
      </span>
    </motion.span>
  );
}

function HeadlineWord({ text, delay, className }: { text: string; delay: number; className?: string }) {
  return (
    <motion.span
      className={cn("inline-block", className)}
      initial={{ opacity: 0, y: 28, rotateX: -70 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.55, delay, ease: WORD_EASE }}
    >
      {text}
    </motion.span>
  );
}

function HeroHeadline() {
  return (
    <h2
      className="font-sans text-3xl leading-tight font-extrabold tracking-tight text-sr-ink sm:text-4xl md:text-6xl md:leading-[1.1]"
      style={{ perspective: 800 }}
    >
      {HEADLINE_LEAD.map((text, i) => (
        <span key={text}>
          <HeadlineWord text={text} delay={0.15 + i * 0.08} />{" "}
        </span>
      ))}
      <span className="relative inline-block whitespace-nowrap">
        {HEADLINE_ACCENT.map((text, i) => (
          <span key={text}>
            <HeadlineWord
              text={text}
              delay={0.5 + i * 0.08}
              className="animate-sr-sheen bg-[linear-gradient(100deg,#1b44c4_0%,#2f6bff_30%,#8fb2ff_45%,#2f6bff_60%,#1b44c4_100%)] bg-size-[250%_100%] bg-clip-text pb-1 text-transparent"
            />
            {i < HEADLINE_ACCENT.length - 1 && " "}
          </span>
        ))}
        <svg
          aria-hidden
          viewBox="0 0 300 20"
          preserveAspectRatio="none"
          className="absolute -bottom-1 left-0 -z-1 h-3 w-full md:-bottom-2 md:h-5"
        >
          <motion.path
            d="M4 14 C 60 4, 140 4, 296 10"
            fill="none"
            stroke="#ffc83d"
            strokeWidth="9"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.85 }}
            transition={{ duration: 0.8, delay: 0.85, ease: "easeInOut" }}
          />
        </svg>
        <motion.span
          aria-hidden
          className="absolute -top-3 -right-5 text-sr-sun-500 md:-top-4 md:-right-8"
          initial={{ opacity: 0, scale: 0, rotate: -45 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, delay: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <motion.span
            className="block"
            animate={{ rotate: [0, 15, -10, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1 }}
          >
            <SparkleIcon weight="fill" className="size-5 md:size-8" />
          </motion.span>
        </motion.span>
      </span>
    </h2>
  );
}

function HeroProp({ image, index, className }: { image: string; index: number; className?: string }) {
  return (
    <motion.div
      className="flex items-center justify-center"
      initial={{ opacity: 0, y: 40, scale: 0.6 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: index * 0.15 + 0.7, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <motion.div
        className="cursor-grab touch-pan-y active:cursor-grabbing"
        animate={{ y: [0, -8 - (index % 3) * 3, 0], rotateZ: [0, index % 2 ? 3 : -3, 0] }}
        transition={{
          duration: 3.2 + (index % 3) * 0.6,
          delay: index * 0.3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        whileHover={{
          scale: 1.12,
          rotateY: 18,
          rotateX: -8,
          transition: { type: "spring", stiffness: 260, damping: 14 },
        }}
        whileTap={{ scale: 0.92 }}
        drag
        dragSnapToOrigin
        dragElastic={0.4}
        style={{ transformPerspective: 600, transformStyle: "preserve-3d" }}
      >
        <Image
          src={image}
          alt=""
          layout="fullWidth"
          draggable={false}
          className={cn("z-3 drop-shadow-[0_14px_14px_rgba(20,34,78,0.28)] select-none", className)}
        />
      </motion.div>
    </motion.div>
  );
}

function HeroBar({ index, height, className }: { index: number; height: number; className: string }) {
  const reduceMotion = useReducedMotion();
  const [grown, setGrown] = useState(false);
  const breathe = Math.max(6, Math.round(height * 0.05));

  return (
    <motion.div
      initial={{ height: 0 }}
      animate={grown && !reduceMotion ? { height: [height, height - breathe, height] } : { height }}
      transition={
        grown
          ? { duration: 3.6, delay: index * 0.25, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
          : { type: "spring", stiffness: 70, damping: 11, delay: 0.3 + index * 0.15 }
      }
      onAnimationComplete={() => setGrown(true)}
      className={cn(
        "relative z-2 w-full overflow-hidden rounded-t-xl border-2 border-b-0 shadow-[inset_0_10px_18px_rgb(255_255_255/0.65),inset_-10px_0_18px_rgb(20_34_78/0.06)]",
        className,
      )}
      style={{ height }}
    >
      <motion.span
        aria-hidden
        className="absolute inset-x-0 h-1/3 bg-linear-to-t from-transparent via-white/50 to-transparent"
        initial={{ top: "100%" }}
        animate={{ top: "-40%" }}
        transition={{ duration: 1.4, delay: 0.6 + index * 0.15, ease: "easeOut" }}
      />
    </motion.div>
  );
}

export function Hero() {
  const isMobile = useIsBreakpoint("max", 860);

  return (
    <section className="relative mx-auto flex w-full flex-col items-center justify-start overflow-hidden rounded-b-[40px] border-2 border-t-0 border-tertiary-200 bg-background px-4 pt-22 pb-10 shadow-[0_2px_2px_0_rgba(54,80,162,0.20)] md:pb-35">
      <div className="pointer-events-none inset-0 z-0 h-full w-full">
        <MotionPulse>
          <motion.div
            className="absolute top-100 -right-30 h-108 w-108 rounded-full border-2 border-tertiary-200 bg-tertiary-100 md:top-60 md:-right-70 md:h-200 md:w-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          />
        </MotionPulse>
        <MotionPulse>
          <motion.div
            className="absolute top-80 -right-10 h-20 w-20 rounded-full border-2 border-tertiary-200 bg-tertiary-100 md:top-13 md:-right-8 md:h-43 md:w-43"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          />
        </MotionPulse>
        <MotionPulse>
          <motion.div
            className="absolute top-84 right-15 h-9 w-9 rounded-full border-2 border-tertiary-200 bg-tertiary-100 md:top-10 md:right-36 md:h-15 md:w-15"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          />
        </MotionPulse>
        <MotionPulse>
          <motion.div
            className="absolute top-165 h-15 w-15 rounded-full border-2 border-tertiary-200 bg-tertiary-100 md:top-175 md:right-130 md:h-30 md:w-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          />
        </MotionPulse>
      </div>
      <div className="z-1 container flex shrink-0 flex-col space-y-10 pt-8 md:mx-auto md:space-y-13 md:pt-20">
        <div className="flex max-w-3xl flex-col items-start gap-3 text-left md:gap-4">
          <HeroBadge />
          <HeroHeadline />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.9 }}
            className="max-w-xl text-sm text-sr-ink-2 sm:text-lg"
          >
            Tidak hanya membantumu menaklukkan SNBT, tapi Habitutor juga membentuk{" "}
            <span className="font-sr-serif font-semibold text-sr-blue-700 italic">growth mindset</span> untuk tantangan
            masa depan.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 1 }}
          className="flex w-full flex-col items-center justify-start gap-2 *:max-sm:text-xs md:flex-row md:flex-wrap md:items-start"
        >
          <Link to="/login" className={cn(buttonVariants({ variant: "lightBlue" }), "group sr-sheen w-full md:w-fit")}>
            Mulai Belajar Sekarang
            <ArrowRightIcon weight="bold" className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>

      <div className="z-1 container">
        <div className="flex h-60 w-full items-end gap-1">
          {bars.map((bar, i) => {
            const barHeight = isMobile ? Math.round(bar.height * 0.45) : bar.height;

            return (
              <div
                key={i}
                className={`flex w-full flex-col items-center justify-end ${bar.isHidden ? "hidden lg:flex" : ""}`}
              >
                <motion.div
                  transition={{
                    duration: 0.5,
                    delay: i * 0.15 + 0.6,
                    ease: "easeOut",
                  }}
                  className={`relative h-9 w-18 md:h-18 md:w-36 ${bar.circleBg} border-2 ${bar.circleBorder} z-3 origin-bottom rounded-t-full border-b-0 ${bar.isHidden ? "hidden md:block" : ""}`}
                >
                  <HeroProp image={bar.image} index={i} className={bar.imageClassName} />
                </motion.div>

                <HeroBar
                  index={i}
                  height={barHeight}
                  className={`${bar.bg} ${bar.border} ${bar.isHidden ? "hidden lg:block" : ""}`}
                />
              </div>
            );
          })}
        </div>
        <div className="h-4 w-full rounded-full border-2 border-secondary-600 bg-linear-to-r from-sr-sun-400 via-sr-sun-500 to-sr-amber shadow-sr-sun" />
      </div>

      {/* <MotionFloat delay={0.3}>
				<Image src="/images/hero-image.webp" alt="Hero Illustration" layout="fullWidth" className="" />
			</MotionFloat> */}
    </section>
  );
}
