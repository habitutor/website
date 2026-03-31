import { useState } from "react";
import { isDefinedError } from "@orpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate, Link, useRouteContext } from "@tanstack/react-router";
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
        className="relative flex items-end justify-center shrink-0"
        style={{
          width: cfg.avatarW,
          height: cfg.avatarW,
          marginBottom: -avatarSinkIn,
        }}
      >
        <div
          className="absolute rounded-full bg-[#91a3da] border-2 border-[#3650a2] z-[1] left-1/2 -translate-x-1/2"
          style={{
            width: circleSize,
            height: circleSize,
            bottom: -(circleSize / 3),
          }}
        />
        <img
          src={player.image ?? "/default-avatar.png"}
          alt={player.name}
          className="relative w-full object-contain z-[6]"
          style={{
            height: cfg.avatarW,
            animation: `popIn 0.6s cubic-bezier(0.34,1.56,0.64,1) ${cfg.delay} both`,
          }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      </div>
      <div
        className="w-full rounded-t-[10px] border border-[#fdc10e] bg-[#fed65e] flex flex-col items-center justify-start gap-0.5 shrink-0 relative z-[3]"
        style={{
          height: cfg.blockH,
          paddingTop: isMobile ? 20 : 32,
        }}
      >
        <p className="text-[11px] sm:text-[13px] font-semibold text-gray-800 leading-snug text-center">{player.name}</p>
        <p className="text-[11px] sm:text-[13px] font-semibold text-gray-800 leading-snug text-center">{player.totalScore}</p>
      </div>
    </div>
  );
}

function LeaderboardPodium({ top3 }: { top3: LeaderboardEntry[] }) {
  const ordered = PODIUM_ORDER.map((r) => top3.find((p) => p.rank === r)).filter((p): p is LeaderboardEntry => p !== undefined);
  return (
    <div className="flex items-end justify-center w-full gap-1">
      {ordered.map((p) => <PodiumItem key={p.rank} player={p} />)}
    </div>
  );
}

function LeaderboardRow({ entry, index }: { entry: LeaderboardEntry; index: number }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-[5px] border ${entry.isCurrentUser
        ? "bg-tertiary-100 border-tertiary-200"
        : "bg-white border-neutral-300"
        }`}
      style={{ animation: `fadeRow 0.45s cubic-bezier(0.22,1,0.36,1) ${0.55 + index * 0.07}s both` }}
    >
      <div
        className={`w-10.25 h-9.25 rounded-[5px] border flex items-center justify-center shrink-0 ${entry.isCurrentUser ? "bg-background border-tertiary-200" : "bg-white border-neutral-300"
          }`}
      >
        <span className="text-[16px] font-medium text-[#606060]">{entry.rank}</span>
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
      <div className="flex flex-col w-full bg-white rounded-xl border border-[#e8e8e8] p-8 items-center justify-center min-h-[300px]">
        <p className="text-[16px] text-gray-500">Belum ada data</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <div className="rounded-t-xl px-4 pt-6">
        <LeaderboardPodium top3={top3} />
      </div>
      <div className="overflow-y-auto max-h-[380px] flex flex-col gap-2 px-4 py-4 bg-white rounded-b-xl border border-t-0 border-[#e8e8e8]">
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
        className={`flex items-center gap-5 px-5 py-4 rounded-t-[5px] ${isCorrect ? "bg-[#76e8ac]" : "bg-[#febcc2]"
          }`}
      >
        <span
          className={`border border-[#e8e8e8] rounded-[3.5px] px-2.5 py-1 text-[15px] font-semibold bg-white shrink-0 ${isCorrect ? "text-[#1ca35b]" : "text-[#fb3748]"
            }`}
        >
          {userAnswer?.code ?? "-"}
        </span>
        <span className={`flex-1 text-[15px] ${isCorrect ? "text-[#1ca35b]" : "text-[#fb3748]"}`}>
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
      <div className="ml-2 mr-2 bg-white border border-t-0 border-[#e8e8e8] rounded-b-[5px] px-4 py-3 text-xs text-[#333] leading-relaxed">
        <TiptapRenderer content={question.discussion} />
      </div>
    </div>
  );
}

function StatCard({ label, value, total }: { label: string; value: number; total: number }) {
  return (
    <div className="flex-1 min-w-[120px] border border-[#e8e8e8] rounded-[10px] p-4 flex flex-col gap-2 bg-white">
      <span className="self-start border border-[#e8e8e8] rounded-[5px] px-3 py-2 text-[16px] font-medium text-[#333]">
        {label}
      </span>
      <div className="flex items-end gap-1 mt-2">
        <span className="text-[56px] font-bold text-[#3650a2] leading-none">{value}</span>
        <span className="text-[16px] text-[#333] mb-1">/{total}</span>
      </div>
    </div>
  );
}

function StreakBanner({ streak }: { streak?: number }) {
  const { session } = useRouteContext({ from: "/_authenticated" });
  if (!session) return null;

  return (
    <div
      className="relative overflow-hidden flex items-center gap-3 px-6 bg-[#1ca35b] rounded-lg shrink-0"
      style={{ minHeight: 48 }}
    >
      <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-[#32DC82] opacity-40 pointer-events-none" />
      <span className="relative z-10 text-[22px] font-bold text-[#f4faff] leading-none">
        {session.user.flashcardStreak}
      </span>
      <span className="relative z-10 text-[18px] font-medium text-[#f4faff]">
        Streak Brain Gym Kamu!
      </span>
    </div>
  );
}

function ResultsSection({ data, isPending }: { data: FlashcardResult | undefined; isPending: boolean }) {
  const score = data
    ? Math.round((data.correctAnswersCount / (data.questionsCount || 5)) * 100)
    : 0;

  return (
    <div
      className="flex flex-col w-full border border-[#d2d2d2] rounded-[10px] bg-white pt-4 px-4"
      style={{ animation: "slideUpIn 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s both" }}
    >
      <StreakBanner streak={data?.streak} />
      <div className="flex flex-col gap-5 py-5 pb-8">
        {isPending ? (
          <div className="flex gap-4">
            <Skeleton className="h-[150px] flex-1" />
            <Skeleton className="h-[150px] flex-1" />
          </div>
        ) : (
          <div className="flex gap-4 flex-wrap">
            <StatCard label="Hasil" value={score} total={100} />
            <StatCard label="Benar" value={data?.correctAnswersCount ?? 0} total={data?.questionsCount ?? 5} />
          </div>
        )}
        <h2 className="text-[20px] font-medium text-[#333]">Jawaban</h2>
        <div className="flex flex-col gap-2.5">
          {isPending ? (
            <Skeleton className="h-72 w-full" />
          ) : (
            data?.assignedQuestions.map((aq, i) => (
              <AnswerItem key={i} assignedQuestion={aq} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function BottomBar({ onMainLagi, isLoading }: { onMainLagi: () => void; isLoading: boolean }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#a4a4a4] h-[91px] flex items-center justify-end gap-4 px-6 z-50">
      <Link
        to="/dashboard"
        className="w-[200px] h-[42px] border border-[#3650a2] rounded-lg text-[#3650a2] text-[15px] flex items-center justify-center hover:bg-blue-50 transition-colors no-underline"
      >
        Selesaikan
      </Link>
      <button
        onClick={onMainLagi}
        disabled={isLoading}
        className="w-[200px] h-[42px] bg-[#3650a2] border border-[#3650a2] rounded-lg text-white text-[15px] hover:bg-[#2d4082] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? "Memulai..." : "Main Lagi!"}
      </button>
    </div>
  );
}

function AlertDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-[100]">
      <div className="bg-white rounded-[8px] pl-[24px] pr-[36px] py-[24px]">
        <div className="flex flex-col gap-[27px] items-end">
          <div className="flex flex-col gap-[16px] items-start">
            <p className="font-bold leading-normal text-[#333] text-[18px] whitespace-nowrap">
              Ups, belum premium!
            </p>
            <p className="font-medium leading-normal text-[#71717a] text-[12px] w-[304px]">
              Untuk bermain di Brain Gym lebih dari sekali dalam satu hari, kamu perlu Premium
            </p>
          </div>
          <div className="flex gap-[8px] items-start">
            <button
              onClick={onClose}
              className="flex h-[41px] items-center justify-center px-[16px] py-[12px] rounded-[6px] w-[77px] border border-[#e4e4e7]"
            >
              <span className="font-medium text-[#333] text-[14px] whitespace-nowrap">Cancel</span>
            </button>
            <Link
              to="/premium"
              className="bg-[#3650a2] flex items-center justify-center px-[16px] py-[12px] rounded-[6px] no-underline"
            >
              <span className="font-medium text-[14px] text-white whitespace-nowrap">Premium Sekarang</span>
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

      <div className=" min-h-screen pb-[100px]">
        <div className="max-w-[1200px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <LeaderboardSection leaderboard={leaderboard} isPending={lbPending} />
          <ResultsSection data={data as FlashcardResult | undefined} isPending={isPending} />
        </div>
      </div>

      <BottomBar
        onMainLagi={() => startMutation.mutate({})}
        isLoading={startMutation.isPending}
      />
    </>
  );
}