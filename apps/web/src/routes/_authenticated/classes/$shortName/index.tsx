import { useQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { useCallback } from "react";
import { ClassHeader, ContentFilters, ContentList } from "@/components/classes";
import { Container } from "@/components/ui/container";
import { SearchInput } from "@/components/ui/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/classes/$shortName/")({
  params: {
    parse: (raw) => ({
      shortName: raw.shortName?.toLowerCase(),
    }),
  },
  component: RouteComponent,
});

type Search = {
  q?: string;
  category?: "material" | "tips_and_trick" | undefined;
  page?: number;
};

function RouteComponent() {
  const { shortName } = Route.useParams();
  const session = authClient.useSession();
  const userIsPremium = session.data?.user?.isPremium ?? false;
  const userRole = session.data?.user?.role;

  const searchParams = Route.useSearch();
  const searchQuery = (searchParams as Search).q ?? "";
  const activeFilter: "all" | "material" | "tips_and_trick" = (searchParams as Search).category ?? "all";
  const page = (searchParams as Search).page ?? 0;

  const navigate = Route.useNavigate();
  const updateSearch = useCallback(
    (updates: Partial<Search>) => {
      const newSearch: Partial<Search> = {};

      if (updates.q !== undefined) {
        newSearch.q = updates.q || undefined;
      }
      if (updates.category !== undefined) {
        newSearch.category = updates.category || undefined;
      }
      if (updates.page !== undefined) {
        newSearch.page = updates.page;
      }

      if (
        (updates.q !== undefined && updates.q !== (searchParams as Search).q) ||
        (updates.category !== undefined && updates.category !== (searchParams as Search).category)
      ) {
        newSearch.page = 0;
      }

      // Remove undefined values to avoid ?category=undefined in URL
      const cleanSearch = Object.fromEntries(Object.entries(newSearch).filter(([, value]) => value !== undefined));

      navigate({ search: cleanSearch });
    },
    [navigate, searchParams],
  );

  const data = useQuery(
    orpc.subtest.byShortName.queryOptions({
      input: {
        shortName,
        category: activeFilter === "all" ? undefined : activeFilter,
        search: searchQuery || undefined,
        limit: 20,
        offset: page * 20,
      },
    }),
  );

  const matchedClass = data.data?.subtest;
  const contents = data.data?.contents;

  if (data.isPending) {
    return (
      <Container className="space-y-6">
        <Skeleton className="h-70 w-full" />
      </Container>
    );
  }

  if (data.isError) {
    return (
      <Container className="pt-12">
        <p className="text-sm text-red-500">Error: {data.error.message}</p>
      </Container>
    );
  }
  if (!matchedClass) return notFound();

  return (
    <div className="mt-2 space-y-4">
      <ClassHeader shortName={shortName} />
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <ContentFilters
            activeFilter={activeFilter}
            onChange={(category) =>
              updateSearch({ category: category === "all" ? undefined : (category as "material" | "tips_and_trick") })
            }
          />
          <div className="max-w-md flex-1">
            <SearchInput value={searchQuery} onChange={(q) => updateSearch({ q })} placeholder="Cari konten..." />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <ContentList
          items={contents}
          isLoading={false}
          searchQuery={searchQuery}
          showCount={Boolean(searchQuery)}
          hasMore={contents?.length === 20}
          onLoadMore={() => updateSearch({ page: page + 1 })}
          userIsPremium={userIsPremium}
          userRole={userRole}
          subtestOrder={matchedClass.order}
          shortName={shortName}
        />
      </div>
    </div>
  );
}
