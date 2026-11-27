import {
  CalendarCheckIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  ClockCountdownIcon,
  UserPlusIcon,
  UsersThreeIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { CountUp, TiltCard } from "@/routes/-home/motion-bits";
import { orpc } from "@/utils/orpc";
import { CountdownTiles } from "./-components/countdown-tiles";
import { EventCard, EventCardSkeleton } from "./-components/event-card";
import { usePtnTourSettings } from "./-hooks";
import {
  EVENT_CATEGORIES,
  EVENT_SUBJECTS,
  formatDate,
  formatTime,
  getEventStatus,
  getSpotsLabel,
  parseHeroParticipants,
  type PtnEvent,
} from "./-lib";

export const Route = createFileRoute("/ptntour/")({ component: PtnTourListPage });

type Tab = "upcoming" | "registered" | "recordings";

const TABS: ReadonlyArray<{ value: Tab; label: string }> = [
  { value: "upcoming", label: "Akan Datang" },
  { value: "registered", label: "Terdaftar" },
  { value: "recordings", label: "Rekaman" },
];

function PtnTourListPage() {
  const { data: session } = authClient.useSession();
  const isPremium = Boolean(session?.user.isPremium);
  const {
    data: events,
    isPending,
    isError,
    refetch,
  } = useQuery({
    ...orpc.ptnTour.list.queryOptions(),
    // Status "terdaftar" milik pengguna; ambil ulang kalau pengguna berganti (login/logout).
    queryKey: [...orpc.ptnTour.list.queryKey(), session?.user.id ?? "anon"],
  });
  const [tab, setTab] = useState<Tab>("upcoming");
  const [category, setCategory] = useState<(typeof EVENT_CATEGORIES)[number]>("Semua");
  const [subject, setSubject] = useState<string>("Semua");
  const [search, setSearch] = useState("");

  const counts = useMemo(
    () => ({
      upcoming: events?.filter((event) => event.phase !== "ended").length ?? 0,
      registered: events?.filter((event) => event.registered).length ?? 0,
      recordings: events?.filter((event) => event.phase === "ended" && event.hasRecording).length ?? 0,
    }),
    [events],
  );
  const { data: settings } = usePtnTourSettings();
  const totalParticipants = parseHeroParticipants(settings?.hero_participants);

  const hasSubjects = useMemo(() => events?.some((event) => event.subjects.length > 0) ?? false, [events]);
  const hasFilter = category !== "Semua" || subject !== "Semua" || search.trim() !== "";

  const visible = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const filtered = (events ?? []).filter((event) => {
      if (tab === "upcoming" && event.phase === "ended") return false;
      if (tab === "registered" && !event.registered) return false;
      if (tab === "recordings" && !(event.phase === "ended" && event.hasRecording)) return false;
      if (category !== "Semua" && event.category !== category) return false;
      if (subject !== "Semua" && !event.subjects.includes(subject)) return false;
      return !keyword || `${event.title} ${event.tutor} ${event.campus}`.toLowerCase().includes(keyword);
    });
    // Terdekat dulu untuk yang akan datang; rekaman terbaru dulu.
    return filtered.sort((a, b) =>
      tab === "recordings"
        ? new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()
        : new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );
  }, [events, tab, category, subject, search]);

  // Event terdekat disorot di atas daftar (hanya di tab Akan Datang tanpa filter dan bila ada lebih dari satu event).
  const featured =
    tab === "upcoming" && !hasFilter && visible.length > 1 && visible[0]?.scheduleStatus !== "cancelled"
      ? visible[0]
      : undefined;
  const gridEvents = featured ? visible.slice(1) : visible;

  return (
    <>
      <Hero upcoming={counts.upcoming} participants={totalParticipants} loaded={Boolean(events)} />

      {featured && <FeaturedEvent event={featured} isPremium={isPremium} />}

      <div className="sticky top-[4.75rem] z-20 flex flex-col gap-3 rounded-sr-xl border border-sr-line bg-white p-3 shadow-sr-2 sm:top-24 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div
            className="flex gap-0.5 overflow-x-auto rounded-full bg-sr-ivory p-1 min-[400px]:gap-1 lg:shrink-0"
            role="tablist"
            aria-label="Daftar event"
          >
            {TABS.map((item) => (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={tab === item.value}
                onClick={() => setTab(item.value)}
                className={cn(
                  "relative flex-1 rounded-full px-1.5 py-2 text-xs font-bold whitespace-nowrap transition-colors min-[400px]:px-3 sm:px-4 sm:text-sm",
                  tab === item.value ? "text-white" : "text-sr-muted hover:text-sr-ink",
                )}
              >
                {tab === item.value && (
                  <motion.span
                    layoutId="ptn-tab"
                    className="absolute inset-0 rounded-full bg-sr-blue-500 shadow-sr-2"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative whitespace-nowrap">
                  {item.label}
                  {events && (
                    <span className="ml-1 text-[11px] opacity-75 min-[400px]:ml-1.5">{counts[item.value]}</span>
                  )}
                </span>
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-sr-muted" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari judul, tutor, atau kampus…"
              className="pl-11"
              aria-label="Cari event"
            />
          </div>
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5" role="group" aria-label="Filter kategori">
          {EVENT_CATEGORIES.map((item) => (
            <Button
              key={item}
              size="sm"
              variant={category === item ? "default" : "outline"}
              aria-pressed={category === item}
              className="shrink-0 rounded-full"
              onClick={() => setCategory(item)}
            >
              {item}
            </Button>
          ))}
          {hasSubjects && (
            <>
              <span aria-hidden className="mx-1 my-1.5 w-px shrink-0 bg-sr-line" />
              {["Semua", ...EVENT_SUBJECTS].map((item) => (
                <Button
                  key={item}
                  size="sm"
                  variant={subject === item ? "default" : "outline"}
                  aria-pressed={subject === item}
                  className="shrink-0 rounded-full"
                  onClick={() => setSubject(item)}
                >
                  {item === "Semua" ? "Semua mapel" : item}
                </Button>
              ))}
            </>
          )}
        </div>
      </div>

      {isError ? (
        <div className="flex flex-col items-center gap-3 rounded-sr-xl border-2 border-dashed border-sr-blue-200 bg-white px-6 py-12 text-center">
          <WarningCircleIcon className="size-8 text-destructive" />
          <p className="font-bold text-sr-ink">Event belum bisa dimuat</p>
          <p className="text-sm text-sr-muted">Periksa koneksi kamu lalu coba lagi.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Coba lagi
          </Button>
        </div>
      ) : isPending ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <EventCardSkeleton key={index.toString()} />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState tab={tab} loggedIn={Boolean(session?.user)} hasFilter={hasFilter} />
      ) : gridEvents.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {gridEvents.map((event, index) => (
            <EventCard key={event.slug} event={event} isPremium={isPremium} index={index} />
          ))}
        </div>
      ) : null}
    </>
  );
}

function Hero({ upcoming, participants, loaded }: { upcoming: number; participants: number | null; loaded: boolean }) {
  // Ukuran dan susunan sama dengan header Premium, Live Class, dan Recordings supaya konsisten.
  return (
    <section className="relative overflow-hidden rounded-sr-xl sr-card-blue px-5 pt-6 pb-40 sm:px-8 sm:py-9 sm:pr-72 lg:px-10 lg:py-11 lg:pr-96">
      <div className="pointer-events-none absolute -top-24 -right-20 size-72 rounded-full bg-white/8" />

      <h1 className="relative text-[26px] leading-tight font-extrabold text-balance text-white sm:text-3xl lg:text-4xl">
        PTN Tour & Masterclass
      </h1>
      <p className="relative mt-2.5 max-w-lg text-sm leading-relaxed text-white/95 sm:text-base">
        Ikut live, tanya apa saja ke mentor dari PTN impianmu, lalu tonton ulang rekamannya kapan pun. Tombol Join aktif
        15 menit sebelum acara dimulai.
      </p>

      <div className="relative mt-5 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 text-xs font-bold text-white ring-1 ring-white/15 sm:text-sm">
          <CalendarCheckIcon weight="fill" className="size-4 text-sr-sun-400" />
          {loaded ? <CountUp to={upcoming} /> : "…"} event akan datang
        </span>
        {participants !== null && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 text-xs font-bold text-white ring-1 ring-white/15 sm:text-sm">
            <UserPlusIcon weight="fill" className="size-4 text-sr-sun-400" />
            <CountUp to={participants} suffix="+" /> peserta sejak PTN Tour pertama
          </span>
        )}
      </div>

      <motion.img
        src="/avatar/login-avatar.webp"
        alt=""
        aria-hidden
        width={783}
        height={749}
        className="pointer-events-none absolute right-1/2 bottom-0 w-40 translate-x-1/2 select-none sm:right-6 sm:w-56 sm:translate-x-0 lg:right-12 lg:w-72"
        initial={{ y: 40 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
      />
    </section>
  );
}

function FeaturedEvent({ event, isPremium }: { event: PtnEvent; isPremium: boolean }) {
  const { data: settings } = usePtnTourSettings();
  const spotsLabel = getSpotsLabel(event, settings?.show_event_counts === "true");
  const status = getEventStatus(event, isPremium);
  const label =
    status.key === "live"
      ? "Masuk ke Event Live"
      : status.key === "registered"
        ? "Lihat Detail"
        : status.key === "full"
          ? "Lihat Detail"
          : isPremium
            ? "Lihat Event"
            : "Daftar Gratis";
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
      aria-label="Event terdekat"
      className="relative overflow-hidden rounded-sr-xl border border-sr-blue-100 bg-white shadow-sr-2"
    >
      <div className="relative grid gap-5 p-4 sm:grid-cols-[13rem_1fr] sm:gap-7 sm:p-6 lg:grid-cols-[15rem_1fr]">
        <TiltCard maxTilt={6} className="mx-auto w-44 sm:w-full">
          <Link to="/ptntour/$slug" params={{ slug: event.slug }}>
            <img
              src={event.posterUrl}
              alt={`Poster ${event.title}`}
              className="aspect-4/5 w-full rounded-sr-lg object-cover shadow-sr-3"
            />
          </Link>
        </TiltCard>
        <div className="flex min-w-0 flex-col justify-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sr-blue-500 px-3 py-1 text-xs font-black text-white">
              <ClockCountdownIcon weight="fill" className="size-3.5" /> Event terdekat
            </span>
            <span className="rounded-full bg-sr-sun-100 px-3 py-1 text-xs font-bold text-sr-amber-700">
              {event.category}
            </span>
          </div>
          <h2 className="text-2xl leading-tight font-black text-balance text-sr-ink sm:text-3xl">{event.title}</h2>
          <p className="line-clamp-2 text-sm leading-relaxed text-sr-muted sm:text-base">{event.description}</p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-sr-ink-2">
            <span>
              {event.tutor} <span className="font-medium text-sr-muted">· {event.campus}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ClockIcon weight="fill" className="size-4 text-sr-blue-500" />
              {formatDate(event.startsAt)}, {formatTime(event.startsAt)}
            </span>
            {spotsLabel && (
              <span className="inline-flex items-center gap-1.5">
                <UsersThreeIcon weight="fill" className="size-4 text-sr-blue-500" />
                {spotsLabel}
              </span>
            )}
          </p>
          <CountdownTiles event={event} tone="light" />
          <div>
            <Button asChild size="lg" className="sr-sheen">
              <Link to="/ptntour/$slug" params={{ slug: event.slug }}>
                {label}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function EmptyState({ tab, loggedIn, hasFilter }: { tab: Tab; loggedIn: boolean; hasFilter: boolean }) {
  const needsLogin = tab === "registered" && !loggedIn;
  const text = needsLogin
    ? { title: "Masuk untuk melihat event kamu", body: "Event yang sudah kamu daftar akan muncul di sini." }
    : hasFilter
      ? { title: "Tidak ada event yang cocok", body: "Coba ubah kata kunci atau pilih kategori lain." }
      : tab === "registered"
        ? { title: "Kamu belum mendaftar event apa pun", body: "Pilih event di tab Akan Datang dan daftar gratis." }
        : tab === "recordings"
          ? { title: "Belum ada rekaman", body: "Rekaman muncul di sini setelah event selesai." }
          : { title: "Belum ada event terjadwal", body: "Event baru tayang tiap pekan. Cek lagi sebentar lagi ya." };

  return (
    <div className="flex flex-col items-center rounded-sr-xl border-2 border-dashed border-sr-blue-200 bg-white px-6 py-12 text-center">
      <img src="/avatar/confused-avatar.webp" alt="" aria-hidden className="h-28 w-auto select-none" />
      <p className="mt-3 font-bold text-sr-ink">{text.title}</p>
      <p className="mt-1 text-sm text-sr-muted">{text.body}</p>
      {needsLogin && (
        <Button asChild className="mt-4">
          <Link to="/login" search={{ redirect: "/ptntour" }}>
            Masuk
          </Link>
        </Button>
      )}
    </div>
  );
}
