import { MagnifyingGlassIcon, SparkleIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";
import { EventCard, EventCardSkeleton } from "./-components/event-card";
import { EVENT_CATEGORIES } from "./-lib";

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
  const [search, setSearch] = useState("");

  const counts = useMemo(
    () => ({
      upcoming: events?.filter((event) => event.phase !== "ended").length ?? 0,
      registered: events?.filter((event) => event.registered).length ?? 0,
      recordings: events?.filter((event) => event.phase === "ended" && event.hasRecording).length ?? 0,
    }),
    [events],
  );

  const visible = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const filtered = (events ?? []).filter((event) => {
      if (tab === "upcoming" && event.phase === "ended") return false;
      if (tab === "registered" && !event.registered) return false;
      if (tab === "recordings" && !(event.phase === "ended" && event.hasRecording)) return false;
      if (category !== "Semua" && event.category !== category) return false;
      return !keyword || `${event.title} ${event.tutor} ${event.campus}`.toLowerCase().includes(keyword);
    });
    // Terdekat dulu untuk yang akan datang; rekaman terbaru dulu.
    return filtered.sort((a, b) =>
      tab === "recordings"
        ? new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()
        : new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );
  }, [events, tab, category, search]);

  return (
    <>
      <section className="relative overflow-hidden rounded-sr-xl sr-card-blue px-5 py-7 text-white shadow-sr-2 sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -top-24 -right-12 size-64 rounded-full bg-white/10" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sr-sun-400 px-3 py-1 text-xs font-black text-sr-ink">
            <SparkleIcon weight="fill" className="size-3.5" /> GRATIS
          </span>
          <h1 className="mt-3 text-3xl leading-tight font-black sm:text-4xl">PTN Tour & Masterclass</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
            Event mingguan bareng mentor dari berbagai PTN. Daftar dengan akun Habitutor, ikut live, lalu tonton ulang
            rekamannya kapan saja.
          </p>
        </div>
      </section>

      <div
        className="flex gap-1 rounded-full border border-sr-line bg-white p-1 shadow-sr-1"
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
              "flex-1 rounded-full px-2 py-2.5 text-xs font-bold transition-all duration-200 sm:text-sm",
              tab === item.value
                ? "bg-sr-blue-500 text-white shadow-sr-2"
                : "text-sr-muted hover:bg-sr-blue-50 hover:text-sr-ink",
            )}
          >
            {item.label}
            {events && (
              <span className={cn("ml-1.5 text-[11px]", tab === item.value ? "text-white/80" : "text-sr-muted")}>
                {counts[item.value]}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-sr-xl border border-sr-line bg-white p-4 shadow-sr-1">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-sr-muted" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari judul, tutor, atau kampus…"
            className="pl-10"
            aria-label="Cari event"
          />
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Filter kategori">
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
        </div>
      </div>

      {isError ? (
        <div className="flex flex-col items-center gap-3 rounded-sr-xl border-2 border-dashed border-sr-blue-200 bg-white/70 px-6 py-12 text-center">
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
        <EmptyState
          tab={tab}
          loggedIn={Boolean(session?.user)}
          hasFilter={category !== "Semua" || search.trim() !== ""}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((event, index) => (
            <EventCard key={event.slug} event={event} isPremium={isPremium} index={index} />
          ))}
        </div>
      )}
    </>
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
    <div className="rounded-sr-xl border-2 border-dashed border-sr-blue-200 bg-sr-blue-50/50 px-6 py-14 text-center">
      <SparkleIcon className="text-sr-blue-400 mx-auto mb-3 size-8" />
      <p className="font-bold text-sr-ink">{text.title}</p>
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
