import { createFileRoute } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Plus, Search } from "lucide-react";
import { useState } from "react";
import { orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_admin/admin/practice-packs/$id")({
	component: PracticePackDetailPage,
});

function PracticePackDetailPage() {
	const { id } = Route.useParams();
	const packId = Number.parseInt(id);

	const [showCreateForm, setShowCreateForm] = useState(false);

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
								<Button onClick={() => console.log("Add existing")} variant="outline">
									<Search className="mr-2 size-4" />
									Add Existing
								</Button>
								<Button onClick={() => setShowCreateForm(true)}>
									<Plus className="mr-2 size-4" />
									Create New Question
								</Button>
							</div>
						</div>

						{showCreateForm && (
							<Card>
								<CardHeader>
									<CardTitle>Create New Question</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground text-sm">
										Form will be implemented here
									</p>
									<Button
										variant="outline"
										onClick={() => setShowCreateForm(false)}
										className="mt-4"
									>
										Cancel
									</Button>
								</CardContent>
							</Card>
						)}

						<QuestionsList packId={packId} />
					</div>
				</div>
			</main>
		</div>
	);
}

function PackInfoCard({ packId }: { packId: number }) {
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
					<Button variant="outline">Edit Pack Info</Button>
				</div>
			</CardContent>
		</Card>
	);
}

function QuestionsList({ packId }: { packId: number }) {
	console.log("QuestionsList for pack:", packId);
	
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
