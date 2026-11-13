import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { orpc } from "@/utils/orpc";

export type ClassFormSubject = {
  id: number;
  name: string;
  shortName: string;
  description?: string | null;
  order?: number | null;
};

/** Form tambah/ubah kelas. Mode ubah memakai data kelas yang ada; mode tambah mulai dari kosong. */
export function ClassFormDialog({
  open,
  onOpenChange,
  subject,
  nextOrder,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject?: ClassFormSubject;
  nextOrder: number;
  onSaved?: (shortName: string) => void;
}) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(subject);
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(subject?.name ?? "");
    setShortName(subject?.shortName ?? "");
    setDescription(subject?.description ?? "");
  }, [open, subject]);

  const afterSave = async (message: string) => {
    toast.success(message);
    await queryClient.invalidateQueries({ queryKey: orpc.subtest.list.queryKey({ input: {} }) });
    onOpenChange(false);
    onSaved?.(shortName.trim().toUpperCase());
  };

  const createMutation = useMutation(
    orpc.admin.subtest.subtest.create.mutationOptions({
      onSuccess: (result) => afterSave(result.message),
      onError: (error) => toast.error("Gagal membuat kelas", { description: error.message }),
    }),
  );
  const updateMutation = useMutation(
    orpc.admin.subtest.subtest.update.mutationOptions({
      onSuccess: (result) => afterSave(result.message),
      onError: (error) => toast.error("Gagal memperbarui kelas", { description: error.message }),
    }),
  );

  const isPending = createMutation.isPending || updateMutation.isPending;
  const canSubmit = name.trim().length > 0 && shortName.trim().length > 0 && !isPending;

  // Kelas baru ditaruh paling akhir; saat diubah, urutannya tetap.
  const order = subject?.order ?? nextOrder;

  const submit = () => {
    if (!canSubmit) return;
    const payload = {
      name: name.trim(),
      shortName: shortName.trim().toUpperCase(),
      description: description.trim() || undefined,
      order,
    };
    if (subject) updateMutation.mutate({ id: subject.id, ...payload });
    else createMutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Kelas" : "Tambah Kelas"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perubahan langsung terlihat di halaman Kelas siswa."
              : "Kelas baru langsung muncul di halaman Kelas siswa setelah disimpan."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <label className="block space-y-1.5 text-sm font-semibold text-sr-ink">
            Nama kelas
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Contoh: Penalaran Matematika"
              autoFocus
            />
          </label>
          <label className="block space-y-1.5 text-sm font-semibold text-sr-ink">
            Singkatan
            <Input
              value={shortName}
              onChange={(event) => setShortName(event.target.value.toUpperCase())}
              placeholder="Contoh: PM"
              maxLength={8}
            />
            <span className="block text-xs font-normal text-sr-muted">
              Dipakai di alamat kelas dan harus unik.
              {isEdit && " Mengubahnya membuat alamat kelas yang lama tidak berlaku lagi."}
            </span>
          </label>
          <label className="block space-y-1.5 text-sm font-semibold text-sr-ink">
            Deskripsi <span className="font-normal text-sr-muted">(opsional)</span>
            <Input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Ringkasan singkat isi kelas"
            />
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {isPending ? "Menyimpan…" : "Simpan Kelas"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
