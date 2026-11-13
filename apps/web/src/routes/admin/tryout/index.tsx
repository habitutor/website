import { ExamIcon, MagnifyingGlassIcon, PlusIcon, PencilIcon, TrashIcon, XIcon } from "@phosphor-icons/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminContainer } from "@/components/admin/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
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
import { toast } from "sonner";
import { orpc, queryClient } from "@/utils/orpc";
import { getTryoutPagination, TRYOUT_PAGE_SIZE, TryoutPagination } from "./-components/pagination";

export const Route = createFileRoute("/admin/tryout/")({
  component: TryoutListPage,
});

function TryoutListPage() {
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const { data, isPending, isFetching, isError, refetch } = useQuery(
    orpc.admin.tryout.list.tryout.queryOptions({
      input: { page, limit: TRYOUT_PAGE_SIZE, search: debouncedSearch || undefined },
    }),
  );

  const tryouts = data?.items ?? [];
  const validPage = data ? getTryoutPagination(page, data.total).currentPage : page;

  useEffect(() => {
    if (!isFetching && !isError && page !== validPage) {
      // The server total can shrink after a deletion on the final page.
      setPage(validPage);
    }
  }, [isError, isFetching, page, validPage]);

  const deleteMutation = useMutation(
    orpc.admin.tryout.delete.tryout.mutationOptions({
      onSuccess: () => {
        toast.success("Tryout berhasil dihapus");
        setDeleteId(null);
        queryClient.invalidateQueries({
          queryKey: orpc.admin.tryout.list.tryout.key(),
        });
      },
      onError: (err) => {
        toast.error("Gagal menghapus tryout", {
          description: err.message,
        });
      },
    }),
  );

  const handleDelete = async () => {
    if (!deleteId) return;
    deleteMutation.mutate({ tryoutId: deleteId });
  };

  const showMobileList = !isPending && !isError && page === validPage && tryouts.length > 0;

  return (
    <AdminContainer>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-sr-xl sr-card-blue p-5 shadow-sr-2 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-sr-md bg-white/15 text-sr-sun-400 ring-1 ring-white/20">
              <ExamIcon weight="fill" className="size-6" />
            </span>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Kelola Try Out</h1>
              <p className="mt-1 text-sm leading-relaxed text-white/80">
                Atur simulasi ujian UTBK dan konten latihan siswa.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <Link to="/admin/tryout/passing-grade">Kelola Passing Grade</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="sr-sheen rounded-full font-extrabold">
              <Link to="/admin/tryout/create">
                <PlusIcon />
                Buat Try Out Baru
              </Link>
            </Button>
          </div>
        </div>

        <div className="sr-card-hover overflow-hidden rounded-sr-xl border border-sr-line bg-white shadow-sr-1">
          <div className="flex flex-col gap-1 border-b border-sr-line bg-sr-ivory/70 px-5 py-4 sm:px-6">
            <h2 className="font-extrabold text-sr-ink">Daftar Try Out</h2>
            <p className="text-sm text-sr-muted">Pilih Try Out untuk mengelola subtes, soal, dan status publikasi.</p>
          </div>
          <div className="border-b border-sr-line px-5 py-4 transition-colors duration-300 focus-within:bg-sr-blue-50/40 sm:px-6">
            <label className="relative block max-w-xl">
              <span className="sr-only">Cari Try Out</span>
              <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-sr-muted" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Cari berdasarkan nama atau deskripsi Try Out..."
                className="h-11 w-full rounded-full border border-sr-line bg-sr-ivory/60 pr-10 pl-10 text-sm text-sr-ink transition-colors outline-none placeholder:text-sr-muted focus:border-sr-blue-300 focus:bg-white focus:ring-4 focus:ring-sr-blue-100"
              />
              {search && (
                <button
                  type="button"
                  aria-label="Hapus pencarian"
                  onClick={() => setSearch("")}
                  className="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-sr-muted hover:bg-sr-blue-50 hover:text-sr-blue-600"
                >
                  <XIcon className="size-3.5" />
                </button>
              )}
            </label>
          </div>
          <div className={showMobileList ? "hidden overflow-x-auto md:block" : "overflow-x-auto"}>
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow className="border-sr-line bg-sr-ivory/70 hover:bg-sr-ivory/70">
                  <TableHead className="h-12 px-5 text-xs font-extrabold tracking-wider text-sr-muted uppercase">
                    Try Out
                  </TableHead>
                  <TableHead className="h-12 px-3 text-xs font-extrabold tracking-wider text-sr-muted uppercase">
                    Status
                  </TableHead>
                  <TableHead className="h-12 px-3 text-xs font-extrabold tracking-wider text-sr-muted uppercase">
                    Deskripsi
                  </TableHead>
                  <TableHead className="h-12 px-3 text-xs font-extrabold tracking-wider text-sr-muted uppercase">
                    Dibuat
                  </TableHead>
                  <TableHead className="h-12 px-5 text-right text-xs font-extrabold tracking-wider text-sr-muted uppercase">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending || (!isError && page !== validPage) ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={5} className="px-5 py-12 text-center">
                      <p role="alert" className="mb-3 text-sm text-red-600">
                        Gagal memuat daftar Try Out.
                      </p>
                      <Button variant="outline" disabled={isFetching} onClick={() => void refetch()}>
                        {isFetching ? "Memuat..." : "Coba lagi"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : tryouts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="px-5 py-14 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                        <span className="flex size-12 items-center justify-center rounded-full bg-sr-blue-50 text-sr-blue-600">
                          <ExamIcon weight="duotone" className="size-6" />
                        </span>
                        <p className="font-extrabold text-sr-ink">Belum ada Try Out</p>
                        <p className="text-sm text-sr-muted">
                          Buat simulasi pertama untuk mulai menambahkan subtes dan soal.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  tryouts.map(
                    (tryout: {
                      id: string;
                      judul: string;
                      status: string;
                      deskripsi: string | null;
                      createdAt: Date;
                    }) => (
                      <TableRow
                        key={tryout.id}
                        className="group border-sr-line transition-all duration-300 hover:bg-sr-blue-50/40 hover:shadow-[0_8px_24px_-18px_#2356e8]"
                      >
                        <TableCell className="px-5 py-5 align-top">
                          <div className="flex min-w-0 items-start gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-sr-sm bg-sr-blue-50 text-sr-blue-600 transition-colors group-hover:bg-sr-blue-100">
                              <ExamIcon
                                weight="fill"
                                className="size-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                              />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-extrabold text-sr-ink transition-colors duration-200 group-hover:text-sr-blue-600">
                                {tryout.judul}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-5 align-top">
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-xs font-bold transition-transform duration-200 group-hover:-translate-y-0.5 ${
                              tryout.status === "published"
                                ? "bg-sr-live/10 text-sr-live"
                                : tryout.status === "archived"
                                  ? "bg-sr-ivory text-sr-muted"
                                  : "bg-sr-sun-100 text-sr-amber-700"
                            }`}
                          >
                            {tryout.status === "published"
                              ? "Dipublikasikan"
                              : tryout.status === "archived"
                                ? "Diarsipkan"
                                : "Draft"}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[280px] px-3 py-5 align-top text-sm leading-relaxed text-sr-muted">
                          {tryout.deskripsi || "Tanpa deskripsi"}
                        </TableCell>
                        <TableCell className="px-3 py-5 align-top text-sm text-sr-muted">
                          {new Date(tryout.createdAt).toLocaleDateString("id-ID")}
                        </TableCell>
                        <TableCell className="space-x-2 px-5 py-5 text-right align-top">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="sr-action text-sr-blue-600 hover:bg-sr-blue-50 hover:text-sr-blue-700"
                            onClick={() => navigate({ to: `/admin/tryout/${tryout.id}` })}
                          >
                            <PencilIcon />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(tryout.id)}
                            className="sr-action text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <TrashIcon />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ),
                  )
                )}
              </TableBody>
            </Table>
          </div>
          {showMobileList && (
            <ul className="divide-y divide-sr-line md:hidden">
              {tryouts.map(
                (tryout: { id: string; judul: string; status: string; deskripsi: string | null; createdAt: Date }) => (
                  <li key={tryout.id} className="space-y-3 px-5 py-4">
                    <div className="flex items-start gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-sr-sm bg-sr-blue-50 text-sr-blue-600">
                        <ExamIcon weight="fill" className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-extrabold wrap-break-word text-sr-ink">{tryout.judul}</p>
                        <p className="mt-0.5 line-clamp-2 text-sm text-sr-muted">
                          {tryout.deskripsi || "Tanpa deskripsi"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                            tryout.status === "published"
                              ? "bg-sr-live/10 text-sr-live"
                              : tryout.status === "archived"
                                ? "bg-sr-ivory text-sr-muted"
                                : "bg-sr-sun-100 text-sr-amber-700"
                          }`}
                        >
                          {tryout.status === "published"
                            ? "Dipublikasikan"
                            : tryout.status === "archived"
                              ? "Diarsipkan"
                              : "Draft"}
                        </span>
                        <span className="text-xs text-sr-muted">
                          {new Date(tryout.createdAt).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label={`Edit ${tryout.judul}`}
                          onClick={() => navigate({ to: `/admin/tryout/${tryout.id}` })}
                        >
                          <PencilIcon /> Kelola
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label={`Hapus ${tryout.judul}`}
                          onClick={() => setDeleteId(tryout.id)}
                          className="text-destructive"
                        >
                          <TrashIcon />
                        </Button>
                      </div>
                    </div>
                  </li>
                ),
              )}
            </ul>
          )}
          {data && !isError && page === validPage && (
            <TryoutPagination
              page={page}
              total={data.total}
              isLoading={isFetching || deleteMutation.isPending}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Tryout?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Semua soal dan data tryout akan dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminContainer>
  );
}
