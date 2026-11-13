import { PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { ContentFilters, ContentList } from "@/components/classes/content";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { orpc } from "@/utils/orpc";
import { toast } from "sonner";
import { ClassFormDialog } from "../-components/class-form-dialog";
import { ContentDialogs, useContentDialogs } from "./content-dialogs";

export const Route = createFileRoute("/admin/classes/$shortName/")({
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
  const queryClient = useQueryClient();

  const searchParams = Route.useSearch();
  const searchQuery = (searchParams as Search).q ?? "";
  const activeFilter: "all" | "material" | "tips_and_trick" = (searchParams as Search).category ?? "all";
  const page = (searchParams as Search).page ?? 0;

  const navigate = Route.useNavigate();
  const updateSearch = (updates: Partial<Search>) => {
    const currentSearch = searchParams as Search;
    const nextSearch: Partial<Search> = {
      q: updates.q !== undefined ? updates.q || undefined : currentSearch.q,
      category: updates.category !== undefined ? updates.category || undefined : currentSearch.category,
      page: updates.page ?? currentSearch.page,
    };

    if (
      (updates.q !== undefined && updates.q !== currentSearch.q) ||
      (updates.category !== undefined && updates.category !== currentSearch.category)
    ) {
      nextSearch.page = 0;
    }

    const cleanSearch = Object.fromEntries(Object.entries(nextSearch).filter(([, value]) => value !== undefined));
    navigate({ search: cleanSearch as Search });
  };

  const subtests = useQuery(orpc.subtest.list.queryOptions({ input: {} }));
  const matchedClass = subtests.data?.data?.find((item) => item.shortName?.toLowerCase() === shortName);

  const contents = useQuery(
    orpc.subtest.content.list.queryOptions({
      input: (() => {
        const input: {
          subtestId: number;
          category?: "material" | "tips_and_trick";
          search?: string;
          limit: number;
          offset: number;
        } = {
          subtestId: matchedClass?.id ?? 0,
          limit: 20,
          offset: page * 20,
        };
        if (activeFilter !== "all") {
          input.category = activeFilter as "material" | "tips_and_trick";
        }
        if (searchQuery) {
          input.search = searchQuery;
        }
        return input;
      })(),
      enabled: Boolean(matchedClass?.id),
    }),
  );

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const removeMutation = useMutation(
    orpc.admin.subtest.subtest.remove.mutationOptions({
      onSuccess: async (result) => {
        toast.success(result.message);
        await queryClient.invalidateQueries({ queryKey: orpc.subtest.list.queryKey({ input: {} }) });
        navigate({ to: "/admin/classes" });
      },
      onError: (error) => toast.error("Gagal menghapus kelas", { description: error.message }),
    }),
  );
  const nextOrder = Math.max(1, ...(subtests.data?.data ?? []).map((item) => item.order ?? 1)) + 1;

  const dialogs = useContentDialogs({
    matchedClassId: matchedClass?.id ?? null,
    contentItems: contents.data,
    activeFilter,
    queryClient,
  });

  if (subtests.isPending) {
    return (
      <AdminContainer>
        <p className="animate-pulse text-sm">Memuat kelas…</p>
      </AdminContainer>
    );
  }

  if (subtests.isError) {
    return (
      <AdminContainer>
        <p className="text-sm text-destructive">Error: {subtests.error.message}</p>
      </AdminContainer>
    );
  }

  if (!matchedClass) return notFound();

  return (
    <AdminContainer>
      <AdminHeader title={matchedClass.name} description="Kelola konten untuk kelas ini" backTo="/admin/classes">
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          <PencilSimpleIcon className="size-4" />
          Edit Kelas
        </Button>
        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          className="inline-flex h-9 sr-action items-center gap-1.5 rounded-sr-sm bg-white/15 px-4 text-sm font-semibold text-white ring-1 ring-white/30 transition-colors hover:bg-destructive"
        >
          <TrashIcon className="size-4" />
          Hapus
        </button>
      </AdminHeader>
      <ClassFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        subject={matchedClass}
        nextOrder={nextOrder}
        onSaved={(newShortName) => {
          if (newShortName.toLowerCase() !== shortName) {
            navigate({ to: "/admin/classes/$shortName", params: { shortName: newShortName.toLowerCase() } });
          }
        }}
      />
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus kelas {matchedClass.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Semua konten di kelas ini (video, catatan, dan latihan soal) ikut terhapus dan tidak bisa dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              disabled={removeMutation.isPending}
              onClick={() => removeMutation.mutate({ id: matchedClass.id })}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {removeMutation.isPending ? "Menghapus…" : "Hapus Kelas"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="sticky top-16 z-20 space-y-4 border-b bg-background/95 pb-4 backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full flex-1 sm:max-w-md">
            <SearchInput value={searchQuery} onChange={(q) => updateSearch({ q })} placeholder="Cari konten..." />
          </div>
          <ContentFilters
            activeFilter={activeFilter}
            onChange={(category) =>
              updateSearch({ category: category === "all" ? undefined : (category as "material" | "tips_and_trick") })
            }
          />
        </div>
      </div>

      <div className="space-y-4">
        <ContentList
          items={contents.data}
          isLoading={contents.isPending}
          error={contents.isError ? contents.error.message : undefined}
          searchQuery={searchQuery}
          showCount={Boolean(searchQuery)}
          hasMore={contents.data?.length === 20}
          onLoadMore={() => updateSearch({ page: page + 1 })}
          onCreate={() => dialogs.openCreateDialog(activeFilter === "all" ? "material" : activeFilter)}
          onEdit={dialogs.openEditDialog}
          onDelete={dialogs.openDeleteDialog}
          onReorder={dialogs.handleReorder}
          activeFilter={activeFilter}
        />
      </div>

      <ContentDialogs controller={dialogs} />
    </AdminContainer>
  );
}
