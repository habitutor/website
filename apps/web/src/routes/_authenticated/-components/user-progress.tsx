import { ArrowRightIcon, EyeIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link, useRouteContext } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { Button } from "@/components/ui/button";
import { orpc } from "@/utils/orpc";

export const UserProgress = () => {
  return (
    <section className="w-full rounded-2xl border bg-neutral-100 p-4 md:p-10">
      <h2 className="mb-2 font-medium">Progres Kamu!</h2>
      <div className="grid gap-4 sm:grid-cols-5">
        <div className="space-y-4 sm:col-span-2">
          <Material />
          <Tryout />
        </div>
        <Flashcard />
      </div>
    </section>
  );
};

const Material = () => {
  const { data, isPending } = useQuery(orpc.subtest.content.stats.queryOptions());

  return (
    <div className="relative flex min-h-30 w-full items-end justify-between gap-4 overflow-clip rounded-md bg-blue-200 p-4 text-primary">
      <div className="z-10 space-y-0.5">
        <h4 className={`text-4xl font-bold sm:text-5xl ${isPending && "animate-pulse"}`}>
          {!isPending ? (data?.materialsCompleted ?? 0) : "..."}
        </h4>
        <p className="font-bold">Materi Dipelajari</p>
      </div>

      <Button size="icon" className="z-10 bg-tertiary-800" asChild>
        <Link to="/classes">
          <ArrowRightIcon weight="bold" />
        </Link>
      </Button>

      <div className="absolute -bottom-[10%] -left-[5%] z-0 aspect-square h-full rounded-full bg-blue-300" />
      <Image
        src="/avatar/profile/tupai-6.webp"
        alt=""
        width={75}
        height={75}
        className="absolute -right-[20%] -bottom-[30%] z-0 h-auto w-55 object-contain"
      />
    </div>
  );
};

const Tryout = () => {
  return (
    <div className="relative flex min-h-30 items-end justify-between gap-4 overflow-clip rounded-md bg-green-200 p-4 text-green-800">
      <div className="z-10 space-y-0.5">
        <h2 className="text-2xl font-bold">Kerjakan Tryout</h2>
      </div>

      <Button asChild size="icon" variant="default" className="z-10 bg-fourtiary-400">
        <a
          href="https://classroom.google.com/c/ODQ4OTAyNzg1Mzcz?cjc=af2t5e5j"
          rel="noopener noreferrer"
          target="_blank"
          aria-label="Visit AnyAcademy website"
        >
          <ArrowRightIcon />
        </a>
      </Button>

      <div className="absolute -bottom-[10%] -left-[5%] z-0 aspect-square h-full rounded-full bg-green-300" />
      <Image
        src="/avatar/tryout-avatar.webp"
        alt=""
        width={200}
        height={200}
        className="absolute -right-[10%] -bottom-[30%] z-0 object-contain"
      />
    </div>
  );
};

const Flashcard = () => {
  const { session } = useRouteContext({ from: "/_authenticated" });
  if (!session) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const totalScore = session.user.totalScore;

  const hasDoneToday = session.user.lastCompletedFlashcardAt?.getTime() >= today.getTime();

  return (
    <div className="relative flex items-end justify-between gap-4 overflow-clip rounded-md border border-primary-400 bg-primary-300 p-4 text-white sm:col-span-3">
      {!hasDoneToday ? (
        <div className="flex h-full flex-col justify-between">
          <div className="rounded-sm border border-red-400 bg-red-200 px-4 py-2 text-xs md:text-sm md:whitespace-nowrap">
            <p className="font-bold text-white">Streak kamu mati! yuk kejar lagi</p>
          </div>
          <div className="space-y-2">
            <div className="z-10 space-y-0.5">
              <h4 className={"text-4xl font-bold"}>{totalScore.toLocaleString("id-ID")}</h4>
              <p className="font-bold">Skor saat ini</p>
            </div>
            <div className="z-10 space-y-0.5">
              <h4 className={"text-4xl font-bold"}>{session.user.flashcardStreak}</h4>
              <p className="font-bold">Streak Brain Gym</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="z-10 space-y-0.5">
            <h4 className={"text-4xl font-bold"}>{totalScore.toLocaleString("id-ID")}</h4>
            <p className="font-bold">Skor saat ini</p>
          </div>
          <div className="z-10 space-y-0.5">
            <h4 className={"text-4xl font-bold"}>{session.user.flashcardStreak}</h4>
            <p className="font-bold">Streak Brain Gym</p>
          </div>
        </div>
      )}

      <div className="z-10 flex flex-col justify-end gap-2 md:flex-row">
        <Button
          size="lg"
          variant="darkBlue"
          className="z-10 max-sm:h-auto max-sm:py-1 max-sm:text-xs max-sm:text-wrap max-sm:has-[>svg]:px-2"
          asChild
        >
          {session.user.lastCompletedFlashcardAt?.getTime() >= today.getTime() ? (
            <Link to="/dashboard/flashcard/result">
              Lihat Hasil <EyeIcon />
            </Link>
          ) : (
            <Link to="/dashboard/flashcard">
              Mainkan Braingym <ArrowRightIcon />
            </Link>
          )}
        </Button>
      </div>

      <div className="absolute -bottom-1/2 -left-[5%] z-0 aspect-square h-full rounded-full bg-purple-200/10 sm:-bottom-[20%]" />
      <Image
        src="/avatar/brain-gym.webp"
        alt=""
        width={300}
        height={300}
        className="absolute -right-20 -bottom-[5%] z-0 object-contain md:right-0"
      />
    </div>
  );
};
