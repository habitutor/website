import { X } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { TiptapRenderer } from "@/components/tiptap-renderer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/utils/orpc";

interface AddExistingQuestionModalProps {
	practicePackId: number;
	existingQuestionIds: number[];
	onClose: () => void;
}

export function AddExistingQuestionModal({
	practicePackId,
	existingQuestionIds,
	onClose,
}: AddExistingQuestionModalProps) {
	const [cursor, setCursor] = useState<string | null>(null);
	const [cursorHistory, setCursorHistory] = useState<string[]>([]);
	const limit = 10;
	const queryClient = useQueryClient();

	const { data, isLoading } = useQuery(
		orpc.admin.question.list.queryOptions({
			input: { limit, cursor: cursor ?? undefined },
		}),
	);

	const addMutation = useMutation(
		orpc.admin.practicePack.addQuestion.mutationOptions({
			onSuccess: () => {
				toast.success("Question added to pack");
				queryClient.invalidateQueries(
					orpc.admin.practicePack.getQuestions.queryOptions({
						input: { id: practicePackId },
					}),
				);
			},
			onError: (error) => {
				toast.error("Failed to add question", {
					description: String(error),
				});
			},
		}),
	);

	const questions = data?.data || [];
	const hasMore = data?.hasMore || false;
	const nextCursor = data?.nextCursor || null;
	const availableQuestions = questions.filter((q) => !existingQuestionIds.includes(q.id));

	const handleAddQuestion = (questionId: number) => {
		addMutation.mutate({
			practicePackId,
			questionId,
		});
	};

	const handleNext = () => {
		if (nextCursor) {
			if (cursor) {
				setCursorHistory((prev) => [...prev, cursor]);
			}
			setCursor(nextCursor);
		}
	};

	const handlePrevious = () => {
		if (cursorHistory.length > 0) {
			const previousCursor = cursorHistory[cursorHistory.length - 1];
			setCursorHistory((prev) => prev.slice(0, -1));
			setCursor(previousCursor);
		} else {
			setCursor(null);
		}
	};

	const hasPrevious = cursor !== null || cursorHistory.length > 0;

	return (
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle>Add Existing Question</CardTitle>
						<CardDescription>Select questions from your question bank</CardDescription>
					</div>
					<Button variant="ghost" size="icon" onClick={onClose}>
						<X className="size-4" />
					</Button>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="max-h-96 space-y-2 overflow-y-auto">
					{isLoading ? (
						<>
							<Skeleton className="h-20 w-full" />
							<Skeleton className="h-20 w-full" />
							<Skeleton className="h-20 w-full" />
						</>
					) : availableQuestions.length > 0 ? (
						availableQuestions.map((q) => (
							<div key={q.id} className="flex items-start gap-3 rounded-lg border p-4">
								<div className="flex-1">
									<div className="prose prose-sm max-w-none font-medium">
										<TiptapRenderer content={q.content} />
									</div>
									<div className="line-clamp-1 text-muted-foreground text-sm">
										<TiptapRenderer content={q.discussion} />
									</div>
								</div>
								<Button size="sm" onClick={() => handleAddQuestion(q.id)} disabled={addMutation.isPending}>
									Add
								</Button>
							</div>
						))
					) : (
						<div className="py-8 text-center text-muted-foreground">
							No available questions. All questions are already in this pack or create new questions first.
						</div>
					)}
				</div>

				{(hasPrevious || hasMore) && (
					<div className="flex items-center justify-center gap-2">
						<Button variant="outline" size="sm" disabled={!hasPrevious || isLoading} onClick={handlePrevious}>
							Previous
						</Button>
						<Button variant="outline" size="sm" disabled={!hasMore || isLoading} onClick={handleNext}>
							Next
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
