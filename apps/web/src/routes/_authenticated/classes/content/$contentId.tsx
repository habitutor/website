import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { LexicalViewer } from "@/components/lexical/elements/lexical-viewer";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute(
	"/_authenticated/classes/content/$contentId",
)({
	params: {
		parse: (rawParams) => {
			const contentId = Number(rawParams.contentId);
			return { contentId };
		},
	},
	validateSearch: (search: Record<string, unknown>) => {
		return {
			subtestId: search.subtestId ? String(search.subtestId) : undefined,
		};
	},
	component: RouteComponent,
});

// Extract YouTube video ID from URL
function getYouTubeVideoId(url: string): string | null {
	const patterns = [
		/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
		/youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
	];
	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match) return match[1];
	}
	return null;
}

// Video Player Component
function VideoPlayer({ url }: { url: string }) {
	const videoId = getYouTubeVideoId(url);

	if (videoId) {
		return (
			<div className="mb-6">
				<div className="relative w-full" style={{ aspectRatio: "16/9" }}>
					<iframe
						src={`https://www.youtube.com/embed/${videoId}`}
						className="absolute inset-0 h-full w-full rounded-lg"
						frameBorder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowFullScreen
						title="Video materi"
					/>
				</div>
			</div>
		);
	}

	// Fallback for non-YouTube URLs
	return (
		<div className="mb-6">
			<video
				src={url}
				controls
				className="w-full rounded-lg"
				style={{ aspectRatio: "16/9" }}
			>
				<track kind="captions" />
				Your browser does not support the video tag.
			</video>
		</div>
	);
}

function RouteComponent() {
	const { contentId } = Route.useParams();
	const searchParams = Route.useSearch();

	// Get subtestId from search params (passed from ContentCard)
	const subtestId = searchParams.subtestId
		? Number(searchParams.subtestId)
		: undefined;

	const content = useQuery({
		...orpc.subtest.getContent.queryOptions({
			input: {
				subtestId: subtestId || 0,
				contentId: contentId,
			},
		}),
		enabled: !!subtestId && subtestId > 0,
	});

	const isLoading = content.isPending;
	const isError = content.isError;
	const error = content.error;
	const finalContent = content.data;

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-96 w-full" />
			</div>
		);
	}

	if (isError) {
		return <div className="text-red-500">Error: {error?.message}</div>;
	}

	if (!finalContent) {
		return <div className="text-red-500">Konten tidak ditemukan</div>;
	}

	return (
		<>
			<div className="mb-6">
				<Link
					to="/classes/$id"
					params={{ id: finalContent.subtestId }}
					className={cn(
						buttonVariants({ variant: "default", size: "sm" }),
						"mb-4",
					)}
				>
					<ArrowLeftIcon size={16} weight="bold" />
					Kembali ke kelas
				</Link>

				<div className="flex items-center gap-2">
					<span
						className={`rounded px-2 py-0.5 font-medium text-xs ${
							finalContent.type === "materi"
								? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
								: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
						}`}
					>
						{finalContent.type === "materi" ? "Materi" : "Tips & Trick"}
					</span>
					<h1 className="font-bold text-2xl">{finalContent.title}</h1>
				</div>
			</div>

			<Card className="p-6">
				{/* Video utama dari videoUrl field */}
				{finalContent.videoUrl && (
					<VideoPlayer url={finalContent.videoUrl} />
				)}

				{/* Notes/deskripsi materi dengan Lexical Viewer */}
				{finalContent.notes && (
					<div className="mt-4">
						<LexicalViewer content={finalContent.notes} />
					</div>
				)}
			</Card>
		</>
	);
}
