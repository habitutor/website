import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { SubtestCard, SubtestHeader } from "@/components/classes";
import { Container } from "@/components/ui/container";
import { orpc } from "@/utils/orpc";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/classes/")({
  component: RouteComponent,
});

function RouteComponent() {
  const subtests = useQuery(orpc.subtest.listSubtests.queryOptions());

  return (
    <Container>
      <SubtestHeader />

      <div>
        {subtests.isPending && (
          <div className="grid h-full grid-cols-1 gap-2 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        )}

        {subtests.isError && (
          <p className="text-red-500">Error: {subtests.error.message}</p>
        )}

        {subtests.data && subtests.data.length === 0 && (
          <p className="text-muted-foreground">No subtests yet</p>
        )}

        <div className="grid h-full grid-cols-1 gap-2 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
          {subtests.data?.map((subtest) => (
            <SubtestCard key={subtest.id} subtest={subtest} />
          ))}
        </div>
      </div>
    </Container>
  );
}
