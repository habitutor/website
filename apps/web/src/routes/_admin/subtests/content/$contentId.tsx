import {
	ArrowLeftIcon,
	EyeIcon,
	FloppyDiskIcon,
	PencilSimpleIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LexicalEditor } from "@/components/lexical/elements/lexical-editor";
import { LexicalViewer } from "@/components/lexical/elements/lexical-viewer";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_admin/subtests/content/$contentId")({
	params: {
		parse: (rawParams) => {
			const contentId = Number(rawParams.contentId);
			return { contentId };
		},
	},
	component: AdminContentEditorPage,
});

function AdminContentEditorPage() {
	const { contentId } = Route.useParams();
	const queryClient = useQueryClient();

	const [isPreviewMode, setIsPreviewMode] = useState(false);
	const [title, setTitle] = useState("");
	const [videoUrl, setVideoUrl] = useState("");
	const [notes, setNotes] = useState<string>("");
	const [hasChanges, setHasChanges] = useState(false);

	const content = useQuery(
		orpc.admin.subtest.getContent.queryOptions({
			input: { contentId },
		}),
	);

	// Initialize form values when content loads
	useEffect(() => {
		if (content.data) {
			setTitle(content.data.title || "");
			setVideoUrl(content.data.videoUrl || "");
			// Don't set notes here - let the editor handle the initial content
		}
	}, [content.data]);
	
	const updateMutation = useMutation({
		...orpc.admin.subtest.updateContent.mutationOptions({
		}),
		onSuccess: () => {
			toast.success("Berhasil menyimpan perubahan");
			setHasChanges(false);
			queryClient.invalidateQueries({ queryKey: ["admin", "subtest", "getContent"] });
		},
		onError: (error) => {
			toast.error(`Gagal menyimpan: ${error.message}`);
		},
	});

	const handleSave = () => {
		updateMutation.mutate({
			contentId,
			title,
			videoUrl: videoUrl.trim() || undefined,
			notes: notes || undefined,
		});
	};

	const handleNotesChange = (newContent: string) => {
		setNotes(newContent);
		setHasChanges(true);
	};

	if (content.isPending) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-96 w-full" />
			</div>
		);
	}

	if (content.isError) {
		return <div className="text-red-500">Error: {content.error.message}</div>;
	}

	return (
		<>
			<div className="mb-6">
				<Link
					to="/subtests/$id"
					params={{ id: content.data.subtestId }}
					className={cn(
						buttonVariants({ variant: "default", size: "sm" }),
						"mb-4",
					)}
				>
					<ArrowLeftIcon size={16} weight="bold" />
					Kembali ke subtest
				</Link>

				<div className="flex items-center justify-between">
					<div>
						<span
							className={`rounded px-2 py-0.5 font-medium text-xs ${
								content.data.type === "materi"
									? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
									: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
							}`}
						>
							{content.data.type === "materi" ? "Materi" : "Tips & Trick"}
						</span>
						<h1 className="mt-2 font-bold text-2xl">Edit Konten</h1>
					</div>

					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setIsPreviewMode(!isPreviewMode)}
						>
							{isPreviewMode ? (
								<>
									<PencilSimpleIcon size={16} className="mr-1" />
									Edit
								</>
							) : (
								<>
									<EyeIcon size={16} className="mr-1" />
									Preview
								</>
							)}
						</Button>
						<Button
							onClick={handleSave}
							disabled={updateMutation.isPending}
							size="sm"
						>
							<FloppyDiskIcon size={16} className="mr-1" />
							{updateMutation.isPending ? "Menyimpan..." : "Simpan"}
						</Button>
					</div>
				</div>
				{hasChanges && (
					<p className="mt-2 text-amber-600 text-sm">
						Ada perubahan yang belum disimpan
					</p>
				)}
			</div>

			<div className="space-y-6">
				{/* Metadata */}
				<Card className="p-6">
					<h2 className="mb-4 font-semibold text-lg">Informasi Dasar</h2>
					<div className="space-y-4">
						<div>
							<Label htmlFor="title">Judul</Label>
							<Input
								id="title"
								value={title}
								onChange={(e) => {
									setTitle(e.target.value);
									setHasChanges(true);
								}}
								placeholder="Judul konten"
							/>
						</div>
						<div>
							<Label htmlFor="videoUrl">URL Video (YouTube)</Label>
							<Input
								id="videoUrl"
								value={videoUrl}
								onChange={(e) => {
									setVideoUrl(e.target.value);
									setHasChanges(true);
								}}
								placeholder="https://www.youtube.com/watch?v=..."
							/>
						</div>
					</div>
				</Card>

				{/* Notes Editor */}
				<Card className="p-6">
					<h2 className="mb-4 font-semibold text-lg">
						Deskripsi Materi (Notes)
					</h2>
					<p className="mb-4 text-muted-foreground text-sm">
						Tulis deskripsi materi dengan rich text editor. Bisa menyisipkan
						gambar dan video inline.
					</p>

					{isPreviewMode ? (
						<div className="min-h-[200px] rounded-lg border border-border bg-muted/20 p-4">
							<LexicalViewer content={notes || content.data.notes} />
						</div>
					) : (
						<LexicalEditor
							initialContent={content.data.notes}
							onChange={handleNotesChange}
							placeholder="Tulis deskripsi materi di sini..."
							showImageInsert={true}
							showVideoInsert={true}
						/>
					)}
				</Card>
			</div>
		</>
	);
}
