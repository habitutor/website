import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatRupiah, formatWibDate } from "@/lib/premium-packages";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/affiliate")({
  component: RouteComponent,
});

type PayoutStatus = "requested" | "paid" | "rejected";

const STATUS_TABS: { value: PayoutStatus; label: string }[] = [
  { value: "requested", label: "Perlu ditransfer" },
  { value: "paid", label: "Sudah dibayar" },
  { value: "rejected", label: "Ditolak" },
];

function RouteComponent() {
  const [status, setStatus] = useState<PayoutStatus>("requested");
  const { data: summary, isPending: summaryPending } = useQuery(orpc.admin.affiliate.summary.queryOptions());
  const { data: payouts, isPending: payoutsPending } = useQuery(
    orpc.admin.affiliate.payouts.queryOptions({ input: { status } }),
  );
  const { data: affiliates, isPending: affiliatesPending } = useQuery(orpc.admin.affiliate.affiliates.queryOptions());
  const [action, setAction] = useState<{ kind: "paid" | "reject"; id: string; name: string; amount: number } | null>(
    null,
  );

  return (
    <AdminContainer>
      <AdminHeader
        title="Afiliasi"
        description="Pantau program ajak teman, proses pencairan komisi, dan lihat siapa afiliator terbaik."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Afiliator aktif" value={summary?.affiliates} pending={summaryPending} />
        <Stat label="Teman daftar" value={summary?.signups} pending={summaryPending} />
        <Stat label="Pembelian lewat afiliasi" value={summary?.buyers} pending={summaryPending} />
        <Stat
          label="Omzet dari afiliasi"
          value={summary ? formatRupiah(summary.revenue) : undefined}
          pending={summaryPending}
        />
        <Stat
          label="Total komisi"
          value={summary ? formatRupiah(summary.commissions) : undefined}
          pending={summaryPending}
        />
        <Stat
          label="Menunggu ditransfer"
          value={summary ? formatRupiah(summary.requested) : undefined}
          hint={summary ? `${summary.requestedCount} permintaan` : undefined}
          highlight={Boolean(summary?.requestedCount)}
          pending={summaryPending}
        />
        <Stat label="Sudah dibayar" value={summary ? formatRupiah(summary.paid) : undefined} pending={summaryPending} />
      </div>

      <section className="mb-6 rounded-sr-xl border border-sr-line bg-white p-5 shadow-sr-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-black text-sr-ink">Pencairan komisi</h2>
          <div className="flex gap-1.5">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatus(tab.value)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors",
                  status === tab.value ? "bg-sr-blue-500 text-white" : "bg-sr-ivory text-sr-ink-2 hover:bg-sr-blue-50",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Afiliator</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Rekening tujuan</TableHead>
                <TableHead>Diajukan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payoutsPending ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ) : payouts?.length ? (
                payouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell>
                      <p className="font-bold text-sr-ink">{payout.userName}</p>
                      <p className="text-xs text-sr-muted">{payout.userEmail}</p>
                    </TableCell>
                    <TableCell className="font-black text-sr-ink">{formatRupiah(payout.amount)}</TableCell>
                    <TableCell className="text-sm">
                      <p className="font-bold text-sr-ink">
                        {payout.bankName} · {payout.accountNumber}
                      </p>
                      <p className="text-xs text-sr-muted">a.n. {payout.accountName}</p>
                    </TableCell>
                    <TableCell className="text-sm text-sr-muted">
                      {formatWibDate(payout.requestedAt)}
                      {payout.reference && <p className="text-xs">Ref {payout.reference}</p>}
                      {payout.note && <p className="text-xs">{payout.note}</p>}
                    </TableCell>
                    <TableCell className="text-right">
                      {payout.status === "requested" && (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              setAction({ kind: "paid", id: payout.id, name: payout.userName, amount: payout.amount })
                            }
                          >
                            Sudah ditransfer
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setAction({ kind: "reject", id: payout.id, name: payout.userName, amount: payout.amount })
                            }
                          >
                            Tolak
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-sr-muted">
                    Tidak ada permintaan di status ini.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="rounded-sr-xl border border-sr-line bg-white p-5 shadow-sr-1">
        <h2 className="font-black text-sr-ink">Afiliator</h2>
        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Kode</TableHead>
                <TableHead>Teman daftar</TableHead>
                <TableHead>Teman beli</TableHead>
                <TableHead>Total komisi</TableHead>
                <TableHead>Sudah dibayar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {affiliatesPending ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ) : affiliates?.length ? (
                affiliates.map((row) => (
                  <TableRow key={row.userId}>
                    <TableCell>
                      <p className="font-bold text-sr-ink">{row.name}</p>
                      <p className="text-xs text-sr-muted">{row.email}</p>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{row.code}</TableCell>
                    <TableCell>{row.signups}</TableCell>
                    <TableCell>{row.buyers}</TableCell>
                    <TableCell className="font-bold">{formatRupiah(row.earned)}</TableCell>
                    <TableCell>{formatRupiah(row.paid)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-sr-muted">
                    Belum ada afiliator yang membawa teman.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <ProcessDialog action={action} onClose={() => setAction(null)} />
    </AdminContainer>
  );
}

function Stat({
  label,
  value,
  hint,
  highlight,
  pending,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  highlight?: boolean;
  pending?: boolean;
}) {
  return (
    <div className={cn("rounded-sr-lg border p-4 shadow-sr-1", highlight ? "border-sr-sun-300 bg-sr-sun-100" : "border-sr-line bg-white")}>
      <p className="text-xs font-bold text-sr-muted">{label}</p>
      {pending ? <Skeleton className="mt-2 h-7 w-20" /> : <p className="mt-1 text-xl font-black text-sr-ink">{value ?? 0}</p>}
      {hint && <p className="mt-0.5 text-[11px] text-sr-muted">{hint}</p>}
    </div>
  );
}

function ProcessDialog({
  action,
  onClose,
}: {
  action: { kind: "paid" | "reject"; id: string; name: string; amount: number } | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const done = async (message: string) => {
    await queryClient.invalidateQueries({ queryKey: orpc.admin.affiliate.key() });
    setText("");
    onClose();
    toast.success(message);
  };
  const paid = useMutation(
    orpc.admin.affiliate.markPaid.mutationOptions({
      onSuccess: () => done("Ditandai sudah ditransfer. Afiliator diberi tahu."),
      onError: (error) => toast.error("Gagal memproses", { description: error.message }),
    }),
  );
  const reject = useMutation(
    orpc.admin.affiliate.reject.mutationOptions({
      onSuccess: () => done("Permintaan ditolak. Saldo afiliator dikembalikan."),
      onError: (error) => toast.error("Gagal memproses", { description: error.message }),
    }),
  );
  const isPaid = action?.kind === "paid";
  const pending = paid.isPending || reject.isPending;

  return (
    <Dialog open={action !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isPaid ? "Tandai sudah ditransfer" : "Tolak pencairan"}</DialogTitle>
          <DialogDescription>
            {action?.name} · {action ? formatRupiah(action.amount) : ""}
            {isPaid ? ". Transfer manual dulu ke rekening tujuan, lalu isi nomor referensinya." : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-1.5">
          <Label htmlFor="aff-text">{isPaid ? "Nomor referensi transfer" : "Alasan penolakan"}</Label>
          <Input id="aff-text" value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <Button
          disabled={!text.trim() || pending}
          onClick={() =>
            action &&
            (isPaid
              ? paid.mutate({ id: action.id, reference: text })
              : reject.mutate({ id: action.id, note: text }))
          }
        >
          {pending ? "Memproses…" : isPaid ? "Konfirmasi sudah ditransfer" : "Tolak permintaan"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
