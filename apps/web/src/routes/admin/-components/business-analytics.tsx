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
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { orpc } from "@/utils/orpc";

const CHART_COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#06b6d4"];
const RANGE_OPTIONS = [30, 90, 180] as const;

const idr = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const compactNumber = new Intl.NumberFormat("id-ID", { notation: "compact" });

const MONTHLY_REPORT_START_YEAR = 2026;
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function formatMonthLabel(month: unknown) {
  return MONTH_NAMES[Number(String(month).slice(5, 7)) - 1] ?? String(month);
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatDateLabel(date: unknown) {
  const d = new Date(String(date));
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

type MonthlyCsvRow = {
  month: string;
  signups: number;
  totalUsers: number;
  premiumCustomers: number;
  revenuePremium: number;
  revenueTo10k: number;
  revenueTo5k: number;
  revenueOther: number;
  revenue: number;
};

function downloadMonthlyCsv(
  rows: MonthlyCsvRow[],
  totals: Omit<MonthlyCsvRow, "month" | "totalUsers">,
  year: number,
  filename: string,
) {
  const headers = [
    "Bulan",
    "User Baru",
    "Total User",
    "Pelanggan Premium",
    "Pemasukan Premium (Rp)",
    "Pemasukan TO 10.000 (Rp)",
    "Pemasukan Pembahasan 5.000 (Rp)",
    "Pemasukan Lainnya (Rp)",
    "Total Pemasukan (Rp)",
  ];
  const lines = rows.map((r) =>
    [
      `${formatMonthLabel(r.month)} ${year}`,
      r.signups,
      r.totalUsers,
      r.premiumCustomers,
      Math.round(r.revenuePremium),
      Math.round(r.revenueTo10k),
      Math.round(r.revenueTo5k),
      Math.round(r.revenueOther),
      Math.round(r.revenue),
    ].join(";"),
  );
  const totalLine = [
    "Total",
    totals.signups,
    "",
    totals.premiumCustomers,
    Math.round(totals.revenuePremium),
    Math.round(totals.revenueTo10k),
    Math.round(totals.revenueTo5k),
    Math.round(totals.revenueOther),
    Math.round(totals.revenue),
  ].join(";");
  // Pemisah ";" dan BOM UTF-8 supaya langsung rapi saat dibuka di Excel Indonesia
  const csv = [headers.join(";"), ...lines, totalLine].join("\r\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const PRINT_STYLE = `
@page { size: A4 landscape; margin: 10mm; }
@media print {
  html, body { background: #fff !important; }
  /* Hapus semua elemen selain laporan (dan pembungkusnya) dari tata letak cetak */
  body *:not(#monthly-report):not(#monthly-report *):not(:has(#monthly-report)) {
    display: none !important;
  }
  /* Pembungkus laporan jangan membatasi tinggi, supaya mengalir ke banyak halaman */
  html, body, *:has(#monthly-report) {
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    overflow: visible !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  #monthly-report {
    width: 100%;
    color-scheme: light;
    --background: #fff;
    --foreground: #111;
    --card: #fff;
    --card-foreground: #111;
    --muted: #f3f4f6;
    --muted-foreground: #555;
    --border: #d4d4d8;
    color: #111;
  }
  #monthly-report * {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .no-print { display: none !important; }
  #monthly-report .grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
  #monthly-report [data-slot="card"] { break-inside: avoid; box-shadow: none; }
  #monthly-report [data-slot="table-container"],
  #monthly-report [class*="overflow"] { overflow: visible !important; }
  #monthly-report table { font-size: 10px; }
  #monthly-report th, #monthly-report td { padding: 4px 6px !important; }
}
`;

function MonthlyReport() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const [year, setYear] = useState(currentYear);
  const [fromMonth, setFromMonth] = useState(1);
  // null = otomatis sampai bulan terbaru (bulan berjalan, atau Desember untuk tahun lampau)
  const [toMonth, setToMonth] = useState<number | null>(null);

  const years = Array.from(
    { length: currentYear - MONTHLY_REPORT_START_YEAR + 1 },
    (_, i) => MONTHLY_REPORT_START_YEAR + i,
  );
  const maxMonth = year === currentYear ? now.getMonth() + 1 : 12;
  const monthNumbers = Array.from({ length: maxMonth }, (_, i) => i + 1);

  const query = useQuery(
    orpc.admin.statistics.monthlyStats.queryOptions({
      input: { year, fromMonth, ...(toMonth ? { toMonth } : {}) },
    }),
  );
  const months = query.data?.months ?? [];
  const totals = query.data?.totals;
  const firstRow = months[0];
  const lastRow = months[months.length - 1];
  const rangeLabel =
    firstRow && lastRow ? `${formatMonthLabel(firstRow.month)} – ${formatMonthLabel(lastRow.month)} ${year}` : String(year);
  const showOther = (totals?.revenueOther ?? 0) > 0;

  const selectClass = "h-8 rounded-md border bg-background px-2 text-sm";

  const handleExportCsv = () => {
    if (!totals || !firstRow || !lastRow) return;
    const filename = `laporan-bulanan-${year}-${formatMonthLabel(firstRow.month).toLowerCase()}-${formatMonthLabel(lastRow.month).toLowerCase()}.csv`;
    downloadMonthlyCsv(months, totals, year, filename);
  };

  return (
    <section id="monthly-report">
      <style>{PRINT_STYLE}</style>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Laporan Bulanan</h2>
          <p className="text-sm text-muted-foreground">{rangeLabel} (zona waktu WIB)</p>
          <p className="hidden text-xs text-muted-foreground print:block">
            Habitutor · dicetak {now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="no-print flex flex-wrap items-center gap-2">
          <div className="flex gap-1">
            {years.map((y) => (
              <Button
                key={y}
                size="sm"
                variant={year === y ? "default" : "outline"}
                onClick={() => {
                  setYear(y);
                  setFromMonth(1);
                  setToMonth(null);
                }}
              >
                {y}
              </Button>
            ))}
          </div>
          <label className="flex items-center gap-1 text-sm">
            Dari
            <select
              className={selectClass}
              value={fromMonth}
              onChange={(e) => {
                const value = Number(e.target.value);
                setFromMonth(value);
                if (toMonth !== null && toMonth < value) setToMonth(value);
              }}
            >
              {monthNumbers.map((m) => (
                <option key={m} value={m}>
                  {MONTH_NAMES[m - 1]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-1 text-sm">
            Sampai
            <select
              className={selectClass}
              value={toMonth ?? "latest"}
              onChange={(e) => setToMonth(e.target.value === "latest" ? null : Number(e.target.value))}
            >
              <option value="latest">{year === currentYear ? "Bulan berjalan (otomatis)" : "Akhir tahun"}</option>
              {monthNumbers
                .filter((m) => m >= fromMonth)
                .map((m) => (
                  <option key={m} value={m}>
                    {MONTH_NAMES[m - 1]}
                  </option>
                ))}
            </select>
          </label>
          <Button size="sm" variant="outline" disabled={!totals} onClick={handleExportCsv}>
            Export CSV
          </Button>
          <Button size="sm" variant="outline" onClick={() => window.print()}>
            Cetak / PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          title="User Baru"
          value={totals?.signups}
          hint={
            lastRow
              ? `Total akun s.d. ${formatMonthLabel(lastRow.month)}: ${lastRow.totalUsers.toLocaleString()}`
              : undefined
          }
          isPending={query.isPending}
        />
        <KpiCard
          title="Pelanggan Premium"
          value={totals?.premiumCustomers}
          hint={totals ? `${totals.premiumPurchases.toLocaleString()} transaksi premium sukses` : undefined}
          isPending={query.isPending}
        />
        <KpiCard
          title="Total Pemasukan"
          value={totals ? idr.format(totals.revenue) : undefined}
          hint="Semua transaksi sukses (bukan simulasi)"
          isPending={query.isPending}
        />
        <KpiCard
          title="Pemasukan Premium"
          value={totals ? idr.format(totals.revenuePremium) : undefined}
          hint="Total semua paket premium"
          isPending={query.isPending}
        />
        <KpiCard
          title="Pemasukan TO 10.000"
          value={totals ? idr.format(totals.revenueTo10k) : undefined}
          hint="Paket 3 TryOut"
          isPending={query.isPending}
        />
        <KpiCard
          title="Pemasukan Pembahasan 5.000"
          value={totals ? idr.format(totals.revenueTo5k) : undefined}
          hint="Pembahasan TryOut"
          isPending={query.isPending}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <ChartCard title="User Baru per Bulan" description="Akun baru yang mendaftar" isPending={query.isPending}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={months}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" tickFormatter={formatMonthLabel} fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} width={40} />
              <Tooltip labelFormatter={formatMonthLabel} />
              <Bar dataKey="signups" name="User baru" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Pelanggan Premium per Bulan"
          description="User unik yang beli premium"
          isPending={query.isPending}
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={months}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" tickFormatter={formatMonthLabel} fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} width={40} />
              <Tooltip labelFormatter={formatMonthLabel} />
              <Bar dataKey="premiumCustomers" name="Pelanggan premium" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Pemasukan per Bulan" description="Rincian per jenis produk (IDR)" isPending={query.isPending}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={months}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" tickFormatter={formatMonthLabel} fontSize={12} />
              <YAxis tickFormatter={(v: number) => compactNumber.format(v)} fontSize={12} width={56} />
              <Tooltip labelFormatter={formatMonthLabel} formatter={(v) => idr.format(Number(v))} />
              <Legend />
              <Bar dataKey="revenuePremium" name="Premium" stackId="rev" fill="#10b981" />
              <Bar dataKey="revenueTo10k" name="TO 10.000" stackId="rev" fill="#3b82f6" />
              <Bar dataKey="revenueTo5k" name="Pembahasan 5.000" stackId="rev" fill="#f59e0b" />
              <Bar dataKey="revenueOther" name="Lainnya" stackId="rev" fill="#9ca3af" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <Card className="mt-4">
        <CardContent className="pt-6">
          {query.isPending ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bulan</TableHead>
                  <TableHead className="text-right">User Baru</TableHead>
                  <TableHead className="text-right">Total User</TableHead>
                  <TableHead className="text-right">Pelanggan Premium</TableHead>
                  <TableHead className="text-right">Premium</TableHead>
                  <TableHead className="text-right">TO 10.000</TableHead>
                  <TableHead className="text-right">Pembahasan 5.000</TableHead>
                  {showOther && <TableHead className="text-right">Lainnya</TableHead>}
                  <TableHead className="text-right">Total Pemasukan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {months.map((row) => (
                  <TableRow key={row.month}>
                    <TableCell className="font-medium">{formatMonthLabel(row.month)}</TableCell>
                    <TableCell className="text-right">{row.signups.toLocaleString("id-ID")}</TableCell>
                    <TableCell className="text-right">{row.totalUsers.toLocaleString("id-ID")}</TableCell>
                    <TableCell className="text-right">{row.premiumCustomers.toLocaleString("id-ID")}</TableCell>
                    <TableCell className="text-right">{idr.format(row.revenuePremium)}</TableCell>
                    <TableCell className="text-right">{idr.format(row.revenueTo10k)}</TableCell>
                    <TableCell className="text-right">{idr.format(row.revenueTo5k)}</TableCell>
                    {showOther && <TableCell className="text-right">{idr.format(row.revenueOther)}</TableCell>}
                    <TableCell className="text-right font-medium">{idr.format(row.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {totals && (
                <TableFooter>
                  <TableRow>
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">{totals.signups.toLocaleString("id-ID")}</TableCell>
                    <TableCell className="text-right">—</TableCell>
                    <TableCell className="text-right">{totals.premiumCustomers.toLocaleString("id-ID")}</TableCell>
                    <TableCell className="text-right">{idr.format(totals.revenuePremium)}</TableCell>
                    <TableCell className="text-right">{idr.format(totals.revenueTo10k)}</TableCell>
                    <TableCell className="text-right">{idr.format(totals.revenueTo5k)}</TableCell>
                    {showOther && <TableCell className="text-right">{idr.format(totals.revenueOther)}</TableCell>}
                    <TableCell className="text-right">{idr.format(totals.revenue)}</TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          )}
        </CardContent>
      </Card>
    </section>
  );
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
      <MonthlyReport />

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
                ? `DAU ${overview.activity.dau.toLocaleString()} ┬╖ WAU ${overview.activity.wau.toLocaleString()}`
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
            {typeof value === "number" ? value.toLocaleString() : (value ?? "ΓÇö")}
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
