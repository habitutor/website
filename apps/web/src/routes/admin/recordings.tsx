import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { ADMIN_ROW_CLASS, AdminSearchInput, FilterChips, rowDelay, usePagedList } from "@/components/admin/list-tools";
import { AdminPagination } from "@/components/admin/pagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";
import { PencilSimple, Trash } from "@phosphor-icons/react";

export const Route = createFileRoute("/admin/recordings")({
  component: AdminRecordingsPage,
});

type Category = "TKA" | "SNBT" | "MANDIRI";

type RecordingForm = {
  category: Category;
  title: string;
  teacher: string;
  youtubeUrl: string;
  recordedAt: string;
};

type EditingRecording = RecordingForm & {
  id: number;
  isPublished: boolean;
};

type RecordingFilter = "ALL" | "TKA" | "SNBT" | "MANDIRI";

const RECORDING_FILTERS: ReadonlyArray<{ value: RecordingFilter; label: string }> = [
  { value: "ALL", label: "Semua" },
  { value: "TKA", label: "TKA" },
  { value: "SNBT", label: "SNBT" },
  { value: "MANDIRI", label: "Mandiri" },
];

const matchesRecording = (item: { title: string; teacher: string | null; category: string }, query: string) =>
  `${item.title} ${item.teacher ?? ""} ${item.category}`.toLowerCase().includes(query);

const emptyForm: RecordingForm = {
  category: "TKA",
  title: "",
  teacher: "",
  youtubeUrl: "",
  recordedAt: "",
};

const isRecordingFormValid = (form: RecordingForm) =>
  form.title.trim() !== "" && form.youtubeUrl.trim() !== "" && form.recordedAt.trim() !== "";

function RecordingFormFields({
  idPrefix,
  form,
  onChange,
}: {
  idPrefix: string;
  form: RecordingForm;
  onChange: (form: RecordingForm) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-category`}>Kategori</Label>
        <select
          id={`${idPrefix}-category`}
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={form.category}
          onChange={(e) => onChange({ ...form, category: e.target.value as Category })}
        >
          <option value="TKA">TKA</option>
          <option value="SNBT">SNBT</option>
          <option value="MANDIRI">Mandiri</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-date`}>Tanggal live</Label>
        <Input
          id={`${idPrefix}-date`}
          type="date"
          value={form.recordedAt}
          onChange={(e) => onChange({ ...form, recordedAt: e.target.value })}
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`${idPrefix}-title`}>Judul</Label>
        <Input
          id={`${idPrefix}-title`}
          placeholder="Contoh: Bedah Soal Matematika TKA"
          value={form.title}
          onChange={(e) => onChange({ ...form, title: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-teacher`}>Pemateri (opsional)</Label>
        <Input
          id={`${idPrefix}-teacher`}
          value={form.teacher}
          onChange={(e) => onChange({ ...form, teacher: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-youtube`}>Link YouTube</Label>
        <Input
          id={`${idPrefix}-youtube`}
          placeholder="https://www.youtube.com/live/..."
          value={form.youtubeUrl}
          onChange={(e) => onChange({ ...form, youtubeUrl: e.target.value })}
        />
      </div>
    </div>
  );
}

function AdminRecordingsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<RecordingForm>(emptyForm);
  const [editing, setEditing] = useState<EditingRecording | null>(null);
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

  const editMutation = useMutation(
    orpc.admin.recording.update.mutationOptions({
      onSuccess: async () => {
        toast.success("Perubahan rekaman disimpan");
        await refresh();
        setEditing(null);
      },
      onError: (error) => {
        toast.error("Gagal menyimpan perubahan", { description: error.message });
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

  const [filter, setFilter] = useState<RecordingFilter>("ALL");
  const byCategory = useMemo(
    () => listQuery.data?.filter((item) => filter === "ALL" || item.category === filter),
    [listQuery.data, filter],
  );
  const recordings = usePagedList(byCategory, { pageSize: 8, matches: matchesRecording });

  return (
    <AdminContainer>
      <AdminHeader title="Live Recording" description="Kelola link rekaman YouTube untuk member Premium." />

      <Card className="mb-6 sr-lift space-y-4 rounded-sr-xl border-sr-line bg-linear-to-br from-white to-sr-blue-50/60 p-6 shadow-sr-1">
        <h3 className="text-lg font-black text-sr-ink">Tambah Rekaman</h3>
        <RecordingFormFields idPrefix="add" form={form} onChange={setForm} />
        <Button
          disabled={!isRecordingFormValid(form) || createMutation.isPending}
          onClick={() => createMutation.mutate(form)}
        >
          {createMutation.isPending ? "Menyimpan..." : "Tambah Rekaman"}
        </Button>
      </Card>

      <Card className="space-y-4 rounded-sr-xl p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="h-6 w-1.5 rounded-full bg-sr-sun-500" />
          <h3 className="text-lg font-black text-sr-ink">Daftar Rekaman</h3>
          <span className="rounded-full bg-sr-blue-50 px-2.5 py-0.5 text-sm font-bold text-sr-blue-700">
            {recordings.total}
          </span>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <AdminSearchInput
            className="flex-1"
            value={recordings.query}
            onChange={recordings.setQuery}
            placeholder="Cari judul atau pengajar…"
          />
          <FilterChips label="Filter kategori" value={filter} onChange={setFilter} options={RECORDING_FILTERS} />
        </div>
        {listQuery.isPending && <p className="text-sm text-sr-muted">Memuat…</p>}
        {listQuery.data && recordings.total === 0 && (
          <p className="rounded-sr-md border border-dashed border-sr-line p-6 text-center text-sm text-sr-muted">
            {listQuery.data.length === 0 ? "Belum ada rekaman." : "Tidak ada rekaman yang cocok dengan pencarian."}
          </p>
        )}
        {recordings.pageItems.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              ADMIN_ROW_CLASS,
              "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
            )}
            style={rowDelay(index)}
          >
            <div className="min-w-0">
              <p className="truncate font-medium">
                [{item.category}] {item.title}
              </p>
              <p className="truncate text-xs text-sr-muted">
                {item.recordedAt} · {item.isPublished ? "Tampil" : "Disembunyikan"} · {item.youtubeUrl}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setEditing({
                    id: item.id,
                    category: item.category,
                    title: item.title,
                    teacher: item.teacher ?? "",
                    youtubeUrl: item.youtubeUrl,
                    recordedAt: item.recordedAt,
                    isPublished: item.isPublished,
                  })
                }
              >
                <PencilSimple className="size-4" /> Edit
              </Button>
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
                variant="destructive"
                size="sm"
                aria-label="Hapus rekaman"
                disabled={removeMutation.isPending}
                onClick={() => removeMutation.mutate({ id: item.id })}
              >
                <Trash className="size-4" />
              </Button>
            </div>
          </div>
        ))}
        {recordings.total > recordings.pageSize && (
          <AdminPagination
            label="Rekaman"
            page={recordings.page}
            total={recordings.total}
            pageSize={recordings.pageSize}
            onPageChange={recordings.setPage}
          />
        )}
      </Card>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Rekaman</DialogTitle>
            <DialogDescription>Ubah data rekaman, lalu klik Simpan Perubahan.</DialogDescription>
          </DialogHeader>
          {editing && (
            <RecordingFormFields
              idPrefix="edit"
              form={editing}
              onChange={(next) => setEditing({ ...editing, ...next })}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={editMutation.isPending}>
              Batal
            </Button>
            <Button
              disabled={!editing || !isRecordingFormValid(editing) || editMutation.isPending}
              onClick={() => editing && editMutation.mutate(editing)}
            >
              {editMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminContainer>
  );
}
