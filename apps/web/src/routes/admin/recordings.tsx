import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/recordings")({
  component: AdminRecordingsPage,
});

type Category = "TKA" | "SNBT" | "MANDIRI";

const emptyForm = {
  category: "TKA" as Category,
  title: "",
  teacher: "",
  youtubeUrl: "",
  recordedAt: "",
};

function AdminRecordingsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const listQuery = useQuery(orpc.admin.recording.list.queryOptions());

  const refresh = () => queryClient.invalidateQueries(orpc.admin.recording.list.queryOptions());

  const createMutation = useMutation(
    orpc.admin.recording.create.mutationOptions({
      onSuccess: async () => {
        toast.success("Rekaman berhasil ditambahkan");
        await refresh();
        setForm(emptyForm);
      },
      onError: (error) => {
        toast.error("Gagal menambahkan rekaman", { description: error.message });
      },
    }),
  );

  const updateMutation = useMutation(
    orpc.admin.recording.update.mutationOptions({
      onSuccess: async () => {
        toast.success("Rekaman diperbarui");
        await refresh();
      },
      onError: (error) => {
        toast.error("Gagal memperbarui rekaman", { description: error.message });
      },
    }),
  );

  const removeMutation = useMutation(
    orpc.admin.recording.remove.mutationOptions({
      onSuccess: async () => {
        toast.success("Rekaman dihapus");
        await refresh();
      },
      onError: (error) => {
        toast.error("Gagal menghapus rekaman", { description: error.message });
      },
    }),
  );

  const isFormValid =
    form.title.trim() !== "" && form.youtubeUrl.trim() !== "" && form.recordedAt.trim() !== "";

  return (
    <AdminContainer>
      <AdminHeader title="Live Recording" description="Kelola link rekaman YouTube untuk member premium" />

      <Card className="mb-6 space-y-4 p-6">
        <h3 className="text-lg font-semibold">Tambah Rekaman</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Kategori</Label>
            <select
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
            >
              <option value="TKA">TKA</option>
              <option value="SNBT">SNBT</option>
              <option value="MANDIRI">Mandiri</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Tanggal live</Label>
            <Input
              type="date"
              value={form.recordedAt}
              onChange={(e) => setForm({ ...form, recordedAt: e.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Judul</Label>
            <Input
              placeholder="Contoh: Bedah Soal Matematika TKA"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Pemateri (opsional)</Label>
            <Input value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Link YouTube</Label>
            <Input
              placeholder="https://www.youtube.com/live/..."
              value={form.youtubeUrl}
              onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
            />
          </div>
        </div>
        <Button disabled={!isFormValid || createMutation.isPending} onClick={() => createMutation.mutate(form)}>
          {createMutation.isPending ? "Menyimpan..." : "Tambah Rekaman"}
        </Button>
      </Card>

      <Card className="space-y-3 p-6">
        <h3 className="text-lg font-semibold">Daftar Rekaman</h3>
        {listQuery.isPending && <p className="text-sm text-muted-foreground">Memuat...</p>}
        {listQuery.data && listQuery.data.length === 0 && (
          <p className="text-sm text-muted-foreground">Belum ada rekaman.</p>
        )}
        {listQuery.data?.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-4 rounded-md border p-3">
            <div className="min-w-0">
              <p className="truncate font-medium">
                [{item.category}] {item.title}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {item.recordedAt} · {item.isPublished ? "Tampil" : "Disembunyikan"} · {item.youtubeUrl}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={updateMutation.isPending}
                onClick={() =>
                  updateMutation.mutate({
                    id: item.id,
                    category: item.category,
                    title: item.title,
                    teacher: item.teacher ?? "",
                    youtubeUrl: item.youtubeUrl,
                    recordedAt: item.recordedAt,
                    isPublished: !item.isPublished,
                  })
                }
              >
                {item.isPublished ? "Sembunyikan" : "Tampilkan"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600"
                disabled={removeMutation.isPending}
                onClick={() => {
                  if (window.confirm("Hapus rekaman ini? Tindakan ini tidak bisa dibatalkan.")) {
                    removeMutation.mutate({ id: item.id });
                  }
                }}
              >
                Hapus
              </Button>
            </div>
          </div>
        ))}
      </Card>
    </AdminContainer>
  );
}