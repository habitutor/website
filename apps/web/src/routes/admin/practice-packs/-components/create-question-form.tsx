import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QuestionForm, type QuestionFormData } from "@/components/admin/question-form";
import { orpc } from "@/utils/orpc";

export function CreateQuestionForm({
  practicePackId,
  onSuccess,
  onCancel,
}: {
  practicePackId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const queryClient = useQueryClient();

  const createQuestionMutation = useMutation(orpc.admin.question.create.mutationOptions());
  const createAnswerMutation = useMutation(orpc.admin.question.answer.create.mutationOptions());
  const addToPackMutation = useMutation(orpc.admin.practicePack.question.add.mutationOptions());

  const isSubmitting =
    createQuestionMutation.isPending || createAnswerMutation.isPending || addToPackMutation.isPending;

  const handleSubmit = async (data: QuestionFormData) => {
    const question = await createQuestionMutation.mutateAsync({
      content: data.content,
      discussion: data.discussion,
      isFlashcardQuestion: data.isFlashcardQuestion,
    });

    await Promise.all(
      data.answerOptions.map((option) =>
        createAnswerMutation.mutateAsync({
          questionId: question.id,
          code: option.code,
          content: option.content,
          isCorrect: option.isCorrect,
        }),
      ),
    );

    await addToPackMutation.mutateAsync({
      practicePackId,
      questionId: question.id,
    });

    toast.success("Question created successfully");
    queryClient.invalidateQueries(
      orpc.admin.practicePack.question.list.queryOptions({ input: { id: practicePackId } }),
    );
    onSuccess?.();
  };

  return (
    <QuestionForm
      title="Create New Question"
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitLabel="Create Question"
    />
  );
}
