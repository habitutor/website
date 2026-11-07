import { CheckIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { StreakFlame } from "./streak-flame";

const SPRING = [0.34, 1.56, 0.64, 1] as const;
const CONFETTI_COLORS = ["#ffc83d", "#ff9a3c", "#2f6bff", "#8fb2ff", "#17a36f", "#f08a4b"];
const WEEKDAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

type StreakCelebrationProps = {
  variant?: "belajar" | "braingym";
  open: boolean;
  from: number;
  to: number;
  onClose: () => void;
};

function getBrainGymMessage(streak: number) {
  if (streak === 1)
    return { title: "Streak Brain Gym dimulai!", body: "Otakmu baru dipanaskan. Lanjut lagi besok ya!" };
  if (streak === 7) return { title: "7 hari Brain Gym berturut-turut!", body: "Otakmu makin terasah. Pertahankan!" };
  return { title: `${streak} hari Brain Gym beruntun!`, body: "Latihan harianmu terjaga. Lanjut besok ya!" };
}

function getMessage(streak: number) {
  if (streak === 1) return { title: "Api pertamamu menyala!", body: "Awal yang keren. Besok nyalain lagi, ya!" };
  if (streak === 3) return { title: "3 hari berturut-turut!", body: "Kebiasaan mulai terbentuk. Pertahankan!" };
  if (streak === 7) return { title: "Seminggu penuh! 🎉", body: "Kamu konsisten banget minggu ini. Bangga!" };
  if (streak === 14) return { title: "2 minggu tanpa putus!", body: "Disiplinmu udah level pejuang PTN sejati." };
  if (streak === 30) return { title: "Sebulan penuh! 🏆", body: "Luar biasa! Ini yang namanya habit." };
  if (streak % 50 === 0) return { title: `${streak} hari, legendaris!`, body: "Kursi PTN impianmu makin dekat." };
  return { title: `${streak} hari beruntun!`, body: "Mantap! Kamu udah belajar hari ini. Gas terus!" };
}

// Hari dalam minggu ini (Senin–Minggu) yang termasuk rentang streak; kalau hari ini belum belajar, rentangnya berakhir kemarin.
export function getWeekDots(streak: number, includesToday = true) {
  const todayIndex = (new Date().getDay() + 6) % 7;
  const endIndex = includesToday ? todayIndex : todayIndex - 1;
  return WEEKDAY_LABELS.map((label, i) => ({
    label,
    isToday: i === todayIndex,
    lit: i <= endIndex && endIndex - i < streak,
  }));
}

export function Confetti({ className = "fixed top-1/3 left-1/2" }: { className?: string }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 32 }, (_, i) => {
        const angle = (i / 32) * Math.PI * 2 + Math.random() * 0.4;
        const distance = 140 + Math.random() * 160;
        return {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance - 60,
          rotate: Math.random() * 540 - 270,
          color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          size: 6 + Math.random() * 6,
          round: i % 3 === 0,
          delay: Math.random() * 0.15,
        };
      }),
    [],
  );

  return (
    <div aria-hidden className={cn("pointer-events-none", className)}>
      {pieces.map((piece, i) => (
        <motion.span
          key={i}
          className={cn("absolute block", piece.round ? "rounded-full" : "rounded-[2px]")}
          style={{ width: piece.size, height: piece.round ? piece.size : piece.size * 1.6, background: piece.color }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0 }}
          animate={{
            x: piece.x,
            y: [0, piece.y, piece.y + 220],
            opacity: [1, 1, 0],
            rotate: piece.rotate,
            scale: 1,
          }}
          transition={{ duration: 1.8, delay: 0.35 + piece.delay, ease: "easeOut", times: [0, 0.45, 1] }}
        />
      ))}
    </div>
  );
}

function RollingNumber({ from, to }: { from: number; to: number }) {
  return (
    <div className="relative h-20 overflow-hidden text-7xl leading-[5rem] font-black text-white tabular-nums drop-shadow-[0_4px_0_rgb(180_82_26/0.6)]">
      <AnimatePresence initial={false}>
        <motion.span
          key={from}
          className="block"
          initial={{ y: 0 }}
          animate={{ y: "-110%", opacity: 0 }}
          transition={{ delay: 0.75, duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
        >
          {from}
        </motion.span>
      </AnimatePresence>
      <motion.span
        className="absolute inset-0 block text-center"
        initial={{ y: "110%" }}
        animate={{ y: 0 }}
        transition={{ delay: 0.8, duration: 0.55, ease: SPRING }}
      >
        {to}
      </motion.span>
    </div>
  );
}

export function StreakCelebration({ open, from, to, onClose, variant = "belajar" }: StreakCelebrationProps) {
  const isBrain = variant === "braingym";
  const message = isBrain ? getBrainGymMessage(to) : getMessage(to);
  const weekDots = useMemo(() => getWeekDots(to), [to]);

  useEffect(() => {
    if (!open) return;
    navigator.vibrate?.([30, 50, 80]);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="streak-celebration-title"
          className="fixed inset-0 z-[100] flex justify-center overflow-x-hidden overflow-y-auto overscroll-contain px-5 py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            className="fixed inset-0 cursor-default bg-[radial-gradient(60rem_40rem_at_50%_35%,#ff9a3c55,transparent_60%),linear-gradient(180deg,#14224ef0,#0b1433f5)] backdrop-blur-sm"
          />
          <Confetti />

          <motion.div
            className="relative my-auto flex w-full max-w-sm flex-col items-center text-center"
            initial={{ y: 40, scale: 0.9 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 30, scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.45, ease: SPRING }}
          >
            <motion.div
              className="absolute top-4 size-44 rounded-full bg-[conic-gradient(from_0deg,transparent,#ffc83d33,transparent,#ff9a3c33,transparent)] sm:top-6 sm:size-56"
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />

            <motion.div
              className="relative w-28 sm:w-36 [@media(max-height:700px)]:w-24"
              initial={{ scale: 0, y: 60, rotate: -20 }}
              animate={{ scale: [0, 1.25, 0.95, 1], y: 0, rotate: [-20, 10, -4, 0] }}
              transition={{ duration: 0.9, delay: 0.1, times: [0, 0.5, 0.75, 1] }}
            >
              <StreakFlame lit tone={isBrain ? "brain" : "fire"} className="h-auto w-full" />
            </motion.div>

            <RollingNumber from={from} to={to} />
            <p className="text-sm font-bold tracking-[0.2em] text-sr-sun-400 uppercase">
              {isBrain ? "hari streak brain gym" : "hari beruntun"}
            </p>

            <motion.h2
              id="streak-celebration-title"
              className="mt-4 text-2xl font-extrabold text-white"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              {message.title}
            </motion.h2>
            <motion.p
              className="mt-1 text-sm text-white/75"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              {message.body}
            </motion.p>

            <div className="mt-6 flex w-full justify-between rounded-sr-lg bg-white/8 px-3 py-3 ring-1 ring-white/10">
              {weekDots.map((dot, i) => (
                <div key={dot.label} className="flex flex-col items-center gap-1.5">
                  <span className={cn("text-[11px] font-bold", dot.isToday ? "text-sr-sun-400" : "text-white/60")}>
                    {dot.label}
                  </span>
                  <motion.span
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full",
                      dot.lit ? "bg-linear-to-b from-sr-sun-400 to-sr-orange-500 text-white" : "bg-white/12",
                      dot.isToday && "ring-2 ring-sr-sun-400 ring-offset-2 ring-offset-[#14224e]",
                    )}
                    initial={dot.lit ? { scale: 0 } : false}
                    animate={{ scale: dot.isToday ? [0, 1.35, 1] : 1 }}
                    transition={{ delay: 1.3 + i * 0.08, duration: 0.4, ease: SPRING }}
                  >
                    {dot.lit && <CheckIcon weight="bold" className="size-4" />}
                  </motion.span>
                </div>
              ))}
            </div>

            <motion.button
              type="button"
              autoFocus
              onClick={onClose}
              className="mt-7 w-full cursor-pointer rounded-sr-md border-b-4 border-sr-amber bg-sr-sun-500 py-3.5 text-base font-extrabold tracking-wide text-sr-ink uppercase transition-[transform,border-width] active:translate-y-1 active:border-b-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 }}
            >
              Lanjut belajar!
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
