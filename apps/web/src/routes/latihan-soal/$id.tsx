import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Label } from "@/components/ui/label";
import { client, queryClient } from "@/utils/orpc";

export const Route = createFileRoute("/latihan-soal/$id")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    attemptId: Number(search.attemptId),
  }),
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { attemptId } = Route.useSearch();
  const navigate = useNavigate();
  const practicePackId = Number(id);

  const [answers, setAnswers] = useState<Record<number, number>>({});

  const pack = useQuery({
    queryKey: ["practicePack", practicePackId],
    queryFn: () => client.practicePack.getById({ id: practicePackId }),
  });

  const questions = useQuery({
    queryKey: ["practicePackQuestions", practicePackId],
    queryFn: () => client.practicePack.getQuestions({ practicePackId }),
  });

  const saveMutation = useMutation({
    mutationFn: (params: {
      attemptId: number;
      questionId: number;
      selectedAnswerId: number;
    }) => client.practicePack.saveAnswer(params),
  });

  const submitMutation = useMutation({
    mutationFn: (attemptId: number) =>
      client.practicePack.submitAttempt({ attemptId }),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["practicePack"] });
      navigate({ to: "/latihan-soal" });
    },
  });

  const handleAnswerChange = (questionId: number, answerId: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerId }));
    if (attemptId) {
      saveMutation.mutate({
        attemptId,
        questionId,
        selectedAnswerId: answerId,
      });
    }
  };

  const handleSubmit = () => {
    if (attemptId) {
      submitMutation.mutate(attemptId);
    }
  };

  if (pack.isLoading) {
    return (
      <Container className="pt-20">
        <p className="animate-pulse">Loading...</p>
      </Container>
    );
  }

  if (pack.isError) {
    return (
      <Container className="pt-20">
        <p className="text-red-500">Error: {pack.error.message}</p>
      </Container>
    );
  }

  return (
    <Container className="pt-20">
      <h1 className="mb-6 font-bold text-2xl">{pack.data?.title}</h1>

      {questions.isLoading && <p className="animate-pulse">Loading questions...</p>}

      {questions.isError && (
        <p className="text-red-500">Error: {questions.error.message}</p>
      )}

      <div className="space-y-6">
        {questions.data?.map((q, idx) => (
          <Card key={q.questionId} className="p-6">
            <h3 className="mb-4 font-medium text-lg">
              {idx + 1}. {q.content}
            </h3>
            <div className="space-y-2">
              {q.answers.map((answer) => (
                <Label
                  key={answer.id}
                  className="flex cursor-pointer items-center gap-2 rounded border p-3 hover:bg-muted"
                >
                  <input
                    type="radio"
                    name={`question-${q.questionId}`}
                    value={answer.id}
                    checked={answers[q.questionId] === answer.id}
                    onChange={() => handleAnswerChange(q.questionId, answer.id)}
                    className="cursor-pointer"
                  />
                  <span>{answer.content}</span>
                </Label>
              ))}
            </div>
          </Card>
        ))}

        {questions.data && questions.data.length > 0 && (
          <Button
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
            className="w-full"
          >
            {submitMutation.isPending ? "Submitting..." : "Submit Attempt"}
          </Button>
        )}
      </div>
    </Container>
  );
}

