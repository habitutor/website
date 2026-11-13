import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { orpc } from "@/utils/orpc";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/ptntour/")({ component: AdminPtnTourPage });

function AdminPtnTourPage() {
  const { data: events, isPending } = useQuery(orpc.ptnTour.admin.list.queryOptions());
  const client = useQueryClient();
  const duplicate = useMutation(
    orpc.ptnTour.admin.duplicate.mutationOptions({
      onSuccess: async () => {
        await client.invalidateQueries({ queryKey: orpc.ptnTour.admin.list.queryKey() });
        toast.success("Event diduplikasi");
      },
      onError: (error) => toast.error("Duplikasi gagal", { description: error.message }),
    }),
  );
  return (
    <AdminContainer>
      <AdminHeader title="PTN Tour" description="Kelola event gratis, jadwal, link, dan materi peserta">
        <Button asChild>
          <Link to="/admin/ptntour/create">Buat Event</Link>
        </Button>
      </AdminHeader>
      <Card className="overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="p-4">Event</th>
                <th className="p-4">Jadwal</th>
                <th className="p-4">Status</th>
                <th className="p-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isPending ? (
                <tr>
                  <td className="p-4" colSpan={4}>
                    Memuat event...
                  </td>
                </tr>
              ) : (
                events?.map((event) => (
                  <tr key={event.id} className="border-b">
                    <td className="p-4">
                      <p className="font-bold">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.category}</p>
                    </td>
                    <td className="p-4">{event.startsAt.toLocaleString("id-ID")}</td>
                    <td className="p-4">{event.isPublished ? "Tayang" : "Draft"}</td>
                    <td className="p-4">
                      <Button size="sm" variant="outline" asChild>
                        <Link to="/admin/ptntour/$id" params={{ id: String(event.id) }}>
                          Edit
                        </Link>
                      </Button>
                      <Button size="sm" variant="ghost" asChild>
                        <Link to="/admin/ptntour/$id/participants" params={{ id: String(event.id) }}>
                          Peserta
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={duplicate.isPending}
                        onClick={() => duplicate.mutate({ id: event.id, slug: `${event.slug}-copy-${Date.now()}` })}
                      >
                        Duplikat
                      </Button>
                    </td>
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
