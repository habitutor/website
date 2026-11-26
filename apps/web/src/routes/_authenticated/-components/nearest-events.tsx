import { ArrowRightIcon, CalendarBlankIcon, ClockIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";
import { formatDate, formatTime, getAccessBadge, getEventStatus, isPremiumLocked } from "../../ptntour/-lib";
import { Accent, SectionCard } from "./section-card";

/** Kartu "Event terdekat" (maks 2) di dashboard supaya pengguna lama juga melihat event gratis. */
export function NearestEvents() {
  const { data: session } = authClient.useSession();
  const isPremium = Boolean(session?.user.isPremium);
  const { data: events } = useQuery({
    ...orpc.ptnTour.list.queryOptions(),
    queryKey: [...orpc.ptnTour.list.queryKey(), session?.user.id ?? "anon"],
  });

  const nearest = (events ?? [])
    .filter((event) => event.phase !== "ended")
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    .slice(0, 2);
  if (nearest.length === 0) return null;

  return (
    <SectionCard
      title={
        <>
          Event <Accent>terdekat</Accent>
        </>
      }
      action={
        <Button asChild variant="ghost" size="sm" className="rounded-full text-sr-blue-800">
          <Link to="/ptntour">
            Lihat semua <ArrowRightIcon weight="bold" />
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        {nearest.map((event, index) => {
          const status = getEventStatus(event, isPremium);
          const access = getAccessBadge(event);
          const locked = isPremiumLocked(event, isPremium);
          return (
            <Link
              key={event.slug}
              to="/ptntour/$slug"
              params={{ slug: event.slug }}
              className="group flex animate-sr-rise sr-lift gap-3 rounded-sr-xl border border-sr-line bg-white p-3 shadow-sr-1"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <img
                src={event.posterUrl}
                alt=""
                loading="lazy"
                className="aspect-4/5 w-24 shrink-0 rounded-sr-md object-cover ring-1 ring-sr-line sm:w-28"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                      status.tone === "bg-white/95 text-sr-ink" ? "bg-sr-blue-50 text-sr-blue-700" : status.tone,
                    )}
                  >
                    {status.label}
                  </span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-black", access.tone)}>
                    {access.label}
                  </span>
                </div>
                <p className="line-clamp-2 leading-snug font-black text-sr-ink">{event.title}</p>
                <p className="truncate text-xs text-sr-muted">
                  {event.tutor} · {event.campus}
                </p>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-sr-muted">
                  <span className="inline-flex items-center gap-1">
                    <CalendarBlankIcon weight="fill" className="text-sr-blue-500" /> {formatDate(event.startsAt)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ClockIcon weight="fill" className="text-sr-blue-500" /> {formatTime(event.startsAt)}
                  </span>
                </p>
                <span className="mt-auto inline-flex w-fit items-center gap-1 rounded-full bg-sr-blue-500 px-3 py-1.5 text-xs font-bold text-white transition-colors group-hover:bg-sr-blue-600">
                  {status.key === "live" && (event.registered || isPremium)
                    ? "Join sekarang"
                    : status.key === "registered"
                      ? "Lihat detail"
                      : locked
                        ? "Khusus Premium"
                        : status.key === "cancelled"
                          ? "Dibatalkan"
                          : status.key === "full"
                          ? "Kuota penuh"
                          : "Daftar Gratis"}
                  <ArrowRightIcon weight="bold" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </SectionCard>
  );
}
