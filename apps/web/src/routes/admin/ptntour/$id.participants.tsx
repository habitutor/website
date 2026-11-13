import { toast } from "sonner";
import { CheckCircleIcon, DownloadSimpleIcon, UsersThreeIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { AdminSearchInput, FilterChips, usePagedList } from "@/components/admin/list-tools";
import { AdminPagination } from "@/components/admin/pagination";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CountUp } from "@/routes/-home/motion-bits";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";
import { toWibInput } from "./-components/event-form";

export const Route = createFileRoute("/admin/ptntour/$id/participants")({ component: ParticipantsPage });

type Access = "all" | "share" | "premium" | "paid";
const ACCESS_FILTERS: ReadonlyArray<{ value: Access; label: string }> = [
  { value: "all", label: "Semua" },
  { value: "share", label: "Share" },
  { value: "premium", label: "Premium" },
  { value: "paid", label: "Bayar" },
];
const ACCESS_LABEL: Record<string, string> = { share: "Share poster", premium: "Premium", paid: "Bayar Rp10.000" };

const matchesParticipant = (
  row: { name: string; email: string; schoolName: string | null; dreamCampus: string | null },
  query: string,
) => `${row.name} ${row.email} ${row.schoolName ?? ""} ${row.dreamCampus ?? ""}`.toLowerCase().includes(query);

const csvCell = (value: unknown) => {
  const text = String(value ?? "");
  // Cegah rumus spreadsheet dari data isian pengguna, lalu escape tanda kutip/koma/baris baru.
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return /[",\n]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe;
};

const formatStamp = (date: Date | null) => (date ? `${toWibInput(date).replace("T", " ")} WIB` : "");

function ParticipantsPage() {
  const { id } = Route.useParams();
  const eventId = Number(id);
  const { data, isPending } = useQuery(orpc.ptnTour.admin.participants.queryOptions({ input: { eventId } }));
  const { data: event } = useQuery(orpc.ptnTour.admin.get.queryOptions({ input: { id: eventId } }));
  const [access, setAccess] = useState<Access>("all");
  const [proofsFor, setProofsFor] = useState<{ id: number; name: string } | null>(null);

  const byAccess = useMemo(
    () => data?.participants.filter((row) => access === "all" || row.accessMethod === access),
    [data, access],
  );
  const list = usePagedList(byAccess, { pageSize: 15, matches: matchesParticipant });
  const attendRate = data && data.total > 0 ? Math.round((data.attended / data.total) * 100) : 0;

  const buildTable = () => {
    if (!data) return null;
    const headers = [
      "Nama",
      "Email",
      "WhatsApp",
      "Sekolah",
      "Kelas",
      "Target PTN",
      "Cara akses",
      "Jumlah bukti",
      "Beli paket setelahnya",
      "Terdaftar",
      "Hadir",
    ];
    const rows = data.participants.map((item) => [
      item.name,
      item.email,
      item.phoneNumber,
      item.schoolName,
      item.classLevel,
      item.dreamCampus,
      ACCESS_LABEL[item.accessMethod] ?? item.accessMethod,
      item.proofCount,
      item.purchasedAfter ? "Ya" : "Tidak",
      formatStamp(item.registeredAt),
      item.attendedAt ? formatStamp(item.attendedAt) : "Tidak",
    ]);
    return { headers, rows };
  };

  const queryClient = useQueryClient();
  const logExport = useMutation(
    orpc.ptnTour.admin.exports.log.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.ptnTour.admin.exports.key() }),
    }),
  );
  const { data: exportLog } = useQuery(orpc.ptnTour.admin.exports.list.queryOptions({ input: { eventId } }));

  const download = () => {
    const table = buildTable();
    if (!table) return;
    const { headers, rows } = table;
    logExport.mutate({ eventId, format: "csv", rowCount: rows.length });
    // BOM supaya Excel membaca UTF-8 dengan benar.
    const blob = new Blob([`﻿${[headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")}`], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `peserta-${event?.slug ?? eventId}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  /** Tab-separated supaya langsung rapi per kolom saat ditempel di Google Sheets. */
  const copyForSheets = async () => {
    const table = buildTable();
    if (!table) return;
    logExport.mutate({ eventId, format: "sheets", rowCount: table.rows.length });
    const cell = (value: unknown) => String(value ?? "").replace(/[\t\r\n]+/g, " ");
    const text = [table.headers, ...table.rows]
      .map((row) => row.map(cell).map((v) => (/^[=+\-@]/.test(v) ? `'${v}` : v)).join("\t"))
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Tabel disalin. Tempel (Ctrl+V) di Google Sheets.");
    } catch {
      toast.error("Gagal menyalin. Coba Ekspor CSV.");
    }
  };

  return (
    <AdminContainer>
      <AdminHeader title="Peserta Event" description={event?.title ?? `Event #${eventId}`} backTo="/admin/ptntour">
        <Button variant="outline" onClick={copyForSheets} disabled={!data || data.total === 0}>
          Salin untuk Google Sheets
        </Button>
        <Button onClick={download} disabled={!data || data.total === 0}>
          <DownloadSimpleIcon /> Ekspor CSV
        </Button>
      </AdminHeader>

      {exportLog && exportLog.length > 0 && (
        <p className="mb-4 rounded-sr-md border border-sr-line bg-white px-4 py-2.5 text-xs text-sr-muted shadow-sr-1">
          <span className="font-bold text-sr-ink-2">Riwayat ekspor data:</span>{" "}
          {exportLog
            .map((log) => `${log.adminName ?? "Admin"} · ${log.format === "csv" ? "CSV" : "Sheets"} · ${formatStamp(log.createdAt)}`)
            .join("  |  ")}
        </p>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          icon={<UsersThreeIcon weight="fill" />}
          label="Terdaftar"
          value={data?.total}
          hint={event?.quota ? `dari kuota ${event.quota}` : "tanpa batas kuota"}
          pending={isPending}
        />
        <Stat
          icon={<CheckCircleIcon weight="fill" />}
          label="Hadir (klik Join)"
          value={data?.attended}
          hint={`${attendRate}% dari terdaftar`}
          pending={isPending}
        />
        <Stat label="Akun Premium" value={data?.premium} hint="Join tanpa daftar" pending={isPending} />
        <Stat
          label="Beli paket setelahnya"
          value={data?.purchased}
          hint="Premium dibeli setelah event mulai"
          pending={isPending}
        />
      </div>

      <div className="mb-4 flex flex-col gap-3 rounded-sr-xl border border-sr-line bg-sr-ivory/60 p-3 shadow-sr-1 sm:flex-row sm:items-center">
        <AdminSearchInput
          className="flex-1"
          value={list.query}
          onChange={list.setQuery}
          placeholder="Cari nama, email, sekolah, atau target PTN…"
        />
        <FilterChips label="Cara akses" value={access} onChange={setAccess} options={ACCESS_FILTERS} />
      </div>

      <div className="overflow-hidden rounded-sr-xl border border-sr-line bg-white shadow-sr-1">
        <div className="overflow-x-auto">
          <Table className="min-w-[860px]">
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Peserta</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Sekolah</TableHead>
                <TableHead>Target PTN</TableHead>
                <TableHead>Cara akses</TableHead>
                <TableHead>Hadir</TableHead>
                <TableHead>Bukti</TableHead>
                <TableHead>Beli paket</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Skeleton className="h-12 w-full" />
                  </TableCell>
                </TableRow>
              )}
              {!isPending && list.pageItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-14 text-center text-sm text-sr-muted">
                    {data?.total ? "Tidak ada peserta yang cocok." : "Belum ada peserta yang mendaftar."}
                  </TableCell>
                </TableRow>
              )}
              {list.pageItems.map((row, index) => (
                <TableRow key={row.id} className="group animate-sr-rise" style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}>
                  <TableCell className="px-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sr-blue-50 text-sm font-black text-sr-blue-700 ring-1 ring-sr-blue-100 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                        {row.name.trim().charAt(0).toUpperCase() || "?"}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-sr-ink">{row.name}</p>
                        <p className="truncate text-xs text-sr-muted">{row.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-sr-ink">{row.phoneNumber ?? "-"}</TableCell>
                  <TableCell className="text-sm text-sr-ink">
                    {row.schoolName ?? "-"}
                    {row.classLevel && <span className="block text-xs text-sr-muted">{row.classLevel}</span>}
                  </TableCell>
                  <TableCell className="text-sm text-sr-ink">{row.dreamCampus ?? "-"}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-bold",
                        row.accessMethod === "premium"
                          ? "bg-sr-sun-100 text-sr-amber-700"
                          : "bg-sr-blue-50 text-sr-blue-700",
                      )}
                    >
                      {ACCESS_LABEL[row.accessMethod] ?? row.accessMethod}
                    </span>
                  </TableCell>
                  <TableCell>
                    {row.attendedAt ? (
                      <span className="inline-flex items-center gap-1 text-sm font-bold text-sr-live">
                        <CheckCircleIcon weight="fill" /> Ya
                      </span>
                    ) : (
                      <span className="text-sm text-sr-muted">Belum</span>
                    )}
                  </TableCell>

                  <TableCell>
                    {row.proofCount > 0 ? (
                      <button
                        type="button"
                        onClick={() => setProofsFor({ id: row.id, name: row.name })}
                        className="text-sm font-bold text-sr-blue-600 hover:underline"
                      >
                        {row.proofCount} gambar
                      </button>
                    ) : (
                      <span className="text-sm text-sr-muted">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {row.purchasedAfter ? (
                      <span className="inline-flex rounded-full bg-sr-sun-100 px-2.5 py-1 text-xs font-bold text-sr-amber-700">
                        Premium
                      </span>
                    ) : (
                      <span className="text-sm text-sr-muted">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {list.total > 0 && (
        <AdminPagination
          className="mt-5"
          label="Peserta"
          page={list.page}
          total={list.total}
          pageSize={list.pageSize}
          onPageChange={list.setPage}
        />
      )}
      <ProofsDialog target={proofsFor} onClose={() => setProofsFor(null)} />
    </AdminContainer>
  );
}

function ProofsDialog({ target, onClose }: { target: { id: number; name: string } | null; onClose: () => void }) {
  const { data, isPending } = useQuery({
    ...orpc.ptnTour.admin.proofs.queryOptions({ input: { registrationId: target?.id ?? 0 } }),
    enabled: target !== null,
  });
  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bukti dari {target?.name}</DialogTitle>
          <DialogDescription>
            Hanya pengingat syarat, tidak diverifikasi. Gambar dihapus otomatis setelah 60 hari.
          </DialogDescription>
        </DialogHeader>
        {isPending ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {data?.map((proof) => (
              <a
                key={proof.id}
                href={proof.url}
                target="_blank"
                rel="noreferrer"
                className="group block overflow-hidden rounded-sr-md border border-sr-line"
              >
                <img
                  src={proof.url}
                  alt={`Bukti ${proof.kind}`}
                  className="aspect-3/4 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="block bg-sr-ivory px-2 py-1 text-xs font-bold text-sr-muted capitalize">
                  {proof.kind === "follow" ? "Follow" : "Share poster"}
                </span>
              </a>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Stat({
  icon,
  label,
  value,
  hint,
  pending,
}: {
  icon?: React.ReactNode;
  label: string;
  value?: number;
  hint?: string;
  pending: boolean;
}) {
  return (
    <div className="animate-sr-rise rounded-sr-lg border border-sr-line bg-white p-4 shadow-sr-1 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sr-2">
      <div className="flex items-center justify-between text-sm font-bold text-sr-muted">
        {label}
        {icon && <span className="text-sr-blue-500 [&>svg]:size-5">{icon}</span>}
      </div>
      {pending ? (
        <Skeleton className="mt-2 h-8 w-16" />
      ) : (
        <p className="mt-1 text-3xl font-black text-sr-ink">
          <CountUp to={value ?? 0} />
        </p>
      )}
      {hint && <p className="mt-0.5 text-xs text-sr-muted">{hint}</p>}
    </div>
  );
}
