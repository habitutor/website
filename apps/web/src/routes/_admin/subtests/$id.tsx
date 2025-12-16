import {
	ArrowLeftIcon,
	ArticleIcon,
	PencilSimpleIcon,
	VideoIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_admin/subtests/$id")({
	params: {
		parse: (rawParams) => {
			const id = Number(rawParams.id);
			return { id };
		},
	},
	component: AdminSubtestDetailPage,
});

function AdminSubtestDetailPage() {
	const { id } = Route.useParams();

	const subtest = useQuery(
		orpc.admin.subtest.getSubtest.queryOptions({
			input: { id },
		}),
	);

	return (
		<>
			<div className="mb-6">
				<Link
					to="/subtests"
					className="mb-4 inline-flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
				>
					<ArrowLeftIcon size={16} />
					Kembali ke daftar subtest
				</Link>
				<h1 className="font-bold text-2xl">
					{subtest.data?.name || <Skeleton className="h-8 w-48" />}
				</h1>
				{subtest.data?.description && (
					<p className="mt-1 text-muted-foreground">
						{subtest.data.description}
					</p>
				)}
			</div>

			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="font-semibold text-lg">Konten</h2>
				</div>

				{subtest.isPending && (
					<>
						<Skeleton className="h-24 w-full" />
						<Skeleton className="h-24 w-full" />
					</>
				)}

				{subtest.isError && (
					<p className="text-red-500">Error: {subtest.error.message}</p>
				)}

				{subtest.data?.contents.length === 0 && (
					<p className="text-muted-foreground">Belum ada konten</p>
				)}

				{subtest.data?.contents.map((content) => (
					<Card key={content.id} className="p-4">
						<div className="flex items-start justify-between gap-4">
							<div className="flex-1">
								<div className="mb-2 flex items-center gap-2">
									<span
										className={`rounded px-2 py-0.5 font-medium text-xs ${
											content.type === "materi"
												? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
												: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
										}`}
									>
										{content.type === "materi" ? "Materi" : "Tips & Trick"}
									</span>
									<span className="text-muted-foreground text-xs">
										Order: {content.order}
									</span>
								</div>
								<h3 className="font-medium">{content.title}</h3>
								<div className="mt-2 flex items-center gap-4 text-muted-foreground text-sm">
									{content.videoUrl && (
										<span className="inline-flex items-center gap-1">
											<VideoIcon size={14} />
											Video
										</span>
									)}
									{content.notes && (
										<span className="inline-flex items-center gap-1">
											<ArticleIcon size={14} />
											Notes
										</span>
									)}
								</div>
							</div>
							<Link
								to="/subtests/content/$contentId"
								params={{ contentId: content.id }}
							>
								<Button variant="outline" size="sm">
									<PencilSimpleIcon size={16} className="mr-1" />
									Edit
								</Button>
							</Link>
						</div>
					</Card>
				))}
			</div>
		</>
	);
}
