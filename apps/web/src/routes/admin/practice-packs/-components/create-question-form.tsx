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

  const createMutation = useMutation(orpc.admin.practicePack.question.bulkCreate.mutationOptions());

  const handleSubmit = async (data: QuestionFormData) => {
    await createMutation.mutateAsync({
      practicePackId,
      content: data.content,
      discussion: data.discussion,
      isFlashcardQuestion: data.isFlashcardQuestion,
      answerOptions: data.answerOptions.map((option) => ({
        code: option.code,
        content: option.content,
        isCorrect: option.isCorrect,
      })),
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
      isSubmitting={createMutation.isPending}
      submitLabel="Create Question"
    />
  );
}
