import { MagnifyingGlass, Package, Plus } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type } from "arktype";
import { useEffect, useRef, useState } from "react";
import { AdminTable, AdminTablePagination, AdminTableToolbar } from "@/components/admin/admin-table";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDebounceValue } from "@/hooks/timing/use-debounce-value";
import { orpc } from "@/utils/orpc";
import { PracticePackRow } from "./-components/practice-pack-row";

const practicePacksSearchSchema = type({
  "search?": "string",
  "after?": "string",
  "before?": "string",
});

export const Route = createFileRoute("/admin/practice-packs/")({
  staticData: { breadcrumb: "Practice Packs" },
  component: PracticePacksListPage,
  validateSearch: practicePacksSearchSchema,
});

function PracticePacksListPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const after = Route.useSearch({ select: (s) => s.after ?? undefined });
  const before = Route.useSearch({ select: (s) => s.before ?? undefined });
  const searchParam = Route.useSearch({ select: (s) => s.search ?? "" });

  const [searchQuery, setSearchQuery] = useState(searchParam);
  const debouncedSearch = useDebounceValue(searchQuery, 500);
  const isFirstRender = useRef(true);
  const limit = 10;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    navigate({
      search: (prev) => ({
        ...prev,
        search: debouncedSearch || undefined,
        after: undefined,
        before: undefined,
      }),
      replace: true,
    });
  }, [debouncedSearch, navigate]);

  const handleNext = (nextCursor: string) => {
    navigate({
      search: (prev) => ({ ...prev, after: nextCursor, before: undefined }),
    });
  };

  const handlePrevious = (prevCursor: string) => {
    navigate({
      search: (prev) => ({ ...prev, before: prevCursor, after: undefined }),
    });
  };

  const { data, isPending } = useQuery(
    orpc.admin.practicePack.list.queryOptions({
      input: {
        limit,
        after,
        before,
        search: searchParam,
      },
    }),
  );

  const packs = data?.data || [];
  const hasMore = data?.hasMore || false;
  const hasPrevious = data?.hasPrevious || false;
  const nextCursor = data?.nextCursor || null;
  const prevCursor = data?.prevCursor || null;

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

      <AdminTableToolbar>
        <div className="relative flex-1">
          <MagnifyingGlass className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            autoComplete="off"
            placeholder="Search practice packs…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </AdminTableToolbar>

      <AdminTable
        isEmpty={packs.length === 0}
        isPending={isPending}
        emptyState={{
          icon: Package,
          title: "No practice packs found",
          description: searchQuery ? "Try adjusting your search query" : "Get started by creating a new practice pack",
        }}
        skeletonCellWidths={["w-48", "w-full", "w-12"]}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packs.map((pack) => (
              <PracticePackRow key={pack.id} pack={pack} />
            ))}
          </TableBody>
        </Table>
      </AdminTable>

      <AdminTablePagination
        hasPrevious={hasPrevious}
        hasNext={hasMore}
        onPrevious={() => prevCursor && handlePrevious(prevCursor)}
        onNext={() => nextCursor && handleNext(nextCursor)}
        isPending={isPending}
      />
    </AdminContainer>
  );
}
