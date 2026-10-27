import { ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon, QuotesIcon, SparkleIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useIsBreakpoint } from "@/hooks/browser/use-is-breakpoint";
import { cn } from "@/lib/utils";
import { DATA } from "./data";
import { CountUp, SectionHeading } from "./motion-bits";

const AUTOPLAY_MS = 4500;
const SWIPE_THRESHOLD = 60;
const AVATAR_BG = ["bg-sr-sun-100", "bg-sr-blue-100", "bg-sr-orange-100"];

type TestimonialItem = (typeof DATA.testimonials)[number];

function getOffset(index: number, active: number, total: number) {
  let offset = index - active;
  if (offset > total / 2) offset -= total;
  if (offset < -total / 2) offset += total;
  return offset;
}

function SparkBurst({ burstKey }: { burstKey: number }) {
  return (
    <AnimatePresence>
      {burstKey > 0 && (
        <motion.div key={burstKey} aria-hidden className="pointer-events-none absolute inset-0 z-30">
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            return (
              <motion.span
                key={i}
                className="absolute top-1/2 left-1/2 text-sr-sun-500"
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={{
                  x: Math.cos(angle) * 140,
                  y: Math.sin(angle) * 110,
                  scale: [0, 1.2, 0.6],
                  opacity: [1, 1, 0],
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <SparkleIcon weight="fill" className="size-5" />
              </motion.span>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TestimonialCard({ item, isActive }: { item: TestimonialItem; isActive: boolean }) {
  return (
    <div
      className={cn(
        "relative flex h-full flex-col gap-4 overflow-hidden rounded-sr-lg border-2 bg-white p-5 text-left transition-[border-color,box-shadow] duration-500 md:p-6",
        isActive ? "border-sr-sun-400 shadow-sr-sun" : "border-sr-line shadow-sr-1",
      )}
    >
      {isActive && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(320px_180px_at_100%_0%,#fff4d2,transparent_70%)]" />
      )}
      <motion.div
        className={cn("absolute top-3 right-4", isActive ? "text-sr-sun-500" : "text-sr-line-2")}
        animate={isActive ? { rotate: [0, -10, 0], scale: [1, 1.15, 1] } : { rotate: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <QuotesIcon weight="fill" className="size-10 md:size-12" />
      </motion.div>

      <div className="relative flex items-center gap-3">
        <div
          className={cn(
            "flex size-16 shrink-0 items-end justify-center overflow-hidden rounded-sr-md border border-white shadow-sr-1 md:size-20",
            AVATAR_BG[item.id % AVATAR_BG.length],
          )}
        >
          <Image src={item.avatar} alt="" width={80} height={80} className="h-auto w-full object-contain" />
        </div>
        <div className="min-w-0 pr-10">
          <h3 className="truncate text-base font-bold text-sr-ink md:text-lg">{item.title}</h3>
          <p className="text-xs text-sr-muted md:text-sm">{item.name}</p>
          <span
            className={cn(
              "mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors duration-500",
              isActive ? "bg-sr-blue-50 text-sr-blue-700" : "bg-neutral-100 text-sr-muted",
            )}
          >
            <CheckCircleIcon weight="fill" className="size-3.5" />
            Lolos PTN
          </span>
        </div>
      </div>

      <div className="relative h-px w-full bg-linear-to-r from-transparent via-sr-sun-200 to-transparent" />

      <p className="relative line-clamp-5 font-sr-serif text-sm leading-relaxed text-sr-ink-2 italic md:text-base">
        {item.desc}
      </p>
    </div>
  );
}

function TestimonialStage() {
  const items = DATA.testimonials;
  const total = items.length;
  const isMobile = useIsBreakpoint("max", 768);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [burst, setBurst] = useState(0);
  const dragged = useRef(false);

  const go = useCallback((dir: number) => setActive((a) => (a + dir + total) % total), [total]);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => go(1), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [active, paused, go]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    setTimeout(() => {
      dragged.current = false;
    });
    if (info.offset.x < -SWIPE_THRESHOLD) go(1);
    else if (info.offset.x > SWIPE_THRESHOLD) go(-1);
  };

  const spacing = isMobile ? 96 : 104;

  return (
    <div
      className="flex w-full flex-col items-center gap-6"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <motion.div
        className="relative h-80 w-full max-w-5xl cursor-grab touch-pan-y active:cursor-grabbing md:h-76"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragStart={() => {
          dragged.current = true;
        }}
        onDragEnd={handleDragEnd}
      >
        {items.map((item, i) => {
          const offset = getOffset(i, active, total);
          const isActive = offset === 0;
          const isVisible = Math.abs(offset) <= 1;

          return (
            <motion.button
              key={item.id}
              type="button"
              aria-label={`Testimoni ${item.title}`}
              aria-current={isActive}
              tabIndex={isVisible ? 0 : -1}
              onClick={() => {
                if (dragged.current) return;
                if (isActive) setBurst((b) => b + 1);
                else setActive(i);
              }}
              className="absolute top-1/2 left-1/2 h-72 w-[82%] max-w-sm cursor-pointer outline-none focus-visible:ring-4 focus-visible:ring-sr-blue-300 md:h-68 md:w-[40%] md:max-w-md"
              initial={false}
              animate={{
                x: `${-50 + offset * spacing}%`,
                y: isActive ? "-52%" : "-50%",
                scale: isActive ? 1 : 0.86,
                opacity: isVisible ? (isActive ? 1 : 0.55) : 0,
                filter: isActive ? "blur(0px) saturate(1)" : "blur(1px) saturate(0.6)",
                zIndex: isActive ? 20 : 10 - Math.abs(offset),
              }}
              whileHover={isActive ? { y: "-54%" } : { opacity: 0.8 }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              style={{ pointerEvents: isVisible ? "auto" : "none" }}
            >
              <TestimonialCard item={item} isActive={isActive} />
              {isActive && <SparkBurst burstKey={burst} />}
            </motion.button>
          );
        })}
      </motion.div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Testimoni sebelumnya"
          className="flex size-11 sr-action items-center justify-center rounded-full border border-sr-line bg-white text-sr-blue-600 shadow-sr-1"
        >
          <ArrowLeftIcon weight="bold" className="size-5" />
        </button>
        <div className="flex items-center gap-1.5">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Ke testimoni ${i + 1}`}
              onClick={() => setActive(i)}
              className={cn(
                "relative h-2 overflow-hidden rounded-full bg-sr-line-2 transition-all duration-500",
                i === active ? "w-8" : "w-2 hover:bg-sr-blue-200",
              )}
            >
              {i === active && (
                <motion.span
                  key={`${active}-${paused}`}
                  className="absolute inset-y-0 left-0 rounded-full bg-sr-blue-500"
                  initial={{ width: paused ? "100%" : "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: paused ? 0 : AUTOPLAY_MS / 1000, ease: "linear" }}
                />
              )}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Testimoni berikutnya"
          className="flex size-11 sr-action items-center justify-center rounded-full border border-sr-line bg-white text-sr-blue-600 shadow-sr-1"
        >
          <ArrowRightIcon weight="bold" className="size-5" />
        </button>
      </div>
    </div>
  );
}

const PROOF_STATS = [
  { value: 20000, suffix: "+", label: "Siswa terbantu meraih mimpinya" },
  { value: 250, suffix: "+", label: "Video bahas soal dari mahasiswa PTN" },
  { value: 2, suffix: " Tahun", label: "Menemani pejuang SNBT" },
];

function ProofStrip() {
  return (
    <motion.div
      className="relative flex w-full max-w-6xl flex-col items-center gap-6 overflow-hidden rounded-sr-xl sr-card-blue px-6 py-6 md:flex-row md:justify-between md:px-10"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
    >
      <div className="pointer-events-none absolute -top-16 -left-10 size-48 animate-sr-drift rounded-full bg-white/10" />
      <div className="relative grid w-full grid-cols-3 gap-3 md:w-auto md:gap-10">
        {PROOF_STATS.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-1 text-center md:items-start md:text-left">
            <span className="text-2xl font-extrabold text-sr-sun-400 md:text-4xl">
              <CountUp to={stat.value} suffix={stat.suffix} />
            </span>
            <span className="max-w-36 text-[11px] leading-snug text-white/85 md:text-sm">{stat.label}</span>
          </div>
        ))}
      </div>
      <Link
        to="/login"
        className="sr-sheen relative inline-flex shrink-0 sr-action items-center gap-2 rounded-full sr-card-sun px-6 py-3 text-sm font-bold md:text-base"
      >
        Jadi Cerita Berikutnya
        <ArrowRightIcon weight="bold" />
      </Link>
    </motion.div>
  );
}

export default function Testimonial() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-sr-ivory via-white to-sr-blue-50">
      <div className="pointer-events-none absolute -top-24 -left-24 size-80 rounded-full bg-sr-sun-200/40 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-24 size-96 rounded-full bg-sr-blue-200/40 blur-3xl" />
      <div className="relative container mx-auto flex max-w-7xl flex-col items-center gap-y-8 px-4 py-20 md:py-24 xl:px-0">
        <SectionHeading
          eyebrow="Testimoni"
          title={
            <>
              Pengalaman Siswa, <span className="font-sr-serif text-sr-blue-600 italic">Bukti yang Nyata</span>
            </>
          }
          description="Cerita langsung dari alumni yang sudah merasakan belajar bareng Habitutor."
        />
        <TestimonialStage />
        <ProofStrip />
      </div>
    </section>
  );
}
