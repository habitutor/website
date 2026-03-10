import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TiptapRenderer } from "@/components/tiptap-renderer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
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
	const { cursor, handleNext, handlePrevious, hasPrevious } = useCursorPagination();
	const limit = 10;
	const queryClient = useQueryClient();

	const { data, isPending } = useQuery(
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

	if (isPending) return null;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Add Existing Question</CardTitle>
				<CardDescription>Select questions from your question bank</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="max-h-96 space-y-2 overflow-y-auto">
					{availableQuestions.length > 0 ? (
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
						<Button variant="outline" size="sm" disabled={!hasPrevious || isPending} onClick={handlePrevious}>
							Previous
						</Button>
						<Button
							variant="outline"
							size="sm"
							disabled={!hasMore || isPending}
							onClick={() => nextCursor && handleNext(nextCursor)}
						>
							Next
						</Button>
					</div>
				)}
			</CardContent>
			<CardFooter>
				<Button variant="outline" onClick={onClose}>
					Close
				</Button>
			</CardFooter>
		</Card>
	);
}
