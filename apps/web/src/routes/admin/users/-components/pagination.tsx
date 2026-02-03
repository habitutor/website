import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface CursorPaginationProps {
	hasPrevious: boolean;
	hasNext: boolean;
	onPrevious: () => void;
	onNext: () => void;
	isLoading?: boolean;
}

export function CursorPagination({
	hasPrevious,
	hasNext,
	onPrevious,
	onNext,
	isLoading = false,
}: CursorPaginationProps) {
	return (
		<div className="mt-6 flex items-center justify-center gap-4 sm:mt-8">
			<Button
				variant="outline"
				size="sm"
				disabled={!hasPrevious || isLoading}
				onClick={onPrevious}
				className="h-9 px-4"
			>
				<CaretLeft className="mr-2 size-4" />
				Previous
			</Button>

			<Button variant="outline" size="sm" disabled={!hasNext || isLoading} onClick={onNext} className="h-9 px-4">
				Next
				<CaretRight className="ml-2 size-4" />
			</Button>
		</div>
	);
}
