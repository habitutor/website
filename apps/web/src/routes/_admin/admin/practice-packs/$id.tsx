import { createFileRoute } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ArrowLeft, Plus, Search } from "lucide-react";
import { useState } from "react";
import { orpc } from "@/utils/orpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateQuestionForm } from "./-components/create-question-form";
import { EditPackForm } from "./-components/edit-pack-form";
import { AddExistingQuestionModal } from "./-components/add-existing-modal";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/admin/practice-packs/$id")({
	component: PracticePackDetailPage,
});

function PracticePackDetailPage() {
	const { id } = Route.useParams();
	const packId = Number.parseInt(id);

	const [showCreateForm, setShowCreateForm] = useState(false);
	const [showAddExisting, setShowAddExisting] = useState(false);

	const { data: questions } = useQuery(
		orpc.admin.practicePack.getPackQuestions.queryOptions({ input: { id: packId } })
	);

	const existingQuestionIds = questions?.map((q) => q.id) || [];

	if (Number.isNaN(packId)) {
		return (
			<div className="flex min-h-screen">
				<AdminSidebar />
				<main className="flex-1 bg-background p-8">
					<p className="text-destructive">Invalid practice pack ID</p>
				</main>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen">
			<AdminSidebar />
			<main className="flex-1 bg-background p-8">
				<div className="mx-auto max-w-6xl">
					<div className="mb-6 flex items-center gap-4">
						<Button variant="ghost" size="icon" asChild>
							<a href="/admin/practice-packs">
								<ArrowLeft className="size-4" />
							</a>
						</Button>
						<h1 className="font-bold text-3xl">Practice Pack Detail</h1>
					</div>

					<div className="space-y-6">
						<PackInfoCard packId={packId} />

						<div className="flex items-center justify-between">
							<h2 className="font-semibold text-2xl">Questions</h2>
							<div className="flex gap-2">
								<Button onClick={() => setShowAddExisting(true)} variant="outline">
									<Search className="mr-2 size-4" />
									Add Existing
								</Button>
								<Button onClick={() => setShowCreateForm(true)}>
									<Plus className="mr-2 size-4" />
									Create New Question
								</Button>
							</div>
						</div>

						{showAddExisting && (
							<AddExistingQuestionModal
								practicePackId={packId}
								existingQuestionIds={existingQuestionIds}
								onClose={() => setShowAddExisting(false)}
							/>
						)}

						{showCreateForm && (
							<CreateQuestionForm
								practicePackId={packId}
								onSuccess={() => setShowCreateForm(false)}
								onCancel={() => setShowCreateForm(false)}
							/>
						)}

						<QuestionsList packId={packId} />
					</div>
				</div>
			</main>
		</div>
	);
}

function PackInfoCard({ packId }: { packId: number }) {
	const [isEditing, setIsEditing] = useState(false);
	const { data: packs, isLoading } = useQuery(
		orpc.admin.practicePack.listPacks.queryOptions()
	);
	
	const pack = packs?.find((p: { id: number }) => p.id === packId);

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Pack Information</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<Skeleton className="h-8 w-2/3" />
						<Skeleton className="h-20 w-full" />
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!pack) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Pack Information</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-destructive">Practice pack not found</p>
				</CardContent>
			</Card>
		);
	}

	if (isEditing) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Edit Pack Information</CardTitle>
				</CardHeader>
				<CardContent>
					<EditPackForm
						pack={pack}
						onSuccess={() => setIsEditing(false)}
						onCancel={() => setIsEditing(false)}
					/>
				</CardContent>
			</Card>
		);
	}
	
	return (
		<Card>
			<CardHeader>
				<CardTitle>Pack Information</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div>
						<h3 className="font-semibold text-lg">{pack.title}</h3>
						{pack.description && (
							<p className="mt-2 text-muted-foreground">{pack.description}</p>
						)}
					</div>
					<Button variant="outline" onClick={() => setIsEditing(true)}>
						Edit Pack Info
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

function QuestionsList({ packId }: { packId: number }) {
	const { data: questions, isLoading } = useQuery(
		orpc.admin.practicePack.getPackQuestions.queryOptions({ input: { id: packId } })
	);

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Questions in this Pack</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						<Skeleton className="h-20 w-full" />
						<Skeleton className="h-20 w-full" />
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!questions || questions.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Questions in this Pack</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground text-sm">
						No questions yet. Create a new question or add an existing one.
					</p>
				</CardContent>
			</Card>
		);
	}
	
	return (
		<Card>
			<CardHeader>
				<CardTitle>Questions in this Pack ({questions.length})</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{questions.map((q) => (
						<QuestionCard key={q.id} question={q} packId={packId} />
					))}
				</div>
			</CardContent>
		</Card>
	);
}

function QuestionCard({
	question,
	packId,
}: {
	question: { id: number; content: string; discussion: string; order: number | null };
	packId: number;
}) {
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const queryClient = useQueryClient();

	const removeMutation = useMutation(
		orpc.admin.practicePack.removeQuestionFromPack.mutationOptions({
			onSuccess: () => {
				toast.success("Question removed from pack");
				queryClient.invalidateQueries(
					orpc.admin.practicePack.getPackQuestions.queryOptions({ input: { id: packId } })
				);
				setDeleteDialogOpen(false);
			},
			onError: (error) => {
				toast.error("Failed to remove question", {
					description: String(error),
				});
			},
		})
	);

	const handleRemove = () => {
		removeMutation.mutate({ practicePackId: packId, questionId: question.id });
	};

	return (
		<>
			<div className="flex items-start gap-4 rounded-lg border p-4">
				<div className="flex-1">
					<div className="mb-2 flex items-center gap-2">
						<span className="rounded bg-primary/10 px-2 py-1 font-medium text-primary text-xs">
							#{question.order || 0}
						</span>
						<h4 className="font-medium">{question.content}</h4>
					</div>
					<p className="line-clamp-2 text-muted-foreground text-sm">
						{question.discussion}
					</p>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							window.location.href = `/admin/questions/${question.id}`;
						}}
					>
						Edit
					</Button>
					<Button
						variant="destructive"
						size="sm"
						onClick={() => setDeleteDialogOpen(true)}
					>
						Remove
					</Button>
				</div>
			</div>

			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Remove Question from Pack?</AlertDialogTitle>
						<AlertDialogDescription>
							This will remove the question from this practice pack. The question will still exist in the question bank.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleRemove}
							disabled={removeMutation.isPending}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{removeMutation.isPending ? "Removing..." : "Remove"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
