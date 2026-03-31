import { isDefinedError } from "@orpc/client";
import { CheckIcon, XIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import * as m from "motion/react-m";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TiptapRenderer } from "@/components/tiptap-renderer";
import { refreshAuthSession } from "@/lib/auth-session";
import useCountdown from "@/lib/hooks/use-countdown";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";
import { TimeoutDialog } from "./timeout-dialog";

export const FlashcardCard = () => {
  const queryClient = useQueryClient();
  const { data } = useQuery(orpc.flashcard.get.queryOptions());
  const navigate = useNavigate();

  const saveAnswerMutation = useMutation(
    orpc.flashcard.save.mutationOptions({
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
        await refreshAuthSession();
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

  const handleSubmit = () => {
    submitMutation.mutate({});
    queryClient.removeQueries({ queryKey: ["auth", "getSession", "flashcard"] });
    navigate({ to: "/dashboard/flashcard/result" });
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
        handleSubmit();
        return;
      }

      saveAnswerMutation.reset();
      setHasChecked(false);
      setSelectedAnswerId(null);
      queryClient.removeQueries({ queryKey: orpc.flashcard.get.key() });
    } catch (error) {
      console.error(error);
    } finally {
      setDisableInteraction(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-md border bg-white p-4 sm:p-6">
      {/* Timer Bar  */}
      <div className="relative flex h-14.5 w-full items-center overflow-clip rounded-[5px] border border-green-700 bg-green-500 px-6">
        <div className="pointer-events-none absolute top-1/2 -left-8 size-25 -translate-y-1/2 rounded-full bg-green-700 opacity-60" />
        <p className="relative z-10 ml-auto text-2xl font-bold tracking-widest text-white">
          {hours}:{minutes}:{seconds}
        </p>
      </div>

      {/* Question + Answers */}
      <m.div
        key={currentQuestion?.question.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        {/* Question Card - yellow style */}
        <div className="relative flex h-full min-h-108.75 flex-col gap-2 overflow-hidden rounded-[10px] border border-secondary-600 bg-secondary-200 p-4">
          <h1 className="text-[18px] font-medium">Brain Gym {currentPage}</h1>
          <div className="h-full rounded-[5px] border border-neutral-200 bg-white p-4 pb-40 text-foreground sm:pb-4">
            <TiptapRenderer content={currentQuestion?.question.content} />
          </div>
          {/* Decoration image */}
          <img
            src="/decorations/image 25.png"
            alt=""
            className="pointer-events-none absolute right-0 bottom-0 h-50 w-auto object-contain"
          />
        </div>

        {/* Answer Options + Check button */}
        <div className="flex flex-col gap-3">
          {currentQuestion?.question.answerOptions.map((option) => {
            const isSelected = selectedAnswerId === option.id;
            const isUserAnswer = hasChecked && saveAnswerMutation.data?.userAnswerId === option.id;
            const isCorrect = hasChecked && saveAnswerMutation.data?.correctAnswerId === option.id;
            const isWrong = hasChecked && isUserAnswer && saveAnswerMutation.data?.correctAnswerId !== option.id;

            let backgroundColor = "#ffffff";
            let borderColor = "#d2d2d2";
            let textColor = "#000000";

            if (hasChecked) {
              if (isCorrect) {
                backgroundColor = "rgba(187, 247, 208, 0.6)";
                borderColor = "#166534";
              } else if (isWrong) {
                backgroundColor = "rgba(254, 202, 202, 0.2)";
                borderColor = "#ef4444";
                textColor = "#ef4444";
              }
            } else if (isSelected) {
              backgroundColor = "#d9effa";
              borderColor = "#3650a2";
            }

            return (
              <m.button
                type="button"
                key={option.id}
                disabled={hasChecked || disableInteraction || submitMutation.isPending}
                onClick={() => !hasChecked && setSelectedAnswerId(option.id)}
                animate={{ backgroundColor, borderColor, color: textColor }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "inline-flex items-center gap-3 rounded-[5px] border p-4 text-start",
                  !hasChecked && "cursor-pointer hover:bg-background",
                  hasChecked && "cursor-default",
                )}
              >
                <span
                  className={cn(
                    "text-neutrals-500 shrink-0 rounded-[5px] border border-foreground/20 px-2 py-0.5 text-sm font-medium transition-colors duration-300",
                    isCorrect && "border-green-800 bg-green-500 text-white",
                    isWrong && "border-red-500 bg-red-500 text-white",
                    !hasChecked && isSelected && "border-primary-300 bg-primary-300 text-white",
                  )}
                >
                  {option.code}
                </span>

                <TiptapRenderer content={option.content} />

                <m.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{
                    opacity: isCorrect || isWrong ? 1 : 0,
                    scale: isCorrect || isWrong ? 1 : 0.5,
                  }}
                  className={cn("ml-auto shrink-0", isCorrect && "text-green-800", isWrong && "text-red-500")}
                >
                  {isCorrect ? <CheckIcon weight="bold" size={18} /> : isWrong ? <XIcon size={18} /> : null}
                </m.span>
              </m.button>
            );
          })}

          {/* Check button only - no next button */}
          <div className="mt-auto pt-2">
            <button
              type="button"
              onClick={handleCheckAnswer}
              disabled={selectedAnswerId === null || disableInteraction || hasChecked || submitMutation.isPending}
              className={cn(
                "w-full rounded-xl border border-secondary-600 bg-secondary-500 px-6 py-2.5 text-[15px] font-semibold text-[#333] shadow-sm transition-all",
                selectedAnswerId === null || hasChecked
                  ? "cursor-not-allowed opacity-40"
                  : "cursor-pointer hover:bg-secondary-600 hover:shadow-md",
              )}
            >
              Check Jawaban!
            </button>
          </div>
        </div>
      </m.div>

      <TimeoutDialog open={timeoutDialogOpen} onOpenChange={setTimeoutDialogOpen} />
    </div>
  );
};
