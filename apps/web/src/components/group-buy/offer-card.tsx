import { UsersThreeIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button";
import { GROUP_BUY_COPY } from "@/lib/group-buy-copy";
import { cn } from "@/lib/utils";
import { GroupBuyPriceRow, GroupBuyTerms } from "./group-buy-terms";

export function GroupBuyOfferCard({ className }: { className?: string }) {
  const copy = GROUP_BUY_COPY;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border-2 border-tertiary-300 bg-white shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4 border-b-2 border-neutral-1000 bg-tertiary-200 px-6 py-4">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold">
            <UsersThreeIcon weight="fill" className="size-5" />
            {copy.label}
          </h3>
          <p className="text-xs font-medium">{copy.tagline}</p>
        </div>
        <span className="rounded-full bg-primary-500 px-3 py-1 text-xs font-bold whitespace-nowrap text-neutral-100">
          Hemat Rp150.000
        </span>
      </div>

      <div className="space-y-4 px-6 py-5">
        <GroupBuyPriceRow />
        <GroupBuyTerms />
        <Link
          to="/group-buy"
          className={cn(
            buttonVariants({ variant: "darkBlue", size: "lg" }),
            "hover:bg-primary-600 w-full border border-neutral-1000 text-base font-bold tracking-wide uppercase",
          )}
        >
          {copy.ctaStart}
        </Link>
      </div>
    </div>
  );
}
