import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CheckIcon, XIcon } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import { TiptapRenderer } from "@/components/tiptap/renderer";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

export function QuestionSection({
  questionId,
  selectedAnswerId,
}: {
  questionId: number;
  selectedAnswerId?: number | null;
}) {
  const { data: question, isPending } = useQuery(
    orpc.admin.question.find.queryOptions({
      input: { id: questionId },
    }),
  );

  return (
    <div className="space-y-4 rounded-[10px] border bg-muted/30 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <Link
          to="/admin/questions/$id"
          params={{
            id: questionId.toString(),
          }}
          className="text-sm font-bold text-muted-foreground hover:underline"
        >
          Related Question (ID: {questionId})
        </Link>
      </div>

      {isPending ? (
        <Skeleton className="h-20 w-full" />
      ) : question ? (
        <div className="prose prose-sm max-w-none rounded-[5px] border border-neutral-200 bg-white p-4 text-foreground">
          <TiptapRenderer content={question.content} />
        </div>
      ) : (
        <div className="text-sm text-destructive">Question not found</div>
      )}

      {isPending ? (
        <div className="mt-4 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : question?.answers && question.answers.length > 0 ? (
        <div className="mt-4 space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Answer Options</h4>
          <div className="flex flex-col gap-3">
            {question.answers.map((answer: { id: number; code: string; content: string; isCorrect: boolean }) => {
              const isSelected = answer.id === selectedAnswerId;
              const isCorrect = answer.isCorrect;
              const isWrong = isSelected && !isCorrect;

              // Derive exact styles from FlashcardCard logic
              let backgroundColor = "#ffffff";
              let borderColor = "#d2d2d2";
              let textColor = "#000000";

              if (isCorrect) {
                backgroundColor = "rgba(187, 247, 208, 0.6)";
                borderColor = "#166534";
              } else if (isWrong) {
                backgroundColor = "rgba(254, 202, 202, 0.2)";
                borderColor = "#ef4444";
                textColor = "#ef4444";
              } else if (isSelected) {
                backgroundColor = "#d9effa";
                borderColor = "#3650a2";
              }

              return (
                <div
                  key={answer.id}
                  style={{ backgroundColor, borderColor, color: textColor }}
                  className="inline-flex items-center gap-3 rounded-[5px] border p-4 text-start transition-colors duration-300"
                >
                  <span
                    className={cn(
                      "text-neutrals-500 shrink-0 rounded-[5px] border border-foreground/20 px-2 py-0.5 text-sm font-medium transition-colors duration-300",
                      isCorrect && "border-green-800 bg-green-500 text-white",
                      isWrong && "border-red-500 bg-red-500 text-white",
                      isSelected && !isCorrect && !isWrong && "border-primary-300 bg-primary-300 text-white",
                    )}
                  >
                    {answer.code}
                  </span>

                  <div className="prose prose-sm max-w-none flex-1 [&_p]:my-0" style={{ color: "inherit" }}>
                    <TiptapRenderer content={answer.content} />
                  </div>

                  <div className="ml-auto flex items-center gap-3">
                    {isSelected && (
                      <span
                        className={cn(
                          "shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                          isCorrect
                            ? "border-green-200 bg-green-100 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-400"
                            : isWrong
                              ? "border-red-200 bg-red-100 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-400"
                              : "border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-400",
                        )}
                      >
                        Pilihan user
                      </span>
                    )}
                    {(isCorrect || isWrong) && (
                      <span className={cn("shrink-0", isCorrect ? "text-green-800" : "text-red-500")}>
                        {isCorrect ? <CheckIcon weight="bold" size={18} /> : <XIcon size={18} />}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
