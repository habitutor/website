import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface CursorPaginationProps {
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  isPending?: boolean;
}

export function CursorPagination({
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  isPending = false,
}: CursorPaginationProps) {
  return (
    <div className="mt-6 flex items-center justify-center gap-4 sm:mt-8">
      <Button
        variant="outline"
        size="sm"
        disabled={!hasPrevious || isPending}
        onClick={onPrevious}
        className="h-9 px-4"
      >
        <CaretLeftIcon className="mr-2 size-4" />
        Sebelumnya
      </Button>

      <Button variant="outline" size="sm" disabled={!hasNext || isPending} onClick={onNext} className="h-9 px-4">
        Berikutnya
        <CaretRightIcon className="ml-2 size-4" />
      </Button>
    </div>
  );
}
