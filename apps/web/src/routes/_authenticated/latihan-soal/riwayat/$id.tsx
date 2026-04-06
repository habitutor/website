import { useQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { Container } from "@/components/ui/container";
import { orpc } from "@/utils/orpc";
import { PracticeHistoryDetailView } from "./-$id-detail-view";

export function parsePracticeHistoryParams(rawParams: { id: string }) {
  return { id: Number(rawParams.id) };
}

export function isInvalidPracticeHistoryId(id: number) {
  return Number.isNaN(id);
}

export const Route = createFileRoute("/_authenticated/latihan-soal/riwayat/$id")({
  params: {
    parse: parsePracticeHistoryParams,
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const history = useQuery(
    orpc.practicePack.historyDetail.queryOptions({
      input: {
        id,
      },
    }),
  );

  if (isInvalidPracticeHistoryId(id)) return notFound();

  if (history.isPending) {
    return (
      <Container className="pt-20">
        <p className="animate-pulse">Memuat detail...</p>
      </Container>
    );
  }

  if (history.isError) {
    return (
      <Container className="pt-20">
        <p className="text-red-500">Error: {history.error.message}</p>
      </Container>
    );
  }

  if (!history.data) return notFound();

  return <PracticeHistoryDetailView history={history.data} />;
}
