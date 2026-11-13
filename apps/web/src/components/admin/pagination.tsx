import { CaretDoubleLeft, CaretDoubleRight, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function getPagination(page: number, total: number, limit: number) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.max(1, Math.min(page, totalPages));
  return {
    currentPage,
    totalPages,
    start: total === 0 ? 0 : (currentPage - 1) * limit + 1,
    end: Math.min(currentPage * limit, total),
  };
}

const NAV_BUTTON = "h-8 w-8 p-0 sm:h-9 sm:w-9";

/** Pagination berangka untuk daftar yang punya total (halaman 1..N). */
export function AdminPagination({
  page,
  total,
  pageSize,
  label,
  isLoading = false,
  onPageChange,
  className,
}: {
  page: number;
  total: number;
  pageSize: number;
  label: string;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  const { currentPage, totalPages, start, end } = getPagination(page, total, pageSize);
  const go = (next: number) => {
    if (!isLoading && next !== currentPage) onPageChange(next);
  };
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (pageNumber) => pageNumber === 1 || pageNumber === totalPages || Math.abs(pageNumber - currentPage) <= 1,
  );

  return (
    <nav
      aria-label={`Pagination ${label}`}
      className={cn(
        "flex flex-col gap-3 rounded-sr-lg border border-sr-line bg-white/80 p-3 shadow-sr-1 sm:flex-row sm:items-center sm:justify-between sm:px-4",
        className,
      )}
    >
      <p className="text-center text-xs text-sr-muted sm:text-left sm:text-sm" aria-live="polite">
        Menampilkan {start}–{end} dari {total} {label}
        <span className="hidden sm:inline">
          {" "}
          · Halaman {currentPage} dari {totalPages}
        </span>
      </p>
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          aria-label="Halaman pertama"
          disabled={isLoading || currentPage === 1}
          onClick={() => go(1)}
          className={NAV_BUTTON}
        >
          <CaretDoubleLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          aria-label="Halaman sebelumnya"
          disabled={isLoading || currentPage === 1}
          onClick={() => go(currentPage - 1)}
          className={NAV_BUTTON}
        >
          <CaretLeft className="size-4" />
        </Button>
        {pages.map((pageNumber, index) => (
          <span key={pageNumber} className="contents">
            {index > 0 && pages[index - 1] !== pageNumber - 1 && <span className="px-1 text-xs text-sr-muted">…</span>}
            <Button
              variant={pageNumber === currentPage ? "default" : "outline"}
              size="sm"
              aria-label={`Halaman ${pageNumber}`}
              aria-current={pageNumber === currentPage ? "page" : undefined}
              onClick={() => go(pageNumber)}
              className={cn(NAV_BUTTON, "text-xs sm:text-sm")}
            >
              {pageNumber}
            </Button>
          </span>
        ))}
        <Button
          variant="outline"
          size="sm"
          aria-label="Halaman berikutnya"
          disabled={isLoading || currentPage === totalPages}
          onClick={() => go(currentPage + 1)}
          className={NAV_BUTTON}
        >
          <CaretRight className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          aria-label="Halaman terakhir"
          disabled={isLoading || currentPage === totalPages}
          onClick={() => go(totalPages)}
          className={NAV_BUTTON}
        >
          <CaretDoubleRight className="size-4" />
        </Button>
      </div>
    </nav>
  );
}

/**
 * Pagination untuk daftar berbasis cursor (total tidak diketahui). Tampilannya sama dengan AdminPagination:
 * tombol ikon, nomor halaman aktif, dan keterangan jumlah data di halaman ini.
 */
export function AdminCursorPagination({
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  isLoading = false,
  page,
  shown,
  label = "data",
  className,
}: {
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  isLoading?: boolean;
  page?: number;
  shown?: number;
  label?: string;
  className?: string;
}) {
  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "flex flex-col gap-3 rounded-sr-lg border border-sr-line bg-white/80 p-3 shadow-sr-1 sm:flex-row sm:items-center sm:justify-between sm:px-4",
        className,
      )}
    >
      <p className="text-center text-xs text-sr-muted sm:text-left sm:text-sm" aria-live="polite">
        {shown !== undefined ? `Menampilkan ${shown} ${label}` : "Gunakan tombol untuk berpindah halaman"}
        {page !== undefined && <span className="hidden sm:inline"> · Halaman {page}</span>}
      </p>
      <div className="flex items-center justify-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          aria-label="Halaman sebelumnya"
          disabled={!hasPrevious || isLoading}
          onClick={onPrevious}
          className={NAV_BUTTON}
        >
          <CaretLeft className="size-4" />
        </Button>
        {page !== undefined && (
          <Button
            size="sm"
            aria-label={`Halaman ${page}`}
            aria-current="page"
            className={cn(NAV_BUTTON, "text-xs sm:text-sm")}
          >
            {page}
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          aria-label="Halaman berikutnya"
          disabled={!hasNext || isLoading}
          onClick={onNext}
          className={NAV_BUTTON}
        >
          <CaretRight className="size-4" />
        </Button>
      </div>
    </nav>
  );
}
