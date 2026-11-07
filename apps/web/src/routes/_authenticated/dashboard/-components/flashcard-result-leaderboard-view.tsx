import { CrownSimpleIcon, TrophyIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/browser/use-mobile";
import { cn } from "@/lib/utils";
import { PODIUM_ORDER } from "./flashcard-result-animations";
import type { LeaderboardEntry } from "./flashcard-result-leaderboard-model";

type PodiumSize = { blockH: number; avatarW: number };

const SIZES: Record<number, PodiumSize> = {
  1: { blockH: 170, avatarW: 130 },
  2: { blockH: 130, avatarW: 110 },
  3: { blockH: 108, avatarW: 92 },
};

const SIZES_MOBILE: Record<number, PodiumSize> = {
  1: { blockH: 104, avatarW: 72 },
  2: { blockH: 84, avatarW: 60 },
  3: { blockH: 68, avatarW: 52 },
};

// Juara 3 naik dulu, lalu 2, terakhir juara 1 supaya terasa seperti tangga yang dibangun satu per satu.
const BUILD_ORDER: Record<number, number> = { 3: 0, 2: 1, 1: 2 };
const STEP = 0.4;
const GROW = 0.7;
const EASE_SPRING = [0.34, 1.4, 0.64, 1] as const;

const TONES: Record<number, { bar: string; rank: string }> = {
  1: { bar: "border-sr-amber bg-linear-to-b from-sr-sun-200 to-sr-sun-400", rank: "text-sr-amber-700/40" },
  2: { bar: "border-sr-blue-300 bg-linear-to-b from-sr-blue-100 to-sr-blue-300", rank: "text-sr-blue-700/35" },
  3: { bar: "border-sr-orange-500 bg-linear-to-b from-sr-orange-100 to-sr-orange-200", rank: "text-sr-orange-700/35" },
};

const GLOSS = "shadow-[inset_0_10px_18px_rgb(255_255_255/0.6),inset_-8px_0_14px_rgb(20_34_78/0.08)]";

function PodiumItem({ player }: { player: LeaderboardEntry }) {
  const isMobile = useIsMobile();
  const size = (isMobile ? SIZES_MOBILE : SIZES)[player.rank];
  const tone = TONES[player.rank];
  const start = 0.15 + BUILD_ORDER[player.rank] * STEP;
  const sink = isMobile ? 12 : 20;

  return (
    <div className="flex flex-col items-center" style={{ width: size.avatarW + (player.rank === 1 ? 24 : 16) }}>
      <motion.div
        className="relative z-6 shrink-0"
        style={{ width: size.avatarW, height: size.avatarW, marginBottom: -sink }}
        initial={{ opacity: 0, y: 40, scale: 0.6 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: start + GROW * 0.8, ease: EASE_SPRING }}
      >
        {player.rank === 1 && (
          <motion.span
            className="absolute -top-3 left-1/2 z-10 -ml-3 text-sr-sun-500 drop-shadow sm:-top-4 sm:-ml-4"
            animate={{ y: [0, -4, 0], rotate: [-8, 8, -8] }}
            transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <CrownSimpleIcon weight="fill" className="size-6 sm:size-8" />
          </motion.span>
        )}
        <motion.div
          className="size-full cursor-pointer"
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 3 + player.rank * 0.5,
            delay: start + 1.4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          whileHover={{ scale: 1.1, rotate: -4 }}
          whileTap={{ scale: 0.92 }}
        >
          <img
            src={player.image ?? "/default-avatar.png"}
            alt={player.name}
            draggable={false}
            className="size-full object-contain object-bottom drop-shadow-[0_8px_8px_rgba(20,34,78,0.25)] select-none"
            onError={(event) => {
              (event.target as HTMLImageElement).style.display = "none";
            }}
          />
        </motion.div>
      </motion.div>

      <motion.div
        className={cn(
          "relative z-3 flex w-full flex-col items-center overflow-hidden rounded-t-xl border-2 border-b-0 px-1",
          tone.bar,
          GLOSS,
        )}
        initial={{ height: 0 }}
        animate={{ height: size.blockH }}
        transition={{ duration: GROW, delay: start, ease: EASE_SPRING }}
      >
        <div className="flex w-full flex-col items-center pt-5 sm:pt-7" style={{ minHeight: size.blockH }}>
          <p
            className="w-full truncate text-center text-[11px] leading-snug font-extrabold text-sr-ink sm:text-[13px]"
            title={player.name}
          >
            {player.name}
          </p>
          <p className="text-center text-[11px] leading-snug font-bold text-sr-ink-2 tabular-nums sm:text-[13px]">
            {player.totalScore}
          </p>
          {player.isCurrentUser && (
            <span className="mt-1 rounded-full bg-sr-ink px-2 py-0.5 text-[10px] font-bold text-white">Kamu</span>
          )}
          <span className={cn("mt-auto pb-0.5 text-3xl leading-none font-black sm:text-4xl", tone.rank)}>
            {player.rank}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

function LeaderboardPodium({ top3 }: { top3: LeaderboardEntry[] }) {
  const ordered = PODIUM_ORDER.map((rank) => top3.find((player) => player.rank === rank)).filter(
    (player): player is LeaderboardEntry => player !== undefined,
  );

  return (
    <div>
      <div className="flex w-full items-end justify-center gap-1.5 sm:gap-2">
        {ordered.map((player) => (
          <PodiumItem key={player.rank} player={player} />
        ))}
      </div>
      <div className="h-3 w-full rounded-full border-2 border-secondary-600 bg-linear-to-r from-sr-sun-400 via-sr-sun-500 to-sr-amber" />
    </div>
  );
}

function LeaderboardRow({ entry, index }: { entry: LeaderboardEntry; index: number }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-sr-md border px-3 py-2.5 transition-colors sm:px-4",
        entry.isCurrentUser
          ? "border-sr-blue-200 bg-sr-blue-50"
          : "border-sr-line bg-white hover:border-sr-blue-200 hover:bg-sr-ivory",
      )}
      style={{ animation: `fadeRow 0.45s cubic-bezier(0.22,1,0.36,1) ${1.6 + index * 0.07}s both` }}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sr-blue-50 text-sm font-extrabold text-sr-blue-700">
        {entry.rank}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-sr-ink">
        {entry.name}
        {entry.isCurrentUser && <span className="ml-1.5 text-xs font-bold text-sr-blue-600">(kamu)</span>}
      </span>
      <span className="text-sm font-bold text-sr-ink tabular-nums">{entry.totalScore}</span>
    </div>
  );
}

function LeaderboardLoadingState() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-52 w-full" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
    </div>
  );
}

function LeaderboardEmptyState() {
  return (
    <div className="flex min-h-40 w-full flex-col items-center justify-center rounded-sr-xl border border-sr-line bg-white p-8 sm:min-h-75">
      <p className="text-base text-sr-muted">Belum ada data</p>
    </div>
  );
}

export function LeaderboardView({ leaderboard, isPending }: { leaderboard: LeaderboardEntry[]; isPending: boolean }) {
  const top3 = leaderboard.filter((player) => player.rank <= 3);
  const rest = leaderboard.filter((player) => player.rank > 3);

  if (isPending) {
    return <LeaderboardLoadingState />;
  }

  if (leaderboard.length === 0) {
    return <LeaderboardEmptyState />;
  }

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-sr-xl border border-sr-line bg-white/80 shadow-sr-1">
      <div className="flex items-center gap-2 px-4 pt-4 sm:px-6 sm:pt-5">
        <span className="flex size-8 items-center justify-center rounded-sr-sm bg-sr-sun-100 text-sr-amber-700">
          <TrophyIcon weight="fill" className="size-4.5" />
        </span>
        <h2 className="text-base font-extrabold text-sr-ink sm:text-lg">Peringkat Brain Gym</h2>
      </div>
      <div className="px-4 pt-3 pb-4 sm:px-6 sm:pt-5 sm:pb-5">
        <LeaderboardPodium top3={top3} />
      </div>
      {rest.length > 0 && (
        <div className="flex max-h-72 flex-col gap-2 overflow-y-auto border-t border-sr-line bg-white px-3 py-3 sm:px-6">
          {rest.map((entry, index) => (
            <LeaderboardRow key={entry.rank} entry={entry} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
