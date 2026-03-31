import { isDefinedError } from "@orpc/client";
import { CheckIcon, XIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import * as m from "motion/react-m";
import { useCallback, useEffect, useState } from "react";
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
  const saveAnswerMutation = useMutation(
    orpc.flashcard.save.mutationOptions({
      onError: (error) => {
        if (isDefinedError(error) && error.code === "UNPROCESSABLE_CONTENT")
          toast.error("Ups! Kamu sudah melewati batas waktu pengumpulan!");
      },
    }),
  );
  const submitMutation = useMutation(
    orpc.flashcard.submit.mutationOptions({
      onSuccess: async () => {
        await refreshAuthSession();
      },
      onError: (error) => {
        if (isDefinedError(error) && error.code === "UNPROCESSABLE_CONTENT")
          toast.error("Ups! Kamu sudah melewati batas waktu pengumpulan!");
      },
    }),
  );
  const navigate = useNavigate();
  const [timeoutDialogOpen, setTimeoutDialogOpen] = useState(false);
  const [, hours, minutes, seconds] = useCountdown((data?.status !== "not_started" && data?.deadline) || 0);
  const [disableInteraction, setDisableInteraction] = useState(false);

  const handleSubmit = useCallback(async () => {
    await submitMutation.mutateAsync({});
    queryClient.removeQueries({
      queryKey: ["auth", "getSession", "flashcard"],
    });
    navigate({ to: "/dashboard/flashcard/result" });
  }, [submitMutation, queryClient, navigate]);

  useEffect(() => {
    if (data?.status === "ongoing" && hours === "00" && minutes === "00" && seconds === "00") handleSubmit();
  }, [data?.status, hours, minutes, seconds, handleSubmit]);

  if (!data || data.status === "not_started") return null;

  const currentPage = (data.totalQuestionsCount ?? 0) - (data.assignedQuestions.length ?? 0) + 1;
  const currentQuestion = data.assignedQuestions[0];
  const isLastQuestion = data.assignedQuestions.length <= 1;

  const handleAnswerSelect = async (answerId: number) => {
    if (!data || !currentQuestion || isLastQuestion) return;
    setDisableInteraction(true);
    const questionId = currentQuestion.question.id;
    try {
      await saveAnswerMutation.mutateAsync({
        questionId,
        answerId,
      });

      await new Promise((resolve) => setTimeout(resolve, 1500));
      saveAnswerMutation.reset();
      queryClient.removeQueries({ queryKey: orpc.flashcard.get.key() });
    } catch (error) {
      console.error(error);
    } finally {
      setDisableInteraction(false);
    }
  };

  const handleLastAnswerSelect = async (answerId: number) => {
    if (!data || !currentQuestion) return;
    setDisableInteraction(true);
    const questionId = currentQuestion.question.id;
    try {
      await saveAnswerMutation.mutateAsync({
        questionId,
        answerId,
      });

      await new Promise((resolve) => setTimeout(resolve, 1500));
      handleSubmit();
    } catch (error) {
      console.error(error);
    } finally {
      setDisableInteraction(false);
    }
  };

  return (
    <m.div
      key={currentQuestion?.question.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
    >
      <div className="flex h-full flex-col gap-2 rounded-md border bg-secondary p-4 backdrop-sepia-100">
        <h1 className="font-medium">Brain Gym {currentPage}</h1>
        <div className="h-full rounded-sm border border-accent bg-background p-4 text-foreground">
          <TiptapRenderer content={currentQuestion?.question.content} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative flex min-h-24 items-end overflow-clip rounded-sm border border-green-700 bg-green-500 p-6">
          <div className="pointer-events-none absolute top-1/2 -left-30 z-0 size-60 -translate-y-1/2 rounded-full bg-green-700" />
          <p className="relative z-10 mt-auto text-3xl font-semibold text-white">
            {hours}:{minutes}:{seconds}
          </p>
        </div>

        {currentQuestion?.question.answerOptions.map((option) => {
          const isUserAnswer = saveAnswerMutation.data?.userAnswerId === option.id;
          const isCorrect = saveAnswerMutation.data?.correctAnswerId === option.id;
          const isWrong = saveAnswerMutation.data?.correctAnswerId !== option.id;

          let backgroundColor = "#ffffff";
          let borderColor = "#e5e7eb";
          let textColor = "#000000";

          if (isCorrect) {
            backgroundColor = "rgba(187, 247, 208, 0.6)";
            borderColor = "#166534";
          } else if (isUserAnswer && isWrong) {
            backgroundColor = "rgba(254, 202, 202, 0.2)";
            borderColor = "#ef4444";
            textColor = "#ef4444";
          }

          return (
            <m.button
              type="button"
              key={option.id}
              disabled={saveAnswerMutation.isPending || submitMutation.isPending || disableInteraction}
              onClick={() => (isLastQuestion ? handleLastAnswerSelect(option.id) : handleAnswerSelect(option.id))}
              animate={{ backgroundColor, borderColor, color: textColor }}
              transition={{ duration: 0.3 }}
              className={cn(
                "inline-flex items-center gap-3 rounded-md border p-4 text-start transition-opacity",
                !saveAnswerMutation.data && "hover:bg-secondary/5",
              )}
            >
              <span
                className={cn(
                  "text-neutrals-500 rounded-xs border border-foreground/20 px-2 py-0.5 text-sm font-medium transition-colors duration-300",
                  isCorrect && "border-green-800 bg-green-500 text-white",
                  isUserAnswer && isWrong && "border-red-500 bg-red-500 text-white",
                )}
              >
                {option.code}
              </span>

              <TiptapRenderer content={option.content} />

              <m.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: isCorrect || (isUserAnswer && isWrong) ? 1 : 0,
                  scale: isCorrect || (isUserAnswer && isWrong) ? 1 : 0.5,
                }}
                className={cn("ml-auto", isCorrect && "text-green-800", isUserAnswer && isWrong && "text-red-500")}
              >
                {isCorrect ? <CheckIcon weight="bold" /> : isUserAnswer && isWrong ? <XIcon /> : null}
              </m.span>
            </m.button>
          );
        })}
      </div>

      <TimeoutDialog open={timeoutDialogOpen} onOpenChange={setTimeoutDialogOpen} />
    </m.div>
  );
};
