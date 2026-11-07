import {
  ArrowRightIcon,
  ArrowSquareOutIcon,
  CalendarBlankIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CheckCircleIcon,
  CrownSimpleIcon,
  FilmStripIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { isAdminRole } from "@habitutor/shared/auth-domain";
import { extractYouTubeId } from "@habitutor/shared/youtube";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import YouTubePlayer from "@/components/media/youtube-player";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { createMeta } from "@/lib/seo-utils";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/recordings/")({
  head: () => ({
    meta: createMeta({
      title: "Live Recording",
      description: "Rekaman live class Habitutor untuk member premium.",
      noIndex: true,
    }),
  }),
  component: RecordingsPage,
});

const CATEGORIES = [
  { value: "TKA", label: "TKA", chip: "bg-sr-blue-500 text-white" },
  { value: "SNBT", label: "SNBT", chip: "bg-sr-sun-500 text-sr-ink" },
  { value: "MANDIRI", label: "Mandiri", chip: "bg-sr-orange-500 text-white" },
] as const;

type Category = (typeof CATEGORIES)[number]["value"];

const PAGE_SIZE = 9;

const formatDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

function RecordingsPage() {
  const session = authClient.useSession();
  const canWatch = Boolean(session.data?.user?.isPremium) || isAdminRole(session.data?.user?.role);
  const [category, setCategory] = useState<Category>("TKA");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const listTopRef = useRef<HTMLDivElement>(null);
  const [activeVideo, setActiveVideo] = useState<{ title: string; videoId: string } | null>(null);

  const recordings = useQuery({
    ...orpc.recording.list.queryOptions({ input: { category } }),
    enabled: canWatch,
  });

  const keyword = search.trim().toLowerCase();
  const filteredRecordings = useMemo(() => {
    const items = recordings.data ?? [];
    if (!keyword) return items;
    return items.filter((item) => `${item.title} ${item.teacher ?? ""}`.toLowerCase().includes(keyword));
  }, [recordings.data, keyword]);

  const totalPages = Math.max(1, Math.ceil(filteredRecordings.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedRecordings = filteredRecordings.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const goToPage = (nextPage: number) => {
    setPage(nextPage);
    listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const style = CATEGORIES.find((c) => c.value === category) ?? CATEGORIES[0];

  return (
    <div className="space-y-6">
      <RecordingsHeader />

      {session.isPending ? (
        <Skeleton className="h-64 w-full rounded-sr-xl" />
      ) : !canWatch ? (
        <LockedState />
      ) : (
        <>
          <div className="flex flex-col gap-3 rounded-sr-xl border border-sr-line bg-white p-3 shadow-sr-1 sm:p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-1.5 rounded-full bg-sr-blue-50 p-1" role="tablist" aria-label="Kategori rekaman">
              {CATEGORIES.map((c) => {
                const active = c.value === category;
                return (
                  <button
                    key={c.value}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      setCategory(c.value);
                      setPage(1);
                    }}
                    className={cn(
                      "relative flex-1 rounded-full px-5 py-2 text-sm font-bold transition-colors md:flex-none",
                      active ? "text-white" : "text-sr-ink-2 hover:text-sr-blue-600",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="recording-category-pill"
                        className="absolute inset-0 rounded-full bg-sr-blue-500 shadow-sr-2"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className="relative">{c.label}</span>
                  </button>
                );
              })}
            </div>

            <label className="relative block md:w-80">
              <span className="sr-only">Cari rekaman</span>
              <MagnifyingGlassIcon
                weight="bold"
                className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-sr-muted"
              />
              <input
                type="search"
                placeholder="Cari judul atau pemateri..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="h-11 w-full rounded-full border border-sr-line bg-sr-ivory/60 pr-4 pl-10 text-sm text-sr-ink transition-colors outline-none placeholder:text-sr-muted focus:border-sr-blue-300 focus:bg-white focus:ring-4 focus:ring-sr-blue-100"
              />
            </label>
          </div>

          {recordings.isPending && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i.toString()} className="overflow-hidden rounded-sr-lg border border-sr-line bg-white">
                  <Skeleton className="aspect-video w-full rounded-none" />
                  <div className="space-y-2 p-4">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {recordings.isError && (
            <EmptyState
              title="Rekaman gagal dimuat"
              description="Coba muat ulang halaman ini. Kalau masih gagal, kabari admin ya."
            />
          )}

          {recordings.data && recordings.data.length === 0 && (
            <EmptyState
              title={`Belum ada rekaman ${style.label}`}
              description="Rekaman live class akan muncul di sini setelah kelasnya selesai. Cek kategori lain dulu, yuk!"
            />
          )}

          {recordings.data && recordings.data.length > 0 && filteredRecordings.length === 0 && (
            <EmptyState
              title="Rekaman tidak ditemukan"
              description={`Tidak ada rekaman yang cocok dengan "${search.trim()}". Coba kata kunci lain.`}
            />
          )}

          {pagedRecordings.length > 0 && (
            <div ref={listTopRef} className="scroll-mt-28 space-y-6">
              <p className="text-sm text-sr-muted">
                Menampilkan <strong className="text-sr-ink">{filteredRecordings.length}</strong> rekaman {style.label}
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 xl:grid-cols-3">
                {pagedRecordings.map((item, index) => {
                  const videoId = extractYouTubeId(item.youtubeUrl);
                  return (
                    <motion.div
                      key={`${category}-${currentPage}-${item.id}`}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.2, 0.7, 0.2, 1] }}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveVideo({ title: item.title, videoId })}
                        className="group flex h-full w-full sr-lift flex-col overflow-hidden rounded-sr-lg border border-sr-line bg-white text-left shadow-sr-1 focus-visible:ring-4 focus-visible:ring-sr-blue-200 focus-visible:outline-none"
                      >
                        <div className="relative aspect-video w-full overflow-hidden bg-(image:--sr-grad-blue)">
                          {videoId ? (
                            <img
                              src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
                              alt=""
                              loading="lazy"
                              className="size-full object-cover transition-transform duration-500 ease-sr motion-safe:group-hover:scale-105"
                            />
                          ) : (
                            <FilmStripIcon
                              weight="fill"
                              className="absolute top-1/2 left-1/2 size-16 -translate-1/2 text-white/30"
                            />
                          )}
                          <div className="absolute inset-0 bg-linear-to-t from-sr-ink/50 via-transparent to-transparent" />
                          <span
                            className={cn(
                              "absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-sr-1",
                              style.chip,
                            )}
                          >
                            {style.label}
                          </span>
                          <span className="absolute top-1/2 left-1/2 flex size-14 -translate-1/2 items-center justify-center rounded-full bg-white/95 text-sr-blue-600 shadow-sr-3 transition-transform duration-300 ease-sr-spring motion-safe:group-hover:scale-110">
                            <PlayIcon weight="fill" className="ml-0.5 size-6" />
                          </span>
                        </div>

                        <div className="flex flex-1 flex-col gap-2 p-4">
                          <p className="flex items-center gap-1.5 text-xs font-semibold text-sr-muted">
                            <CalendarBlankIcon weight="bold" className="size-3.5" />
                            {formatDate(item.recordedAt)}
                          </p>
                          <h3 className="line-clamp-2 leading-snug font-extrabold text-pretty text-sr-ink transition-colors group-hover:text-sr-blue-600">
                            {item.title}
                          </h3>
                          {item.teacher && (
                            <p className="mt-auto flex items-center gap-1.5 pt-1 text-sm text-sr-ink-2">
                              <span className="flex size-6 items-center justify-center rounded-full bg-sr-sun-100 text-sr-amber-700">
                                <UserIcon weight="bold" className="size-3.5" />
                              </span>
                              <span className="truncate">{item.teacher}</span>
                            </p>
                          )}
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    disabled={currentPage === 1}
                    onClick={() => goToPage(currentPage - 1)}
                  >
                    <CaretLeftIcon weight="bold" /> <span className="max-sm:hidden">Sebelumnya</span>
                  </Button>
                  <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-sr-ink shadow-sr-1 ring-1 ring-sr-line">
                    {currentPage} <span className="font-medium text-sr-muted">/ {totalPages}</span>
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    disabled={currentPage === totalPages}
                    onClick={() => goToPage(currentPage + 1)}
                  >
                    <span className="max-sm:hidden">Berikutnya</span> <CaretRightIcon weight="bold" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <Dialog open={!!activeVideo} onOpenChange={(open) => !open && setActiveVideo(null)}>
        <DialogContent className="rounded-sr-lg sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="pr-6 text-left leading-snug font-extrabold text-sr-ink">
              {activeVideo?.title}
            </DialogTitle>
            <DialogDescription className="text-left">Rekaman live class Habitutor</DialogDescription>
          </DialogHeader>
          {activeVideo?.videoId ? (
            <>
              <div className="aspect-video w-full overflow-hidden rounded-sr-md">
                <YouTubePlayer videoId={activeVideo.videoId} />
              </div>
              {/* Cadangan kalau pemutar di dalam halaman tidak jalan (mis. browser bawaan WhatsApp/Instagram). */}
              <p className="flex flex-wrap items-center justify-between gap-2 text-xs text-sr-muted">
                Video tidak mau diputar?
                <a
                  href={`https://www.youtube.com/watch?v=${activeVideo.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full bg-sr-blue-50 px-3 py-1.5 font-bold text-sr-blue-700 hover:bg-sr-blue-100"
                >
                  Buka di YouTube <ArrowSquareOutIcon weight="bold" className="size-3.5" />
                </a>
              </p>
            </>
          ) : (
            <p className="text-sm text-sr-muted">Video belum tersedia.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RecordingsHeader() {
  return (
    // Di HP maskot mengintip dari bawah teks; mulai sm duduk di kanan, sama seperti header Premium.
    <div className="relative overflow-hidden rounded-sr-xl sr-card-blue px-5 pt-6 pb-36 sm:px-8 sm:py-9 sm:pr-72 lg:px-10 lg:py-11 lg:pr-96">
      <div className="pointer-events-none absolute -top-24 -right-20 size-72 rounded-full bg-white/8" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 size-40 rounded-full bg-white/5" />

      <span className="relative inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/20">
        <FilmStripIcon weight="fill" className="size-4 text-sr-sun-400" />
        Rekaman live class
      </span>
      <h1 className="relative mt-3 text-[26px] leading-tight font-extrabold text-balance text-white sm:text-3xl lg:text-4xl">
        Live Recording
      </h1>
      <p className="relative mt-2.5 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">
        Ketinggalan live class? Tenang, tonton ulang rekamannya kapan saja dan ulangi bagian yang belum kamu pahami.
      </p>

      <motion.img
        src="/avatar/study-avatar.webp"
        alt=""
        width={666}
        height={666}
        className="pointer-events-none absolute right-1/2 bottom-0 w-40 translate-x-1/2 select-none sm:right-8 sm:w-52 sm:translate-x-0 lg:right-14 lg:w-64"
        initial={{ y: 40 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
      />
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-sr-xl border border-dashed border-sr-line-2 bg-white/80 px-6 py-10 text-center">
      <img src="/avatar/confused-avatar.webp" alt="" className="h-32 w-auto motion-safe:animate-sr-drift" />
      <p className="text-lg font-extrabold text-sr-ink">{title}</p>
      <p className="max-w-sm text-sm leading-relaxed text-sr-muted">{description}</p>
    </div>
  );
}

const LOCKED_BENEFITS = ["Rekaman TKA, SNBT, dan Mandiri", "Tonton ulang tanpa batas", "Belajar kapan saja"];

function LockedState() {
  return (
    <div className="relative overflow-hidden rounded-sr-xl border border-sr-sun-200 bg-linear-to-br from-sr-cream via-white to-sr-sun-100 p-6 shadow-sr-1 md:p-8">
      <div className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-sr-sun-200/50" />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
        <img
          src="/avatar/avatar-premium.webp"
          alt=""
          width={657}
          height={519}
          className="mx-auto h-auto w-40 shrink-0 md:mx-0 md:w-48"
        />
        <div className="flex-1 text-center md:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sr-sun-500 px-3 py-1 text-xs font-bold text-sr-ink">
            <CrownSimpleIcon weight="fill" className="size-4" /> Khusus member Premium
          </span>
          <h2 className="mt-3 text-xl font-extrabold text-sr-ink md:text-2xl">Buka semua rekaman live class</h2>
          <ul className="mx-auto mt-3 flex w-fit flex-col items-start gap-1.5 text-left text-sm text-sr-ink-2 md:mx-0">
            {LOCKED_BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-center gap-2">
                <CheckCircleIcon weight="fill" className="size-4 shrink-0 text-sr-live" />
                {benefit}
              </li>
            ))}
          </ul>
          <Button className="sr-sheen mt-5 rounded-full" asChild>
            <Link to="/premium">
              Lihat Paket Premium <ArrowRightIcon weight="bold" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
