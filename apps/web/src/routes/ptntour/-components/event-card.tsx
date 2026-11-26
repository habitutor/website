import {
  CalendarBlankIcon,
  ClockIcon,
  GiftIcon,
  PlayCircleIcon,
  TimerIcon,
  UsersThreeIcon,
  VideoCameraIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePtnTourSettings, useJoinEvent, useWatchRecording } from "../-hooks";
import {
  formatDate,
  formatTime,
  getAccessBadge,
  getEventStatus,
  getSpotsLabel,
  isPremiumLocked,
  type PtnEvent,
  useCountdown,
} from "../-lib";
import { RecordingLockedDialog } from "./recording-locked-dialog";

export function EventCard({ event, isPremium, index = 0 }: { event: PtnEvent; isPremium: boolean; index?: number }) {
  const status = getEventStatus(event, isPremium);
  const countdown = useCountdown(event.startsAt, status.key === "registered" || status.key === "open");
  const join = useJoinEvent();
  const watch = useWatchRecording();
  const canJoin = status.key === "live" && (event.registered || isPremium);
  const access = getAccessBadge(event);
  const premiumLocked = isPremiumLocked(event, isPremium);
  const { data: settings } = usePtnTourSettings();
  const showCounts = settings?.show_event_counts === "true";
  const spotsLabel = getSpotsLabel(event, showCounts);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min(index % 3, 2) * 0.08, ease: [0.2, 0.7, 0.2, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.3, ease: [0.34, 1.3, 0.64, 1] } }}
      className={cn(
        "group flex flex-col overflow-hidden rounded-sr-xl border bg-white shadow-sr-1 transition-shadow duration-300 hover:shadow-sr-3",
        status.key === "live" ? "border-sr-live/50 ring-2 ring-sr-live/30" : "border-sr-line hover:border-sr-blue-200",
      )}
    >
      <Link to="/ptntour/$slug" params={{ slug: event.slug }} className="relative block overflow-hidden bg-sr-blue-50">
        <img
          src={event.posterUrl}
          alt={`Poster ${event.title}`}
          loading={index < 3 ? "eager" : "lazy"}
          className="aspect-4/5 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-sr-ink/70 to-transparent" />
        <span
          className={cn(
            "absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-sr-1 backdrop-blur",
            status.tone,
          )}
        >
          {status.key === "live" && <span className="size-2 animate-pulse rounded-full bg-white" />}
          {status.label}
        </span>
        <span
          className={cn(
            "absolute top-3 right-3 rounded-full px-2.5 py-1 text-[11px] font-black shadow-sr-1",
            access.tone,
          )}
        >
          {access.label}
        </span>
        {countdown && (status.key === "registered" || status.key === "open") && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-sr-ink shadow-sr-1">
            <TimerIcon weight="fill" className="size-3.5 text-sr-blue-500" />
            Mulai {countdown}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <p className="text-[11px] font-black tracking-wider text-sr-blue-600 uppercase">{event.category}</p>
        <div>
          <Link to="/ptntour/$slug" params={{ slug: event.slug }}>
            <h2 className="text-lg leading-snug font-black text-balance text-sr-ink transition-colors group-hover:text-sr-blue-700">
              {event.title}
            </h2>
          </Link>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-sr-muted">{event.description}</p>
        </div>

        <div className="flex items-center gap-2.5">
          {event.tutorPhotoUrl ? (
            <img src={event.tutorPhotoUrl} alt="" className="size-8 shrink-0 rounded-full object-cover" />
          ) : (
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sr-blue-50 text-sm font-black text-sr-blue-700">
              {event.tutor
                .replace(/^Kak\s+/i, "")
                .charAt(0)
                .toUpperCase()}
            </span>
          )}
          <p className="min-w-0 truncate text-sm font-bold text-sr-ink">
            {event.tutor} <span className="font-medium text-sr-muted">· {event.campus}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-semibold text-sr-ink-2">
          <span className="inline-flex items-center gap-1.5">
            <CalendarBlankIcon weight="fill" className="size-4 text-sr-blue-500" />
            {formatDate(event.startsAt)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ClockIcon weight="fill" className="size-4 text-sr-blue-500" />
            {formatTime(event.startsAt)}
          </span>
        </div>

        {spotsLabel && (
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-sr-ink-2">
            <UsersThreeIcon weight="fill" className="size-4 text-sr-blue-500" />
            {spotsLabel}
          </p>
        )}

        {event.bonus.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {event.bonus.slice(0, 2).map((bonus) => (
              <span
                key={bonus}
                className="inline-flex items-center gap-1 rounded-full bg-sr-sun-100 px-2.5 py-1 text-[11px] font-bold text-sr-amber-700"
              >
                <GiftIcon weight="fill" className="size-3" />
                {bonus}
              </span>
            ))}
            {event.bonus.length > 2 && (
              <span className="rounded-full bg-sr-ivory px-2.5 py-1 text-[11px] font-bold text-sr-muted">
                +{event.bonus.length - 2} lainnya
              </span>
            )}
          </div>
        )}

        <div className="mt-auto pt-1">
          {canJoin ? (
            <Button
              className="w-full bg-sr-live text-white hover:bg-sr-live/90"
              disabled={join.isPending}
              onClick={() => join.mutate({ eventId: event.id })}
            >
              <VideoCameraIcon weight="fill" />
              {join.isPending ? "Membuka Zoom…" : "Join Zoom"}
            </Button>
          ) : status.key === "cancelled" ? (
            <Button className="w-full" disabled>
              Event Dibatalkan
            </Button>
          ) : status.key === "ended" ? (
            event.hasRecording && (event.registered || isPremium) ? (
              <Button className="w-full" disabled={watch.isPending} onClick={() => watch.mutate(event.slug)}>
                <PlayCircleIcon weight="fill" />
                {watch.isPending ? "Membuka…" : "Tonton Rekaman"}
              </Button>
            ) : (
              <Button asChild className="w-full" variant={event.hasRecording ? "default" : "outline"}>
                <Link to="/ptntour/$slug" params={{ slug: event.slug }}>
                  {event.hasRecording ? "Daftar untuk Tonton" : "Lihat Detail"}
                </Link>
              </Button>
            )
          ) : premiumLocked ? (
            <Button asChild className="w-full" variant="outline">
              <Link to="/premium">Khusus Premium</Link>
            </Button>
          ) : status.key === "full" ? (
            <Button className="w-full" disabled>
              Kuota Penuh
            </Button>
          ) : (
            <Button
              asChild
              className={cn("w-full", status.key !== "registered" && "sr-sheen")}
              variant={status.key === "registered" ? "outline" : "default"}
            >
              <Link to="/ptntour/$slug" params={{ slug: event.slug }}>
                {status.key === "registered" ? "Lihat Detail" : isPremium ? "Lihat Event" : "Daftar Gratis"}
              </Link>
            </Button>
          )}
        </div>
      </div>
      <RecordingLockedDialog message={watch.locked} onClose={watch.closeLocked} />
    </motion.article>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-sr-xl border border-sr-line bg-white shadow-sr-1">
      <div className="aspect-4/5 animate-pulse bg-sr-blue-50" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-24 animate-pulse rounded-full bg-sr-blue-50" />
        <div className="h-5 w-4/5 animate-pulse rounded-full bg-sr-blue-50" />
        <div className="h-4 w-full animate-pulse rounded-full bg-sr-blue-50" />
        <div className="h-10 w-full animate-pulse rounded-full bg-sr-blue-50" />
      </div>
    </div>
  );
}
