import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useLocation } from "@tanstack/react-router";
import { KelasHeader } from "@/components/kelas/kelas-header";
import { SubtestCard } from "@/components/kelas/subtest-card";
import { Container } from "@/components/ui/container";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/classes/")({
	component: RouteComponent,
});

function RouteComponent() {
	const subtests = useQuery(orpc.subtest.list.queryOptions());
	const location = useLocation();
	
	const routePrefix = location.pathname.startsWith("/classes")
		? "/classes"
		: "/subtests";

	return (
		<Container>
			<KelasHeader path={routePrefix} />

			<div className="space-y-4">
				{subtests.isPending && (
					<p className="animate-pulse">Subtest Loading...</p>
				)}

				{subtests.isError && (
					<p className="text-red-500">Error: {subtests.error.message}</p>
				)}

				{subtests.data && subtests.data.length === 0 && (
					<p className="text-muted-foreground">No subtests yet</p>
				)}

				<div className="grid h-full grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
					{subtests.data?.map((subtest) => (
						<SubtestCard key={subtest.id} subtest={subtest} path={routePrefix} />
					))}
				</div>
			</div>
		</Container>
	);
}
