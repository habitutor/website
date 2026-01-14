import { ArrowLeft, Plus, X } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type } from "arktype";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_admin/admin/questions/$id")({
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
		orpc.admin.practicePack.getQuestionDetail.queryOptions({
			input: { id: questionId },
		}),
	);

	const updateQuestionMutation = useMutation(orpc.admin.practicePack.updateQuestion.mutationOptions());
	const updateAnswerMutation = useMutation(orpc.admin.practicePack.updateAnswerOption.mutationOptions());
	const createAnswerMutation = useMutation(orpc.admin.practicePack.createAnswerOption.mutationOptions());
	const deleteAnswerMutation = useMutation(orpc.admin.practicePack.deleteAnswerOption.mutationOptions());

	const form = useForm({
		defaultValues: {
			content: "",
			discussion: "",
		},
		onSubmit: async ({ value }) => {
			const validation = type({
				content: "string>0",
				discussion: "string>0",
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
					orpc.admin.practicePack.getQuestionDetail.queryOptions({
						input: { id: questionId },
					}),
				);
				queryClient.invalidateQueries({
					predicate: (query) =>
						query.queryKey[0] ===
						orpc.admin.practicePack.listAllQuestions.queryKey({ input: { limit: 0, offset: 0 } })[0],
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
			<main className="flex-1 p-4 pt-20 lg:ml-64 lg:p-8 lg:pt-8">
				<p className="text-destructive">Invalid question ID</p>
			</main>
		);
	}

	if (isLoading) {
		return (
			<main className="flex-1 p-4 pt-20 lg:ml-64 lg:p-8 lg:pt-8">
				<div className="mx-auto max-w-4xl">
					<Skeleton className="mb-6 h-10 w-64" />
					<Skeleton className="h-96 w-full" />
				</div>
			</main>
		);
	}

	if (!question) {
		return (
			<main className="flex-1 p-4 pt-20 lg:ml-64 lg:p-8 lg:pt-8">
				<div className="mx-auto max-w-4xl">
					<div className="mb-6 flex items-center gap-4">
						<a href="/admin/questions">
							<Button variant="ghost" size="icon">
								<ArrowLeft className="size-4" />
							</Button>
						</a>
						<h1 className="font-bold text-2xl sm:text-3xl">Edit Question</h1>
					</div>
					<p className="text-destructive">Question not found</p>
				</div>
			</main>
		);
	}

	const isSubmitting =
		updateQuestionMutation.isPending ||
		updateAnswerMutation.isPending ||
		createAnswerMutation.isPending ||
		deleteAnswerMutation.isPending;

	const addAnswerOption = () => {
		if (answerOptions.length >= 10) {
			toast.error("Maximum 10 answer options allowed");
			return;
		}
		const nextCode = ANSWER_CODES[answerOptions.length];
		if (!nextCode) return;
		setAnswerOptions([...answerOptions, { id: 0, code: nextCode, content: "", isCorrect: false }]);
	};

	const removeAnswerOption = async (index: number) => {
		if (answerOptions.length <= 2) {
			toast.error("Minimum 2 answer options required");
			return;
		}

		const option = answerOptions[index];
		if (!option) return;

		// If option has an ID, delete it from database
		if (option.id > 0) {
			try {
				await deleteAnswerMutation.mutateAsync({ id: option.id });
				toast.success("Answer option deleted");
			} catch (error) {
				toast.error("Failed to delete answer option", {
					description: String(error),
				});
				return;
			}
		}

		const newOptions = answerOptions.filter((_, i) => i !== index);
		// Reassign codes after removal
		const reassignedOptions = newOptions.map((opt, idx) => {
			const code = ANSWER_CODES[idx];
			if (!code) return opt;
			return {
				...opt,
				code,
			};
		});
		setAnswerOptions(reassignedOptions);
	};

	const updateAnswerOption = (index: number, field: keyof AnswerOption, value: string | boolean) => {
		const newOptions = [...answerOptions];
		const currentOption = newOptions[index];
		if (!currentOption) return;
		newOptions[index] = { ...currentOption, [field]: value };
		setAnswerOptions(newOptions);
	};

	return (
		<main className="flex-1 p-4 pt-20 lg:ml-64 lg:p-8 lg:pt-8">
			<div className="mx-auto max-w-4xl">
				<div className="mb-4 flex items-center gap-4 sm:mb-6">
					<a href="/admin/questions">
						<Button variant="ghost" size="icon">
							<ArrowLeft className="size-4" />
						</Button>
					</a>
					<h1 className="font-bold text-2xl sm:text-3xl">Edit Question</h1>
				</div>

				<Card className="rounded-xl shadow-sm">
					<CardHeader className="p-4 sm:p-6">
						<CardTitle className="text-lg sm:text-xl">Question Details</CardTitle>
					</CardHeader>
					<CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
						<form
							onSubmit={(e) => {
								e.preventDefault();
								form.handleSubmit();
							}}
							className="space-y-6"
						>
							<form.Field name="content">
								{(field) => (
									<div>
										<Label htmlFor="content">Question Content *</Label>
										<Input
											id="content"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="Enter the question"
											className="mt-2"
										/>
									</div>
								)}
							</form.Field>

							<form.Field name="discussion">
								{(field) => (
									<div>
										<Label htmlFor="discussion">Discussion / Explanation *</Label>
										<Input
											id="discussion"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="Explain the answer"
											className="mt-2"
										/>
									</div>
								)}
							</form.Field>

							<div>
								<div className="mb-4 flex items-center justify-between">
									<h3 className="font-medium">Answer Options *</h3>
									<Button
										type="button"
										size="sm"
										variant="outline"
										onClick={addAnswerOption}
										disabled={answerOptions.length >= 10}
									>
										<Plus className="mr-1 size-4" />
										Add Option
									</Button>
								</div>
								<div className="space-y-3">
									{answerOptions.map((option, index) => (
										<div key={`${option.code}-${option.id}`} className="flex items-start gap-2">
											<div className="mt-2 flex items-center gap-2">
												<span className="font-medium text-sm">{option.code}.</span>
												<Checkbox
													checked={option.isCorrect}
													onCheckedChange={(checked) => updateAnswerOption(index, "isCorrect", !!checked)}
												/>
											</div>
											<Input
												value={option.content}
												onChange={(e) => updateAnswerOption(index, "content", e.target.value)}
												placeholder={`Option ${option.code}`}
												className="flex-1"
											/>
											{answerOptions.length > 2 && (
												<Button
													type="button"
													size="icon"
													variant="ghost"
													onClick={() => removeAnswerOption(index)}
													className="mt-1 size-8 shrink-0"
												>
													<X className="size-4" />
												</Button>
											)}
										</div>
									))}
								</div>
								<p className="mt-2 text-muted-foreground text-xs">
									Check the box to mark as correct answer. At least 2 options required.
								</p>
							</div>

							<div className="flex gap-2">
								<Button type="submit" disabled={isSubmitting} className="flex-1">
									{isSubmitting ? (
										<>
											<Loader />
											Saving...
										</>
									) : (
										"Save Changes"
									)}
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										window.location.href = "/admin/questions";
									}}
								>
									Cancel
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
