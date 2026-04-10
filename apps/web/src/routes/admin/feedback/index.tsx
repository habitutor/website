import { ChatCircleIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type } from "arktype";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { CursorPagination } from "@/components/admin/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { orpc } from "@/utils/orpc";

const feedbackSearchSchema = type({
  "after?": "number",
  "before?": "number",
  "status?": "'open' | 'in_review' | 'resolved' | 'dismissed'",
  "category?": "'error' | 'question_bug' | 'other'",
  "priority?": "'p0' | 'p1' | 'p2' | 'p3'",
});

export const Route = createFileRoute("/admin/feedback/")({
  staticData: { breadcrumb: "Feedback" },
  component: FeedbackListPage,
  validateSearch: feedbackSearchSchema,
});

const STATUS_OPTIONS = [
  { value: undefined, label: "All" },
  { value: "open" as const, label: "Open" },
  { value: "in_review" as const, label: "In Review" },
  { value: "resolved" as const, label: "Resolved" },
  { value: "dismissed" as const, label: "Dismissed" },
];

const PRIORITY_OPTIONS = [
  { value: undefined, label: "All" },
  { value: "p0" as const, label: "P0" },
  { value: "p1" as const, label: "P1" },
  { value: "p2" as const, label: "P2" },
  { value: "p3" as const, label: "P3" },
];

function FeedbackListPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const search = Route.useSearch();
  const after = search.after ?? undefined;
  const before = search.before ?? undefined;
  const statusFilter = search.status ?? undefined;
  const priorityFilter = search.priority ?? undefined;
  const limit = 20;

  const { data, isPending } = useQuery(
    orpc.admin.feedback.list.queryOptions({
      input: {
        limit,
        after,
        before,
        status: statusFilter,
        category: search.category ?? undefined,
        priority: priorityFilter,
      },
    }),
  );

  const feedbacks = data?.data ?? [];
  const hasNext = data?.hasNext ?? false;
  const hasPrevious = data?.hasPrevious ?? false;
  const nextCursor = data?.nextCursor ?? null;
  const prevCursor = data?.prevCursor ?? null;

  const handleNext = () => {
    if (!nextCursor) return;
    navigate({
      search: (prev) => ({ ...prev, after: nextCursor, before: undefined }),
    });
  };

  const handlePrevious = () => {
    if (!prevCursor) return;
    navigate({
      search: (prev) => ({ ...prev, before: prevCursor, after: undefined }),
    });
  };

  const handleFilterChange = (filter: Partial<typeof search>) => {
    navigate({
      search: (prev) => ({ ...prev, ...filter, after: undefined, before: undefined }),
    });
  };

  return (
    <AdminContainer>
      <AdminHeader title="Feedback Reports" description="Review and manage user feedback reports" />

      <div className="mb-6 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-1 rounded-lg border p-1">
          {STATUS_OPTIONS.map((opt) => (
            <Button
              key={opt.label}
              variant={statusFilter === opt.value ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => handleFilterChange({ status: opt.value })}
            >
              {opt.label}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1 rounded-lg border p-1">
          {PRIORITY_OPTIONS.map((opt) => (
            <Button
              key={opt.label}
              variant={priorityFilter === opt.value ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => handleFilterChange({ priority: opt.value })}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      <FeedbackTable feedbacks={feedbacks} isPending={isPending} />

      <CursorPagination
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        onPrevious={handlePrevious}
        onNext={handleNext}
        isLoading={isPending}
      />
    </AdminContainer>
  );
}

function FeedbackTable({
  feedbacks,
  isPending,
}: {
  feedbacks: Array<{
    id: number;
    category: string;
    description: string;
    status: string;
    priority: string | null;
    createdAt: Date;
  }>;
  isPending: boolean;
}) {
  const navigate = useNavigate();
  if (!isPending && feedbacks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
        <ChatCircleIcon className="mb-4 size-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">No feedback found</h3>
        <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="overflow-clip rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">ID</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-24">Priority</TableHead>
            <TableHead className="w-28">Status</TableHead>
            <TableHead className="w-32">Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending ? (
            <FeedbackTableSkeleton />
          ) : (
            feedbacks.map((fb) => (
              <TableRow
                key={fb.id}
                className="group cursor-pointer"
                onClick={() => navigate({ to: "/admin/feedback/$id", params: { id: fb.id.toString() } })}
              >
                <TableCell className="font-mono text-xs">{fb.id}</TableCell>
                <TableCell>
                  <CategoryBadge category={fb.category} />
                </TableCell>
                <TableCell className="max-w-xs truncate text-sm group-hover:underline">{fb.description}</TableCell>
                <TableCell>
                  <PriorityBadge priority={fb.priority} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={fb.status} />
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(fb.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function FeedbackTableSkeleton() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        // biome-ignore lint: skeleton items don't need stable keys
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-5 w-10" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-48" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-24" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  const config: Record<string, { label: string; className: string }> = {
    error: {
      label: "Error",
      className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    },
    question_bug: {
      label: "Question Bug",
      className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    },
    other: {
      label: "Other",
      className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    },
  };

  const c = config[category] ?? config.other;

  return (
    <Badge variant="outline" className={`text-[10px] font-bold ${c.className}`}>
      {c.label}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    open: {
      label: "Open",
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    },
    in_review: {
      label: "In Review",
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    resolved: {
      label: "Resolved",
      className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    },
    dismissed: {
      label: "Dismissed",
      className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    },
  };

  const c = config[status] ?? config.open;

  return (
    <Badge variant="outline" className={`text-[10px] font-bold ${c.className}`}>
      {c.label}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: string | null }) {
  if (!priority) return <span className="text-xs text-muted-foreground">—</span>;

  const config: Record<string, { label: string; className: string }> = {
    p0: {
      label: "P0",
      className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    },
    p1: {
      label: "P1",
      className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    },
    p2: {
      label: "P2",
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    p3: {
      label: "P3",
      className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    },
  };

  const c = config[priority] ?? config.p3;

  return (
    <Badge variant="outline" className={`text-[10px] font-bold ${c.className}`}>
      {c.label}
    </Badge>
  );
}
