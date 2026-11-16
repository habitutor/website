import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { type PtnEvent, useCountdownParts } from "../-lib";

const pad = (value: number) => value.toString().padStart(2, "0");

function Tile({ value, label, tone }: { value: number; label: string; tone: "light" | "dark" }) {
  return (
    <div
      className={cn(
        "flex min-w-14 flex-1 flex-col items-center rounded-sr-md px-2 py-2.5 sm:min-w-16 sm:py-3",
        tone === "dark"
          ? "bg-white/12 text-white ring-1 ring-white/20 backdrop-blur"
          : "bg-sr-blue-50 text-sr-blue-700 ring-1 ring-sr-blue-100",
      )}
    >
      <span className="relative h-8 overflow-hidden text-2xl leading-8 font-black tabular-nums sm:h-9 sm:text-3xl sm:leading-9">
        <motion.span
          key={value}
          initial={{ y: -14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
          className="block"
        >
          {pad(value)}
        </motion.span>
      </span>
      <span className={cn("mt-0.5 text-[10px] font-bold tracking-wider uppercase", tone === "dark" ? "text-white/70" : "text-sr-muted")}>
        {label}
      </span>
    </div>
  );
}

/** Hitung mundur besar (hari : jam : menit : detik). Hanya tampil untuk event yang belum mulai. */
export function CountdownTiles({ event, tone = "dark" }: { event: PtnEvent; tone?: "light" | "dark" }) {
  const parts = useCountdownParts(event.startsAt, event.phase === "upcoming" && event.scheduleStatus !== "cancelled");
  if (!parts) return null;
  return (
    <div role="timer" aria-label="Hitung mundur menuju event" className="flex w-full max-w-sm items-stretch gap-2">
      <Tile value={parts.days} label="Hari" tone={tone} />
      <Tile value={parts.hours} label="Jam" tone={tone} />
      <Tile value={parts.minutes} label="Menit" tone={tone} />
      <Tile value={parts.seconds} label="Detik" tone={tone} />
    </div>
  );
}
