import { ArrowRightIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/utils/orpc";

export const UserProgress = () => {
  return (
    <section>
      <h2 className="mb-2 font-medium">Progres Kamu!</h2>
      <div className="grid gap-2 sm:grid-cols-5">
        <div className="col-span-2 space-y-2">
          <Material />
          <Tryout />
        </div>
        <Flashcard />
      </div>
    </section>
  );
};

const Material = () => {
  return (
    <div className="flex items-end justify-between gap-4 rounded-md bg-blue-200 p-4 text-primary">
      <div className="space-y-0.5">
        <h4 className="font-bold text-5xl">0</h4>
        <p className="font-bold">Materi Dipelajari</p>
      </div>

      <Button size="icon">
        <ArrowRightIcon />
      </Button>
    </div>
  );
};

const Tryout = () => {
  return (
    <div className="flex items-end justify-between gap-4 rounded-md bg-green-200 p-4 text-green-800">
      <div className="space-y-0.5">
        <h4 className="font-bold text-5xl">0</h4>
        <p className="font-bold">Materi Dipelajari</p>
      </div>

      <Button size="icon" variant="secondary">
        <ArrowRightIcon />
      </Button>
    </div>
  );
};

const Flashcard = () => {
  const { data, isPending } = useQuery(orpc.flashcard.streak.queryOptions());
  return (
    <div className="flex items-end justify-between gap-4 rounded-md bg-purple-900/90 p-4 text-white md:col-span-3">
      <div className="space-y-0.5">
        {!isPending ? (
          <h4 className="font-bold text-6xl">{data?.streak}</h4>
        ) : (
          <Skeleton className="h-8 w-18" />
        )}
        <p className="font-bold">Streak Flashcard</p>
      </div>

      <Button size="lg">
        Mainkan Flashcard Sekarang <ArrowRightIcon />
      </Button>
    </div>
  );
};
