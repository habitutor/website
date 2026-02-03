import { MagnifyingGlass, User } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { orpc } from "@/utils/orpc";
import { CursorPagination } from "./-components/pagination";
import { UserRow } from "./-components/user-row";

export const Route = createFileRoute("/admin/users/")({
	component: UsersPage,
});

function UsersPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [cursor, setCursor] = useState<string | null>(null);
	const [cursorHistory, setCursorHistory] = useState<string[]>([]);
	const limit = 10;

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchQuery);
			// Reset pagination when search changes
			setCursor(null);
			setCursorHistory([]);
		}, 300);

		return () => clearTimeout(timer);
	}, [searchQuery]);

	const { data, isLoading } = useQuery(
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

	const handleNext = () => {
		if (nextCursor) {
			// Save current cursor to history before moving forward
			if (cursor) {
				setCursorHistory((prev) => [...prev, cursor]);
			}
			setCursor(nextCursor);
		}
	};

	const handlePrevious = () => {
		if (cursorHistory.length > 0) {
			// Pop the last cursor from history
			const previousCursor = cursorHistory[cursorHistory.length - 1];
			setCursorHistory((prev) => prev.slice(0, -1));
			setCursor(previousCursor);
		} else {
			// No history, go back to first page
			setCursor(null);
		}
	};

	const hasPrevious = cursor !== null || cursorHistory.length > 0;

	return (
		<AdminContainer>
			<AdminHeader title="User Management" description="Manage users and their premium status" />

			<div className="mb-6 flex flex-col gap-3 sm:flex-row">
				<div className="relative flex-1">
					<MagnifyingGlass className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search users by name or email..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
					/>
				</div>
			</div>

			<UsersTable users={users} isLoading={isLoading} />

			<CursorPagination
				hasPrevious={hasPrevious}
				hasNext={hasMore}
				onPrevious={handlePrevious}
				onNext={handleNext}
				isLoading={isLoading}
			/>
		</AdminContainer>
	);
}

function UsersTable({
	users,
	isLoading,
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
	isLoading: boolean;
}) {
	if (isLoading) {
		return (
			<div className="rounded-md border">
				<div className="p-4">
					<Skeleton className="h-8 w-full" />
				</div>
				{Array.from({ length: 5 }).map(() => (
					<div key={crypto.randomUUID()} className="border-t p-4">
						<Skeleton className="h-6 w-full" />
					</div>
				))}
			</div>
		);
	}

	if (users.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
				<User className="mb-4 size-12 text-muted-foreground" />
				<h3 className="mb-2 font-semibold text-lg">No users found</h3>
				<p className="text-muted-foreground text-sm">Try adjusting your search query</p>
			</div>
		);
	}

	return (
		<div className="rounded-md border">
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
					{users.map((user) => (
						<UserRow key={user.id} user={user} />
					))}
				</TableBody>
			</Table>
		</div>
	);
}
