import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { create } from "zustand";
import useCountdown from "@/lib/hooks/use-countdown";
import { orpc } from "@/utils/orpc";
import { TimeoutDialog } from "./timeout-dialog";

interface AnswerStore {
  answers: { [key: number]: number };
  saveAnswer: (input: { questionId: number; answerId: number }) => void;
}

const useAnswerStore = create<AnswerStore>()((set) => ({
  answers: {},
  saveAnswer: ({ questionId, answerId }) =>
    set((state) => ({
      answers: {
        ...state.answers,
        [questionId]: answerId,
      },
    })),
}));

export const FlashcardCard = () => {
  const { data } = useQuery(orpc.flashcard.get.queryOptions());
  const submitMutation = useMutation(orpc.flashcard.submit.mutationOptions());
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [timeoutDialogOpen, setTimeoutDialogOpen] = useState(false);
  const [, hours, minutes, seconds] = useCountdown(
    (data?.status !== "not_started" && data?.deadline) || 0,
  );
  const { saveAnswer } = useAnswerStore();

  // biome-ignore lint/correctness/useExhaustiveDependencies: function cant be a dependency
  useEffect(() => {
    if (
      data?.status === "ongoing" &&
      hours === "00" &&
      minutes === "00" &&
      seconds === "00"
    ) {
      setTimeoutDialogOpen(true);
      submitAnswers();
    }
  }, [data?.status, hours, minutes, seconds]);

  if (data?.status === "submitted")
    navigate({ to: "/dashboard/flashcard/result" });

  if (data?.status === "not_started") {
    toast.error("Error: Flashcard belum dimulai");
    return null;
  }

  const handleAnswerSelect = (answerId: number) => {
    const currentQuestionId =
      data!.assignedQuestions[currentPage - 1].question.id;
    saveAnswer({
      questionId: currentQuestionId,
      answerId,
    });

    if (currentPage === data?.assignedQuestions.length) {
      saveAnswer({ questionId: currentQuestionId, answerId });
      submitAnswers();
      queryClient.removeQueries({
        queryKey: orpc.flashcard.streak.key(),
      });
      navigate({ to: "/dashboard" });
      return;
    }
    setCurrentPage(currentPage + 1);
  };

  useAnswerStore;
  function submitAnswers() {
    const mappedAnswers = Object.entries(useAnswerStore.getState().answers).map(
      ([questionId, answerId]) => ({
        questionId: Number(questionId),
        answerId,
      }),
    );

    submitMutation.mutate(mappedAnswers);
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex h-full flex-col gap-2 rounded-md border bg-secondary p-4 backdrop-sepia-100">
        <h1 className="font-medium">Flashcard 1</h1>
        <div className="h-full rounded-sm border border-accent bg-background p-4 text-foreground">
          {data?.assignedQuestions[currentPage - 1].question.content}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative flex min-h-24 items-end overflow-clip rounded-sm border border-green-700 bg-green-500 p-6">
          <div className="-translate-y-1/2 -left-30 pointer-events-none absolute top-1/2 z-0 size-60 rounded-full bg-green-700" />
          <p className="relative z-10 mt-auto font-semibold text-3xl text-white">
            {hours}:{minutes}:{seconds}
          </p>
        </div>

        {data?.assignedQuestions[currentPage - 1].question.answerOptions.map(
          (option) => (
            <button
              type="button"
              key={option.id}
              onClick={() => handleAnswerSelect(option.id)}
              className="inline-flex items-center gap-3 rounded-md border border-secondary bg-white p-4 text-start text-foreground transition-colors hover:bg-secondary/20"
            >
              <span className="rounded-xs border border-accent px-2 py-0.5 font-medium text-neutral-500 text-sm">
                {option.code}
              </span>
              {option.content}
            </button>
          ),
        )}
      </div>

      <TimeoutDialog
        open={timeoutDialogOpen}
        onOpenChange={setTimeoutDialogOpen}
      />
    </div>
  );
};
