import { InfoIcon, UsersThreeIcon } from "@phosphor-icons/react";
import { GROUP_BUY_COPY, GROUP_BUY_FALLBACK } from "@/lib/group-buy-copy";
import { formatRupiah } from "@/lib/perintis-pricing-copy";
import { cn } from "@/lib/utils";

export function GroupBuyPriceRow({
  seatPrice = GROUP_BUY_FALLBACK.price,
  fullPrice = GROUP_BUY_FALLBACK.fullPrice,
  className,
}: {
  seatPrice?: number;
  fullPrice?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-baseline gap-2", className)}>
      <p className="text-3xl font-black text-primary-500">{formatRupiah(seatPrice)}</p>
      <div className="relative inline-block text-base font-bold text-neutral-500">
        {formatRupiah(fullPrice)}
        <span className="pointer-events-none absolute top-1/2 left-0 h-0.5 w-full -rotate-6 bg-red-400" />
      </div>
      <span className="text-xs text-muted-foreground">per orang, sekali bayar</span>
    </div>
  );
}

// Upfront transparency: the exact conditions of the deal and what happens if
// the group fails, shown before anyone pays.
export function GroupBuyTerms({ className }: { className?: string }) {
  const copy = GROUP_BUY_COPY;

  return (
    <div className={cn("space-y-4", className)}>
      <ol className="space-y-2">
        {copy.rules.map((rule, index) => (
          <li key={rule} className="flex items-start gap-2 text-sm">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-300 text-xs font-bold text-white">
              {index + 1}
            </span>
            {rule}
          </li>
        ))}
      </ol>

      <p className="flex items-start gap-2 rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-2 text-xs font-semibold text-yellow-800">
        <InfoIcon weight="fill" className="mt-0.5 size-4 shrink-0" />
        {copy.importantNote}
      </p>

      <div className="rounded-lg border border-neutral-300 bg-neutral-100 p-3">
        <p className="flex items-center gap-2 text-sm font-bold">
          <UsersThreeIcon weight="fill" className="size-4 text-primary-400" />
          {copy.failureTitle}
        </p>
        <ul className="mt-2 space-y-1.5">
          {copy.failureOptions.map((option) => (
            <li key={option} className="flex items-start gap-2 text-xs text-muted-foreground">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-neutral-500" />
              {option}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
