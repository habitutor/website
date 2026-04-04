import { ArrowLeft, CheckCircle, Lightbulb, XCircle } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { TiptapRenderer } from "@/components/tiptap/renderer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Label } from "@/components/ui/label";
import type { BodyOutputs } from "@/utils/orpc";

type HistoryDetail = NonNullable<BodyOutputs["practicePack"]["historyDetail"]>;

function QuestionCard({ question, index }: { question: HistoryDetail["questions"][number]; index: number }) {
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <span className="text-lg font-medium">{index + 1}.</span>
          <TiptapRenderer content={question.content} />
        </div>
        {question.userAnswerIsCorrect ? (
          <CheckCircle className="h-6 w-6 text-green-600" />
        ) : (
          <XCircle className="h-6 w-6 text-red-600" />
        )}
      </div>
      <div className="space-y-2">
        {question.answers.map((answer) => {
          const isUserAnswer = answer.id === question.selectedAnswerId;
          const isCorrectAnswer = answer.isCorrect;

          return (
            <Label
              key={answer.id}
              className={`flex cursor-default items-center gap-2 rounded border border-border p-3 ${
                isCorrectAnswer ? "bg-green-600" : isUserAnswer && "bg-muted text-muted-foreground"
              }`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={answer.id}
                checked={isUserAnswer}
                disabled
                className="cursor-default"
              />
              <span className="flex-1">{answer.content}</span>
              {isCorrectAnswer && <span className="text-xs text-green-500">Jawaban Benar</span>}
              {isUserAnswer && !isCorrectAnswer && <span className="text-xs text-destructive">Jawaban Anda</span>}
            </Label>
          );
        })}
      </div>
      {!question.selectedAnswerId && <p className="mt-2 text-sm text-muted-foreground">Tidak dijawab</p>}
      {Boolean(question.discussion) && (
        <div className="mt-4 rounded-lg border bg-accent p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Lightbulb className="h-4 w-4 text-amber-200" />
            Pembahasan
          </div>
          <div className="text-sm">
            <TiptapRenderer content={question.discussion} />
          </div>
        </div>
      )}
    </Card>
  );
}

export function PracticeHistoryDetailView({ history }: { history: HistoryDetail }) {
  const correctAnswers = history.questions.filter((question) => question.userAnswerIsCorrect).length;
  const totalQuestions = history.questions.length;
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
          <h1 className="text-2xl font-bold">{history.title}</h1>
          {history.startedAt && history.completedAt && (
            <p className="text-sm text-muted-foreground">
              {new Date(history.startedAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              -{" "}
              {new Date(history.completedAt).toLocaleDateString("id-ID", {
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
        <h2 className="mb-4 text-xl font-semibold">Hasil</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Skor</p>
            <p className="text-3xl font-bold">{score.toFixed(0)}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Benar</p>
            <p className="text-3xl font-bold text-green-800">{correctAnswers}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Salah</p>
            <p className="text-3xl font-bold text-red-600">{totalQuestions - correctAnswers}</p>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        {history.questions.map((question, index) => (
          <QuestionCard key={question.id} question={question} index={index} />
        ))}
      </div>
    </Container>
  );
}
