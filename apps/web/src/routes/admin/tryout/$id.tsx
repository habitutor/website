import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { PlusIcon, TrashIcon, EyeIcon, EyeSlashIcon, PencilIcon } from "@phosphor-icons/react";
import { orpc, queryClient } from "@/utils/orpc";
import { SubtestExplanationManager } from "./-components/explanation-editor";
import { AddSoalDialog, DetailSoalDialog, EditSoalDialog } from "./-components/soal-dialogs";

export const Route = createFileRoute("/admin/tryout/$id")({
  loader: async ({ params }) => {
    try {
      const tryout = await queryClient.ensureQueryData(
        orpc.admin.tryout.detail.tryout.queryOptions({
          input: { tryoutId: params.id },
        }),
      );
      return { breadcrumbTitle: tryout.judul };
    } catch {
      return { breadcrumbTitle: "Detail Tryout" };
    }
  },
  component: TryoutDetailPage,
});

type TryoutType = { judul: string; deskripsi: string | null; status: string };
type SubtestType = { id: string; namaSubtes: string; jumlahSoal: number; durasiMenit: number; urutan: number };
type SoalType = { id: string; pertanyaan: string; tipe: string; poin: number; pilihanJawaban?: unknown[] };

function TryoutDetailPage() {
  const { id } = Route.useParams();
  const [isEditTryoutOpen, setIsEditTryoutOpen] = useState(false);

  const { data: tryout, isPending: isTryoutPending } = useQuery(
    orpc.admin.tryout.detail.tryout.queryOptions({
      input: { tryoutId: id },
    }),
  );

  const editTryoutMutation = useMutation(
    orpc.admin.tryout.update.tryout.mutationOptions({
      onSuccess: () => {
        toast.success("Informasi tryout berhasil diperbarui");
        queryClient.invalidateQueries({
          queryKey: orpc.admin.tryout.detail.tryout.queryKey({ input: { tryoutId: id } }),
        });
        setIsEditTryoutOpen(false);
      },
      onError: (err) => {
        toast.error("Gagal memperbarui tryout", {
          description: err.message,
        });
      },
    }),
  );

  const { data: subtests = [], isPending: isSubtestsPending } = useQuery(
    orpc.admin.tryout.list.subtes.queryOptions({
      input: { tryoutId: id },
    }),
  );

  const createSubtesMutation = useMutation(
    orpc.admin.tryout.create.subtes.mutationOptions({
      onSuccess: () => {
        toast.success("Subtest berhasil ditambahkan");
        queryClient.invalidateQueries({
          queryKey: orpc.admin.tryout.list.subtes.queryKey({ input: { tryoutId: id } }),
        });
      },
      onError: (err) => {
        toast.error("Gagal menambahkan subtest", {
          description: err.message,
        });
      },
    }),
  );

  // --- Publish / Unpublish ---
  const publishMutation = useMutation(
    orpc.admin.tryout.publish.mutationOptions({
      onSuccess: () => {
        toast.success("Tryout berhasil dipublish!");
        queryClient.invalidateQueries({
          queryKey: orpc.admin.tryout.detail.tryout.queryKey({ input: { tryoutId: id } }),
        });
      },
      onError: (err) => toast.error("Gagal publish", { description: err.message }),
    }),
  );

  const unpublishMutation = useMutation(
    orpc.admin.tryout.unpublish.mutationOptions({
      onSuccess: () => {
        toast.success("Tryout dikembalikan ke draft");
        queryClient.invalidateQueries({
          queryKey: orpc.admin.tryout.detail.tryout.queryKey({ input: { tryoutId: id } }),
        });
      },
      onError: (err) => toast.error("Gagal unpublish", { description: err.message }),
    }),
  );

  const handleAddSubtest = (name: string, jumlahSoal: number, durasiMenit: number) => {
    createSubtesMutation.mutate({
      tryoutId: id,
      namaSubtes: name,
      jumlahSoal,
      durasiMenit,
      urutan: subtests.length + 1,
    });
  };

  const displayTitle = isTryoutPending ? "Loading..." : ((tryout as TryoutType)?.judul ?? "Tryout");
  const tryoutStatus = (tryout as TryoutType)?.status ?? "draft";
  const isPublished = tryoutStatus === "published";

  return (
    <AdminContainer>
      <div className="flex items-center justify-between">
        <AdminHeader title={displayTitle} description="Edit dan kelola tryout" />
        {/* Publish/Unpublish Button */}
        {!isTryoutPending && (
          <Button
            variant={isPublished ? "outline" : "default"}
            onClick={() => {
              if (isPublished) {
                unpublishMutation.mutate({ tryoutId: id });
              } else {
                publishMutation.mutate({ tryoutId: id });
              }
            }}
            disabled={publishMutation.isPending || unpublishMutation.isPending}
            className={isPublished ? "border-orange-300 text-orange-600 hover:bg-orange-50" : ""}
          >
            {isPublished ? (
              <>
                <EyeSlashIcon className="mr-2" /> Unpublish
              </>
            ) : (
              <>
                <EyeIcon className="mr-2" /> Publish
              </>
            )}
          </Button>
        )}
      </div>

      <Tabs defaultValue="overview" className="w-full space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Ringkasan</TabsTrigger>
          <TabsTrigger value="subtests">Subtest</TabsTrigger>
          <TabsTrigger value="explanations">Pembahasan</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Informasi Tryout</CardTitle>
              {!isTryoutPending && (
                <Dialog open={isEditTryoutOpen} onOpenChange={setIsEditTryoutOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <PencilIcon className="mr-2" />
                      Edit Info
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Informasi Tryout</DialogTitle>
                      <DialogDescription>Ubah judul atau deskripsi tryout</DialogDescription>
                    </DialogHeader>
                    <EditTryoutForm
                      tryout={tryout as TryoutType}
                      isPending={editTryoutMutation.isPending}
                      onEdit={(judul, deskripsi) => {
                        editTryoutMutation.mutate({ tryoutId: id, judul, deskripsi });
                      }}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {isTryoutPending ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Skeleton className="mb-1 h-4 w-16" />
                    <Skeleton className="h-6 w-48" />
                  </div>
                  <div>
                    <Skeleton className="mb-1 h-4 w-16" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Judul</label>
                    <p className="text-lg font-semibold">{(tryout as TryoutType)?.judul}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <p className="text-lg font-semibold">
                      <span
                        className={
                          isPublished
                            ? "rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
                            : tryoutStatus === "archived"
                              ? "rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                              : "rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700"
                        }
                      >
                        {isPublished ? "Dipublikasikan" : tryoutStatus === "archived" ? "Diarsipkan" : "Draft"}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Deskripsi</label>
                    <p className="text-lg font-semibold">{(tryout as TryoutType)?.deskripsi || "-"}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subtests Tab */}
        <TabsContent value="subtests" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Daftar Subtest</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <PlusIcon className="mr-2" />
                  Tambah Subtest
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Subtest Baru</DialogTitle>
                  <DialogDescription>Isi detail subtest untuk ditambahkan</DialogDescription>
                </DialogHeader>
                <AddSubtestForm onAdd={handleAddSubtest} isPending={createSubtesMutation.isPending} />
              </DialogContent>
            </Dialog>
          </div>

          {/* Subtest Cards with Soal Management */}
          {isSubtestsPending ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : subtests.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Belum ada subtest. Tambahkan yang pertama!
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {subtests.map((subtest: unknown) => (
                <SubtestCard key={(subtest as SubtestType).id} subtest={subtest} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Explanations Tab */}
        <TabsContent value="explanations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kelola Pembahasan Soal</CardTitle>
              <CardDescription>
                Tambahkan pembahasan untuk setiap soal dalam tryout ini (hanya untuk member premium)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {subtests.map((subtest: unknown) => (
                  <div key={(subtest as SubtestType).id} className="space-y-3">
                    <h4 className="text-sm font-semibold">{(subtest as SubtestType).namaSubtes}</h4>
                    <SubtestExplanationManager subtestId={(subtest as SubtestType).id} />
                  </div>
                ))}
                {subtests.length === 0 && (
                  <p className="text-sm text-muted-foreground">Tambahkan subtest terlebih dahulu</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminContainer>
  );
}

// --- Subtest Card with Soal Management ---
function SubtestCard({ subtest }: { subtest: unknown }) {
  const { id: tryoutId } = Route.useParams();
  const [showSoal, setShowSoal] = useState(false);
  const [detailSoalId, setDetailSoalId] = useState<string | null>(null);
  const [editSoalId, setEditSoalId] = useState<string | null>(null);
  const [isEditSubtestOpen, setIsEditSubtestOpen] = useState(false);
  const [selectedSoalIds, setSelectedSoalIds] = useState<string[]>([]);
  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [targetSubtesId, setTargetSubtesId] = useState("");
  const typedSubtest = subtest as SubtestType;

  const deleteSubtestMutation = useMutation(
    orpc.admin.tryout.delete.subtes.mutationOptions({
      onSuccess: () => {
        toast.success("Subtest berhasil dihapus");
        queryClient.invalidateQueries({
          queryKey: orpc.admin.tryout.list.subtes.queryKey({ input: { tryoutId } }),
        });
      },
      onError: (err) => {
        toast.error("Gagal menghapus subtest", {
          description: err.message,
        });
      },
    }),
  );

  const editSubtestMutation = useMutation(
    orpc.admin.tryout.update.subtes.mutationOptions({
      onSuccess: () => {
        toast.success("Subtest berhasil diperbarui");
        queryClient.invalidateQueries({
          queryKey: orpc.admin.tryout.list.subtes.queryKey({ input: { tryoutId } }),
        });
        setIsEditSubtestOpen(false);
      },
      onError: (err) => {
        toast.error("Gagal memperbarui subtest", {
          description: err.message,
        });
      },
    }),
  );

  const handleEditSubtest = (name: string, jumlahSoal: number, durasiMenit: number) => {
    editSubtestMutation.mutate({
      subtesId: typedSubtest.id,
      namaSubtes: name,
      jumlahSoal,
      durasiMenit,
    });
  };

  const { data: soalList = [], isPending: isSoalPending } = useQuery({
    ...orpc.admin.tryout.list.soal.queryOptions({ input: { subtesId: typedSubtest.id } }),
    enabled: showSoal,
  });

  const deleteSoalMutation = useMutation(
    orpc.admin.tryout.delete.soal.mutationOptions({
      onSuccess: (_data, variables) => {
        toast.success("Soal berhasil dihapus");
        setSelectedSoalIds((prev) => prev.filter((sid) => sid !== variables.soalId));
        queryClient.invalidateQueries({
          queryKey: orpc.admin.tryout.list.soal.queryKey({ input: { subtesId: typedSubtest.id } }),
        });
      },
      onError: (err) => {
        toast.error("Gagal menghapus soal", {
          description: err.message,
        });
      },
    }),
  );

  // --- Pindah banyak soal sekaligus ---
  const { data: allSubtes = [] } = useQuery({
    ...orpc.admin.tryout.list.subtes.queryOptions({ input: { tryoutId } }),
    enabled: showSoal,
  });

  const moveSoalBulkMutation = useMutation(
    orpc.admin.tryout.update.moveSoalBulk.mutationOptions({
      onSuccess: (data, variables) => {
        toast.success(`${data.count} soal berhasil dipindahkan`);
        queryClient.invalidateQueries({
          queryKey: orpc.admin.tryout.list.soal.queryKey({ input: { subtesId: typedSubtest.id } }),
        });
        queryClient.invalidateQueries({
          queryKey: orpc.admin.tryout.list.soal.queryKey({ input: { subtesId: variables.targetSubtesId } }),
        });
        setSelectedSoalIds([]);
        setTargetSubtesId("");
        setIsMoveOpen(false);
      },
      onError: (err) => {
        toast.error("Gagal memindahkan soal", { description: err.message });
      },
    }),
  );

  const soalIdsOnPage = (soalList as SoalType[]).map((s) => s.id);
  const isAllSelected = soalIdsOnPage.length > 0 && soalIdsOnPage.every((sid) => selectedSoalIds.includes(sid));

  const toggleSoal = (soalId: string, checked: boolean) => {
    setSelectedSoalIds((prev) => (checked ? [...prev, soalId] : prev.filter((sid) => sid !== soalId)));
  };

  const closeMoveDialog = () => {
    setIsMoveOpen(false);
    setTargetSubtesId("");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base">{typedSubtest.namaSubtes}</CardTitle>
          <CardDescription>
            {typedSubtest.jumlahSoal} soal · {typedSubtest.durasiMenit} menit
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowSoal(!showSoal)}>
            {showSoal ? "Sembunyikan Soal" : "Kelola Soal"}
          </Button>
          <Dialog open={isEditSubtestOpen} onOpenChange={setIsEditSubtestOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-blue-600">
                <PencilIcon />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Subtest</DialogTitle>
                <DialogDescription>Ubah detail subtest di bawah ini</DialogDescription>
              </DialogHeader>
              <EditSubtestForm
                subtest={typedSubtest}
                onEdit={handleEditSubtest}
                isPending={editSubtestMutation.isPending}
              />
            </DialogContent>
          </Dialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-red-600" disabled={deleteSubtestMutation.isPending}>
                <TrashIcon />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus Subtest?</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus subtest ini beserta semua soal di dalamnya? Tindakan ini tidak dapat
                  dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
                  onClick={() => deleteSubtestMutation.mutate({ subtesId: typedSubtest.id })}
                >
                  Ya, hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>

      {showSoal && (
        <CardContent className="border-t pt-4">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm font-semibold">Daftar Soal ({(soalList as SoalType[]).length})</h4>
            <AddSoalDialog subtesId={typedSubtest.id} />
          </div>

          {selectedSoalIds.length > 0 && (
            <div className="mb-3 flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2">
              <span className="text-sm font-medium">{selectedSoalIds.length} soal dipilih</span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelectedSoalIds([])}>
                  Batal pilih
                </Button>
                <Button size="sm" onClick={() => setIsMoveOpen(true)}>
                  Pindahkan ({selectedSoalIds.length})
                </Button>
              </div>
            </div>
          )}

          {isSoalPending ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (soalList as SoalType[]).length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Belum ada soal. Tambahkan yang pertama!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={(checked) => setSelectedSoalIds(checked ? soalIdsOnPage : [])}
                      aria-label="Pilih semua soal"
                    />
                  </TableHead>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Pertanyaan</TableHead>
                  <TableHead className="w-20">Tipe</TableHead>
                  <TableHead className="w-16">Poin</TableHead>
                  <TableHead className="w-24 text-center">Pilihan</TableHead>
                  <TableHead className="w-28 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(soalList as SoalType[]).map((soal: SoalType, idx: number) => (
                  <TableRow key={soal.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedSoalIds.includes(soal.id)}
                        onCheckedChange={(checked) => toggleSoal(soal.id, !!checked)}
                        aria-label={`Pilih soal ${idx + 1}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{idx + 1}</TableCell>
                    <TableCell className="max-w-xs truncate">{soal.pertanyaan}</TableCell>
                    <TableCell>
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-xs">{soal.tipe}</span>
                    </TableCell>
                    <TableCell>{soal.poin}</TableCell>
                    <TableCell className="text-center">{soal.pilihanJawaban?.length ?? 0} opsi</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDetailSoalId(soal.id)}
                          className="h-8 w-8 p-0"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditSoalId(soal.id)}
                          className="h-8 w-8 p-0 text-blue-600"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={deleteSoalMutation.isPending}
                              className="h-8 w-8 p-0 text-red-600"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Soal?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus soal ini? Tindakan ini tidak dapat dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
                                onClick={() => deleteSoalMutation.mutate({ soalId: soal.id })}
                              >
                                Ya, hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {detailSoalId && (
            <DetailSoalDialog
              soalId={detailSoalId}
              open={!!detailSoalId}
              onOpenChange={(open) => !open && setDetailSoalId(null)}
            />
          )}
          {editSoalId && (
            <EditSoalDialog
              subtesId={typedSubtest.id}
              soalId={editSoalId}
              open={!!editSoalId}
              onOpenChange={(open) => !open && setEditSoalId(null)}
            />
          )}

          <Dialog open={isMoveOpen} onOpenChange={(open) => !open && closeMoveDialog()}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Pindahkan {selectedSoalIds.length} Soal</DialogTitle>
                <DialogDescription>
                  Pilih subtes tujuan. Pilihan jawaban dan pembahasan ikut pindah.
                </DialogDescription>
              </DialogHeader>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={targetSubtesId}
                onChange={(e) => setTargetSubtesId(e.target.value)}
              >
                <option value="">Pilih subtes tujuan</option>
                {(allSubtes as SubtestType[])
                  .filter((s) => s.id !== typedSubtest.id)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.namaSubtes}
                    </option>
                  ))}
              </select>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={closeMoveDialog}>
                  Batal
                </Button>
                <Button
                  disabled={!targetSubtesId || selectedSoalIds.length === 0 || moveSoalBulkMutation.isPending}
                  onClick={() => moveSoalBulkMutation.mutate({ soalIds: selectedSoalIds, targetSubtesId })}
                >
                  {moveSoalBulkMutation.isPending ? "Memindahkan..." : "Pindahkan"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      )}
    </Card>
  );
}

// --- Add Subtest Form ---
function AddSubtestForm({
  onAdd,
  isPending,
}: {
  onAdd: (name: string, jumlahSoal: number, durasiMenit: number) => void;
  isPending: boolean;
}) {
  const [name, setName] = useState("");
  const [jumlahSoal, setJumlahSoal] = useState(10);
  const [durasiMenit, setDurasiMenit] = useState(15);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name, jumlahSoal, durasiMenit);
      setName("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Nama Subtest</Label>
        <Input placeholder="Penalaran Matematika" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Jumlah Soal</Label>
          <Input
            type="number"
            min={1}
            value={jumlahSoal}
            onChange={(e) => setJumlahSoal(Number(e.target.value))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Durasi (Menit)</Label>
          <Input
            type="number"
            min={1}
            value={durasiMenit}
            onChange={(e) => setDurasiMenit(Number(e.target.value))}
            required
          />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Menambahkan..." : "Tambah"}
      </Button>
    </form>
  );
}

// --- Edit Subtest Form ---
function EditSubtestForm({
  subtest,
  onEdit,
  isPending,
}: {
  subtest: SubtestType;
  onEdit: (name: string, jumlahSoal: number, durasiMenit: number) => void;
  isPending: boolean;
}) {
  const [name, setName] = useState(subtest.namaSubtes);
  const [jumlahSoal, setJumlahSoal] = useState(subtest.jumlahSoal);
  const [durasiMenit, setDurasiMenit] = useState(subtest.durasiMenit);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onEdit(name, jumlahSoal, durasiMenit);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Nama Subtest</Label>
        <Input placeholder="Penalaran Matematika" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Jumlah Soal</Label>
          <Input
            type="number"
            min={1}
            value={jumlahSoal}
            onChange={(e) => setJumlahSoal(Number(e.target.value))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Durasi (Menit)</Label>
          <Input
            type="number"
            min={1}
            value={durasiMenit}
            onChange={(e) => setDurasiMenit(Number(e.target.value))}
            required
          />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Menyimpan..." : "Simpan Perubahan"}
      </Button>
    </form>
  );
}

// --- Edit Tryout Form ---
function EditTryoutForm({
  tryout,
  onEdit,
  isPending,
}: {
  tryout: TryoutType;
  onEdit: (judul: string, deskripsi: string | null) => void;
  isPending: boolean;
}) {
  const [judul, setJudul] = useState(tryout.judul);
  const [deskripsi, setDeskripsi] = useState(tryout.deskripsi || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (judul.trim()) {
      onEdit(judul, deskripsi.trim() || null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Judul Tryout</Label>
        <Input
          placeholder="Contoh: Tryout UTBK 2026"
          value={judul}
          onChange={(e) => setJudul(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Deskripsi</Label>
        <Input placeholder="Opsional" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Menyimpan..." : "Simpan Perubahan"}
      </Button>
    </form>
  );
}