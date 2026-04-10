import { useQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { SlidersHorizontalIcon } from "@phosphor-icons/react";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { CategoryBadge, PriorityBadge, StatusBadge } from "@/routes/admin/feedback/index";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/utils/orpc";
import { QuestionSection } from "./-components/question-section";
import { SidebarContent } from "./-components/sidebar-content";

export const Route = createFileRoute("/admin/feedback/$id")({
  staticData: {
    breadcrumb: [
      { label: "Feedback", href: "/admin/feedback" },
      { label: "Feedback Detail", href: "" },
    ],
  },
  component: FeedbackDetailPage,
});

function FeedbackDetailPage() {
  const { id } = Route.useParams();
  const feedbackId = Number.parseInt(id, 10);

  if (Number.isNaN(feedbackId)) throw notFound();

  const { data: feedback, isPending } = useQuery(
    orpc.admin.feedback.find.queryOptions({
      input: { id: feedbackId },
    }),
  );

  if (!isPending && !feedback) throw notFound();

  return (
    <AdminContainer>
      <AdminHeader title="Feedback Detail" backTo="/admin/feedback">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="lg:hidden">
              <SlidersHorizontalIcon className="mr-2 size-4" />
              Manage
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-sm">
            <SheetHeader>
              <SheetTitle>Manage Feedback</SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto px-4 py-4 pb-8">
              <SidebarContent feedbackId={feedbackId} />
            </div>
          </SheetContent>
        </Sheet>
      </AdminHeader>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="min-w-0 flex-1">
          <div className="space-y-6 pb-6">
            {/* Header */}
            <div className="space-y-3">
              {isPending ? (
                <Skeleton className="h-6 w-32" />
              ) : (
                <h2 className="text-lg font-semibold">FB-{feedback!.id}</h2>
              )}
              {isPending ? (
                <Skeleton className="h-4 w-48" />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {new Date(feedback!.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
              {isPending ? (
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <CategoryBadge category={feedback!.category} />
                  <StatusBadge status={feedback!.status} />
                  {feedback!.priority && <PriorityBadge priority={feedback!.priority} />}
                </div>
              )}
            </div>

            {isPending ? <Skeleton className="h-px w-full" /> : <Separator />}

            {/* Description */}
            {isPending ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{feedback!.description}</p>
              </div>
            )}

            {/* Page path */}
            {isPending ? (
              <>
                <Skeleton className="h-px w-full" />
                <Skeleton className="h-10 w-48" />
              </>
            ) : (
              feedback!.path && (
                <>
                  <Separator />
                  <div>
                    <h3 className="mb-2 text-sm font-bold text-muted-foreground">Page</h3>
                    <code className="rounded bg-muted px-2 py-1 text-xs">{feedback!.path}</code>
                  </div>
                </>
              )
            )}

            {isPending ? <Skeleton className="h-px w-full" /> : <Separator />}

            {/* Related Question */}
            {isPending ? (
              <Skeleton className="h-60 w-full rounded-lg" />
            ) : (
              feedback!.questionId && (
                <QuestionSection questionId={feedback!.questionId} selectedAnswerId={feedback!.selectedAnswerId} />
              )
            )}
          </div>
        </div>

        {/* Right Sidebar - Desktop Only */}
        <div className="hidden w-80 shrink-0 lg:block">
          <SidebarContent feedbackId={feedbackId} />
        </div>
      </div>
    </AdminContainer>
  );
}
