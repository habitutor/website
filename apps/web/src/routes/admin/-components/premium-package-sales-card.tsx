import { TicketIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatWibDate } from "@/lib/premium-packages";
import { orpc } from "@/utils/orpc";

export function PremiumPackageSalesCard() {
  const { data, isPending } = useQuery(orpc.admin.statistics.premiumPackageSales.queryOptions());

  return (
    <Card className="sr-lift overflow-hidden rounded-sr-lg border-sr-line bg-linear-to-br from-sr-blue-50 to-white shadow-sr-1 transition-shadow duration-300 hover:shadow-sr-2">
      <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-sr-blue-200/60 pb-4">
        <CardTitle className="text-sm font-bold text-sr-ink-2">Penjualan Paket Premium</CardTitle>
        <TicketIcon className="size-5 text-sr-blue-600" weight="fill" />
      </CardHeader>
      <CardContent className="space-y-4 pt-5">
        {isPending ? (
          <Skeleton className="h-20 w-full" />
        ) : (
          <>
            <ul className="space-y-3 text-sm">
              {data?.packages.map((pkg) => (
                <li
                  key={pkg.slug}
                  className="flex items-center justify-between gap-3 rounded-sr-sm bg-white/70 px-3 py-2 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-sr-1"
                >
                  <span className="min-w-0 truncate font-semibold text-sr-ink-2">{pkg.name}</span>
                  <span className="font-black text-sr-blue-700">{pkg.soldCount} terjual</span>
                </li>
              ))}
            </ul>
            <p className="rounded-sr-sm border border-sr-blue-200 bg-sr-blue-50/70 px-3 py-2 text-sm font-medium text-sr-ink-2">
              Status:{" "}
              <span className={data?.isPromoActive ? "text-green-600" : "text-sr-muted"}>
                {data?.isPromoActive ? "Harga promo aktif" : "Harga normal"}
              </span>
            </p>
            {data?.promoEndsAt && (
              <p className="text-xs text-sr-muted">Promo berakhir {formatWibDate(data.promoEndsAt)} 23.59 WIB</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
