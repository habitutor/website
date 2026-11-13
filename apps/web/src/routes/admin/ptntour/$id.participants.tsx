import { DownloadSimpleIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/ptntour/$id/participants")({ component: ParticipantsPage });

function csv(value: unknown) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}
function ParticipantsPage() {
  const { id } = Route.useParams();
  const eventId = Number(id);
  const { data, isPending } = useQuery(orpc.ptnTour.admin.participants.queryOptions({ input: { eventId } }));
  const download = () => {
    if (!data) return;
    const headers = ["Nama", "Email", "WA", "Sekolah", "Kelas", "Target PTN", "Metode Akses", "Terdaftar", "Hadir"];
    const rows = data.participants.map((item) => [
      item.name,
      item.email,
      item.phoneNumber,
      item.schoolName,
      item.classLevel,
      item.dreamCampus,
      item.accessMethod,
      item.registeredAt,
      item.attendedAt ? "Ya" : "Tidak",
    ]);
    const blob = new Blob([[headers, ...rows].map((row) => row.map(csv).join(",")).join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ptn-tour-${eventId}-participants.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  return (
    <AdminContainer>
      <AdminHeader title="Peserta PTN Tour" description={`Event #${eventId}`}>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/ptntour">Kembali</Link>
          </Button>
          <Button onClick={download} disabled={!data}>
            <DownloadSimpleIcon /> Export CSV
          </Button>
        </div>
      </AdminHeader>
      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total pendaftar</p>
          <p className="text-2xl font-black">{data?.total ?? 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Hadir</p>
          <p className="text-2xl font-black">{data?.attended ?? 0}</p>
        </Card>
      </div>
      <Card className="overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                {["Nama", "Email", "WA", "Sekolah", "Target PTN", "Akses", "Hadir"].map((header) => (
                  <th key={header} className="p-4">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isPending ? (
                <tr>
                  <td className="p-4" colSpan={7}>
                    Memuat peserta...
                  </td>
                </tr>
              ) : (
                data?.participants.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-4 font-semibold">{item.name}</td>
                    <td className="p-4">{item.email}</td>
                    <td className="p-4">{item.phoneNumber ?? "-"}</td>
                    <td className="p-4">{item.schoolName ?? "-"}</td>
                    <td className="p-4">{item.dreamCampus ?? "-"}</td>
                    <td className="p-4">{item.accessMethod}</td>
                    <td className="p-4">{item.attendedAt ? "Ya" : "Belum"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminContainer>
  );
}
