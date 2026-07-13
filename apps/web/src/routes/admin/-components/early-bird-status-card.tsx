import { TicketIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/lib/perintis-pricing-copy";
import { orpc } from "@/utils/orpc";

export function EarlyBirdStatusCard() {
  const { data, isPending } = useQuery(orpc.admin.statistics.perintisEarlyBird.queryOptions());

  return (
    <Card className="from-primary-50 dark:from-primary-950/20 overflow-hidden border-primary-200 bg-gradient-to-br to-white dark:to-background">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Perintis Early Bird</CardTitle>
        <TicketIcon className="size-4 text-primary-500" weight="bold" />
      </CardHeader>
      <CardContent className="space-y-3">
        {isPending ? (
          <Skeleton className="h-20 w-full" />
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-2xl font-bold">{data?.totalSlots ?? 0}</p>
                <p className="text-xs text-muted-foreground">Total slot</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{data?.slotsClaimed ?? 0}</p>
                <p className="text-xs text-muted-foreground">Sudah diambil</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{data?.slotsRemaining ?? 0}</p>
                <p className="text-xs text-muted-foreground">Sisa slot</p>
              </div>
            </div>
            <p className="text-sm font-medium">
              Status:{" "}
              <span className={data?.isActive ? "text-green-600" : "text-muted-foreground"}>
                {data?.isActive ? "Early bird masih aktif" : "Early bird sudah berakhir"}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              Harga saat ini: {formatRupiah(data?.isActive ? (data?.earlyBirdPrice ?? 0) : (data?.regularPrice ?? 0))}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
