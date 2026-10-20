import { LockKeyIcon, PlayCircleIcon } from "@phosphor-icons/react";
import { isAdminRole } from "@habitutor/shared/auth-domain";
import { extractYouTubeId } from "@habitutor/shared/youtube";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import YouTubePlayer from "@/components/media/youtube-player";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

const formatDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

function RecordingsPage() {
  const session = authClient.useSession();
  const canWatch = Boolean(session.data?.user?.isPremium) || isAdminRole(session.data?.user?.role);
  const [category, setCategory] = useState<Category>("TKA");
  const [activeVideo, setActiveVideo] = useState<{ title: string; videoId: string } | null>(null);

  const recordings = useQuery({
    ...orpc.recording.list.queryOptions({ input: { category } }),
    enabled: canWatch,
  });

  const style = CATEGORIES.find((c) => c.value === category) ?? CATEGORIES[0];

  return (
    <div className="mt-4 space-y-6 sm:-mt-3">
      <div className="rounded-[10px] bg-tertiary-200 px-6 py-8 sm:px-10 sm:py-10">
        <h1 className="text-[24px] leading-tight font-bold text-neutral-1000 sm:text-[30px]">Live Recording</h1>
        <p className="mt-2 text-[14px] leading-5.25 text-neutral-1000">
          Tonton ulang rekaman live class kapan saja.
        </p>
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
          <Tabs value={category} onValueChange={(value) => setCategory(value as Category)}>
            <TabsList>
              {CATEGORIES.map((c) => (
                <TabsTrigger key={c.value} value={c.value}>
                  {c.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

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

          {recordings.data && recordings.data.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
              {recordings.data.map((item) => (
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