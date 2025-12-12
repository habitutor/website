import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/dashboard/flashcard")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = useQuery(orpc.flashcard.streak.queryOptions());

  return (
    <section className="flex flex-col gap-4 rounded-md border border-accent bg-white p-6 shadow-md">
      <Button asChild className="w-fit">
        <Link to="/dashboard">
          <ArrowLeftIcon />
          Kembali
        </Link>
      </Button>

      <div className="flex rounded-md bg-yellow-200">
        <div className="bg-yellow-500 px-4 py-2 font-bold text-4xl text-white">
          {data?.streak || "0"}
        </div>
        <p className="my-auto p-4 font-medium text-xl">
          Streak Flashcard Kamu!{" "}
          {data && data?.streak > 5 && (
            <span className="font-normal">Keren!</span>
          )}
        </p>
      </div>

      <div className="flex flex-col gap-2 rounded-xs bg-blue-400 p-6 pt-20 text-white">
        <h1 className="font-bold text-3xl">Flashcard</h1>
        <p>Uji kemampuan harianmu dengan Flashcard selama 10 menit!</p>
      </div>

      <Button className="ml-auto">Mulai Sekarang</Button>
    </section>
  );
}
