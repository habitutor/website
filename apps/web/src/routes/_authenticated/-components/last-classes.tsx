import { ArrowRightIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { LastContentViewedCard } from "@/components/classes/content";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/utils/orpc";
import { Accent, SectionCard } from "./section-card";

export const LastClasses = () => {
  const { data, isPending } = useQuery(orpc.subtest.content.recent.queryOptions());
  const recentViews = Array.isArray(data) ? data : [];

  if (isPending) {
    return (
      <SectionCard
        title={
          <>
            Kelas <Accent>terakhirmu</Accent>
          </>
        }
      >
        <div className="space-y-2">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </SectionCard>
    );
  }

  if (recentViews.length === 0) {
    return (
      <SectionCard
        title={
          <>
            Kelas <Accent>terakhirmu</Accent>
          </>
        }
      >
        <div className="flex flex-col gap-4 rounded-sr-lg border border-sr-line bg-white p-4 shadow-sr-1 sm:flex-row sm:items-center md:gap-6 md:p-6">
          <div className="flex min-w-0 flex-1 items-center gap-4 md:gap-6">
            <img src="/avatar/confused-avatar.webp" alt="" className="h-20 w-auto shrink-0 object-contain md:h-24" />
            <div className="min-w-0">
              <p className="font-extrabold text-sr-ink md:text-lg">Belum ada kelas yang kamu buka</p>
              <p className="mt-1 text-sm leading-relaxed text-sr-muted">
                Mulai dari satu materi dulu. Nanti kelasmu muncul di sini biar gampang dilanjutkan.
              </p>
            </div>
          </div>
          <Button className="w-full shrink-0 rounded-full sm:w-auto" asChild>
            <Link to="/classes">
              Pilih kelas <ArrowRightIcon weight="bold" />
            </Link>
          </Button>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title={
        <>
          Kelas <Accent>terakhirmu</Accent>
        </>
      }
      action={
        // Bentuknya sama dengan tombol "Lihat jadwal" di bagian Live Class.
        <Button className="shrink-0 rounded-full" asChild>
          <Link to="/classes">
            Semua kelas <ArrowRightIcon weight="bold" />
          </Link>
        </Button>
      }
    >
      <div className="space-y-3">
        {recentViews.map((view, idx) => (
          <LastContentViewedCard
            key={view.contentId}
            item={{
              id: view.contentId,
              title: view.contentTitle,
              hasVideo: Boolean(view.hasVideo),
              hasNote: Boolean(view.hasNote),
              hasPracticeQuestions: Boolean(view.hasPracticeQuestions),
            }}
            index={idx}
            shortName={view.subtestShortName}
          />
        ))}
      </div>
    </SectionCard>
  );
};
