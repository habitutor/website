import { ExamIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/lib/premium-packages";
import { orpc } from "@/utils/orpc";

export function FreemiumSalesCard() {
  const { data, isPending } = useQuery(orpc.admin.statistics.freemiumSales.queryOptions());

  return (
    <Card className="overflow-hidden border-emerald-200 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Penjualan TryOut</CardTitle>
        <ExamIcon className="size-4 text-emerald-600" weight="bold" />
      </CardHeader>
      <CardContent className="space-y-3">
        {isPending ? (
          <Skeleton className="h-20 w-full" />
        ) : (
          <>
            <ul className="space-y-1 text-sm">
              {data?.products.map((item) => (
                <li key={item.slug} className="flex items-center justify-between gap-3">
                  <span>
                    {item.name} <span className="text-xs text-muted-foreground">({formatRupiah(item.price)})</span>
                  </span>
                  <span className="text-right">
                    <span className="font-bold">{item.soldCount} terjual</span>
                    <span className="block text-xs text-muted-foreground">{formatRupiah(item.revenue)}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-sm">
              Lolos syarat gratis: <span className="font-bold">{data?.requirementsCompleted ?? 0} user</span>
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
