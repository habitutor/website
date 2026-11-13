import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { orpc } from "@/utils/orpc";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/ptntour/create")({ component: CreatePtnTourPage });
function CreatePtnTourPage() {
  const navigate = useNavigate();
  const client = useQueryClient();
  const [form, setForm] = useState({
    slug: "",
    title: "",
    category: "Masterclass",
    description: "",
    tutor: "",
    campus: "",
    posterUrl: "/event-placeholder.svg",
    startsAt: "",
    quota: "100",
    whatsappGroupUrl: "",
    zoomUrl: "",
    recordingUrl: "",
  });
  const create = useMutation(
    orpc.ptnTour.admin.create.mutationOptions({
      onSuccess: async () => {
        await client.invalidateQueries({ queryKey: orpc.ptnTour.admin.list.queryKey() });
        toast.success("Event berhasil dibuat");
        navigate({ to: "/admin/ptntour" });
      },
      onError: (error) => toast.error("Gagal membuat event", { description: error.message }),
    }),
  );
  const set = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  return (
    <AdminContainer>
      <AdminHeader title="Buat Event PTN Tour" description="Isi informasi event yang akan ditayangkan" />
      <Card className="max-w-3xl rounded-xl p-5">
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate({
              ...form,
              quota: Number(form.quota),
              startsAt: new Date(form.startsAt).toISOString(),
              isPublished: false,
            });
          }}
        >
          <div className="grid gap-1.5">
            <Label>Judul</Label>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} required />
          </div>
          <div className="grid gap-1.5">
            <Label>Slug</Label>
            <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Kategori</Label>
              <Input value={form.category} onChange={(e) => set("category", e.target.value)} required />
            </div>
            <div className="grid gap-1.5">
              <Label>Tanggal & jam</Label>
              <Input
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => set("startsAt", e.target.value)}
                required
              />
            </div>
          </div>
          {(
            [
              "description",
              "tutor",
              "campus",
              "posterUrl",
              "whatsappGroupUrl",
              "zoomUrl",
              "recordingUrl",
              "quota",
            ] as const
          ).map((key) => (
            <div key={key} className="grid gap-1.5">
              <Label>{key}</Label>
              <Input value={form[key]} onChange={(e) => set(key, e.target.value)} />
            </div>
          ))}
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? "Menyimpan..." : "Simpan Draft"}
          </Button>
        </form>
      </Card>
    </AdminContainer>
  );
}
