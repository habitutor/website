import { BookOpenIcon, BrainIcon, CheckIcon, ExamIcon, ShieldCheckIcon, XIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useMemo } from "react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { getWeekDots } from "./streak-celebration";
import { StreakFlame } from "./streak-flame";

interface StreakDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  streak: number;
  saves: number;
  maxSaves: number;
  completedToday: boolean;
}

const TRIGGERS = [
  {
    icon: BookOpenIcon,
    title: "Materi kelas",
    label: "Video, catatan, atau latihan soal",
    tint: "bg-sr-blue-50 text-sr-blue-600",
  },
  { icon: BrainIcon, title: "Brain Gym", label: "Selesaikan satu sesi", tint: "bg-sr-sun-100 text-sr-amber-700" },
  { icon: ExamIcon, title: "Try Out", label: "Selesaikan satu Try Out", tint: "bg-sr-orange-100 text-sr-orange-700" },
] as const;

const SPRING = [0.34, 1.56, 0.64, 1] as const;

function StreakHero({ streak, completedToday }: { streak: number; completedToday: boolean }) {
  const weekDots = useMemo(() => getWeekDots(streak, completedToday), [streak, completedToday]);

  return (
    <div className="relative overflow-hidden bg-[radial-gradient(28rem_18rem_at_50%_20%,#ff9a3c40,transparent_70%),linear-gradient(180deg,#1b2a5e,#14224e)] px-4 pt-6 pb-4 text-center sm:px-6 sm:pt-8 sm:pb-6 [@media(max-height:760px)]:pt-5 [@media(max-height:760px)]:pb-4">
      {completedToday && (
        <motion.div
          aria-hidden
          className="absolute top-1 left-1/2 size-32 -translate-x-1/2 rounded-full bg-[conic-gradient(from_0deg,transparent,#ffc83d2e,transparent,#ff9a3c2e,transparent)] sm:top-2 sm:size-44"
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      )}

      <motion.div
        className="relative mx-auto w-16 sm:w-24 [@media(max-height:760px)]:w-16"
        initial={{ scale: 0.5, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: SPRING }}
      >
        <StreakFlame lit={completedToday} className="h-auto w-full" />
      </motion.div>

      <DialogTitle className="relative mt-1 text-5xl leading-none font-black text-white tabular-nums sm:text-6xl [@media(max-height:760px)]:text-5xl">
        {streak}
      </DialogTitle>
      <p className="relative mt-1 text-xs font-bold tracking-[0.2em] text-sr-sun-400 uppercase">hari beruntun</p>

      <DialogDescription asChild>
        <span
          className={cn(
            "relative mt-2.5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold sm:mt-3 sm:text-xs",
            completedToday ? "bg-sr-live/20 text-[#7ee2b8]" : "bg-white/10 text-white/80",
          )}
        >
          {completedToday ? (
            <>
              <CheckIcon weight="bold" className="size-3.5" /> Api kamu udah menyala hari ini
            </>
          ) : (
            "Belum belajar hari ini, yuk nyalakan apinya!"
          )}
        </span>
      </DialogDescription>

      <div className="relative mt-4 flex justify-between rounded-sr-lg bg-white/8 px-2 py-2.5 ring-1 ring-white/10 sm:mt-5 sm:px-3 sm:py-3">
        {weekDots.map((dot, i) => (
          <div key={dot.label} className="flex flex-col items-center gap-1.5">
            <span
              className={cn("text-[10px] font-bold sm:text-[11px]", dot.isToday ? "text-sr-sun-400" : "text-white/60")}
            >
              {dot.label}
            </span>
            <motion.span
              className={cn(
                "flex size-7 items-center justify-center rounded-full sm:size-8",
                dot.lit ? "bg-linear-to-b from-sr-sun-400 to-sr-orange-500 text-white" : "bg-white/12",
                dot.isToday && "ring-2 ring-sr-sun-400 ring-offset-2 ring-offset-[#14224e]",
              )}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05, duration: 0.35, ease: SPRING }}
            >
              {dot.lit && <CheckIcon weight="bold" className="size-3.5 sm:size-4" />}
            </motion.span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StreakSaves({ saves, maxSaves }: { saves: number; maxSaves: number }) {
  return (
    <div className="rounded-sr-md border border-sr-line bg-sr-blue-50/70 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-sr-sm bg-sr-blue-500 text-white shadow-sr-1">
            <ShieldCheckIcon weight="fill" className="size-5" />
          </span>
          <div className="min-w-0 text-left">
            <p className="text-sm font-extrabold text-sr-ink">Streak Saves</p>
            <p className="hidden text-xs text-sr-muted sm:block">Penjaga streak kalau kamu kelewat sehari</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {Array.from({ length: maxSaves }).map((_, i) => (
            <StreakFlame key={i} lit={i < saves} animated={false} className="h-6 w-5" />
          ))}
          <span className="ml-1 text-sm font-extrabold text-sr-ink tabular-nums">
            {saves}/{maxSaves}
          </span>
        </div>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-sr-ink-2 sm:text-xs">
        Kelewat satu hari? Tenang, 1 Save otomatis dipakai. Save baru muncul tiap 7 hari (maksimal {maxSaves}).
      </p>
    </div>
  );
}

export function StreakDialog({ open, onOpenChange, streak, saves, maxSaves, completedToday }: StreakDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[calc(100dvh-1.5rem)] max-w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden rounded-sr-xl border-0 p-0 shadow-sr-3 sm:max-h-[calc(100dvh-3rem)] sm:max-w-md"
      >
        <DialogClose
          aria-label="Tutup"
          className="absolute top-3 right-3 z-20 flex size-8 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
        >
          <XIcon weight="bold" className="size-4" />
        </DialogClose>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <StreakHero streak={streak} completedToday={completedToday} />

          <div className="space-y-4 bg-white px-4 pt-4 pb-2 sm:px-5 sm:pt-5">
            <StreakSaves saves={saves} maxSaves={maxSaves} />

            <div>
              <p className="mb-2 text-sm font-extrabold text-sr-ink">
                Cara nambah streak <span className="font-semibold text-sr-muted">(1x per hari)</span>
              </p>
              <div className="grid grid-cols-3 gap-2">
                {TRIGGERS.map((trigger, i) => (
                  <motion.div
                    key={trigger.title}
                    className="flex flex-col items-center gap-1 rounded-sr-md border border-sr-line bg-white p-2 text-center shadow-sr-1 sm:gap-1.5 sm:p-2.5"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.07 }}
                  >
                    <span
                      className={cn("flex size-8 items-center justify-center rounded-full sm:size-9", trigger.tint)}
                    >
                      <trigger.icon weight="duotone" className="size-4.5 sm:size-5" />
                    </span>
                    <span className="text-[11px] font-extrabold text-sr-ink sm:text-xs">{trigger.title}</span>
                    <span className="hidden text-[11px] leading-snug text-sr-muted sm:block">{trigger.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 bg-white px-4 pt-3 pb-4 sm:px-5 sm:pb-5">
          {completedToday ? (
            <DialogClose className="w-full cursor-pointer rounded-sr-md border-b-4 border-sr-blue-800 bg-sr-blue-500 py-3 text-sm font-extrabold tracking-wide text-white uppercase transition-[transform,border-width] active:translate-y-1 active:border-b-0">
              Mantap, lanjut besok!
            </DialogClose>
          ) : (
            <Link
              to="/classes"
              onClick={() => onOpenChange(false)}
              className="block w-full rounded-sr-md border-b-4 border-sr-amber bg-sr-sun-500 py-3 text-center text-sm font-extrabold tracking-wide text-sr-ink uppercase transition-[transform,border-width] active:translate-y-1 active:border-b-0"
            >
              Nyalakan api hari ini
            </Link>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
