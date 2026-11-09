import { PlusIcon, PencilIcon, TrashIcon } from "@phosphor-icons/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
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

  const { data, isPending, isFetching, isError, refetch } = useQuery(
    orpc.admin.tryout.list.tryout.queryOptions({
      input: { page, limit: TRYOUT_PAGE_SIZE },
    }),
  );

  const tryouts = data?.items ?? [];
  const validPage = data ? getTryoutPagination(page, data.total).currentPage : page;

  // Deletions (including by another admin) can remove the final page.
  useEffect(() => {
    if (!isFetching && !isError && page !== validPage) setPage(validPage);
  }, [isFetching, isError, page, validPage]);

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

  return (
    <AdminContainer>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <AdminHeader title="Kelola Tryout" description="Manajemen simulasi ujian UTBK" />
          <div className="flex items-center gap-3">
            <Button asChild size="lg" variant="outline">
              <Link to="/admin/tryout/passing-grade">Kelola Passing Grade</Link>
            </Button>
            <Button asChild size="lg">
              <Link to="/admin/tryout/create">
                <PlusIcon className="mr-2" />
                Buat Tryout Baru
              </Link>
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
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
                  <TableCell colSpan={5} className="py-8 text-center">
                    <p role="alert" className="mb-3 text-sm text-red-600">
                      Gagal memuat daftar Try Out. Silakan coba lagi.
                    </p>
                    <Button variant="outline" disabled={isFetching} onClick={() => void refetch()}>
                      {isFetching ? "Memuat..." : "Coba lagi"}
                    </Button>
                  </TableCell>
                </TableRow>
              ) : tryouts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    Belum ada tryout. Buat yang pertama sekarang!
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
                    <TableRow key={tryout.id}>
                      <TableCell className="font-medium">{tryout.judul}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                            tryout.status === "published"
                              ? "bg-green-100 text-green-800"
                              : tryout.status === "archived"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {tryout.status === "published"
                            ? "Dipublikasikan"
                            : tryout.status === "archived"
                              ? "Diarsipkan"
                              : "Draft"}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{tryout.deskripsi || "-"}</TableCell>
                      <TableCell>{new Date(tryout.createdAt).toLocaleDateString("id-ID")}</TableCell>
                      <TableCell className="space-x-2 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate({ to: `/admin/tryout/${tryout.id}` })}
                        >
                          <PencilIcon />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(tryout.id)}
                          className="text-red-600 hover:text-red-700"
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
          {data && !isError && page === validPage && (
            <TryoutPagination
              page={page}
              total={data.total}
              isLoading={isFetching || deleteMutation.isPending}
              onPageChange={setPage}
            />
          )}
          {isError && page > 1 && (
            <div className="border-t p-4">
              <Button variant="outline" disabled={isFetching} onClick={() => setPage(1)}>
                Kembali ke halaman pertama
              </Button>
            </div>
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
