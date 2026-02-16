import {
	CardsIcon,
	CaretDownIcon,
	CaretLeftIcon,
	CaretRightIcon,
	CheckCircleIcon,
	DotsThreeOutlineIcon,
	PencilSimpleIcon,
} from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { TiptapRenderer } from "@/components/tiptap-renderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { KeyboardShortcutsHint } from "./hooks/use-question-navigation";
import { RemoveQuestionDialog } from "./remove-question-dialog";
import type { Question } from "./types";

type QuestionCardProps = {
	packId: number;
	question: Question;
	currentIndex: number;
	totalQuestions: number;
	onPrevious: () => void;
	onNext: () => void;
};

export function QuestionCard({
	packId,
	question,
	currentIndex,
	totalQuestions,
	onPrevious,
	onNext,
}: QuestionCardProps) {
	const navigate = useNavigate();

	return (
		<Card className="overflow-hidden border-none py-0 shadow-md">
			<div className="flex items-center justify-between gap-3 border-b bg-muted/30 px-4 py-3">
				<div className="flex items-center gap-2">
					<span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary font-bold text-primary-foreground text-xs">
						{currentIndex + 1}
					</span>
					<Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
						ID: {question.id}
					</Badge>
					<Badge
						variant="outline"
						className={cn(
							"gap-1 font-mono text-[10px]",
							question.isFlashcard
								? "border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950/40 dark:text-green-400"
								: "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950/40 dark:text-red-400",
						)}
					>
						<CardsIcon className="size-3" />
						{question.isFlashcard ? "Flashcard" : "No Flashcard"}
					</Badge>
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" className="size-7">
							<DotsThreeOutlineIcon className="size-4" />
							<span className="sr-only">Question options</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem
							onClick={() =>
								navigate({
									to: "/admin/questions/$id",
									params: { id: question.id.toString() },
								})
							}
						>
							<PencilSimpleIcon className="size-4" />
							Edit Question
						</DropdownMenuItem>
						<RemoveQuestionDialog packId={packId} question={question} />
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<CardContent className="space-y-4 py-4">
				<div className="relative rounded-lg border-l-4 border-l-primary bg-card p-3 shadow-sm">
					<TiptapRenderer content={question.content} />
				</div>

				<div className="rounded-lg bg-muted/30 p-3">
					<h3 className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">Answer Options</h3>
					<div className="grid gap-2 sm:grid-cols-2">
						{question.answers?.map((answer) => (
							<div
								key={answer.id}
								className={cn(
									"flex items-start gap-2 rounded-md border border-border bg-background p-3 transition-colors",
									answer.isCorrect && "border-green-500/50 bg-green-50/30 dark:bg-green-950/20",
								)}
							>
								<span
									className={cn(
										"flex size-5 shrink-0 items-center justify-center rounded-sm font-bold text-[10px]",
										answer.isCorrect ? "bg-green-500 text-white" : "bg-muted text-muted-foreground",
									)}
								>
									{answer.code}
								</span>
								<p className="flex-1 text-sm leading-relaxed">{answer.content}</p>
								{answer.isCorrect && (
									<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-green-500" weight="fill" />
								)}
							</div>
						))}
					</div>
				</div>

				<Collapsible>
					<CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-left text-muted-foreground text-xs transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&[data-state=open]>svg]:rotate-180">
						<span>Discussion</span>
						<CaretDownIcon className="ml-auto size-3 transition-transform duration-200" />
					</CollapsibleTrigger>
					<CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
						<div className="prose prose-sm max-w-none border-t px-3 pt-3 pb-1 text-muted-foreground text-sm">
							<TiptapRenderer content={question.discussion} />
						</div>
					</CollapsibleContent>
				</Collapsible>

				<div className="flex items-center justify-between border-t pt-3">
					<Button
						variant="ghost"
						size="sm"
						className="h-7 gap-1 px-2 text-xs"
						onClick={onPrevious}
						disabled={currentIndex === 0}
					>
						<CaretLeftIcon className="size-3" />
						Previous
					</Button>
					<div className="flex items-center gap-2">
						<span className="font-mono text-muted-foreground text-xs">
							{currentIndex + 1}/{totalQuestions}
						</span>
						<KeyboardShortcutsHint />
					</div>
					<Button
						variant="ghost"
						size="sm"
						className="h-7 gap-1 px-2 text-xs"
						onClick={onNext}
						disabled={currentIndex === totalQuestions - 1}
					>
						Next
						<CaretRightIcon className="size-3" />
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
