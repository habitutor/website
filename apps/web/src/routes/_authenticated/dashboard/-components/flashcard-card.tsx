import { isDefinedError } from "@orpc/client";
import { BrainIcon, CheckIcon, TimerIcon, XIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { TiptapRenderer } from "@/components/tiptap/renderer";
import { refreshAuthSession } from "@/lib/auth-session";
import useCountdown from "@/lib/hooks/use-countdown";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";
import { rememberBrainGymStreak } from "./brain-gym-streak";
import { TimeoutDialog } from "./timeout-dialog";

export const FlashcardCard = () => {
  const queryClient = useQueryClient();
  const { data } = useQuery(orpc.flashcard.session.queryOptions());
  const navigate = useNavigate();
  const { session } = useRouteContext({ from: "/_authenticated" });
  const streakBeforeRef = useRef(0);
  streakBeforeRef.current = session?.user.flashcardStreak ?? 0;

  const saveAnswerMutation = useMutation(
    orpc.flashcard.answer.mutationOptions({
      onError: (error) => {
        if (isDefinedError(error) && error.code === "UNPROCESSABLE_CONTENT") {
          toast.error("Ups! Kamu sudah melewati batas waktu pengumpulan!");
        }
      },
    }),
  );

  const submitMutation = useMutation(
    orpc.flashcard.submit.mutationOptions({
      onSuccess: async () => {
        const refreshed = await refreshAuthSession();
        const streakAfter = refreshed?.user.flashcardStreak ?? 0;
        if (streakAfter > streakBeforeRef.current) {
          rememberBrainGymStreak({ from: streakBeforeRef.current, to: streakAfter });
        }
        queryClient.invalidateQueries({ queryKey: orpc.streak.get.key() });
      },
      onError: (error) => {
        if (isDefinedError(error) && error.code === "UNPROCESSABLE_CONTENT") {
          toast.error("Ups! Kamu sudah melewati batas waktu pengumpulan!");
        }
      },
    }),
  );

  const [timeoutDialogOpen, setTimeoutDialogOpen] = useState(false);
  const [hasStartedCountdown, setHasStartedCountdown] = useState(false);
  const [, hours, minutes, seconds] = useCountdown((data?.status !== "not_started" && data?.deadline) || 0);
  const [disableInteraction, setDisableInteraction] = useState(false);
  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies
  useEffect(() => {
    if (data?.status !== "not_started" && data?.deadline && (hours !== "00" || minutes !== "00" || seconds !== "00")) {
      setHasStartedCountdown(true);
    }
  }, [data, hours, minutes, seconds]);

  // biome-ignore lint/correctness/useExhaustiveDependencies
  useEffect(() => {
    if (hasStartedCountdown && data?.status === "ongoing" && hours === "00" && minutes === "00" && seconds === "00") {
      setTimeoutDialogOpen(true);
    }
  }, [hasStartedCountdown, data, hours, minutes, seconds]);

  if (!data || data.status === "not_started") return null;

  const dataRecord = data as Record<string, unknown>;
  const totalQuestionsCount =
    typeof dataRecord.totalQuestionsCount === "number" ? dataRecord.totalQuestionsCount : data.assignedQuestions.length;
  const currentPage = totalQuestionsCount - (data.assignedQuestions.length ?? 0) + 1;
  const currentQuestion = data.assignedQuestions[0];
  const isLastQuestion = data.assignedQuestions.length <= 1;

  const handleSubmit = async () => {
    try {
      await submitMutation.mutateAsync({});
      await queryClient.invalidateQueries({ queryKey: orpc.flashcard.session.key() });
      queryClient.removeQueries({ queryKey: orpc.flashcard.result.queryKey({ input: {} }) });
      navigate({ to: "/dashboard/flashcard/result" });
    } catch {
      // Error handling is managed in submit mutation callbacks.
    }
  };

  const handleCheckAnswer = async () => {
    if (!currentQuestion || selectedAnswerId === null) return;

    setDisableInteraction(true);
    try {
      await saveAnswerMutation.mutateAsync({
        questionId: currentQuestion.question.id,
        answerId: selectedAnswerId,
      });

      setHasChecked(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (isLastQuestion) {
        await handleSubmit();
        return;
      }

      saveAnswerMutation.reset();
      setHasChecked(false);
      setSelectedAnswerId(null);
      queryClient.removeQueries({ queryKey: orpc.flashcard.session.key() });
    } catch (error) {
      console.error(error);
    } finally {
      setDisableInteraction(false);
    }
  };

  const isLowTime = hours === "00" && Number(minutes) < 1;
  const progressPercent = totalQuestionsCount > 0 ? ((currentPage - 1) / totalQuestionsCount) * 100 : 0;
  const isAnswerCorrect =
    hasChecked && saveAnswerMutation.data?.userAnswerId === saveAnswerMutation.data?.correctAnswerId;
  const canCheck = selectedAnswerId !== null && !disableInteraction && !hasChecked && !submitMutation.isPending;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 pb-28 md:pb-8">
      {/* Bilah atas menempel saat digulir, sama seperti halaman Tryout. */}
      <div className="sticky top-20 z-30 rounded-sr-xl border border-sr-line bg-white/95 p-3 shadow-sr-1 backdrop-blur sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="hidden size-10 shrink-0 items-center justify-center rounded-sr-sm bg-sr-sun-100 text-sr-amber-700 sm:flex">
              <BrainIcon weight="fill" className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-sr-blue-600 sm:text-sm">Brain Gym</p>
              <p className="text-base font-extrabold text-sr-ink sm:text-lg">
                Soal {currentPage}
                <span className="font-semibold text-sr-muted"> dari {totalQuestionsCount}</span>
              </p>
            </div>
          </div>
          <div
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-sm font-extrabold tabular-nums",
              isLowTime
                ? "bg-sr-orange-100 text-sr-orange-700 motion-safe:animate-pulse"
                : "bg-sr-blue-50 text-sr-blue-700",
            )}
            aria-label="Sisa waktu"
          >
            <TimerIcon weight="bold" className="size-4" />
            {hours}:{minutes}:{seconds}
          </div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-sr-line">
          <div
            className="h-full rounded-full bg-(image:--sr-grad-blue) transition-[width] duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <m.div
        key={currentQuestion?.question.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="rounded-sr-xl border border-sr-line bg-white p-4 shadow-sr-1 sm:p-6 md:p-8"
      >
        <span className="mb-4 inline-flex rounded-full bg-sr-blue-50 px-3 py-1 text-xs font-bold text-sr-blue-700">
          No. {currentPage}
        </span>

        <div className="mb-6 text-base font-medium wrap-break-word text-sr-ink sm:text-lg">
          <TiptapRenderer content={currentQuestion?.question.content} />
        </div>

        <div className="flex flex-col gap-2.5">
          {currentQuestion?.question.answerOptions.map((option) => {
            const isSelected = selectedAnswerId === option.id;
            const isUserAnswer = hasChecked && saveAnswerMutation.data?.userAnswerId === option.id;
            const isCorrect = hasChecked && saveAnswerMutation.data?.correctAnswerId === option.id;
            const isWrong = hasChecked && isUserAnswer && saveAnswerMutation.data?.correctAnswerId !== option.id;

            return (
              <m.button
                type="button"
                key={option.id}
                aria-pressed={isSelected}
                disabled={hasChecked || disableInteraction || submitMutation.isPending}
                onClick={() => !hasChecked && setSelectedAnswerId(option.id)}
                animate={isCorrect ? { scale: [1, 1.02, 1] } : isWrong ? { x: [0, -6, 6, -3, 0] } : {}}
                transition={{ duration: 0.4 }}
                className={cn(
                  "flex items-start gap-3 rounded-sr-md border-2 p-3 text-left transition-colors duration-200 sm:p-4",
                  isCorrect
                    ? "border-sr-live bg-[#edfcf4]"
                    : isWrong
                      ? "border-rose-400 bg-rose-50"
                      : isSelected
                        ? "border-sr-blue-500 bg-sr-blue-50 shadow-sr-1"
                        : "border-sr-line bg-white",
                  !hasChecked ? "cursor-pointer hover:border-sr-blue-200 hover:bg-sr-ivory" : "cursor-default",
                  hasChecked && !isCorrect && !isWrong && "opacity-60",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold transition-colors",
                    isCorrect
                      ? "bg-sr-live text-white"
                      : isWrong
                        ? "bg-rose-500 text-white"
                        : isSelected
                          ? "bg-sr-blue-500 text-white"
                          : "bg-sr-blue-50 text-sr-blue-700",
                  )}
                >
                  {isCorrect ? (
                    <CheckIcon weight="bold" className="size-4" />
                  ) : isWrong ? (
                    <XIcon weight="bold" className="size-4" />
                  ) : (
                    option.code
                  )}
                </span>
                <div className="min-w-0 flex-1 pt-1 leading-relaxed text-sr-ink-2">
                  <TiptapRenderer content={option.content} />
                </div>
              </m.button>
            );
          })}
        </div>

        <AnimatePresence>
          {hasChecked && (
            <m.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn(
                "mt-4 flex items-center gap-2 rounded-sr-md px-4 py-3 text-sm font-bold",
                isAnswerCorrect ? "bg-[#edfcf4] text-sr-live" : "bg-rose-50 text-rose-600",
              )}
            >
              {isAnswerCorrect ? (
                <CheckIcon weight="bold" className="size-5" />
              ) : (
                <XIcon weight="bold" className="size-5" />
              )}
              {isAnswerCorrect ? "Mantap, jawabanmu benar!" : "Jawabanmu belum tepat."}
            </m.p>
          )}
        </AnimatePresence>
      </m.div>

      {/* Di HP tombol cek menempel di bawah layar supaya mudah dijangkau jempol. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-sr-line bg-white/95 p-3 backdrop-blur md:static md:border-0 md:bg-transparent md:p-0">
        <button
          type="button"
          onClick={handleCheckAnswer}
          disabled={!canCheck}
          className="mx-auto block w-full max-w-3xl cursor-pointer rounded-sr-md border-b-4 border-sr-amber bg-sr-sun-500 py-3.5 text-base font-extrabold tracking-wide text-sr-ink uppercase transition-[transform,border-width,opacity] active:translate-y-1 active:border-b-0 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitMutation.isPending ? "Menyimpan..." : "Cek Jawaban"}
        </button>
      </div>

      <TimeoutDialog open={timeoutDialogOpen} onOpenChange={setTimeoutDialogOpen} />
    </div>
  );
};
