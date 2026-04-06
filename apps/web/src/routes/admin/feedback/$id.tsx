import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { CategoryBadge, PriorityBadge, StatusBadge } from "@/routes/admin/feedback/index";
import { TiptapRenderer } from "@/components/tiptap/renderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/feedback/$id")({
  component: FeedbackDetailPage,
});

const STATUS_OPTIONS = ["open", "in_review", "resolved", "dismissed"] as const;
const PRIORITY_OPTIONS = ["p0", "p1", "p2", "p3"] as const;

function FeedbackDetailPage() {
  const { id } = Route.useParams();
  const feedbackId = Number.parseInt(id, 10);
  const queryClient = useQueryClient();

  if (Number.isNaN(feedbackId)) throw notFound();

  const { data: feedback, isLoading } = useQuery(
    orpc.admin.feedback.find.queryOptions({
      input: { id: feedbackId },
    }),
  );

  const [status, setStatus] = useState<string | null>(null);
  const [priority, setPriority] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<string | null>(null);

  const currentStatus = status ?? feedback?.status ?? "open";
  const currentPriority = priority ?? feedback?.priority ?? null;
  const currentNotes = adminNotes !== null ? adminNotes : (feedback?.adminNotes ?? "");

  const updateMutation = useMutation(
    orpc.admin.feedback.update.mutationOptions({
      onSuccess: () => {
        toast.success("Feedback updated successfully");
        queryClient.invalidateQueries(orpc.admin.feedback.find.queryOptions({ input: { id: feedbackId } }));
        queryClient.invalidateQueries({ queryKey: orpc.admin.feedback.list.queryKey({ input: {} }) });
      },
      onError: (error) => {
        toast.error("Failed to update feedback", { description: String(error) });
      },
    }),
  );

  const handleSave = () => {
    updateMutation.mutate({
      id: feedbackId,
      status: currentStatus as (typeof STATUS_OPTIONS)[number],
      priority: currentPriority as (typeof PRIORITY_OPTIONS)[number] | undefined,
      adminNotes: currentNotes,
    });
  };

  const hasChanges =
    (status !== null && status !== feedback?.status) ||
    (priority !== null && priority !== feedback?.priority) ||
    (adminNotes !== null && adminNotes !== (feedback?.adminNotes ?? ""));

  if (isLoading) {
    return (
      <AdminContainer>
        <AdminHeader title="Feedback Detail" backTo="/admin/feedback" />
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-60 w-full rounded-lg" />
        </div>
      </AdminContainer>
    );
  }

  if (!feedback) throw notFound();

  return (
    <AdminContainer>
      <AdminHeader title="Feedback Detail" backTo="/admin/feedback" />

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <CategoryBadge category={feedback.category} />
                <StatusBadge status={currentStatus} />
                {currentPriority && <PriorityBadge priority={currentPriority} />}
                <span className="text-xs text-muted-foreground">ID: {feedback.id}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">Description</h3>
                <p className="text-sm whitespace-pre-wrap">{feedback.description}</p>
              </div>

              {feedback.path && (
                <div>
                  <h3 className="mb-1 text-sm font-medium text-muted-foreground">Page</h3>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{feedback.path}</code>
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Created: {new Date(feedback.createdAt).toLocaleString()}</span>
                <span>Reporter: {feedback.userId}</span>
                {feedback.resolvedAt && <span>Resolved: {new Date(feedback.resolvedAt).toLocaleString()}</span>}
              </div>
            </CardContent>
          </Card>

          {feedback.questionId && (
            <QuestionSection questionId={feedback.questionId} selectedAnswerId={feedback.selectedAnswerId} />
          )}
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Update Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Status</label>
              <div className="flex flex-wrap gap-1">
                {STATUS_OPTIONS.map((s) => (
                  <Button
                    key={s}
                    variant={currentStatus === s ? "secondary" : "outline"}
                    size="sm"
                    className="h-7 px-2.5 text-xs"
                    onClick={() => setStatus(s)}
                  >
                    {s.replace("_", " ")}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Priority</label>
              <div className="flex gap-1">
                {PRIORITY_OPTIONS.map((p) => (
                  <Button
                    key={p}
                    variant={currentPriority === p ? "secondary" : "outline"}
                    size="sm"
                    className="h-7 px-2.5 text-xs"
                    onClick={() => setPriority(p)}
                  >
                    {p.toUpperCase()}
                  </Button>
                ))}
                {currentPriority && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2.5 text-xs text-muted-foreground"
                    onClick={() => setPriority(null)}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Admin Notes</label>
              <Textarea
                value={currentNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add internal notes..."
                rows={4}
              />
            </div>

            <Button className="w-full" disabled={!hasChanges || updateMutation.isPending} onClick={handleSave}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminContainer>
  );
}

function QuestionSection({ questionId, selectedAnswerId }: { questionId: number; selectedAnswerId?: number | null }) {
  const { data: question, isLoading } = useQuery(
    orpc.admin.question.find.queryOptions({
      input: { id: questionId },
    }),
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Related Question</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-8 w-24" />
        </CardContent>
      </Card>
    );
  }

  if (!question) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Related Question (ID: {questionId})</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/questions/$id" params={{ id: questionId.toString() }}>
              Edit Question
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose prose-sm max-w-none">
          <TiptapRenderer content={question.content} />
        </div>

        {question.answers && question.answers.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Answer Options</h4>
            <div className="space-y-1.5">
              {question.answers.map((answer: { id: number; code: string; content: string; isCorrect: boolean }) => (
                <div
                  key={answer.id}
                  className={cn(
                    "flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
                    answer.isCorrect && "border-green-500 bg-green-50 dark:bg-green-950/30",
                    answer.id === selectedAnswerId &&
                      !answer.isCorrect &&
                      "border-red-500 bg-red-50 dark:bg-red-950/30",
                    answer.id === selectedAnswerId &&
                      answer.isCorrect &&
                      "border-green-500 bg-green-50 dark:bg-green-950/30",
                  )}
                >
                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0 text-xs",
                      answer.isCorrect && "border-green-600 text-green-600",
                      answer.id === selectedAnswerId && !answer.isCorrect && "border-red-600 text-red-600",
                    )}
                  >
                    {answer.code}
                  </Badge>
                  <div className="prose prose-sm max-w-none">
                    <TiptapRenderer content={answer.content} />
                  </div>
                  {answer.id === selectedAnswerId && (
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">User selected</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
