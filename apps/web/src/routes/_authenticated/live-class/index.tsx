import {
  CaretLeftIcon,
  CaretRightIcon,
  ClockIcon,
  LockKeyIcon,
  PlayCircleIcon,
  UserIcon,
  VideoCameraIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { useMemo, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createMeta } from "@/lib/seo-utils";
import { cn } from "@/lib/utils";
import { client, orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/live-class/")({
  head: () => ({
    meta: createMeta({
      title: "Jadwal Live Class",
      description: "Jadwal live class Habitutor bersama mentor.",
      noIndex: true,
    }),
  }),
  component: LiveClassSchedulePage,
});

type LiveClassItem = Awaited<ReturnType<typeof client.liveClass.schedule>>["classes"][number];
type CategoryFilter = "ALL" | LiveClassItem["category"];

const CATEGORY_FILTERS: { value: CategoryFilter; label: string }[] = [
  { value: "ALL", label: "Semua" },
  { value: "TKA", label: "TKA" },
  { value: "SNBT", label: "SNBT" },
  { value: "MANDIRI", label: "Mandiri" },
];

const CATEGORY_STYLE: Record<LiveClassItem["category"], { label: string; badge: string; accent: string }> = {
  TKA: { label: "TKA", badge: "bg-sr-blue-100 text-sr-blue-700", accent: "bg-sr-blue-500" },
  SNBT: { label: "SNBT", badge: "bg-sr-sun-100 text-sr-amber-700", accent: "bg-sr-sun-500" },
  MANDIRI: { label: "Mandiri", badge: "bg-sr-orange-100 text-sr-orange-700", accent: "bg-sr-orange-500" },
};

const DAY_MS = 24 * 60 * 60 * 1000;
const WIB = "Asia/Jakarta";

function todayInWib() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: WIB }).format(new Date());
}

function addDays(date: string, days: number) {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

/** Senin dari minggu yang memuat tanggal ini. */
function mondayOf(date: string) {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  return addDays(date, -((day + 6) % 7));
}

function formatDay(date: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("id-ID", { timeZone: "UTC", ...options }).format(new Date(`${date}T00:00:00Z`));
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("id-ID", { timeZone: WIB, hour: "2-digit", minute: "2-digit" })
    .format(new Date(iso))
    .replace(":", ".");
}

function LiveClassSchedulePage() {
  const today = todayInWib();
  const [weekStart, setWeekStart] = useState(() => mondayOf(today));
  const [selectedDate, setSelectedDate] = useState(today);
  const [category, setCategory] = useState<CategoryFilter>("ALL");

  const schedule = useQuery({
    ...orpc.liveClass.schedule.queryOptions({ input: { weekStart } }),
    // Status kelas dan link Zoom berubah seiring waktu, jadi jadwal disegarkan berkala.
    refetchInterval: 30_000,
  });

  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart]);
  const visibleClasses = (schedule.data?.classes ?? []).filter(
    (item) => category === "ALL" || item.category === category,
  );
  const dayClasses = visibleClasses.filter((item) => item.date === selectedDate);

  const goToWeek = (offset: number) => {
    const nextWeek = addDays(weekStart, offset * 7);
    setWeekStart(nextWeek);
    setSelectedDate(nextWeek === mondayOf(today) ? today : nextWeek);
  };

  const goToToday = () => {
    setWeekStart(mondayOf(today));
    setSelectedDate(today);
  };

  return (
    <div className="mt-4 space-y-6 sm:-mt-3">
      <ScheduleHeader />

      <Tabs value={category} onValueChange={(value) => setCategory(value as CategoryFilter)}>
        <TabsList>
          {CATEGORY_FILTERS.map((filter) => (
            <TabsTrigger key={filter.value} value={filter.value}>
              {filter.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <section
        className="rounded-sr-lg border border-sr-line bg-white/90 p-4 shadow-sr-1 sm:p-6"
        aria-label="Pilih tanggal"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="font-extrabold text-sr-ink capitalize">
            {formatDay(weekStart, { month: "long", year: "numeric" })}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => goToWeek(-1)}
              aria-label="Minggu sebelumnya"
            >
              <CaretLeftIcon weight="bold" />
            </Button>
            {weekStart !== mondayOf(today) && (
              <Button variant="outline" size="sm" className="rounded-full" onClick={goToToday}>
                Hari ini
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => goToWeek(1)}
              aria-label="Minggu berikutnya"
            >
              <CaretRightIcon weight="bold" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-3">
          {days.map((date) => {
            const isSelected = date === selectedDate;
            const hasClass = visibleClasses.some((item) => item.date === date);
            return (
              <button
                key={date}
                type="button"
                onClick={() => setSelectedDate(date)}
                aria-pressed={isSelected}
                aria-label={formatDay(date, { weekday: "long", day: "numeric", month: "long" })}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-sr-sm border-2 py-2 transition-all duration-300 sm:py-3",
                  isSelected
                    ? "-translate-y-0.5 border-transparent bg-(image:--sr-grad-blue) text-white shadow-sr-2"
                    : "border-transparent bg-sr-blue-50 text-sr-ink hover:border-sr-blue-200",
                  date === today && !isSelected && "border-sr-sun-400 bg-sr-sun-100",
                )}
              >
                <span className="text-[10px] font-semibold uppercase sm:text-xs">
                  {formatDay(date, { weekday: "short" })}
                </span>
                <span className="text-lg font-bold sm:text-2xl">{formatDay(date, { day: "numeric" })}</span>
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    hasClass ? (isSelected ? "bg-sr-sun-400" : "bg-sr-blue-500") : "bg-transparent",
                  )}
                />
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4" aria-live="polite">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-extrabold text-sr-ink sm:text-xl">
            {formatDay(selectedDate, { weekday: "long", day: "numeric", month: "long" })}
          </h2>
          {schedule.data && (
            <span className="rounded-full bg-sr-blue-50 px-3 py-1 text-xs font-bold text-sr-blue-700">
              {dayClasses.length} kelas
            </span>
          )}
        </div>

        {schedule.isPending ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
          </div>
        ) : schedule.isError ? (
          <div className="rounded-sr-md border border-sr-line bg-white p-6 text-center text-sm text-red-600">
            Gagal memuat jadwal. Coba muat ulang halaman.
          </div>
        ) : dayClasses.length === 0 ? (
          <EmptyDay />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {dayClasses.map((item) => (
              <LiveClassCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ScheduleHeader() {
  return (
    <div className="relative overflow-hidden rounded-sr-xl sr-card-blue text-white">
      <div className="pointer-events-none absolute -right-10 -bottom-14 size-40 animate-sr-drift rounded-full bg-white/10 sm:right-0 sm:-bottom-32 sm:size-80" />
      <div className="pointer-events-none absolute -top-10 left-1/3 size-24 rounded-full bg-white/10" />
      <div className="relative pt-6 pr-6 pb-36 pl-6 sm:py-12 sm:pr-72 sm:pl-10">
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
          <span className="size-2 animate-pulse rounded-full bg-sr-sun-400" /> Belajar langsung bareng mentor
        </span>
        <h1 className="text-[26px] leading-tight font-extrabold sm:text-[34px]">
          Jadwal <span className="text-sr-sun-400">Live Class</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/90">
          Belajar langsung bareng mentor. Tombol Gabung aktif 15 menit sebelum kelas dimulai, semua jam dalam WIB.
        </p>
      </div>
      {/* Maskot menempel di sisi bawah banner, sama seperti di kartu live class dashboard. */}
      <Image
        src="/avatar/login-avatar.webp"
        alt=""
        width={260}
        height={250}
        className="pointer-events-none absolute right-2 -bottom-4 h-36 w-auto object-contain object-bottom select-none sm:right-10 sm:h-[105%]"
      />
    </div>
  );
}

function EmptyDay() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-sr-lg border border-dashed border-sr-line-2 bg-white/80 px-6 py-10 text-center">
      <Image
        src="/avatar/confused-avatar.webp"
        alt=""
        width={160}
        height={160}
        className="h-32 w-auto animate-sr-drift"
      />
      <p className="text-lg font-extrabold text-sr-ink">Belum ada kelas di hari ini</p>
      <p className="max-w-sm text-sm text-muted-foreground">Pilih tanggal lain atau cek minggu berikutnya ya.</p>
    </div>
  );
}

const STATUS_BADGE: Record<LiveClassItem["status"], { label: string; className: string }> = {
  upcoming: { label: "Akan datang", className: "bg-sr-blue-50 text-sr-blue-700" },
  live: { label: "Sedang berlangsung", className: "bg-sr-live text-white" },
  ended: { label: "Selesai", className: "bg-sr-line text-sr-muted" },
};

function LiveClassCard({ item }: { item: LiveClassItem }) {
  const style = CATEGORY_STYLE[item.category];
  const status = STATUS_BADGE[item.status];

  return (
    <article
      className={cn(
        "relative flex sr-lift flex-col gap-4 overflow-hidden rounded-sr-md border border-sr-line bg-white p-5 pl-6 shadow-sr-1",
        item.status === "live" && "border-2 border-sr-live shadow-sr-2",
        item.status === "ended" && "opacity-80",
      )}
    >
      <div className={cn("absolute inset-y-0 left-0 w-1.5", style.accent)} />

      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", style.badge)}>{style.label}</span>
        <span
          className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold", status.className)}
        >
          {item.status === "live" && <span className="size-1.5 animate-pulse rounded-full bg-white" />}
          {status.label}
        </span>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg leading-snug font-bold text-pretty text-sr-ink">{item.title}</h3>
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-sr-ink-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-sr-blue-50 px-2.5 py-1">
            <ClockIcon weight="bold" className="size-3.5 shrink-0 text-sr-blue-600" /> {formatTime(item.startsAt)}–
            {formatTime(item.endsAt)} WIB
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-sr-sun-100 px-2.5 py-1">
            <UserIcon weight="bold" className="size-3.5 shrink-0 text-sr-amber-700" /> {item.teacher}
          </span>
        </div>
      </div>

      <div className="mt-auto">
        <JoinAction item={item} />
      </div>
    </article>
  );
}

function JoinAction({ item }: { item: LiveClassItem }) {
  if (item.lockReason === "premium" || item.lockReason === "mandiri") {
    return (
      <Link to="/premium" className={cn(buttonVariants({ variant: "secondary" }), "w-full rounded-sr-sm")}>
        <LockKeyIcon weight="fill" />
        {item.lockReason === "mandiri" ? "Khusus Paket Sampai Mandiri" : "Khusus member Premium"}
      </Link>
    );
  }

  if (item.lockReason === "tier") {
    return (
      <Button variant="outline" className="w-full" disabled>
        <LockKeyIcon weight="fill" /> Tidak termasuk paketmu
      </Button>
    );
  }

  if (item.status === "ended") {
    return (
      <Link to="/recordings" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
        <PlayCircleIcon weight="fill" /> Kelas selesai · Cek Live Recording
      </Link>
    );
  }

  if (item.link) {
    return (
      <Button asChild className="sr-sheen w-full rounded-sr-sm">
        <a href={item.link} target="_blank" rel="noopener noreferrer">
          <VideoCameraIcon weight="fill" /> Gabung Kelas
        </a>
      </Button>
    );
  }

  return (
    <Button className="w-full" disabled>
      <ClockIcon weight="bold" /> Dibuka pukul {formatTime(item.joinOpensAt)} WIB
    </Button>
  );
}
