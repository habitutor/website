import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { create } from "zustand";
import useCountdown from "@/lib/hooks/use-countdown";
import { orpc } from "@/utils/orpc";

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
	const [, hours, minutes, seconds] = useCountdown(data?.deadline || 0);
	const { answers, saveAnswer } = useAnswerStore();

	if (data?.submittedAt) navigate({ to: "/dashboard/flashcard/result" });

	function handleAnswerSelect(answerId: number) {
		const currentQuestionId =
			data!.assignedQuestions[currentPage - 1].question.id;
		saveAnswer({
			questionId: currentQuestionId,
			answerId,
		});

		if (currentPage === data?.assignedQuestions.length) {
			const mappedAnswers = Object.entries({
				...answers,
				[currentQuestionId]: answerId,
			}).map(([questionId, answerId]) => ({
				questionId: Number(questionId),
				answerId,
			}));

			submitMutation.mutate(mappedAnswers);
			queryClient.removeQueries({
				queryKey: orpc.flashcard.streak.key(),
			});
			navigate({ to: "/dashboard" });
			return;
		}
		setCurrentPage(currentPage + 1);
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
					(option, i) => (
						<button
							type="button"
							key={option.id}
							onClick={() => handleAnswerSelect(option.id)}
							className="inline-flex items-center gap-3 rounded-md border border-secondary bg-white p-4 text-start text-foreground transition-colors hover:bg-secondary/20"
						>
							<span className="rounded-xs border border-accent px-2 py-0.5 font-medium text-neutral-500 text-sm">
								{String.fromCharCode(65 + i)}
							</span>
							{option.content}
						</button>
					),
				)}
			</div>
		</div>
	);
};
