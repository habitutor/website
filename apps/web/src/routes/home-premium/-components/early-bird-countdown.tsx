import { useEffect, useState } from "react";

const FIRST_DEADLINE = new Date("2026-07-23T00:46:00+07:00").getTime();
const DEADLINE_INTERVAL = 2 * 24 * 60 * 60 * 1000;

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export function getEarlyBirdCountdown(now = Date.now()): Countdown {
  const elapsedIntervals = Math.max(0, Math.floor((now - FIRST_DEADLINE) / DEADLINE_INTERVAL) + 1);
  const deadline = FIRST_DEADLINE + elapsedIntervals * DEADLINE_INTERVAL;
  const remaining = Math.max(0, deadline - now);

  return {
    days: Math.floor(remaining / (24 * 60 * 60 * 1000)),
    hours: Math.floor((remaining / (60 * 60 * 1000)) % 24),
    minutes: Math.floor((remaining / (60 * 1000)) % 60),
    seconds: Math.floor((remaining / 1000) % 60),
  };
}

const UNITS = [
  ["days", "Hari"],
  ["hours", "Jam"],
  ["minutes", "Menit"],
  ["seconds", "Detik"],
] as const;

export function EarlyBirdCountdown() {
  const [countdown, setCountdown] = useState<Countdown>();

  useEffect(() => {
    const updateCountdown = () => setCountdown(getEarlyBirdCountdown());

    updateCountdown();
    const interval = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="mt-4 rounded-xl border border-primary-100 bg-primary-400/60 p-3">
      <p className="text-center text-sm font-bold tracking-wide text-neutral-100 uppercase">
        early bird price extended
      </p>
      <div className="mt-2 grid grid-cols-4 gap-2" role="timer" aria-live="off">
        {UNITS.map(([key, label]) => (
          <div key={key} className="rounded-lg bg-primary-500 px-1 py-2 text-center">
            <p className="font-mono text-xl font-black text-secondary-200 sm:text-2xl">
              {countdown ? String(countdown[key]).padStart(2, "0") : "--"}
            </p>
            <p className="text-[10px] font-semibold text-tertiary-100 sm:text-xs">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
