import { useEffect, useState } from "react";
import type { client } from "@/utils/orpc";

export type PtnEvent = Awaited<ReturnType<typeof client.ptnTour.list>>[number];

export const EVENT_SUBJECTS = ["PU", "PK", "Literasi", "TKA", "Strategi"] as const;

export const EVENT_CATEGORIES = ["Semua", "Masterclass", "Kelas Gratis PTN Tour", "Intensif"] as const;

const TIME_ZONE = "Asia/Jakarta";

export const formatDate = (date: Date | string) =>
  new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: TIME_ZONE });

export const formatLongDate = (date: Date | string) =>
  new Date(date).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TIME_ZONE,
  });

export const formatTime = (date: Date | string) =>
  `${new Date(date)
    .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TIME_ZONE })
    .replace(":", ".")} WIB`;

export type EventStatusKey = "open" | "registered" | "live" | "ended" | "full" | "cancelled";

/** Satu sumber kebenaran untuk badge status dan tombol aksi kartu/detail. */
export function getEventStatus(
  event: PtnEvent,
  isPremium = false,
): { key: EventStatusKey; label: string; tone: string } {
  if (event.scheduleStatus === "cancelled") return { key: "cancelled", label: "Dibatalkan", tone: "bg-destructive text-white" };
  if (event.phase === "ended") return { key: "ended", label: "Selesai", tone: "bg-sr-ink/85 text-white" };
  if (event.phase === "live") return { key: "live", label: "Live sekarang", tone: "bg-sr-live text-white" };
  if (event.registered) return { key: "registered", label: "Terdaftar", tone: "bg-sr-blue-500 text-white" };
  if (event.isFull && !isPremium) return { key: "full", label: "Penuh", tone: "bg-destructive text-white" };
  if (event.scheduleStatus === "rescheduled") return { key: "open", label: "Dijadwal ulang", tone: "bg-sr-sun-100 text-sr-amber-700" };
  return { key: "open", label: "Daftar dibuka", tone: "bg-white/95 text-sr-ink" };
}

/** Total peserta di kartu atas, diisi admin. Null berarti disembunyikan. */
export function parseHeroParticipants(value: string | undefined) {
  const total = Number(value);
  return Number.isInteger(total) && total > 0 ? total : null;
}

/** Jumlah peserta untuk kotak info ketiga; null kalau admin menyembunyikannya. Kuota tidak ditampilkan ke siswa. */
export function getSpotsLabel(event: PtnEvent, showCounts: boolean) {
  // "Kuota penuh" selalu tampil supaya siswa tahu kenapa tidak bisa daftar.
  if (event.isFull) return "Kuota penuh";
  if (!showCounts) return null;
  const total = event.registrationCount.toLocaleString("id-ID");
  return event.phase === "ended" ? `${total} peserta` : `${total} terdaftar`;
}

const toCalendarStamp = (date: Date) =>
  date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

export function getGoogleCalendarUrl(event: PtnEvent, origin: string) {
  const start = new Date(event.startsAt);
  const end = new Date(event.endsAt);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${event.title} - Habitutor`,
    dates: `${toCalendarStamp(start)}/${toCalendarStamp(end)}`,
    details: `${event.description}\n\nInfo lengkap: ${origin}/ptntour/${event.slug}`,
    ctz: TIME_ZONE,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Rundown ditulis admin per baris: "19.30 | Pembukaan". Baris tanpa "|" ditampilkan sebagai teks biasa. */
export function parseRundown(rundown: string | null | undefined) {
  return (rundown ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      // Format yang diterima: "19.30 | Pembukaan", "19.30 - Pembukaan", atau "19.30 Pembukaan".
      const match = line.match(/^(\d{1,2}[.:]\d{2}(?:\s*[-–]\s*\d{1,2}[.:]\d{2})?)\s*(?:[|\-–:]\s*)?(.+)$/);
      if (match?.[1] && match[2]) return { time: match[1].trim(), text: match[2].trim() };
      const [time, ...rest] = line.split("|");
      return rest.length ? { time: time?.trim() ?? "", text: rest.join("|").trim() } : { time: "", text: line };
    });
}

function formatRemaining(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  if (days > 0) return `${days} hari ${hours} jam lagi`;
  if (hours > 0) return `${hours} jam ${mins} menit lagi`;
  if (mins > 0) return `${mins} menit lagi`;
  return "Sebentar lagi";
}

/** Hitung mundur ke waktu mulai; kosong saat belum di-hydrate atau event sudah mulai. */
export function useCountdown(target: Date | string, active = true) {
  const [label, setLabel] = useState("");
  useEffect(() => {
    if (!active) {
      setLabel("");
      return;
    }
    const tick = () => {
      const ms = new Date(target).getTime() - Date.now();
      setLabel(ms > 0 ? formatRemaining(ms) : "");
    };
    tick();
    const timer = window.setInterval(tick, 30_000);
    return () => window.clearInterval(timer);
  }, [target, active]);
  return label;
}

export type CountdownParts = { days: number; hours: number; minutes: number; seconds: number };

/** Hitung mundur per detik untuk ubin angka di halaman detail. Null bila waktu sudah lewat atau tidak aktif. */
export function useCountdownParts(target: Date | string, active = true) {
  const [parts, setParts] = useState<CountdownParts | null>(null);
  useEffect(() => {
    if (!active) {
      setParts(null);
      return;
    }
    const tick = () => {
      const ms = new Date(target).getTime() - Date.now();
      if (ms <= 0) return setParts(null);
      const total = Math.floor(ms / 1000);
      setParts({
        days: Math.floor(total / 86_400),
        hours: Math.floor((total % 86_400) / 3600),
        minutes: Math.floor((total % 3600) / 60),
        seconds: total % 60,
      });
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [target, active]);
  return parts;
}

export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/habitutor.id",
  instagramTutor: "https://www.instagram.com/zhafirr.ah",
  tiktok: "https://www.tiktok.com/@habitutor.id",
} as const;

export function buildShareCaption(event: Pick<PtnEvent, "title" | "slug">, origin: string) {
  return `Ikut ${event.title} dari Habitutor, GRATIS! Daftar di ${origin}/ptntour/${event.slug} #PTNTour #SNBT #Habitutor`;
}

/** Label akses di kartu/detail: gratis untuk semua, sebagian gratis, atau khusus Premium. */
export function getAccessBadge(event: Pick<PtnEvent, "accessMode">) {
  if (event.accessMode === "premium") return { label: "PREMIUM", tone: "bg-sr-ink text-sr-sun-400" };
  if (event.accessMode === "mixed") return { label: "SEBAGIAN GRATIS", tone: "bg-sr-sun-400 text-sr-ink" };
  return { label: "GRATIS", tone: "bg-sr-sun-400 text-sr-ink" };
}

export function isPremiumLocked(event: Pick<PtnEvent, "accessMode">, isPremium: boolean) {
  return event.accessMode === "premium" && !isPremium;
}
