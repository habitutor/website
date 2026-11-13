import { DownloadSimpleIcon, MagnifyingGlassIcon, UserIcon } from "@phosphor-icons/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type } from "arktype";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDebounceValue } from "@/hooks/timing/use-debounce-value";
import { orpc } from "@/utils/orpc";
import { CursorPagination } from "./-components/pagination";
import { downloadUsersCsv } from "./-components/export-users-csv";
import { type AdminUser, UserCard, UserRow } from "./-components/user-row";

const usersSearchSchema = type({
  "search?": "string",
  "cursor?": "string",
  "cursorHistory?": "string[]",
  "premium?": "'all' | 'premium' | 'free'",
  "package?": "string",
  "createdFrom?": "string",
  "createdTo?": "string",
});

export const Route = createFileRoute("/admin/users/")({
  component: UsersPage,
  validateSearch: usersSearchSchema,
});

function UsersPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const queryClient = useQueryClient();
  const cursor = Route.useSearch({ select: (s) => s.cursor ?? null });
  const searchParam = Route.useSearch({ select: (s) => s.search ?? "" });
  const premiumFilter = Route.useSearch({ select: (s) => s.premium ?? "all" });
  const packageFilter = Route.useSearch({ select: (s) => s.package ?? "" });
  const createdFrom = Route.useSearch({ select: (s) => s.createdFrom ?? "" });
  const createdTo = Route.useSearch({ select: (s) => s.createdTo ?? "" });
  const pageNumber = Route.useSearch({ select: (s) => (s.cursorHistory?.length ?? 0) + (s.cursor ? 1 : 0) + 1 });
  const hasPrevious = Route.useSearch({ select: (s) => Boolean(s.cursor) || (s.cursorHistory?.length ?? 0) > 0 });

  const [searchQuery, setSearchQuery] = useState(searchParam);
  const debouncedSearch = useDebounceValue(searchQuery, 500);
  const [isExporting, setIsExporting] = useState(false);
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
        cursor: undefined,
        cursorHistory: undefined,
      }),
      replace: true,
    });
  }, [debouncedSearch, navigate]);

  const handleNext = (nextCursor: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        cursorHistory: prev.cursor ? [...(prev.cursorHistory ?? []), prev.cursor] : (prev.cursorHistory ?? []),
        cursor: nextCursor,
      }),
    });
  };

  const handlePrevious = () => {
    navigate({
      search: (prev) => {
        const history = prev.cursorHistory ?? [];
        if (history.length > 0) {
          return {
            ...prev,
            cursor: history[history.length - 1],
            cursorHistory: history.slice(0, -1),
          };
        }
        return { ...prev, cursor: undefined, cursorHistory: undefined };
      },
    });
  };

  const listFilters = {
    search: searchParam,
    isPremium: premiumFilter === "premium" ? true : premiumFilter === "free" ? false : undefined,
    packageSlug: packageFilter || undefined,
    createdFrom: createdFrom || undefined,
    createdTo: createdTo || undefined,
  };

  const { data, isPending } = useQuery(
    orpc.admin.users.list.queryOptions({
      input: {
        limit,
        cursor: cursor ?? undefined,
        ...listFilters,
      },
    }),
  );
  const packagesQuery = useQuery(orpc.admin.users.packages.queryOptions());

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await queryClient.fetchQuery(orpc.admin.users.export.queryOptions({ input: listFilters }));
      downloadUsersCsv(result.data);
      toast.success(`Exported ${result.total} users`);
    } catch (error) {
      toast.error("Export failed", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const users = data?.data || [];
  const hasMore = data?.hasMore || false;
  const nextCursor = data?.nextCursor || null;

  return (
    <AdminContainer>
      <AdminHeader title="Manajemen User" description="Kelola pengguna dan status Premium Habitutor." />

      <div className="mb-6 flex flex-col gap-3">
        <div className="flex sr-card-hover flex-col gap-3 rounded-sr-lg border border-sr-line bg-sr-ivory/60 p-3 shadow-sr-1 sm:flex-row">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-sr-muted" />
            <Input
              placeholder="Cari nama atau email user…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 rounded-full border-sr-line bg-white pl-9 focus:border-sr-blue-300 focus:ring-4 focus:ring-sr-blue-100"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              aria-label="Filter paket premium"
              value={packageFilter}
              onChange={(event) =>
                navigate({
                  search: (prev) => ({
                    ...prev,
                    package: event.target.value || undefined,
                    premium: event.target.value ? "premium" : prev.premium,
                    cursor: undefined,
                    cursorHistory: undefined,
                  }),
                  replace: true,
                })
              }
              className="h-10 rounded-full border border-sr-line bg-white px-3 text-sm text-sr-ink focus:border-sr-blue-300 focus:ring-4 focus:ring-sr-blue-100"
            >
              <option value="">Semua paket</option>
              {packagesQuery.data?.map((product) => (
                <option key={product.slug} value={product.slug}>
                  {product.name}
                </option>
              ))}
            </select>
            {(
              [
                { value: "all", label: "Semua" },
                { value: "premium", label: "Premium" },
                { value: "free", label: "Gratis" },
              ] as const
            ).map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={premiumFilter === option.value ? "default" : "outline"}
                onClick={() =>
                  navigate({
                    search: (prev) => ({
                      ...prev,
                      premium: option.value === "all" ? undefined : option.value,
                      cursor: undefined,
                      cursorHistory: undefined,
                    }),
                    replace: true,
                  })
                }
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="date"
              aria-label="Bergabung dari tanggal"
              value={createdFrom}
              onChange={(event) =>
                navigate({
                  search: (prev) => ({
                    ...prev,
                    createdFrom: event.target.value || undefined,
                    cursor: undefined,
                    cursorHistory: undefined,
                  }),
                  replace: true,
                })
              }
              className="w-auto"
            />
            <span className="text-sm text-sr-muted">sampai</span>
            <Input
              type="date"
              aria-label="Bergabung sampai tanggal"
              value={createdTo}
              onChange={(event) =>
                navigate({
                  search: (prev) => ({
                    ...prev,
                    createdTo: event.target.value || undefined,
                    cursor: undefined,
                    cursorHistory: undefined,
                  }),
                  replace: true,
                })
              }
              className="w-auto"
            />
          </div>
          <Button type="button" variant="outline" disabled={isExporting} onClick={handleExport}>
            <DownloadSimpleIcon className="size-4" />
            Ekspor CSV
          </Button>
        </div>
      </div>

      <UsersTable users={users} isPending={isPending} />

      <CursorPagination
        className="mt-5"
        label="user"
        page={pageNumber}
        shown={users.length}
        hasPrevious={hasPrevious}
        hasNext={hasMore}
        onPrevious={handlePrevious}
        onNext={() => nextCursor && handleNext(nextCursor)}
        isLoading={isPending}
      />
    </AdminContainer>
  );
}

function UsersTable({ users, isPending }: { users: AdminUser[]; isPending: boolean }) {
  if (!isPending && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-sr-xl border-2 border-dashed border-sr-blue-200 bg-white/60 p-12 text-center">
        <UserIcon className="text-sr-blue-400 mb-4 size-12" />
        <h3 className="mb-2 text-lg font-black text-sr-ink">Tidak ada user ditemukan</h3>
        <p className="text-sm text-sr-muted">Coba ubah kata kunci atau filter pencarian.</p>
      </div>
    );
  }

  const showCards = !isPending;

  return (
    <div className="sr-card-hover overflow-hidden rounded-sr-xl border border-sr-line bg-white shadow-sr-1">
      <div className={showCards ? "hidden overflow-x-auto md:block" : "overflow-x-auto"}>
        <Table className="min-w-[860px]">
          <TableHeader>
            <TableRow>
              <TableHead className="px-4">Pengguna</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status Premium</TableHead>
              <TableHead>Referral</TableHead>
              <TableHead>Telepon</TableHead>
              <TableHead>Bergabung</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? <UsersTableSkeleton /> : users.map((user) => <UserRow key={user.id} user={user} />)}
          </TableBody>
        </Table>
      </div>
      {showCards && (
        <ul className="divide-y divide-sr-line md:hidden">
          {users.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </ul>
      )}
    </div>
  );
}

function UsersTableSkeleton() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        // biome-ignore lint: skeleton items don't need stable keys
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-10 w-44" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-24" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="ml-auto h-8 w-20" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
