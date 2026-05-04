import { MagnifyingGlassIcon, UserIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type } from "arktype";
import { useEffect, useRef, useState } from "react";
import { AdminTable, AdminTablePagination, AdminTableToolbar } from "@/components/admin/admin-table";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDebounceValue } from "@/hooks/timing/use-debounce-value";
import { orpc } from "@/utils/orpc";
import { UserRow } from "./-components/user-row";

const usersSearchSchema = type({
  "search?": "string",
  "after?": "string",
  "before?": "string",
});

export const Route = createFileRoute("/admin/users/")({
  staticData: { breadcrumb: "Users" },
  component: UsersPage,
  validateSearch: usersSearchSchema,
});

function UsersPage() {
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
    orpc.admin.users.list.queryOptions({
      input: {
        limit,
        after,
        before,
        search: searchParam,
      },
    }),
  );

  const users = data?.data || [];
  const hasMore = data?.hasMore || false;
  const hasPrevious = data?.hasPrevious || false;
  const nextCursor = data?.nextCursor || null;
  const prevCursor = data?.prevCursor || null;

  return (
    <AdminContainer>
      <AdminHeader title="User Management" description="Manage users and their premium status" />

      <AdminTableToolbar>
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </AdminTableToolbar>

      <AdminTable
        isEmpty={users.length === 0}
        isPending={isPending}
        emptyState={{ icon: UserIcon, title: "No users found", description: "Try adjusting your search query" }}
        skeletonCellWidths={["w-24", "w-32", "w-16", "w-14", "w-20", "w-24", "w-24", "w-20"]}
      >
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
            {users.map((user) => (
              <UserRow key={user.id} user={user} />
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
