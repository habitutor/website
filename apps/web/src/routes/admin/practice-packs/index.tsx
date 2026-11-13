import { MagnifyingGlass, Package, Plus } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useDebounceValue } from "@/hooks/timing/use-debounce-value";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { AdminPagination } from "@/components/admin/pagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/utils/orpc";
import { PracticePackCard } from "./-components/practice-pack-card";

export const Route = createFileRoute("/admin/practice-packs/")({
  component: PracticePacksListPage,
});

function PracticePacksListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const limit = 9;
  const offset = (page - 1) * limit;
  // Dicari di server (nama pack, deskripsi, dan isi soal) supaya mencakup semua halaman.
  const search = useDebounceValue(searchQuery.trim(), 300);

  const { data, isPending, isError, error } = useQuery(
    orpc.admin.practicePack.list.queryOptions({ input: { limit, offset, search: search || undefined } }),
  );

  const packs = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

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
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
      </div>

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
        {packs?.map((pack) => (
          <PracticePackCard key={pack.id} pack={pack} />
        ))}
      </div>

      {totalPages > 1 && (
        <AdminPagination
          className="mt-6"
          label="Pack"
          page={page}
          total={total}
          pageSize={limit}
          isLoading={isPending}
          onPageChange={setPage}
        />
      )}
    </AdminContainer>
  );
}
