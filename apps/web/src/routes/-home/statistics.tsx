import {
  ArrowRightIcon,
  ArrowUpLeftIcon,
  BookOpenIcon,
  BrainIcon,
  CloudLightningIcon,
  FileIcon,
  FireIcon,
  type Icon,
  LinkBreakIcon,
  ShieldCheckIcon,
  SmileySadIcon,
  SparkleIcon,
  TargetIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Float } from "./motion-bits";

type Problem = {
  label: string;
  icon: Icon;
  tint: string;
  solutionTitle: string;
  solution: string;
  solutionIcon: Icon;
};

const PROBLEMS: Problem[] = [
  {
    label: "Materi Tidak Lengkap",
    icon: BookOpenIcon,
    tint: "bg-sr-blue-100 text-sr-blue-700",
    solutionTitle: "Materi 7 subtes, rapi per BAB",
    solution: "Semua subtes SNBT tersusun per BAB, lengkap dengan 250+ video bahas soal dari mahasiswa PTN.",
    solutionIcon: BookOpenIcon,
  },
  {
    label: "Skor TryOut Stagnan",
    icon: ShieldCheckIcon,
    tint: "bg-sr-orange-100 text-sr-orange-700",
    solutionTitle: "Tryout rutin + pembahasan",
    solution: "Simulasi rutin dengan pembahasan dan analisis progres, jadi kamu tahu bagian mana yang perlu dikejar.",
    solutionIcon: TargetIcon,
  },
  {
    label: "Mudah Burnout & Stress",
    icon: CloudLightningIcon,
    tint: "bg-sr-sun-100 text-sr-amber-700",
    solutionTitle: "Mulai dari 3 menit sehari",
    solution: "Streak dan latihan mini yang ringan, ditemani komunitas sesama pejuang yang saling menyemangati.",
    solutionIcon: FireIcon,
  },
  {
    label: "Bingung Memilih Jurusan",
    icon: SmileySadIcon,
    tint: "bg-sr-blue-100 text-sr-blue-700",
    solutionTitle: "Ngobrol bareng mentor PTN",
    solution: "Kenali dunia kampus dari cerita mentor UI, ITB, dan UGM yang sudah lebih dulu menjalaninya.",
    solutionIcon: SparkleIcon,
  },
  {
    label: "Belajar Tanpa Arah",
    icon: ArrowUpLeftIcon,
    tint: "bg-sr-orange-100 text-sr-orange-700",
    solutionTitle: "Habit system yang menuntun",
    solution: "Rutinitas harian dan target yang jelas bikin belajarmu terarah, selangkah demi selangkah.",
    solutionIcon: ArrowRightIcon,
  },
  {
    label: "Buta Soal Pola SNBT",
    icon: FileIcon,
    tint: "bg-sr-sun-100 text-sr-amber-700",
    solutionTitle: "Kejar BAB prioritas & Brain Gym",
    solution: "Belajar YKKA (Yang Keluar Keluar Aja) dan asah pola soal lewat ribuan soal berbentuk games.",
    solutionIcon: BrainIcon,
  },
];

const CHIP_OFFSETS = [
  "lg:translate-x-6",
  "lg:-translate-x-8",
  "lg:translate-x-2",
  "lg:-translate-x-6",
  "lg:translate-x-8",
  "lg:-translate-x-2",
];

function ProblemChip({
  problem,
  index,
  isActive,
  onSelect,
}: {
  problem: Problem;
  index: number;
  isActive: boolean;
  onSelect: () => void;
}) {
  const Icon = problem.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.08, ease: [0.34, 1.56, 0.64, 1] }}
      className={cn("flex", index % 2 ? "lg:justify-start" : "lg:justify-end", CHIP_OFFSETS[index])}
    >
      <Float distance={6} duration={3.4 + (index % 3) * 0.5} delay={index * 0.35} className="w-full lg:w-auto">
        <motion.button
          type="button"
          onClick={onSelect}
          aria-pressed={isActive}
          whileHover={{ y: -3, scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-full border py-1.5 pr-4 pl-1.5 text-left text-xs font-semibold shadow-sr-1 transition-colors duration-300 md:gap-3 md:text-base lg:w-auto",
            isActive
              ? "sr-card-blue border-transparent"
              : "border-white bg-white/90 text-sr-ink backdrop-blur hover:border-sr-blue-200",
          )}
        >
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors duration-300 md:size-10",
              isActive ? "bg-white/20 text-white" : problem.tint,
            )}
          >
            <Icon weight="duotone" className="size-4.5 md:size-5.5" />
          </span>
          {problem.label}
        </motion.button>
      </Float>
    </motion.div>
  );
}

function SolutionCard({ problem }: { problem: Problem | null }) {
  return (
    <div className="relative min-h-32 w-full max-w-2xl md:min-h-28">
      <AnimatePresence mode="wait">
        {problem ? (
          <motion.div
            key={problem.label}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
            className="flex items-start gap-4 rounded-sr-lg border-2 border-sr-sun-400 bg-white p-4 shadow-sr-sun md:p-5"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-sr-md sr-card-sun">
              <problem.solutionIcon weight="duotone" className="size-6" />
            </span>
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-wide text-sr-amber-700 uppercase">Solusi Habitutor</p>
              <h3 className="text-base font-bold text-sr-ink md:text-lg">{problem.solutionTitle}</h3>
              <p className="text-sm text-sr-ink-2 md:text-base">{problem.solution}</p>
            </div>
          </motion.div>
        ) : (
          <motion.p
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2 pt-6 text-center text-sm font-medium text-sr-muted md:text-base"
          >
            <motion.span
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY }}
              className="inline-block"
            >
              👆
            </motion.span>
            Klik masalah yang kamu rasakan, lihat solusinya
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProblemStage() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const left = PROBLEMS.slice(0, 3);
  const right = PROBLEMS.slice(3);

  const renderChip = (problem: Problem, index: number) => (
    <ProblemChip
      key={problem.label}
      problem={problem}
      index={index}
      isActive={activeIndex === index}
      onSelect={() => setActiveIndex((cur) => (cur === index ? null : index))}
    />
  );

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="relative w-full max-w-6xl overflow-hidden rounded-sr-xl border border-white bg-linear-to-br from-sr-ivory via-sr-cream to-sr-sun-100 px-4 pt-6 pb-4 shadow-sr-2 md:px-10 md:pt-10">
        <div className="pointer-events-none absolute -bottom-20 left-1/2 size-96 -translate-x-1/2 rounded-full bg-sr-sun-200/70 blur-3xl" />
        <div className="relative grid grid-cols-2 gap-3 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-8">
          <div className="contents lg:flex lg:flex-col lg:gap-8">{left.map((p, i) => renderChip(p, i))}</div>

          <motion.div
            className="relative order-first col-span-2 mx-auto lg:order-none lg:col-span-1"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <div className="absolute inset-x-6 bottom-2 h-6 rounded-full bg-sr-ink/10 blur-md" />
            <Float distance={12} duration={4}>
              <motion.div
                whileHover={{ rotate: [0, -4, 4, 0], scale: 1.04 }}
                transition={{ duration: 0.6 }}
                animate={activeIndex !== null ? { scale: [1, 1.06, 1] } : {}}
                key={activeIndex ?? "idle"}
              >
                <Image
                  src="/avatar/testimone-avatar.webp"
                  alt="Maskot Habitutor"
                  width={400}
                  height={400}
                  className="w-40 drop-shadow-[0_18px_20px_rgba(20,34,78,0.25)] md:w-56 lg:w-80"
                />
              </motion.div>
            </Float>
          </motion.div>

          <div className="contents lg:flex lg:flex-col lg:gap-8">{right.map((p, i) => renderChip(p, i + 3))}</div>
        </div>
      </div>

      <SolutionCard problem={activeIndex === null ? null : PROBLEMS[activeIndex]} />
    </div>
  );
}

const FOUNDATION_PILLS = ["Study Habit", "Mental Tangguh", "Siap Dunia Kampus"];

function ChainBreakBanner() {
  return (
    <motion.div
      className="sr-sheen relative w-full max-w-5xl overflow-hidden rounded-sr-xl sr-card-blue px-6 py-10 md:px-16 md:py-14"
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
    >
      <div className="pointer-events-none absolute -top-24 -right-24 size-72 animate-sr-drift rounded-full border-[28px] border-white/10" />
      <div className="pointer-events-none absolute -bottom-28 -left-16 size-64 rounded-full bg-sr-sun-400/20 blur-2xl" />

      <Float
        distance={14}
        duration={5}
        rotate={-6}
        className="pointer-events-none absolute top-4 -right-10 hidden w-44 lg:block"
      >
        <Image src="/decorations/pencil.webp" alt="" width={200} height={200} className="-scale-x-100 drop-shadow-xl" />
      </Float>
      <Float
        distance={10}
        duration={4.2}
        delay={0.6}
        rotate={8}
        className="pointer-events-none absolute bottom-2 left-2 hidden w-28 lg:block"
      >
        <Image src="/decorations/acorn-2.webp" alt="" width={130} height={130} className="drop-shadow-xl" />
      </Float>

      <div className="relative z-2 flex flex-col items-center gap-5 text-center">
        <motion.span
          className="flex size-14 items-center justify-center rounded-full bg-white/15 text-sr-sun-400 ring-1 ring-white/30 backdrop-blur"
          initial={{ rotate: 0 }}
          whileInView={{ rotate: [0, -18, 14, -8, 0], scale: [1, 1.2, 1] }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.5 }}
          whileHover={{ rotate: 20, scale: 1.1 }}
        >
          <LinkBreakIcon weight="bold" className="size-7" />
        </motion.span>

        <h3 className="max-w-3xl text-2xl leading-tight font-extrabold text-balance md:text-4xl">
          Putus <span className="font-sr-serif text-sr-sun-400 italic">Rantai Belajar Salah</span>, Bangun{" "}
          <span className="font-sr-serif text-sr-sun-400 italic">Fondasi</span> Nilai Maksimal.
        </h3>
        <p className="max-w-2xl text-sm text-white/85 md:text-lg">
          Dapatkan fasilitas lengkap untuk membentuk Study Habit serta mental tangguh hingga dunia kampus.
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          {FOUNDATION_PILLS.map((pill, i) => (
            <motion.span
              key={pill}
              className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold ring-1 ring-white/25 backdrop-blur md:text-sm"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 + i * 0.12 }}
            >
              ✓ {pill}
            </motion.span>
          ))}
        </div>

        <Link
          to="/login"
          className="group sr-sheen mt-2 inline-flex sr-action items-center gap-2 rounded-full sr-card-sun px-6 py-3 text-sm font-bold md:text-base"
        >
          Bangun Fondasimu Sekarang
          <ArrowRightIcon weight="bold" className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </motion.div>
  );
}

export function Statistics() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-sr-blue-50 via-white to-sr-blue-50">
      <div className="relative container mx-auto flex w-full flex-col items-center gap-16 px-4 py-20 md:gap-24 md:py-24">
        <div className="flex w-full flex-col items-center gap-8">
          <motion.h2
            className="text-center text-2xl font-bold text-pretty text-sr-ink lg:text-4xl"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Ngerasa Persiapan SNBT Kamu{" "}
            <span className="relative inline-block font-sr-serif text-sr-blue-600 italic">
              Masih Gini-Gini Aja
              <motion.span
                className="absolute -bottom-1 left-0 h-2 w-full origin-left rounded-full bg-sr-sun-400/70"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.4 }}
              />
            </span>
            ?
          </motion.h2>
          <ProblemStage />
        </div>

        <ChainBreakBanner />
      </div>
    </section>
  );
}
