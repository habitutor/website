import { REPORT_REASONS, type ReportReason } from "@habitutor/shared/question-report";
import { FlagIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { orpc } from "@/utils/orpc";

/** Di bawah angka ini admin diingatkan: kalau soal tersisa kurang dari 5, Brain Gym tidak bisa dimulai. */
const LOW_STOCK = 30;

export function ReportSummary() {
  const { data } = useQuery(orpc.admin.question.reportSummary.queryOptions());
  if (!data) return null;
  const lowStock = data.available < LOW_STOCK;
  if (data.pending === 0 && !lowStock) return null;

  return (
    <div className="bg-sr-sun-50 mb-4 flex flex-col gap-2 rounded-sr-lg border border-sr-sun-200 p-4 text-sm text-sr-ink sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        {data.pending > 0 && (
          <p className="font-bold">
            {data.pending} soal menunggu dicek
            <span className="font-medium text-sr-muted"> · {data.held} sedang ditahan dari Brain Gym</span>
          </p>
        )}
        {lowStock && (
          <p className="flex items-center gap-1.5 font-semibold text-red-600">
            <WarningCircleIcon weight="fill" className="size-4" />
            Stok Brain Gym tinggal {data.available} soal. Di bawah 5 soal, siswa tidak bisa memulai.
          </p>
        )}
      </div>
      {data.pending > 0 && (
        <Button asChild size="sm" variant="outline">
          <Link to="/admin/questions" search={{ reported: "true" }}>
            Lihat soal dilaporkan
          </Link>
        </Button>
      )}
    </div>
  );
}

export function QuestionReports({ questionId, count, isHeld }: { questionId: number; count: number; isHeld: boolean }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data, isPending } = useQuery({
    ...orpc.admin.question.reports.queryOptions({ input: { id: questionId } }),
    enabled: open,
  });

  const resolve = useMutation(
    orpc.admin.question.resolveReports.mutationOptions({
      onSuccess: (_, input) => {
        toast.success(input.resolution === "fixed" ? "Ditandai sudah diperbaiki" : "Dimatikan dari Brain Gym");
        setOpen(false);
        queryClient.invalidateQueries({ queryKey: orpc.admin.question.key() });
      },
      onError: (error) => toast.error("Gagal menyelesaikan laporan", { description: error.message }),
    }),
  );

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-sr-line bg-red-50/60 px-6 py-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700">
          <FlagIcon weight="fill" className="size-3.5" />
          {count} laporan · {isHeld ? "Ditahan" : "Masih tampil"}
        </span>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          Lihat laporan
        </Button>
      </div>
      <Dialog open={open} onOpenChange={(next) => !resolve.isPending && setOpen(next)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Laporan soal #{questionId}</DialogTitle>
            <DialogDescription>
              Perbaiki soalnya dulu kalau perlu, lalu pilih tindakan. Pilihan ini menutup semua laporan terbuka.
            </DialogDescription>
          </DialogHeader>
          {isPending ? (
            <p className="text-sm text-sr-muted">Memuat…</p>
          ) : (
            <ul className="divide-y rounded-md border text-sm">
              {data?.map((report) => (
                <li key={report.id} className="space-y-0.5 px-3 py-2">
                  <p className="font-semibold text-sr-ink">
                    {REPORT_REASONS[report.reason as ReportReason] ?? report.reason}
                  </p>
                  {report.note && <p className="break-words text-sr-ink-2">“{report.note}”</p>}
                  <p className="text-xs break-words text-sr-muted">
                    {report.reporterName} ({report.reporterEmail}) ·{" "}
                    {new Date(report.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              className="flex-1"
              disabled={resolve.isPending}
              onClick={() => resolve.mutate({ id: questionId, resolution: "fixed" })}
            >
              Sudah diperbaiki
            </Button>
            <Button
              className="flex-1"
              variant="outline"
              disabled={resolve.isPending}
              onClick={() => resolve.mutate({ id: questionId, resolution: "disabled" })}
            >
              Matikan dari Brain Gym
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
