import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { useCallback } from "react";
import { ClassHeader } from "@/components/classes";
import { ContentFilters, ContentList } from "@/components/classes/content";
import { Container } from "@/components/ui/container";
import { SearchInput } from "@/components/ui/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
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

      // Ganti filter/cari tidak boleh melempar siswa kembali ke atas halaman.
      navigate({ search: cleanSearch, replace: true, resetScroll: false });
    },
    [navigate, searchParams],
  );

  const data = useQuery({
    ...orpc.subtest.byShortName.queryOptions({
      input: {
        shortName,
        category: activeFilter === "all" ? undefined : activeFilter,
        search: searchQuery || undefined,
        limit: 20,
        offset: page * 20,
      },
    }),
    // Isi lama tetap tampil selama filter baru dimuat, jadi halaman tidak berganti skeleton dan meloncat.
    placeholderData: keepPreviousData,
  });

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
    <div className="space-y-6">
      <ClassHeader shortName={shortName} />
      <div className="flex flex-col gap-3 rounded-sr-xl border border-sr-line bg-white p-3 shadow-sr-1 sm:p-4 md:flex-row md:items-center md:justify-between">
        <ContentFilters
          activeFilter={activeFilter}
          onChange={(category) =>
            updateSearch({ category: category === "all" ? undefined : (category as "material" | "tips_and_trick") })
          }
        />
        <div className="md:w-80">
          <SearchInput value={searchQuery} onChange={(q) => updateSearch({ q })} placeholder="Cari konten..." />
        </div>
      </div>

      <div className={cn("space-y-4 transition-opacity", data.isPlaceholderData && "opacity-60")}>
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
