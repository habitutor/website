import { useState, useEffect, useCallback, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Image } from "@unpic/react";
import { orpc, queryClient } from "@/utils/orpc";
import { toast } from "sonner";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon, ArrowRightIcon, CheckSquare, ListIcon, Square } from "@phosphor-icons/react";
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
      title: "Tryout Test",
      description: "Pengerjaan Soal Tryout",
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

  // --- Countdown timer ---
  const { formatted: timerFormatted, isExpired, isReady: isTimerReady } = useCountdown(deadlineAt);

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
          toast.success("Tryout selesai! Melihat hasil...");
          navigate({
            to: "/tryout",
          });
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
      navigate({ to: "/tryout" });
    }
  }, [autoSubmitMutation.data, navigate, resolvedSesiId]);

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
        answered: !!q.jawaban_dipilih,
        doubtful: !!q.is_ragu,
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [questionsQuery.data],
  );

  if (!sesiSubtesId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Sesi tidak valid. Kembali ke halaman tryout.</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col py-6">
      <div className="mx-auto w-full max-w-6xl rounded-2xl bg-[#fff8db] p-6 shadow-sm">
        {/* Header Section */}
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Soal Nomor {activeQuestion}</h1>
            <p className="text-sm text-gray-600">{subtestName}</p>
          </div>
          <div className="flex items-center gap-4">
            {currentQuestion?.is_ragu && (
              <div className="rounded bg-[#eab308] px-3 py-1.5 text-sm font-bold text-black shadow-sm">Ragu-Ragu</div>
            )}
            <div
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-semibold shadow-sm",
                isExpired ? "border-red-300 bg-red-100 text-red-700" : "border-gray-200 bg-white text-gray-800",
              )}
            >
              Sisa waktu: <span className="font-bold">{timerFormatted}</span>
            </div>

            {/* Question List Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-[#3b5998] text-white hover:bg-[#3b5998]/90">
                  <ListIcon weight="bold" className="mr-2" /> Daftar Soal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Daftar Soal</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-5 gap-3 border-t pt-4">
                  {questions.map((_: unknown, idx: number) => {
                    const qNum = idx + 1;
                    const { answered, doubtful } = getQuestionStatus(idx);

                    return (
                      <button
                        key={qNum}
                        type="button"
                        onClick={() => setActiveQuestion(qNum)}
                        className={cn(
                          "flex h-12 w-full items-center justify-center rounded-lg border text-lg font-medium transition-colors",
                          doubtful
                            ? "border-[#facc15] bg-[#fde047] text-gray-900"
                            : answered
                              ? "border-[#7dd3fc] bg-[#bae6fd] text-gray-900"
                              : "border-gray-300 bg-white text-gray-900 hover:bg-gray-50",
                          activeQuestion === qNum && "ring-2 ring-[#3b5998] ring-offset-2",
                        )}
                      >
                        {qNum}
                      </button>
                    );
                  })}
                </div>

                {/* Summary */}
                <div className="mt-4 flex gap-4 border-t pt-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <div className="size-3 rounded-sm border-[#7dd3fc] bg-[#bae6fd]" /> Dijawab
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="size-3 rounded-sm border-[#facc15] bg-[#fde047]" /> Ragu-ragu
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="size-3 rounded-sm border-gray-300 bg-white" /> Belum dijawab
                  </div>
                </div>

                {/* Submit button */}
                <div className="mt-2 border-t pt-4">
                  <Button
                    className="w-full bg-[#3b5998] text-white hover:bg-[#3b5998]/90"
                    onClick={handleSubmitSubtest}
                    disabled={submitSubtestMutation.isPending || isExpired}
                  >
                    {submitSubtestMutation.isPending ? "Menyimpan..." : "Selesai & Lanjut Subtest"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex min-h-100 flex-col gap-0 rounded-xl bg-white shadow-sm md:flex-row">
          {/* Question Panel */}
          <div className="flex-1 p-6 md:p-8">
            {questionsQuery.isPending ? (
              <div className="flex flex-col gap-4">
                <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
              </div>
            ) : currentQuestion ? (
              <>
                <div className="mb-6">
                  <p className="text-lg font-medium whitespace-pre-wrap text-gray-800">{currentQuestion.pertanyaan}</p>
                  {currentQuestion.gambarUrl && (
                    <img
                      src={currentQuestion.gambarUrl}
                      alt={`Gambar soal ${activeQuestion}`}
                      className="mt-4 max-w-full rounded-lg"
                    />
                  )}
                </div>

                {/* Answer Options */}
                <div className="flex flex-col gap-3">
                  {currentQuestion.pilihan.map((opt: { id: string; label: string; isi: string }) => {
                    const option = opt as {
                      id: string;
                      label: string;
                      isi: string;
                      gambarUrl?: string | null;
                    };
                    const isSelected = currentQuestion.jawaban_dipilih === opt.id;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          if (!resolvedSesiId || isExpired) return;
                          submitAnswerMutation.mutate({
                            sesiId: resolvedSesiId,
                            sesiSoalId: currentQuestion.sesiSoalId,
                            pilihanId: opt.id,
                            isRagu: currentQuestion.is_ragu ?? false,
                          });
                        }}
                        disabled={isExpired}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 text-left transition-colors",
                          isSelected ? "border-blue-400 bg-blue-50" : "border-transparent hover:bg-gray-50",
                          isExpired && "cursor-not-allowed opacity-60",
                        )}
                      >
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-gray-400 bg-white">
                          {isSelected && <div className="size-3 rounded-full bg-blue-500" />}
                        </div>
                        <span className="font-medium text-gray-600">{opt.label}.</span>
                        <div className="flex flex-1 flex-col gap-2">
                          {option.isi && <span className="text-gray-700">{option.isi}</span>}
                          {option.gambarUrl && (
                            <Image
                              src={option.gambarUrl}
                              alt={`Gambar opsi ${option.label}`}
                              width={320}
                              height={240}
                              className="mt-1 max-w-full rounded-lg border border-gray-200 bg-white object-contain"
                            />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {questionsQuery.isError ? `Error: ${questionsQuery.error.message}` : "Tidak ada soal"}
              </p>
            )}
          </div>
        </div>

        {/* Footer Section: Controls */}
        <div className="mt-6 flex flex-col items-center justify-between gap-4 md:flex-row">
          <Button
            variant="outline"
            onClick={() => setActiveQuestion(Math.max(1, activeQuestion - 1))}
            disabled={activeQuestion <= 1}
            className="h-12 w-full border-gray-300 bg-white px-6 shadow-sm md:w-auto"
          >
            <ArrowLeftIcon weight="bold" className="mr-2" /> Sebelumnya
          </Button>

          <Button
            onClick={() => {
              if (!resolvedSesiId || !currentQuestion || isExpired) return;
              submitAnswerMutation.mutate({
                sesiId: resolvedSesiId,
                sesiSoalId: currentQuestion.sesiSoalId,
                pilihanId: currentQuestion.jawaban_dipilih ?? null,
                isRagu: !currentQuestion.is_ragu,
              });
            }}
            disabled={isExpired}
            className={cn(
              "h-12 w-full px-8 font-semibold shadow-sm md:w-auto",
              "bg-[#eab308] text-black hover:bg-[#ca8a04]",
            )}
          >
            {currentQuestion?.is_ragu ? (
              <CheckSquare weight="fill" className="mr-2 h-5 w-5" />
            ) : (
              <Square weight="bold" className="mr-2 h-5 w-5" />
            )}
            Ragu-Ragu
          </Button>

          {activeQuestion < totalQuestions ? (
            <Button
              onClick={() => setActiveQuestion(Math.min(totalQuestions, activeQuestion + 1))}
              className="h-12 w-full bg-[#3b5998] px-6 text-white shadow-sm hover:bg-[#273f72] md:w-auto"
            >
              Selanjutnya <ArrowRightIcon weight="bold" className="ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmitSubtest}
              disabled={submitSubtestMutation.isPending || isExpired}
              className="h-12 w-full bg-green-600 px-6 text-white shadow-sm hover:bg-green-700 md:w-auto"
            >
              {submitSubtestMutation.isPending ? "Menyimpan..." : "Selesai Subtest →"}
            </Button>
          )}
        </div>
      </div>

      {/* ===== TIME EXPIRED DIALOG ===== */}
      <Dialog open={timeExpiredDialogOpen} onOpenChange={setTimeExpiredDialogOpen}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-orange-600">Waktu Anda sudah habis !</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Jawaban Anda akan otomatis terkumpul dan hasil akan keluar secara langsung
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setTimeExpiredDialogOpen(false)}>
              Batal
            </Button>
            <Button className="bg-[#eab308] text-black hover:bg-[#ca8a04]" onClick={handleTimeExpiredContinue}>
              Lanjutkan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
