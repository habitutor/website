import { MagnifyingGlassIcon, UserIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type } from "arktype";
import { useEffect, useRef, useState } from "react";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDebounceValue } from "@/hooks/use-debounce-value";
import { orpc } from "@/utils/orpc";
import { CursorPagination } from "./-components/pagination";
import { UserRow } from "./-components/user-row";

const usersSearchSchema = type({
  "search?": "string",
  "cursor?": "string",
  "cursorHistory?": "string[]",
});

export const Route = createFileRoute("/admin/users/")({
  component: UsersPage,
  validateSearch: usersSearchSchema,
});

function UsersPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const cursor = Route.useSearch({ select: (s) => s.cursor ?? null });
  const searchParam = Route.useSearch({ select: (s) => s.search ?? "" });
  const hasPrevious = Route.useSearch({ select: (s) => Boolean(s.cursor) || (s.cursorHistory?.length ?? 0) > 0 });

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

  const { data, isPending } = useQuery(
    orpc.admin.users.list.queryOptions({
      input: {
        limit,
        cursor: cursor ?? undefined,
        search: searchParam,
      },
    }),
  );

  const users = data?.data || [];
  const hasMore = data?.hasMore || false;
  const nextCursor = data?.nextCursor || null;

  return (
    <AdminContainer>
      <AdminHeader title="User Management" description="Manage users and their premium status" />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
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
