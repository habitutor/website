import { PlusIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
	onCreateNew: () => void;
};

export function EmptyState({ onCreateNew }: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center space-y-6 rounded-xl border border-dashed py-16 text-center">
			<img src="/avatar/confused-avatar.webp" alt="No questions" className="h-32 w-auto sm:h-40" />
			<div className="space-y-2">
				<h3 className="font-bold text-foreground text-xl">This pack is empty</h3>
				<p className="text-muted-foreground">Add questions to get started.</p>
			</div>
			<Button onClick={onCreateNew} size="lg" className="gap-2">
				<PlusIcon className="size-4" />
				Create First Question
			</Button>
		</div>
	);
}
