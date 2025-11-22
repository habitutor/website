import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Label } from "@/components/ui/label";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute(
  "/_authenticated/latihan-soal/riwayat/$id",
)({
  params: {
    parse: (rawParams) => {
      const id = Number(rawParams.id);
      return { id };
    },
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();

  const history = useQuery(
    orpc.practicePack.historyByPack.queryOptions({
      input: {
        id: id,
      },
    }),
  );

  if (Number.isNaN(id)) return notFound();

  if (history.isLoading) {
    return (
      <Container className="pt-20">
        <p className="animate-pulse">Memuat detail...</p>
      </Container>
    );
  }

  if (history.isError) {
    return (
      <Container className="pt-20">
        <p className="text-red-500">Error: {history.error.message}</p>
      </Container>
    );
  }

  const correctAnswers =
    history.data?.questions.filter((q) => q.userAnswerIsCorrect).length ?? 0;
  const totalQuestions = history.data?.questions.length ?? 0;
  const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  return (
    <Container className="pt-20">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/latihan-soal/riwayat">
            <ArrowLeft />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="font-bold text-2xl">{history.data?.title}</h1>
          {history.data?.startedAt && history.data?.completedAt && (
            <p className="text-muted-foreground text-sm">
              {new Date(history.data.startedAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              -{" "}
              {new Date(history.data.completedAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
      </div>

      <Card className="mb-6 p-6">
        <h2 className="mb-4 font-semibold text-xl">Hasil</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-muted-foreground text-sm">Skor</p>
            <p className="font-bold text-3xl">{score.toFixed(0)}%</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Benar</p>
            <p className="font-bold text-green-600 text-3xl">
              {correctAnswers}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Salah</p>
            <p className="font-bold text-red-600 text-3xl">
              {totalQuestions - correctAnswers}
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        {history.data?.questions.map((q, idx) => {
          const userAnswer = q.answers.find(
            (ans) => ans.id === q.selectedAnswerId,
          );
          const correctAnswer = q.answers.find((ans) => ans.isCorrect);

          return (
            <Card key={q.id} className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <h3 className="flex-1 font-medium text-lg">
                  {idx + 1}. {q.content}
                </h3>
                {q.userAnswerIsCorrect ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
              </div>

              <div className="space-y-2">
                {q.answers.map((answer) => {
                  const isUserAnswer = answer.id === q.selectedAnswerId;
                  const isCorrectAnswer = answer.isCorrect;

                  return (
                    <Label
                      key={answer.id}
                      className={`flex cursor-default items-center gap-2 rounded border p-3 ${
                        isCorrectAnswer
                          ? "border-green-600 bg-green-50"
                          : isUserAnswer
                            ? "border-red-600 bg-red-50"
                            : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        value={answer.id}
                        checked={isUserAnswer}
                        disabled
                        className="cursor-default"
                      />
                      <span className="flex-1">{answer.content}</span>
                      {isCorrectAnswer && (
                        <span className="text-green-600 text-xs">
                          Jawaban Benar
                        </span>
                      )}
                      {isUserAnswer && !isCorrectAnswer && (
                        <span className="text-red-600 text-xs">
                          Jawaban Anda
                        </span>
                      )}
                    </Label>
                  );
                })}
              </div>

              {!q.selectedAnswerId && (
                <p className="mt-2 text-muted-foreground text-sm">
                  Tidak dijawab
                </p>
              )}
            </Card>
          );
        })}
      </div>
    </Container>
  );
}
