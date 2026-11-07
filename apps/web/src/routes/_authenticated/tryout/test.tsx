import { useState, useEffect, useCallback, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc, queryClient } from "@/utils/orpc";
import { toast } from "sonner";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  CheckSquare,
  FlagIcon,
  Square,
  SquaresFourIcon,
  TimerIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { createMeta } from "@/lib/seo-utils";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/tryout/test")({
  validateSearch: (search: Record<string, unknown>) => ({
    sesiSubtesId: String(search.sesiSubtesId ?? ""),
    sesiId: String(search.sesiId ?? ""),
    tryoutSessionId: search.tryoutSessionId ? String(search.tryoutSessionId) : undefined,
  }),
  head: () => ({
    meta: createMeta({
      title: "Tes Try Out",
      description: "Pengerjaan Soal Try Out",
      noIndex: true,
    }),
  }),
  component: TryoutTestPage,
});

// --- Countdown Timer Hook ---
function useCountdown(deadlineAt: string | Date | null | undefined) {
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const [isReady, setIsReady] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setIsReady(false);

    if (!deadlineAt) return;

    const deadline = new Date(deadlineAt).getTime();
    if (Number.isNaN(deadline)) return;

    const tick = () => {
      const now = Date.now();
      const diff = deadline - now;
      setRemainingMs(Math.max(0, diff));
      setIsReady(true);
    };

    tick();
    intervalRef.current = setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [deadlineAt]);

  const isExpired = isReady && remainingMs <= 0 && !!deadlineAt;

  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);
  const formatted = isReady ? `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}` : "--:--";

  return { remainingMs, isExpired, formatted, minutes, seconds, isReady };
}

function TryoutTestPage() {
  const navigate = useNavigate();
  const searchParams = Route.useSearch();

  // Support both search params and legacy query params
  const sesiSubtesId = searchParams.sesiSubtesId || searchParams.tryoutSessionId || "";
  const sesiId = searchParams.sesiId || "";

  const [activeQuestion, setActiveQuestion] = useState(1);
  const [timeExpiredDialogOpen, setTimeExpiredDialogOpen] = useState(false);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);
  const [questionListOpen, setQuestionListOpen] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);

  // --- Fetch sesi subtes info (for timer + subtest name) ---
  const sesiInfoQuery = useQuery({
    ...orpc.tryout.sesiSubtesInfo.queryOptions({
      input: { sesiSubtesId },
    }),
    enabled: !!sesiSubtesId,
  });

  const sesiInfo = sesiInfoQuery.data;
  const deadlineAt = sesiInfo?.deadlineAt;
  const subtestName = sesiInfo?.namaSubtes ?? "Subtest";
  const resolvedSesiId = sesiId || sesiInfo?.sesiId || "";

  // Setelah subtes terakhir siswa langsung melihat hasilnya; tanpa ID sesi kembali ke daftar try out.
  const goToResult = useCallback(() => {
    if (resolvedSesiId) {
      navigate({ to: "/tryout/result/$sesiId", params: { sesiId: resolvedSesiId } });
    } else {
      navigate({ to: "/tryout" });
    }
  }, [navigate, resolvedSesiId]);

  // --- Countdown timer ---
  const { formatted: timerFormatted, isExpired, isReady: isTimerReady, remainingMs } = useCountdown(deadlineAt);

  // --- Fetch questions ---
  const questionsQuery = useQuery({
    ...orpc.tryout.questions.queryOptions({
      input: { sesiSubtesId },
    }),
    enabled: !!sesiSubtesId,
  });

  const questions = questionsQuery.data?.soal ?? [];
  const totalQuestions = questions.length;
  const currentQuestion = questions[activeQuestion - 1];

  useEffect(() => {
    setActiveQuestion(1);
  }, [sesiSubtesId]);

  useEffect(() => {
    if (totalQuestions > 0 && activeQuestion > totalQuestions) {
      setActiveQuestion(1);
    }
  }, [activeQuestion, totalQuestions]);

  // --- Submit answer mutation ---
  const submitAnswerMutation = useMutation(
    orpc.tryout.answer.submit.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.tryout.questions.key({ input: { sesiSubtesId } } as never),
        });
      },
      onError: (err: Error) => {
        toast.error("Gagal submit jawaban", { description: err.message });
      },
    }),
  );

  // --- Submit subtest mutation ---
  const submitSubtestMutation = useMutation(
    orpc.tryout.subtes.submit.mutationOptions({
      onSuccess: (data) => {
        if (data.subtesBerikutnya) {
          // Navigate to next subtest
          toast.success(`Subtest "${data.selesaiSubtes?.namaSubtes}" selesai! Lanjut ke subtest berikutnya.`);
          navigate({
            to: "/tryout/test",
            search: {
              sesiSubtesId: data.subtesBerikutnya.id,
              sesiId: resolvedSesiId,
              tryoutSessionId: undefined,
            },
          });
        } else {
          // All subtests done, go to results
          toast.success("Try Out selesai! Melihat hasil...");
          queryClient.invalidateQueries({ queryKey: orpc.streak.get.key() });
          goToResult();
        }
      },
      onError: (err: Error) => {
        toast.error("Gagal submit subtest", { description: err.message });
      },
    }),
  );

  // --- Auto-submit subtest mutation ---
  const autoSubmitMutation = useMutation(
    orpc.tryout.subtes.autoSubmit.mutationOptions({
      onSuccess: () => {
        setHasAutoSubmitted(true);
        queryClient.invalidateQueries({ queryKey: orpc.streak.get.key() });
        // Don't navigate yet — show dialog first
      },
      onError: (err: Error) => {
        toast.error("Gagal auto-submit", { description: err.message });
      },
    }),
  );

  // --- Trigger time-expired dialog when timer hits zero ---
  useEffect(() => {
    if (isTimerReady && isExpired && !timeExpiredDialogOpen && !hasAutoSubmitted && sesiSubtesId) {
      setTimeExpiredDialogOpen(true);
      autoSubmitMutation.mutate({ sesiSubtesId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpired, isTimerReady, timeExpiredDialogOpen, hasAutoSubmitted, sesiSubtesId]);

  // --- Handle "Lanjutkan" button in time-expired dialog ---
  const handleTimeExpiredContinue = useCallback(() => {
    setTimeExpiredDialogOpen(false);

    const data = autoSubmitMutation.data as unknown as { subtesBerikutnya?: { id: string } };
    if (data?.subtesBerikutnya) {
      navigate({
        to: "/tryout/test",
        search: {
          sesiSubtesId: data.subtesBerikutnya.id,
          sesiId: resolvedSesiId,
          tryoutSessionId: undefined,
        },
      });
    } else {
      goToResult();
    }
  }, [autoSubmitMutation.data, navigate, resolvedSesiId, goToResult]);

  // --- Handle manual submit ---
  const handleSubmitSubtest = useCallback(() => {
    if (!sesiSubtesId) return;
    submitSubtestMutation.mutate({ sesiSubtesId });
  }, [sesiSubtesId, submitSubtestMutation]);

  // --- Compute answered/doubtful status from API data ---
  const getQuestionStatus = useCallback(
    (qIdx: number) => {
      const q = questions[qIdx];
      if (!q) return { answered: false, doubtful: false };
      return {
        answered: !!q.jawaban_dipilih || (q.jawaban_dipilih_multi?.length ?? 0) > 0,
        doubtful: !!q.is_ragu,
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [questionsQuery.data],
  );

  if (!sesiSubtesId) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <img src="/avatar/confused-avatar.webp" alt="" className="h-32 w-auto" />
        <p className="text-lg font-extrabold text-sr-ink">Sesi try out tidak valid</p>
        <Button className="rounded-full" onClick={() => navigate({ to: "/tryout" })}>
          Kembali ke Daftar Try Out
        </Button>
      </div>
    );
  }

  const answeredCount = questions.filter((_: unknown, idx: number) => getQuestionStatus(idx).answered).length;
  const doubtfulCount = questions.filter((_: unknown, idx: number) => getQuestionStatus(idx).doubtful).length;
  const unansweredCount = Math.max(0, totalQuestions - answeredCount);
  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  const isLowTime = isTimerReady && !isExpired && remainingMs <= 5 * 60 * 1000;

  // Subtes tidak bisa diulang, jadi kumpulkan selalu lewat konfirmasi dulu.
  const requestSubmit = () => {
    setQuestionListOpen(false);
    setConfirmSubmitOpen(true);
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 pb-28 md:pb-8">
      {/* Bilah atas menempel saat digulir: nama subtes, posisi soal, timer, dan daftar soal. */}
      <div className="sticky top-20 z-30 rounded-sr-xl border border-sr-line bg-white/95 p-3 shadow-sr-1 backdrop-blur sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-sr-blue-600 sm:text-sm">{subtestName}</p>
            <p className="text-base font-extrabold text-sr-ink sm:text-lg">
              Soal {activeQuestion}
              <span className="font-semibold text-sr-muted"> dari {totalQuestions || "–"}</span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-extrabold tabular-nums",
                isExpired
                  ? "bg-rose-100 text-rose-700"
                  : isLowTime
                    ? "bg-sr-orange-100 text-sr-orange-700 motion-safe:animate-pulse"
                    : "bg-sr-blue-50 text-sr-blue-700",
              )}
              aria-label="Sisa waktu"
            >
              <TimerIcon weight="bold" className="size-4" />
              {timerFormatted}
            </div>

            <Dialog open={questionListOpen} onOpenChange={setQuestionListOpen}>
              <DialogTrigger asChild>
                <Button variant="darkBlue" className="rounded-full max-sm:size-10 max-sm:px-0">
                  <SquaresFourIcon weight="bold" />
                  <span className="max-sm:sr-only">Daftar Soal</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-sr-lg sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-left text-xl font-extrabold text-sr-ink">Daftar Soal</DialogTitle>
                  <DialogDescription className="text-left">
                    {answeredCount} dari {totalQuestions} soal sudah dijawab
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
                  {questions.map((_: unknown, idx: number) => {
                    const qNum = idx + 1;
                    const { answered, doubtful } = getQuestionStatus(idx);

                    return (
                      <button
                        key={qNum}
                        type="button"
                        onClick={() => {
                          setActiveQuestion(qNum);
                          setQuestionListOpen(false);
                        }}
                        className={cn(
                          "flex h-11 w-full items-center justify-center rounded-sr-sm border text-base font-bold transition-all sm:h-12",
                          doubtful
                            ? "border-sr-sun-400 bg-sr-sun-200 text-sr-ink"
                            : answered
                              ? "border-transparent bg-sr-blue-500 text-white"
                              : "border-sr-line bg-white text-sr-ink hover:border-sr-blue-200",
                          activeQuestion === qNum && "ring-2 ring-sr-ink ring-offset-2",
                        )}
                      >
                        {qNum}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-sr-muted">
                  <span className="flex items-center gap-1.5">
                    <span className="size-3 rounded-sm bg-sr-blue-500" /> Dijawab
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-3 rounded-sm border border-sr-sun-400 bg-sr-sun-200" /> Ragu-ragu
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-3 rounded-sm border border-sr-line bg-white" /> Belum dijawab
                  </span>
                </div>

                <Button
                  className="w-full rounded-full bg-sr-live text-white hover:bg-sr-live/90"
                  onClick={requestSubmit}
                  disabled={submitSubtestMutation.isPending || isExpired}
                >
                  {submitSubtestMutation.isPending ? "Menyimpan..." : "Selesai & Kumpulkan Subtes"}
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-sr-blue-50"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Soal terjawab"
        >
          <div
            className="h-full rounded-full bg-(image:--sr-grad-blue) transition-[width] duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="rounded-sr-xl border border-sr-line bg-white p-4 shadow-sr-1 sm:p-6 md:p-8">
        {questionsQuery.isPending ? (
          <div className="flex flex-col gap-4">
            <div className="h-6 w-3/4 animate-pulse rounded bg-sr-blue-50" />
            <div className="h-4 w-full animate-pulse rounded bg-sr-blue-50" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-sr-blue-50" />
          </div>
        ) : currentQuestion ? (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-sr-blue-50 px-3 py-1 text-xs font-bold text-sr-blue-700">
                No. {activeQuestion}
              </span>
              {currentQuestion.tipe === "multiple" && (
                <span className="rounded-full bg-sr-orange-100 px-3 py-1 text-xs font-bold text-sr-orange-700">
                  Pilih semua jawaban yang benar
                </span>
              )}
              {currentQuestion.is_ragu && (
                <span className="inline-flex items-center gap-1 rounded-full bg-sr-sun-500 px-3 py-1 text-xs font-bold text-sr-ink">
                  <FlagIcon weight="fill" className="size-3.5" /> Ditandai ragu-ragu
                </span>
              )}
            </div>

            <div className="mb-6">
              <div className="space-y-4 text-base font-medium wrap-break-word text-sr-ink sm:text-lg">
                {currentQuestion.pertanyaan
                  .split(/\n+/)
                  .filter((line: string) => line.trim() !== "")
                  .map((line: string, i: number) => (
                    <p key={i.toString()} className="leading-relaxed">
                      {line}
                    </p>
                  ))}
              </div>
              {currentQuestion.gambarUrl && (
                <img
                  src={currentQuestion.gambarUrl}
                  alt={`Gambar soal ${activeQuestion}`}
                  className="mt-4 max-w-full rounded-sr-sm"
                />
              )}
            </div>

            <div className="flex flex-col gap-2.5">
              {currentQuestion.pilihan.map((opt: { id: string; label: string; isi: string }) => {
                const option = opt as {
                  id: string;
                  label: string;
                  isi: string;
                  gambarUrl?: string | null;
                };

                const isMultiple = currentQuestion.tipe === "multiple";
                const selectedIds = currentQuestion.jawaban_dipilih_multi ?? [];

                const isSelected = isMultiple
                  ? selectedIds.includes(opt.id)
                  : currentQuestion.jawaban_dipilih === opt.id;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      if (!resolvedSesiId || isExpired) return;

                      if (isMultiple) {
                        const nextIds = isSelected
                          ? selectedIds.filter((id) => id !== opt.id)
                          : [...selectedIds, opt.id];

                        submitAnswerMutation.mutate({
                          sesiId: resolvedSesiId,
                          sesiSoalId: currentQuestion.sesiSoalId,
                          pilihanId: null,
                          pilihanIds: nextIds,
                          isRagu: currentQuestion.is_ragu ?? false,
                        });
                      } else {
                        submitAnswerMutation.mutate({
                          sesiId: resolvedSesiId,
                          sesiSoalId: currentQuestion.sesiSoalId,
                          pilihanId: opt.id,
                          isRagu: currentQuestion.is_ragu ?? false,
                        });
                      }
                    }}
                    disabled={isExpired}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-sr-md border-2 p-3 text-left transition-all duration-200 sm:p-4",
                      isSelected
                        ? "border-sr-blue-500 bg-sr-blue-50 shadow-sr-1"
                        : "border-sr-line bg-white hover:border-sr-blue-200 hover:bg-sr-ivory",
                      isExpired && "cursor-not-allowed opacity-60",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center text-sm font-extrabold transition-colors",
                        isMultiple ? "rounded-sr-xs" : "rounded-full",
                        isSelected ? "bg-sr-blue-500 text-white" : "bg-sr-blue-50 text-sr-blue-700",
                      )}
                    >
                      {option.label}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-2 pt-1">
                      {option.isi && <span className="leading-relaxed text-sr-ink-2">{option.isi}</span>}
                      {option.gambarUrl && (
                        <img
                          src={option.gambarUrl}
                          alt={`Gambar opsi ${option.label}`}
                          className="mt-1 h-auto max-w-full rounded-sr-sm border border-sr-line bg-white object-contain"
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <p className="py-8 text-center text-sm text-sr-muted">
            {questionsQuery.isError ? `Error: ${questionsQuery.error.message}` : "Tidak ada soal"}
          </p>
        )}
      </div>

      {/* Navigasi soal: di HP menempel di bawah layar supaya selalu terjangkau jempol. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-sr-line bg-white/95 p-3 shadow-sr-3 backdrop-blur md:static md:rounded-sr-xl md:border md:p-4 md:shadow-sr-1">
        <div className="mx-auto grid max-w-5xl grid-cols-3 gap-2 md:gap-3">
          <Button
            variant="outline"
            onClick={() => setActiveQuestion(Math.max(1, activeQuestion - 1))}
            disabled={activeQuestion <= 1}
            className="h-12 rounded-full px-2"
          >
            <ArrowLeftIcon weight="bold" />
            <span className="max-sm:hidden">Sebelumnya</span>
          </Button>

          <Button
            variant="secondary"
            onClick={() => {
              if (!resolvedSesiId || !currentQuestion || isExpired) return;

              submitAnswerMutation.mutate({
                sesiId: resolvedSesiId,
                sesiSoalId: currentQuestion.sesiSoalId,
                pilihanId: currentQuestion.jawaban_dipilih ?? null,
                pilihanIds: currentQuestion.jawaban_dipilih_multi ?? [],
                isRagu: !currentQuestion.is_ragu,
              });
            }}
            disabled={isExpired}
            className={cn("h-12 rounded-full px-2", currentQuestion?.is_ragu && "ring-2 ring-sr-amber ring-offset-1")}
          >
            {currentQuestion?.is_ragu ? (
              <CheckSquare weight="fill" className="size-5" />
            ) : (
              <Square weight="bold" className="size-5" />
            )}
            Ragu-ragu
          </Button>

          {activeQuestion < totalQuestions ? (
            <Button
              onClick={() => setActiveQuestion(Math.min(totalQuestions, activeQuestion + 1))}
              className="h-12 rounded-full px-2"
            >
              <span className="max-sm:hidden">Selanjutnya</span>
              <span className="sm:hidden">Lanjut</span>
              <ArrowRightIcon weight="bold" />
            </Button>
          ) : (
            <Button
              onClick={requestSubmit}
              disabled={submitSubtestMutation.isPending || isExpired}
              className="h-12 rounded-full bg-sr-live px-2 text-white hover:bg-sr-live/90"
            >
              {submitSubtestMutation.isPending ? "Menyimpan..." : "Selesai"}
              <CheckCircleIcon weight="fill" />
            </Button>
          )}
        </div>
      </div>

      {/* ===== KONFIRMASI KUMPULKAN SUBTES ===== */}
      <Dialog open={confirmSubmitOpen} onOpenChange={setConfirmSubmitOpen}>
        <DialogContent className="rounded-sr-lg sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-left text-xl font-extrabold text-sr-ink">Kumpulkan subtes ini?</DialogTitle>
            <DialogDescription className="text-left">
              Setelah dikumpulkan, subtes <strong>{subtestName}</strong> tidak bisa dibuka atau diulang lagi.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-sr-md bg-sr-blue-50 p-3">
              <p className="text-2xl font-extrabold text-sr-blue-700">{answeredCount}</p>
              <p className="text-xs font-semibold text-sr-muted">Dijawab</p>
            </div>
            <div className="rounded-sr-md bg-sr-sun-100 p-3">
              <p className="text-2xl font-extrabold text-sr-amber-700">{doubtfulCount}</p>
              <p className="text-xs font-semibold text-sr-muted">Ragu-ragu</p>
            </div>
            <div className={cn("rounded-sr-md p-3", unansweredCount > 0 ? "bg-rose-50" : "bg-sr-blue-50")}>
              <p className={cn("text-2xl font-extrabold", unansweredCount > 0 ? "text-rose-600" : "text-sr-ink")}>
                {unansweredCount}
              </p>
              <p className="text-xs font-semibold text-sr-muted">Belum dijawab</p>
            </div>
          </div>
          {unansweredCount > 0 && (
            <p className="rounded-sr-md bg-rose-50 p-3 text-sm text-rose-700">
              Masih ada {unansweredCount} soal kosong. Yakin mau dikumpulkan sekarang?
            </p>
          )}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button variant="outline" className="rounded-full" onClick={() => setConfirmSubmitOpen(false)}>
              Cek lagi
            </Button>
            <Button
              className="rounded-full bg-sr-live text-white hover:bg-sr-live/90"
              disabled={submitSubtestMutation.isPending || isExpired}
              onClick={() => {
                setConfirmSubmitOpen(false);
                handleSubmitSubtest();
              }}
            >
              Ya, kumpulkan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== TIME EXPIRED DIALOG ===== */}
      <Dialog open={timeExpiredDialogOpen} onOpenChange={setTimeExpiredDialogOpen}>
        <DialogContent className="rounded-sr-lg sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-left text-lg font-extrabold text-sr-orange-700">
              <TimerIcon weight="fill" className="size-5" /> Waktu kamu sudah habis!
            </DialogTitle>
            <DialogDescription className="text-left text-sm">
              Jawabanmu otomatis terkumpul. Klik Lanjutkan untuk ke subtes berikutnya atau melihat hasil.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" className="rounded-full" onClick={() => setTimeExpiredDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="secondary" className="rounded-full" onClick={handleTimeExpiredContinue}>
              Lanjutkan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
