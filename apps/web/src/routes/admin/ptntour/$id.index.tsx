import { ArrowSquareOutIcon, FileArrowDownIcon, PlusIcon, TrashIcon, UsersThreeIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";
import { EventForm, type EventFormValues, toEventPayload, toWibInput } from "./-components/event-form";

export const Route = createFileRoute("/admin/ptntour/$id/")({ component: EditPtnTourPage });

function EditPtnTourPage() {
  const { id } = Route.useParams();
  const eventId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: event, isPending, isError } = useQuery(orpc.ptnTour.admin.get.queryOptions({ input: { id: eventId } }));

  const update = useMutation(
    orpc.ptnTour.admin.update.mutationOptions({
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: orpc.ptnTour.admin.list.queryKey() }),
          queryClient.invalidateQueries({ queryKey: orpc.ptnTour.admin.get.queryKey({ input: { id: eventId } }) }),
        ]);
        toast.success("Perubahan disimpan");
      },
      onError: (error) => toast.error("Gagal menyimpan", { description: error.message }),
    }),
  );

  if (isPending) {
    return (
      <AdminContainer>
        <AdminHeader title="Edit Event" backTo="/admin/ptntour" />
        <Skeleton className="h-96 w-full rounded-sr-xl" />
      </AdminContainer>
    );
  }
  if (isError || !event) {
    return (
      <AdminContainer>
        <AdminHeader title="Edit Event" backTo="/admin/ptntour" />
        <p className="rounded-sr-xl border border-dashed border-sr-line bg-white p-10 text-center text-sm text-sr-muted">
          Event tidak ditemukan atau sudah dihapus.
        </p>
      </AdminContainer>
    );
  }

  const initial: EventFormValues = {
    title: event.title,
    slug: event.slug,
    category: event.category as EventFormValues["category"],
    subjects: event.subjects,
    startsAt: toWibInput(event.startsAt),
    durationMinutes: String(event.durationMinutes),
    quota: event.quota === null ? "" : String(event.quota),
    tutor: event.tutor,
    campus: event.campus,
    posterUrl: event.posterUrl,
    description: event.description,
    longDescription: event.longDescription ?? "",
    rundown: event.rundown ?? "",
    whatsappGroupUrl: event.whatsappGroupUrl ?? "",
    zoomUrl: event.zoomUrl ?? "",
    recordingUrl: event.recordingUrl ?? "",
    recordingFreeDays: String(event.recordingFreeDays),
    accessMode: event.accessMode as EventFormValues["accessMode"],
    scheduleStatus: event.scheduleStatus as EventFormValues["scheduleStatus"],
    isPublished: event.isPublished,
  };

  return (
    <AdminContainer>
      <AdminHeader title="Edit Event" description={event.title} backTo="/admin/ptntour">
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/admin/ptntour/$id/participants" params={{ id }}>
            <UsersThreeIcon /> Peserta
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <a href={`/ptntour/${event.slug}`} target="_blank" rel="noreferrer">
            <ArrowSquareOutIcon /> Lihat halaman
          </a>
        </Button>
      </AdminHeader>

      <div className="space-y-5">
        <EventForm
          // Remount saat data tersimpan berubah supaya form selalu menampilkan nilai terbaru.
          key={String(event.updatedAt)}
          mode="edit"
          initial={initial}
          submitting={update.isPending}
          onSubmit={(values) => {
            const { slug: _slug, ...payload } = toEventPayload(values);
            update.mutate({ id: eventId, ...payload, ...(values.slug !== event.slug ? { slug: values.slug } : {}) });
          }}
          onCancel={() => navigate({ to: "/admin/ptntour" })}
        />
        <MaterialsManager eventId={eventId} />
      </div>
    </AdminContainer>
  );
}

const FILE_TYPES = ["PDF", "PPT", "Latsol", "Lainnya"] as const;
const UNLOCK_OPTIONS = [
  { value: "after_register", label: "Setelah daftar" },
  { value: "after_event", label: "Setelah event selesai" },
] as const;

const selectClass =
  "h-10 w-full rounded-full border-2 border-sr-line-2 bg-white px-4 text-sm text-sr-ink outline-none focus:border-sr-blue-500 focus:ring-[3px] focus:ring-sr-blue-500/30";

function MaterialsManager({ eventId }: { eventId: number }) {
  const queryClient = useQueryClient();
  const listKey = orpc.ptnTour.admin.materials.list.queryKey({ input: { eventId } });
  const { data: materials, isPending } = useQuery(
    orpc.ptnTour.admin.materials.list.queryOptions({ input: { eventId } }),
  );
  const [label, setLabel] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState<string>("PDF");
  const [unlockAt, setUnlockAt] = useState<"after_register" | "after_event">("after_register");

  const refresh = () => queryClient.invalidateQueries({ queryKey: listKey });
  const create = useMutation(
    orpc.ptnTour.admin.materials.create.mutationOptions({
      onSuccess: async () => {
        await refresh();
        setLabel("");
        setFileUrl("");
        toast.success("Materi ditambahkan");
      },
      onError: (error) => toast.error("Gagal menambah materi", { description: error.message }),
    }),
  );
  const update = useMutation(
    orpc.ptnTour.admin.materials.update.mutationOptions({
      onSuccess: refresh,
      onError: (error) => toast.error("Gagal memperbarui materi", { description: error.message }),
    }),
  );
  const remove = useMutation(
    orpc.ptnTour.admin.materials.delete.mutationOptions({
      onSuccess: async () => {
        await refresh();
        toast.success("Materi dihapus");
      },
      onError: (error) => toast.error("Gagal menghapus materi", { description: error.message }),
    }),
  );

  return (
    <section className="rounded-sr-xl border border-sr-line bg-white p-5 shadow-sr-1">
      <div className="mb-4 flex items-center gap-3">
        <span className="h-6 w-1.5 rounded-full bg-sr-sun-500" />
        <div>
          <h2 className="font-black text-sr-ink">Materi & bonus</h2>
          <p className="text-xs text-sr-muted">
            Daftar ini tampil di halaman event. Tautan file hanya terbuka untuk peserta yang berhak.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {isPending && <Skeleton className="h-14 w-full" />}
        {materials && materials.length === 0 && (
          <p className="rounded-sr-md border border-dashed border-sr-line p-5 text-center text-sm text-sr-muted">
            Belum ada materi untuk event ini.
          </p>
        )}
        {materials?.map((material) => (
          <div
            key={material.id}
            className="flex flex-wrap items-center gap-3 rounded-sr-md border border-sr-line bg-sr-ivory/50 p-3"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-sr-sm bg-sr-blue-50 text-sr-blue-600">
              <FileArrowDownIcon weight="fill" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-sr-ink">{material.label}</p>
              <a
                href={material.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="block truncate text-xs text-sr-blue-600 hover:underline"
              >
                {material.fileType} · {material.fileUrl}
              </a>
            </div>
            <select
              aria-label="Waktu buka"
              className={cn(selectClass, "w-auto min-w-44")}
              value={material.unlockAt}
              onChange={(e) =>
                update.mutate({ id: material.id, unlockAt: e.target.value as "after_register" | "after_event" })
              }
            >
              {UNLOCK_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              aria-pressed={material.isPublished}
              onClick={() => update.mutate({ id: material.id, isPublished: !material.isPublished })}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-bold transition-colors",
                material.isPublished ? "bg-sr-live/10 text-sr-live" : "bg-sr-ivory text-sr-muted ring-1 ring-sr-line",
              )}
            >
              {material.isPublished ? "Tampil" : "Disembunyikan"}
            </button>
            <Button
              size="icon"
              variant="ghost"
              aria-label={`Hapus ${material.label}`}
              className="text-destructive"
              disabled={remove.isPending}
              onClick={() => {
                if (window.confirm(`Hapus materi "${material.label}"?`)) remove.mutate({ id: material.id });
              }}
            >
              <TrashIcon />
            </Button>
          </div>
        ))}
      </div>

      <form
        className="mt-4 grid gap-3 rounded-sr-lg border border-dashed border-sr-line p-4 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          create.mutate({ eventId, label, fileUrl, fileType, unlockAt, sortOrder: (materials?.length ?? 0) + 1 });
        }}
      >
        <div className="grid gap-1.5">
          <Label>Label materi</Label>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="PDF Cheatsheet" required />
        </div>
        <div className="grid gap-1.5">
          <Label>Tautan file</Label>
          <Input
            type="url"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="https://…"
            required
          />
        </div>
        <div className="grid gap-1.5">
          <Label>Jenis file</Label>
          <select className={selectClass} value={fileType} onChange={(e) => setFileType(e.target.value)}>
            {FILE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <Label>Kapan terbuka</Label>
          <select
            className={selectClass}
            value={unlockAt}
            onChange={(e) => setUnlockAt(e.target.value as "after_register" | "after_event")}
          >
            {UNLOCK_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <Button
          type="submit"
          className="sm:col-span-2 sm:w-fit"
          disabled={!label.trim() || !fileUrl.trim() || create.isPending}
        >
          <PlusIcon /> {create.isPending ? "Menambahkan…" : "Tambah Materi"}
        </Button>
      </form>
    </section>
  );
}
