import { ClockIcon, LockKeyIcon, PlayCircleIcon, VideoCameraIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { LiveClassScheduleCard } from "@/components/classes/live-class-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { createMeta } from "@/lib/seo-utils";
import { cn } from "@/lib/utils";
import { client, orpc } from "@/utils/orpc";
import { WeekPicker } from "./-components/week-picker";

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
    <div className="space-y-6">
      <ScheduleHeader weekCount={schedule.data ? visibleClasses.length : undefined} />

      <div className="rounded-sr-xl border border-sr-line bg-white p-3 shadow-sr-1 sm:p-4">
        <div
          className="flex gap-1.5 overflow-x-auto rounded-full bg-sr-blue-50 p-1 sm:w-fit"
          role="tablist"
          aria-label="Kategori live class"
        >
          {CATEGORY_FILTERS.map((filter) => {
            const active = filter.value === category;
            return (
              <button
                key={filter.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setCategory(filter.value)}
                className={cn(
                  "relative flex-1 rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors sm:flex-none sm:px-5",
                  active ? "text-white" : "text-sr-ink-2 hover:text-sr-blue-600",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="live-class-category-pill"
                    className="absolute inset-0 rounded-full bg-sr-blue-500 shadow-sr-2"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">{filter.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <WeekPicker
        days={days}
        today={today}
        selectedDate={selectedDate}
        isCurrentWeek={weekStart === mondayOf(today)}
        hasClassOn={(date) => visibleClasses.some((item) => item.date === date)}
        formatDay={formatDay}
        onSelect={setSelectedDate}
        onShiftWeek={goToWeek}
        onToday={goToToday}
      />

      <section className="space-y-4" aria-live="polite">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-sr-ink capitalize sm:text-xl">
            {formatDay(selectedDate, { weekday: "long", day: "numeric", month: "long" })}
          </h2>
          {schedule.data && (
            <span className="shrink-0 rounded-full bg-sr-blue-50 px-3 py-1 text-xs font-bold text-sr-blue-700">
              {dayClasses.length} kelas
            </span>
          )}
        </div>

        {schedule.isPending ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i.toString()} className="overflow-hidden rounded-sr-xl border border-sr-line bg-white">
                <Skeleton className="h-28 w-full rounded-none" />
                <div className="space-y-2 p-4">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="mt-4 h-10 w-full rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : schedule.isError ? (
          <EmptyDay title="Jadwal gagal dimuat" description="Coba muat ulang halaman ini, ya." />
        ) : dayClasses.length === 0 ? (
          <EmptyDay
            title="Belum ada kelas di hari ini"
            description="Pilih tanggal lain yang ada titiknya, atau cek minggu berikutnya ya."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 xl:grid-cols-3">
            {dayClasses.map((item, index) => (
              <motion.div
                key={`${selectedDate}-${category}-${item.id}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.06, ease: [0.2, 0.7, 0.2, 1] }}
              >
                <LiveClassCard item={item} />
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ScheduleHeader({ weekCount }: { weekCount?: number }) {
  return (
    // Di HP maskot mengintip dari bawah teks; mulai sm duduk di kanan, sama seperti header Premium.
    <div className="relative overflow-hidden rounded-sr-xl sr-card-blue px-5 pt-6 pb-40 sm:px-8 sm:py-9 sm:pr-72 lg:px-10 lg:py-11 lg:pr-96">
      <div className="pointer-events-none absolute -top-24 -right-20 size-72 rounded-full bg-white/8" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 size-40 rounded-full bg-white/5" />

      <span className="relative inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/20">
        <span className="size-2 rounded-full bg-sr-sun-400 motion-safe:animate-pulse" />
        Belajar langsung bareng mentor
      </span>
      <h1 className="relative mt-3 text-[26px] leading-tight font-extrabold text-balance text-white sm:text-3xl lg:text-4xl">
        Jadwal Live Class
      </h1>
      <p className="relative mt-2.5 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">
        Tanya langsung ke mentor, bahas soal bareng teman. Tombol Gabung aktif 15 menit sebelum kelas dimulai.
      </p>

      <div className="relative mt-5 flex flex-wrap gap-2">
        {weekCount !== undefined && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 text-xs font-bold text-white ring-1 ring-white/15 sm:text-sm">
            <VideoCameraIcon weight="fill" className="size-4 text-sr-sun-400" /> {weekCount} kelas minggu ini
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 text-xs font-bold text-white ring-1 ring-white/15 sm:text-sm">
          <ClockIcon weight="fill" className="size-4 text-sr-sun-400" /> Semua jam dalam WIB
        </span>
      </div>

      <motion.img
        src="/avatar/subtest/ppu.webp"
        alt=""
        width={530}
        height={481}
        className="pointer-events-none absolute right-1/2 bottom-0 h-36 w-auto translate-x-1/2 select-none sm:right-10 sm:h-48 sm:translate-x-0 lg:right-16 lg:h-60"
        initial={{ y: 40 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
      />
    </div>
  );
}

function EmptyDay({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-sr-xl border border-dashed border-sr-line-2 bg-white/80 px-6 py-10 text-center">
      <img src="/avatar/confused-avatar.webp" alt="" className="h-32 w-auto motion-safe:animate-sr-drift" />
      <p className="text-lg font-extrabold text-sr-ink">{title}</p>
      <p className="max-w-sm text-sm leading-relaxed text-sr-muted">{description}</p>
    </div>
  );
}

function LiveClassCard({ item }: { item: LiveClassItem }) {
  return (
    <LiveClassScheduleCard
      title={item.title}
      teacher={item.teacher}
      category={item.category}
      startsAt={item.startsAt}
      endsAt={item.endsAt}
      status={item.status}
      action={<JoinAction item={item} />}
    />
  );
}

function JoinAction({ item }: { item: LiveClassItem }) {
  if (item.lockReason === "premium" || item.lockReason === "mandiri") {
    return (
      <Link to="/premium" className={cn(buttonVariants({ variant: "secondary" }), "w-full rounded-full")}>
        <LockKeyIcon weight="fill" />
        {item.lockReason === "mandiri" ? "Khusus Paket Sampai Mandiri" : "Khusus member Premium"}
      </Link>
    );
  }

  if (item.lockReason === "tier") {
    return (
      <Button variant="outline" className="w-full rounded-full" disabled>
        <LockKeyIcon weight="fill" /> Tidak termasuk paketmu
      </Button>
    );
  }

  if (item.status === "ended") {
    return (
      <Link to="/recordings" className={cn(buttonVariants({ variant: "outline" }), "w-full rounded-full")}>
        <PlayCircleIcon weight="fill" /> Tonton rekamannya
      </Link>
    );
  }

  if (item.link) {
    return (
      <Button asChild className="sr-sheen w-full rounded-full">
        <a href={item.link} target="_blank" rel="noopener noreferrer">
          <VideoCameraIcon weight="fill" /> Gabung Kelas
        </a>
      </Button>
    );
  }

  return (
    <Button className="w-full rounded-full" disabled>
      <ClockIcon weight="bold" /> Dibuka pukul {formatTime(item.joinOpensAt)} WIB
    </Button>
  );
}
