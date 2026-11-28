import { MagnifyingGlass, Package, Plus } from "@phosphor-icons/react";
import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useDebounceValue } from "@/hooks/timing/use-debounce-value";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { LoadFailed, useFetchAll, useReturnToItem } from "@/components/admin/infinite-list";
import { AdminPagination } from "@/components/admin/pagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/utils/orpc";
import { PracticePackCard } from "./-components/practice-pack-card";
import { packSearchSchema } from "./-search-params";

export const Route = createFileRoute("/admin/practice-packs/")({
  component: PracticePacksListPage,
  validateSearch: packSearchSchema,
});

function PracticePacksListPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const searchParam = Route.useSearch({ select: (s) => s.search ?? "" });
  const [searchQuery, setSearchQuery] = useState(searchParam);
  // Dicari di server (nama pack, deskripsi, dan isi soal) supaya mencakup semua pack.
  const debouncedSearch = useDebounceValue(searchQuery.trim(), 300);
  const page = Route.useSearch({ select: (s) => s.page ?? 1 });
  const searching = searchParam !== "";
  const pageSize = 9;
  const batchSize = 50;

  useEffect(() => {
    navigate({
      search: (prev) => {
        const next = debouncedSearch || undefined;
        // Nomor halaman hanya direset kalau kata carinya berubah, bukan saat kembali dari detail.
        return prev.search === next ? prev : { search: next };
      },
      replace: true,
    });
  }, [debouncedSearch, navigate]);

  const paged = useQuery({
    ...orpc.admin.practicePack.list.queryOptions({ input: { limit: pageSize, offset: (page - 1) * pageSize } }),
    enabled: !searching,
    placeholderData: keepPreviousData,
  });
  const found = useInfiniteQuery(
    orpc.admin.practicePack.list.infiniteOptions({
      input: (offset: number) => ({ limit: batchSize, offset, search: searchParam }),
      initialPageParam: 0,
      getNextPageParam: (lastPage, pages) =>
        pages.length * batchSize < lastPage.total ? pages.length * batchSize : undefined,
      enabled: searching,
    }),
  );
  useFetchAll(found);

  const { data, isPending, isError, error } = searching ? found : paged;
  const rows = searching ? (found.data?.pages.flatMap((batch) => batch.data) ?? []) : (paged.data?.data ?? []);
  const packs = [...new Map(rows.map((pack) => [pack.id, pack])).values()];
  const total = (searching ? found.data?.pages.at(-1)?.total : paged.data?.total) ?? 0;
  const rememberItem = useReturnToItem(
    "admin-practice-packs-last",
    packs.length > 0 && (!searching || !found.hasNextPage),
  );

  return (
    <AdminContainer>
      <AdminHeader title="Practice Packs" description="Kelola dan atur kumpulan soal latihan">
        <Button asChild>
          <Link to="/admin/practice-packs/create">
            <Plus className="mr-2 size-4" />
            Buat Pack Baru
          </Link>
        </Button>
      </AdminHeader>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <MagnifyingGlass
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-sr-muted"
            aria-hidden="true"
          />
          <Input
            type="search"
            autoComplete="off"
            placeholder="Cari nama pack atau isi soal…"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {total > 0 && (
        <p className="mb-3 text-sm font-semibold text-sr-muted" aria-live="polite">
          {searching ? "Ditemukan" : "Total"} {total} pack
          {searching && found.hasNextPage && ` · memuat ${packs.length} dari ${total}…`}
        </p>
      )}

      {isPending && (
        <div className="grid gap-4 sm:grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
          {Array.from({ length: 9 }).map((_, index) => (
            // biome-ignore lint: skeleton items don't need stable keys
            <Card key={index} className="sr-card-hover rounded-sr-lg border-sr-line bg-sr-ivory/50 px-6 shadow-sr-1">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full" />
            </Card>
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-destructive">Error: {error.message}</p>
        </div>
      )}

      {data && packs.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-sr-xl border-2 border-dashed border-sr-blue-200 bg-sr-blue-50/40 p-12 text-center">
          <Package className="text-sr-blue-400 mb-4 size-12" />
          <h3 className="mb-2 text-lg font-black text-sr-ink">No practice packs found</h3>
          <p className="mb-4 text-sm text-sr-muted">
            {searchQuery ? "Try adjusting your search query" : "Get started by creating a new practice pack"}
          </p>
          {!searchQuery && (
            <Button asChild>
              <Link to="/admin/practice-packs/create">
                <Plus className="mr-2 size-4" />
                Buat Pack Pertama
              </Link>
            </Button>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
        {packs.map((pack) => (
          <div key={pack.id} data-list-item={pack.id} onClickCapture={() => rememberItem(pack.id)} className="grid">
            <PracticePackCard pack={pack} />
          </div>
        ))}
      </div>

      {searching && found.isError && <LoadFailed onRetry={() => found.fetchNextPage()} />}

      {!searching && total > 0 && (
        <AdminPagination
          className="mt-6"
          label="Pack"
          page={page}
          total={total}
          pageSize={pageSize}
          isLoading={isPending}
          onPageChange={(next) => navigate({ search: { page: next > 1 ? next : undefined } })}
        />
      )}
    </AdminContainer>
  );
}
