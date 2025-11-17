import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/practice")({
	component: RouteComponent,
});

type Tab = "packs" | "mcq" | "essay";

function PackQuestions({
	packId,
	onRemove,
}: {
	packId: number;
	onRemove: (questionId: number) => void;
}) {
	const questions = useQuery(
		orpc.practice.getQuestionsInPack.queryOptions({
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

	if (!questions.data || questions.data.length === 0) {
		return (
			<p className="text-muted-foreground text-sm">
				No questions in this pack yet
			</p>
		);
	}

	return (
		<div className="space-y-3">
			<p className="font-medium text-sm">
				Questions ({questions.data.length}):
			</p>
			{questions.data.map((q: any) => (
				<Card key={q.id} className="p-3">
					<div className="space-y-2">
						<div className="flex items-start justify-between gap-2">
							<div className="flex-1">
								<p className="font-medium text-sm">{q.content}</p>
							</div>
							<div className="flex items-center gap-2">
								<span className="rounded bg-muted px-2 py-1 text-xs">
									{q.type === "mcq" ? "MCQ" : "Essay"}
								</span>
								<Button
									variant="ghost"
									size="sm"
									className="h-6 px-2"
									onClick={() => {
										if (confirm(`Remove "${q.content}" from this pack?`)) {
											onRemove(q.id);
										}
									}}
								>
									✕
								</Button>
							</div>
						</div>
						{q.type === "mcq" && q.answers && (
							<div className="space-y-1 pl-4">
								{q.answers.map((ans: any) => (
									<div key={ans.id} className="flex items-center gap-2 text-sm">
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
						{q.type === "essay" && q.answer && (
							<div className="pl-4">
								<p className="text-muted-foreground text-sm">
									Correct:{" "}
									<span className="font-medium text-green-600">
										{q.answer.correctAnswer}
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
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState<Tab>("packs");
	const [showCreatePackModal, setShowCreatePackModal] = useState(false);
	const [showCreateMCQModal, setShowCreateMCQModal] = useState(false);
	const [showCreateEssayModal, setShowCreateEssayModal] = useState(false);
	const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
	const [selectedPackId, setSelectedPackId] = useState<number | null>(null);
	const [expandedPacks, setExpandedPacks] = useState<Record<number, boolean>>(
		{},
	);

	const [title, setTitle] = useState("");
	const [mcqContent, setMcqContent] = useState("");
	const [mcqAnswers, setMcqAnswers] = useState([
		{ id: crypto.randomUUID(), content: "", isCorrect: false },
		{ id: crypto.randomUUID(), content: "", isCorrect: false },
	]);
	const [essayContent, setEssayContent] = useState("");
	const [correctAnswer, setCorrectAnswer] = useState("");
	const [questionId, setQuestionId] = useState("");

	const packs = useQuery(orpc.practice.getPracticePacks.queryOptions());
	const mcqQuestions = useQuery(
		orpc.practice.getAllMCQQuestions.queryOptions(),
	);
	const essayQuestions = useQuery(
		orpc.practice.getAllEssayQuestions.queryOptions(),
	);

	const createPack = useMutation(
		orpc.practice.createPracticePack.mutationOptions({
			onSuccess: () => {
				toast.success("Pack created!");
				setTitle("");
				setShowCreatePackModal(false);
				packs.refetch();
			},
			onError: (error) => {
				toast.error(`Failed: ${error.message}`);
			},
		}),
	);

	const createMCQ = useMutation(
		orpc.practice.createMCQQuestion.mutationOptions({
			onSuccess: (data) => {
				toast.success(`MCQ created! ID: ${data.id}`);
				setMcqContent("");
				setMcqAnswers([
					{ id: crypto.randomUUID(), content: "", isCorrect: false },
					{ id: crypto.randomUUID(), content: "", isCorrect: false },
				]);
				setShowCreateMCQModal(false);
				mcqQuestions.refetch();
			},
			onError: (error) => {
				toast.error(`Failed: ${error.message}`);
			},
		}),
	);

	const createEssay = useMutation(
		orpc.practice.createEssayQuestion.mutationOptions({
			onSuccess: (data) => {
				toast.success(`Essay created! ID: ${data.id}`);
				setEssayContent("");
				setCorrectAnswer("");
				setShowCreateEssayModal(false);
				essayQuestions.refetch();
			},
			onError: (error) => {
				toast.error(`Failed: ${error.message}`);
			},
		}),
	);

	const addQuestion = useMutation(
		orpc.practice.addQuestionToPack.mutationOptions({
			onSuccess: () => {
				toast.success("Question added!");
				setQuestionId("");
				setShowAddQuestionModal(false);
				// Invalidate questions query to refetch updated data
				queryClient.invalidateQueries({
					predicate: (query) =>
						query.queryKey[0] === "practice.getQuestionsInPack",
				});
			},
			onError: (error) => {
				toast.error(`Failed: ${error.message}`);
			},
		}),
	);

	const deletePack = useMutation(
		orpc.practice.deletePracticePack.mutationOptions({
			onSuccess: () => {
				toast.success("Pack deleted!");
				packs.refetch();
			},
			onError: (error) => {
				toast.error(`Failed: ${error.message}`);
			},
		}),
	);

	const deleteQuestion = useMutation(
		orpc.practice.deleteQuestion.mutationOptions({
			onSuccess: () => {
				toast.success("Question deleted!");
				mcqQuestions.refetch();
				essayQuestions.refetch();
			},
			onError: (error) => {
				toast.error(`Failed: ${error.message}`);
			},
		}),
	);

	const removeQuestionFromPack = useMutation(
		orpc.practice.removeQuestionFromPack.mutationOptions({
			onSuccess: () => {
				toast.success("Question removed from pack!");
				queryClient.invalidateQueries({
					predicate: (query) =>
						query.queryKey[0] === "practice.getQuestionsInPack",
				});
			},
			onError: (error) => {
				toast.error(`Failed: ${error.message}`);
			},
		}),
	);

	const handleCreatePack = (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) {
			toast.error("Title required");
			return;
		}
		createPack.mutate({ title });
	};

	const handleCreateMCQ = (e: React.FormEvent) => {
		e.preventDefault();
		const validAnswers = mcqAnswers.filter((a) => a.content.trim());
		if (
			!mcqContent.trim() ||
			validAnswers.length < 2 ||
			!validAnswers.some((a) => a.isCorrect)
		) {
			toast.error("Invalid input");
			return;
		}
		createMCQ.mutate({ content: mcqContent, answers: validAnswers });
	};

	const handleCreateEssay = (e: React.FormEvent) => {
		e.preventDefault();
		if (!essayContent.trim() || !correctAnswer.trim()) {
			toast.error("Both fields required");
			return;
		}
		createEssay.mutate({ content: essayContent, correctAnswer });
	};

	const handleAddQuestion = (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedPackId || !questionId) {
			toast.error("Pack and Question ID required");
			return;
		}
		addQuestion.mutate({
			practicePackId: selectedPackId,
			questionId: Number(questionId),
		});
	};

	const updateMCQAnswer = (
		answerId: string,
		field: "content" | "isCorrect",
		value: string | boolean,
	) => {
		setMcqAnswers(
			mcqAnswers.map((ans) =>
				ans.id === answerId ? { ...ans, [field]: value } : ans,
			),
		);
	};

	const addMCQAnswer = () => {
		setMcqAnswers([
			...mcqAnswers,
			{ id: crypto.randomUUID(), content: "", isCorrect: false },
		]);
	};

	const removeMCQAnswer = (answerId: string) => {
		if (mcqAnswers.length > 2) {
			setMcqAnswers(mcqAnswers.filter((ans) => ans.id !== answerId));
		}
	};

	const togglePackCollapse = (packId: number) => {
		setExpandedPacks((prev) => ({ ...prev, [packId]: !prev[packId] }));
	};

	return (
		<div className="container mx-auto max-w-4xl px-4 py-2 pt-20">
			<h1 className="mb-6 font-bold text-2xl">Latihan Soal</h1>

			{/* Tabs Navigation */}
			<div className="mb-6 flex gap-2 border-b">
				<button
					type="button"
					onClick={() => setActiveTab("packs")}
					className={`px-4 py-2 font-medium transition-colors ${
						activeTab === "packs"
							? "border-primary border-b-2 text-primary"
							: "text-muted-foreground hover:text-foreground"
					}`}
				>
					Practice Packs
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("mcq")}
					className={`px-4 py-2 font-medium transition-colors ${
						activeTab === "mcq"
							? "border-primary border-b-2 text-primary"
							: "text-muted-foreground hover:text-foreground"
					}`}
				>
					MCQ Questions
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("essay")}
					className={`px-4 py-2 font-medium transition-colors ${
						activeTab === "essay"
							? "border-primary border-b-2 text-primary"
							: "text-muted-foreground hover:text-foreground"
					}`}
				>
					Essay Questions
				</button>
			</div>

			{/* Tab Content: Practice Packs */}
			{activeTab === "packs" && (
				<div className="space-y-4">
					<div className="flex justify-between">
						<h2 className="font-medium text-lg">Practice Packs</h2>
						<Button onClick={() => setShowCreatePackModal(true)}>
							+ Create Pack
						</Button>
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
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											setSelectedPackId(pack.id);
											setShowAddQuestionModal(true);
										}}
									>
										+ Add Question
									</Button>
									<Button
										variant="destructive"
										size="sm"
										onClick={() => {
											if (
												confirm(
													`Delete pack "${pack.title}"? This will remove all question associations.`,
												)
											) {
												deletePack.mutate({ id: pack.id });
											}
										}}
									>
										🗑️
									</Button>
								</div>
							</div>
							{expandedPacks[pack.id] && (
								<div className="mt-4 border-t pt-4">
									<PackQuestions
										packId={pack.id}
										onRemove={(questionId) => {
											removeQuestionFromPack.mutate({
												practicePackId: pack.id,
												questionId: questionId,
											});
										}}
									/>
								</div>
							)}
						</Card>
					))}
				</div>
			)}

			{/* Tab Content: MCQ Questions */}
			{activeTab === "mcq" && (
				<div className="space-y-4">
					<div className="flex justify-between">
						<h2 className="font-medium text-lg">MCQ Questions</h2>
						<Button onClick={() => setShowCreateMCQModal(true)}>
							+ Create MCQ
						</Button>
					</div>

					{mcqQuestions.isLoading && <p>Loading...</p>}
					{mcqQuestions.isError && (
						<p className="text-red-500">Error: {mcqQuestions.error.message}</p>
					)}
					{mcqQuestions.data && mcqQuestions.data.length === 0 && (
						<p className="text-muted-foreground">No MCQ questions yet</p>
					)}

					{mcqQuestions.data?.map((q) => (
						<Card key={q.id} className="p-4">
							<div className="space-y-3">
								<div className="flex items-start justify-between gap-2">
									<div className="flex-1">
										<p className="font-medium">{q.content}</p>
										<p className="text-muted-foreground text-sm">ID: {q.id}</p>
									</div>
									<div className="flex items-start gap-2">
										<span className="rounded bg-blue-100 px-2 py-1 text-blue-700 text-xs">
											MCQ
										</span>
										<Button
											variant="destructive"
											size="sm"
											onClick={() => {
												if (
													confirm(
														`Delete question "${q.content}"? This will fail if question is used in any pack.`,
													)
												) {
													deleteQuestion.mutate({ id: q.id });
												}
											}}
										>
											🗑️
										</Button>
									</div>
								</div>
								{q.answers && q.answers.length > 0 && (
									<div className="space-y-2 border-l-2 pl-4">
										{q.answers.map((ans) => (
											<div key={ans.id} className="flex items-center gap-2">
												<span
													className={
														ans.isCorrect
															? "font-bold text-green-600 text-lg"
															: "text-muted-foreground"
													}
												>
													{ans.isCorrect ? "✓" : "○"}
												</span>
												<span className={ans.isCorrect ? "font-medium" : ""}>
													{ans.content}
												</span>
											</div>
										))}
									</div>
								)}
							</div>
						</Card>
					))}
				</div>
			)}

			{/* Tab Content: Essay Questions */}
			{activeTab === "essay" && (
				<div className="space-y-4">
					<div className="flex justify-between">
						<h2 className="font-medium text-lg">Essay Questions</h2>
						<Button onClick={() => setShowCreateEssayModal(true)}>
							+ Create Essay
						</Button>
					</div>

					{essayQuestions.isLoading && <p>Loading...</p>}
					{essayQuestions.isError && (
						<p className="text-red-500">
							Error: {essayQuestions.error.message}
						</p>
					)}
					{essayQuestions.data && essayQuestions.data.length === 0 && (
						<p className="text-muted-foreground">No essay questions yet</p>
					)}

					{essayQuestions.data?.map((q) => (
						<Card key={q.id} className="p-4">
							<div className="space-y-3">
								<div className="flex items-start justify-between gap-2">
									<div className="flex-1">
										<p className="font-medium">{q.content}</p>
										<p className="text-muted-foreground text-sm">ID: {q.id}</p>
									</div>
									<div className="flex items-start gap-2">
										<span className="rounded bg-green-100 px-2 py-1 text-green-700 text-xs">
											Essay
										</span>
										<Button
											variant="destructive"
											size="sm"
											onClick={() => {
												if (
													confirm(
														`Delete question "${q.content}"? This will fail if question is used in any pack.`,
													)
												) {
													deleteQuestion.mutate({ id: q.id });
												}
											}}
										>
											🗑️
										</Button>
									</div>
								</div>
								{q.answer && (
									<div className="border-green-200 border-l-2 pl-4">
										<p className="text-muted-foreground text-sm">
											Correct Answer:
										</p>
										<p className="font-medium text-green-700">
											{q.answer.correctAnswer}
										</p>
									</div>
								)}
							</div>
						</Card>
					))}
				</div>
			)}

			{/* Modal: Create Pack */}
			{showCreatePackModal && (
				<div
					role="button"
					tabIndex={0}
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
					onClick={() => setShowCreatePackModal(false)}
					onKeyDown={(e) => {
						if (e.key === "Escape" || e.key === "Enter") {
							setShowCreatePackModal(false);
						}
					}}
				>
					<Card
						className="w-full max-w-md p-6"
						onClick={(e) => e.stopPropagation()}
					>
						<h3 className="mb-4 font-medium text-lg">Create Practice Pack</h3>
						<form onSubmit={handleCreatePack} className="space-y-4">
							<div>
								<Label htmlFor="pack-title">Title</Label>
								<Input
									id="pack-title"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									placeholder="Enter pack title"
								/>
							</div>
							<div className="flex gap-2">
								<Button type="submit" disabled={createPack.isPending}>
									{createPack.isPending ? "Creating..." : "Create"}
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={() => setShowCreatePackModal(false)}
								>
									Cancel
								</Button>
							</div>
						</form>
					</Card>
				</div>
			)}

			{/* Modal: Create MCQ */}
			{showCreateMCQModal && (
				<div
					role="button"
					tabIndex={0}
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
					onClick={() => setShowCreateMCQModal(false)}
					onKeyDown={(e) => {
						if (e.key === "Escape" || e.key === "Enter") {
							setShowCreateMCQModal(false);
						}
					}}
				>
					<Card
						className="w-full max-w-md p-6"
						onClick={(e) => e.stopPropagation()}
					>
						<h3 className="mb-4 font-medium text-lg">Create MCQ Question</h3>
						<form onSubmit={handleCreateMCQ} className="space-y-4">
							<div>
								<Label htmlFor="mcq-question">Question</Label>
								<Input
									id="mcq-question"
									value={mcqContent}
									onChange={(e) => setMcqContent(e.target.value)}
									placeholder="Enter question"
								/>
							</div>
							<div className="space-y-2">
								<Label>Answers</Label>
								{mcqAnswers.map((answer, index) => (
									<div key={answer.id} className="flex gap-2">
										<Input
											value={answer.content}
											onChange={(e) =>
												updateMCQAnswer(answer.id, "content", e.target.value)
											}
											placeholder={`Answer ${index + 1}`}
										/>
										<label className="flex items-center gap-1 whitespace-nowrap">
											<input
												type="checkbox"
												checked={answer.isCorrect}
												onChange={(e) =>
													updateMCQAnswer(
														answer.id,
														"isCorrect",
														e.target.checked,
													)
												}
											/>
											Correct
										</label>
										{mcqAnswers.length > 2 && (
											<Button
												type="button"
												variant="destructive"
												size="sm"
												onClick={() => removeMCQAnswer(answer.id)}
											>
												X
											</Button>
										)}
									</div>
								))}
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={addMCQAnswer}
								>
									+ Add Answer
								</Button>
							</div>
							<div className="flex gap-2">
								<Button type="submit" disabled={createMCQ.isPending}>
									{createMCQ.isPending ? "Creating..." : "Create"}
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={() => setShowCreateMCQModal(false)}
								>
									Cancel
								</Button>
							</div>
						</form>
					</Card>
				</div>
			)}

			{/* Modal: Create Essay */}
			{showCreateEssayModal && (
				<div
					role="button"
					tabIndex={0}
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
					onClick={() => setShowCreateEssayModal(false)}
					onKeyDown={(e) => {
						if (e.key === "Escape" || e.key === "Enter") {
							setShowCreateEssayModal(false);
						}
					}}
				>
					<Card
						className="w-full max-w-md p-6"
						onClick={(e) => e.stopPropagation()}
					>
						<h3 className="mb-4 font-medium text-lg">Create Essay Question</h3>
						<form onSubmit={handleCreateEssay} className="space-y-4">
							<div>
								<Label htmlFor="essay-question">Question</Label>
								<Input
									id="essay-question"
									value={essayContent}
									onChange={(e) => setEssayContent(e.target.value)}
									placeholder="Enter question"
								/>
							</div>
							<div>
								<Label htmlFor="essay-answer">Correct Answer</Label>
								<Input
									id="essay-answer"
									value={correctAnswer}
									onChange={(e) => setCorrectAnswer(e.target.value)}
									placeholder="Enter correct answer"
								/>
							</div>
							<div className="flex gap-2">
								<Button type="submit" disabled={createEssay.isPending}>
									{createEssay.isPending ? "Creating..." : "Create"}
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={() => setShowCreateEssayModal(false)}
								>
									Cancel
								</Button>
							</div>
						</form>
					</Card>
				</div>
			)}

			{/* Modal: Add Question to Pack */}
			{showAddQuestionModal && (
				<div
					role="button"
					tabIndex={0}
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
					onClick={() => setShowAddQuestionModal(false)}
					onKeyDown={(e) => {
						if (e.key === "Escape" || e.key === "Enter") {
							setShowAddQuestionModal(false);
						}
					}}
				>
					<Card
						className="w-full max-w-md p-6"
						onClick={(e) => e.stopPropagation()}
					>
						<h3 className="mb-4 font-medium text-lg">
							Add Question to Pack (ID: {selectedPackId})
						</h3>
						<form onSubmit={handleAddQuestion} className="space-y-4">
							<div>
								<Label htmlFor="question-id">Question ID</Label>
								<Input
									id="question-id"
									type="number"
									value={questionId}
									onChange={(e) => setQuestionId(e.target.value)}
									placeholder="Enter question ID"
								/>
							</div>
							<div className="flex gap-2">
								<Button type="submit" disabled={addQuestion.isPending}>
									{addQuestion.isPending ? "Adding..." : "Add"}
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={() => setShowAddQuestionModal(false)}
								>
									Cancel
								</Button>
							</div>
						</form>
					</Card>
				</div>
			)}
		</div>
	);
}
