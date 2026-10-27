import { CalendarCheckIcon, ChalkboardTeacherIcon, LightningIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Float, SectionHeading } from "@/routes/-home/motion-bits";

const INSTAGRAM_POST_EMBED_URL = "https://www.instagram.com/p/DbxGncHD5CT/embed/";

const SCHEDULE_BADGES = [
  {
    icon: ChalkboardTeacherIcon,
    label: "150+ live class",
    className: "top-16 -left-36",
    tint: "bg-sr-blue-500 text-white",
  },
  {
    icon: CalendarCheckIcon,
    label: "Agustus – Desember 1–2x/minggu",
    className: "top-1/2 -right-44",
    tint: "sr-card-sun",
  },
  {
    icon: LightningIcon,
    label: "Makin deket SNBT, makin intensif",
    className: "bottom-20 -left-44",
    tint: "bg-sr-orange-500 text-white",
  },
];

export function StudySchedule() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-sr-blue-50 via-white to-sr-ivory">
      <div className="pointer-events-none absolute top-1/4 -left-32 size-96 rounded-full bg-sr-blue-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 size-96 rounded-full bg-sr-sun-200/50 blur-3xl" />

      <div className="relative container mx-auto flex w-full flex-col items-center justify-start gap-8 px-4 py-12 md:py-14">
        <SectionHeading
          eyebrow="Jadwal Belajar"
          title={
            <>
              Jadwal <span className="font-sr-serif text-sr-blue-600 italic">Belajar</span>
            </>
          }
          description="Jadwal belajar 150+ live class"
        />

        <motion.div
          className="relative w-full max-w-[560px]"
          initial={{ opacity: 0, y: 40, rotate: -2 }}
          whileInView={{ opacity: 1, y: 0, rotate: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 120, damping: 16 }}
        >
          {SCHEDULE_BADGES.map((badge, i) => (
            <motion.div
              key={badge.label}
              className={cn("absolute z-10 hidden lg:block", badge.className)}
              initial={{ opacity: 0, scale: 0.6 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 260, damping: 15, delay: 0.4 + i * 0.15 }}
            >
              <Float distance={8} duration={3.4 + i * 0.5} delay={i * 0.4}>
                <span
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full py-2 pr-4 pl-2 text-sm font-semibold whitespace-nowrap shadow-sr-2",
                    badge.tint,
                  )}
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-white/25">
                    <badge.icon weight="fill" className="size-4.5" />
                  </span>
                  {badge.label}
                </span>
              </Float>
            </motion.div>
          ))}

          <div className="rounded-[2rem] border border-white bg-linear-to-br from-sr-blue-100 via-white to-sr-sun-100 p-3 shadow-sr-3 md:p-4">
            <iframe
              src={INSTAGRAM_POST_EMBED_URL}
              title="Jadwal Belajar Habitutor di Instagram"
              loading="lazy"
              allowTransparency
              className="h-[640px] w-full rounded-sr-lg border border-sr-line bg-white"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
