import {
  CopyIcon,
  DotsThreeIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { AdminSearchInput, FilterChips, usePagedList } from "@/components/admin/list-tools";
import { AdminPagination } from "@/components/admin/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";
import { toWibInput } from "./-components/event-form";

export const Route = createFileRoute("/admin/ptntour/")({ component: AdminPtnTourPage });

type EventRow = NonNullable<ReturnType<typeof useAdminEvents>["data"]>[number];
type Filter = "all" | "draft" | "published" | "ended";

const FILTERS: ReadonlyArray<{ value: Filter; label: string }> = [
  { value: "all", label: "Semua" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Tayang" },
  { value: "ended", label: "Selesai" },
];

const PHASE_LABEL = { upcoming: "Akan datang", live: "Sedang live", ended: "Selesai" } as const;

const matchesEvent = (event: { title: string; tutor: string; category: string }, query: string) =>
  `${event.title} ${event.tutor} ${event.category}`.toLowerCase().includes(query);

function useAdminEvents() {
  return useQuery(orpc.ptnTour.admin.list.queryOptions());
}

const formatWhen = (date: Date) =>
  `${toWibInput(date).slice(0, 10).split("-").reverse().join("/")} · ${toWibInput(date).slice(11)} WIB`;

function StatusBadges({ event }: { event: EventRow }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span
        className={cn(
          "inline-flex rounded-full px-2.5 py-1 text-xs font-bold",
          event.isPublished ? "bg-sr-live/10 text-sr-live" : "bg-sr-ivory text-sr-muted ring-1 ring-sr-line",
        )}
      >
        {event.isPublished ? "Tayang" : "Draft"}
      </span>
      <span className="inline-flex rounded-full bg-sr-blue-50 px-2.5 py-1 text-xs font-bold text-sr-blue-700">
        {PHASE_LABEL[event.phase]}
      </span>
    </span>
  );
}

function AdminPtnTourPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: events, isPending } = useAdminEvents();
  const [filter, setFilter] = useState<Filter>("all");

  const refresh = () => queryClient.invalidateQueries({ queryKey: orpc.ptnTour.admin.list.queryKey() });
  const duplicate = useMutation(
    orpc.ptnTour.admin.duplicate.mutationOptions({
      onSuccess: async (copy) => {
        await refresh();
        toast.success("Event diduplikasi sebagai draft", {
          description: "Atur ulang jadwal dan link sebelum menayangkan.",
        });
        navigate({ to: "/admin/ptntour/$id", params: { id: String(copy.id) } });
      },
      onError: (error) => toast.error("Duplikasi gagal", { description: error.message }),
    }),
  );
  const togglePublish = useMutation(
    orpc.ptnTour.admin.update.mutationOptions({
      onSuccess: async (_data, variables) => {
        await refresh();
        toast.success(variables.isPublished ? "Event ditayangkan" : "Event ditarik ke draft");
      },
      onError: (error) => toast.error("Gagal mengubah status", { description: error.message }),
    }),
  );
  const remove = useMutation(
    orpc.ptnTour.admin.delete.mutationOptions({
      onSuccess: async () => {
        await refresh();
        toast.success("Event dihapus");
      },
      onError: (error) => toast.error("Gagal menghapus", { description: error.message }),
    }),
  );

  const byFilter = useMemo(
    () =>
      events?.filter((event) =>
        filter === "all"
          ? true
          : filter === "draft"
            ? !event.isPublished
            : filter === "published"
              ? event.isPublished
              : event.phase === "ended",
      ),
    [events, filter],
  );
  const list = usePagedList(byFilter, { pageSize: 10, matches: matchesEvent });

  const askDelete = (event: EventRow) => {
    const warning =
      event.registrationCount > 0
        ? `Event ini punya ${event.registrationCount} pendaftar. Menghapusnya juga menghapus data pendaftar dan materi. Lanjutkan?`
        : `Hapus event "${event.title}"?`;
    if (window.confirm(warning)) remove.mutate({ id: event.id });
  };

  const actions = (event: EventRow) => (
    <div className="flex items-center justify-end gap-1">
      <Button asChild size="sm" variant="outline" className="rounded-full">
        <Link to="/admin/ptntour/$id" params={{ id: String(event.id) }}>
          <PencilSimpleIcon /> Edit
        </Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className="size-8" aria-label={`Aksi lain untuk ${event.title}`}>
            <DotsThreeIcon weight="bold" className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link to="/admin/ptntour/$id/participants" params={{ id: String(event.id) }}>
              <UsersThreeIcon className="mr-2 size-4" /> Lihat peserta
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => togglePublish.mutate({ id: event.id, isPublished: !event.isPublished })}>
            {event.isPublished ? <EyeSlashIcon className="mr-2 size-4" /> : <EyeIcon className="mr-2 size-4" />}
            {event.isPublished ? "Tarik ke draft" : "Tayangkan"}
          </DropdownMenuItem>
          <DropdownMenuItem disabled={duplicate.isPending} onClick={() => duplicate.mutate({ id: event.id })}>
            <CopyIcon className="mr-2 size-4" /> Duplikat
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onClick={() => askDelete(event)}>
            <TrashIcon className="mr-2 size-4" /> Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  const showCards = !isPending && list.pageItems.length > 0;

  return (
    <AdminContainer>
      <AdminHeader title="PTN Tour" description="Kelola event gratis: jadwal, link, materi, dan peserta">
        <Button asChild>
          <Link to="/admin/ptntour/create">
            <PlusIcon weight="bold" /> Buat Event
          </Link>
        </Button>
      </AdminHeader>

      <div className="mb-4 flex flex-col gap-3 rounded-sr-xl border border-sr-line bg-sr-ivory/60 p-3 shadow-sr-1 sm:flex-row sm:items-center">
        <AdminSearchInput
          className="flex-1"
          value={list.query}
          onChange={list.setQuery}
          placeholder="Cari judul, tutor, atau kategori…"
        />
        <FilterChips label="Filter status" value={filter} onChange={setFilter} options={FILTERS} />
      </div>

      <div className="overflow-hidden rounded-sr-xl border border-sr-line bg-white shadow-sr-1">
        <div className={showCards ? "hidden overflow-x-auto md:block" : "overflow-x-auto"}>
          <Table className="min-w-[860px]">
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Event</TableHead>
                <TableHead>Jadwal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pendaftar</TableHead>
                <TableHead>Hadir</TableHead>
                <TableHead>Beli paket</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending &&
                Array.from({ length: 4 }).map((_, index) => (
                  <TableRow key={index.toString()}>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-12 w-full" />
                    </TableCell>
                  </TableRow>
                ))}
              {!isPending && list.pageItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-14 text-center">
                    <p className="font-extrabold text-sr-ink">
                      {events?.length ? "Tidak ada event yang cocok" : "Belum ada event"}
                    </p>
                    <p className="mt-1 text-sm text-sr-muted">
                      {events?.length
                        ? "Ubah kata kunci atau filter."
                        : "Buat event pertama untuk mulai menerima pendaftar."}
                    </p>
                  </TableCell>
                </TableRow>
              )}
              {list.pageItems.map((event, index) => (
                <TableRow key={event.id} className="group animate-sr-rise" style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}>
                  <TableCell className="px-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <img
                        src={event.posterUrl}
                        alt=""
                        className="h-14 w-11 shrink-0 rounded-sr-sm object-cover ring-1 ring-sr-line transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-bold text-sr-ink">{event.title}</p>
                        <p className="truncate text-xs text-sr-muted">
                          {event.category} · {event.tutor}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap text-sr-ink">{formatWhen(event.startsAt)}</TableCell>
                  <TableCell>
                    <StatusBadges event={event} />
                  </TableCell>
                  <TableCell className="text-sm font-bold text-sr-ink">
                    {event.registrationCount}
                    {event.quota !== null && <span className="font-normal text-sr-muted"> / {event.quota}</span>}
                    {event.displayParticipantCount != null && (
                      <span className="block text-xs font-normal text-sr-muted">
                        Tampil ke siswa: {event.displayParticipantCount.toLocaleString("id-ID")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm font-bold text-sr-ink">{event.attendedCount}</TableCell>
                  <TableCell className="text-sm font-bold text-sr-ink">{event.purchasedCount}</TableCell>
                  <TableCell>{actions(event)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {showCards && (
          <ul className="divide-y divide-sr-line md:hidden">
            {list.pageItems.map((event, index) => (
              <li
                key={event.id}
                className="animate-sr-rise space-y-3 px-4 py-4 transition-colors duration-200 active:bg-sr-blue-50/60"
                style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={event.posterUrl}
                    alt=""
                    className="h-16 w-12 shrink-0 rounded-sr-sm object-cover ring-1 ring-sr-line"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sr-ink">{event.title}</p>
                    <p className="text-xs text-sr-muted">
                      {event.category} · {event.tutor}
                    </p>
                    <p className="mt-1 text-xs text-sr-ink">{formatWhen(event.startsAt)}</p>
                  </div>
                </div>
                <StatusBadges event={event} />
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-sr-muted">
                    <strong className="text-sr-ink">{event.registrationCount}</strong>
                    {event.quota !== null && ` / ${event.quota}`} pendaftar
                    {event.displayParticipantCount != null && ` (tampil ${event.displayParticipantCount})`} ·{" "}
                    <strong className="text-sr-ink">{event.attendedCount}</strong> hadir
                  </p>
                  {actions(event)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {list.total > 0 && (
        <AdminPagination
          className="mt-5"
          label="Event"
          page={list.page}
          total={list.total}
          pageSize={list.pageSize}
          onPageChange={list.setPage}
        />
      )}
      <SettingsCard websiteRegistrations={events?.reduce((sum, event) => sum + event.registrationCount, 0)} />
    </AdminContainer>
  );
}

const SETTING_FIELDS = [
  {
    key: "whatsapp_channel_url",
    label: "Link channel WhatsApp Habitutor",
    hint: "Tampil di halaman sukses daftar untuk semua event.",
  },
  {
    key: "promo_title",
    label: "Judul ajakan Premium",
    hint: "Dipakai di banner rekaman, pop-up terkunci, dan halaman sukses.",
  },
  {
    key: "promo_text",
    label: "Teks ajakan Premium",
    hint: "Tulis promo/harga di sini sekali; semua halaman ikut berubah.",
  },
  { key: "promo_cta_label", label: "Teks tombol", hint: "" },
  { key: "promo_cta_url", label: "Tujuan tombol", hint: "Contoh: /premium" },
] as const;

/** Pengaturan pusat: link channel WA dan teks promo yang sama untuk semua event. */
function SettingsCard({ websiteRegistrations }: { websiteRegistrations: number | undefined }) {
  const queryClient = useQueryClient();
  const { data } = useQuery(orpc.ptnTour.settings.queryOptions());
  const [draft, setDraft] = useState<Record<string, string>>({});
  const save = useMutation(
    orpc.ptnTour.admin.settings.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: orpc.ptnTour.settings.queryKey() });
        setDraft({});
        toast.success("Pengaturan disimpan");
      },
      onError: (error) => toast.error("Gagal menyimpan pengaturan", { description: error.message }),
    }),
  );
  const dirty = Object.keys(draft).length > 0;

  return (
    <section className="mt-6 animate-sr-rise rounded-sr-xl border border-sr-line bg-white p-5 shadow-sr-1 transition-shadow duration-300 hover:shadow-sr-2">
      <div className="mb-4 flex items-center gap-3">
        <span className="h-6 w-1.5 rounded-full bg-sr-sun-500" />
        <div>
          <h2 className="font-black text-sr-ink">Pengaturan pusat</h2>
          <p className="text-xs text-sr-muted">
            Berlaku untuk semua event, jadi harga atau tanggal promo tidak perlu diubah satu per satu.
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {SETTING_FIELDS.map((field) => (
          <div key={field.key} className={cn("grid gap-1.5", field.key === "promo_text" && "sm:col-span-2")}>
            <Label>{field.label}</Label>
            <Input
              value={draft[field.key] ?? data?.[field.key] ?? ""}
              onChange={(e) => setDraft((current) => ({ ...current, [field.key]: e.target.value }))}
            />
            {field.hint && <p className="text-xs text-sr-muted">{field.hint}</p>}
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-4 border-t border-sr-line pt-5 sm:grid-cols-2">
        <div className="grid content-start gap-1.5">
          <Label htmlFor="hero-participants">Total peserta di kartu atas PTN Tour</Label>
          <Input
            id="hero-participants"
            inputMode="numeric"
            placeholder="Kosongkan untuk menyembunyikan"
            value={draft.hero_participants ?? data?.hero_participants ?? ""}
            onChange={(e) =>
              setDraft((current) => ({ ...current, hero_participants: e.target.value.replace(/\D/g, "") }))
            }
          />
          <p className="text-xs text-sr-muted">
            Isi total peserta asli sejak PTN Tour pertama, termasuk sebelum ada website. Angka 500 tampil sebagai
            "500+ peserta sejak PTN Tour pertama".
            {websiteRegistrations !== undefined &&
              ` Sebagai acuan, pendaftaran lewat website: ${websiteRegistrations.toLocaleString("id-ID")}.`}
          </p>
        </div>
        <div className="flex items-start justify-between gap-4 rounded-sr-sm border border-sr-line p-3">
          <div className="grid gap-1">
            <Label htmlFor="show-event-counts">Tampilkan jumlah peserta tiap event ke siswa</Label>
            <p className="text-xs text-sr-muted">
              Angka dari isian di tiap event, atau pendaftar website kalau kosong. Kuota tidak pernah ditampilkan. Kalau dimatikan, hanya "Kuota penuh" yang tampil.
            </p>
          </div>
          <Switch
            id="show-event-counts"
            checked={(draft.show_event_counts ?? data?.show_event_counts) === "true"}
            onCheckedChange={(checked) => setDraft((current) => ({ ...current, show_event_counts: String(checked) }))}
          />
        </div>
      </div>
      <Button className="mt-4" disabled={!dirty || save.isPending} onClick={() => save.mutate(draft)}>
        {save.isPending ? "Menyimpan…" : "Simpan Pengaturan"}
      </Button>
    </section>
  );
}
