import { createFileRoute } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Search, Edit, Trash2 } from "lucide-react";
import { orpc } from "@/utils/orpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/admin/questions/")({
	component: QuestionsPage,
});

function QuestionsPage() {
	const [searchQuery, setSearchQuery] = useState("");

	const { data: questions, isLoading } = useQuery(
		orpc.admin.practicePack.listAllQuestions.queryOptions()
	);

	const filteredQuestions = questions?.filter((q) =>
		q.content.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<div className="flex min-h-screen">
			<AdminSidebar />
			<main className="flex-1 bg-background p-8">
				<div className="mx-auto max-w-6xl">
					<div className="mb-6 flex items-center justify-between">
						<div>
							<h1 className="font-bold text-3xl">Questions Bank</h1>
							<p className="mt-1 text-muted-foreground text-sm">
								Manage all questions across practice packs
							</p>
						</div>
					</div>

					<div className="mb-6">
						<div className="relative">
							<Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder="Search questions..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-9"
							/>
						</div>
					</div>

					{isLoading ? (
						<div className="space-y-4">
							<Skeleton className="h-32 w-full" />
							<Skeleton className="h-32 w-full" />
							<Skeleton className="h-32 w-full" />
						</div>
					) : !filteredQuestions || filteredQuestions.length === 0 ? (
						<Card>
							<CardContent className="py-12 text-center">
								<p className="text-muted-foreground">
									{searchQuery
										? "No questions found matching your search."
										: "No questions yet. Create questions from practice packs."}
								</p>
							</CardContent>
						</Card>
					) : (
						<div className="space-y-4">
							{filteredQuestions.map((question) => (
								<QuestionCard key={question.id} question={question} />
							))}
						</div>
					)}
				</div>
			</main>
		</div>
	);
}

function QuestionCard({
	question,
}: {
	question: {
		id: number;
		content: string;
		discussion: string;
		packCount: number;
	};
}) {
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const queryClient = useQueryClient();

	const deleteMutation = useMutation(
		orpc.admin.practicePack.deleteQuestion.mutationOptions({
			onSuccess: () => {
				toast.success("Question deleted successfully");
				queryClient.invalidateQueries(
					orpc.admin.practicePack.listAllQuestions.queryOptions()
				);
				setDeleteDialogOpen(false);
			},
			onError: (error) => {
				toast.error("Failed to delete question", {
					description: String(error),
				});
			},
		})
	);

	const handleDelete = () => {
		deleteMutation.mutate({ id: question.id });
	};

	return (
		<>
			<Card>
				<CardHeader>
					<div className="flex items-start justify-between gap-4">
						<div className="flex-1">
							<CardTitle className="text-lg">{question.content}</CardTitle>
							<p className="mt-2 line-clamp-2 text-muted-foreground text-sm">
								{question.discussion}
							</p>
						</div>
						<div className="flex items-center gap-2">
							{question.packCount > 0 ? (
								<span className="whitespace-nowrap rounded-md bg-primary/10 px-3 py-1 font-medium text-primary text-xs">
									Used in {question.packCount} pack{question.packCount !== 1 ? "s" : ""}
								</span>
							) : (
								<span className="whitespace-nowrap rounded-md bg-muted px-3 py-1 text-muted-foreground text-xs">
									Unused
								</span>
							)}
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								window.location.href = `/admin/questions/${question.id}`;
							}}
						>
							<Edit className="mr-2 size-4" />
							Edit
						</Button>
						<Button
							variant="destructive"
							size="sm"
							onClick={() => setDeleteDialogOpen(true)}
						>
							<Trash2 className="mr-2 size-4" />
							Delete
						</Button>
					</div>
				</CardContent>
			</Card>

			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Question?</AlertDialogTitle>
						<AlertDialogDescription>
							{question.packCount > 0 ? (
								<>
									This question is currently used in{" "}
									<span className="font-semibold">
										{question.packCount} practice pack{question.packCount !== 1 ? "s" : ""}
									</span>
									. Deleting it will remove it from all packs. This action cannot be
									undone.
								</>
							) : (
								"This will permanently delete this question. This action cannot be undone."
							)}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={deleteMutation.isPending}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{deleteMutation.isPending ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
