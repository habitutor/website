import { ArrowLeftIcon, BrainIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/utils/orpc";
import { EditPackDialog } from "./edit-pack-dialog";

type PackInfoHeaderProps = {
	packId: number;
	backTo?: string;
};

export function PackInfoHeader({ packId, backTo }: PackInfoHeaderProps) {
	const queryClient = useQueryClient();

	const { data: pack, isPending } = useQuery(
		orpc.admin.practicePack.get.queryOptions({
			input: { id: packId },
		}),
	);

	const toggleFlashcardMutation = useMutation(
		orpc.admin.practicePack.toggleAvailableForFlashcard.mutationOptions({
			onSuccess: (data) => {
				toast.success(data.message);
				queryClient.invalidateQueries(orpc.admin.practicePack.getQuestions.queryOptions({ input: { id: packId } }));
			},
			onError: (error) => {
				toast.error("Failed to update flashcard status", { description: String(error) });
			},
		}),
	);

	if (isPending) {
		return (
			<div className="space-y-2">
				<Skeleton className="h-8 w-1/3" />
				<Skeleton className="h-4 w-2/3" />
			</div>
		);
	}

	if (!pack) {
		return <p className="text-destructive">Practice pack not found</p>;
	}

	return (
		<>
			{backTo && (
				<Link
					to={backTo}
					className="mb-4 inline-flex items-center gap-1 rounded-md border bg-transparent px-3 py-2 font-medium text-sm hover:bg-accent hover:text-accent-foreground"
				>
					<ArrowLeftIcon size={20} weight="bold" />
					Kembali
				</Link>
			)}
			<div className="flex gap-4">
				<div className="min-w-0">
					<h1 className="font-bold text-2xl tracking-tight sm:text-3xl">{pack.title}</h1>
					<p className="mt-2 text-muted-foreground text-sm leading-relaxed sm:text-base">
						{pack.description || "No description provided."}
					</p>
				</div>
				<div className="flex shrink-0 gap-2">
					<EditPackDialog
						pack={pack}
						trigger={
							<Button variant="ghost" size="icon">
								<PencilSimpleIcon className="size-4" />
								<span className="sr-only">Edit</span>
							</Button>
						}
					/>
				</div>
			</div>
			<Item variant="outline">
				<ItemMedia variant="icon" className="text-pink-500">
					<BrainIcon className="size-5" />
				</ItemMedia>
				<ItemContent>
					<ItemTitle>Available for Brain Gym</ItemTitle>
					<ItemDescription>Enable or disable all questions in this pack for Brain Gym practice</ItemDescription>
				</ItemContent>
				<div className="flex shrink-0 gap-2">
					<Button
						variant="default"
						size="sm"
						onClick={() => {
							toggleFlashcardMutation.mutate({ id: packId, isFlashcardQuestion: true });
						}}
						disabled={toggleFlashcardMutation.isPending}
					>
						Enable
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							toggleFlashcardMutation.mutate({ id: packId, isFlashcardQuestion: false });
						}}
						disabled={toggleFlashcardMutation.isPending}
					>
						Disable
					</Button>
				</div>
			</Item>
		</>
	);
}
