import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon, ClockIcon, ListNumbersIcon } from "@phosphor-icons/react";
import { Image } from "@unpic/react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { createMeta } from "@/lib/seo-utils";
import { orpc } from "@/utils/orpc";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/tryout/result/$sesiId")({
  head: () => ({
    meta: createMeta({
      title: "Hasil Tryout",
      description: "Lihat hasil dan pembahasan tryoutmu",
      noIndex: true,
    }),
  }),
  component: TryoutResultPage,
});

function TryoutResultPage() {
  const { sesiId } = Route.useParams();
  const [selectedSesiSubtesId, setSelectedSesiSubtesId] = useState<string | null>(null);
  const [selectedSubtestName, setSelectedSubtestName] = useState<string>("");
  const [openQuestions, setOpenQuestions] = useState<Record<string, boolean>>({});

  const toggleQuestion = (questionId: string) => {
    setOpenQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const { data: result, isPending } = useQuery(orpc.tryout.results.queryOptions({ input: { sesiId } }));

  const questionsQuery = useQuery({
    ...orpc.tryout.questions.queryOptions({
      input: { sesiSubtesId: selectedSesiSubtesId || "" },
    }),
    enabled: !!selectedSesiSubtesId,
  });

  if (isPending) {
    return (
      <div className="flex w-full flex-col gap-6 pt-10">
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h3 className="text-xl font-bold text-gray-800">Hasil tidak ditemukan</h3>
        <Button asChild className="mt-4">
          <Link to="/tryout">Kembali ke Daftar Tryout</Link>
        </Button>
      </div>
    );
  }

  // Calculate overall duration from sum of subtest durations
  const totalDurasi = result.skorPerSubtes.reduce((sum, s) => sum + s.durasiMenit, 0);

  if (selectedSesiSubtesId) {
    return (
      <div className="flex w-full flex-col gap-6 pt-10 pb-20">
        {/* Banner */}
        <div className="relative flex h-48 w-full overflow-hidden rounded-2xl bg-[#5B73CD] text-white shadow-md md:h-56">
          {/* Left Column for Back Button and Mascot */}
          <div className="relative z-10 flex w-56 shrink-0 flex-col justify-between p-4 md:w-64">
            <Button
              variant="secondary"
              className="absolute top-4 left-4 z-20 flex w-fit items-center gap-2 rounded-lg border-none bg-[#23356F] px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-[#23356F]/90"
              onClick={() => {
                setSelectedSesiSubtesId(null);
                setSelectedSubtestName("");
                setOpenQuestions({});
              }}
            >
              <ArrowLeftIcon weight="bold" /> Kembali
            </Button>

            {/* Mascot Box background square */}
            <div className="absolute bottom-4 left-8 z-0 size-24 rounded-xl bg-[#809FEB]/60 md:size-32"></div>

            {/* Mascot Image */}
            <div className="absolute bottom-0 left-0 z-10 h-[180%] w-64 md:w-80">
              <Image
                src="/avatar/tutorial-avatar.png"
                alt="TryOut Mascot"
                layout="constrained"
                width={400}
                height={500}
                className="h-full w-full object-contain object-left-bottom"
              />
            </div>
          </div>

          {/* Right Column for Banner Titles */}
          <div className="z-10 flex flex-1 flex-col justify-center p-6 pl-4 md:pl-10">
            <p className="text-sm font-medium tracking-wide text-[#E0E7FF] md:text-lg">Review Hasil Tryout</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-wide text-white md:text-4xl">{selectedSubtestName}</h1>
          </div>
        </div>

        {/* Questions List */}
        <div className="flex flex-col gap-4">
          {questionsQuery.isPending ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
          ) : questionsQuery.isError ? (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
              Gagal memuat soal: {questionsQuery.error.message}
            </div>
          ) : questionsQuery.data?.soal && questionsQuery.data.soal.length > 0 ? (
            questionsQuery.data.soal.map((q, idx) => {
              const isCorrect = q.is_benar === true;
              const isOpen = !!openQuestions[q.sesiSoalId];

              return (
                <div
                  key={q.sesiSoalId}
                  className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
                >
                  {/* Colored Question Header Bar */}
                  <div
                    className={cn(
                      "flex w-full items-center justify-between gap-4 p-4 text-left md:p-5",
                      isCorrect ? "bg-[#7EE8B1]" : "bg-[#FDC0C0]",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {/* Number Badge */}
                      <div
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-bold shadow-sm",
                          isCorrect ? "text-[#10B981]" : "text-[#D94E4E]",
                        )}
                      >
                        {idx + 1}
                      </div>
                      <span className="text-sm leading-relaxed font-semibold text-slate-800 md:text-base">
                        {q.pertanyaan}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center">
                      {isCorrect ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="size-6 text-emerald-600"
                        >
                          <circle cx="12" cy="12" r="9" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="size-6 text-rose-600"
                        >
                          <circle cx="12" cy="12" r="9" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Penjelasan Accordion Toggle Bar */}
                  <button
                    type="button"
                    onClick={() => toggleQuestion(q.sesiSoalId)}
                    className="flex w-full items-center justify-between border-t border-slate-100 bg-white px-6 py-4 text-left transition-colors hover:bg-slate-50"
                  >
                    <span className="text-sm font-semibold text-slate-700">Penjelasan</span>
                    <span>
                      {isOpen ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                          stroke="currentColor"
                          className="size-4 text-slate-600"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                          stroke="currentColor"
                          className="size-4 text-slate-600"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                      )}
                    </span>
                  </button>

                  {/* Accordion Expanded Content */}
                  {isOpen && (
                    <div className="border-t border-slate-100 bg-white p-6">
                      <QuestionReviewDetail q={q} />
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-sm text-gray-500">Tidak ada soal untuk subtes ini.</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 pt-10">
      {/* Banner */}
      <div className="relative flex h-48 w-full overflow-hidden rounded-2xl bg-[#5B73CD] text-white shadow-md md:h-56">
        {/* Left Column for Back Button and Mascot */}
        <div className="relative z-10 flex w-56 shrink-0 flex-col justify-between p-4 md:w-64">
          <Button
            variant="secondary"
            className="absolute top-4 left-4 z-20 flex w-fit items-center gap-2 rounded-lg border-none bg-[#23356F] px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-[#23356F]/90"
            asChild
          >
            <Link to="/tryout">
              <ArrowLeftIcon weight="bold" /> Kembali
            </Link>
          </Button>

          {/* Mascot Box background square */}
          <div className="absolute bottom-4 left-8 z-0 size-24 rounded-xl bg-[#809FEB]/60 md:size-32"></div>

          {/* Mascot Image */}
          <div className="absolute bottom-0 left-0 z-10 h-[180%] w-64 md:w-80">
            <Image
              src="/avatar/tutorial-avatar.png"
              alt="TryOut Mascot"
              layout="constrained"
              width={400}
              height={500}
              className="h-full w-full object-contain object-left-bottom"
            />
          </div>
        </div>

        {/* Right Column for Banner Titles */}
        <div className="z-10 flex flex-1 flex-col justify-center p-6 pl-4 md:pl-10">
          <p className="text-sm font-medium tracking-wide text-[#E0E7FF] md:text-lg">Hasil Tryout</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-wide text-white md:text-4xl">
            {result.judulTryout || "Hasil Tryout"}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-gray-900">Berikut Hasil Tryoutmu!</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex flex-col justify-between gap-4 rounded-xl bg-blue-400 p-6 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-blue-50">Total Durasi</h3>
            <ClockIcon size={24} className="text-blue-200" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">{totalDurasi}</span>
            <span className="text-sm font-medium text-blue-100">/ menit</span>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 rounded-xl bg-green-500 p-6 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-green-50">Total Score</h3>
            <CheckCircleIcon size={24} className="text-green-200" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">{result.totalSkor}</span>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 rounded-xl bg-yellow-400 p-6 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-yellow-50">Total Subtes</h3>
            <ListNumbersIcon size={24} className="text-yellow-200" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">{result.skorPerSubtes.length}</span>
            <span className="text-sm font-medium text-yellow-50">/ {result.skorPerSubtes.length} subtes</span>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="mt-4 flex flex-col gap-4 pb-12">
        <h3 className="text-lg font-bold text-gray-900">Lihat Lebih Detail</h3>
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <Table>
            <TableHeader className="bg-blue-50">
              <TableRow>
                <TableHead className="w-16 font-semibold text-gray-600">No</TableHead>
                <TableHead className="font-semibold text-gray-600">Nama Subtes</TableHead>
                <TableHead className="font-semibold text-gray-600">Score</TableHead>
                <TableHead className="font-semibold text-gray-600">Durasi</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.skorPerSubtes.map((subtes, idx) => (
                <TableRow key={subtes.subtesId}>
                  <TableCell className="font-medium text-gray-500">{idx + 1}</TableCell>
                  <TableCell className="font-medium text-gray-900">{subtes.namaSubtes}</TableCell>
                  <TableCell>
                    <span className="font-semibold text-gray-700">{subtes.skor}</span>
                  </TableCell>
                  <TableCell className="text-gray-600">{subtes.durasiMenit} Menit</TableCell>
                  <TableCell>
                    {result.aksesPembahasan ? (
                      <Button
                        size="sm"
                        className="h-8 w-8 rounded-full bg-primary-300 p-0 text-white hover:bg-primary-400"
                        onClick={() => {
                          if (subtes.sesiSubtesId) {
                            setSelectedSesiSubtesId(subtes.sesiSubtesId);
                            setSelectedSubtestName(subtes.namaSubtes);
                          }
                        }}
                      >
                        <ArrowRightIcon size={16} weight="bold" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="h-8 w-8 rounded-full bg-primary-300 p-0 text-white hover:bg-primary-400"
                        asChild
                      >
                        <Link to="/premium">
                          <ArrowRightIcon size={16} weight="bold" />
                        </Link>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

interface QuestionReviewDetailProps {
  q: {
    soalId: string;
    pertanyaan: string;
    gambarUrl: string | null;
    tipe: "pilgan" | "multiple";
    poin: number;
    jawaban_dipilih: string | null;
  };
}

function QuestionReviewDetail({ q }: QuestionReviewDetailProps) {
  const {
    data: pembahasan,
    isPending,
    isError,
    error,
  } = useQuery({
    ...orpc.tryout.pembahasan.queryOptions({
      input: { soalId: q.soalId },
    }),
  });

  if (isPending) {
    return (
      <div className="flex animate-pulse flex-col gap-3 py-2">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-6 w-1/2" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">Gagal memuat pembahasan: {error.message}</div>
    );
  }

  if (!pembahasan) {
    return <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-600">Pembahasan tidak ditemukan.</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Pertanyaan */}
      <div className="flex flex-col gap-3">
        <p className="text-base font-medium whitespace-pre-wrap text-gray-800">{pembahasan.pertanyaan}</p>
        {pembahasan.gambarUrl && (
          <img
            src={pembahasan.gambarUrl}
            alt="Gambar soal"
            className="max-h-72 max-w-full rounded-lg object-contain align-middle"
          />
        )}
      </div>

      {/* Pilihan Jawaban */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Pilihan Jawaban:</p>
        {pembahasan.pilihan.map((opt) => {
          const isSelected = q.jawaban_dipilih === opt.id;
          const isCorrect = opt.isBenar;

          return (
            <div
              key={opt.id}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                isCorrect
                  ? "border-emerald-300 bg-emerald-50/50"
                  : isSelected
                    ? "border-rose-300 bg-rose-50/50"
                    : "border-gray-200 bg-white",
              )}
            >
              {/* Indicator Icon */}
              <div
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                  isCorrect
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : isSelected
                      ? "border-rose-600 bg-rose-600 text-white"
                      : "border-gray-300 bg-gray-50 text-gray-500",
                )}
              >
                {isCorrect ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                    stroke="currentColor"
                    className="size-3.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                ) : isSelected ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                    stroke="currentColor"
                    className="size-3.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                ) : (
                  opt.label
                )}
              </div>

              <div className="flex flex-1 flex-col gap-2">
                {opt.isi && (
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isCorrect ? "text-emerald-950" : isSelected ? "text-rose-950" : "text-gray-700",
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
                    className="max-w-full rounded-lg border border-gray-100 bg-white object-contain"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pembahasan */}
      <div className="rounded-xl border border-yellow-200 bg-yellow-50/40 p-5">
        <div className="mb-2 flex items-center gap-2 text-yellow-700">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
            <path
              fillRule="evenodd"
              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm0 16.25a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12.75 6a.75.75 0 0 0-1.5 0v8.25a.75.75 0 0 0 1.5 0V6Z"
              clipRule="evenodd"
            />
          </svg>
          <h4 className="text-sm font-bold tracking-wider uppercase">Pembahasan Soal</h4>
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
          {pembahasan.pembahasan || "Tidak ada penjelasan tertulis."}
        </p>
        {pembahasan.pembahasanGambar && (
          <img
            src={pembahasan.pembahasanGambar}
            alt="Gambar pembahasan"
            className="mt-4 max-h-80 max-w-full rounded-lg object-contain"
          />
        )}
      </div>
    </div>
  );
}
