import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { InteractivePractice } from "@/components/classes/interactive-practice";
import { PracticeQuestionHeader } from "@/components/classes/practice";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/classes/$shortName/$contentId/latihan-soal")({
  component: RouteComponent,
});

function RouteComponent() {
  const { contentId } = Route.useParams();
  const queryClient = useQueryClient();

  const content = useQuery(
    orpc.subtest.content.find.queryOptions({
      input: { contentId: Number(contentId) },
    }),
  );

  const updateProgressMutation = useMutation(
    orpc.subtest.content.progress.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.subtest.content.stats.key(),
        });
        queryClient.invalidateQueries({ queryKey: orpc.streak.get.key() });
      },
    }),
  );

  if (content.isPending) {
    return <p className="animate-pulse text-sm">Memuat latihan soal...</p>;
  }

  if (content.isError) {
    return <p className="text-sm text-red-500">Error: {content.error.message}</p>;
  }

  if (!content.data) return notFound();

  const practiceQuestions = content.data.practiceQuestions;
  if (!practiceQuestions) {
    return (
      <div className="space-y-5">
        <p className="text-base font-semibold text-sr-blue-600">Latihan Soal</p>

        <PracticeQuestionHeader content={content.data.title} />

        <hr />

        <div className="flex flex-col items-center justify-center gap-2 text-center text-pretty">
          <Image src="/avatar/confused-avatar.webp" alt="Empty State" width={150} height={150} />
          <p>
            Ups, kontennya belum tersedia,
            <br />
            Tunggu kontennya diracik dulu ya!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-base font-semibold text-sr-blue-600">Latihan Soal Materi</p>

      <PracticeQuestionHeader content={content.data.title} />

      <hr />

      {practiceQuestions.questions.length > 0 ? (
        // Materi baru tercatat selesai setelah semua soal dijawab.
        <InteractivePractice
          key={contentId}
          contentId={Number(contentId)}
          questions={practiceQuestions.questions}
          onCompleted={() => updateProgressMutation.mutate({ id: Number(contentId), practiceQuestionsCompleted: true })}
        />
      ) : (
        <p className="text-sm text-muted-foreground">Belum ada latihan soal untuk materi ini.</p>
      )}
    </div>
  );
}
