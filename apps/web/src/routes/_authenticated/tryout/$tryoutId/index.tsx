import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  ExamIcon,
  LightbulbFilamentIcon,
  ListChecksIcon,
  ListNumbersIcon,
  SparkleIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import type React from "react";
import { toast } from "sonner";
import { BackButton } from "@/components/navigation/back-button";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { createMeta } from "@/lib/seo-utils";
import { orpc } from "@/utils/orpc";
import { TryoutDetailGate, getApiErrorMessage, useFreemiumStatus } from "../-components/freemium-access";

export const Route = createFileRoute("/_authenticated/tryout/$tryoutId/")({
  head: () => ({
    meta: createMeta({
      title: "Detail Try Out",
      description: "Petunjuk pengerjaan dan daftar subtes Try Out",
      noIndex: true,
    }),
  }),
  component: TryoutDetailPage,
});

function TryoutDetailPage() {
  const navigate = useNavigate();
  const { tryoutId } = Route.useParams();
  const { session } = Route.useRouteContext();
  const isPremium = session?.user.isPremium ?? false;
  const freemiumStatus = useFreemiumStatus(tryoutId);
  const isAccessGated = freemiumStatus.data?.gateEnabled === true && freemiumStatus.data.canStartTryout === false;
  const isCheckingAccess = freemiumStatus.isPending;

  const subtesQuery = useQuery(orpc.tryout.listSubtes.queryOptions({ input: { tryoutId } }));

  const startMutation = useMutation(
    orpc.tryout.start.mutationOptions({
      onSuccess: (data) => {
        toast.success("Try Out dimulai!");
        if (data.sesiSubtesId && data.sesiId) {
          navigate({
            to: "/tryout/test",
            search: {
              sesiSubtesId: data.sesiSubtesId,
              sesiId: data.sesiId,
              tryoutSessionId: undefined,
            },
          });
        }
      },
      onError: (err) => {
        toast.error("Gagal memulai Try Out", {
          description: () => <p>{getApiErrorMessage(err)}</p>,
        });
      },
    }),
  );

  const subtests = subtesQuery.data ?? [];
  const totalSoal = subtests.reduce((sum, item) => sum + (Number(item.jumlahSoal) || 0), 0);
  const totalMenit = subtests.reduce((sum, item) => sum + (Number(item.durasiMenit) || 0), 0);
  const startDisabled = startMutation.isPending || isCheckingAccess;
  const startLabel = startMutation.isPending ? "Memulai..." : "Mulai Try Out";

  return (
    <div className="flex w-full flex-col gap-6">
      <BackButton to="/tryout" className="w-fit" />

      {isAccessGated && freemiumStatus.data && <TryoutDetailGate tryoutId={tryoutId} status={freemiumStatus.data} />}

      {!isAccessGated && (
        <div className="relative overflow-hidden rounded-sr-xl sr-card-blue px-5 pt-6 pb-40 sm:px-8 sm:py-9 sm:pr-72 lg:px-10 lg:pr-96">
          <div className="pointer-events-none absolute -top-24 -right-20 size-72 rounded-full bg-white/8" />
          <span className="relative inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/20">
            <ExamIcon weight="fill" className="size-4 text-sr-sun-400" /> Siap ujian?
          </span>
          <h1 className="relative mt-3 text-[26px] leading-tight font-extrabold text-balance text-white sm:text-3xl lg:text-4xl">
            Mulai Try Out sekarang
          </h1>
          <p className="relative mt-2.5 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">
            Baca petunjuknya sebentar, siapkan diri, lalu kerjakan dengan tenang. Semangat!
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="sr-sheen relative mt-5 rounded-full"
            onClick={() => startMutation.mutate({ tryoutId })}
            disabled={startDisabled}
          >
            {startLabel} <ArrowRightIcon weight="bold" />
          </Button>
          <motion.img
            src="/avatar/subtest/tka.webp"
            alt=""
            className="pointer-events-none absolute right-1/2 bottom-0 h-36 w-auto translate-x-1/2 select-none sm:right-10 sm:h-48 sm:translate-x-0 lg:right-16 lg:h-56"
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
          />
        </div>
      )}

      {!subtesQuery.isPending && subtests.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <SummaryStat icon={<BookOpenIcon weight="fill" />} value={subtests.length} label="Subtes" />
          <SummaryStat icon={<ListNumbersIcon weight="fill" />} value={totalSoal} label="Soal" />
          <SummaryStat icon={<ClockIcon weight="fill" />} value={totalMenit} label="Menit" />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-sr-xl border border-sr-line bg-white p-5 shadow-sr-1 md:p-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-sr-sm bg-sr-blue-50 text-sr-blue-600">
              <ListChecksIcon weight="fill" className="size-5" />
            </span>
            <h2 className="text-lg font-extrabold text-sr-ink">Aturan pengerjaan</h2>
          </div>
          <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-sr-ink-2">
            {RULES.map((rule) => (
              <li key={rule} className="flex gap-2.5">
                <CheckCircleIcon weight="fill" className="mt-0.5 size-4 shrink-0 text-sr-blue-500" />
                {rule}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-2.5 rounded-sr-md border border-sr-orange-200 bg-sr-orange-100 p-3 text-sm text-sr-orange-700">
            <WarningCircleIcon weight="fill" className="mt-0.5 size-4 shrink-0" />
            <p>
              Timer <strong>tetap berjalan</strong> walau kamu keluar dari halaman atau menutup aplikasi.
            </p>
          </div>
        </section>

        <section className="rounded-sr-xl border border-sr-sun-200 bg-linear-to-br from-sr-cream via-white to-sr-sun-100 p-5 shadow-sr-1 md:p-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-sr-sm bg-sr-sun-500 text-sr-ink">
              <LightbulbFilamentIcon weight="fill" className="size-5" />
            </span>
            <h2 className="text-lg font-extrabold text-sr-ink">Tips biar lancar</h2>
          </div>
          <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-sr-ink-2">
            {TIPS.map((tip) => (
              <li key={tip} className="flex gap-2.5">
                <SparkleIcon weight="fill" className="mt-0.5 size-4 shrink-0 text-sr-amber" />
                {tip}
              </li>
            ))}
          </ul>
          {!isPremium && (
            <Link
              to="/premium"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-sr-blue-600 hover:underline"
            >
              Mau pembahasan lengkap? Lihat Try Out Premium <ArrowUpRightIcon weight="bold" className="size-4" />
            </Link>
          )}
        </section>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-extrabold text-sr-ink sm:text-xl">Urutan subtes</h2>
        <div className="overflow-hidden rounded-sr-xl border border-sr-line bg-white shadow-sr-1">
          {subtesQuery.isPending ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i.toString()} className="h-12 w-full" />
              ))}
            </div>
          ) : subtests.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-sr-muted">Belum ada subtes untuk try out ini.</p>
          ) : (
            <ol className="divide-y divide-sr-line">
              {subtests.map((item, index) => (
                <li key={item.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-sr-sm bg-sr-blue-50 text-sm font-extrabold text-sr-blue-600">
                    {index + 1}
                  </span>
                  <p className="min-w-0 flex-1 font-bold text-sr-ink">{item.namaSubtes}</p>
                  <div className="flex shrink-0 flex-col items-end gap-1 text-xs font-semibold text-sr-ink-2 sm:flex-row sm:gap-2">
                    <span className="rounded-full bg-sr-blue-50 px-2.5 py-1">{item.jumlahSoal} soal</span>
                    <span className="rounded-full bg-sr-sun-100 px-2.5 py-1 text-sr-amber-700">
                      {item.durasiMenit} menit
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      {!isAccessGated && (
        <div className="flex flex-col items-start gap-4 rounded-sr-xl border border-sr-line bg-white p-5 shadow-sr-1 sm:flex-row sm:items-center sm:justify-between md:p-6">
          <div>
            <p className="text-lg font-extrabold text-sr-ink">Sudah siap? Yuk mulai!</p>
            <p className="text-sm text-sr-muted">Kerjakan dengan tenang, kamu pasti bisa.</p>
          </div>
          <Button
            size="lg"
            className="sr-sheen w-full rounded-full sm:w-auto"
            onClick={() => startMutation.mutate({ tryoutId })}
            disabled={startDisabled}
          >
            {startLabel} <ArrowRightIcon weight="bold" />
          </Button>
        </div>
      )}
    </div>
  );
}

const RULES = [
  "Setiap subtes hanya bisa dikerjakan 1 kali.",
  "Kalau waktu habis atau kamu klik Selesai, subtes tidak bisa diulang.",
  "Pembahasan terbuka setelah semua subtes selesai.",
];

const TIPS = [
  "Pastikan internet dan baterai aman sebelum mulai.",
  "Tandai soal yang ragu, lalu kerjakan lagi di akhir.",
  "Atur waktu, jangan terlalu lama di satu soal.",
];

function SummaryStat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-sr-xl border border-sr-line bg-white px-2 py-3 text-center shadow-sr-1 sm:flex-row sm:gap-3 sm:px-4 sm:text-left [&_svg]:size-5 [&_svg]:text-sr-blue-600">
      <span className="flex size-10 items-center justify-center rounded-full bg-sr-blue-50">{icon}</span>
      <div className="mt-1 sm:mt-0">
        <p className="text-xl leading-none font-extrabold text-sr-ink sm:text-2xl">{value}</p>
        <p className="text-xs font-semibold text-sr-muted">{label}</p>
      </div>
    </div>
  );
}
