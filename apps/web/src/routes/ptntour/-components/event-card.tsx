import { CalendarBlankIcon, ClockIcon, PlayCircleIcon, UsersThreeIcon, VideoCameraIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useJoinEvent, useWatchRecording } from "../-hooks";
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

  return (
    <article
      className="group flex animate-sr-rise flex-col overflow-hidden rounded-sr-xl border border-sr-line bg-white shadow-sr-1 transition-all duration-300 hover:-translate-y-1 hover:border-sr-blue-200 hover:shadow-sr-2"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <Link to="/ptntour/$slug" params={{ slug: event.slug }} className="relative block overflow-hidden bg-sr-blue-50">
        <img
          src={event.posterUrl}
          alt={`Poster ${event.title}`}
          loading={index < 3 ? "eager" : "lazy"}
          className="aspect-4/5 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className={cn(
            "absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-sr-1",
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
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="text-xs font-bold tracking-wide text-sr-blue-600 uppercase">{event.category}</p>
        <div>
          <h2 className="text-lg leading-snug font-black text-sr-ink">{event.title}</h2>
          <p className="mt-1 line-clamp-2 text-sm text-sr-muted">{event.description}</p>
        </div>
        <p className="text-sm font-bold text-sr-ink">
          {event.tutor} <span className="font-medium text-sr-muted">· {event.campus}</span>
        </p>

        <div className="grid grid-cols-3 gap-2 text-center text-[11px] leading-tight text-sr-muted">
          <span className="flex flex-col items-center gap-1 rounded-sr-md bg-sr-blue-50/70 px-1 py-2">
            <CalendarBlankIcon weight="fill" className="size-4 text-sr-blue-500" />
            {formatDate(event.startsAt)}
          </span>
          <span className="flex flex-col items-center gap-1 rounded-sr-md bg-sr-blue-50/70 px-1 py-2">
            <ClockIcon weight="fill" className="size-4 text-sr-blue-500" />
            {formatTime(event.startsAt)}
          </span>
          <span className="flex flex-col items-center gap-1 rounded-sr-md bg-sr-blue-50/70 px-1 py-2">
            <UsersThreeIcon weight="fill" className="size-4 text-sr-blue-500" />
            {getSpotsLabel(event)}
          </span>
        </div>

        {event.bonus.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {event.bonus.slice(0, 3).map((bonus) => (
              <span
                key={bonus}
                className="rounded-full bg-sr-sun-100 px-2 py-1 text-[11px] font-bold text-sr-amber-700"
              >
                + {bonus}
              </span>
            ))}
            {event.bonus.length > 3 && (
              <span className="rounded-full bg-sr-ivory px-2 py-1 text-[11px] font-bold text-sr-muted">
                +{event.bonus.length - 3} lainnya
              </span>
            )}
          </div>
        )}

        <div className="mt-auto space-y-2 pt-1">
          {countdown && status.key === "registered" && (
            <p className="text-center text-xs font-bold text-sr-blue-600">Mulai {countdown}</p>
          )}
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
            <Button asChild className="w-full" variant={status.key === "registered" ? "outline" : "default"}>
              <Link to="/ptntour/$slug" params={{ slug: event.slug }}>
                {status.key === "registered" ? "Lihat Detail" : isPremium ? "Lihat Event" : "Daftar Gratis"}
              </Link>
            </Button>
          )}
        </div>
      </div>
      <RecordingLockedDialog message={watch.locked} onClose={watch.closeLocked} />
    </article>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-sr-xl border border-sr-line bg-white shadow-sr-1">
      <div className="aspect-4/5 animate-pulse bg-sr-blue-50" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-24 animate-pulse rounded-full bg-sr-blue-50" />
        <div className="h-5 w-4/5 animate-pulse rounded-full bg-sr-blue-50" />
        <div className="h-4 w-full animate-pulse rounded-full bg-sr-blue-50" />
        <div className="h-10 w-full animate-pulse rounded-full bg-sr-blue-50" />
      </div>
    </div>
  );
}
