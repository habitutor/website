import { PlusIcon, PencilIcon, TrashIcon, CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { orpc, queryClient } from "@/utils/orpc";
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

export const Route = createFileRoute("/admin/tryout/passing-grade")({
  component: PassingGradePage,
});

type ProgramStudiType = { id: number; nama: string; passedGrade: number; univId: number };
type UniversitasType = { id: number; namaUniv: string; rankUniv: number; programStudi: ProgramStudiType[] };

function PassingGradePage() {
  const [isCreateUnivOpen, setIsCreateUnivOpen] = useState(false);

  const { data: universitasList = [], isPending } = useQuery(
    orpc.admin.universitas.universitas.list.queryOptions({ input: {} }),
  );

  return (
    <AdminContainer>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <AdminHeader title="Kelola Passing Grade" description="Manajemen data Universitas dan Program Studi" />
          <Dialog open={isCreateUnivOpen} onOpenChange={setIsCreateUnivOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <PlusIcon className="mr-2" />
                Tambah Universitas
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Universitas</DialogTitle>
                <DialogDescription>Masukkan nama dan peringkat universitas baru.</DialogDescription>
              </DialogHeader>
              <UniversitasForm onSuccess={() => setIsCreateUnivOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {isPending ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="mb-2 h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
              </Card>
            ))
          ) : (universitasList as UniversitasType[]).length === 0 ? (
            <div className="rounded-lg border bg-white p-8 text-center text-muted-foreground">
              Belum ada data universitas. Tambahkan yang pertama!
            </div>
          ) : (
            (universitasList as UniversitasType[]).map((univ) => <UniversitasCard key={univ.id} universitas={univ} />)
          )}
        </div>
      </div>
    </AdminContainer>
  );
}

function UniversitasCard({ universitas }: { universitas: UniversitasType }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteUnivId, setDeleteUnivId] = useState<number | null>(null);

  const [isAddProdiOpen, setIsAddProdiOpen] = useState(false);
  const [editProdi, setEditProdi] = useState<ProgramStudiType | null>(null);
  const [deleteProdiId, setDeleteProdiId] = useState<number | null>(null);

  const deleteUnivMutation = useMutation(
    orpc.admin.universitas.universitas.remove.mutationOptions({
      onSuccess: () => {
        toast.success("Universitas berhasil dihapus");
        setDeleteUnivId(null);
        queryClient.invalidateQueries({
          queryKey: orpc.admin.universitas.universitas.list.queryKey({ input: {} }),
        });
      },
      onError: (err) => toast.error("Gagal menghapus universitas", { description: err.message }),
    }),
  );

  const deleteProdiMutation = useMutation(
    orpc.admin.universitas.programStudi.remove.mutationOptions({
      onSuccess: () => {
        toast.success("Program studi berhasil dihapus");
        setDeleteProdiId(null);
        queryClient.invalidateQueries({
          queryKey: orpc.admin.universitas.universitas.list.queryKey({ input: {} }),
        });
      },
      onError: (err) => toast.error("Gagal menghapus program studi", { description: err.message }),
    }),
  );

  return (
    <Card className="overflow-hidden transition-all">
      <CardHeader
        className="flex cursor-pointer flex-row items-center justify-between bg-gray-50 py-4 select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="text-primary-700 rounded bg-primary/10 px-2 py-0.5 text-sm font-bold">
              #{universitas.rankUniv}
            </span>
            {universitas.namaUniv}
          </CardTitle>
          <CardDescription className="mt-1">{universitas.programStudi.length} Program Studi</CardDescription>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-50 hover:text-blue-700">
                <PencilIcon />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Universitas</DialogTitle>
                <DialogDescription>Ubah nama atau peringkat universitas.</DialogDescription>
              </DialogHeader>
              <UniversitasForm universitas={universitas} onSuccess={() => setIsEditOpen(false)} />
            </DialogContent>
          </Dialog>

          <Button
            variant="ghost"
            size="icon"
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => setDeleteUnivId(universitas.id)}
          >
            <TrashIcon />
          </Button>

          <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <CaretUpIcon /> : <CaretDownIcon />}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="border-t pt-4">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-700">Daftar Program Studi</h4>
            <Dialog open={isAddProdiOpen} onOpenChange={setIsAddProdiOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <PlusIcon className="mr-2" /> Tambah Prodi
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Program Studi</DialogTitle>
                  <DialogDescription>Tambahkan jurusan baru untuk {universitas.namaUniv}</DialogDescription>
                </DialogHeader>
                <ProgramStudiForm univId={universitas.id} onSuccess={() => setIsAddProdiOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          {universitas.programStudi.length === 0 ? (
            <p className="rounded border bg-gray-50/50 py-4 text-center text-sm text-muted-foreground">
              Belum ada program studi. Tambahkan yang pertama!
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead>Nama Program Studi</TableHead>
                    <TableHead className="w-32 text-center">Passing Grade</TableHead>
                    <TableHead className="w-24 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...universitas.programStudi]
                    .sort((a, b) => b.passedGrade - a.passedGrade)
                    .map((prodi) => (
                      <TableRow key={prodi.id}>
                        <TableCell className="font-medium">{prodi.nama}</TableCell>
                        <TableCell className="text-primary-700 text-center font-semibold">
                          {prodi.passedGrade}
                        </TableCell>
                        <TableCell className="space-x-1 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600"
                            onClick={() => setEditProdi(prodi)}
                          >
                            <PencilIcon />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600"
                            onClick={() => setDeleteProdiId(prodi.id)}
                          >
                            <TrashIcon />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      )}

      {/* Dialogs for Prodi Edit/Delete */}
      {editProdi && (
        <Dialog open={!!editProdi} onOpenChange={(open) => !open && setEditProdi(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Program Studi</DialogTitle>
              <DialogDescription>Ubah detail program studi.</DialogDescription>
            </DialogHeader>
            <ProgramStudiForm univId={universitas.id} prodi={editProdi} onSuccess={() => setEditProdi(null)} />
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={!!deleteUnivId} onOpenChange={(open) => !open && setDeleteUnivId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Universitas?</AlertDialogTitle>
            <AlertDialogDescription>
              Semua program studi di bawah universitas ini juga akan dihapus. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUnivId && deleteUnivMutation.mutate({ id: deleteUnivId.toString() })}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteUnivMutation.isPending}
            >
              {deleteUnivMutation.isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteProdiId} onOpenChange={(open) => !open && setDeleteProdiId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Program Studi?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProdiId && deleteProdiMutation.mutate({ id: deleteProdiId.toString() })}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteProdiMutation.isPending}
            >
              {deleteProdiMutation.isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

function UniversitasForm({ universitas, onSuccess }: { universitas?: UniversitasType; onSuccess: () => void }) {
  const [namaUniv, setNamaUniv] = useState(universitas?.namaUniv || "");
  const [rankUniv, setRankUniv] = useState<number | "">(universitas?.rankUniv || "");

  const createMutation = useMutation(
    orpc.admin.universitas.universitas.create.mutationOptions({
      onSuccess: () => {
        toast.success("Universitas ditambahkan!");
        queryClient.invalidateQueries({
          queryKey: orpc.admin.universitas.universitas.list.queryKey({ input: {} }),
        });
        onSuccess();
      },
      onError: (err) => toast.error("Gagal menambahkan", { description: err.message }),
    }),
  );

  const updateMutation = useMutation(
    orpc.admin.universitas.universitas.update.mutationOptions({
      onSuccess: () => {
        toast.success("Universitas diperbarui!");
        queryClient.invalidateQueries({
          queryKey: orpc.admin.universitas.universitas.list.queryKey({ input: {} }),
        });
        onSuccess();
      },
      onError: (err) => toast.error("Gagal memperbarui", { description: err.message }),
    }),
  );

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaUniv.trim() || rankUniv === "") return;

    if (universitas) {
      updateMutation.mutate({ id: universitas.id.toString(), namaUniv, rankUniv: Number(rankUniv) });
    } else {
      createMutation.mutate({ namaUniv, rankUniv: Number(rankUniv) });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Nama Universitas</Label>
        <Input
          value={namaUniv}
          onChange={(e) => setNamaUniv(e.target.value)}
          placeholder="Contoh: Universitas Indonesia"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Peringkat (Rank)</Label>
        <Input
          type="number"
          min={1}
          value={rankUniv}
          onChange={(e) => setRankUniv(e.target.value ? Number(e.target.value) : "")}
          placeholder="Contoh: 1"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Menyimpan..." : "Simpan"}
      </Button>
    </form>
  );
}

function ProgramStudiForm({
  univId,
  prodi,
  onSuccess,
}: {
  univId: number;
  prodi?: ProgramStudiType;
  onSuccess: () => void;
}) {
  const [nama, setNama] = useState(prodi?.nama || "");
  const [passedGrade, setPassedGrade] = useState<number | "">(prodi?.passedGrade ?? "");

  const createMutation = useMutation(
    orpc.admin.universitas.programStudi.create.mutationOptions({
      onSuccess: () => {
        toast.success("Program studi ditambahkan!");
        queryClient.invalidateQueries({
          queryKey: orpc.admin.universitas.universitas.list.queryKey({ input: {} }),
        });
        onSuccess();
      },
      onError: (err) => toast.error("Gagal menambahkan", { description: err.message }),
    }),
  );

  const updateMutation = useMutation(
    orpc.admin.universitas.programStudi.update.mutationOptions({
      onSuccess: () => {
        toast.success("Program studi diperbarui!");
        queryClient.invalidateQueries({
          queryKey: orpc.admin.universitas.universitas.list.queryKey({ input: {} }),
        });
        onSuccess();
      },
      onError: (err) => toast.error("Gagal memperbarui", { description: err.message }),
    }),
  );

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || passedGrade === "") return;

    if (prodi) {
      updateMutation.mutate({ id: prodi.id.toString(), nama, passedGrade: Number(passedGrade) });
    } else {
      createMutation.mutate({ univId, nama, passedGrade: Number(passedGrade) });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Nama Program Studi</Label>
        <Input
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Contoh: Teknik Informatika"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Passing Grade</Label>
        <Input
          type="number"
          min={0}
          value={passedGrade}
          onChange={(e) => setPassedGrade(e.target.value ? Number(e.target.value) : "")}
          placeholder="Contoh: 750"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Menyimpan..." : "Simpan"}
      </Button>
    </form>
  );
}
