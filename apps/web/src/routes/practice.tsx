import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/practice")({
  component: RouteComponent,
});

function PackQuestions({ packId }: { packId: number }) {
  const questions = useQuery(
    orpc.practicePack.getQuestions.queryOptions({
      input: { practicePackId: packId },
    }),
  );

  if (questions.isLoading) {
    return (
      <p className="text-muted-foreground text-sm">Loading questions...</p>
    );
  }

  if (questions.isError) {
    return (
      <p className="text-red-500 text-sm">Error: {questions.error.message}</p>
    );
  }

  if (!questions.data || questions.data.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No questions in this pack yet
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="font-medium text-sm">
        Questions ({questions.data.length}):
      </p>
      {questions.data.map((q: any) => (
        <Card key={q.id} className="p-3">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="font-medium text-sm">{q.content}</p>
              </div>
              <span className="rounded bg-muted px-2 py-1 text-xs">
                {q.type === "mcq" ? "MCQ" : "Essay"}
              </span>
            </div>
            {q.type === "mcq" && q.answers && (
              <div className="space-y-1 pl-4">
                {q.answers.map((ans: any) => (
                  <div key={ans.id} className="flex items-center gap-2 text-sm">
                    <span
                      className={
                        ans.isCorrect
                          ? "font-medium text-green-600"
                          : "text-muted-foreground"
                      }
                    >
                      {ans.isCorrect ? "✓" : "○"}
                    </span>
                    <span>{ans.content}</span>
                  </div>
                ))}
              </div>
            )}
            {q.type === "essay" && q.answer && (
              <div className="pl-4">
                <p className="text-muted-foreground text-sm">
                  Correct:{" "}
                  <span className="font-medium text-green-600">
                    {q.answer.correctAnswer}
                  </span>
                </p>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

function RouteComponent() {
  const [showCreatePackModal, setShowCreatePackModal] = useState(false);
  const [expandedPacks, setExpandedPacks] = useState<Record<number, boolean>>(
    {},
  );

  const [title, setTitle] = useState("");

  const packs = useQuery(orpc.practicePack.list.queryOptions());

  const createPack = useMutation(
    orpc.practicePack.create.mutationOptions({
      onSuccess: () => {
        toast.success("Pack created!");
        setTitle("");
        setShowCreatePackModal(false);
        packs.refetch();
      },
      onError: (error) => {
        toast.error(`Failed: ${error.message}`);
      },
    }),
  );


  const handleCreatePack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title required");
      return;
    }
    createPack.mutate({ title });
  };

  const togglePackCollapse = (packId: number) => {
    setExpandedPacks((prev) => ({ ...prev, [packId]: !prev[packId] }));
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-2 pt-20">
      <h1 className="mb-6 font-bold text-2xl">Latihan Soal</h1>

      {/* Practice Packs */}
      <div className="space-y-4">
        <div className="flex justify-between">
          <h2 className="font-medium text-lg">Practice Packs</h2>
          <Button onClick={() => setShowCreatePackModal(true)}>
            + Create Pack
          </Button>
        </div>

        {packs.isLoading && <p>Loading...</p>}
        {packs.isError && (
          <p className="text-red-500">Error: {packs.error.message}</p>
        )}
        {packs.data && packs.data.length === 0 && (
          <p className="text-muted-foreground">No packs yet</p>
        )}

        {packs.data?.map((pack) => (
          <Card key={pack.id} className="p-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="flex-1 cursor-pointer text-left"
                onClick={() => togglePackCollapse(pack.id)}
              >
                <h3 className="font-medium text-lg">{pack.title}</h3>
                <p className="text-muted-foreground text-sm">
                  ID: {pack.id} • Click to{" "}
                  {expandedPacks[pack.id] ? "collapse" : "expand"}
                </p>
              </button>
            </div>
            {expandedPacks[pack.id] && (
              <div className="mt-4 border-t pt-4">
                <PackQuestions packId={pack.id} />
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Modal: Create Pack */}
      {showCreatePackModal && (
        <div
          role="button"
          tabIndex={0}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowCreatePackModal(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape" || e.key === "Enter") {
              setShowCreatePackModal(false);
            }
          }}
        >
          <Card
            className="w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 font-medium text-lg">Create Practice Pack</h3>
            <form onSubmit={handleCreatePack} className="space-y-4">
              <div>
                <Label htmlFor="pack-title">Title</Label>
                <Input
                  id="pack-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter pack title"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createPack.isPending}>
                  {createPack.isPending ? "Creating..." : "Create"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreatePackModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
