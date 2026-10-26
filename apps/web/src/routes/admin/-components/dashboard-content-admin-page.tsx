import { FloppyDisk, PencilSimple, Plus, Trash, X } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { orpc } from "@/utils/orpc";

type AccessType = "3x" | "5x";
type CategoryType = "TKA" | "SNBT" | "MANDIRI";
type DashboardContentTab = "live-class" | "announcement";

const EMPTY_LIVE_CLASS_FORM = {
  title: "",
  date: "",
  time: "",
  teacher: "",
  link: "",
  // Akses 3x/5x hanya membedakan tier premium lama; disembunyikan dari form, kelas baru terbuka untuk semua premium.
  access: "3x" as AccessType,
  category: "SNBT" as CategoryType,
  durationMinutes: "60",
};

type LiveClassForm = typeof EMPTY_LIVE_CLASS_FORM;

type LiveClassItem = Omit<LiveClassForm, "durationMinutes"> & { id: number; durationMinutes: number };

const CATEGORY_LABEL: Record<CategoryType, string> = { TKA: "TKA", SNBT: "SNBT", MANDIRI: "Mandiri" };

function isLiveClassFormValid(form: LiveClassForm) {
  return (
    form.title.trim() !== "" &&
    form.date.trim() !== "" &&
    form.time.trim() !== "" &&
    form.teacher.trim() !== "" &&
    form.link.trim() !== "" &&
    Number(form.durationMinutes) >= 15
  );
}

function toLiveClassForm(item: LiveClassItem): LiveClassForm {
  const { title, date, time, teacher, link, access, category, durationMinutes } = item;
  return { title, date, time, teacher, link, access, category, durationMinutes: String(durationMinutes) };
}

function toLiveClassPayload(form: LiveClassForm) {
  return { ...form, durationMinutes: Number(form.durationMinutes) };
}

export function DashboardContentAdminPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<DashboardContentTab>("live-class");
  const [liveClassForm, setLiveClassForm] = useState(EMPTY_LIVE_CLASS_FORM);

  const contentQuery = useQuery(orpc.admin.dashboardContent.list.queryOptions());
  const primaryAnnouncement = useMemo(
    () => contentQuery.data?.announcements.find((item) => item.variant === "primary") ?? null,
    [contentQuery.data?.announcements],
  );

  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    if (!primaryAnnouncement) return;
    setAnnouncementForm({
      title: primaryAnnouncement.title,
      description: primaryAnnouncement.description,
    });
  }, [primaryAnnouncement]);

  const createLiveClassMutation = useMutation(
    orpc.admin.dashboardContent.liveClass.create.mutationOptions({
      onSuccess: async () => {
        toast.success("Live class berhasil dibuat");
        await queryClient.invalidateQueries(orpc.admin.dashboardContent.list.queryOptions());
        setLiveClassForm(EMPTY_LIVE_CLASS_FORM);
      },
      onError: (error) => {
        toast.error("Gagal membuat live class", { description: error.message });
      },
    }),
  );

  const deleteLiveClassMutation = useMutation(
    orpc.admin.dashboardContent.liveClass.remove.mutationOptions({
      onSuccess: async () => {
        toast.success("Live class berhasil dihapus");
        await queryClient.invalidateQueries(orpc.admin.dashboardContent.list.queryOptions());
      },
      onError: (error) => {
        toast.error("Gagal menghapus live class", { description: error.message });
      },
    }),
  );

  const updateAnnouncementMutation = useMutation(
    orpc.admin.dashboardContent.announcement.update.mutationOptions({
      onSuccess: async () => {
        toast.success("Announcement berhasil diperbarui");
        await queryClient.invalidateQueries(orpc.admin.dashboardContent.list.queryOptions());
      },
      onError: (error) => {
        toast.error("Gagal memperbarui announcement", { description: error.message });
      },
    }),
  );

  return (
    <AdminContainer>
      <AdminHeader title="Dashboard Content" description="Kelola Live Class dan Announcement untuk dashboard user" />

      <div className="mb-4 flex items-center gap-2">
        <Button
          type="button"
          variant={activeTab === "live-class" ? "default" : "outline"}
          onClick={() => setActiveTab("live-class")}
        >
          Live Class
        </Button>
        <Button
          type="button"
          variant={activeTab === "announcement" ? "default" : "outline"}
          onClick={() => setActiveTab("announcement")}
        >
          Announcement
        </Button>
      </div>

      {activeTab === "live-class" ? (
        <Card className="space-y-2 p-6">
          <h3 className="text-lg font-semibold">Tambah Live Class</h3>
          <LiveClassFields form={liveClassForm} onChange={setLiveClassForm} />
          <Button
            onClick={() => createLiveClassMutation.mutate(toLiveClassPayload(liveClassForm))}
            disabled={createLiveClassMutation.isPending || !isLiveClassFormValid(liveClassForm)}
          >
            <Plus className="mr-2 size-4" /> Tambah Live Class
          </Button>

          <div className="space-y-3 pt-4">
            {contentQuery.data?.liveClasses.map((item) => (
              <LiveClassRow key={item.id} item={item} onDelete={(id) => deleteLiveClassMutation.mutate({ id })} />
            ))}
          </div>
        </Card>
      ) : (
        <Card className="space-y-2 p-6">
          <h3 className="text-lg font-semibold">Announcement</h3>
          {primaryAnnouncement ? (
            <div className="space-y-3">
              <Input
                placeholder="Judul"
                value={announcementForm.title}
                onChange={(event) => setAnnouncementForm((prev) => ({ ...prev, title: event.target.value }))}
              />
              <Textarea
                placeholder="Deskripsi"
                value={announcementForm.description}
                onChange={(event) => setAnnouncementForm((prev) => ({ ...prev, description: event.target.value }))}
              />
              <Button
                onClick={() =>
                  updateAnnouncementMutation.mutate({
                    id: primaryAnnouncement.id,
                    title: announcementForm.title,
                    description: announcementForm.description,
                  })
                }
                disabled={
                  updateAnnouncementMutation.isPending ||
                  announcementForm.title.trim() === "" ||
                  announcementForm.description.trim() === ""
                }
              >
                Simpan Announcement
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Announcement utama belum tersedia. Hubungi pengembang untuk inisialisasi data awal.
            </p>
          )}
        </Card>
      )}
    </AdminContainer>
  );
}

function LiveClassFields({
  form,
  onChange,
}: {
  form: LiveClassForm;
  onChange: (update: (prev: LiveClassForm) => LiveClassForm) => void;
}) {
  const set = <K extends keyof LiveClassForm>(key: K, value: LiveClassForm[K]) =>
    onChange((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Input placeholder="Judul" value={form.title} onChange={(event) => set("title", event.target.value)} />
      <Input type="date" aria-label="Tanggal" value={form.date} onChange={(event) => set("date", event.target.value)} />
      <Input
        type="time"
        aria-label="Jam mulai (WIB)"
        value={form.time}
        step={60}
        onChange={(event) => set("time", event.target.value)}
      />
      <Input placeholder="Mentor" value={form.teacher} onChange={(event) => set("teacher", event.target.value)} />
      <Input
        placeholder="Link Zoom"
        value={form.link}
        onChange={(event) => set("link", event.target.value)}
        className="md:col-span-2"
      />
      <label className="flex items-center gap-2 text-sm">
        Kategori
        <select
          value={form.category}
          onChange={(event) => set("category", event.target.value as CategoryType)}
          className="h-9 rounded-md border px-3 text-sm"
        >
          <option value="TKA">TKA</option>
          <option value="SNBT">SNBT</option>
          <option value="MANDIRI">Mandiri (khusus Paket Sampai Mandiri)</option>
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm">
        Durasi (menit)
        <Input
          type="number"
          min={15}
          max={300}
          step={15}
          value={form.durationMinutes}
          onChange={(event) => set("durationMinutes", event.target.value)}
          className="w-24"
        />
      </label>
      <p className="text-xs text-muted-foreground md:col-span-2">
        Tanggal & jam dalam WIB. Tombol Gabung aktif 15 menit sebelum kelas dimulai.
      </p>
    </div>
  );
}

function LiveClassRow({ item, onDelete }: { item: LiveClassItem; onDelete: (id: number) => void }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(() => toLiveClassForm(item));

  const updateMutation = useMutation(
    orpc.admin.dashboardContent.liveClass.update.mutationOptions({
      onSuccess: async () => {
        toast.success("Live class berhasil diperbarui");
        setIsEditing(false);
        await queryClient.invalidateQueries(orpc.admin.dashboardContent.list.queryOptions());
      },
      onError: (error) => {
        toast.error("Gagal memperbarui live class", { description: error.message });
      },
    }),
  );

  const startEditing = () => {
    setForm(toLiveClassForm(item));
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <div className="space-y-3 rounded-lg border border-primary-200 bg-primary-100/30 p-3">
        <p className="text-sm font-semibold">Edit live class</p>
        <LiveClassFields form={form} onChange={setForm} />
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} disabled={updateMutation.isPending}>
            <X className="size-4" /> Batal
          </Button>
          <Button
            size="sm"
            onClick={() => updateMutation.mutate({ id: item.id, ...toLiveClassPayload(form) })}
            disabled={updateMutation.isPending || !isLiveClassFormValid(form)}
          >
            <FloppyDisk className="size-4" /> {updateMutation.isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border px-2.5 py-0.5 text-xs font-semibold">
            {CATEGORY_LABEL[item.category]}
          </span>
        </div>
        <p className="font-semibold wrap-break-word">{item.title}</p>
        <p className="text-sm text-muted-foreground">
          {item.date} · {item.time} WIB · {item.durationMinutes} menit · {item.teacher}
        </p>
        <p className="truncate text-xs text-muted-foreground">{item.link}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button size="sm" variant="outline" onClick={startEditing}>
          <PencilSimple className="size-4" /> Edit
        </Button>
        <Button size="sm" variant="destructive" onClick={() => onDelete(item.id)} aria-label="Hapus live class">
          <Trash className="size-4" />
        </Button>
      </div>
    </div>
  );
}
