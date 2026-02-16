import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type } from "arktype";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import TiptapSimpleEditor from "@/components/tiptap-simple-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/questions/$id")({
	component: QuestionEditPage,
});

const ANSWER_CODES = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"] as const;

type AnswerOption = {
	id: number;
	code: string;
	content: string;
	isCorrect: boolean;
};

function QuestionEditPage() {
	const { id } = Route.useParams();
	const questionId = Number.parseInt(id, 10);
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const [initializedQuestionId, setInitializedQuestionId] = useState<number | null>(null);
	const [answerOptions, setAnswerOptions] = useState<AnswerOption[]>([]);

	const { data: question, isLoading } = useQuery(
		orpc.admin.question.get.queryOptions({
			input: { id: questionId },
		}),
	);

	const updateQuestionMutation = useMutation(orpc.admin.question.update.mutationOptions());
	const updateAnswerMutation = useMutation(orpc.admin.question.updateAnswer.mutationOptions());
	const createAnswerMutation = useMutation(orpc.admin.question.createAnswer.mutationOptions());
	const deleteAnswerMutation = useMutation(orpc.admin.question.deleteAnswer.mutationOptions());

	const form = useForm({
		defaultValues: {
			content: {} as unknown,
			discussion: {} as unknown,
			isFlashcardQuestion: true,
		},
		onSubmit: async ({ value }) => {
			const validation = type({
				content: "object",
				discussion: "object",
			})(value);

			if (validation instanceof type.errors) {
				toast.error("Please fill all required fields");
				return;
			}

			// Validate answer options
			const hasEmptyContent = answerOptions.some((option) => !option.content.trim());
			if (hasEmptyContent) {
				toast.error("All answer options must have content");
				return;
			}

			const hasCorrectAnswer = answerOptions.some((option) => option.isCorrect);
			if (!hasCorrectAnswer) {
				toast.error("Please mark at least one answer as correct");
				return;
			}

			if (answerOptions.length < 2) {
				toast.error("Please add at least 2 answer options");
				return;
			}

			try {
				await updateQuestionMutation.mutateAsync({
					id: questionId,
					content: value.content,
					discussion: value.discussion,
					isFlashcardQuestion: value.isFlashcardQuestion,
				});

				// Update existing answers and create new ones
				await Promise.all(
					answerOptions.map((option) => {
						if (option.id > 0) {
							return updateAnswerMutation.mutateAsync({
								id: option.id,
								content: option.content,
								isCorrect: option.isCorrect,
							});
						}
						return createAnswerMutation.mutateAsync({
							questionId,
							code: option.code,
							content: option.content,
							isCorrect: option.isCorrect,
						});
					}),
				);

				toast.success("Question updated successfully");

				queryClient.invalidateQueries(
					orpc.admin.question.get.queryOptions({
						input: { id: questionId },
					}),
				);
				queryClient.invalidateQueries({
					queryKey: orpc.admin.question.list.queryKey({ input: {} }),
				});

				setTimeout(() => {
					navigate({ to: "/admin/questions" });
				}, 500);
			} catch (error) {
				toast.error("Failed to update question", {
					description: String(error),
				});
			}
		},
	});

	useEffect(() => {
		setInitializedQuestionId(null);
		setAnswerOptions([]);
	}, []);

	useEffect(() => {
		if (question && question.id !== initializedQuestionId) {
			form.setFieldValue("content", question.content);
			form.setFieldValue("discussion", question.discussion);
			form.setFieldValue("isFlashcardQuestion", question.isFlashcardQuestion);

			// Initialize answer options from question data
			const sortedAnswers = [...question.answers].sort((a, b) => {
				const codeA = ANSWER_CODES.indexOf(a.code as (typeof ANSWER_CODES)[number]);
				const codeB = ANSWER_CODES.indexOf(b.code as (typeof ANSWER_CODES)[number]);
				return codeA - codeB;
			});

			setAnswerOptions(
				sortedAnswers.map((ans) => ({
					id: ans.id,
					code: ans.code,
					content: ans.content,
					isCorrect: ans.isCorrect,
				})),
			);

			setInitializedQuestionId(question.id);
		}
	}, [question, initializedQuestionId, form.setFieldValue]);

	if (Number.isNaN(questionId)) {
		return (
			<AdminContainer>
				<p className="text-destructive">Invalid question ID</p>
			</AdminContainer>
		);
	}

	if (isLoading) {
		return (
			<AdminContainer>
				<div className="mx-auto max-w-4xl">
					<Skeleton className="mb-6 h-10 w-64" />
					<Skeleton className="h-96 w-full" />
				</div>
			</AdminContainer>
		);
	}

	if (!question) {
		return (
			<AdminContainer>
				<div className="mx-auto max-w-4xl">
					<p className="text-destructive">Question not found</p>
				</div>
			</AdminContainer>
		);
	}

	const isSubmitting =
		updateQuestionMutation.isPending ||
		updateAnswerMutation.isPending ||
		createAnswerMutation.isPending ||
		deleteAnswerMutation.isPending;

	return (
		<AdminContainer>
			<AdminHeader title="Edit Question" description="Update question content and answer options" />

			<Card className="overflow-hidden rounded-xl py-0 shadow-sm">
				<CardHeader className="bg-muted/30 py-4">
					<CardTitle className="text-lg">Question Details</CardTitle>
				</CardHeader>
				<CardContent className="py-6">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
						className="space-y-8"
					>
						<form.Field name="content">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor="content" className="font-bold text-muted-foreground text-sm uppercase tracking-wider">
										Question Content *
									</Label>
									<div className="rounded-lg border bg-card p-1">
										<TiptapSimpleEditor
											content={field.state.value as object}
											onChange={(content) => field.handleChange(content)}
										/>
									</div>{" "}
								</div>
							)}
						</form.Field>{" "}
						<form.Field name="discussion">
							{(field) => (
								<div className="space-y-2">
									<Label
										htmlFor="discussion"
										className="font-bold text-muted-foreground text-sm uppercase tracking-wider"
									>
										Discussion / Explanation *
									</Label>
									<div className="rounded-lg border bg-muted/20 p-1">
										<TiptapSimpleEditor
											content={field.state.value as object}
											onChange={(content) => field.handleChange(content)}
										/>
									</div>
								</div>
							)}
						</form.Field>
						<form.Field name="isFlashcardQuestion">
							{(field) => (
								<div className="flex items-center gap-2">
									<Checkbox
										id="isFlashcardQuestion"
										checked={field.state.value}
										onCheckedChange={(checked) => field.handleChange(!!checked)}
									/>
									<Label htmlFor="isFlashcardQuestion" className="cursor-pointer">
										Available for Flashcard
									</Label>
								</div>
							)}
						</form.Field>
						<div className="flex gap-3 border-t pt-6">
							<Button type="submit" disabled={isSubmitting} className="flex-1 shadow-sm">
								{isSubmitting ? <>Saving Changes...</> : "Save Changes"}
							</Button>
							<Button type="button" variant="outline" onClick={() => navigate({ to: "/admin/questions" })}>
								Cancel
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</AdminContainer>
	);
}
