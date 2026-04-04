import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/browser/use-mobile";
import { PODIUM_CFG, PODIUM_CFG_MOBILE, PODIUM_ORDER } from "./flashcard-result-animations";
import type { LeaderboardEntry } from "./flashcard-result-leaderboard-model";

function PodiumItem({ player }: { player: LeaderboardEntry }) {
  const isMobile = useIsMobile();
  const cfg = (isMobile ? PODIUM_CFG_MOBILE : PODIUM_CFG)[player.rank as 1 | 2 | 3];
  const circleSize = Math.round(cfg.avatarW * 0.85);
  const avatarSinkIn = isMobile ? 12 : 20;

  return (
    <div
      className="flex flex-col items-center"
      style={{
        flex: "0 0 auto",
        width: player.rank === 1 ? cfg.avatarW + 24 : cfg.avatarW + 16,
        animation: `riseFromBottom 0.65s cubic-bezier(0.22,1,0.36,1) ${cfg.delay} both`,
      }}
    >
      <div
        className="relative flex shrink-0 items-end justify-center"
        style={{
          width: cfg.avatarW,
          height: cfg.avatarW,
          marginBottom: -avatarSinkIn,
        }}
      >
        <div
          className="absolute left-1/2 z-1 -translate-x-1/2 rounded-full border-2 border-primary-300 bg-primary-100"
          style={{
            width: circleSize,
            height: circleSize,
            bottom: -(circleSize / 3),
          }}
        />
        <img
          src={player.image ?? "/default-avatar.png"}
          alt={player.name}
          className="relative z-6 w-full object-contain"
          style={{
            height: cfg.avatarW,
            animation: `popIn 0.6s cubic-bezier(0.34,1.56,0.64,1) ${cfg.delay} both`,
          }}
          onError={(event) => {
            (event.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>
      <div
        className="relative z-3 flex w-full shrink-0 flex-col items-center justify-start gap-0.5 rounded-t-[10px] border border-secondary-600 bg-secondary-400"
        style={{
          height: cfg.blockH,
          paddingTop: isMobile ? 20 : 32,
        }}
      >
        <p className="text-center text-[11px] leading-snug font-semibold text-gray-800 sm:text-[13px]">{player.name}</p>
        <p className="text-center text-[11px] leading-snug font-semibold text-gray-800 sm:text-[13px]">
          {player.totalScore}
        </p>
      </div>
    </div>
  );
}

function LeaderboardPodium({ top3 }: { top3: LeaderboardEntry[] }) {
  const ordered = PODIUM_ORDER.map((rank) => top3.find((player) => player.rank === rank)).filter(
    (player): player is LeaderboardEntry => player !== undefined,
  );

  return (
    <div className="flex w-full items-end justify-center gap-1">
      {ordered.map((player) => (
        <PodiumItem key={player.rank} player={player} />
      ))}
    </div>
  );
}

function LeaderboardRow({ entry, index }: { entry: LeaderboardEntry; index: number }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-[5px] border px-4 py-3 ${
        entry.isCurrentUser ? "border-tertiary-200 bg-tertiary-100" : "border-neutral-300 bg-white"
      }`}
      style={{ animation: `fadeRow 0.45s cubic-bezier(0.22,1,0.36,1) ${0.55 + index * 0.07}s both` }}
    >
      <div
        className={`flex h-9.25 w-10.25 shrink-0 items-center justify-center rounded-[5px] border ${
          entry.isCurrentUser ? "border-tertiary-200 bg-background" : "border-neutral-300 bg-white"
        }`}
      >
        <span className="text-[16px] font-medium text-neutral-800">{entry.rank}</span>
      </div>
      <span className="flex-1 text-[15px] text-gray-900">{entry.name}</span>
      <span className="text-[15px] text-gray-900">{entry.totalScore}</span>
    </div>
  );
}

function LeaderboardLoadingState() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-52 w-full" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
    </div>
  );
}

function LeaderboardEmptyState() {
  return (
    <div className="flex min-h-75 w-full flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white p-8">
      <p className="text-[16px] text-gray-500">Belum ada data</p>
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
    <div className="flex w-full flex-col">
      <div className="rounded-t-xl px-4 pt-6">
        <LeaderboardPodium top3={top3} />
      </div>
      <div className="flex max-h-95 flex-col gap-2 overflow-y-auto rounded-b-xl border border-t-0 border-neutral-200 bg-white px-4 py-4">
        {rest.map((entry, index) => (
          <LeaderboardRow key={entry.rank} entry={entry} index={index} />
        ))}
      </div>
    </div>
  );
}
