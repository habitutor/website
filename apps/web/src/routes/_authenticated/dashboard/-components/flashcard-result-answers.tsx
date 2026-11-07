import { CheckIcon, XIcon } from "@phosphor-icons/react";
import { StreakFlame } from "@/components/streak/streak-flame";
import { useQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect } from "react";
import { Confetti } from "@/components/streak/streak-celebration";
import { TiptapRenderer } from "@/components/tiptap/renderer";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CountUp } from "@/routes/-home/motion-bits";
import { orpc } from "@/utils/orpc";

type AnswerOption = {
  id: number;
  code: string;
  content: string;
  isCorrect: boolean;
};

type AssignedQuestion = {
  selectedAnswerId: number | null;
  question: {
    discussion: string;
    answerOptions: AnswerOption[];
  };
};

function AnswerItem({ assignedQuestion, index }: { assignedQuestion: AssignedQuestion; index: number }) {
  const { question, selectedAnswerId } = assignedQuestion;
  const correctAnswer = question.answerOptions.find((a) => a.isCorrect);
  const userAnswer = question.answerOptions.find((a) => a.id === selectedAnswerId);
  const isCorrect = correctAnswer?.id === userAnswer?.id;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-sr-md border-2 bg-white",
        isCorrect ? "border-sr-live/40" : "border-rose-300",
      )}
    >
      <div className={cn("flex items-start gap-3 p-3 sm:p-4", isCorrect ? "bg-[#edfcf4]" : "bg-rose-50")}>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white",
            isCorrect ? "bg-sr-live" : "bg-rose-500",
          )}
        >
          {userAnswer?.code ?? "-"}
        </span>
        <div className="min-w-0 flex-1 pt-1">
          <p className="text-xs font-bold text-sr-muted">Soal {index + 1} · Jawabanmu</p>
          <div className={cn("text-sm sm:text-[15px]", isCorrect ? "text-sr-ink" : "text-rose-700")}>
            {userAnswer ? <TiptapRenderer content={userAnswer.content} /> : "Tidak menjawab"}
          </div>
          {!isCorrect && correctAnswer && (
            <p className="mt-1 text-xs font-semibold text-sr-live">Jawaban benar: {correctAnswer.code}</p>
          )}
        </div>
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full",
            isCorrect ? "bg-sr-live/15 text-sr-live" : "bg-rose-100 text-rose-600",
          )}
        >
          {isCorrect ? <CheckIcon weight="bold" className="size-4" /> : <XIcon weight="bold" className="size-4" />}
        </span>
      </div>
      <div className="border-t border-sr-line px-4 py-3 text-xs leading-relaxed text-sr-ink-2 sm:text-sm">
        <p className="mb-1 font-bold text-sr-ink">Pembahasan</p>
        <TiptapRenderer content={question.discussion} />
      </div>
    </div>
  );
}

function getVerdict(score: number) {
  if (score === 100) return { title: "Sempurna!", body: "Semua jawabanmu benar. Otakmu lagi on fire." };
  if (score >= 80) return { title: "Keren banget!", body: "Tinggal sedikit lagi menuju sempurna." };
  if (score >= 60) return { title: "Mantap!", body: "Terus diasah, kamu makin jago." };
  return { title: "Tetap semangat!", body: "Yang penting kamu sudah latihan. Coba lagi yuk!" };
}

function CompletionHero({ score, correct, total }: { score: number; correct: number; total: number }) {
  const verdict = getVerdict(score);
  const celebrate = score >= 60;

  useEffect(() => {
    if (celebrate) navigator.vibrate?.([30, 50, 80]);
  }, [celebrate]);

  return (
    <div className="relative">
      {celebrate && <Confetti className="absolute top-20 left-1/2" />}
      <div className="relative overflow-hidden rounded-sr-xl sr-card-sun py-5 pr-28 pl-5 sm:py-7 sm:pr-60 sm:pl-8">
        <div className="pointer-events-none absolute -top-16 -right-12 size-48 rounded-full bg-white/30" />

        <span className="relative inline-flex rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-sr-ink">
          Latihan selesai
        </span>
        <div className="relative mt-2 flex items-end gap-1.5">
          <CountUp to={score} duration={1.2} className="text-6xl leading-none font-black text-sr-ink sm:text-7xl" />
          <span className="mb-1 text-base font-bold text-sr-ink-2">/100</span>
        </div>
        <p className="relative mt-2 text-lg leading-tight font-extrabold text-sr-ink sm:text-2xl">{verdict.title}</p>
        <p className="relative mt-0.5 text-sm text-sr-ink-2">{verdict.body}</p>
        <span className="relative mt-3 inline-flex rounded-full bg-sr-ink px-3 py-1 text-xs font-bold text-white">
          {correct} dari {total} benar
        </span>

        <motion.div
          className="pointer-events-none absolute right-1 bottom-0 sm:right-8"
          initial={{ y: 70, scale: 0.6, rotate: -10 }}
          animate={{ y: 0, scale: 1, rotate: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <motion.img
            src="/avatar/subtest/hab.webp"
            alt=""
            className="h-28 w-auto select-none sm:h-44"
            animate={celebrate ? { y: [0, -12, 0], rotate: [0, -5, 5, 0] } : { y: [0, -5, 0] }}
            transition={{ duration: celebrate ? 1.4 : 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </div>
  );
}

function StreakBanner() {
  const { session } = useRouteContext({ from: "/_authenticated" });
  if (!session) return null;

  return (
    <div className="relative flex items-center gap-3 overflow-hidden rounded-sr-lg sr-card-sun px-4 py-3 sm:px-5">
      <span className="flex size-10 items-center justify-center rounded-full bg-white/70">
        <StreakFlame tone="brain" animated={false} className="h-7 w-6" />
      </span>
      <span className="text-2xl font-black text-sr-ink tabular-nums">{session.user.flashcardStreak}</span>
      <span className="text-sm font-bold text-sr-ink sm:text-base">Streak Brain Gym kamu!</span>
    </div>
  );
}

export function ResultsSection() {
  const { data, isPending } = useQuery(orpc.flashcard.result.queryOptions({ input: {} }));
  const score = data ? Math.round((data.correctAnswersCount / (data.questionsCount || 5)) * 100) : 0;

  return (
    <div
      className="flex w-full flex-col gap-4 rounded-sr-xl border border-sr-line bg-white/80 p-3 shadow-sr-1 sm:gap-5 sm:p-6"
      style={{ animation: "slideUpIn 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s both" }}
    >
      {isPending ? (
        <Skeleton className="h-44 w-full rounded-sr-xl" />
      ) : (
        <CompletionHero score={score} correct={data?.correctAnswersCount ?? 0} total={data?.questionsCount ?? 5} />
      )}
      <StreakBanner />
      <h2 className="text-lg font-extrabold text-sr-ink">Pembahasan jawaban</h2>
      <div className="flex flex-col gap-3">
        {isPending ? (
          <Skeleton className="h-72 w-full" />
        ) : (
          data?.assignedQuestions.map((aq, i) => <AnswerItem key={i} index={i} assignedQuestion={aq} />)
        )}
      </div>
    </div>
  );
}
