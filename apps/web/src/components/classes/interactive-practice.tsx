import { ArrowCounterClockwiseIcon, CheckIcon, XIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { TiptapRenderer } from "@/components/tiptap/renderer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

type Question = {
  questionId: number;
  question: unknown;
  discussion: unknown;
  answers: Array<{ id: number; code: string; content: string; isCorrect: boolean }>;
};

/** Pilihan jawaban disimpan sebagai teks biasa atau JSON Tiptap. */
function OptionContent({ content }: { content: string }) {
  if (content.startsWith("{")) {
    try {
      const doc = JSON.parse(content);
      if (doc?.type === "doc") return <TiptapRenderer content={doc} />;
    } catch {
      // Teks biasa yang kebetulan diawali kurung kurawal.
    }
  }
  return <span className="whitespace-pre-wrap">{content}</span>;
}

export function InteractivePractice({
  contentId,
  questions,
  onCompleted,
}: {
  contentId: number;
  questions: Question[];
  /** Dipanggil saat soal terakhir yang belum dijawab selesai dijawab. */
  onCompleted: () => void;
}) {
  const queryClient = useQueryClient();
  const answersQuery = orpc.subtest.content.practice.answers.queryOptions({ input: { contentId } });
  const saved = useQuery(answersQuery);
  const [chosenIndex, setChosenIndex] = useState<number | null>(null);
  const [selected, setSelected] = useState<Record<number, number>>({});

  const answered = new Map(saved.data?.map((row) => [row.questionId, row.selectedAnswerId]));
  const firstOpen = questions.findIndex((q) => !answered.has(q.questionId));
  // Saat pertama dibuka, lanjutkan di soal pertama yang belum dijawab. Setelah itu siswa yang menentukan.
  const index = Math.min(chosenIndex ?? Math.max(firstOpen, 0), questions.length - 1);
  const current = questions[index];

  const answerMutation = useMutation(
    orpc.subtest.content.practice.answer.mutationOptions({
      onSuccess: (result) => {
        queryClient.setQueryData(answersQuery.queryKey, result.answers);
        if (result.completed) onCompleted();
      },
      onError: (error) => toast.error("Jawaban belum tersimpan", { description: error.message }),
    }),
  );

  const resetMutation = useMutation(
    orpc.subtest.content.practice.reset.mutationOptions({
      onSuccess: () => {
        queryClient.setQueryData(answersQuery.queryKey, []);
        setSelected({});
        setChosenIndex(0);
      },
      onError: (error) => toast.error("Gagal mengulang latihan", { description: error.message }),
    }),
  );

  if (saved.isPending) return <p className="animate-pulse text-sm">Memuat jawabanmu...</p>;
  if (saved.isError || !current) return <p className="text-sm text-red-500">Latihan soal belum bisa dimuat.</p>;

  const savedAnswerId = answered.get(current.questionId);
  const isAnswered = savedAnswerId !== undefined;
  const pickedId = savedAnswerId ?? selected[current.questionId];
  const isCorrect = current.answers.some((a) => a.id === savedAnswerId && a.isCorrect);
  const doneCount = questions.filter((q) => answered.has(q.questionId)).length;
  const goTo = (next: number) => setChosenIndex(next);

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-sr-md border border-sr-line bg-white p-4 shadow-sr-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-bold text-sr-ink" aria-live="polite">
            Progres: {doneCount} dari {questions.length} soal dikerjakan
          </p>
          {doneCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              disabled={resetMutation.isPending}
              onClick={() => resetMutation.mutate({ contentId })}
            >
              <ArrowCounterClockwiseIcon weight="bold" className="mr-1 size-4" />
              Ulangi
            </Button>
          )}
        </div>
        <nav aria-label="Daftar soal" className="flex flex-wrap gap-1.5">
          {questions.map((q, i) => {
            const answerId = answered.get(q.questionId);
            const result = answerId === undefined ? null : q.answers.some((a) => a.id === answerId && a.isCorrect);
            return (
              <button
                key={q.questionId}
                type="button"
                onClick={() => goTo(i)}
                aria-current={i === index ? "step" : undefined}
                aria-label={`Soal ${i + 1}${result === null ? "" : result ? ", benar" : ", salah"}`}
                className={cn(
                  "flex size-9 cursor-pointer items-center justify-center rounded-full border-2 text-xs font-extrabold",
                  result === null && "border-sr-line bg-white text-sr-ink",
                  result === true && "border-sr-live bg-[#edfcf4] text-sr-live",
                  result === false && "border-rose-400 bg-rose-50 text-rose-600",
                  i === index && "ring-2 ring-sr-blue-500 ring-offset-2",
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="rounded-sr-md border border-sr-line bg-white p-4 shadow-sr-1">
        <span className="rounded-full bg-sr-blue-50 px-3 py-1 text-xs font-bold text-sr-blue-700">
          Soal {index + 1}/{questions.length}
        </span>
        <div className="mt-3 mb-5 wrap-break-word text-sr-ink">
          <TiptapRenderer key={current.questionId} content={current.question} />
        </div>

        <div className="flex flex-col gap-2.5">
          {current.answers.map((option) => {
            const isPicked = pickedId === option.id;
            const showCorrect = isAnswered && option.isCorrect;
            const showWrong = isAnswered && isPicked && !option.isCorrect;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={isPicked}
                disabled={isAnswered || answerMutation.isPending}
                onClick={() => setSelected((prev) => ({ ...prev, [current.questionId]: option.id }))}
                className={cn(
                  "flex items-start gap-3 rounded-sr-md border-2 p-3 text-left transition-colors",
                  showCorrect
                    ? "border-sr-live bg-[#edfcf4]"
                    : showWrong
                      ? "border-rose-400 bg-rose-50"
                      : isPicked
                        ? "border-sr-blue-500 bg-sr-blue-50"
                        : "border-sr-line bg-white",
                  isAnswered ? "cursor-default" : "cursor-pointer hover:border-sr-blue-200",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold",
                    showCorrect
                      ? "bg-sr-live text-white"
                      : showWrong
                        ? "bg-rose-500 text-white"
                        : "bg-sr-blue-50 text-sr-blue-700",
                  )}
                >
                  {showCorrect ? (
                    <CheckIcon weight="bold" className="size-4" aria-label="Jawaban benar" />
                  ) : showWrong ? (
                    <XIcon weight="bold" className="size-4" aria-label="Jawaban salah" />
                  ) : (
                    option.code
                  )}
                </span>
                <span className="min-w-0 flex-1 pt-1 wrap-break-word text-sr-ink-2">
                  <OptionContent content={option.content} />
                </span>
              </button>
            );
          })}
        </div>

        {isAnswered ? (
          <>
            <p
              className={cn(
                "mt-4 rounded-sr-md px-4 py-3 text-sm font-bold",
                isCorrect ? "bg-[#edfcf4] text-sr-live" : "bg-rose-50 text-rose-600",
              )}
            >
              {isCorrect ? "Mantap, jawabanmu benar!" : "Jawabanmu belum tepat."}
            </p>
            <div className="mt-4 border-t border-sr-line pt-3 text-sm wrap-break-word text-sr-ink-2">
              <p className="mb-1 font-bold text-sr-ink">Pembahasan</p>
              <TiptapRenderer key={current.questionId} content={current.discussion} />
            </div>
          </>
        ) : (
          <Button
            className="mt-4 w-full"
            disabled={pickedId === undefined || answerMutation.isPending}
            onClick={() => {
              if (pickedId === undefined) return;
              // Tetap di soal ini setelah tersimpan, supaya pembahasannya sempat dibaca.
              setChosenIndex(index);
              answerMutation.mutate({ contentId, questionId: current.questionId, answerId: pickedId });
            }}
          >
            {answerMutation.isPending ? "Menyimpan..." : "Cek Jawaban"}
          </Button>
        )}
      </div>

      <div className="flex justify-between gap-3">
        <Button
          variant="outline"
          className="min-w-0 flex-1 px-3 sm:flex-none sm:px-6"
          disabled={index === 0}
          onClick={() => goTo(index - 1)}
        >
          Sebelumnya
        </Button>
        <Button
          variant="outline"
          className="min-w-0 flex-1 px-3 sm:flex-none sm:px-6"
          disabled={index === questions.length - 1}
          onClick={() => goTo(index + 1)}
        >
          Selanjutnya
        </Button>
      </div>
    </div>
  );
}
