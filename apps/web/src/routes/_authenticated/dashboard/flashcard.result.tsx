import { isDefinedError } from "@orpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate, useRouteContext } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { TiptapRenderer } from "@/components/tiptap-renderer";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/dashboard/flashcard/result")({
  component: RouteComponent,
});

const STYLES = `
  @keyframes riseFromBottom {
    from { opacity: 0; transform: translateY(90px) scaleY(0.85); }
    to   { opacity: 1; transform: translateY(0)    scaleY(1); }
  }
  @keyframes popIn {
    0%   { opacity: 0; transform: translateY(36px) scale(0.85); }
    65%  { transform: translateY(-5px) scale(1.04); }
    100% { opacity: 1; transform: translateY(0)    scale(1); }
  }
  @keyframes fadeRow {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideUpIn {
    from { opacity: 0; transform: translateY(56px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

// ─── Types ───//

type AnswerOption = {
  id: string;
  code: string;
  content: string;
  isCorrect: boolean;
};

type AssignedQuestion = {
  selectedAnswerId: string | null;
  question: {
    discussion: string;
    answerOptions: AnswerOption[];
  };
};

type FlashcardResult = {
  streak: number;
  correctAnswersCount: number;
  questionsCount: number;
  assignedQuestions: AssignedQuestion[];
};

type LeaderboardEntry = {
  rank: number;
  userId: string;
  name: string;
  totalScore: number;
  image: string | null | undefined;
  isCurrentUser: boolean;
};

// ─── Podium ───//
const PODIUM_CFG: Record<number, { blockH: number; avatarW: number; delay: string }> = {
  1: { blockH: 180, avatarW: 140, delay: "0.3s" },
  2: { blockH: 140, avatarW: 120, delay: "0.1s" },
  3: { blockH: 120, avatarW: 100, delay: "0.5s" },
};

const PODIUM_CFG_MOBILE: Record<number, { blockH: number; avatarW: number; delay: string }> = {
  1: { blockH: 120, avatarW: 80, delay: "0.3s" },
  2: { blockH: 100, avatarW: 65, delay: "0.1s" },
  3: { blockH: 80, avatarW: 55, delay: "0.5s" },
};

const PODIUM_ORDER = [2, 1, 3];

function PodiumItem({ player }: { player: LeaderboardEntry }) {
  const isMobile = useIsMobile();
  const cfg = (isMobile ? PODIUM_CFG_MOBILE : PODIUM_CFG)[player.rank as 1 | 2 | 3];
  const circleSize = Math.round(cfg.avatarW * 0.85);
  const avatarSinkIn = isMobile ? 12 : 20;

  return (
    <div
      className="flex flex-col items-center"
      style={{
        flex: player.rank === 1 ? "0 0 auto" : "0 0 auto",
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
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
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
  const ordered = PODIUM_ORDER.map((r) => top3.find((p) => p.rank === r)).filter(
    (p): p is LeaderboardEntry => p !== undefined,
  );
  return (
    <div className="flex w-full items-end justify-center gap-1">
      {ordered.map((p) => (
        <PodiumItem key={p.rank} player={p} />
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

function LeaderboardSection({ leaderboard, isPending }: { leaderboard: LeaderboardEntry[]; isPending: boolean }) {
  const top3 = leaderboard.filter((p) => p.rank <= 3);
  const rest = leaderboard.filter((p) => p.rank > 3);

  if (isPending) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-52 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="flex min-h-75 w-full flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white p-8">
        <p className="text-[16px] text-gray-500">Belum ada data</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col">
      <div className="rounded-t-xl px-4 pt-6">
        <LeaderboardPodium top3={top3} />
      </div>
      <div className="flex max-h-95 flex-col gap-2 overflow-y-auto rounded-b-xl border border-t-0 border-neutral-200 bg-white px-4 py-4">
        {rest.map((entry, i) => (
          <LeaderboardRow key={entry.rank} entry={entry} index={i} />
        ))}
      </div>
    </div>
  );
}

function AnswerItem({ assignedQuestion }: { assignedQuestion: AssignedQuestion }) {
  const { question, selectedAnswerId } = assignedQuestion;
  const correctAnswer = question.answerOptions.find((a) => a.isCorrect);
  const userAnswer = question.answerOptions.find((a) => a.id === selectedAnswerId);
  const isCorrect = correctAnswer?.id === userAnswer?.id;

  return (
    <div className="w-full">
      <div
        className={`flex items-center gap-5 rounded-t-[5px] px-5 py-4 ${isCorrect ? "bg-fourtiary-100" : "bg-red-100"}`}
      >
        <span
          className={`shrink-0 rounded-[3.5px] border border-neutral-200 bg-white px-2.5 py-1 text-[15px] font-semibold ${
            isCorrect ? "text-fourtiary-300" : "text-red-300"
          }`}
        >
          {userAnswer?.code ?? "-"}
        </span>
        <span className={`flex-1 text-[15px] ${isCorrect ? "text-fourtiary-300" : "text-red-300"}`}>
          {userAnswer ? <TiptapRenderer content={userAnswer.content} /> : "Tidak menjawab"}
        </span>
        <span className="ml-auto shrink-0">
          {isCorrect ? (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M4 11L9 16L18 6" stroke="#1CA35B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="10" stroke="#FB3748" strokeWidth="2" />
              <path d="M7.5 7.5L14.5 14.5M14.5 7.5L7.5 14.5" stroke="#FB3748" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </span>
      </div>
      <div className="mr-2 ml-2 rounded-b-[5px] border border-t-0 border-neutral-200 bg-white px-4 py-3 text-xs leading-relaxed text-[#333]">
        <TiptapRenderer content={question.discussion} />
      </div>
    </div>
  );
}

function StatCard({ label, value, total }: { label: string; value: number; total: number }) {
  return (
    <div className="flex min-w-30 flex-1 flex-col gap-2 rounded-[10px] border border-neutral-200 bg-white p-4">
      <span className="self-start rounded-[5px] border border-neutral-200 px-3 py-2 text-[16px] font-medium text-[#333]">
        {label}
      </span>
      <div className="mt-2 flex items-end gap-1">
        <span className="text-[56px] leading-none font-bold text-primary-300">{value}</span>
        <span className="mb-1 text-[16px] text-[#333]">/{total}</span>
      </div>
    </div>
  );
}

function StreakBanner() {
  const { session } = useRouteContext({ from: "/_authenticated" });
  if (!session) return null;

  return (
    <div
      className="relative flex shrink-0 items-center gap-3 overflow-hidden rounded-lg bg-fourtiary-300 px-6"
      style={{ minHeight: 48 }}
    >
      <div className="pointer-events-none absolute top-1/2 -right-8 h-48 w-48 -translate-y-1/2 rounded-full bg-[#32DC82] opacity-40" />
      <span className="relative z-10 text-[22px] leading-none font-bold text-background">
        {session.user.flashcardStreak}
      </span>
      <span className="relative z-10 text-[18px] font-medium text-background">Streak Brain Gym Kamu!</span>
    </div>
  );
}

function ResultsSection({ data, isPending }: { data: FlashcardResult | undefined; isPending: boolean }) {
  const score = data ? Math.round((data.correctAnswersCount / (data.questionsCount || 5)) * 100) : 0;

  return (
    <div
      className="flex w-full flex-col rounded-[10px] border border-neutral-300 bg-white px-4 pt-4"
      style={{ animation: "slideUpIn 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s both" }}
    >
      <StreakBanner />
      <div className="flex flex-col gap-5 py-5 pb-8">
        {isPending ? (
          <div className="flex gap-4">
            <Skeleton className="h-37.5 flex-1" />
            <Skeleton className="h-37.5 flex-1" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            <StatCard label="Hasil" value={score} total={100} />
            <StatCard label="Benar" value={data?.correctAnswersCount ?? 0} total={data?.questionsCount ?? 5} />
          </div>
        )}
        <h2 className="text-[20px] font-medium text-[#333]">Jawaban</h2>
        <div className="flex flex-col gap-2.5">
          {isPending ? (
            <Skeleton className="h-72 w-full" />
          ) : (
            data?.assignedQuestions.map((aq, i) => <AnswerItem key={i} assignedQuestion={aq} />)
          )}
        </div>
      </div>
    </div>
  );
}

function BottomBar({ onMainLagi, isLoading }: { onMainLagi: () => void; isLoading: boolean }) {
  return (
    <div className="fixed right-0 bottom-0 left-0 z-50 flex h-22.75 items-center justify-end gap-4 border-t border-neutral-500 bg-white px-6">
      <Link
        to="/dashboard"
        className="flex h-10.5 w-50 items-center justify-center rounded-lg border border-primary-300 text-[15px] text-primary-300 no-underline transition-colors hover:bg-blue-50"
      >
        Selesaikan
      </Link>
      <button
        onClick={onMainLagi}
        disabled={isLoading}
        className="h-10.5 w-50 rounded-lg border border-primary-300 bg-primary-300 text-[15px] text-white transition-colors hover:bg-[#2d4082] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Memulai..." : "Main Lagi!"}
      </button>
    </div>
  );
}

function AlertDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-[rgba(0,0,0,0.5)]">
      <div className="rounded-xl bg-white py-6 pr-9 pl-6">
        <div className="flex flex-col items-end gap-6.75">
          <div className="flex flex-col items-start gap-4">
            <p className="text-[18px] leading-normal font-bold whitespace-nowrap text-[#333]">Ups, belum premium!</p>
            <p className="w-76 text-[12px] leading-normal font-medium text-[#71717a]">
              Untuk bermain di Brain Gym lebih dari sekali dalam satu hari, kamu perlu Premium
            </p>
          </div>
          <div className="flex items-start gap-2">
            <button
              onClick={onClose}
              className="flex h-10.25 w-19.25 items-center justify-center rounded-[6px] border border-[#e4e4e7] px-4 py-3"
            >
              <span className="text-[14px] font-medium whitespace-nowrap text-[#333]">Cancel</span>
            </button>
            <Link
              to="/premium"
              className="flex items-center justify-center rounded-[6px] bg-primary-300 px-4 py-3 no-underline"
            >
              <span className="text-[14px] font-medium whitespace-nowrap text-white">Premium Sekarang</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function RouteComponent() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showPremiumAlert, setShowPremiumAlert] = useState(false);

  const { data, isPending } = useQuery(orpc.flashcard.result.queryOptions({ input: {} }));
  const { data: leaderboardData, isPending: lbPending } = useQuery(orpc.flashcard.leaderboard.queryOptions());

  const leaderboard: LeaderboardEntry[] = (leaderboardData?.entries ?? []).map((entry) => ({
    rank: entry.rank,
    userId: entry.userId,
    name: entry.name,
    totalScore: entry.totalScore,
    image:
      entry.rank === 1
        ? "/decorations/image1.png"
        : entry.rank === 2
          ? "/decorations/image2.png"
          : entry.rank === 3
            ? "/decorations/image3.png"
            : undefined,
    isCurrentUser: entry.isCurrentUser,
  }));

  const startMutation = useMutation(
    orpc.flashcard.start.mutationOptions({
      onSuccess: () => {
        queryClient.resetQueries({ queryKey: orpc.flashcard.get.key() });
        navigate({ to: "/dashboard/flashcard" });
      },
      onError: (error) => {
        if (isDefinedError(error) && error.code === "NOT_FOUND") {
          toast.error("Ups! Kamu sudah mengerjakan semua Brain Gym yang tersedia!", {
            description: "Silahkan coba lagi dalam beberapa saat.",
          });
        } else if (isDefinedError(error) && error.code === "UNPROCESSABLE_CONTENT") {
          setShowPremiumAlert(true);
        }
      },
    }),
  );

  return (
    <>
      <style>{STYLES}</style>

      {showPremiumAlert && <AlertDialog onClose={() => setShowPremiumAlert(false)} />}

      {/* Background circle */}
      <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden">
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-[2000px] border border-[#FEEAAE] bg-[#FFF5D7]"
          style={{
            width: "max(2000px, 139vw)",
            height: "max(1440px, 100vw)",
            bottom: "clamp(-1250px, -111vw, -800px)",
          }}
        />
      </div>

      <div className="min-h-screen pb-25">
        <div className="mx-auto grid max-w-300 grid-cols-1 items-start gap-10 px-6 py-8 lg:grid-cols-2">
          <LeaderboardSection leaderboard={leaderboard} isPending={lbPending} />
          <ResultsSection data={data as FlashcardResult | undefined} isPending={isPending} />
        </div>
      </div>

      <BottomBar onMainLagi={() => startMutation.mutate({})} isLoading={startMutation.isPending} />
    </>
  );
}
