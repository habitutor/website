import { CaretRightIcon, UsersThreeIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "@tanstack/react-router";
import { orpc } from "@/utils/orpc";
import { GroupBuyCountdown, GroupBuySlots } from "./group-progress";

const COMPLETED_BANNER_WINDOW_MS = 24 * 60 * 60 * 1000;

// Persistent group-buy status: countdown + seats filled, visible on every
// authenticated page while the user has an unresolved group.
export function GroupBuyStatusBanner() {
  const location = useLocation();
  const { data: group } = useQuery(
    orpc.groupBuy.mine.queryOptions({
      refetchInterval: 30_000,
    }),
  );

  // The /group-buy pages already show full live status.
  if (location.pathname.startsWith("/group-buy")) return null;
  if (!group) return null;

  const needsResolution =
    group.status === "expired" &&
    (group.viewer?.memberStatus === "paid" || group.viewer?.memberStatus === "refund_requested");
  const recentlyCompleted =
    group.status === "completed" &&
    group.completedAt !== null &&
    Date.now() - new Date(group.completedAt).getTime() < COMPLETED_BANNER_WINDOW_MS;

  if (group.status !== "active" && !needsResolution && !recentlyCompleted) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2">
      <Link
        to="/group-buy"
        className="flex items-center justify-between gap-3 rounded-full border-2 border-neutral-1000 bg-primary-500 px-4 py-2.5 text-neutral-100 shadow-lg transition-transform hover:scale-[1.02]"
      >
        {group.status === "active" ? (
          <>
            <div className="flex items-center gap-2">
              <UsersThreeIcon weight="fill" className="size-5 shrink-0" />
              <GroupBuySlots paidCount={group.paidCount} requiredMembers={group.requiredMembers} />
              <span className="text-xs font-bold whitespace-nowrap">
                {group.paidCount}/{group.requiredMembers}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <GroupBuyCountdown expiresAt={group.expiresAt} className="text-sm" />
              <CaretRightIcon weight="bold" className="size-4 shrink-0" />
            </div>
          </>
        ) : group.status === "completed" ? (
          <>
            <span className="text-sm font-bold">Grup lengkap — Premium kamu aktif! 🎉</span>
            <CaretRightIcon weight="bold" className="size-4 shrink-0" />
          </>
        ) : (
          <>
            <span className="flex items-center gap-2 text-sm font-bold">
              <WarningCircleIcon weight="fill" className="size-5 shrink-0 text-secondary-200" />
              Grup patungan berakhir — pilih opsi kamu
            </span>
            <CaretRightIcon weight="bold" className="size-4 shrink-0" />
          </>
        )}
      </Link>
    </div>
  );
}
