import { useQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { orpc } from "@/utils/orpc";
// import { QuizPlayer } from "@/components/quiz-player";

export const Route = createFileRoute("/_authenticated/classes/$shortName/$contentId/latihan-soal")({
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
		return <p className="animate-pulse text-sm">Memuat latihan soal...</p>;
	}

	if (content.isError) {
		return <p className="text-red-500 text-sm">Error: {content.error.message}</p>;
	}

	if (!content.data) return notFound();

	const practiceQuestions = content.data.practiceQuestions;
	if (!practiceQuestions) {
		return <p className="text-muted-foreground text-sm">Belum ada latihan soal untuk materi ini.</p>;
	}

	return (
		<div className="space-y-4">
			<h2 className="font-semibold text-lg">{content.data.title}</h2>
			{/* <QuizPlayer questions={practiceQuestions.questions} /> */}
			<p className="text-muted-foreground text-sm">(Render latihan soal di sini)</p>
		</div>
	);
}
