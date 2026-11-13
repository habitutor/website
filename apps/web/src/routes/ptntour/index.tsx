import {
  CalendarBlankIcon,
  CheckCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  SparkleIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Container } from "@/components/ui/container";
import { orpc } from "@/utils/orpc";
import { authClient } from "@/lib/auth-client";
import { EVENT_CATEGORIES, type PtnTourEvent, PTN_TOUR_EVENTS as FALLBACK_EVENTS } from "./data";

export const Route = createFileRoute("/ptntour/")({
  head: () => ({
    meta: [
      { title: "PTN Tour Gratis | Habitutor" },
      {
        name: "description",
        content: "Daftar event gratis Habitutor: Masterclass, PTN Tour, dan sesi intensif persiapan SNBT.",
      },
    ],
  }),
  component: PtnTourListPage,
});

function PtnTourListPage() {
  const { data: apiEvents, isPending } = useQuery(orpc.ptnTour.list.queryOptions());
  const { data: session } = authClient.useSession();
  const { data: registeredEvents } = useQuery({ ...orpc.ptnTour.me.queryOptions(), enabled: Boolean(session?.user) });
  const [category, setCategory] = useState<(typeof EVENT_CATEGORIES)[number]>("Semua");
  const [tab, setTab] = useState<"upcoming" | "registered" | "recordings">("upcoming");
  const [search, setSearch] = useState("");
  const sourceEvents =
    apiEvents?.map((event) => ({
      ...event,
      registered: event.registered || registeredEvents?.some((registered) => registered.slug === event.slug),
      date: new Date(event.startsAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
      time: new Date(event.startsAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
      poster: event.posterUrl,
      bonus: [],
    })) ?? FALLBACK_EVENTS;
  const events = useMemo(
    () =>
      sourceEvents.filter(
        (event) =>
          (tab === "upcoming"
            ? event.status === "Akan datang"
            : tab === "recordings"
              ? event.status === "Selesai"
              : event.registered) &&
          (category === "Semua" || event.category === category) &&
          `${event.title} ${event.tutor}`.toLowerCase().includes(search.toLowerCase()),
      ),
    [category, search, tab, apiEvents, registeredEvents],
  );

  return (
    <Container className="flex flex-col gap-6 pt-8 pb-16 sm:gap-8 sm:pt-12">
      <section className="relative overflow-hidden rounded-sr-xl sr-card-blue px-5 py-7 text-white shadow-sr-2 sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -top-24 -right-12 size-64 rounded-full bg-white/10" />
        <div className="relative max-w-2xl">
          <p className="text-sr-sun-300 text-sm font-bold">Event Habitutor</p>
          <h1 className="mt-2 text-3xl leading-tight font-black sm:text-4xl">PTN Tour</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
            Ikuti Masterclass, PTN Tour, dan sesi intensif gratis untuk persiapan SNBT.
          </p>
        </div>
      </section>
      <div className="rounded-sr-xl border border-sr-line bg-white p-2 shadow-sr-1 sm:p-3">
        <div className="grid grid-cols-3 gap-1 rounded-full bg-sr-blue-50 p-1" role="tablist" aria-label="Daftar event">
          {(
            [
              ["upcoming", "Akan Datang"],
              ["registered", "Terdaftar"],
              ["recordings", "Rekaman"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              className={`rounded-full px-2 py-2.5 text-xs font-bold transition-colors sm:px-5 sm:text-sm ${tab === value ? "bg-sr-blue-500 text-white shadow-sr-2" : "text-sr-ink-2 hover:text-sr-blue-600"}`}
              onClick={() => setTab(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3 rounded-sr-xl border border-sr-line bg-white p-4 shadow-sr-1 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-black text-sr-ink">Cari event yang kamu butuhkan</h2>
            <p className="mt-1 text-xs text-sr-muted">Filter berdasarkan jenis event atau cari tutor favoritmu.</p>
          </div>
          <div className="relative sm:w-72">
            <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-sr-muted" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari event atau tutor..."
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {EVENT_CATEGORIES.map((item) => (
            <Button
              key={item}
              size="sm"
              variant={category === item ? "default" : "outline"}
              className="shrink-0 rounded-full"
              onClick={() => setCategory(item)}
            >
              {item}
            </Button>
          ))}
        </div>
      </div>
      {isPending && (
        <div className="rounded-sr-xl border border-sr-line bg-white p-8 text-center text-sm text-sr-muted">
          Memuat event...
        </div>
      )}
      <motion.div
        key={`${tab}-${category}-${search}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {events.map((event) => (
          <EventCard key={event.slug} event={event} />
        ))}
      </motion.div>
      {events.length === 0 && (
        <div className="rounded-sr-xl border-2 border-dashed border-sr-blue-200 bg-sr-blue-50/50 px-6 py-14 text-center">
          <SparkleIcon className="text-sr-blue-400 mx-auto mb-3 size-8" />
          <p className="font-bold text-sr-ink">Belum ada event di tab ini</p>
          <p className="mt-1 text-sm text-sr-muted">Coba pilih tab atau filter yang lain.</p>
        </div>
      )}
    </Container>
  );
}

function EventCard({ event }: { event: PtnTourEvent }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-sr-xl border border-sr-line bg-white shadow-sr-1 transition-all hover:-translate-y-1 hover:shadow-sr-2">
      <Link to="/ptntour/$slug" params={{ slug: event.slug }} className="relative block overflow-hidden">
        <img
          src={event.poster}
          alt={`Poster ${event.title}`}
          className="aspect-4/5 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-sr-ink shadow-sm">
          {event.registered ? "✓ Terdaftar" : event.status}
        </span>
      </Link>
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-sr-blue-500">{event.category}</span>
        </div>
        <div>
          <h2 className="text-lg font-black text-sr-ink">{event.title}</h2>
          <p className="mt-1 line-clamp-2 text-sm text-sr-muted">{event.description}</p>
        </div>
        <p className="text-sm font-bold text-sr-ink">
          {event.tutor} · {event.campus}
        </p>
        <div className="grid grid-cols-3 gap-2 text-xs text-sr-muted">
          <span>
            <CalendarBlankIcon className="mb-1 size-4 text-sr-blue-500" />
            {event.date}
          </span>
          <span>
            <ClockIcon className="mb-1 size-4 text-sr-blue-500" />
            {event.time}
          </span>
          <span>
            {event.registered ? (
              <CheckCircleIcon className="mb-1 size-4 text-emerald-500" />
            ) : (
              <UsersThreeIcon className="mb-1 size-4 text-sr-blue-500" />
            )}
            {event.registered ? "Sudah daftar" : event.spotsLeft ? `${event.spotsLeft} tersisa` : "Terbuka"}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {event.bonus.map((bonus) => (
            <span key={bonus} className="rounded-full bg-sr-sun-100 px-2 py-1 text-[11px] font-bold text-sr-amber-700">
              + {bonus}
            </span>
          ))}
        </div>
        <Link to="/ptntour/$slug" params={{ slug: event.slug }}>
          <Button className="w-full">{event.status === "Selesai" ? "Tonton Rekaman" : "Daftar Gratis"}</Button>
        </Link>
      </div>
    </article>
  );
}
