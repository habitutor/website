import { TicketIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah, formatWibDate } from "@/lib/premium-packages";
import { orpc } from "@/utils/orpc";

export function PremiumPackageSalesCard() {
  const { data, isPending } = useQuery(orpc.admin.statistics.premiumPackageSales.queryOptions());

  return (
    <Card className="from-primary-50 dark:from-primary-950/20 overflow-hidden border-primary-200 bg-gradient-to-br to-white dark:to-background">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Penjualan Paket Premium</CardTitle>
        <TicketIcon className="size-4 text-primary-500" weight="bold" />
      </CardHeader>
      <CardContent className="space-y-3">
        {isPending ? (
          <Skeleton className="h-20 w-full" />
        ) : (
          <>
            <ul className="space-y-1 text-sm">
              {data?.packages.map((pkg) => (
                <li key={pkg.slug} className="flex items-center justify-between gap-3">
                  <span>
                    {pkg.name} <span className="text-xs text-muted-foreground">({formatRupiah(pkg.currentPrice)})</span>
                  </span>
                  <span className="font-bold">{pkg.soldCount} terjual</span>
                </li>
              ))}
            </ul>
            <p className="text-sm font-medium">
              Status:{" "}
              <span className={data?.isPromoActive ? "text-green-600" : "text-muted-foreground"}>
                {data?.isPromoActive ? "Harga promo aktif" : "Harga normal"}
              </span>
            </p>
            {data?.promoEndsAt && (
              <p className="text-xs text-muted-foreground">
                Promo berakhir {formatWibDate(data.promoEndsAt)} 23.59 WIB
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
