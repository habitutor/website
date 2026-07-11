import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/utils/orpc";

const CHART_COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#06b6d4"];
const RANGE_OPTIONS = [30, 90, 180] as const;

const idr = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const compactNumber = new Intl.NumberFormat("id-ID", { notation: "compact" });

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatDateLabel(date: unknown) {
  const d = new Date(String(date));
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export function BusinessAnalytics() {
  const [rangeDays, setRangeDays] = useState<number>(30);

  const overviewQuery = useQuery(orpc.admin.statistics.businessOverview.queryOptions());
  const seriesQuery = useQuery(orpc.admin.statistics.timeSeries.queryOptions({ input: { days: rangeDays } }));
  const audienceQuery = useQuery(orpc.admin.statistics.audienceInsights.queryOptions());

  const overview = overviewQuery.data;
  const series = seriesQuery.data;
  const audience = audienceQuery.data;

  return (
    <div className="mt-8 space-y-8">
      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Akun & Aktivitas</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Total Akun"
            value={overview?.accounts.total}
            hint={overview ? `${overview.accounts.verified.toLocaleString()} terverifikasi` : undefined}
            isPending={overviewQuery.isPending}
          />
          <KpiCard
            title="Signup 30 Hari Terakhir"
            value={overview?.accounts.newLast30Days}
            hint={overview ? `${overview.accounts.newLast7Days.toLocaleString()} dalam 7 hari` : undefined}
            isPending={overviewQuery.isPending}
          />
          <KpiCard
            title="Pengguna Aktif Bulanan (MAU)"
            value={overview?.activity.mau}
            hint={
              overview
                ? `DAU ${overview.activity.dau.toLocaleString()} · WAU ${overview.activity.wau.toLocaleString()}`
                : undefined
            }
            isPending={overviewQuery.isPending}
          />
          <KpiCard
            title="Tidak Aktif 30 Hari"
            value={overview?.activity.inactiveLast30Days}
            hint="Akun tanpa sesi dalam 30 hari"
            isPending={overviewQuery.isPending}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Premium & Revenue</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Premium Aktif"
            value={overview?.premium.active}
            hint={
              overview ? `${overview.premium.expiringNext30Days.toLocaleString()} kedaluwarsa dalam 30 hari` : undefined
            }
            isPending={overviewQuery.isPending}
          />
          <KpiCard
            title="Churn Premium"
            value={overview ? formatPercent(overview.premium.churnRate) : undefined}
            hint={overview ? `${overview.premium.expired.toLocaleString()} premium kedaluwarsa` : undefined}
            isPending={overviewQuery.isPending}
          />
          <KpiCard
            title="Konversi ke Berbayar"
            value={overview ? formatPercent(overview.premium.conversionRate) : undefined}
            hint={overview ? `${overview.premium.payingUsers.toLocaleString()} pengguna pernah membayar` : undefined}
            isPending={overviewQuery.isPending}
          />
          <KpiCard
            title="Revenue 30 Hari"
            value={overview ? idr.format(overview.revenue.last30Days) : undefined}
            hint={overview ? `Total ${idr.format(overview.revenue.total)}` : undefined}
            isPending={overviewQuery.isPending}
          />
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Tren Harian</h2>
          <div className="flex gap-1">
            {RANGE_OPTIONS.map((days) => (
              <Button
                key={days}
                size="sm"
                variant={rangeDays === days ? "default" : "outline"}
                onClick={() => setRangeDays(days)}
              >
                {days} hari
              </Button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Signup Baru" description="Akun baru per hari" isPending={seriesQuery.isPending}>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={series?.signups ?? []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tickFormatter={formatDateLabel} fontSize={12} minTickGap={24} />
                <YAxis allowDecimals={false} fontSize={12} width={40} />
                <Tooltip labelFormatter={formatDateLabel} />
                <Area
                  type="monotone"
                  dataKey="value"
                  name="Signup"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.15}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Pengguna Aktif"
            description="Pengguna unik dengan sesi baru per hari"
            isPending={seriesQuery.isPending}
          >
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={series?.activeUsers ?? []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tickFormatter={formatDateLabel} fontSize={12} minTickGap={24} />
                <YAxis allowDecimals={false} fontSize={12} width={40} />
                <Tooltip labelFormatter={formatDateLabel} />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Pengguna aktif"
                  stroke="#8b5cf6"
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Revenue" description="Pembayaran sukses per hari (IDR)" isPending={seriesQuery.isPending}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={series?.revenue ?? []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tickFormatter={formatDateLabel} fontSize={12} minTickGap={24} />
                <YAxis tickFormatter={(v: number) => compactNumber.format(v)} fontSize={12} width={56} />
                <Tooltip labelFormatter={formatDateLabel} formatter={(v) => idr.format(Number(v))} />
                <Bar dataKey="value" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Pembelian Premium"
            description="Transaksi subscription sukses per hari"
            isPending={seriesQuery.isPending}
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={series?.premiumPurchases ?? []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tickFormatter={formatDateLabel} fontSize={12} minTickGap={24} />
                <YAxis allowDecimals={false} fontSize={12} width={40} />
                <Tooltip labelFormatter={formatDateLabel} />
                <Bar dataKey="value" name="Pembelian" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Komposisi</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard
            title="Premium per Tier"
            description="Distribusi tier premium aktif"
            isPending={overviewQuery.isPending}
          >
            <DonutChart
              data={(overview?.premium.byTier ?? []).map((row) => ({ name: row.tier, value: row.count }))}
              emptyMessage="Belum ada pengguna premium"
            />
          </ChartCard>

          <ChartCard
            title="Status Transaksi"
            description="Semua transaksi berdasarkan status"
            isPending={overviewQuery.isPending}
          >
            <DonutChart
              data={(overview?.revenue.transactionsByStatus ?? []).map((row) => ({
                name: row.status,
                value: row.count,
              }))}
              emptyMessage="Belum ada transaksi"
            />
          </ChartCard>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Insight Audiens</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <RankedListCard
            title="Kampus Impian Teratas"
            description="Untuk memahami target pasar dan konten"
            rows={audience?.topDreamCampuses}
            isPending={audienceQuery.isPending}
          />
          <RankedListCard
            title="Jurusan Impian Teratas"
            description="Untuk arah pengembangan materi"
            rows={audience?.topDreamMajors}
            isPending={audienceQuery.isPending}
          />
        </div>
      </section>
    </div>
  );
}

function KpiCard({
  title,
  value,
  hint,
  isPending,
}: {
  title: string;
  value: number | string | undefined;
  hint?: string;
  isPending: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-2xl font-bold">
            {typeof value === "number" ? value.toLocaleString() : (value ?? "—")}
          </div>
        )}
        {hint && !isPending && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function ChartCard({
  title,
  description,
  isPending,
  children,
}: {
  title: string;
  description: string;
  isPending: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{isPending ? <Skeleton className="h-[260px] w-full" /> : children}</CardContent>
    </Card>
  );
}

function DonutChart({ data, emptyMessage }: { data: { name: string; value: number }[]; emptyMessage: string }) {
  if (data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">{emptyMessage}</div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

function RankedListCard({
  title,
  description,
  rows,
  isPending,
}: {
  title: string;
  description: string;
  rows: { name: string; count: number }[] | undefined;
  isPending: boolean;
}) {
  const max = rows?.[0]?.count ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }, (_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : !rows || rows.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Belum ada data</div>
        ) : (
          <div className="space-y-2">
            {rows.map((row, index) => (
              <div key={row.name} className="flex items-center gap-3">
                <Badge variant="outline" className="w-8 justify-center">
                  {index + 1}
                </Badge>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate font-medium">{row.name}</span>
                    <span className="ml-2 shrink-0 text-muted-foreground">{row.count.toLocaleString()}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${max > 0 ? Math.max((row.count / max) * 100, 4) : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
