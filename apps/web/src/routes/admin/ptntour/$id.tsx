import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { orpc } from "@/utils/orpc";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/ptntour/$id")({ component: EditPtnTourPage });
const fields = [
  "title",
  "category",
  "description",
  "tutor",
  "campus",
  "posterUrl",
  "startsAt",
  "quota",
  "whatsappGroupUrl",
  "zoomUrl",
  "recordingUrl",
] as const;

function EditPtnTourPage() {
  const { id } = Route.useParams();
  const eventId = Number(id);
  const navigate = useNavigate();
  const client = useQueryClient();
  const { data: events } = useQuery(orpc.ptnTour.admin.list.queryOptions());
  const event = events?.find((item) => item.id === eventId);
  const [form, setForm] = useState<Record<(typeof fields)[number], string>>({
    title: "",
    category: "",
    description: "",
    tutor: "",
    campus: "",
    posterUrl: "",
    startsAt: "",
    quota: "",
    whatsappGroupUrl: "",
    zoomUrl: "",
    recordingUrl: "",
  });
  const update = useMutation(
    orpc.ptnTour.admin.update.mutationOptions({
      onSuccess: async () => {
        await client.invalidateQueries({ queryKey: orpc.ptnTour.admin.list.queryKey() });
        toast.success("Event diperbarui");
        navigate({ to: "/admin/ptntour" });
      },
    }),
  );
  if (!event)
    return (
      <AdminContainer>
        <AdminHeader title="Edit Event" />
        <p>Event tidak ditemukan.</p>
      </AdminContainer>
    );
  const value = (field: (typeof fields)[number]) => form[field] || String(event[field] ?? "");
  return (
    <AdminContainer>
      <AdminHeader title="Edit Event PTN Tour" description={event.title}>
        <Button variant="outline" asChild>
          <Link to="/admin/ptntour">Kembali</Link>
        </Button>
      </AdminHeader>
      <Card className="max-w-3xl rounded-xl p-5">
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            update.mutate({
              id: eventId,
              title: value("title"),
              category: value("category"),
              description: value("description"),
              tutor: value("tutor"),
              campus: value("campus"),
              posterUrl: value("posterUrl"),
              startsAt: new Date(value("startsAt")).toISOString(),
              quota: Number(value("quota")),
              whatsappGroupUrl: value("whatsappGroupUrl") || undefined,
              zoomUrl: value("zoomUrl") || undefined,
              recordingUrl: value("recordingUrl") || undefined,
              isPublished: !event.isPublished,
            });
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field} className={field === "description" ? "grid gap-1.5 sm:col-span-2" : "grid gap-1.5"}>
                <Label>{field}</Label>
                <Input
                  type={field === "startsAt" ? "datetime-local" : "text"}
                  value={value(field)}
                  onChange={(e) => setForm((current) => ({ ...current, [field]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Status saat ini: {event.isPublished ? "Tayang" : "Draft"}</p>
          <div className="flex gap-2">
            <Button type="submit" disabled={update.isPending}>
              {event.isPublished ? "Simpan & Unpublish" : "Simpan & Publish"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate({ to: "/admin/ptntour" })}>
              Batal
            </Button>
          </div>
        </form>
      </Card>
    </AdminContainer>
  );
}
