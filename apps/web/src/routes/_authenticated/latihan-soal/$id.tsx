import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { TiptapRenderer } from "@/components/tiptap-renderer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Label } from "@/components/ui/label";
import { useDebouncedMutation } from "@/hooks/use-debounced-mutation";
import { orpc, queryClient } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/latihan-soal/$id")({
	params: {
		parse: (rawParams) => {
			const id = Number(rawParams.id);
			return { id };
		},
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { id } = Route.useParams();
	const navigate = useNavigate();

	const pack = useQuery(
		orpc.practicePack.find.queryOptions({
			input: {
				id: id,
			},
		}),
	);

	const initialAnswers = useMemo(() => {
		if (!pack.data?.questions) return {};
		const savedAnswers: Record<number, number> = {};
		pack.data.questions.forEach((q) => {
			if (q.selectedAnswerId !== null) {
				savedAnswers[q.id] = q.selectedAnswerId;
			}
		});
		return savedAnswers;
	}, [pack.data?.questions]);

	const [answers, setAnswers] = useState<Record<number, number>>({});

	// Sync local state when initialAnswers changes
	useEffect(() => {
		if (Object.keys(initialAnswers).length > 0) {
			setAnswers(initialAnswers);
		}
	}, [initialAnswers]);

	const saveMutation = useDebouncedMutation(
		orpc.practicePack.saveAnswer.mutationOptions(),
		500, // 500ms delay
	);

	const submitMutation = useMutation(
		orpc.practicePack.submitAttempt.mutationOptions({
			onSuccess: (data) => {
				toast.success(data.message);
				queryClient.invalidateQueries({
					queryKey: orpc.practicePack.list.key(),
				});
				navigate({ to: "/latihan-soal" });
			},
		}),
	);

	const handleAnswerChange = useCallback(
		(questionId: number, answerId: number) => {
			setAnswers((prev) => ({ ...prev, [questionId]: answerId }));

			if (pack.data?.attemptId) {
				saveMutation.debouncedMutate({
					id: id,
					questionId,
					selectedAnswerId: answerId,
				});
			}
		},
		[id, pack.data?.attemptId, saveMutation],
	);

	if (Number.isNaN(id)) return notFound();

	const handleSubmit = () => {
		if (pack.data?.attemptId) {
			submitMutation.mutate({ id: id });
		}
	};

	if (pack.isPending) {
		return (
			<Container className="pt-20">
				<p className="animate-pulse">Loading...</p>
			</Container>
		);
	}

	if (pack.isError) {
		return (
			<Container className="pt-20">
				<p className="text-red-500">Error: {pack.error.message}</p>
			</Container>
		);
	}

	return (
		<>
			<h1 className="mb-6 text-2xl font-bold">{pack.data?.title}</h1>

			<div className="space-y-6">
				{pack.data?.questions.map((q, idx) => (
					<Card key={q.id} className="p-6">
						<h3 className="mb-4 flex items-start gap-2 text-lg font-medium">
							<span>{idx + 1}.</span>
							<TiptapRenderer content={q.content} />
						</h3>
						<div className="space-y-2">
							{q.answers.map((answer) => (
								<Label
									key={answer.id}
									className="flex cursor-pointer items-center gap-2 rounded border p-3 hover:bg-muted"
								>
									<input
										type="radio"
										name={`question-${q.id}`}
										value={answer.id}
										checked={answers[q.id] === answer.id}
										onChange={() => handleAnswerChange(q.id, answer.id)}
										className="cursor-pointer"
									/>
									<span>{answer.content}</span>
								</Label>
							))}
						</div>
					</Card>
				))}

				{pack.data?.questions && pack.data.questions.length > 0 && (
					<Button onClick={handleSubmit} disabled={submitMutation.isPending} className="w-full">
						{submitMutation.isPending ? "Memasak..." : "Kumpulkan"}
					</Button>
				)}
			</div>
		</>
	);
}
