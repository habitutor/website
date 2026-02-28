import { CardsIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/utils/orpc";
import { EditPackDialog } from "./edit-pack-dialog";

type PackInfoHeaderProps = {
	packId: number;
};

export function PackInfoHeader({ packId }: PackInfoHeaderProps) {
	const queryClient = useQueryClient();

	const { data: pack, isLoading } = useQuery(
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

	if (isLoading) {
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
		<div className="flex justify-between gap-4">
			<div className="min-w-0 flex-1">
				<h1 className="font-bold text-2xl tracking-tight sm:text-3xl">{pack.title}</h1>
				<p className="mt-2 text-muted-foreground text-sm leading-relaxed sm:text-base">
					{pack.description || "No description provided."}
				</p>
			</div>
			<div className="flex shrink-0 gap-2">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" size="icon" title="Toggle Flashcard Availability">
							<CardsIcon className="size-4" />
							<span className="sr-only">Toggle Flashcard</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem
							onClick={() => {
								toggleFlashcardMutation.mutate({ id: packId, isFlashcardQuestion: true });
							}}
							disabled={toggleFlashcardMutation.isPending}
						>
							<CardsIcon className="text-green-400" />
							Enable for Flashcard
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => {
								toggleFlashcardMutation.mutate({ id: packId, isFlashcardQuestion: false });
							}}
							disabled={toggleFlashcardMutation.isPending}
						>
							<CardsIcon className="text-red-400" />
							Disable for Flashcard
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
				<EditPackDialog
					pack={pack}
					trigger={
						<Button variant="outline" size="icon">
							<PencilSimpleIcon className="size-4" />
							<span className="sr-only">Edit</span>
						</Button>
					}
				/>
			</div>
		</div>
	);
}
