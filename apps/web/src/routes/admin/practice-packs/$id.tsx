import { MagnifyingGlassIcon, PlusIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminContainer } from "@/components/admin/dashboard-layout";
import { Button } from "@/components/ui/button";
import { orpc } from "@/utils/orpc";
import { AddExistingQuestionModal } from "./-components/add-existing-modal";
import { CreateQuestionForm } from "./-components/create-question-form";
import { PackInfoHeader } from "./-components/pack-info-header";
import { QuestionsList } from "./-components/questions-list";

export const Route = createFileRoute("/admin/practice-packs/$id")({
	component: PracticePackDetailPage,
});

function PracticePackDetailPage() {
	const { id } = Route.useParams();
	const packId = Number.parseInt(id, 10);

	const [showCreateForm, setShowCreateForm] = useState(false);
	const [showAddExisting, setShowAddExisting] = useState(false);

	const { data } = useQuery(
		orpc.admin.practicePack.getQuestions.queryOptions({
			input: { id: packId },
		}),
	);

	const existingQuestionIds = data?.questions?.map((q) => q.id) || [];

	if (Number.isNaN(packId)) {
		return (
			<AdminContainer>
				<p className="text-destructive">Invalid practice pack ID</p>
			</AdminContainer>
		);
	}

	return (
		<AdminContainer>
			<div className="space-y-6 sm:space-y-8">
				<PackInfoHeader packId={packId} />

				<div className="space-y-4">
					<div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
						<h2 className="font-bold text-xl tracking-tight sm:text-2xl">
							Questions
							<span className="ml-2 rounded-full bg-muted px-2.5 py-0.5 font-medium text-base text-muted-foreground">
								{data?.questions?.length || 0}
							</span>
						</h2>
						<div className="flex flex-col gap-2 sm:flex-row">
							<Button onClick={() => setShowAddExisting(true)} variant="lightBlue" className="gap-2 text-xs sm:text-sm">
								<MagnifyingGlassIcon className="size-3.5 sm:size-4" />
								Add Existing
							</Button>
							<Button onClick={() => setShowCreateForm(true)} className="gap-2 text-xs shadow-sm sm:text-sm">
								<PlusIcon className="size-3.5 sm:size-4" />
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

					<QuestionsList packId={packId} onCreateNew={() => setShowCreateForm(true)} />
				</div>
			</div>
		</AdminContainer>
	);
}
