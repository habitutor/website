import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { TiptapRenderer } from "@/components/tiptap-renderer";
import YouTubePlayer from "@/components/youtube-player";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/classes/$shortName/$contentId/video")({
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

	// Update progress when video is viewed
	useEffect(() => {
		if (content.data?.video) {
			updateProgressMutation.mutate({
				id: Number(contentId),
				videoCompleted: true,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [content.data?.video, contentId, updateProgressMutation.mutate]);

	if (content.isPending) {
		return <p className="animate-pulse text-sm">Memuat video...</p>;
	}

	if (content.isError) {
		return <p className="text-red-500 text-sm">Error: {content.error.message}</p>;
	}

	if (!content.data) return notFound();

	const video = content.data.video;
	if (!video) {
		return <p className="text-muted-foreground text-sm">Belum ada video untuk materi ini.</p>;
	}

	const videoId = video.videoUrl?.split("v=")[1] ?? "";

	return (
		<div className="space-y-4">
			<p>Video Materi</p>

			<div className="aspect-video w-full">
				<YouTubePlayer videoId={videoId} />
			</div>

			<hr />

			<h3 className="font-semibold text-lg">Tentang Video</h3>
			<TiptapRenderer content={video.content} />
		</div>
	);
}
