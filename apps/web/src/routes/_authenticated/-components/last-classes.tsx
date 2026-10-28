import { ArrowRightIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { LastContentViewedCard } from "@/components/classes/content";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/utils/orpc";
import { SectionCard } from "./section-card";

export const LastClasses = () => {
  const { data, isPending } = useQuery(orpc.subtest.content.recent.queryOptions());
  const recentViews = Array.isArray(data) ? data : [];

  if (isPending) {
    return (
      <SectionCard title="Kelas terakhirmu">
        <div className="space-y-2">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </SectionCard>
    );
  }

  if (recentViews.length === 0) {
    return (
      <SectionCard title="Kelas terakhirmu">
        <div className="flex flex-col items-center justify-center space-y-6 py-8 text-center">
          <img src="/avatar/confused-avatar.webp" alt="Belum ada kelas" className="h-40 w-auto animate-sr-drift" />
          <p className="text-2xl font-extrabold text-sr-ink">Kamu belum melihat kelas apapun</p>
          <Button asChild>
            <Link to="/classes">
              Kelas Sekarang <ArrowRightIcon className="" />
            </Link>
          </Button>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Kelas terakhirmu">
      <div className="space-y-2">
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
