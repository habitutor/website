import { isDefinedError } from "@orpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useCountdown from "@/lib/hooks/use-countdown";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";
import { TimeoutDialog } from "./timeout-dialog";

export const FlashcardCard = () => {
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
			onError: (error) => {
				if (isDefinedError(error) && error.code === "UNPROCESSABLE_CONTENT")
					toast.error("Ups! Kamu sudah melewati batas waktu pengumpulan!");
			},
		}),
	);
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const [currentPage, setCurrentPage] = useState(1);
	const [timeoutDialogOpen, setTimeoutDialogOpen] = useState(false);
	const [, hours, minutes, seconds] = useCountdown((data?.status !== "not_started" && data?.deadline) || 0);
	const [disableInteraction, setDisableInteraction] = useState(false);

	// useEffect(() => {
	//   if (data?.status === "ongoing") {
	//     setCurrentPage(data.assignedQuestions.findIndex((q) => !q.selectedAnswerId));
	//   }
	// }, [data]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: dumb biome cant detect functions
	useEffect(() => {
		if (data?.status === "ongoing" && hours === "00" && minutes === "00" && seconds === "00") handleSubmit();
	}, [data?.status, hours, minutes, seconds]);

	if (data?.status === "not_started") return null;

	const handleAnswerSelect = (answerId: number) => {
		setDisableInteraction(true);
		const questionId = data!.assignedQuestions[currentPage - 1].question.id;
		saveAnswerMutation.mutate({
			questionId,
			answerId,
		});

		if (currentPage === data?.assignedQuestions.length) {
			handleSubmit();
			navigate({ to: "/dashboard/flashcard/result" });
			return;
		}
		while (saveAnswerMutation.isPending) {
			// do nothing
		}
		setTimeout(() => setCurrentPage(currentPage + 1), 1500);
		setDisableInteraction(false);
	};

	function handleSubmit() {
		submitMutation.mutate({});
		queryClient.removeQueries({
			queryKey: orpc.flashcard.streak.key(),
		});
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
					<div className="pointer-events-none absolute top-1/2 -left-30 z-0 size-60 -translate-y-1/2 rounded-full bg-green-700" />
					<p className="relative z-10 mt-auto font-semibold text-3xl text-white">
						{hours}:{minutes}:{seconds}
					</p>
				</div>

				{data?.assignedQuestions[currentPage - 1].question.answerOptions.map((option) => {
					const isUserAnswer = saveAnswerMutation.data?.userAnswerId === option.id;
					const isCorrect = saveAnswerMutation.data?.correctAnswerId === option.id;
					const isWrong = saveAnswerMutation.data?.correctAnswerId !== option.id;
					return (
						<button
							type="button"
							key={option.id}
							disabled={saveAnswerMutation.isPending || disableInteraction}
							onClick={() => handleAnswerSelect(option.id)}
							className={cn(
								"inline-flex items-center gap-3 rounded-md border border-secondary bg-white p-4 text-start text-foreground transition-colors hover:bg-secondary/5",
								isCorrect && "border-green-800 bg-green-200 text-black hover:bg-green-200",
								isUserAnswer && isWrong && "border-red-500 bg-red-200 text-red-500 hover:bg-red-200",
							)}
						>
							<span
								className={cn(
									"rounded-xs border border-foreground/20 px-2 py-0.5 font-medium text-neutrals-500 text-sm",
									isCorrect && "border-green-800 bg-green-500 text-white",
									isUserAnswer && isWrong && "border-red-500 bg-red-500 text-white",
								)}
							>
								{option.code}
							</span>
							{option.content}
						</button>
					);
				})}
			</div>

			<TimeoutDialog open={timeoutDialogOpen} onOpenChange={setTimeoutDialogOpen} />
		</div>
	);
};
