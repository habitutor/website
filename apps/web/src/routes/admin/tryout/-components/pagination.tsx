import { AdminPagination, getPagination } from "@/components/admin/pagination";

export const TRYOUT_PAGE_SIZE = 20;

export function getTryoutPagination(page: number, total: number, limit = TRYOUT_PAGE_SIZE) {
  return getPagination(page, total, limit);
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
  return (
    <AdminPagination
      label="Try Out"
      page={page}
      total={total}
      pageSize={TRYOUT_PAGE_SIZE}
      isLoading={isLoading}
      onPageChange={onPageChange}
      className="rounded-none border-0 border-t bg-transparent shadow-none"
    />
  );
}
