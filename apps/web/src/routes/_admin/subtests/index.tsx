import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useLocation } from "@tanstack/react-router";
import { KelasHeader } from "@/components/kelas/kelas-header";
import { SubtestCard } from "@/components/kelas/subtest-card";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_admin/subtests/")({
	component: AdminSubtestsPage,
});

function AdminSubtestsPage() {
	const subtests = useQuery(orpc.admin.subtest.listSubtests.queryOptions({}));

	const location = useLocation();
	
	const routePrefix = location.pathname.startsWith("/classes")
		? "/classes"
		: "/subtests";

	return (
		<>
			<KelasHeader path={routePrefix} />

			<div className="space-y-4">
				{subtests.isPending && (
					<>
						<Skeleton className="h-20 w-full" />
						<Skeleton className="h-20 w-full" />
						<Skeleton className="h-20 w-full" />
					</>
				)}

				{subtests.isError && (
					<p className="text-red-500">Error: {subtests.error.message}</p>
				)}

				{subtests.data?.length === 0 && (
					<p className="text-muted-foreground">Belum ada subtest</p>
				)}

				<div className="grid h-full grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
					{subtests.data?.map((subtest) => (
						<SubtestCard key={subtest.id} subtest={subtest} path={routePrefix} />
					))}
				</div>
			</div>
		</>
	);
}
