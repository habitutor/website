import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { toast } from "sonner";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { QuestionForm, type QuestionFormData } from "@/components/admin/question-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/utils/orpc";
import { getInitialAnswerOptions, syncQuestionAndAnswers } from "./-question-edit-helpers";

export const Route = createFileRoute("/admin/questions/$id")({
  staticData: {
    breadcrumb: [
      { label: "Question Bank", href: "/admin/questions" },
      { label: "Edit Question", href: "" },
    ],
  },
  component: QuestionEditPage,
});

function QuestionEditPage() {
  const { id } = Route.useParams();
  const questionId = Number.parseInt(id, 10);
  const queryClient = useQueryClient();

  const { data: question, isPending } = useQuery(
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
    await syncQuestionAndAnswers({
      questionId,
      question,
      data,
      updateQuestion: () =>
        updateQuestionMutation.mutateAsync({
          id: questionId,
          content: data.content,
          discussion: data.discussion,
          isFlashcardQuestion: data.isFlashcardQuestion,
        }),
      updateAnswer: (payload) => updateAnswerMutation.mutateAsync(payload),
      createAnswer: (payload) => createAnswerMutation.mutateAsync(payload),
      deleteAnswer: (payload) => deleteAnswerMutation.mutateAsync(payload),
    });

    toast.success("Question updated successfully");
    queryClient.invalidateQueries(orpc.admin.question.find.queryOptions({ input: { id: questionId } }));
    queryClient.invalidateQueries({ queryKey: orpc.admin.question.list.queryKey({ input: {} }) });
  };

  if (Number.isNaN(questionId)) throw notFound();

  if (!isPending && !question) throw notFound();

  return (
    <AdminContainer>
      <AdminHeader
        title="Edit Question"
        description="Update question content and answer options"
        backTo="/admin/questions"
      />

      {isPending ? (
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
      ) : (
        <QuestionForm
          title="Question Details"
          initialData={{
            content: question.content,
            discussion: question.discussion,
            isFlashcardQuestion: question.isFlashcardQuestion,
            answerOptions: getInitialAnswerOptions(question),
          }}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </AdminContainer>
  );
}
