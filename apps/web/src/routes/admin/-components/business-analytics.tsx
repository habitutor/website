import { useQuery } from "@tanstack/react-query";
import { ChartLineUp } from "@phosphor-icons/react";
import { useState } from "react";
import {
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
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

const CHART_COLORS = ["#2356e8", "#ffc83d", "#f08a4b", "#17a36f", "#8fb2ff", "#b4521a"];

function SunriseChartDefs() {
  return (
    <defs>
      <linearGradient id="srBlueChart" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6a98ff" stopOpacity={0.95} />
        <stop offset="100%" stopColor="#2356e8" stopOpacity={0.8} />
      </linearGradient>
      <linearGradient id="srSunChart" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffe28a" stopOpacity={1} />
        <stop offset="100%" stopColor="#ffc12e" stopOpacity={0.85} />
      </linearGradient>
      <linearGradient id="srOrangeChart" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffcfae" stopOpacity={1} />
        <stop offset="100%" stopColor="#f08a4b" stopOpacity={0.85} />
      </linearGradient>
      <linearGradient id="srAreaChart" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2f6bff" stopOpacity={0.35} />
        <stop offset="100%" stopColor="#2f6bff" stopOpacity={0.02} />
      </linearGradient>
      <filter id="srDonutShadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#14224e" floodOpacity="0.2" />
      </filter>
    </defs>
  );
}
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

export function MonthlyReport() {
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
  const activeMonths = months.filter(
    (row) => row.signups > 0 || row.revenue > 0 || row.premiumCustomers > 0 || row.revenuePremium > 0,
  );
  const totals = query.data?.totals;
  const firstRow = months[0];
  const lastRow = months[months.length - 1];
  const rangeLabel =
    firstRow && lastRow
      ? `${formatMonthLabel(firstRow.month)} – ${formatMonthLabel(lastRow.month)} ${year}`
      : String(year);
  const showOther = (totals?.revenueOther ?? 0) > 0;

  const selectClass =
    "h-9 rounded-full border border-sr-line bg-white px-3 text-sm text-sr-ink outline-none transition-colors focus:border-sr-blue-300 focus:ring-4 focus:ring-sr-blue-100";

  const handleExportCsv = () => {
    if (!totals || !firstRow || !lastRow) return;
    const filename = `laporan-bulanan-${year}-${formatMonthLabel(firstRow.month).toLowerCase()}-${formatMonthLabel(lastRow.month).toLowerCase()}.csv`;
    downloadMonthlyCsv(months, totals, year, filename);
  };

  return (
    <section id="monthly-report">
      <style>{PRINT_STYLE}</style>
      <div className="mb-4 sr-card-hover rounded-sr-xl border border-sr-line bg-linear-to-br from-sr-ivory via-white to-sr-blue-50/50 p-4 shadow-sr-1 sm:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-sr-sm bg-sr-blue-100 text-sr-blue-600">
              <ChartLineUp className="size-5" weight="fill" />
            </span>
            <div>
              <h2 className="text-lg font-black tracking-tight text-sr-ink">Laporan Bulanan</h2>
              <p className="text-sm text-sr-muted">{rangeLabel} (zona waktu WIB)</p>
              <p className="hidden text-xs text-sr-muted print:block">
                Habitutor · dicetak{" "}
                {now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
          <div className="no-print flex flex-wrap items-center gap-x-4 gap-y-3">
            <div className="flex items-center gap-1 rounded-full bg-sr-ivory p-1" role="group" aria-label="Tahun">
              {years.map((y) => (
                <Button
                  key={y}
                  size="sm"
                  variant={year === y ? "default" : "outline"}
                  aria-pressed={year === y}
                  className="rounded-full"
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
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-sr-muted">
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
              <span aria-hidden className="text-sr-muted">
                →
              </span>
              <label className="flex items-center gap-1.5 text-xs font-bold text-sr-muted">
                Sampai
                <select
                  className={selectClass}
                  value={toMonth ?? "latest"}
                  onChange={(e) => setToMonth(e.target.value === "latest" ? null : Number(e.target.value))}
                >
                  <option value="latest">{year === currentYear ? "Terbaru" : "Akhir tahun"}</option>
                  {monthNumbers
                    .filter((m) => m >= fromMonth)
                    .map((m) => (
                      <option key={m} value={m}>
                        {MONTH_NAMES[m - 1]}
                      </option>
                    ))}
                </select>
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
              <Button size="sm" variant="outline" className="rounded-full" disabled={!totals} onClick={handleExportCsv}>
                Export CSV
              </Button>
              <Button size="sm" variant="secondary" className="rounded-full" onClick={() => window.print()}>
                Cetak PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartCard title="User Baru per Bulan" description="Akun baru yang mendaftar" isPending={query.isPending}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={months} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
              <SunriseChartDefs />
              <CartesianGrid vertical={false} stroke="#dfe9ff" strokeDasharray="4 4" />
              <XAxis dataKey="month" tickFormatter={formatMonthLabel} fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} width={40} />
              <Tooltip content={<SunriseTooltip />} labelFormatter={formatMonthLabel} />
              <Bar
                isAnimationActive
                animationDuration={1100}
                animationEasing="ease-out"
                dataKey="signups"
                name="User baru"
                fill="url(#srBlueChart)"
                radius={[8, 8, 2, 2]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Pelanggan Premium per Bulan"
          description="User unik yang beli premium"
          isPending={query.isPending}
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={months} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
              <SunriseChartDefs />
              <CartesianGrid vertical={false} stroke="#dfe9ff" strokeDasharray="4 4" />
              <XAxis dataKey="month" tickFormatter={formatMonthLabel} fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} width={40} />
              <Tooltip content={<SunriseTooltip />} labelFormatter={formatMonthLabel} />
              <Bar
                isAnimationActive
                animationDuration={1200}
                animationEasing="ease-out"
                dataKey="premiumCustomers"
                name="Pelanggan premium"
                fill="url(#srSunChart)"
                radius={[8, 8, 2, 2]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Pemasukan per Bulan"
          description="Rincian per jenis produk (IDR)"
          isPending={query.isPending}
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={months} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
              <SunriseChartDefs />
              <CartesianGrid vertical={false} stroke="transparent" />
              <XAxis dataKey="month" tickFormatter={formatMonthLabel} fontSize={12} />
              <YAxis tickFormatter={(v: number) => compactNumber.format(v)} fontSize={12} width={56} />
              <Tooltip
                content={<SunriseTooltip />}
                labelFormatter={formatMonthLabel}
                formatter={(v) => idr.format(Number(v))}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} iconType="circle" />
              <Bar
                isAnimationActive
                animationDuration={1300}
                animationEasing="ease-out"
                dataKey="revenuePremium"
                name="Premium"
                stackId="rev"
                fill="#17a36f"
                stroke="#ffffff"
                strokeWidth={1.5}
                maxBarSize={44}
              />
              <Bar
                isAnimationActive
                animationDuration={1300}
                animationEasing="ease-out"
                dataKey="revenueTo10k"
                name="TO 10.000"
                stackId="rev"
                fill="#2356e8"
                stroke="#ffffff"
                strokeWidth={1.5}
                maxBarSize={44}
              />
              <Bar
                isAnimationActive
                animationDuration={1300}
                animationEasing="ease-out"
                dataKey="revenueTo5k"
                name="Pembahasan 5.000"
                stackId="rev"
                fill="#ffc83d"
                stroke="#ffffff"
                strokeWidth={1.5}
                maxBarSize={44}
              />
              <Bar
                isAnimationActive
                animationDuration={1300}
                animationEasing="ease-out"
                dataKey="revenueOther"
                name="Lainnya"
                stackId="rev"
                fill="#9aa6c2"
                stroke="#ffffff"
                strokeWidth={1.5}
                maxBarSize={44}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <Card className="mt-6 sr-card-hover overflow-hidden rounded-sr-xl border-sr-line shadow-sr-1">
        <CardHeader className="border-b border-sr-line bg-sr-ivory/60 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-sr-sm bg-sr-blue-100 text-sr-blue-600">
              <ChartLineUp className="size-4" weight="fill" />
            </span>
            <div>
              <CardTitle className="text-base font-black text-sr-ink">Detail Laporan</CardTitle>
              <CardDescription>Rincian pemasukan dan pertumbuhan per bulan.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {query.isPending ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <div>
              <div className="divide-y divide-sr-line sm:hidden">
                {activeMonths.map((row) => (
                  <div key={row.month} className="space-y-3 p-4 transition-colors hover:bg-sr-blue-50/40">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sr-ink">{formatMonthLabel(row.month)}</span>
                      <span className="rounded-full bg-sr-blue-50 px-2.5 py-1 text-xs font-black text-sr-blue-700">
                        {idr.format(row.revenue)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-sr-muted">
                      <span>
                        User baru <strong className="ml-1 text-sr-ink-2">{row.signups.toLocaleString("id-ID")}</strong>
                      </span>
                      <span>
                        Total user{" "}
                        <strong className="ml-1 text-sr-ink-2">{row.totalUsers.toLocaleString("id-ID")}</strong>
                      </span>
                      <span>
                        Premium{" "}
                        <strong className="ml-1 text-sr-ink-2">{row.premiumCustomers.toLocaleString("id-ID")}</strong>
                      </span>
                      <span>
                        Revenue premium <strong className="ml-1 text-sr-ink-2">{idr.format(row.revenuePremium)}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Table className="hidden text-sm sm:table">
                <TableHeader className="hidden sm:table-header-group">
                  <TableRow className="border-sr-line bg-sr-ivory/70">
                    <TableHead className="h-12 px-5 text-xs font-black tracking-wide text-sr-muted uppercase">
                      Bulan
                    </TableHead>
                    <TableHead className="h-12 text-right text-xs font-black tracking-wide text-sr-muted uppercase">
                      User Baru
                    </TableHead>
                    <TableHead className="h-12 text-right text-xs font-black tracking-wide text-sr-muted uppercase">
                      Total User
                    </TableHead>
                    <TableHead className="h-12 text-right text-xs font-black tracking-wide text-sr-muted uppercase">
                      Premium
                    </TableHead>
                    <TableHead className="h-12 text-right text-xs font-black tracking-wide text-sr-muted uppercase">
                      Revenue Premium
                    </TableHead>
                    <TableHead className="h-12 text-right text-xs font-black tracking-wide text-sr-muted uppercase">
                      TO 10K
                    </TableHead>
                    <TableHead className="h-12 text-right text-xs font-black tracking-wide text-sr-muted uppercase">
                      Pembahasan
                    </TableHead>
                    {showOther && (
                      <TableHead className="h-12 text-right text-xs font-black tracking-wide text-sr-muted uppercase">
                        Lainnya
                      </TableHead>
                    )}
                    <TableHead className="h-12 px-5 text-right text-xs font-black tracking-wide text-sr-blue-700 uppercase">
                      Total Revenue
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeMonths.map((row) => (
                    <TableRow
                      key={row.month}
                      className="border-sr-line transition-all duration-200 hover:bg-sr-blue-50/50 hover:shadow-sr-1"
                    >
                      <TableCell className="px-5 font-black text-sr-ink">{formatMonthLabel(row.month)}</TableCell>
                      <TableCell className="text-right font-semibold text-sr-ink-2">
                        {row.signups.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-sr-ink-2">
                        {row.totalUsers.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-sr-ink-2">
                        {row.premiumCustomers.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-right text-sr-ink-2">{idr.format(row.revenuePremium)}</TableCell>
                      <TableCell className="text-right text-sr-ink-2">{idr.format(row.revenueTo10k)}</TableCell>
                      <TableCell className="text-right text-sr-ink-2">{idr.format(row.revenueTo5k)}</TableCell>
                      {showOther && (
                        <TableCell className="text-right text-sr-ink-2">{idr.format(row.revenueOther)}</TableCell>
                      )}
                      <TableCell className="px-5 text-right font-black text-sr-blue-700">
                        {idr.format(row.revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                {totals && (
                  <TableFooter>
                    <TableRow className="border-sr-blue-200 bg-linear-to-r from-sr-blue-100 to-sr-sun-100 font-black text-sr-ink">
                      <TableCell className="px-5">Total</TableCell>
                      <TableCell className="text-right">{totals.signups.toLocaleString("id-ID")}</TableCell>
                      <TableCell className="text-right">
                        {lastRow ? lastRow.totalUsers.toLocaleString("id-ID") : "—"}
                      </TableCell>
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
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

export function SectionTitle({
  title,
  description,
  tone = "blue",
  children,
}: {
  title: string;
  description?: string;
  tone?: "blue" | "sun" | "live" | "orange";
  children?: React.ReactNode;
}) {
  const bar = { blue: "bg-sr-blue-500", sun: "bg-sr-sun-500", live: "bg-sr-live", orange: "bg-sr-orange-500" }[tone];
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className={`h-7 w-1.5 rounded-full ${bar}`} />
        <div>
          <h2 className="text-lg font-black tracking-tight text-sr-ink">{title}</h2>
          {description && <p className="text-xs text-sr-muted sm:text-sm">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

/** Angka kunci di bagian paling atas: satu tempat untuk akun, aktivitas, premium, dan pemasukan 30 hari. */
export function SummarySection() {
  const overviewQuery = useQuery(orpc.admin.statistics.businessOverview.queryOptions());
  const overview = overviewQuery.data;
  const pending = overviewQuery.isPending;

  return (
    <section>
      <SectionTitle title="Ringkasan" description="Kondisi bisnis saat ini dan 30 hari terakhir" tone="blue" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Pemasukan 30 Hari"
          value={overview ? idr.format(overview.revenue.last30Days) : undefined}
          hint={overview ? `Total sejak awal ${idr.format(overview.revenue.total)}` : undefined}
          isPending={pending}
        />
        <KpiCard
          title="Signup 30 Hari"
          value={overview?.accounts.newLast30Days}
          hint={overview ? `${overview.accounts.newLast7Days.toLocaleString()} dalam 7 hari terakhir` : undefined}
          isPending={pending}
        />
        <KpiCard
          title="Premium Aktif"
          value={overview?.premium.active}
          hint={
            overview ? `${overview.premium.expiringNext30Days.toLocaleString()} kedaluwarsa dalam 30 hari` : undefined
          }
          isPending={pending}
        />
        <KpiCard
          title="Pengguna Aktif Bulanan"
          value={overview?.activity.mau}
          hint={
            overview
              ? `Harian ${overview.activity.dau.toLocaleString()} · Mingguan ${overview.activity.wau.toLocaleString()}`
              : undefined
          }
          isPending={pending}
        />
        <KpiCard
          title="Total Akun"
          value={overview?.accounts.total}
          hint={overview ? `${overview.accounts.verified.toLocaleString()} sudah terverifikasi` : undefined}
          isPending={pending}
        />
        <KpiCard
          title="Konversi ke Berbayar"
          value={overview ? formatPercent(overview.premium.conversionRate) : undefined}
          hint={overview ? `${overview.premium.payingUsers.toLocaleString()} pengguna pernah membayar` : undefined}
          isPending={pending}
        />
        <KpiCard
          title="Churn Premium"
          value={overview ? formatPercent(overview.premium.churnRate) : undefined}
          hint={overview ? `${overview.premium.expired.toLocaleString()} premium sudah kedaluwarsa` : undefined}
          isPending={pending}
        />
        <KpiCard
          title="Tidak Aktif 30 Hari"
          value={overview?.activity.inactiveLast30Days}
          hint="Akun tanpa sesi dalam 30 hari"
          isPending={pending}
        />
      </div>
    </section>
  );
}

const DAILY_CHART_MARGIN = { top: 12, right: 8, left: -18, bottom: 0 };

/** Tren harian. Jumlah kecil per hari (0, 1, 2) lebih jujur ditampilkan sebagai batang daripada kurva mulus. */
export function TrendSection() {
  const [rangeDays, setRangeDays] = useState<number>(30);
  const seriesQuery = useQuery(orpc.admin.statistics.timeSeries.queryOptions({ input: { days: rangeDays } }));
  const series = seriesQuery.data;

  return (
    <section>
      <SectionTitle title="Tren Harian" description={`${rangeDays} hari terakhir`} tone="live">
        <div className="flex gap-1" role="group" aria-label="Rentang waktu">
          {RANGE_OPTIONS.map((days) => (
            <Button
              key={days}
              size="sm"
              variant={rangeDays === days ? "default" : "outline"}
              aria-pressed={rangeDays === days}
              onClick={() => setRangeDays(days)}
            >
              {days} hari
            </Button>
          ))}
        </div>
      </SectionTitle>
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Pemasukan" description="Pembayaran sukses per hari (IDR)" isPending={seriesQuery.isPending}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={series?.revenue ?? []} margin={{ ...DAILY_CHART_MARGIN, left: 4 }}>
              <SunriseChartDefs />
              <CartesianGrid vertical={false} stroke="#dfe9ff" strokeDasharray="4 4" />
              <XAxis dataKey="date" tickFormatter={formatDateLabel} fontSize={12} minTickGap={24} />
              <YAxis tickFormatter={(v: number) => compactNumber.format(v)} fontSize={12} width={56} />
              <Tooltip
                content={<SunriseTooltip />}
                labelFormatter={formatDateLabel}
                formatter={(v) => idr.format(Number(v))}
              />
              <Bar
                isAnimationActive
                animationDuration={1300}
                animationEasing="ease-out"
                dataKey="value"
                name="Pemasukan"
                fill="url(#srBlueChart)"
                radius={[8, 8, 2, 2]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Pembelian Premium"
          description="Transaksi paket premium sukses per hari"
          isPending={seriesQuery.isPending}
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={series?.premiumPurchases ?? []} margin={DAILY_CHART_MARGIN}>
              <SunriseChartDefs />
              <CartesianGrid vertical={false} stroke="#dfe9ff" strokeDasharray="4 4" />
              <XAxis dataKey="date" tickFormatter={formatDateLabel} fontSize={12} minTickGap={24} />
              <YAxis allowDecimals={false} fontSize={12} width={40} />
              <Tooltip content={<SunriseTooltip />} labelFormatter={formatDateLabel} />
              <Bar
                isAnimationActive
                animationDuration={1300}
                animationEasing="ease-out"
                dataKey="value"
                name="Pembelian"
                fill="url(#srSunChart)"
                radius={[8, 8, 2, 2]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Signup Baru" description="Akun baru per hari" isPending={seriesQuery.isPending}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={series?.signups ?? []} margin={DAILY_CHART_MARGIN}>
              <SunriseChartDefs />
              <CartesianGrid vertical={false} stroke="#dfe9ff" strokeDasharray="4 4" />
              <XAxis dataKey="date" tickFormatter={formatDateLabel} fontSize={12} minTickGap={24} />
              <YAxis allowDecimals={false} fontSize={12} width={40} />
              <Tooltip content={<SunriseTooltip />} labelFormatter={formatDateLabel} />
              <Bar
                isAnimationActive
                animationDuration={1300}
                animationEasing="ease-out"
                dataKey="value"
                name="Signup"
                fill="url(#srBlueChart)"
                radius={[8, 8, 2, 2]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Pengguna Aktif"
          description="Pengguna unik dengan sesi baru per hari"
          isPending={seriesQuery.isPending}
        >
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={series?.activeUsers ?? []} margin={DAILY_CHART_MARGIN}>
              <SunriseChartDefs />
              <CartesianGrid vertical={false} stroke="#dfe9ff" strokeDasharray="4 4" />
              <XAxis dataKey="date" tickFormatter={formatDateLabel} fontSize={12} minTickGap={24} />
              <YAxis allowDecimals={false} fontSize={12} width={40} />
              <Tooltip content={<SunriseTooltip />} labelFormatter={formatDateLabel} />
              <Line
                isAnimationActive
                animationDuration={1300}
                animationEasing="ease-out"
                type="linear"
                dataKey="value"
                name="Pengguna aktif"
                stroke="#f08a4b"
                dot={{ r: 2.5, strokeWidth: 0, fill: "#f08a4b" }}
                strokeWidth={2.5}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </section>
  );
}

/** Status transaksi + minat calon siswa; keduanya membantu membaca pasar, jadi digabung satu baris. */
export function AudienceSection() {
  const overviewQuery = useQuery(orpc.admin.statistics.businessOverview.queryOptions());
  const audienceQuery = useQuery(orpc.admin.statistics.audienceInsights.queryOptions());
  const overview = overviewQuery.data;
  const audience = audienceQuery.data;

  return (
    <section>
      <SectionTitle title="Transaksi & Audiens" description="Status pembayaran dan minat calon siswa" tone="orange" />
      <div className="grid gap-4 lg:grid-cols-3">
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
        <RankedListCard
          title="Kampus Impian Teratas"
          description="Target pasar dan arah konten"
          rows={audience?.topDreamCampuses}
          isPending={audienceQuery.isPending}
          tone="blue"
        />
        <RankedListCard
          title="Jurusan Impian Teratas"
          description="Arah pengembangan materi"
          rows={audience?.topDreamMajors}
          isPending={audienceQuery.isPending}
          tone="orange"
        />
      </div>
    </section>
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
    <Card className="sr-lift overflow-hidden rounded-sr-lg border-sr-line shadow-sr-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-sr-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-sr-muted">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-2xl font-bold">
            {typeof value === "number" ? value.toLocaleString() : (value ?? "ΓÇö")}
          </div>
        )}
        {hint && !isPending && <p className="mt-1 text-xs text-sr-muted">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function ChartCard({
  title,
  description,
  isPending,
  children,
  className,
}: {
  title: string;
  description: string;
  isPending: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "sr-lift rounded-sr-lg border-sr-line shadow-sr-1 transition-shadow duration-300 hover:shadow-sr-2",
        className,
      )}
    >
      <CardHeader className="border-b border-sr-line bg-sr-ivory/60">
        <CardTitle className="text-base font-black text-sr-ink">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-5 sm:p-6">
        {isPending ? <Skeleton className="h-[300px] w-full rounded-sr-md" /> : children}
      </CardContent>
    </Card>
  );
}

function SunriseTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-sr-sm border border-white/70 bg-sr-ink/95 px-3 py-2 text-xs text-white shadow-sr-3 backdrop-blur">
      <p className="mb-1 font-bold text-sr-sun-200">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.name}: <strong>{entry.value?.toLocaleString?.("id-ID") ?? entry.value}</strong>
        </p>
      ))}
    </div>
  );
}

function DonutChart({ data, emptyMessage }: { data: { name: string; value: number }[]; emptyMessage: string }) {
  if (data.length === 0 || data.every((d) => d.value === 0)) {
    return <div className="flex h-[260px] items-center justify-center text-sm text-sr-muted">{emptyMessage}</div>;
  }

  return (
    <div className="relative h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={62}
            outerRadius={94}
            paddingAngle={3}
            stroke="#fff"
            strokeWidth={3}
            filter="url(#srDonutShadow)"
            isAnimationActive
            animationDuration={1200}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center pb-8 text-center">
        <div>
          <p className="text-3xl font-black text-sr-ink">
            {data.reduce((sum, item) => sum + item.value, 0).toLocaleString("id-ID")}
          </p>
          <p className="text-[11px] font-bold tracking-wide text-sr-muted uppercase">Total</p>
        </div>
      </div>
    </div>
  );
}

function RankedListCard({
  title,
  description,
  rows,
  isPending,
  tone,
}: {
  title: string;
  description: string;
  rows: { name: string; count: number }[] | undefined;
  isPending: boolean;
  tone: "blue" | "orange";
}) {
  const max = rows?.[0]?.count ?? 0;

  return (
    <Card
      className={`sr-lift overflow-hidden rounded-sr-lg border-transparent shadow-sr-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-sr-3 ${
        tone === "blue"
          ? "bg-linear-to-br from-white via-sr-blue-50 to-sr-blue-100 text-sr-ink"
          : "bg-linear-to-br from-sr-orange-100 via-white to-sr-sun-100 text-sr-ink"
      }`}
    >
      <CardHeader
        className={
          tone === "blue"
            ? "border-b border-sr-blue-200/70 bg-white/45"
            : "border-b border-sr-orange-200/60 bg-white/25"
        }
      >
        <CardTitle className="text-base font-black text-sr-ink">{title}</CardTitle>
        <CardDescription className="text-sr-ink-2/75">{description}</CardDescription>
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
          <div className="flex h-40 items-center justify-center text-sm text-sr-muted">Belum ada data</div>
        ) : (
          <div className="space-y-2">
            {rows.map((row, index) => (
              <div
                key={row.name}
                className={`group flex items-center gap-3 rounded-sr-sm px-2 py-2 transition-all duration-200 ${
                  tone === "blue" ? "hover:bg-white/75 hover:shadow-sr-1" : "hover:bg-white/65 hover:shadow-sr-1"
                }`}
              >
                <Badge
                  variant="outline"
                  className={`w-8 justify-center ${tone === "blue" ? "border-sr-blue-200 bg-white/70 text-sr-blue-600" : "border-sr-orange-300 bg-white/60 text-sr-orange-700"}`}
                >
                  {index + 1}
                </Badge>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate font-bold text-sr-ink">{row.name}</span>
                    <span className="ml-2 shrink-0 font-bold text-sr-ink-2/75">{row.count.toLocaleString()}</span>
                  </div>
                  <div className={`mt-1 h-2 rounded-full ${tone === "blue" ? "bg-sr-blue-100" : "bg-white/60"}`}>
                    <div
                      className={`h-full rounded-full transition-[width] duration-700 ${tone === "blue" ? "bg-(image:--sr-grad-blue) shadow-[0_2px_8px_#2356e866]" : "bg-sr-orange-500"}`}
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
