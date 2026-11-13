import type { ReactNode } from "react";
import { CheckCircleIcon, CopyIcon } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
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
import { orpc, queryClient } from "@/utils/orpc";

function apiErrorMessage(error: Error) {
  const data = (error as Error & { data?: { message?: unknown } }).data;
  return typeof data?.message === "string" ? data.message : error.message;
}

const POINTS = [
  "Semua subtest, soal, pilihan jawaban, pembahasan, dan gambar ikut disalin.",
  "Salinan berstatus Draft dan jadwalnya dikosongkan, jadi belum terlihat oleh siswa.",
  "Try Out asli beserta nilai dan peringkat siswa tidak berubah sama sekali.",
  "Di salinan, Anda bebas menambah, mengimpor, mengedit, atau menghapus soal, lalu publish saat siap.",
];

export function DuplicateTryoutDialog({
  tryoutId,
  judul,
  children,
  onDone,
}: {
  tryoutId: string;
  judul: string;
  /** Tombol pemicu dialog */
  children: ReactNode;
  /** Dipanggil setelah salinan berhasil dibuat, sebelum pindah halaman (mis. untuk menutup dialog lain). */
  onDone?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const duplicateMutation = useMutation(
    orpc.admin.tryout.duplicate.mutationOptions({
      onSuccess: (data) => {
        toast.success("Salinan Try Out berhasil dibuat", {
          description: `${data.subtesCount} subtest dan ${data.soalCount} soal disalin ke "${data.judul}".`,
        });
        queryClient.invalidateQueries({ queryKey: orpc.admin.tryout.list.tryout.key() });
        setOpen(false);
        onDone?.();
        navigate({ to: "/admin/tryout/$id", params: { id: data.id } });
      },
      onError: (err) => {
        toast.error("Gagal menduplikat Try Out", { description: apiErrorMessage(err) });
      },
    }),
  );

  return (
    <AlertDialog open={open} onOpenChange={(next) => !duplicateMutation.isPending && setOpen(next)}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <CopyIcon weight="bold" className="text-sr-blue-600" /> Duplikat Try Out?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Salinan baru akan dibuat dengan judul <strong className="text-sr-ink">"{judul} (Salinan)"</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <ul className="space-y-2 rounded-lg bg-muted/40 p-3 text-sm">
          {POINTS.map((point) => (
            <li key={point} className="flex gap-2">
              <CheckCircleIcon weight="fill" className="mt-0.5 shrink-0 text-emerald-600" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={duplicateMutation.isPending}>Batal</AlertDialogCancel>
          <AlertDialogAction
            disabled={duplicateMutation.isPending}
            onClick={(e) => {
              e.preventDefault();
              duplicateMutation.mutate({ tryoutId });
            }}
          >
            {duplicateMutation.isPending ? "Menyalin..." : "Ya, buat salinan"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
