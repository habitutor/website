import { DotsThreeOutlineIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { Question } from "./types";

type QuestionNavigatorSheetProps = {
	questions: Question[];
	currentIndex: number;
	onQuestionClick: (index: number) => void;
};

export function QuestionNavigatorSheet({ questions, currentIndex, onQuestionClick }: QuestionNavigatorSheetProps) {
	const [open, setOpen] = useState(false);

	const handleQuestionClick = (index: number) => {
		onQuestionClick(index);
		setOpen(false);
	};

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="gap-2 lg:hidden"
					aria-label={`Open question navigator (Question ${currentIndex + 1} of ${questions.length})`}
				>
					<DotsThreeOutlineIcon className="size-4" aria-hidden="true" />
					{currentIndex + 1} / {questions.length}
				</Button>
			</SheetTrigger>
			<SheetContent side="bottom" className="h-[60vh] overflow-y-auto">
				<SheetHeader>
					<SheetTitle>Jump to Question</SheetTitle>
				</SheetHeader>
				<nav className="grid grid-cols-5 gap-2 p-4" aria-label="Question navigator">
					{questions.map((question, idx) => {
						const isActive = idx === currentIndex;

						return (
							<button
								key={question.id}
								type="button"
								onClick={() => handleQuestionClick(idx)}
								aria-current={isActive ? "true" : undefined}
								className={cn(
									"flex aspect-square w-full items-center justify-center rounded-lg border text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
									isActive
										? "scale-105 border-primary bg-primary font-bold text-primary-foreground shadow-md"
										: "hover:border-primary/50 hover:bg-muted",
								)}
							>
								<span className="sr-only">Question {idx + 1}</span>
								{idx + 1}
							</button>
						);
					})}
				</nav>
			</SheetContent>
		</Sheet>
	);
}
