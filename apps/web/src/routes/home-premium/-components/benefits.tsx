import { SparkleIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { SectionHeading, TiltCard } from "@/routes/-home/motion-bits";
import { PREMIUM_DATA } from "./data";

const CARD_TONES = [
  { card: "from-white via-sr-blue-50 to-sr-blue-100", blob: "bg-sr-blue-200/70", number: "text-sr-blue-200" },
  { card: "from-white via-sr-ivory to-sr-sun-100", blob: "bg-sr-sun-200/80", number: "text-sr-sun-200" },
  { card: "from-white via-sr-ivory to-sr-orange-100", blob: "bg-sr-orange-200/70", number: "text-sr-orange-200" },
];

export function Benefits() {
  const { benefits, comingSoon } = PREMIUM_DATA;

  return (
    <div className="container mx-auto space-y-10 px-4 md:px-0">
      <SectionHeading
        eyebrow="Isi Paket"
        title={
          <>
            Yang <span className="font-sr-serif text-sr-blue-600 italic">Lo Dapet</span>
          </>
        }
        description="Sekali bayar, semuanya kebuka selama masa aktif paket lo."
      />

      <div className="grid gap-5 md:grid-cols-3 md:gap-6">
        {benefits.map((benefit, index) => {
          const tone = CARD_TONES[index % CARD_TONES.length];

          return (
            <motion.div
              key={benefit.title}
              className="h-full"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: index * 0.12, ease: [0.2, 0.7, 0.2, 1] }}
            >
              <TiltCard
                maxTilt={7}
                whileHover={{ y: -6 }}
                className={cn(
                  "group flex h-full flex-col gap-4 overflow-hidden rounded-sr-lg border border-white bg-linear-to-br p-6 shadow-sr-1 transition-shadow duration-500 hover:shadow-sr-3 md:p-7",
                  tone.card,
                )}
              >
                <div
                  className={cn(
                    "pointer-events-none absolute -right-14 -bottom-14 size-48 animate-sr-drift rounded-full blur-2xl transition-transform duration-700 group-hover:scale-125",
                    tone.blob,
                  )}
                />
                <span
                  className={cn(
                    "pointer-events-none absolute top-3 right-5 text-6xl font-black select-none md:text-7xl",
                    tone.number,
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                <motion.div
                  className={cn(
                    "relative flex size-14 items-center justify-center rounded-sr-md border-2 shadow-sr-1 transition-transform duration-500 group-hover:-rotate-6",
                    benefit.iconClassName,
                  )}
                  initial={{ scale: 0, rotate: -30 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 380, damping: 14, delay: 0.25 + index * 0.12 }}
                >
                  <benefit.icon size={30} weight="duotone" />
                </motion.div>
                <h3 className="relative pr-10 text-lg leading-snug font-bold text-pretty text-sr-ink md:text-xl">
                  {benefit.title}
                </h3>
                <p className="relative text-sm leading-relaxed text-sr-ink-2 md:text-base">{benefit.description}</p>
              </TiltCard>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        className="sr-sheen relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-sr-lg border-2 border-sr-sun-400 bg-linear-to-r from-sr-sun-100 via-white to-sr-sun-100 px-6 py-5 text-center shadow-sr-sun sm:flex-row sm:gap-4 sm:text-left"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-sr-amber px-3 py-1 text-xs font-bold whitespace-nowrap text-white shadow-sr-1">
          <motion.span
            className="inline-flex"
            animate={{ rotate: [0, 20, -10, 0], scale: [1, 1.25, 1] }}
            transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1 }}
          >
            <SparkleIcon size={14} weight="fill" />
          </motion.span>
          {comingSoon.label}
        </span>
        <p className="text-xs font-medium text-sr-ink-2 sm:text-sm">{comingSoon.description}</p>
      </motion.div>
    </div>
  );
}
