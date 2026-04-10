import { Cards, DotsThree, Exam, MagnifyingGlass, Package, PencilSimple, Trash } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type } from "arktype";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { TiptapRenderer } from "@/components/tiptap/renderer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounceValue } from "@/hooks/timing/use-debounce-value";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

const questionsSearchSchema = type({
  "search?": "string",
  "after?": "string",
  "before?": "string",
  "flashcard?": "'true' | 'false'",
});

export const Route = createFileRoute("/admin/questions/")({
  staticData: { breadcrumb: "Questions" },
  component: QuestionsPage,
  validateSearch: questionsSearchSchema,
});

function QuestionsPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const after = Route.useSearch({ select: (s) => s.after ?? undefined });
  const before = Route.useSearch({ select: (s) => s.before ?? undefined });
  const searchParam = Route.useSearch({ select: (s) => s.search ?? "" });
  const flashcardParam = Route.useSearch({ select: (s) => s.flashcard ?? undefined });

  const [searchQuery, setSearchQuery] = useState(searchParam);
  const debouncedSearch = useDebounceValue(searchQuery, 300);
  const isFirstRender = useRef(true);
  const limit = 12;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    navigate({
      search: (prev) => ({
        ...prev,
        search: debouncedSearch || undefined,
        after: undefined,
        before: undefined,
      }),
      replace: true,
    });
  }, [debouncedSearch, navigate]);

  const handleNext = (nextAfter: string) => {
    navigate({
      search: (prev) => ({ ...prev, after: nextAfter, before: undefined }),
    });
  };

  const handlePrevious = (prevCursor: string) => {
    navigate({
      search: (prev) => ({ ...prev, before: prevCursor, after: undefined }),
    });
  };

  const handleFlashcardFilter = (value: "true" | "false" | undefined) => {
    navigate({
      search: (prev) => ({
        ...prev,
        flashcard: value,
        after: undefined,
        before: undefined,
      }),
      replace: true,
    });
  };

  const { data, isLoading } = useQuery(
    orpc.admin.question.list.queryOptions({
      input: {
        limit,
        after,
        before,
        search: searchParam,
        isFlashcardQuestion: flashcardParam === "true" ? true : flashcardParam === "false" ? false : undefined,
      },
    }),
  );

  const questions = data?.data || [];
  const hasMore = data?.hasMore || false;
  const hasPrevious = data?.hasPrevious || false;
  const nextCursor = data?.nextCursor || null;
  const prevCursor = data?.prevCursor || null;

  return (
    <AdminContainer>
      <AdminHeader title="Question Bank" description="Manage all questions across practice packs" />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <MagnifyingGlass className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border p-1">
          <Button
            variant={flashcardParam === undefined ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => handleFlashcardFilter(undefined)}
          >
            All
          </Button>
          <Button
            variant={flashcardParam === "true" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => handleFlashcardFilter("true")}
          >
            <Cards className="mr-1.5 size-3" />
            Flashcard
          </Button>
          <Button
            variant={flashcardParam === "false" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => handleFlashcardFilter("false")}
          >
            No Flashcard
          </Button>
        </div>
      </div>

      {!isLoading && (!questions || questions.length === 0) ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
          <Exam className="mb-4 size-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No questions found</h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery ? "Try adjusting your search query" : "Get started by creating questions from practice packs"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
          {isLoading
            ? Array.from({ length: 12 }, (_, i) => (
                // biome-ignore lint: skeleton items don't need stable keys
                <Skeleton key={i} className="h-52 rounded-lg" />
              ))
            : questions.map((question) => <QuestionCard key={question.id} question={question} />)}
        </div>
      )}

      {(hasPrevious || hasMore) && (
        <div className="mt-6 flex items-center justify-center gap-4 sm:mt-8">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasPrevious || isLoading}
            onClick={() => prevCursor && handlePrevious(prevCursor)}
            className="h-9 px-4"
          >
            Previous
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={!hasMore || isLoading}
            onClick={() => nextCursor && handleNext(nextCursor)}
            className="h-9 px-4"
          >
            Next
          </Button>
        </div>
      )}
    </AdminContainer>
  );
}

function QuestionCard({
  question,
}: {
  question: {
    id: number;
    content: unknown;
    discussion: unknown;
    packCount: number;
    isFlashcardQuestion: boolean;
  };
}) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const deleteMutation = useMutation(
    orpc.admin.question.remove.mutationOptions({
      onSuccess: () => {
        toast.success("Question deleted successfully");
        queryClient.invalidateQueries({
          queryKey: orpc.admin.question.list.queryKey({ input: {} }),
        });
        setDeleteDialogOpen(false);
      },
      onError: (error) => {
        toast.error("Failed to delete question", {
          description: String(error),
        });
      },
    }),
  );

  const toggleFlashcardMutation = useMutation(
    orpc.admin.question.update.mutationOptions({
      onSuccess: () => {
        toast.success(question.isFlashcardQuestion ? "Removed from flashcard" : "Added to flashcard");
        queryClient.invalidateQueries({
          queryKey: orpc.admin.question.list.queryKey({ input: {} }),
        });
      },
      onError: (error) => {
        toast.error("Failed to update flashcard status", {
          description: String(error),
        });
      },
    }),
  );

  const handleDelete = () => {
    deleteMutation.mutate({ id: question.id });
  };

  const isUnused = question.packCount === 0;

  return (
    <>
      <Card
        className={cn(
          "group relative flex flex-col overflow-hidden py-0 transition-all hover:shadow-md",
          isUnused && "border-dashed bg-muted/30",
        )}
      >
        <Link
          to="/admin/questions/$id"
          params={{ id: question.id.toString() }}
          className="flex flex-1 flex-col px-6 py-6"
        >
          <div className="mb-4 flex-1 space-y-3">
            <div className="prose prose-sm line-clamp-3 max-w-none text-foreground">
              <TiptapRenderer content={question.content} />
            </div>

            {/* Mini Discussion Preview */}
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              <span>Discussion Preview</span>
            </div>
            <div className="line-clamp-1 text-xs text-muted-foreground italic opacity-80">
              <TiptapRenderer content={question.discussion} />
            </div>
          </div>

          {/* Metadata */}
          <div className="mt-auto flex items-center gap-4 text-xs font-medium text-muted-foreground">
            <div className="flex items-center gap-1.5">
              {question.packCount > 0 ? (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  <Package className="mr-1 size-3" />
                  Used in {question.packCount} pack{question.packCount !== 1 ? "s" : ""}
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                  Unused
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {question.isFlashcardQuestion ? (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  <Cards className="mr-1 size-3" />
                  Flashcard
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                  No Flashcard
                </span>
              )}
            </div>
            <div className="font-mono text-[10px] opacity-60">ID: {question.id}</div>
          </div>
        </Link>

        <div className="absolute top-4 right-4 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 bg-background/80 backdrop-blur-sm">
                <DotsThree className="size-5" weight="bold" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() =>
                  navigate({
                    to: "/admin/questions/$id",
                    params: { id: question.id.toString() },
                  })
                }
              >
                <PencilSimple className="mr-2 size-4" />
                Edit Content
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  toggleFlashcardMutation.mutate({
                    id: question.id,
                    isFlashcardQuestion: !question.isFlashcardQuestion,
                  });
                }}
              >
                {question.isFlashcardQuestion ? (
                  <>
                    <Cards className="mr-2 size-4" />
                    Remove from Flashcard
                  </>
                ) : (
                  <>
                    <Cards className="mr-2 size-4" />
                    Add to Flashcard
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question?</AlertDialogTitle>
            <AlertDialogDescription>
              {question.packCount > 0 ? (
                <>
                  This question is currently used in{" "}
                  <span className="font-semibold">
                    {question.packCount} practice pack
                    {question.packCount !== 1 ? "s" : ""}
                  </span>
                  . Deleting it will remove it from all packs. This action cannot be undone.
                </>
              ) : (
                "This will permanently delete this question. This action cannot be undone."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
