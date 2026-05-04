import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useDebounceValue } from "@/hooks/timing/use-debounce-value";
import { orpc } from "@/utils/orpc";
import {
  type ExistingQuestion,
  type PackQuestion,
  PracticeQuestionLinkingView,
  type PracticePackOption,
} from "./-$contentId.latihan-soal-view";

export const Route = createFileRoute("/admin/classes/$shortName/$contentId/latihan-soal")({
  component: RouteComponent,
});

function RouteComponent() {
  const { contentId } = Route.useParams();
  const parsedContentId = Number(contentId);
  const queryClient = useQueryClient();
  const [selectedPackId, setSelectedPackId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debouncedSearch = useDebounceValue(searchQuery, 300);

  const content = useQuery(
    orpc.subtest.content.find.queryOptions({
      input: { contentId: parsedContentId },
    }),
  );

  const practicePacks = useQuery(
    orpc.admin.practicePack.list.queryOptions({
      input: {
        limit: 50,
        offset: 0,
        search: debouncedSearch,
      },
    }),
  );

  const packQuestions = useQuery(
    orpc.admin.practicePack.question.list.queryOptions({
      input: { id: selectedPackId ?? 0 },
      enabled: selectedPackId !== null,
    }),
  );

  useEffect(() => {
    if (content.data?.practiceQuestions && "questions" in content.data.practiceQuestions && !isInitialized) {
      const existingQuestionIds = (
        content.data.practiceQuestions.questions as Array<{
          questionId: number;
        }>
      ).map((question) => question.questionId);
      if (existingQuestionIds.length > 0) {
        setSelectedQuestionIds(existingQuestionIds);
      }
      setIsInitialized(true);
    }
  }, [content.data, isInitialized]);

  const saveMutation = useMutation(
    orpc.admin.subtest.content.question.link.mutationOptions({
      onSuccess: (data) => {
        toast.success(data.message);
        queryClient.invalidateQueries({
          queryKey: orpc.subtest.content.find.queryKey({
            input: { contentId: parsedContentId },
          }),
        });
      },
      onError: (error) => {
        toast.error(error.message || "Gagal menyimpan latihan soal");
      },
    }),
  );

  const deleteMutation = useMutation(
    orpc.admin.subtest.content.question.unlink.mutationOptions({
      onSuccess: (data) => {
        toast.success(data.message);
        queryClient.invalidateQueries({
          queryKey: orpc.subtest.content.find.queryKey({
            input: { contentId: parsedContentId },
          }),
        });
        setSelectedQuestionIds([]);
      },
      onError: (error) => {
        toast.error(error.message || "Gagal menghapus latihan soal");
      },
    }),
  );

  const existingQuestions: ExistingQuestion[] =
    content.data?.practiceQuestions && "questions" in content.data.practiceQuestions
      ? (content.data.practiceQuestions.questions as ExistingQuestion[])
      : [];
  const existingQuestionIds = existingQuestions.map((question) => question.questionId);
  const selectedPack = practicePacks.data?.data.find((pack: PracticePackOption) => pack.id === selectedPackId);
  const packQuestionList = packQuestions.data?.questions as PackQuestion[] | undefined;

  const handlePackSelect = (packId: number) => {
    setSelectedPackId(packId);
    setDropdownOpen(false);
    setSearchQuery("");

    const currentSelected = selectedQuestionIds.filter((id) => existingQuestionIds.includes(id));
    setSelectedQuestionIds(currentSelected);
  };

  const handleQuestionToggle = (questionId: number) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId],
    );
  };

  const handleSave = () => {
    saveMutation.mutate({
      id: parsedContentId,
      questionIds: selectedQuestionIds,
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate({ id: parsedContentId });
  };

  const handleSelectAllPackQuestions = () => {
    const allIds = (packQuestionList ?? []).map((question) => question.id);
    setSelectedQuestionIds((prev) => [...new Set([...prev, ...allIds])]);
  };

  const handleClearPackQuestions = () => {
    const packQuestionIds = (packQuestionList ?? []).map((question) => question.id);
    setSelectedQuestionIds((prev) => prev.filter((id) => !packQuestionIds.includes(id)));
  };

  if (content.isPending) {
    return <p className="animate-pulse text-sm">Memuat latihan soal...</p>;
  }

  if (content.isError) {
    return <p className="text-sm text-red-500">Error: {content.error.message}</p>;
  }

  if (!content.data || Number.isNaN(parsedContentId)) return notFound();

  return (
    <PracticeQuestionLinkingView
      hasPracticeQuestions={Boolean(content.data.practiceQuestions)}
      existingQuestions={existingQuestions}
      existingQuestionIds={existingQuestionIds}
      selectedQuestionIds={selectedQuestionIds}
      selectedPackId={selectedPackId}
      selectedPack={selectedPack}
      searchQuery={searchQuery}
      dropdownOpen={dropdownOpen}
      searchInputRef={searchInputRef}
      practicePacksPending={practicePacks.isPending}
      practicePacks={(practicePacks.data?.data as PracticePackOption[]) ?? []}
      packQuestionsPending={packQuestions.isPending}
      packQuestions={packQuestionList}
      savePending={saveMutation.isPending}
      deletePending={deleteMutation.isPending}
      onSave={handleSave}
      onDelete={handleDelete}
      onQuestionToggle={handleQuestionToggle}
      onPackSelect={handlePackSelect}
      onSearchQueryChange={setSearchQuery}
      onDropdownOpenChange={setDropdownOpen}
      onSelectAllPackQuestions={handleSelectAllPackQuestions}
      onClearPackQuestions={handleClearPackQuestions}
    />
  );
}
