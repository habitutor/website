import { ArrowCircleRightIcon, ClockIcon, LockKeyIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type LiveClassCategory = "TKA" | "SNBT" | "MANDIRI";
export type LiveClassStatus = "upcoming" | "live" | "ended";
export type LiveClassLockReason = "premium" | "package" | "mandiri" | "tier";

const LOCK_LABEL: Record<LiveClassLockReason, string> = {
  premium: "Buka dengan Premium",
  mandiri: "Upgrade ke Paket Mandiri",
  package: "Tidak termasuk paketmu",
  tier: "Tidak termasuk paketmu",
};

const ACTION_BASE = "flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold";

/** Tombol aksi kartu live class di dashboard: kunci akses, gabung, atau jam link dibuka. */
export function LiveClassJoinAction({
  link,
  lockReason,
  joinOpensAt,
}: {
  link: string | null;
  lockReason: LiveClassLockReason | null;
  joinOpensAt: string;
}) {
  if (lockReason === "tier" || lockReason === "package") {
    return (
      <span className={cn(ACTION_BASE, "border border-sr-line-2 bg-sr-ivory font-semibold text-sr-muted")}>
        <LockKeyIcon weight="fill" className="size-4" /> {LOCK_LABEL.tier}
      </span>
    );
  }

  if (lockReason) {
    return (
      <Link to="/premium" className={cn(ACTION_BASE, "sr-action bg-sr-sun-500 text-sr-ink")}>
        <LockKeyIcon weight="fill" className="size-4" /> {LOCK_LABEL[lockReason]}
      </Link>
    );
  }

  if (link) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(ACTION_BASE, "sr-sheen sr-action bg-sr-blue-500 text-white")}
      >
        Gabung Sekarang <ArrowCircleRightIcon weight="fill" className="size-5" />
      </a>
    );
  }

  return (
    <span
      className={cn(ACTION_BASE, "border border-dashed border-sr-line-2 bg-sr-blue-50 font-semibold text-sr-muted")}
      title="Tombol Gabung aktif 15 menit sebelum kelas dimulai"
    >
      <ClockIcon weight="bold" className="size-4" /> Link dibuka {formatWibTime(joinOpensAt)} WIB
    </span>
  );
}

// Warna kategori mengikuti kartu Kelas: biru, kuning, oranye.
export const LIVE_CLASS_CATEGORY_STYLE: Record<
  LiveClassCategory,
  { label: string; badge: string; art: string; mark: string }
> = {
  TKA: {
    label: "TKA",
    badge: "bg-sr-blue-500 text-white",
    art: "from-sr-blue-100 to-sr-blue-200",
    mark: "text-sr-blue-300/60",
  },
  SNBT: {
    label: "SNBT",
    badge: "bg-sr-sun-500 text-sr-ink",
    art: "from-sr-sun-100 to-sr-sun-200",
    mark: "text-sr-sun-400/60",
  },
  MANDIRI: {
    label: "Mandiri",
    badge: "bg-sr-orange-500 text-white",
    art: "from-sr-orange-100 to-sr-orange-200",
    mark: "text-sr-orange-200",
  },
};

const STATUS_BADGE: Record<LiveClassStatus, { label: string; className: string }> = {
  upcoming: { label: "Akan datang", className: "bg-white/80 text-sr-ink-2" },
  live: { label: "Sedang live", className: "bg-sr-live text-white" },
  ended: { label: "Selesai", className: "bg-white/70 text-sr-muted" },
};

export function formatWibTime(iso: string) {
  return new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" })
    .format(new Date(iso))
    .replace(":", ".");
}

/**
 * Kartu jadwal live class yang sama di halaman Live Class dan dashboard.
 * Tombol aksinya diisi pemanggil karena aturan aksesnya beda di tiap halaman.
 */
export function LiveClassScheduleCard({
  title,
  teacher,
  category,
  startsAt,
  endsAt,
  status,
  dateLabel,
  action,
}: {
  title: string;
  teacher: string;
  category: LiveClassCategory;
  startsAt: string;
  endsAt: string;
  status: LiveClassStatus;
  /** Tanggal ditampilkan di pita atas (dipakai di dashboard yang memuat banyak hari). */
  dateLabel?: string;
  action: ReactNode;
}) {
  const style = LIVE_CLASS_CATEGORY_STYLE[category] ?? LIVE_CLASS_CATEGORY_STYLE.SNBT;
  const statusBadge = STATUS_BADGE[status];
  const isLive = status === "live";

  return (
    <article
      className={cn(
        "group relative flex h-full w-full sr-lift flex-col overflow-hidden rounded-sr-xl border bg-white shadow-sr-1",
        isLive ? "border-sr-live ring-2 ring-sr-live/30" : "border-sr-line",
        status === "ended" && "opacity-75",
      )}
    >
      {/* Pita atas: jam mulai dibuat besar supaya jadwal terbaca sekilas. */}
      <div className={cn("relative overflow-hidden bg-linear-to-br px-4 pt-4 pb-5", style.art)}>
        <div className="pointer-events-none absolute -right-8 -bottom-14 size-36 rounded-full bg-white/45" />
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute right-3 bottom-1 text-4xl leading-none font-extrabold tracking-tight uppercase select-none",
            style.mark,
          )}
        >
          {style.label}
        </span>
        <div className="relative flex flex-wrap items-center gap-2">
          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold shadow-sr-1", style.badge)}>
            {style.label}
          </span>
          <span
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold",
              statusBadge.className,
            )}
          >
            {isLive && <span className="size-1.5 rounded-full bg-white motion-safe:animate-pulse" />}
            {statusBadge.label}
          </span>
        </div>
        {dateLabel && <p className="relative mt-3 text-xs font-bold text-sr-ink-2 capitalize">{dateLabel}</p>}
        <p
          className={cn(
            "relative text-3xl leading-none font-extrabold text-sr-ink tabular-nums",
            dateLabel ? "mt-1" : "mt-3",
          )}
        >
          {formatWibTime(startsAt)}
        </p>
        <p className="relative mt-1 text-sm font-semibold text-sr-ink-2">sampai {formatWibTime(endsAt)} WIB</p>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-2 leading-snug font-extrabold text-pretty text-sr-ink transition-colors group-hover:text-sr-blue-600">
          {title}
        </h3>
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sr-sun-100 text-sm font-extrabold text-sr-amber-700">
            {teacher.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="text-xs text-sr-muted">Mentor</p>
            <p className="truncate text-sm font-bold text-sr-ink">{teacher}</p>
          </div>
        </div>
        <div className="mt-auto pt-1">{action}</div>
      </div>
    </article>
  );
}
