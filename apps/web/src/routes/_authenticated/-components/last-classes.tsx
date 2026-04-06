import { ArrowRightIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { LastContentViewedCard } from "@/components/classes/content";
import { Button } from "@/components/ui/button";
import { orpc } from "@/utils/orpc";
import { DashboardCard, DashboardCardTitle } from "./dashboard-card";

export const LastClasses = () => {
  const { data, isPending } = useQuery(orpc.subtest.content.recent.queryOptions());

  if (isPending) {
    return (
      <DashboardCard>
        <DashboardCardTitle>Kelas terakhirmu</DashboardCardTitle>
        <div className="animate-pulse space-y-2">
          <div className="h-32 rounded-md bg-neutral-200" />
          <div className="h-32 rounded-md bg-neutral-200" />
        </div>
      </DashboardCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <DashboardCard>
        <DashboardCardTitle className="mb-0">Kelas terakhirmu</DashboardCardTitle>
        <div className="flex flex-col items-center justify-center space-y-6 py-8 text-center">
          <img src="/avatar/confused-avatar.webp" alt="Belum ada kelas" className="h-40 w-auto" />
          <p className="text-2xl font-bold text-black">Kamu belum melihat kelas apapun</p>
          <Button asChild>
            <Link to="/classes">
              Kelas Sekarang <ArrowRightIcon className="" />
            </Link>
          </Button>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard>
      <DashboardCardTitle>Kelas terakhirmu</DashboardCardTitle>
      <div className="space-y-2">
        {data.map((view, idx) => (
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
    </DashboardCard>
  );
};
