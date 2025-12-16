import { Package, Plus, Trash } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminSidebar } from "@/components/admin/sidebar";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_admin/admin/practice-packs/")({
	component: PracticePacksListPage,
});

function PracticePacksListPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const { data: packs, isPending, isError, error } = useQuery(orpc.admin.practicePack.listPacks.queryOptions());

	const filteredPacks = packs?.filter((pack) => pack.title.toLowerCase().includes(searchQuery.toLowerCase()));

	return (
		<div className="flex min-h-screen">
			<AdminSidebar />

			<main className="ml-64 flex-1 p-8">
				<div className="mb-8 flex items-center justify-between">
					<div>
						<h1 className="font-bold text-3xl">Practice Packs</h1>
						<p className="text-muted-foreground">Kelola paket latihan soal</p>
					</div>

					<Button asChild>
						<Link to="/admin/practice-packs/create">
							<Plus />
							Create New Pack
						</Link>
					</Button>
				</div>

				<div className="mb-6">
					<Input
						placeholder="Search practice packs..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="max-w-md"
					/>
				</div>

				{isPending && (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{[1, 2, 3].map((i) => (
							<Card key={i} className="p-6">
								<Skeleton className="mb-4 h-6 w-3/4" />
								<Skeleton className="mb-4 h-4 w-full" />
								<Skeleton className="h-10 w-full" />
							</Card>
						))}
					</div>
				)}

				{isError && (
					<div className="rounded-lg border border-destructive bg-destructive/10 p-4">
						<p className="text-destructive">Error: {error.message}</p>
					</div>
				)}

				{filteredPacks && filteredPacks.length === 0 && (
					<div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
						<Package className="mb-4 size-12 text-muted-foreground" />
						<h3 className="mb-2 font-semibold text-lg">No practice packs found</h3>
						<p className="mb-4 text-muted-foreground text-sm">
							{searchQuery ? "Try adjusting your search query" : "Get started by creating a new practice pack"}
						</p>
						{!searchQuery && (
							<Button asChild>
								<Link to="/admin/practice-packs/create">
									<Plus />
									Create First Pack
								</Link>
							</Button>
						)}
					</div>
				)}

				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{filteredPacks?.map((pack) => (
						<PracticePackCard key={pack.id} pack={pack} />
					))}
				</div>
			</main>
		</div>
	);
}

function PracticePackCard({ pack }: { pack: { id: number; title: string; description: string | null } }) {
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const queryClient = useQueryClient();

	const deleteMutation = useMutation(
		orpc.admin.practicePack.deletePack.mutationOptions({
			onSuccess: () => {
				toast.success("Practice pack berhasil dihapus");
				queryClient.invalidateQueries(orpc.admin.practicePack.listPacks.queryOptions());
				setDeleteDialogOpen(false);
			},
			onError: (error) => {
				toast.error("Gagal menghapus practice pack", {
					description: error.message,
				});
			},
		}),
	);

	const handleDelete = () => {
		deleteMutation.mutate({ id: pack.id });
	};

	return (
		<>
			<Card className="flex flex-col p-6">
				<div className="mb-4 flex-1">
					<h3 className="mb-2 font-semibold text-lg">{pack.title}</h3>
					<p className="line-clamp-2 text-muted-foreground text-sm">{pack.description || "No description"}</p>
				</div>

				<div className="flex gap-2">
					<Button variant="destructive" size="sm" className="flex-1" onClick={() => setDeleteDialogOpen(true)}>
						<Trash />
						Delete
					</Button>
				</div>
			</Card>

			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Practice Pack?</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete "{pack.title}"? This action cannot be undone and will remove all associated questions.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction asChild>
							<Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
								{deleteMutation.isPending ? "Deleting..." : "Delete"}
							</Button>
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
