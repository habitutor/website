import { ExamIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/utils/orpc";

export function FreemiumSalesCard() {
  const { data, isPending } = useQuery(orpc.admin.statistics.freemiumSales.queryOptions());

  return (
    <Card className="sr-lift overflow-hidden rounded-sr-lg border-sr-line bg-linear-to-br from-sr-orange-100 to-white shadow-sr-1 transition-shadow duration-300 hover:shadow-sr-2">
      <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-sr-orange-200/60 pb-4">
        <CardTitle className="text-sm font-bold text-sr-ink-2">Penjualan Try Out</CardTitle>
        <ExamIcon className="size-5 text-sr-orange-700" weight="fill" />
      </CardHeader>
      <CardContent className="space-y-4 pt-5">
        {isPending ? (
          <Skeleton className="h-20 w-full" />
        ) : (
          <>
            <ul className="space-y-3 text-sm">
              {data?.products.map((item) => (
                <li
                  key={item.slug}
                  className="flex items-center justify-between gap-3 rounded-sr-sm bg-white/70 px-3 py-2 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-sr-1"
                >
                  <span className="min-w-0 truncate font-semibold text-sr-ink-2">{item.name}</span>
                  <span className="text-right">
                    <span className="font-black text-sr-orange-700">{item.soldCount} terjual</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="rounded-sr-sm border border-sr-orange-200 bg-sr-orange-100/60 px-3 py-2 text-sm text-sr-ink-2">
              Lolos syarat gratis: <span className="font-bold">{data?.requirementsCompleted ?? 0} user</span>
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
