import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const EVENT_CATEGORY_OPTIONS = ["Masterclass", "Kelas Gratis PTN Tour", "Intensif"] as const;
export const ACCESS_MODE_OPTIONS = [
  { value: "free", label: "Gratis", hint: "Semua akun boleh ikut" },
  { value: "premium", label: "Premium", hint: "Khusus member Premium" },
  { value: "mixed", label: "Campuran", hint: "Sesi pembuka gratis, sisanya Premium" },
] as const;

export type EventFormValues = {
  title: string;
  slug: string;
  category: (typeof EVENT_CATEGORY_OPTIONS)[number];
  startsAt: string; // "YYYY-MM-DDTHH:mm" dalam WIB
  durationMinutes: string;
  quota: string;
  tutor: string;
  campus: string;
  posterUrl: string;
  description: string;
  longDescription: string;
  rundown: string;
  whatsappGroupUrl: string;
  zoomUrl: string;
  recordingUrl: string;
  recordingFreeDays: string;
  accessMode: "free" | "premium" | "mixed";
  isPublished: boolean;
};

export const EMPTY_EVENT_FORM: EventFormValues = {
  title: "",
  slug: "",
  category: "Masterclass",
  startsAt: "",
  durationMinutes: "120",
  quota: "",
  tutor: "",
  campus: "",
  posterUrl: "/event-placeholder.svg",
  description: "",
  longDescription: "",
  rundown: "",
  whatsappGroupUrl: "",
  zoomUrl: "",
  recordingUrl: "",
  recordingFreeDays: "30",
  accessMode: "free",
  isPublished: false,
};

const WIB = "Asia/Jakarta";

/** Date -> nilai input datetime-local dalam WIB, apa pun zona waktu browser admin. */
export function toWibInput(date: Date | string) {
  return new Date(date).toLocaleString("sv-SE", { timeZone: WIB }).replace(" ", "T").slice(0, 16);
}

/** Nilai input datetime-local (WIB) -> ISO UTC untuk API. */
export function fromWibInput(value: string) {
  return new Date(`${value}:00+07:00`).toISOString();
}

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const selectClass =
  "h-10 w-full rounded-full border-2 border-sr-line-2 bg-white px-4 text-sm text-sr-ink outline-none focus:border-sr-blue-500 focus:ring-[3px] focus:ring-sr-blue-500/30";

function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs text-sr-muted">{hint}</p>}
    </div>
  );
}

function Group({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-sr-xl border border-sr-line bg-white p-5 shadow-sr-1">
      <div className="mb-4 flex items-center gap-3">
        <span className="h-6 w-1.5 rounded-full bg-sr-sun-500" />
        <div>
          <h2 className="font-black text-sr-ink">{title}</h2>
          {description && <p className="text-xs text-sr-muted">{description}</p>}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function EventForm({
  initial,
  mode,
  submitting,
  onSubmit,
  onCancel,
}: {
  initial: EventFormValues;
  mode: "create" | "edit";
  submitting: boolean;
  onSubmit: (values: EventFormValues) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const set = <K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const shortLength = form.description.trim().length;
  const valid =
    form.title.trim() &&
    form.slug.trim() &&
    form.startsAt &&
    form.tutor.trim() &&
    form.campus.trim() &&
    form.posterUrl.trim() &&
    form.description.trim() &&
    shortLength <= 160;

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (valid) onSubmit(form);
      }}
    >
      <Group title="Informasi utama" description="Tampil di kartu dan halaman detail.">
        <Field label="Judul event *" className="sm:col-span-2">
          <Input
            value={form.title}
            onChange={(e) => {
              set("title", e.target.value);
              if (!slugTouched) set("slug", slugify(e.target.value));
            }}
            placeholder="Contoh: Bedah Pola Soal TKA Gel 2"
            required
          />
        </Field>
        <Field label="Link event (slug) *" hint={`habitutor.id/ptntour/${form.slug || "judul-event"}`}>
          <Input
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              set("slug", slugify(e.target.value));
            }}
            required
          />
        </Field>
        <Field label="Kategori *">
          <select
            className={selectClass}
            value={form.category}
            onChange={(e) => set("category", e.target.value as EventFormValues["category"])}
          >
            {EVENT_CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Tutor *">
          <Input value={form.tutor} onChange={(e) => set("tutor", e.target.value)} placeholder="Kak Zhafir" required />
        </Field>
        <Field label="Kampus / jurusan tutor *">
          <Input
            value={form.campus}
            onChange={(e) => set("campus", e.target.value)}
            placeholder="UI · Pendidikan"
            required
          />
        </Field>
        <Field
          label="Deskripsi singkat (untuk kartu) *"
          hint={`${shortLength}/160 karakter. Targetkan sekitar 120: apa yang dibahas + hasil untuk peserta.`}
          className="sm:col-span-2"
        >
          <Textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={2}
            maxLength={200}
            className={cn(shortLength > 160 && "border-destructive")}
            required
          />
        </Field>
      </Group>

      <Group title="Jadwal & kuota" description="Waktu dibaca dalam WIB.">
        <Field label="Tanggal & jam mulai (WIB) *">
          <Input
            type="datetime-local"
            value={form.startsAt}
            onChange={(e) => set("startsAt", e.target.value)}
            required
          />
        </Field>
        <Field label="Durasi (menit)" hint="Dipakai untuk status Live dan Selesai otomatis.">
          <Input
            type="number"
            min={15}
            max={600}
            value={form.durationMinutes}
            onChange={(e) => set("durationMinutes", e.target.value)}
          />
        </Field>
        <Field label="Kuota peserta" hint="Kosongkan untuk tanpa batas.">
          <Input
            type="number"
            min={1}
            value={form.quota}
            onChange={(e) => set("quota", e.target.value)}
            placeholder="Tanpa batas"
          />
        </Field>
        <Field label="Mode akses">
          <select
            className={selectClass}
            value={form.accessMode}
            onChange={(e) => set("accessMode", e.target.value as EventFormValues["accessMode"])}
          >
            {ACCESS_MODE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} — {option.hint}
              </option>
            ))}
          </select>
        </Field>
      </Group>

      <Group title="Poster" description="Pakai poster dari Canva apa adanya, rasio 4:5 (seperti poster IG).">
        <Field label="Alamat gambar poster *" className="sm:col-span-1">
          <Input
            value={form.posterUrl}
            onChange={(e) => set("posterUrl", e.target.value)}
            placeholder="https://… atau /event-placeholder.svg"
            required
          />
        </Field>
        <div className="flex items-center justify-center rounded-sr-lg border border-dashed border-sr-line bg-sr-ivory/60 p-3">
          {form.posterUrl ? (
            <img
              src={form.posterUrl}
              alt="Pratinjau poster"
              className="aspect-4/5 h-48 rounded-sr-md object-cover shadow-sr-1"
            />
          ) : (
            <p className="text-sm text-sr-muted">Pratinjau poster</p>
          )}
        </div>
      </Group>

      <Group title="Isi halaman detail" description="Opsional tetapi sangat membantu peserta.">
        <Field
          label="Deskripsi lengkap"
          hint="Hook 1 kalimat, profil tutor, 'Yang kalian dapet', bonus, dan penutup."
          className="sm:col-span-2"
        >
          <Textarea value={form.longDescription} onChange={(e) => set("longDescription", e.target.value)} rows={6} />
        </Field>
        <Field label="Rundown acara" hint="Satu baris per sesi, format: 19.30 | Pembukaan" className="sm:col-span-2">
          <Textarea
            value={form.rundown}
            onChange={(e) => set("rundown", e.target.value)}
            rows={4}
            placeholder={"19.30 | Pembukaan\n19.40 | Materi utama\n20.30 | Tanya jawab"}
          />
        </Field>
      </Group>

      <Group
        title="Link & rekaman"
        description="Link Zoom dan rekaman hanya dikirim ke peserta yang berhak, tidak tampil publik."
      >
        <Field label="Link grup WhatsApp event" hint="Muncul setelah peserta terdaftar.">
          <Input
            type="url"
            value={form.whatsappGroupUrl}
            onChange={(e) => set("whatsappGroupUrl", e.target.value)}
            placeholder="https://chat.whatsapp.com/…"
          />
        </Field>
        <Field label="Link Zoom" hint="Gunakan link berbeda untuk tiap event dan aktifkan waiting room.">
          <Input
            type="url"
            value={form.zoomUrl}
            onChange={(e) => set("zoomUrl", e.target.value)}
            placeholder="https://zoom.us/j/…"
          />
        </Field>
        <Field
          label="Link rekaman"
          hint="Isi setelah event selesai. Disarankan YouTube (tidak terdaftar), bukan Google Drive."
        >
          <Input
            type="url"
            value={form.recordingUrl}
            onChange={(e) => set("recordingUrl", e.target.value)}
            placeholder="https://youtu.be/…"
          />
        </Field>
        <Field
          label="Rekaman gratis (hari)"
          hint="Berapa hari akun gratis bisa menonton setelah event. 0 = tanpa batas."
        >
          <Input
            type="number"
            min={0}
            value={form.recordingFreeDays}
            onChange={(e) => set("recordingFreeDays", e.target.value)}
          />
        </Field>
      </Group>

      <section className="flex flex-col gap-3 rounded-sr-xl border border-sr-line bg-white p-5 shadow-sr-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-black text-sr-ink">Status tayang</h2>
          <p className="text-xs text-sr-muted">
            Draft tidak terlihat siswa. Pastikan semua data sudah benar sebelum menayangkan.
          </p>
        </div>
        <div
          role="group"
          aria-label="Status tayang"
          className="flex gap-1 rounded-full border border-sr-line bg-sr-ivory p-1"
        >
          {([false, true] as const).map((published) => (
            <button
              key={String(published)}
              type="button"
              aria-pressed={form.isPublished === published}
              onClick={() => set("isPublished", published)}
              className={cn(
                "min-w-28 rounded-full px-4 py-2 text-sm font-bold transition-all",
                form.isPublished === published
                  ? published
                    ? "bg-sr-live text-white shadow-sr-1"
                    : "bg-sr-ink text-white shadow-sr-1"
                  : "text-sr-muted hover:bg-white hover:text-sr-ink",
              )}
            >
              {published ? "Tayang" : "Draft"}
            </button>
          ))}
        </div>
      </section>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" disabled={!valid || submitting}>
          {submitting ? "Menyimpan…" : mode === "create" ? "Simpan Event" : "Simpan Perubahan"}
        </Button>
      </div>
    </form>
  );
}

/** Ubah isian form menjadi payload API (string kosong -> null, angka -> number). */
export function toEventPayload(form: EventFormValues) {
  const nullable = (value: string) => (value.trim() ? value.trim() : null);
  return {
    slug: form.slug.trim(),
    title: form.title.trim(),
    category: form.category,
    description: form.description.trim(),
    longDescription: nullable(form.longDescription),
    rundown: nullable(form.rundown),
    tutor: form.tutor.trim(),
    campus: form.campus.trim(),
    posterUrl: form.posterUrl.trim(),
    startsAt: fromWibInput(form.startsAt),
    durationMinutes: Number(form.durationMinutes) || 120,
    quota: form.quota.trim() ? Number(form.quota) : null,
    whatsappGroupUrl: nullable(form.whatsappGroupUrl),
    zoomUrl: nullable(form.zoomUrl),
    recordingUrl: nullable(form.recordingUrl),
    recordingFreeDays: Number(form.recordingFreeDays) || 0,
    accessMode: form.accessMode,
    isPublished: form.isPublished,
  };
}
