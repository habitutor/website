import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { type AnswerOption, QuestionForm, type QuestionFormData } from "@/components/admin/question-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/questions/$id")({
  component: QuestionEditPage,
});

const ANSWER_CODES = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"] as const;
const CODE_ORDER = new Map<string, number>(ANSWER_CODES.map((code, i) => [code, i]));

function QuestionEditPage() {
  const { id } = Route.useParams();
  const questionId = Number.parseInt(id, 10);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: question, isLoading } = useQuery(
    orpc.admin.question.find.queryOptions({
      input: { id: questionId },
    }),
  );

  const updateQuestionMutation = useMutation(orpc.admin.question.update.mutationOptions());
  const updateAnswerMutation = useMutation(orpc.admin.question.answer.update.mutationOptions());
  const createAnswerMutation = useMutation(orpc.admin.question.answer.create.mutationOptions());
  const deleteAnswerMutation = useMutation(orpc.admin.question.answer.remove.mutationOptions());

  const isSubmitting =
    updateQuestionMutation.isPending ||
    updateAnswerMutation.isPending ||
    createAnswerMutation.isPending ||
    deleteAnswerMutation.isPending;

  const handleSubmit = async (data: QuestionFormData) => {
    await updateQuestionMutation.mutateAsync({
      id: questionId,
      content: data.content,
      discussion: data.discussion,
      isFlashcardQuestion: data.isFlashcardQuestion,
    });

    const existingAnswerIds = new Set(question?.answers.map((a) => a.id) ?? []);
    const currentAnswerIds = new Set(data.answerOptions.map((a) => a.id).filter(Boolean));

    const answersToDelete = question?.answers.filter((a) => !currentAnswerIds.has(a.id)) ?? [];
    await Promise.all(answersToDelete.map((a) => deleteAnswerMutation.mutateAsync({ id: a.id })));

    await Promise.all(
      data.answerOptions.map((option) => {
        if (option.id && existingAnswerIds.has(option.id)) {
          return updateAnswerMutation.mutateAsync({
            id: option.id,
            content: option.content,
            isCorrect: option.isCorrect,
          });
        }
        return createAnswerMutation.mutateAsync({
          questionId,
          code: option.code,
          content: option.content,
          isCorrect: option.isCorrect,
        });
      }),
    );

    toast.success("Question updated successfully");
    queryClient.invalidateQueries(orpc.admin.question.find.queryOptions({ input: { id: questionId } }));
    queryClient.invalidateQueries({ queryKey: orpc.admin.question.list.queryKey({ input: {} }) });

    setTimeout(() => {
      navigate({ to: "/admin/questions" });
    }, 500);
  };

  const handleCancel = () => {
    navigate({ to: "/admin/questions" });
  };

  const getInitialAnswerOptions = (): AnswerOption[] => {
    if (!question) return [];

    const sortedAnswers = [...question.answers].sort((a, b) => {
      const codeA = CODE_ORDER.get(a.code) ?? 0;
      const codeB = CODE_ORDER.get(b.code) ?? 0;
      return codeA - codeB;
    });

    return sortedAnswers.map((ans) => ({
      id: ans.id,
      code: ans.code,
      content: ans.content,
      isCorrect: ans.isCorrect,
    }));
  };

  if (Number.isNaN(questionId)) throw notFound();

  if (isLoading) {
    return (
      <AdminContainer>
        <AdminHeader title="Edit Question" description="Update question content and answer options" />

        <Card className="overflow-hidden rounded-xl py-0 shadow-sm">
          <CardHeader className="bg-muted/30 py-4">
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent className="space-y-8 py-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-40 w-full rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-40 w-full rounded-lg" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="size-4 rounded-sm" />
              <Skeleton className="h-4 w-36" />
            </div>
            <div className="flex gap-3 border-t pt-6">
              <Skeleton className="h-10 flex-1 rounded-md" />
              <Skeleton className="h-10 w-24 rounded-md" />
            </div>
          </CardContent>
        </Card>
      </AdminContainer>
    );
  }

  if (!question) throw notFound();

  return (
    <AdminContainer>
      <AdminHeader
        title="Edit Question"
        description="Update question content and answer options"
        backTo="/admin/questions"
      />

      <QuestionForm
        title="Question Details"
        initialData={{
          content: question.content,
          discussion: question.discussion,
          isFlashcardQuestion: question.isFlashcardQuestion,
          answerOptions: getInitialAnswerOptions(),
        }}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        submitLabel="Save Changes"
      />
    </AdminContainer>
  );
}
