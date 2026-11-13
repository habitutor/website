import { Package, Question, SparkleIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AdminContainer } from "@/components/admin/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/utils/orpc";
import {
  AudienceSection,
  MonthlyReport,
  SectionTitle,
  SummarySection,
  TrendSection,
} from "./-components/business-analytics";
import { FreemiumSalesCard } from "./-components/freemium-sales-card";
import { PremiumPackageSalesCard } from "./-components/premium-package-sales-card";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <AdminContainer>
      <div className="relative mb-8 overflow-hidden rounded-sr-xl sr-card-blue p-5 shadow-sr-2 transition-shadow duration-300 hover:shadow-sr-3 sm:p-7">
        <div className="pointer-events-none absolute -top-20 -right-12 size-56 rounded-full bg-white/10" />
        <div className="relative flex items-start gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-sr-md bg-white/15 text-sr-sun-400 ring-1 ring-white/20">
            <SparkleIcon weight="fill" className="size-6" />
          </span>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Admin Dashboard</h1>
            <p className="mt-1 text-sm leading-relaxed text-white/80">
              Selamat datang di panel admin Habitutor. Mulai dari ringkasan di atas, lanjut ke tren, penjualan, dan
              laporan bulanan di bawah.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        <SummarySection />
        <TrendSection />

        <section>
          <SectionTitle title="Penjualan Produk" description="Jumlah terjual per paket dan Try Out" tone="sun" />
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            <PremiumPackageSalesCard />
            <FreemiumSalesCard />
          </div>
        </section>

        <AudienceSection />

        <section>
          <SectionTitle title="Konten Belajar" description="Isi bank soal yang tersedia untuk siswa" tone="blue" />
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            <StatsCard
              title="Practice Packs"
              statKey="totalPracticePacks"
              icon={Package}
              className="sr-lift border-sr-line bg-linear-to-br from-sr-sun-100 to-white"
              iconClassName="text-sr-amber-700"
            />
            <StatsCard
              title="Total Soal"
              statKey="totalQuestions"
              icon={Question}
              className="sr-lift border-sr-line bg-linear-to-br from-sr-orange-100 to-white"
              iconClassName="text-sr-orange-700"
            />
          </div>
        </section>

        <MonthlyReport />
      </div>
    </AdminContainer>
  );
}

function StatsCard({
  title,
  statKey,
  icon: Icon,
  className,
  iconClassName,
}: {
  title: string;
  statKey: "totalPracticePacks" | "totalQuestions";
  icon: React.ElementType;
  className?: string;
  iconClassName?: string;
}) {
  const { data: stats, isPending } = useQuery(orpc.admin.statistics.stats.queryOptions());
  const value = stats?.[statKey];

  return (
    <Card
      className={`overflow-hidden rounded-sr-lg border-sr-line shadow-sr-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-sr-2 ${className}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-bold text-sr-muted">{title}</CardTitle>
        <Icon className={`size-4 ${iconClassName}`} weight="bold" />
      </CardHeader>
      <CardContent>
        {isPending ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-black text-sr-ink sm:text-3xl">{value?.toLocaleString() || 0}</div>
        )}
      </CardContent>
    </Card>
  );
}
