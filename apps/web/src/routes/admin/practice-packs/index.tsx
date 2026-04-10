import { MagnifyingGlass, Package, Plus } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/utils/orpc";
import { PracticePackCard } from "./-components/practice-pack-card";

export const Route = createFileRoute("/admin/practice-packs/")({
  staticData: { breadcrumb: "Practice Packs" },
  component: PracticePacksListPage,
});

function PracticePacksListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const limit = 9;
  const offset = (page - 1) * limit;

  const { data, isPending, isError, error } = useQuery(
    orpc.admin.practicePack.list.queryOptions({ input: { limit, offset } }),
  );

  const packs = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);
  const filteredPacks = packs.filter((pack) => pack.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <AdminContainer>
      <AdminHeader title="Practice Packs" description="Manage and organize your question collections">
        <Button asChild>
          <Link to="/admin/practice-packs/create">
            <Plus className="mr-2 size-4" />
            Create New Pack
          </Link>
        </Button>
      </AdminHeader>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <MagnifyingGlass
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            autoComplete="off"
            placeholder="Search practice packs…"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isPending && (
        <div className="grid gap-4 sm:grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
          {Array.from({ length: 9 }).map((_, index) => (
            // biome-ignore lint: skeleton items don't need stable keys
            <Card key={index} className="px-6">
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

      {data && filteredPacks.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
          <Package className="mb-4 size-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No practice packs found</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {searchQuery ? "Try adjusting your search query" : "Get started by creating a new practice pack"}
          </p>
          {!searchQuery && (
            <Button asChild>
              <Link to="/admin/practice-packs/create">
                <Plus className="mr-2 size-4" />
                Create First Pack
              </Link>
            </Button>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
        {filteredPacks?.map((pack) => (
          <PracticePackCard key={pack.id} pack={pack} />
        ))}
      </div>

      {totalPages > 1 && !searchQuery && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5 sm:mt-8 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
          >
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </Button>

          <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1">
            {page > 3 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(1)}
                  className="h-8 w-8 p-0 text-xs sm:h-9 sm:w-9 sm:text-sm"
                >
                  1
                </Button>
                {page > 4 && <span className="hidden px-1 text-xs sm:inline sm:px-2">...</span>}
              </>
            )}

            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .filter((pageNum) => {
                return (
                  pageNum === page ||
                  pageNum === page - 1 ||
                  pageNum === page + 1 ||
                  pageNum === page - 2 ||
                  pageNum === page + 2
                );
              })
              .map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                  className="h-8 w-8 p-0 text-xs sm:h-9 sm:w-9 sm:text-sm"
                >
                  {pageNum}
                </Button>
              ))}

            {page < totalPages - 2 && (
              <>
                {page < totalPages - 3 && <span className="hidden px-1 text-xs sm:inline sm:px-2">...</span>}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(totalPages)}
                  className="h-8 w-8 p-0 text-xs sm:h-9 sm:w-9 sm:text-sm"
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
          >
            <span className="hidden sm:inline">Next</span>
            <span className="sm:hidden">Next</span>
          </Button>
        </div>
      )}
    </AdminContainer>
  );
}
