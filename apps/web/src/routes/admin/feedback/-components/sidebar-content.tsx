import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowUpIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/utils/orpc";

const STATUS_OPTIONS = ["open", "in_review", "resolved", "dismissed"] as const;
const PRIORITY_OPTIONS = ["p0", "p1", "p2", "p3"] as const;

export function SidebarContent({ feedbackId }: { feedbackId: number }) {
  const queryClient = useQueryClient();
  const [adminNotes, setAdminNotes] = useState<string | null>(null);

  const { data: feedback, isPending } = useQuery(
    orpc.admin.feedback.find.queryOptions({
      input: { id: feedbackId },
    }),
  );

  const invalidateQueries = () => {
    queryClient.invalidateQueries(orpc.admin.feedback.find.queryOptions({ input: { id: feedbackId } }));
    queryClient.invalidateQueries({ queryKey: orpc.admin.feedback.list.queryKey({ input: {} }) });
  };

  const updateMutation = useMutation(
    orpc.admin.feedback.update.mutationOptions({
      onSuccess: invalidateQueries,
      onError: (error) => {
        toast.error("Failed to update feedback", { description: String(error) });
      },
    }),
  );

  const currentNotes = adminNotes ?? feedback?.adminNotes ?? "";
  const hasNotesChanged = adminNotes !== null && adminNotes !== (feedback?.adminNotes ?? "");

  return (
    <div className="space-y-6">
      {/* Status */}
      <div>
        <label className="mb-2 block text-sm font-bold text-muted-foreground">Status</label>
        {isPending ? (
          <Skeleton className="h-7 w-full" />
        ) : feedback ? (
          <div className="flex flex-wrap gap-1.5">
            {STATUS_OPTIONS.map((s) => (
              <Button
                key={s}
                variant={feedback.status === s ? "secondary" : "outline"}
                size="sm"
                className="h-7 px-3 text-xs"
                disabled={updateMutation.isPending}
                onClick={() =>
                  updateMutation.mutate({
                    id: feedbackId,
                    status: s,
                    priority: feedback.priority ?? undefined,
                    adminNotes: feedback.adminNotes ?? "",
                  })
                }
              >
                {s.replace("_", " ")}
              </Button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Priority */}
      <div>
        <label className="mb-2 block text-sm font-bold text-muted-foreground">Priority</label>
        {isPending ? (
          <Skeleton className="h-7 w-full" />
        ) : feedback ? (
          <div className="flex flex-wrap gap-1.5">
            {PRIORITY_OPTIONS.map((p) => (
              <Button
                key={p}
                variant={feedback.priority === p ? "secondary" : "outline"}
                size="sm"
                className="h-7 px-3 text-xs"
                disabled={updateMutation.isPending}
                onClick={() =>
                  updateMutation.mutate({
                    id: feedbackId,
                    status: feedback.status,
                    priority: p,
                    adminNotes: feedback.adminNotes ?? "",
                  })
                }
              >
                {p.toUpperCase()}
              </Button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Admin Notes */}
      <div>
        <label className="mb-2 block text-sm font-bold text-muted-foreground">Admin Notes</label>
        {isPending ? (
          <Skeleton className="h-20 w-full" />
        ) : feedback ? (
          <InputGroup className="bg-white">
            <InputGroupTextarea
              placeholder="Add internal notes..."
              value={currentNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />
            <InputGroupAddon align="block-end">
              <InputGroupButton
                variant="default"
                size="icon-sm"
                disabled={!hasNotesChanged || updateMutation.isPending}
                className="ml-auto"
                onClick={() => {
                  updateMutation.mutate(
                    {
                      id: feedbackId,
                      adminNotes: currentNotes,
                    },
                    {
                      onSuccess: () => setAdminNotes(null),
                    },
                  );
                }}
              >
                <ArrowUpIcon />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        ) : null}
      </div>

      <Separator />

      {/* Details */}
      <div>
        <label className="mb-2 block text-sm font-bold text-muted-foreground">Details</label>
        {isPending ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : feedback ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID</span>
              <span className="font-mono text-xs">{feedback.id}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Reporter</span>
              <span className="truncate font-mono text-xs">{feedback.userId}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Created</span>
              <span>
                {new Date(feedback.createdAt).toLocaleDateString(undefined, {
                  dateStyle: "medium",
                })}
              </span>
            </div>
            {feedback.resolvedAt && (
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Resolved</span>
                <span>
                  {new Date(feedback.resolvedAt).toLocaleDateString(undefined, {
                    dateStyle: "medium",
                  })}
                </span>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
