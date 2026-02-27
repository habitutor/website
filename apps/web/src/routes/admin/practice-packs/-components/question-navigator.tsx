import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Question } from "./types";

type QuestionNavigatorProps = {
	questions: Question[];
	currentIndex: number;
	startIndex: number;
	endIndex: number;
	totalGridPages: number;
	gridPage: number;
	onQuestionClick: (index: number) => void;
	onPreviousPage: () => void;
	onNextPage: () => void;
};

export function QuestionNavigator({
	questions,
	currentIndex,
	startIndex,
	endIndex,
	totalGridPages,
	gridPage,
	onQuestionClick,
	onPreviousPage,
	onNextPage,
}: QuestionNavigatorProps) {
	const visibleQuestions = questions.slice(startIndex, endIndex);

	return (
		<Card className="sticky top-24 overflow-hidden border-none py-0 shadow-md">
			<CardContent className="p-3">
				<nav className="grid grid-cols-5 gap-1.5" aria-label="Question navigator">
					{visibleQuestions.map((question, idx) => {
						const absoluteIndex = startIndex + idx;
						const originalIndex = questions.findIndex((q) => q.id === question.id);
						const displayNumber = originalIndex + 1;
						const isActive = absoluteIndex === currentIndex;

						return (
							<button
								key={question.id}
								type="button"
								onClick={() => onQuestionClick(absoluteIndex)}
								aria-current={isActive ? "true" : undefined}
								className={cn(
									"flex aspect-square w-full touch-manipulation items-center justify-center rounded-md border font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
									isActive
										? "border-primary bg-primary font-bold text-primary-foreground"
										: "border-border hover:border-primary/50 hover:bg-muted",
								)}
							>
								<span className="sr-only">Question {displayNumber}</span>
								<span className="tabular-nums">{displayNumber}</span>
							</button>
						);
					})}
				</nav>

				{totalGridPages > 1 && (
					<div className="mt-2 flex items-center justify-between border-t pt-2">
						<button
							type="button"
							onClick={onPreviousPage}
							disabled={gridPage === 0}
							aria-label="Previous page"
							className="flex size-6 items-center justify-center rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:opacity-40 disabled:hover:bg-transparent"
						>
							<CaretLeftIcon className="size-3.5" />
						</button>
						<span className="font-mono text-[10px] text-muted-foreground tabular-nums" aria-live="polite">
							{startIndex + 1}–{endIndex}
						</span>
						<button
							type="button"
							onClick={onNextPage}
							disabled={gridPage === totalGridPages - 1}
							aria-label="Next page"
							className="flex size-6 items-center justify-center rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:opacity-40 disabled:hover:bg-transparent"
						>
							<CaretRightIcon className="size-3.5" />
						</button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
