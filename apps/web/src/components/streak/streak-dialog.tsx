import { BookOpenIcon, BrainIcon, ExamIcon, FlameIcon, ShieldCheckIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface StreakDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  celebrate: boolean;
  streak: number;
  saves: number;
  maxSaves: number;
  completedToday: boolean;
}

const TRIGGERS = [
  { icon: BookOpenIcon, label: "Selesaikan materi kelas (video, catatan, atau latihan soal)" },
  { icon: BrainIcon, label: "Selesaikan sesi Brain Gym" },
  { icon: ExamIcon, label: "Selesaikan Tryout" },
] as const;

export function StreakDialog({
  open,
  onOpenChange,
  celebrate,
  streak,
  saves,
  maxSaves,
  completedToday,
}: StreakDialogProps) {
  const lit = completedToday || celebrate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{celebrate ? "Streak kamu nyala!" : "Streak Belajar"}</DialogTitle>
          <DialogDescription>
            {celebrate
              ? "Mantap! Kamu udah belajar hari ini, streak kamu bertambah."
              : "Belajar tiap hari biar api kamu tetap menyala."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-2 py-2">
          <motion.div
            key={celebrate ? "celebrate" : "idle"}
            initial={celebrate ? { scale: 0.2, rotate: -15, opacity: 0 } : false}
            animate={celebrate ? { scale: [0.2, 1.35, 1], rotate: [-15, 8, 0], opacity: 1 } : { scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative"
          >
            {celebrate && (
              <motion.div
                className="absolute inset-0 -z-10 rounded-full bg-orange-400/40 blur-xl"
                animate={{ scale: [1, 1.6, 1.2], opacity: [0.8, 0.4, 0.7] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            <FlameIcon weight="fill" className={cn("size-20", lit ? "text-orange-500" : "text-neutral-300")} />
          </motion.div>
          <p className="text-4xl font-bold text-primary">{streak}</p>
          <p className="text-sm font-medium text-muted-foreground">hari beruntun</p>
        </div>

        <div className="flex items-center justify-between rounded-lg border bg-neutral-50 p-3">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon weight="fill" className="size-5 text-primary-300" />
            <span className="text-sm font-medium">Streak Saves</span>
          </div>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: maxSaves }).map((_, i) => (
              <FlameIcon
                key={i}
                weight="fill"
                className={cn("size-5", i < saves ? "text-primary-300" : "text-neutral-300")}
              />
            ))}
            <span className="ml-1 text-sm font-semibold">
              {saves}/{maxSaves}
            </span>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <p className="mb-2 font-semibold">Cara nambah streak (1x per hari):</p>
            <ul className="space-y-1.5">
              {TRIGGERS.map((trigger) => (
                <li key={trigger.label} className="flex items-start gap-2 text-muted-foreground">
                  <trigger.icon weight="duotone" className="mt-0.5 size-4 shrink-0 text-primary-300" />
                  {trigger.label}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-muted-foreground">
            Kelewat satu hari? Tenang, 1 Streak Save otomatis dipakai buat jagain streak kamu. Save baru muncul tiap 7
            hari (maksimal {maxSaves}).
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
