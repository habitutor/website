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
import { UserRow } from "./-components/user-row";

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
      <AdminHeader title="User Management" description="Manage users and their premium status" />

      <div className="mb-6 flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              aria-label="Filter by premium package"
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
              className="h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">All packages</option>
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
                { value: "free", label: "Free" },
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
              aria-label="Joined from"
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
            <span className="text-sm text-muted-foreground">to</span>
            <Input
              type="date"
              aria-label="Joined to"
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
            Export CSV
          </Button>
        </div>
      </div>

      <UsersTable users={users} isPending={isPending} />

      <CursorPagination
        hasPrevious={hasPrevious}
        hasNext={hasMore}
        onPrevious={handlePrevious}
        onNext={() => nextCursor && handleNext(nextCursor)}
        isLoading={isPending}
      />
    </AdminContainer>
  );
}

function UsersTable({
  users,
  isPending,
}: {
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: string | null;
    referralUsage: number | null;
    phoneNumber: string | null;
    isPremium: boolean | null;
    packageSlug: string | null;
    premiumExpiresAt: Date | null;
    createdAt: Date;
  }>;
  isPending: boolean;
}) {
  if (!isPending && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
        <UserIcon className="mb-4 size-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">No users found</h3>
        <p className="text-sm text-muted-foreground">Try adjusting your search query</p>
      </div>
    );
  }

  return (
    <div className="overflow-clip rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Referral Usage</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Premium Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending ? <UsersTableSkeleton /> : users.map((user) => <UserRow key={user.id} user={user} />)}
        </TableBody>
      </Table>
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
            <Skeleton className="h-5 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-14" />
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
