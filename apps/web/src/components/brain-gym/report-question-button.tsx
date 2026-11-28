import { REPORT_NOTE_MAX, REPORT_REASONS, type ReportReason } from "@habitutor/shared/question-report";
import { FlagIcon } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { orpc } from "@/utils/orpc";

export function ReportQuestionButton({
  questionId,
  disabled,
  onReported,
}: {
  questionId: number;
  disabled?: boolean;
  /** skipped = soal dikeluarkan dari sesi dan tidak dihitung dalam skor. */
  onReported?: (result: { skipped: boolean }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [note, setNote] = useState("");

  const report = useMutation(
    orpc.flashcard.report.mutationOptions({
      onSuccess: (result) => {
        toast.success(
          result.skipped
            ? "Laporan terkirim. Soal ini dilewati dan tidak dihitung."
            : "Laporan terkirim. Terima kasih sudah memberi tahu.",
        );
        setOpen(false);
        setReason(null);
        setNote("");
        onReported?.(result);
      },
      onError: (error) => toast.error(error.message),
    }),
  );

  return (
    <Dialog open={open} onOpenChange={(next) => !report.isPending && setOpen(next)}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" disabled={disabled} className="gap-1.5 text-xs text-sr-muted">
          <FlagIcon weight="bold" className="size-3.5" />
          Laporkan soal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Laporkan soal</DialogTitle>
          <DialogDescription>
            Kenapa soal ini bermasalah? Soal yang belum kamu jawab bisa dilewati, maksimal satu per sesi.
          </DialogDescription>
        </DialogHeader>
        <fieldset className="space-y-2" disabled={report.isPending}>
          <legend className="sr-only">Alasan laporan</legend>
          {(Object.entries(REPORT_REASONS) as Array<[ReportReason, string]>).map(([value, label]) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-3 rounded-sr-md border border-sr-line p-3 text-sm font-semibold text-sr-ink has-checked:border-sr-blue-500 has-checked:bg-sr-blue-50"
            >
              <input
                type="radio"
                name={`report-${questionId}`}
                className="size-4"
                checked={reason === value}
                onChange={() => setReason(value)}
              />
              {label}
            </label>
          ))}
        </fieldset>
        <Textarea
          aria-label="Keterangan tambahan"
          placeholder="Keterangan tambahan (opsional)"
          maxLength={REPORT_NOTE_MAX}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          disabled={report.isPending}
        />
        <Button
          disabled={!reason || report.isPending}
          onClick={() => reason && report.mutate({ questionId, reason, note })}
        >
          {report.isPending ? "Mengirim…" : "Kirim laporan"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
