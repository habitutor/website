import { useQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { orpc } from "@/utils/orpc";
// import { QuizPlayer } from "@/components/quiz-player";

export const Route = createFileRoute("/_authenticated/classes/$shortName/$contentId/quiz")({
	component: RouteComponent,
});

function RouteComponent() {
	const { contentId } = Route.useParams();

	const content = useQuery(
		orpc.subtest.getContentById.queryOptions({
			input: { contentId: Number(contentId) },
		}),
	);

	if (content.isPending) {
		return <p className="animate-pulse text-sm">Memuat quiz...</p>;
	}

	if (content.isError) {
		return <p className="text-red-500 text-sm">Error: {content.error.message}</p>;
	}

	if (!content.data) return notFound();

	const quiz = content.data.quiz;
	if (!quiz) {
		return <p className="text-muted-foreground text-sm">Belum ada quiz untuk materi ini.</p>;
	}

	return (
		<div className="space-y-4">
			<h2 className="font-semibold text-lg">{content.data.title}</h2>
			{/* <QuizPlayer questions={quiz.questions} /> */}
			<p className="text-muted-foreground text-sm">(Render quiz di sini)</p>
		</div>
	);
}
