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

export type EventStatusKey = "open" | "registered" | "live" | "ended" | "full";

/** Satu sumber kebenaran untuk badge status dan tombol aksi kartu/detail. */
export function getEventStatus(
  event: PtnEvent,
  isPremium = false,
): { key: EventStatusKey; label: string; tone: string } {
  if (event.phase === "ended") return { key: "ended", label: "Selesai", tone: "bg-sr-ink/85 text-white" };
  if (event.phase === "live") return { key: "live", label: "Live sekarang", tone: "bg-sr-live text-white" };
  if (event.registered) return { key: "registered", label: "Terdaftar", tone: "bg-sr-blue-500 text-white" };
  if (event.isFull && !isPremium) return { key: "full", label: "Penuh", tone: "bg-destructive text-white" };
  return { key: "open", label: "Daftar dibuka", tone: "bg-white/95 text-sr-ink" };
}

/** Sisa kuota / jumlah pendaftar untuk kotak info ketiga. */
export function getSpotsLabel(event: PtnEvent) {
  if (event.phase === "ended") return `${event.registrationCount.toLocaleString("id-ID")} peserta`;
  if (event.spotsLeft !== null) return event.spotsLeft === 0 ? "Kuota penuh" : `${event.spotsLeft} kursi tersisa`;
  return `${event.registrationCount.toLocaleString("id-ID")} terdaftar`;
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
