import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/practice")({
	component: RouteComponent,
});

function PackQuestions({ packId }: { packId: number }) {
	const questions = useQuery(
		orpc.practicePack.getQuestions.queryOptions({
			input: { practicePackId: packId },
		}),
	);

	if (questions.isLoading) {
		return (
			<p className="text-muted-foreground text-sm">Loading questions...</p>
		);
	}

	if (questions.isError) {
		return (
			<p className="text-red-500 text-sm">Error: {questions.error.message}</p>
		);
	}

	if (questions.data?.length === 0 || !questions.data) {
		return "not found";
	}

	return (
		<div className="space-y-3">
			<p className="font-medium text-sm">
				Questions ({questions.data.length}):
			</p>
			{questions.data.map((pq) => (
				<Card key={pq.order} className="p-3">
					<div className="space-y-2">
						<div className="flex items-start justify-between gap-2">
							<div className="flex-1">
								<p className="font-medium text-sm">{pq.content}</p>
							</div>
							<span className="rounded bg-muted px-2 py-1 text-xs">
								{pq.type === "mcq" ? "MCQ" : "Essay"}
							</span>
						</div>
						{pq.type === "mcq" &&
							pq.multipleChoiceAnswers && (
								<div className="space-y-1 pl-4">
									{pq.multipleChoiceAnswers.map((ans) => (
										<div
											key={ans.id}
											className="flex items-center gap-2 text-sm"
										>
											<span
												className={
													ans.isCorrect
														? "font-medium text-green-600"
														: "text-muted-foreground"
												}
											>
												{ans.isCorrect ? "✓" : "○"}
											</span>
											<span>{ans.content}</span>
										</div>
									))}
								</div>
							)}
						{pq.type === "essay" && pq.essayAnswer && (
							<div className="pl-4">
								<p className="text-muted-foreground text-sm">
									Correct:{" "}
									<span className="font-medium text-green-600">
										{pq.essayAnswer.correctAnswer}
									</span>
								</p>
							</div>
						)}
					</div>
				</Card>
			))}
		</div>
	);
}

function RouteComponent() {
	const [expandedPacks, setExpandedPacks] = useState<Record<number, boolean>>(
		{},
	);

	const packs = useQuery(orpc.practicePack.list.queryOptions());

	const togglePackCollapse = (packId: number) => {
		setExpandedPacks((prev) => ({ ...prev, [packId]: !prev[packId] }));
	};

	return (
		<div className="container mx-auto max-w-4xl px-4 py-2 pt-20">
			<h1 className="mb-6 font-bold text-2xl">Latihan Soal</h1>

			{/* Practice Packs */}
			<div className="space-y-4">
				<div className="flex justify-between">
					<h2 className="font-medium text-lg">Practice Packs</h2>
				</div>

				{packs.isLoading && <p>Loading...</p>}
				{packs.isError && (
					<p className="text-red-500">Error: {packs.error.message}</p>
				)}
				{packs.data && packs.data.length === 0 && (
					<p className="text-muted-foreground">No packs yet</p>
				)}

				{packs.data?.map((pack) => (
					<Card key={pack.id} className="p-4">
						<div className="flex items-center justify-between">
							<button
								type="button"
								className="flex-1 cursor-pointer text-left"
								onClick={() => togglePackCollapse(pack.id)}
							>
								<h3 className="font-medium text-lg">{pack.title}</h3>
								<p className="text-muted-foreground text-sm">
									ID: {pack.id} • Click to{" "}
									{expandedPacks[pack.id] ? "collapse" : "expand"}
								</p>
							</button>
						</div>
						{expandedPacks[pack.id] && (
							<div className="mt-4 border-t pt-4">
								<PackQuestions packId={pack.id} />
							</div>
						)}
					</Card>
				))}
			</div>
		</div>
	);
}
