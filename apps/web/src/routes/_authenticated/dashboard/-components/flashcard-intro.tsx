import { TimerIcon } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useState } from "react";

const INTRO_MS = 5000;

export const FlashcardIntro = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState(3);

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate({ to: "/dashboard/flashcard" });
    }, INTRO_MS);
    const tick = setInterval(() => setCount((c) => Math.max(c - 1, 0)), 1000);
    return () => {
      clearTimeout(timeout);
      clearInterval(tick);
    };
  }, [navigate]);

  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center">
      <m.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative w-full max-w-3xl overflow-hidden rounded-sr-xl sr-card-sun px-6 pt-8 pb-44 text-center sm:px-10 sm:py-12 sm:pr-80 sm:text-left"
      >
        <div className="pointer-events-none absolute -top-24 -right-20 size-72 rounded-full bg-white/30" />

        <span className="relative inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-sm font-extrabold text-sr-ink tabular-nums">
          <TimerIcon weight="bold" className="size-4 text-sr-orange-500" /> 10:00
        </span>
        <h1 className="relative mt-4 text-4xl leading-tight font-extrabold text-sr-ink sm:text-6xl">Mari Mulai!</h1>
        <p className="relative mt-2 text-sm font-medium text-sr-ink-2 sm:text-lg">
          Kamu punya sepuluh menit untuk mengerjakan semua soal
        </p>

        <div className="relative mt-6 flex items-center justify-center gap-3 sm:justify-start">
          <div className="relative flex size-14 items-center justify-center overflow-hidden rounded-full bg-sr-ink text-2xl font-black text-white">
            <AnimatePresence mode="popLayout" initial={false}>
              <m.span
                key={count}
                initial={{ y: 24, opacity: 0, scale: 0.6 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -24, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {count > 0 ? count : "Go"}
              </m.span>
            </AnimatePresence>
          </div>
          <div className="h-2 w-40 overflow-hidden rounded-full bg-white/50 sm:w-56">
            <m.div
              className="h-full rounded-full bg-sr-ink"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: INTRO_MS / 1000, ease: "linear" }}
            />
          </div>
        </div>

        <m.img
          src="/avatar/subtest/hab.webp"
          alt=""
          className="pointer-events-none absolute right-1/2 bottom-0 h-40 w-auto translate-x-1/2 select-none sm:right-10 sm:h-64 sm:translate-x-0"
          initial={{ y: 60 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </m.div>
    </div>
  );
};
