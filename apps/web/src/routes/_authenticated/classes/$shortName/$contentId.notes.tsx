import { useQuery } from "@tanstack/react-query";
import { createFileRoute, notFound, useLocation } from "@tanstack/react-router";
import { TiptapRenderer } from "@/components/tiptap-renderer";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/classes/$shortName/$contentId/notes")({
	component: RouteComponent,
});

function RouteComponent() {
	const { contentId } = Route.useParams();
	const location = useLocation();

	const content = useQuery(
		orpc.subtest.getContentById.queryOptions({
			input: { contentId: Number(contentId) },
		}),
	);

	if (content.isPending) {
		return <p className="animate-pulse text-sm">Memuat catatan...</p>;
	}

	if (content.isError) {
		return <p className="text-red-500 text-sm">Error: {content.error.message}</p>;
	}

	if (!content.data) return notFound();

	const note = content.data.note;
	if (!note) {
		return <p className="text-muted-foreground text-sm">Belum ada catatan untuk materi ini.</p>;
	}

	return (
		<div className="space-y-4">
			<p>
				Catatan Materi
			</p>
			<h2 className="font-semibold text-lg">{content.data.title}</h2>
			<TiptapRenderer content={note.content} />
		</div>
	);
}
