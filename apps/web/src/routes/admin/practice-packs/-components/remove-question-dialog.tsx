import { TrashIcon } from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { orpc } from "@/utils/orpc";
import type { QuestionForRemoval } from "./types";

type RemoveQuestionDialogProps = {
	packId: number;
	question: QuestionForRemoval;
};

export function RemoveQuestionDialog({ packId, question }: RemoveQuestionDialogProps) {
	const [open, setOpen] = useState(false);
	const queryClient = useQueryClient();

	const removeMutation = useMutation(
		orpc.admin.practicePack.removeQuestion.mutationOptions({
			onSuccess: () => {
				toast.success("Question removed from pack");
				queryClient.invalidateQueries(
					orpc.admin.practicePack.getQuestions.queryOptions({
						input: { id: packId },
					}),
				);
				setOpen(false);
			},
			onError: (error) => {
				toast.error("Failed to remove question", {
					description: String(error),
				});
			},
		}),
	);

	const handleRemove = () => {
		removeMutation.mutate({ practicePackId: packId, questionId: question.id });
	};

	return (
		<>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => setOpen(true)}
				className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
			>
				<TrashIcon className="size-4" />
				Remove
			</Button>

			<AlertDialog open={open} onOpenChange={setOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Remove Question from Pack?</AlertDialogTitle>
						<AlertDialogDescription>
							This will remove the question from this practice pack. The question will still exist in the question bank.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleRemove}
							disabled={removeMutation.isPending}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{removeMutation.isPending ? "Removing…" : "Remove"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
