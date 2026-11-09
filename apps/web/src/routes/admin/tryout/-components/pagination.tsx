import { Button } from "@/components/ui/button";

export const TRYOUT_PAGE_SIZE = 20;

export function getTryoutPagination(page: number, total: number, limit = TRYOUT_PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.max(1, Math.min(page, totalPages));
  return {
    currentPage,
    totalPages,
    start: total === 0 ? 0 : (currentPage - 1) * limit + 1,
    end: Math.min(currentPage * limit, total),
  };
}

export function TryoutPagination({
  page,
  total,
  isLoading,
  onPageChange,
}: {
  page: number;
  total: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}) {
  const { currentPage, totalPages, start, end } = getTryoutPagination(page, total);

  return (
    <nav
      aria-label="Pagination Try Out"
      className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Menampilkan {start}–{end} dari {total} Try Out
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" disabled={isLoading || currentPage === 1} onClick={() => onPageChange(1)}>
          Awal
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading || currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Sebelumnya
        </Button>
        <span className="text-sm" aria-live="polite">
          Halaman {currentPage} dari {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading || currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Berikutnya
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading || currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
        >
          Akhir
        </Button>
      </div>
    </nav>
  );
}
