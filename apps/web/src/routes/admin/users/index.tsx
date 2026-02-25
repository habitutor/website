import { MagnifyingGlassIcon, UserIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
import { useDebounceValue } from "@/hooks/use-debounce-value";
import { orpc } from "@/utils/orpc";
import { CursorPagination } from "./-components/pagination";
import { UserRow } from "./-components/user-row";

export const Route = createFileRoute("/admin/users/")({
	component: UsersPage,
});

function UsersPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const debouncedSearch = useDebounceValue(searchQuery, 500);
	const { cursor, handleNext, handlePrevious, resetCursor, hasPrevious } = useCursorPagination();
	const limit = 10;

	// biome-ignore lint/correctness/useExhaustiveDependencies: debouncedSearch is needed to reset cursor when search changes
	useEffect(() => {
		resetCursor();
	}, [resetCursor, debouncedSearch]);

	const { data, isPending } = useQuery(
		orpc.admin.users.listUsers.queryOptions({
			input: {
				limit,
				cursor: cursor ?? undefined,
				search: debouncedSearch,
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
				<h3 className="mb-2 font-semibold text-lg">No users found</h3>
				<p className="text-muted-foreground text-sm">Try adjusting your search query</p>
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
						<Skeleton className="h-5 w-20" />
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
