import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { SubtestCard } from "@/components/classes";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/classes/")({
	component: RouteComponent,
});

function RouteComponent() {
	const subtests = useQuery(orpc.subtest.listSubtests.queryOptions({ input: {} }));

	return (
		<AdminContainer>
			<AdminHeader title="Classes" description="Manage learning classes and content" />

			<div className="space-y-4">
				{subtests.isPending && (
					<div className="grid h-full grid-cols-1 gap-2 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
						{Array.from({ length: 9 }).map((_, i) => (
							<Skeleton key={i.toString()} className="h-40 w-full" />
						))}
					</div>
				)}

				{subtests.isError && <p className="text-red-500">Error: {subtests.error.message}</p>}

				{subtests.data && subtests.data.data.length === 0 && <p className="text-muted-foreground">No subtests yet</p>}

				{subtests.data && subtests.data.data.length > 0 && (
					<div className="grid h-full grid-cols-1 gap-2 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
						{subtests.data.data.map((subtest) => (
							<SubtestCard key={subtest.id} subtest={subtest} />
						))}
					</div>
				)}
			</div>
		</AdminContainer>
	);
}
