import { Plus, Trash } from "@phosphor-icons/react";
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
type DashboardContentTab = "live-class" | "announcement";

export function DashboardContentAdminPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<DashboardContentTab>("live-class");
  const [liveClassForm, setLiveClassForm] = useState({
    title: "",
    date: "",
    time: "",
    teacher: "",
    link: "",
    access: "3x" as AccessType,
    order: 1,
    isPublished: true,
  });

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

  const isLiveClassFormValid =
    liveClassForm.title.trim() !== "" &&
    liveClassForm.date.trim() !== "" &&
    liveClassForm.time.trim() !== "" &&
    liveClassForm.teacher.trim() !== "" &&
    liveClassForm.link.trim() !== "";

  const createLiveClassMutation = useMutation(
    orpc.admin.dashboardContent.createLiveClass.mutationOptions({
      onSuccess: async () => {
        toast.success("Live class berhasil dibuat");
        await queryClient.invalidateQueries(orpc.admin.dashboardContent.list.queryOptions());
        setLiveClassForm({
          title: "",
          date: "",
          time: "",
          teacher: "",
          link: "",
          access: "3x",
          order: 1,
          isPublished: true,
        });
      },
      onError: (error) => {
        toast.error("Gagal membuat live class", { description: error.message });
      },
    }),
  );

  const deleteLiveClassMutation = useMutation(
    orpc.admin.dashboardContent.deleteLiveClass.mutationOptions({
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
    orpc.admin.dashboardContent.updateAnnouncement.mutationOptions({
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
        <Card className="space-y-4 p-6">
          <h3 className="text-lg font-semibold">Tambah Live Class</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              placeholder="Judul"
              value={liveClassForm.title}
              onChange={(event) => setLiveClassForm((prev) => ({ ...prev, title: event.target.value }))}
            />
            <Input
              type="date"
              placeholder="Tanggal"
              value={liveClassForm.date}
              onChange={(event) => setLiveClassForm((prev) => ({ ...prev, date: event.target.value }))}
            />
            <Input
              type="time"
              placeholder="Waktu"
              value={liveClassForm.time}
              step={60}
              onChange={(event) => setLiveClassForm((prev) => ({ ...prev, time: event.target.value }))}
            />
            <Input
              placeholder="Mentor"
              value={liveClassForm.teacher}
              onChange={(event) => setLiveClassForm((prev) => ({ ...prev, teacher: event.target.value }))}
            />
            <Input
              placeholder="Link"
              value={liveClassForm.link}
              onChange={(event) => setLiveClassForm((prev) => ({ ...prev, link: event.target.value }))}
              className="md:col-span-2"
            />
            <div className="flex items-center gap-2">
              <span className="text-sm">Akses</span>
              <select
                value={liveClassForm.access}
                onChange={(event) =>
                  setLiveClassForm((prev) => ({ ...prev, access: event.target.value as AccessType }))
                }
                className="h-9 rounded-md border px-3 text-sm"
              >
                <option value="3x">3x (premium 249k & 199k)</option>
                <option value="5x">5x (premium 249k only)</option>
              </select>
            </div>
          </div>
          <Button
            onClick={() => createLiveClassMutation.mutate(liveClassForm)}
            disabled={createLiveClassMutation.isPending || !isLiveClassFormValid}
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
        <Card className="space-y-4 p-6">
          <h3 className="text-lg font-semibold">Announcement</h3>
          <p className="text-sm text-muted-foreground">
            Hanya satu announcement utama yang bisa diubah. Promo cashback bersifat tetap.
          </p>
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

function LiveClassRow({
  item,
  onDelete,
}: {
  item: {
    id: number;
    title: string;
    date: string;
    time: string;
    teacher: string;
    link: string;
    access: AccessType;
  };
  onDelete: (id: number) => void;
}) {
  return (
    <div className="space-y-2 rounded-lg border p-3">
      <div className="grid gap-2 md:grid-cols-2">
        <Input value={item.title} readOnly />
        <Input value={item.teacher} readOnly />
        <Input type="text" value={item.date} readOnly />
        <Input type="text" value={item.time} readOnly />
        <Input value={item.link} readOnly className="md:col-span-2" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <select value={item.access} disabled className="h-9 rounded-md border px-3 text-sm">
          <option value="3x">3x</option>
          <option value="5x">5x</option>
        </select>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="destructive" onClick={() => onDelete(item.id)}>
            <Trash className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
