import { FlagIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useRouteContext } from "@tanstack/react-router";
import { TiptapRenderer } from "@/components/tiptap/renderer";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/utils/orpc";
import { FeedbackReportDialog } from "./feedback-report-dialog";

type AnswerOption = {
  id: number;
  code: string;
  content: string;
  isCorrect: boolean;
};

type AssignedQuestion = {
  questionId: number;
  selectedAnswerId: number | null;
  question: {
    id: number;
    discussion: string;
    answerOptions: AnswerOption[];
  };
};

interface AnswerItemProps {
  assignedQuestion: AssignedQuestion;
  attemptId?: number;
  onReportClick?: (questionId: number, selectedAnswerId: number | null) => void;
}

function AnswerItem({ assignedQuestion, attemptId, onReportClick }: AnswerItemProps) {
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const { question, selectedAnswerId, questionId } = assignedQuestion;
  const correctAnswer = question.answerOptions.find((a) => a.isCorrect);
  const userAnswer = question.answerOptions.find((a) => a.id === selectedAnswerId);
  const isCorrect = correctAnswer?.id === userAnswer?.id;

  const handleReportClick = () => {
    setFeedbackDialogOpen(true);
    onReportClick?.(questionId, selectedAnswerId);
  };

  return (
    <>
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
          <button
            type="button"
            onClick={handleReportClick}
            className="ml-2 rounded-lg p-1 text-gray-400 transition-colors hover:bg-orange-50 hover:text-orange-600"
            aria-label="Laporkan masalah"
          >
            <FlagIcon size={18} weight="bold" />
          </button>
          <span className="ml-auto shrink-0">
            {isCorrect ? (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path
                  d="M4 11L9 16L18 6"
                  stroke="#1CA35B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
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
      <FeedbackReportDialog
        open={feedbackDialogOpen}
        onOpenChange={setFeedbackDialogOpen}
        questionId={questionId}
        selectedAnswerId={selectedAnswerId ?? undefined}
        attemptId={attemptId}
        path="/dashboard/flashcard/result"
      />
    </>
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

export function ResultsSection() {
  const { data, isPending } = useQuery(orpc.flashcard.result.queryOptions({ input: {} }));
  const score = data ? Math.round((data.correctAnswersCount / (data.questionsCount || 5)) * 100) : 0;

  const handleReportClick = (_questionId: number, _selectedAnswerId: number | null) => {
    // Could open a global feedback dialog here if needed
  };

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
            data?.assignedQuestions.map((aq, i) => (
              <AnswerItem key={i} assignedQuestion={aq} attemptId={data?.attemptId} onReportClick={handleReportClick} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
