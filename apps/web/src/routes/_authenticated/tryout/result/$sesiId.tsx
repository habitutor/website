import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CaretDownIcon,
  CheckCircleIcon,
  ClockIcon,
  ListNumbersIcon,
  NotebookIcon,
  TrophyIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { motion } from "motion/react";
import { useState } from "react";
import { BackButton } from "@/components/navigation/back-button";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { createMeta } from "@/lib/seo-utils";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";
import { PembahasanPaywall } from "../-components/freemium-access";

export const Route = createFileRoute("/_authenticated/tryout/result/$sesiId")({
  head: () => ({
    meta: createMeta({
      title: "Hasil Try Out",
      description: "Lihat hasil dan pembahasan Try Out kamu",
      noIndex: true,
    }),
  }),
  component: TryoutResultPage,
});

function TryoutResultPage() {
  const { sesiId } = Route.useParams();
  const [selectedSesiSubtesId, setSelectedSesiSubtesId] = useState<string | null>(null);
  const [selectedSubtestName, setSelectedSubtestName] = useState<string>("");

  const { data: result, isPending } = useQuery(orpc.tryout.results.queryOptions({ input: { sesiId } }));

  const questionsQuery = useQuery({
    ...orpc.tryout.questions.queryOptions({
      input: { sesiSubtesId: selectedSesiSubtesId || "" },
    }),
    enabled: !!selectedSesiSubtesId,
  });

  if (isPending) {
    return (
      <div className="flex w-full flex-col gap-6">
        <Skeleton className="h-56 w-full rounded-sr-xl" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-24 w-full rounded-sr-xl" />
          <Skeleton className="h-24 w-full rounded-sr-xl" />
          <Skeleton className="h-24 w-full rounded-sr-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-sr-xl" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-sr-xl border border-dashed border-sr-line-2 bg-white/80 px-6 py-12 text-center">
        <img src="/avatar/confused-avatar.webp" alt="" className="h-32 w-auto" />
        <p className="text-lg font-extrabold text-sr-ink">Hasil tidak ditemukan</p>
        <Button asChild className="mt-2 rounded-full">
          <Link to="/tryout">Kembali ke Daftar Try Out</Link>
        </Button>
      </div>
    );
  }

  const totalDurasi = result.skorPerSubtes.reduce((sum, s) => sum + s.durasiMenit, 0);
  const bestSubtes = result.skorPerSubtes.reduce<(typeof result.skorPerSubtes)[number] | null>(
    (best, item) => (!best || item.skor > best.skor ? item : best),
    null,
  );

  // === TAMPILAN DETAIL SUBTES (DAFTAR SOAL & PEMBAHASAN) ===
  if (selectedSesiSubtesId) {
    return (
      <div className="flex w-full flex-col gap-6 pb-20">
        <div className="relative overflow-hidden rounded-sr-xl sr-card-blue px-5 py-6 sm:px-8 sm:py-8 sm:pr-64">
          <div className="pointer-events-none absolute -top-24 -right-20 size-72 rounded-full bg-white/8" />
          <Button
            variant="white"
            size="sm"
            className="relative rounded-full"
            onClick={() => {
              setSelectedSesiSubtesId(null);
              setSelectedSubtestName("");
            }}
          >
            <ArrowLeftIcon weight="bold" /> Kembali ke ringkasan
          </Button>
          <p className="relative mt-4 text-sm font-semibold text-white/80">Review hasil try out</p>
          <h1 className="relative mt-1 text-2xl leading-tight font-extrabold text-white sm:text-3xl">
            {selectedSubtestName}
          </h1>
          <img
            src="/avatar/subtest/pu.webp"
            alt=""
            className="pointer-events-none absolute right-10 bottom-0 hidden h-40 w-auto select-none sm:block"
          />
        </div>

        {!result.aksesPembahasan ? (
          <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-sr-xl border border-sr-line bg-white py-20 text-center shadow-sr-1">
            {/* Soal diburamkan sebagai cuplikan di belakang ajakan membuka pembahasan. */}
            <div className="absolute inset-0 flex flex-col gap-4 p-6 opacity-30 blur-[4px] grayscale select-none">
              <div className="h-20 w-full rounded-sr-md bg-sr-line-2" />
              <div className="h-20 w-full rounded-sr-md bg-sr-line-2" />
              <div className="h-20 w-full rounded-sr-md bg-sr-line-2" />
            </div>
            <PembahasanPaywall
              tryoutId={result.tryoutId}
              paid={result.freemium.paid}
              hasUnusedCredit={result.freemium.hasUnusedCredit}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {questionsQuery.isPending ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i.toString()} className="h-20 w-full rounded-sr-xl" />
              ))
            ) : questionsQuery.isError ? (
              <div className="rounded-sr-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                Gagal memuat soal: {questionsQuery.error.message}
              </div>
            ) : questionsQuery.data?.soal && questionsQuery.data.soal.length > 0 ? (
              questionsQuery.data.soal.map((q, idx) => <QuestionReviewItem key={q.sesiSoalId} q={q} index={idx} />)
            ) : (
              <div className="py-8 text-center text-sm text-sr-muted">Tidak ada soal untuk subtes ini.</div>
            )}
          </div>
        )}
      </div>
    );
  }

  // === TAMPILAN UTAMA (RINGKASAN & DAFTAR SUBTES) ===
  return (
    <div className="flex w-full flex-col gap-6 pb-12">
      <BackButton to="/tryout" className="w-fit" />

      <div className="relative overflow-hidden rounded-sr-xl sr-card-blue px-5 pt-6 pb-40 sm:px-8 sm:py-9 sm:pr-72 lg:px-10 lg:pr-96">
        <div className="pointer-events-none absolute -top-24 -right-20 size-72 rounded-full bg-white/8" />
        <span className="relative inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/20">
          <TrophyIcon weight="fill" className="size-4 text-sr-sun-400" /> Hasil try out
        </span>
        <h1 className="relative mt-3 text-2xl leading-tight font-extrabold text-balance text-white sm:text-3xl">
          {result.judulTryout || "Hasil Try Out"}
        </h1>
        <p className="relative mt-2 text-sm text-white/80">Kerja bagus sudah menyelesaikannya! Ini skor kamu:</p>
        <p className="relative mt-3 flex items-baseline gap-2">
          <span className="text-6xl leading-none font-extrabold text-sr-sun-400 tabular-nums">{result.totalSkor}</span>
          <span className="text-sm font-bold text-white/80">total skor</span>
        </p>
        <motion.img
          src="/avatar/testimone-avatar.webp"
          alt=""
          className="pointer-events-none absolute right-1/2 bottom-0 h-36 w-auto translate-x-1/2 select-none sm:right-10 sm:h-48 sm:translate-x-0 lg:right-16 lg:h-56"
          initial={{ y: 40 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <ResultStat icon={<ListNumbersIcon weight="fill" />} value={result.skorPerSubtes.length} label="Subtes" />
        <ResultStat icon={<ClockIcon weight="fill" />} value={totalDurasi} label="Menit" />
        <ResultStat
          icon={<TrophyIcon weight="fill" />}
          value={bestSubtes?.skor ?? 0}
          label={bestSubtes ? `Terbaik: ${bestSubtes.namaSubtes}` : "Skor terbaik"}
        />
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-extrabold text-sr-ink sm:text-xl">Skor per subtes</h2>
          <p className="text-sm text-sr-muted">
            Ketuk salah satu subtes untuk melihat soal, jawabanmu, dan pembahasan.
          </p>
        </div>
        <div className="overflow-hidden rounded-sr-xl border border-sr-line bg-white shadow-sr-1">
          <ol className="divide-y divide-sr-line">
            {result.skorPerSubtes.map((subtes, idx) => (
              <li key={subtes.subtesId}>
                <button
                  type="button"
                  disabled={!subtes.sesiSubtesId}
                  onClick={() => {
                    if (subtes.sesiSubtesId) {
                      setSelectedSesiSubtesId(subtes.sesiSubtesId);
                      setSelectedSubtestName(subtes.namaSubtes);
                    }
                  }}
                  className="group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-sr-ivory disabled:cursor-default sm:px-5"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-sr-sm bg-sr-blue-50 text-sm font-extrabold text-sr-blue-600">
                    {idx + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-sr-ink">{subtes.namaSubtes}</span>
                    <span className="block text-xs text-sr-muted">{subtes.durasiMenit} menit</span>
                  </span>
                  <span className="rounded-full bg-sr-sun-100 px-3 py-1 text-sm font-extrabold text-sr-amber-700 tabular-nums">
                    {subtes.skor}
                  </span>
                  {subtes.sesiSubtesId && (
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sr-blue-500 text-white transition-transform group-hover:translate-x-0.5">
                      <ArrowRightIcon weight="bold" className="size-4" />
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="flex flex-col gap-3 rounded-sr-xl border border-sr-sun-200 bg-linear-to-br from-sr-cream via-white to-sr-sun-100 p-5 shadow-sr-1 sm:flex-row sm:items-center sm:justify-between md:p-6">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-sr-sm bg-sr-sun-500 text-sr-ink">
            <NotebookIcon weight="fill" className="size-5" />
          </span>
          <div>
            <p className="font-extrabold text-sr-ink">Langkah berikutnya</p>
            <p className="text-sm text-sr-muted">Pelajari pembahasannya, lalu perkuat materi yang masih lemah.</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="rounded-full" asChild>
            <Link to="/tryout">Daftar Try Out</Link>
          </Button>
          <Button className="rounded-full" asChild>
            <Link to="/classes">
              Belajar di Kelas <ArrowRightIcon weight="bold" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function ResultStat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex min-w-0 flex-col items-center rounded-sr-xl border border-sr-line bg-white px-2 py-3 text-center shadow-sr-1 sm:flex-row sm:gap-3 sm:px-4 sm:text-left [&_svg]:size-5 [&_svg]:text-sr-blue-600">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sr-blue-50">{icon}</span>
      <div className="mt-1 min-w-0 sm:mt-0">
        <p className="text-xl leading-none font-extrabold text-sr-ink tabular-nums sm:text-2xl">{value}</p>
        <p className="line-clamp-2 text-xs font-semibold text-sr-muted">{label}</p>
      </div>
    </div>
  );
}

// === KOMPONEN ITEM SOAL MANDIRI ===
// Mengambil pembahasannya sendiri, sehingga bisa menentukan warna hijau/merah pada header
interface QuestionReviewItemProps {
  q: {
    sesiSoalId: string;
    soalId: string;
    pertanyaan: string;
    jawaban_dipilih: string | null;
  };
  index: number;
}

function QuestionReviewItem({ q, index }: QuestionReviewItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    data: pembahasan,
    isPending,
    isError,
  } = useQuery({
    ...orpc.tryout.pembahasan.queryOptions({ input: { soalId: q.soalId } }),
  });

  if (isPending) {
    return <Skeleton className="h-20 w-full rounded-sr-xl" />;
  }

  if (isError || !pembahasan) {
    return (
      <div className="rounded-sr-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        Gagal memuat detail soal.
      </div>
    );
  }

  // Menentukan mana kunci jawaban, lalu dicocokkan dengan yang dijawab user
  const correctOption = pembahasan.pilihan.find((opt) => opt.isBenar);
  const isCorrect = q.jawaban_dipilih === correctOption?.id;

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-sr-xl border bg-white shadow-sr-1",
        isCorrect ? "border-emerald-200" : "border-rose-200",
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={cn(
          "flex w-full items-center gap-3 p-4 text-left transition-colors md:p-5",
          isCorrect ? "bg-emerald-50 hover:bg-emerald-100/70" : "bg-rose-50 hover:bg-rose-100/70",
        )}
      >
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-sr-xs text-sm font-extrabold text-white",
            isCorrect ? "bg-emerald-600" : "bg-rose-600",
          )}
        >
          {index + 1}
        </span>
        <span className="line-clamp-2 min-w-0 flex-1 text-sm leading-relaxed font-semibold text-sr-ink md:text-base">
          {q.pertanyaan}
        </span>
        <span
          className={cn(
            "hidden shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold sm:inline-flex",
            isCorrect ? "bg-emerald-600 text-white" : "bg-rose-600 text-white",
          )}
        >
          {isCorrect ? (
            <CheckCircleIcon weight="fill" className="size-3.5" />
          ) : (
            <XCircleIcon weight="fill" className="size-3.5" />
          )}
          {isCorrect ? "Benar" : q.jawaban_dipilih ? "Salah" : "Kosong"}
        </span>
        <CaretDownIcon
          weight="bold"
          className={cn("size-4 shrink-0 text-sr-ink-2 transition-transform", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <div className="border-t border-sr-line bg-white p-4 md:p-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <p className="text-base leading-relaxed font-medium whitespace-pre-wrap text-sr-ink">
                {pembahasan.pertanyaan}
              </p>
              {pembahasan.gambarUrl && (
                <img
                  src={pembahasan.gambarUrl}
                  alt="Gambar soal"
                  className="max-h-72 max-w-full rounded-sr-sm object-contain align-middle"
                />
              )}
            </div>

            <div className="flex flex-col gap-2.5">
              <p className="text-xs font-bold tracking-wider text-sr-muted uppercase">Pilihan jawaban</p>
              {pembahasan.pilihan.map((opt) => {
                const isSelected = q.jawaban_dipilih === opt.id;
                const isOptCorrect = opt.isBenar;

                return (
                  <div
                    key={opt.id}
                    className={cn(
                      "flex items-start gap-3 rounded-sr-md border p-3 text-left",
                      isOptCorrect
                        ? "border-emerald-300 bg-emerald-50"
                        : isSelected
                          ? "border-rose-300 bg-rose-50"
                          : "border-sr-line bg-white",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold",
                        isOptCorrect
                          ? "bg-emerald-600 text-white"
                          : isSelected
                            ? "bg-rose-600 text-white"
                            : "bg-sr-blue-50 text-sr-blue-700",
                      )}
                    >
                      {isOptCorrect ? (
                        <CheckCircleIcon size={16} weight="bold" />
                      ) : isSelected ? (
                        <XCircleIcon size={16} weight="bold" />
                      ) : (
                        opt.label
                      )}
                    </span>

                    <div className="flex flex-1 flex-col gap-2 pt-0.5">
                      {opt.isi && (
                        <span
                          className={cn(
                            "text-sm font-medium",
                            isOptCorrect ? "text-emerald-950" : isSelected ? "text-rose-950" : "text-sr-ink-2",
                          )}
                        >
                          {opt.isi}
                        </span>
                      )}
                      {opt.gambarUrl && (
                        <Image
                          src={opt.gambarUrl}
                          alt={`Gambar opsi ${opt.label}`}
                          width={240}
                          height={180}
                          className="max-w-full rounded-sr-sm border border-sr-line bg-white object-contain"
                        />
                      )}
                      {(isOptCorrect || isSelected) && (
                        <span className={cn("text-xs font-bold", isOptCorrect ? "text-emerald-700" : "text-rose-700")}>
                          {isOptCorrect && isSelected
                            ? "Jawabanmu · Benar"
                            : isOptCorrect
                              ? "Kunci jawaban"
                              : "Jawabanmu"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-sr-md border border-sr-sun-200 bg-linear-to-br from-sr-cream to-sr-sun-100 p-4 md:p-5">
              <div className="mb-2 flex items-center gap-2 text-sr-amber-700">
                <NotebookIcon weight="fill" className="size-5" />
                <h4 className="text-sm font-extrabold">Pembahasan soal</h4>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-sr-ink-2">
                {pembahasan.pembahasan || "Tidak ada penjelasan tertulis."}
              </p>
              {pembahasan.pembahasanGambar && (
                <img
                  src={pembahasan.pembahasanGambar}
                  alt="Gambar pembahasan"
                  className="mt-4 max-h-80 max-w-full rounded-sr-sm object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
