import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/utils/orpc";
import { EmptyState } from "./empty-state";
import { useQuestionNavigation } from "./hooks/use-question-navigation";
import { QuestionCard } from "./question-card";
import { QuestionNavigator } from "./question-navigator";
import { QuestionNavigatorSheet } from "./question-navigator-sheet";
import type { Question } from "./types";

type QuestionsListProps = {
	packId: number;
	onCreateNew: () => void;
};

export function QuestionsList({ packId, onCreateNew }: QuestionsListProps) {
	const [currentIndex, setCurrentIndex] = useState(0);

	const { data, isLoading } = useQuery(
		orpc.admin.practicePack.getQuestions.queryOptions({
			input: { id: packId },
		}),
	);

	const questions = (data?.questions || []) as Question[];

	const {
		gridPage,
		handleQuestionClick,
		goToPrevious,
		goToNext,
		goToPreviousGridPage,
		goToNextGridPage,
		totalGridPages,
		startIndex,
		endIndex,
	} = useQuestionNavigation({
		totalQuestions: questions.length,
		currentIndex,
		onNavigate: setCurrentIndex,
	});

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-64 w-full rounded-xl" />
			</div>
		);
	}

	if (questions.length === 0) {
		return <EmptyState onCreateNew={onCreateNew} />;
	}

	const currentQuestion = questions[currentIndex];

	if (!currentQuestion) return null;

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-6 lg:flex-row">
				<div className="min-w-0 flex-1 lg:order-1">
					<QuestionCard
						packId={packId}
						question={currentQuestion}
						currentIndex={currentIndex}
						totalQuestions={questions.length}
						onPrevious={goToPrevious}
						onNext={goToNext}
					/>
					<div className="mt-4 lg:hidden">
						<QuestionNavigatorSheet
							questions={questions}
							currentIndex={currentIndex}
							onQuestionClick={handleQuestionClick}
						/>
					</div>
				</div>

				<div className="hidden lg:order-2 lg:block lg:w-72">
					<QuestionNavigator
						questions={questions}
						currentIndex={currentIndex}
						startIndex={startIndex}
						endIndex={endIndex}
						totalGridPages={totalGridPages}
						gridPage={gridPage}
						onQuestionClick={handleQuestionClick}
						onPreviousPage={goToPreviousGridPage}
						onNextPage={goToNextGridPage}
					/>
				</div>
			</div>
		</div>
	);
}
