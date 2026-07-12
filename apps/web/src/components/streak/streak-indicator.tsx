import { FlameIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";
import { StreakDialog } from "./streak-dialog";

export function StreakIndicator() {
  const { data } = useQuery(orpc.streak.get.queryOptions());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const prevStreakRef = useRef<number | null>(null);

  useEffect(() => {
    if (!data) return;
    const prev = prevStreakRef.current;
    prevStreakRef.current = data.streak;
    if (prev !== null && data.streak > prev) {
      setCelebrate(true);
      setDialogOpen(true);
    }
  }, [data]);

  const lit = data?.completedToday ?? false;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setCelebrate(false);
          setDialogOpen(true);
        }}
        aria-label="Lihat streak belajar"
        className="flex cursor-pointer items-center gap-1 rounded-full border-2 border-neutral-200 bg-neutral-50 py-1 pr-3 pl-2 transition-colors hover:bg-neutral-100"
      >
        <FlameIcon weight="fill" className={cn("size-5", lit ? "text-orange-500" : "text-neutral-400")} />
        <span className={cn("text-sm font-bold", lit ? "text-orange-600" : "text-neutral-500")}>
          {data?.streak ?? 0}
        </span>
      </button>

      <StreakDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setCelebrate(false);
        }}
        celebrate={celebrate}
        streak={data?.streak ?? 0}
        saves={data?.saves ?? 0}
        maxSaves={data?.maxSaves ?? 3}
        completedToday={lit}
      />
    </>
  );
}
