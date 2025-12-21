import { useQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { ClassHeader, ContentList } from "@/components/classes";
import { Container } from "@/components/ui/container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { orpc } from "@/utils/orpc";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/classes/$shortName/")({
  params: {
    parse: (raw) => ({
      shortName: raw.shortName?.toLowerCase(),
    }),
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { shortName } = Route.useParams();

  const subtests = useQuery(orpc.subtest.listSubtests.queryOptions());
  const matchedClass = subtests.data?.find(
    (item) => item.shortName?.toLowerCase() === shortName
  );

  const materialContents = useQuery(
    orpc.subtest.listContentByCategory.queryOptions({
      input: { subtestId: matchedClass?.id ?? 0, category: "material" },
      enabled: Boolean(matchedClass?.id),
    })
  );

  const tipsContents = useQuery(
    orpc.subtest.listContentByCategory.queryOptions({
      input: { subtestId: matchedClass?.id ?? 0, category: "tips_and_trick" },
      enabled: Boolean(matchedClass?.id),
    })
  );

  if (subtests.isPending) {
    return (
      <Container className="space-y-6">
        <Skeleton className="h-70 w-full" />
      </Container>
    );
  }

  if (subtests.isError) {
    return (
      <Container className="pt-12">
        <p className="text-red-500 text-sm">Error: {subtests.error.message}</p>
      </Container>
    );
  }
  if (!matchedClass) return notFound();

  return (
    <Container className="space-y-6">
      <ClassHeader subtest={matchedClass} />
      <div className="space-y-4">
        <Tabs defaultValue="material">
          <TabsList>
            <TabsTrigger value="material">Materi</TabsTrigger>
            <TabsTrigger value="tips">Tips & Trick</TabsTrigger>
          </TabsList>
          <TabsContent value="material">
            <ContentList
              items={materialContents.data}
              isLoading={materialContents.isPending}
              error={
                materialContents.isError
                  ? materialContents.error.message
                  : undefined
              }
            />
          </TabsContent>
          <TabsContent value="tips">
            <ContentList
              items={tipsContents.data}
              isLoading={tipsContents.isPending}
              error={
                tipsContents.isError ? tipsContents.error.message : undefined
              }
            />
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  );
}
