import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute(
  "/_authenticated/admin/classes/$shortName/$contentId/latihan-soal"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { contentId } = Route.useParams();
  const queryClient = useQueryClient();
  const [selectedPackId, setSelectedPackId] = useState<number | null>(null);

  const content = useQuery(
    orpc.subtest.getContentById.queryOptions({
      input: { contentId: Number(contentId) },
    })
  );

  const practicePacks = useQuery(
    orpc.admin.practicePack.listPacks.queryOptions()
  );

  const packQuestions = useQuery({
    ...orpc.admin.practicePack.getPackQuestions.queryOptions({
      input: { id: selectedPackId! },
    }),
    enabled: selectedPackId !== null,
  });

  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize selected questions from existing content
  useEffect(() => {
    if (
      content.data?.practiceQuestions &&
      "questions" in content.data.practiceQuestions &&
      !isInitialized
    ) {
      const existingQuestionIds = (
        content.data.practiceQuestions.questions as Array<{
          questionId: number;
        }>
      ).map((q) => q.questionId);
      if (existingQuestionIds.length > 0) {
        setSelectedQuestionIds(existingQuestionIds);
      }
      setIsInitialized(true);
    }
  }, [content.data, isInitialized]);

  const saveMutation = useMutation(
    orpc.admin.subtest.linkPracticeQuestions.mutationOptions({
      onSuccess: (data) => {
        toast.success(data.message);
        queryClient.invalidateQueries({
          queryKey: orpc.subtest.getContentById.queryKey({
            input: { contentId: Number(contentId) },
          }),
        });
      },
      onError: (error) => {
        toast.error(error.message || "Gagal menyimpan latihan soal");
      },
    })
  );

  const deleteMutation = useMutation(
    orpc.admin.subtest.unlinkPracticeQuestions.mutationOptions({
      onSuccess: (data) => {
        toast.success(data.message);
        queryClient.invalidateQueries({
          queryKey: orpc.subtest.getContentById.queryKey({
            input: { contentId: Number(contentId) },
          }),
        });
        setSelectedQuestionIds([]);
      },
      onError: (error) => {
        toast.error(error.message || "Gagal menghapus latihan soal");
      },
    })
  );

  const handlePackChange = (packId: number) => {
    setSelectedPackId(packId);
    setSelectedQuestionIds([]);
  };

  const handleQuestionToggle = (questionId: number) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleSave = () => {
    saveMutation.mutate({
      id: Number(contentId),
      questionIds: selectedQuestionIds,
    });
  };

  if (content.isPending) {
    return <p className="animate-pulse text-sm">Memuat latihan soal...</p>;
  }

  if (content.isError) {
    return (
      <p className="text-red-500 text-sm">Error: {content.error.message}</p>
    );
  }

  if (!content.data) return notFound();

  const hasPracticeQuestions = !!content.data.practiceQuestions;
  const existingQuestionIds =
    content.data.practiceQuestions &&
    "questions" in content.data.practiceQuestions
      ? (
          content.data.practiceQuestions.questions as Array<{
            questionId: number;
          }>
        ).map((q) => q.questionId)
      : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Edit Latihan Soal</h2>

        <div className="flex gap-4">
          <Button
            type="button"
            onClick={handleSave}
            size="sm"
            disabled={
              selectedQuestionIds.length === 0 || saveMutation.isPending
            }
          >
            {saveMutation.isPending ? "Menyimpan..." : "Simpan Latihan Soal"}
          </Button>

          {hasPracticeQuestions && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={deleteMutation.isPending}
                  size="sm"
                >
                  Hapus Latihan Soal
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Latihan Soal?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin menghapus latihan soal ini? Tindakan
                    ini tidak dapat dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      deleteMutation.mutate({ id: Number(contentId) });
                    }}
                  >
                    Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Pilih Practice Pack</Label>
          <select
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
            value={selectedPackId ?? ""}
            onChange={(e) => handlePackChange(Number(e.target.value))}
          >
            <option value="">-- Pilih Practice Pack --</option>
            {practicePacks.data?.map((pack) => (
              <option key={pack.id} value={pack.id}>
                {pack.title}
              </option>
            ))}
          </select>
        </div>

        {packQuestions.data?.questions &&
          packQuestions.data.questions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>
                  Pilih Soal (dipilih: {selectedQuestionIds.length})
                </Label>
                {packQuestions.data.questions.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const allIds = packQuestions.data.questions.map(
                          (q: { id: number }) => q.id
                        );
                        setSelectedQuestionIds(allIds);
                      }}
                    >
                      Pilih Semua
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedQuestionIds([]);
                      }}
                    >
                      Hapus Semua
                    </Button>
                  </div>
                )}
              </div>
              <div className="max-h-125 space-y-2 overflow-y-auto">
                {packQuestions.data.questions.map(
                  (question: {
                    id: number;
                    content: string;
                    answers: Array<{
                      id: number;
                      content: string;
                      isCorrect: boolean;
                    }>;
                  }) => {
                    const isLinked = existingQuestionIds.includes(question.id);
                    const isSelected = selectedQuestionIds.includes(
                      question.id
                    );
                    return (
                      <Card
                        key={question.id}
                        className={`p-4 ${
                          isLinked ? "border-2 border-primary" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() =>
                              handleQuestionToggle(question.id)
                            }
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{question.content}</p>
                              {isLinked && (
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary text-xs">
                                  Sudah Terhubung
                                </span>
                              )}
                            </div>
                            {question.answers &&
                              question.answers.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {question.answers.map(
                                    (answer: {
                                      id: number;
                                      content: string;
                                      isCorrect: boolean;
                                    }) => (
                                      <p
                                        key={answer.id}
                                        className={`text-sm ${
                                          answer.isCorrect
                                            ? "font-semibold text-green-600"
                                            : "text-muted-foreground"
                                        }`}
                                      >
                                        {answer.isCorrect ? "✓ " : "  "}
                                        {answer.content}
                                      </p>
                                    )
                                  )}
                                </div>
                              )}
                          </div>
                        </div>
                      </Card>
                    );
                  }
                )}
              </div>
            </div>
          )}

        {packQuestions.isPending && (
          <p className="text-muted-foreground text-sm">Memuat soal...</p>
        )}
      </div>
    </div>
  );
}
