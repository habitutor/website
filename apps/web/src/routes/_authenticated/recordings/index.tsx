import { CaretLeftIcon, CaretRightIcon, LockKeyIcon, MagnifyingGlassIcon, PlayCircleIcon } from "@phosphor-icons/react";
import { isAdminRole } from "@habitutor/shared/auth-domain";
import { extractYouTubeId } from "@habitutor/shared/youtube";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import YouTubePlayer from "@/components/media/youtube-player";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  { value: "TKA", label: "TKA", card: "bg-primary-200 text-white", accent: "bg-primary-100" },
  { value: "SNBT", label: "SNBT", card: "bg-tertiary-400", accent: "bg-tertiary-200" },
  { value: "MANDIRI", label: "Mandiri", card: "bg-secondary-400", accent: "bg-secondary-600" },
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
    <div className="mt-4 space-y-6 sm:-mt-3">
      <div className="rounded-[10px] bg-tertiary-200 px-6 py-8 sm:px-10 sm:py-10">
        <h1 className="text-[24px] leading-tight font-bold text-neutral-1000 sm:text-[30px]">Live Recording</h1>
        <p className="mt-2 text-[14px] leading-5.25 text-neutral-1000">Tonton ulang rekaman live class kapan saja.</p>
      </div>

      {session.isPending ? (
        <Skeleton className="h-40 w-full" />
      ) : !canWatch ? (
        <Card className="flex flex-col items-center gap-4 p-8 text-center">
          <LockKeyIcon size={40} weight="fill" className="text-primary-300" />
          <h2 className="text-xl font-semibold">Live Recording khusus member Premium</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Upgrade ke Premium untuk menonton ulang semua rekaman live class TKA, SNBT, dan Mandiri.
          </p>
          <Link to="/premium" className={buttonVariants()}>
            Premium Sekarang
          </Link>
        </Card>
      ) : (
        <>
          <Tabs
            value={category}
            onValueChange={(value) => {
              setCategory(value as Category);
              setPage(1);
            }}
          >
            <TabsList>
              {CATEGORIES.map((c) => (
                <TabsTrigger key={c.value} value={c.value}>
                  {c.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="relative">
            <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari judul atau pemateri..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>

          {recordings.isPending && (
            <div className="grid grid-cols-1 gap-3 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i.toString()} className="h-40 w-full" />
              ))}
            </div>
          )}

          {recordings.isError && <p className="text-red-500">Error: {recordings.error.message}</p>}

          {recordings.data && recordings.data.length === 0 && (
            <p className="text-muted-foreground">Belum ada rekaman untuk kategori ini.</p>
          )}

          {recordings.data && recordings.data.length > 0 && filteredRecordings.length === 0 && (
            <p className="text-muted-foreground">Tidak ada rekaman yang cocok dengan "{search.trim()}".</p>
          )}

          {pagedRecordings.length > 0 && (
            <div ref={listTopRef} className="scroll-mt-24 space-y-6">
              <div className="grid grid-cols-1 gap-3 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
                {pagedRecordings.map((item) => (
                  <Card
                    key={item.id}
                    className={cn(
                      style.card,
                      "relative min-h-40 overflow-hidden border-0 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
                    )}
                  >
                    <div className={cn(style.accent, "absolute right-0 bottom-0 aspect-square h-[70%] w-auto")} />
                    <div className="relative z-10 flex h-full flex-col justify-between gap-6">
                      <div>
                        <p className="text-xs font-medium opacity-80">{formatDate(item.recordedAt)}</p>
                        <h3 className="mt-1 font-semibold text-pretty">{item.title}</h3>
                        {item.teacher && <p className="text-sm font-light">Pemateri: {item.teacher}</p>}
                      </div>
                      <Button
                        variant="lightBlue"
                        size="sm"
                        className="w-fit"
                        onClick={() =>
                          setActiveVideo({ title: item.title, videoId: extractYouTubeId(item.youtubeUrl) })
                        }
                      >
                        <PlayCircleIcon weight="fill" /> Tonton
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => goToPage(currentPage - 1)}
                  >
                    <CaretLeftIcon /> Sebelumnya
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Halaman {currentPage} dari {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => goToPage(currentPage + 1)}
                  >
                    Berikutnya <CaretRightIcon />
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <Dialog open={!!activeVideo} onOpenChange={(open) => !open && setActiveVideo(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{activeVideo?.title}</DialogTitle>
            <DialogDescription>Rekaman live class</DialogDescription>
          </DialogHeader>
          {activeVideo?.videoId ? (
            <div className="aspect-video w-full">
              <YouTubePlayer videoId={activeVideo.videoId} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Video belum tersedia.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}