import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";
import { StreakCelebration } from "./streak-celebration";
import { StreakDialog } from "./streak-dialog";
import { StreakFlame } from "./streak-flame";

export function StreakIndicator({ autoOpenBlocked = false }: { autoOpenBlocked?: boolean }) {
  const { data } = useQuery(orpc.streak.get.queryOptions());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [celebration, setCelebration] = useState<{ from: number; to: number } | null>(null);
  const prevStreakRef = useRef<number | null>(null);

  useEffect(() => {
    if (!data) return;
    const prev = prevStreakRef.current;
    prevStreakRef.current = data.streak;
    if (prev !== null && data.streak > prev) setCelebration({ from: prev, to: data.streak });
  }, [data]);

  // Hanya di mode dev: buka halaman dengan ?preview-streak untuk melihat animasi perayaan tanpa menunggu besok.
  useEffect(() => {
    if (!import.meta.env.DEV || !data) return;
    if (!new URLSearchParams(window.location.search).has("preview-streak")) return;
    setCelebration({ from: data.streak, to: data.streak + 1 });
  }, [data]);

  const closeCelebration = useCallback(() => setCelebration(null), []);
  const lit = data?.completedToday ?? false;
  const streak = data?.streak ?? 0;

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setDialogOpen(true)}
        aria-label="Lihat streak belajar"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.92 }}
        className={cn(
          "flex cursor-pointer items-center gap-1 rounded-full border-2 py-0.5 pr-3 pl-1.5 transition-colors duration-300",
          lit
            ? "border-sr-orange-200 bg-linear-to-b from-sr-sun-100 to-sr-orange-100 hover:border-sr-orange-500"
            : "border-neutral-200 bg-neutral-50 hover:border-sr-sun-400 hover:bg-sr-sun-100",
        )}
      >
        <StreakFlame lit={lit} className="h-7 w-6" />
        <motion.span
          key={streak}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={cn("text-sm font-extrabold tabular-nums", lit ? "text-sr-orange-700" : "text-neutral-500")}
        >
          {streak}
        </motion.span>
      </motion.button>

      <StreakCelebration
        open={Boolean(celebration) && !autoOpenBlocked}
        from={celebration?.from ?? 0}
        to={celebration?.to ?? 0}
        onClose={closeCelebration}
      />

      <StreakDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        streak={streak}
        saves={data?.saves ?? 0}
        maxSaves={data?.maxSaves ?? 3}
        completedToday={lit}
      />
    </>
  );
}
