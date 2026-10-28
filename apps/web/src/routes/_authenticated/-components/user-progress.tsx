import { ArrowRightIcon, EyeIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link, useRouteContext } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { Button } from "@/components/ui/button";
import { CountUp, TiltCard } from "@/routes/-home/motion-bits";
import { orpc } from "@/utils/orpc";
import { SectionCard } from "./section-card";

export const UserProgress = () => {
  return (
    <SectionCard title="Progres Kamu!">
      <div className="grid gap-4 sm:grid-cols-5">
        <div className="space-y-4 sm:col-span-2">
          <Material />
          <Tryout />
        </div>
        <Flashcard />
      </div>
    </SectionCard>
  );
};

const Material = () => {
  const { data, isPending } = useQuery(orpc.subtest.content.stats.queryOptions());

  return (
    <div className="relative flex min-h-30 w-full sr-lift items-end justify-between gap-4 overflow-clip rounded-sr-md bg-linear-to-br from-sr-blue-100 to-sr-blue-200 p-4 text-sr-ink shadow-sr-1">
      <div className="z-10 space-y-0.5">
        <h4 className={`text-4xl font-extrabold sm:text-5xl ${isPending && "animate-pulse"}`}>
          {!isPending ? <CountUp to={data?.materialsCompleted ?? 0} /> : "..."}
        </h4>
        <p className="font-bold">Materi Dipelajari</p>
      </div>

      <Button size="icon" variant="darkBlue" className="z-10" asChild>
        <Link to="/classes" aria-label="Buka kelas">
          <ArrowRightIcon weight="bold" />
        </Link>
      </Button>

      <div className="absolute -bottom-[10%] -left-[5%] z-0 aspect-square h-full rounded-full bg-white/40" />
      <Image
        src="/avatar/profile/tupai-6.webp"
        alt=""
        width={75}
        height={75}
        className="absolute -right-[20%] -bottom-[30%] z-0 h-auto w-55 animate-sr-drift object-contain"
      />
    </div>
  );
};

const Tryout = () => {
  return (
    <div className="relative flex min-h-30 sr-lift items-end justify-between gap-4 overflow-clip rounded-sr-md sr-card-sun p-4">
      <div className="z-10 space-y-0.5">
        <h2 className="text-2xl font-extrabold">Kerjakan Tryout</h2>
      </div>

      <Button asChild size="icon" variant="darkBlue" className="z-10">
        <Link to="/tryout" aria-label="Kerjakan Tryout">
          <ArrowRightIcon />
        </Link>
      </Button>

      <div className="absolute -bottom-[10%] -left-[5%] z-0 aspect-square h-full rounded-full bg-white/35" />
      <Image
        src="/avatar/tryout-avatar.webp"
        alt=""
        width={200}
        height={200}
        className="absolute -right-[10%] -bottom-[30%] z-0 animate-sr-drift object-contain"
      />
    </div>
  );
};

const Flashcard = () => {
  const { session } = useRouteContext({ from: "/_authenticated" });
  const { data: totalScoreData } = useQuery(orpc.flashcard.score.queryOptions());
  if (!session) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const hasDoneToday = session.user.lastCompletedFlashcardAt?.getTime() >= today.getTime();
  const totalScore = totalScoreData?.totalScore ?? 0;

  return (
    <TiltCard
      maxTilt={4}
      className="relative flex items-end justify-between gap-4 overflow-clip rounded-sr-md sr-card-blue p-4 text-white sm:col-span-3"
    >
      {!hasDoneToday ? (
        <div className="flex h-full flex-col justify-between">
          <div className="rounded-sr-xs border border-sr-orange-200 bg-sr-orange-100 px-4 py-2 text-xs md:text-sm md:whitespace-nowrap">
            <p className="font-bold text-sr-orange-700">Streak kamu mati! yuk kejar lagi</p>
          </div>
          <div className="space-y-2">
            <div className="z-10 space-y-0.5">
              <h4 className={"text-4xl font-extrabold"}>
                <CountUp to={totalScore} />
              </h4>
              <p className="font-bold">Skor saat ini</p>
            </div>
            <div className="z-10 space-y-0.5">
              <h4 className={"text-4xl font-extrabold"}>
                <CountUp to={session.user.flashcardStreak} />
              </h4>
              <p className="font-bold">Streak Brain Gym</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="z-10 space-y-0.5">
            <h4 className={"text-4xl font-extrabold"}>
              <CountUp to={totalScore} />
            </h4>
            <p className="font-bold">Skor saat ini</p>
          </div>
          <div className="z-10 space-y-0.5">
            <h4 className={"text-4xl font-extrabold"}>
              <CountUp to={session.user.flashcardStreak} />
            </h4>
            <p className="font-bold">Streak Brain Gym</p>
          </div>
        </div>
      )}

      <div className="z-10 flex flex-col justify-end gap-2 md:flex-row">
        <Button
          size="lg"
          variant="secondary"
          className="sr-sheen z-10 max-sm:h-auto max-sm:py-1 max-sm:text-xs max-sm:text-wrap max-sm:has-[>svg]:px-2"
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

      <div className="absolute -bottom-1/2 -left-[5%] z-0 aspect-square h-full rounded-full bg-white/10 sm:-bottom-[20%]" />
      <Image
        src="/avatar/brain-gym.webp"
        alt=""
        width={300}
        height={300}
        className="absolute -right-20 -bottom-[5%] z-0 animate-sr-drift object-contain md:right-0"
      />
    </TiltCard>
  );
};
