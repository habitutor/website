import {
  ArrowArcLeftIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  GraduationCapIcon,
  HandPointingIcon,
  SealCheckIcon,
  TrophyIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { DATA } from "./data";
import { SectionHeading } from "./motion-bits";

type Mentor = (typeof DATA.mentor)[number];

const CIRCLE_TONES = [
  "border-secondary-600 bg-secondary-400",
  "border-fourtiary-200 bg-fourtiary-100",
  "border-sr-blue-300 bg-sr-blue-100",
  "border-sr-orange-200 bg-sr-orange-100",
];

function MentorFace({ mentor, index }: { mentor: Mentor; index: number }) {
  const circle = CIRCLE_TONES[index % CIRCLE_TONES.length];

  return (
    <div className="absolute inset-0 overflow-hidden rounded-sr-lg border-2 border-sr-line bg-white p-5 text-left shadow-sr-1 transition-[border-color,box-shadow] duration-300 backface-hidden group-hover:border-sr-blue-200 group-hover:shadow-sr-2">
      <div className="relative z-10">
        <div className="border-b-2 border-sr-blue-100 pb-2">
          <h3 className="flex items-center gap-1 text-base font-bold text-sr-ink">
            {mentor.name}
            <SealCheckIcon weight="fill" className="size-4 shrink-0 text-sr-blue-500" />
          </h3>
          <p className="text-sm text-sr-ink-2">{mentor.major}</p>
          <p className="text-sm text-sr-muted">{mentor.university}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 pt-2">
          {mentor.mentor && (
            <span className="rounded-full bg-sr-blue-50 px-2 py-0.5 text-[11px] font-semibold text-sr-blue-700">
              Pengajar {mentor.mentor}
            </span>
          )}
          {mentor.score_snbt && (
            <span className="rounded-full bg-sr-sun-100 px-2 py-0.5 text-[11px] font-semibold text-sr-amber-700">
              {mentor.score_snbt} SNBT'25
            </span>
          )}
        </div>
      </div>

      <div
        className={cn(
          "absolute -bottom-8 left-6 size-32 rounded-full border-2 transition-transform duration-700 ease-(--ease-sr) group-hover:scale-110",
          circle,
        )}
      />
      <div
        className={cn(
          "absolute -right-4 bottom-24 size-14 animate-sr-drift rounded-full border-2 transition-transform duration-700 group-hover:-translate-x-2",
          circle,
        )}
      />
      <Image
        src={mentor.image}
        alt={mentor.name}
        width={180}
        height={180}
        className="absolute right-0 bottom-0 z-10 h-auto w-40 translate-x-6 transition-transform duration-500 ease-(--ease-sr) group-hover:translate-x-3 group-hover:-translate-y-1 group-hover:scale-105"
      />
      <span className="absolute bottom-3 left-4 z-20 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-sr-blue-600 shadow-sr-1 transition-transform duration-300 group-hover:-translate-y-0.5">
        <HandPointingIcon weight="fill" className="size-3" />
        Lihat profil
      </span>
    </div>
  );
}

function MentorBack({ mentor }: { mentor: Mentor }) {
  return (
    <div className="absolute inset-0 flex rotate-y-180 flex-col gap-4 overflow-hidden rounded-sr-lg sr-card-blue p-5 text-left backface-hidden">
      <div className="pointer-events-none absolute -top-12 -right-12 size-40 rounded-full border-[20px] border-white/10" />
      <div className="border-b border-white/20 pb-3">
        <p className="text-[11px] font-semibold tracking-wide text-sr-sun-400 uppercase">Mentor Habitutor</p>
        <h3 className="text-lg font-bold">{mentor.name}</h3>
      </div>

      <dl className="space-y-2.5 text-sm">
        <div className="flex items-start gap-2">
          <GraduationCapIcon weight="duotone" className="mt-0.5 size-4.5 shrink-0 text-sr-sun-400" />
          <div>
            <dt className="text-[11px] text-white/70">Kuliah di</dt>
            <dd className="font-semibold">
              {mentor.major}, {mentor.university}
            </dd>
          </div>
        </div>
        {mentor.mentor && (
          <div className="flex items-start gap-2">
            <SealCheckIcon weight="duotone" className="mt-0.5 size-4.5 shrink-0 text-sr-sun-400" />
            <div>
              <dt className="text-[11px] text-white/70">Pengajar subtes</dt>
              <dd className="font-semibold">{mentor.mentor}</dd>
            </div>
          </div>
        )}
        {mentor.score_snbt && (
          <div className="flex items-start gap-2">
            <TrophyIcon weight="duotone" className="mt-0.5 size-4.5 shrink-0 text-sr-sun-400" />
            <div>
              <dt className="text-[11px] text-white/70">Skor SNBT 2025</dt>
              <dd className="text-2xl font-extrabold text-sr-sun-400">{mentor.score_snbt}</dd>
            </div>
          </div>
        )}
      </dl>

      <div className="mt-auto flex items-center justify-between gap-2">
        <Link
          to="/login"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex sr-action items-center gap-1 rounded-full sr-card-sun px-3 py-1.5 text-xs font-bold"
        >
          Belajar bareng
          <ArrowRightIcon weight="bold" />
        </Link>
        <span className="flex items-center gap-1 text-[11px] text-white/80">
          <ArrowArcLeftIcon weight="bold" className="size-3.5" />
          Balik
        </span>
      </div>
    </div>
  );
}

function MentorCard({ mentor, index }: { mentor: Mentor; index: number }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      className="group h-80 w-56 shrink-0 snap-center perspective-[1200px] md:w-60"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.08 }}
    >
      <motion.div
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        aria-label={`Profil ${mentor.name}`}
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={(e) => {
          if (e.key !== "Enter" && e.key !== " ") return;
          e.preventDefault();
          setFlipped((f) => !f);
        }}
        className="relative h-full w-full cursor-pointer rounded-sr-lg transform-3d focus-visible:ring-4 focus-visible:ring-sr-blue-300 focus-visible:outline-none"
        animate={{ rotateY: flipped ? 180 : 0 }}
        whileHover={{ y: -8 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 180, damping: 20 }}
      >
        <MentorFace mentor={mentor} index={index} />
        <MentorBack mentor={mentor} />
      </motion.div>
    </motion.div>
  );
}

export function Mentors() {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: number) => {
    trackRef.current?.scrollBy({ left: dir * 260, behavior: "smooth" });
  };

  return (
    <motion.div
      className="relative overflow-hidden rounded-sr-xl border border-white bg-linear-to-br from-white via-sr-blue-50 to-sr-sun-100 py-10 shadow-sr-2 md:py-14"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6 }}
    >
      <div className="pointer-events-none absolute -top-20 -left-20 size-72 rounded-full bg-sr-blue-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -bottom-20 size-72 rounded-full bg-sr-sun-200/60 blur-3xl" />

      <div className="relative flex flex-col gap-8 px-5 md:px-10">
        <div className="flex flex-col items-center gap-4 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            className="md:items-start md:text-left"
            eyebrow="Mentor Terverifikasi"
            title={
              <>
                Belajar Lebih <span className="font-sr-serif text-sr-blue-600 italic">Percaya Diri</span> Dengan
                Pengajar Terpercaya
              </>
            }
            description="Mentor dari berbagai universitas siap menemani proses belajarmu. Klik kartunya untuk kenalan!"
          />
          <div className="hidden shrink-0 gap-2 md:flex">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label="Mentor sebelumnya"
              className="flex size-11 sr-action items-center justify-center rounded-full border border-sr-line bg-white text-sr-blue-600 shadow-sr-1"
            >
              <ArrowLeftIcon weight="bold" className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label="Mentor berikutnya"
              className="flex size-11 sr-action items-center justify-center rounded-full bg-sr-blue-500 text-white shadow-sr-2"
            >
              <ArrowRightIcon weight="bold" className="size-5" />
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pt-2 pb-6 [scrollbar-width:none] md:-mx-10 md:gap-5 md:px-10 [&::-webkit-scrollbar]:hidden"
        >
          {DATA.mentor.map((mentor, i) => (
            <MentorCard key={mentor.id} mentor={mentor} index={i} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
