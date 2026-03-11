import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { useEffect } from "react";
import { PracticeQuestion, PracticeQuestionHeader } from "@/components/classes";
import { TiptapRenderer } from "@/components/tiptap-renderer";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/classes/$shortName/$contentId/latihan-soal")({
	component: RouteComponent,
});

function RouteComponent() {
	const { contentId } = Route.useParams();
	const queryClient = useQueryClient();

	const content = useQuery(
		orpc.subtest.getContentById.queryOptions({
			input: { contentId: Number(contentId) },
		}),
	);

	const updateProgressMutation = useMutation(
		orpc.subtest.updateProgress.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: orpc.subtest.getProgressStats.key(),
				});
			},
		}),
	);

	// Update progress when practice questions are viewed
	useEffect(() => {
		if (content.data?.practiceQuestions) {
			updateProgressMutation.mutate({
				id: Number(contentId),
				practiceQuestionsCompleted: true,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [content.data?.practiceQuestions, contentId, updateProgressMutation.mutate]);

	if (content.isPending) {
		return <p className="animate-pulse text-sm">Memuat latihan soal...</p>;
	}

	if (content.isError) {
		return <p className="text-sm text-red-500">Error: {content.error.message}</p>;
	}

	if (!content.data) return notFound();

	const practiceQuestions = content.data.practiceQuestions;
	if (!practiceQuestions) {
		return (
			<div className="space-y-4">
				<p className="text-base font-semibold text-primary-300">Latihan Soal</p>

				<PracticeQuestionHeader content={content.data.title} />

				<hr />

				<div className="flex flex-col items-center justify-center gap-2 text-center text-pretty">
					<Image src="/avatar/confused-avatar.webp" alt="Empty State" width={150} height={150} />
					<p>
						Ups, kontennya belum tersedia,
						<br />
						Tunggu kontennya diracik dulu ya!
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<p className="text-base font-semibold text-primary-300">Latihan Soal Materi</p>

			<PracticeQuestionHeader content={content.data.title} />

			<hr />

			{Array.isArray(practiceQuestions?.questions) && practiceQuestions.questions.length > 0 ? (
				practiceQuestions.questions.map((q, idx) => (
					<PracticeQuestion
						key={q.questionId}
						questionNumber={idx + 1}
						totalQuestions={practiceQuestions.questions.length}
						question={<TiptapRenderer className="mt-4" content={q.question} />}
						answer={
							<div className="space-y-3">
								{q.answers && q.answers.length > 0 && (
									<div className="space-y-2">
										{q.answers.map((answer) => (
											<p
												key={answer.id}
												className={
													answer.isCorrect ? "text-sm font-semibold text-green-600" : "text-sm text-muted-foreground"
												}
											>
												{answer.code}. {answer.content}
												{answer.isCorrect && " ✓"}
											</p>
										))}
									</div>
								)}
								{q.discussion && (
									<div className="mt-3 border-t border-neutral-200 pt-3">
										<p className="mb-1 text-sm font-medium">Pembahasan:</p>
										<TiptapRenderer content={q.discussion} />
									</div>
								)}
							</div>
						}
					/>
				))
			) : (
				<p className="text-sm text-muted-foreground">Belum ada latihan soal untuk materi ini.</p>
			)}
		</div>
	);
}
