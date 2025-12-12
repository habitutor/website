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
    <section className="space-y-4 rounded-md border border-accent bg-white p-6 shadow-md">
      <Button asChild>
        <Link to="/dashboard">
          <ArrowLeftIcon />
          Kembali
        </Link>
      </Button>

      <div className="bg-yellow-200 p-4 font-medium">
        {data?.streak || "0"}
        Streak Flashcard Kamu! <span className="text-secondary">Keren!</span>
      </div>

      <Button>Mulai Sekarang</Button>
    </section>
  );
}
