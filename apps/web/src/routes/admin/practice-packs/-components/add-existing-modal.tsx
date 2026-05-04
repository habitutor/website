import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { TiptapRenderer } from "@/components/tiptap/renderer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { orpc } from "@/utils/orpc";

interface AddExistingQuestionModalProps {
  practicePackId: number;
  existingQuestionIds: number[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddExistingQuestionModal({
  practicePackId,
  existingQuestionIds,
  open,
  onOpenChange,
}: AddExistingQuestionModalProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!open) {
      setSelectedIds(new Set());
      setSearch("");
      setDebouncedSearch("");
    }
  }, [open]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } = useInfiniteQuery({
    ...orpc.admin.question.list.infiniteOptions({
      input: (pageParam: string | undefined) => ({
        limit: 20,
        after: pageParam,
        search: debouncedSearch || undefined,
      }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    }),
  });

  const addMutation = useMutation(
    orpc.admin.practicePack.question.add.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          orpc.admin.practicePack.question.list.queryOptions({
            input: { id: practicePackId },
          }),
        );
      },
    }),
  );

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementCallback = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();
      if (!hasNextPage) return;
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  const allQuestions = data?.pages.flatMap((page) => page.data) ?? [];

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkAdd = async () => {
    const ids = Array.from(selectedIds);
    try {
      await Promise.all(ids.map((questionId) => addMutation.mutateAsync({ practicePackId, questionId })));
      toast.success(`Berhasil menambahkan ${ids.length} soal`);
      onOpenChange(false);
    } catch {
      toast.error("Gagal menambahkan beberapa soal");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Tambah Soal yang Sudah Ada</DialogTitle>
          <DialogDescription>Pilih soal dari bank soal untuk ditambahkan ke pack ini.</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari soal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="max-h-[28rem] space-y-2 overflow-y-auto">
          {isPending && !data ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">Memuat soal...</div>
          ) : allQuestions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Tidak ada soal yang ditemukan. Buat soal baru terlebih dahulu.
            </div>
          ) : (
            allQuestions.map((q, i) => {
              const isExisting = existingQuestionIds.includes(q.id);
              const isLast = i === allQuestions.length - 1;

              return (
                // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-element-interactions
                <div
                  key={q.id}
                  role="option"
                  tabIndex={isExisting ? -1 : 0}
                  aria-selected={selectedIds.has(q.id)}
                  ref={isLast ? lastElementCallback : undefined}
                  className={`flex items-start gap-3 rounded-lg border p-3 ${
                    isExisting ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-muted/50"
                  }`}
                  onClick={() => !isExisting && toggleSelect(q.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (!isExisting) toggleSelect(q.id);
                    }
                  }}
                >
                  <Checkbox
                    checked={isExisting ? false : selectedIds.has(q.id)}
                    disabled={isExisting}
                    className="mt-1"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="prose prose-sm max-w-none">
                      <TiptapRenderer content={q.content} />
                    </div>
                    {isExisting && <span className="text-xs text-muted-foreground">Sudah ada di pack ini</span>}
                  </div>
                </div>
              );
            })
          )}
          {isFetchingNextPage && (
            <div className="py-4 text-center text-sm text-muted-foreground">Memuat lebih banyak...</div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleBulkAdd} disabled={selectedIds.size === 0 || addMutation.isPending}>
            {addMutation.isPending
              ? "Menambahkan..."
              : selectedIds.size > 0
                ? `Tambah ${selectedIds.size} Soal`
                : "Tambah Soal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
