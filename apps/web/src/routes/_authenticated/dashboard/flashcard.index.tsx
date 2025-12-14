import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { orpc } from "@/utils/orpc";
import { FlashcardCard } from "./-components/flashcard-card";

export const Route = createFileRoute("/_authenticated/dashboard/flashcard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const flashcard = useQuery(
    orpc.flashcard.get.queryOptions({
      retry: false,
    }),
  );

  if (flashcard.isPending) {
    return <Loader />;
  }

  if (flashcard.data?.status === "submitted")
    navigate({ to: "/dashboard/flashcard/result" });

  if (flashcard.data?.status === "not_started") {
    return <StartCard />;
  }

  return <FlashcardCard />;
}

const StartCard = () => {
  const queryClient = useQueryClient();
  const streak = useQuery(orpc.flashcard.streak.queryOptions());
  const startMutation = useMutation({
    ...orpc.flashcard.start.mutationOptions(),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: orpc.flashcard.get.key() });
    },
  });

  return (
    <section className="flex flex-col gap-4 rounded-md border bg-white p-6">
      <Button asChild className="w-fit">
        <Link to="/dashboard">
          <ArrowLeftIcon />
          Kembali
        </Link>
      </Button>

      <div className="flex rounded-md bg-yellow-200">
        <div className="min-w-32 rounded-l-md rounded-tr-full bg-yellow-500 px-4 py-2 font-bold text-4xl text-white">
          {streak.data?.streak || "0"}
        </div>
        <p className="my-auto p-4 font-medium text-xl">
          {streak.data && streak.data.streak > 0 ? (
            <>
              Streak Flashcard Kamu! <span className="font-normal">Keren!</span>
            </>
          ) : (
            <>Streak kamu mati, main lagi yuk!</>
          )}
        </p>
      </div>

      <div className="flex flex-col gap-2 rounded-xs bg-blue-400 p-6 pt-20 text-white">
        <h1 className="font-bold text-3xl">Flashcard</h1>
        <p>Uji kemampuan harianmu dengan Flashcard selama 10 menit!</p>
      </div>

      <Button
        onClick={() => {
          startMutation.mutate({});
        }}
        disabled={startMutation.isPending}
        className="ml-auto"
      >
        Mulai Sekarang
      </Button>
    </section>
  );
};
