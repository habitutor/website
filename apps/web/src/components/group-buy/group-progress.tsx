import { CheckIcon, ClockIcon, UsersThreeIcon } from "@phosphor-icons/react";
import useCountdown from "@/lib/hooks/use-countdown";
import { cn } from "@/lib/utils";

export function GroupBuyCountdown({ expiresAt, className }: { expiresAt: Date | string; className?: string }) {
  const [days, hours, minutes, seconds] = useCountdown(expiresAt);
  const totalHours = Number(days) * 24 + Number(hours);

  return (
    <span className={cn("font-mono font-bold tabular-nums", className)}>
      {String(totalHours).padStart(2, "0")}:{minutes}:{seconds}
    </span>
  );
}

export function GroupBuySlots({
  paidCount,
  requiredMembers,
  className,
}: {
  paidCount: number;
  requiredMembers: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {Array.from({ length: requiredMembers }, (_, index) => (
        <span
          key={index}
          className={cn(
            "flex size-7 items-center justify-center rounded-full border-2 text-xs font-bold",
            index < paidCount
              ? "border-green-600 bg-green-500 text-white"
              : "border-dashed border-neutral-400 bg-neutral-100 text-neutral-400",
          )}
        >
          {index < paidCount ? <CheckIcon weight="bold" size={14} /> : "?"}
        </span>
      ))}
    </div>
  );
}

export function GroupBuyProgress({
  paidCount,
  requiredMembers,
  expiresAt,
  isActive,
  className,
}: {
  paidCount: number;
  requiredMembers: number;
  expiresAt: Date | string;
  isActive: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3", className)}>
      <div className="flex items-center gap-2">
        <UsersThreeIcon weight="fill" className="size-5 text-primary-400" />
        <GroupBuySlots paidCount={paidCount} requiredMembers={requiredMembers} />
        <span className="text-sm font-bold">
          {paidCount}/{requiredMembers} orang
        </span>
      </div>
      {isActive && (
        <div className="flex items-center gap-2 rounded-full bg-secondary-100 px-3 py-1.5">
          <ClockIcon weight="fill" className="size-4 text-secondary-1000" />
          <GroupBuyCountdown expiresAt={expiresAt} className="text-sm text-secondary-1000" />
          <span className="text-xs font-medium text-secondary-1000">tersisa</span>
        </div>
      )}
    </div>
  );
}
