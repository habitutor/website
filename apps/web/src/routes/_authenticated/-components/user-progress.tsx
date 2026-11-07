import { ArrowRightIcon, EyeIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link, useRouteContext } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CountUp } from "@/routes/-home/motion-bits";
import { orpc } from "@/utils/orpc";
import { Accent, SectionCard } from "./section-card";

export const UserProgress = () => {
  return (
    <SectionCard
      title={
        <>
          Progres belajar <Accent>kamu</Accent>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <Flashcard />
        <Material />
        <Tryout />
      </div>
    </SectionCard>
  );
};

const Material = () => {
  const { data, isPending } = useQuery(orpc.subtest.content.stats.queryOptions());

  return (
    <Link
      to="/classes"
      className="group relative flex min-h-48 sr-lift flex-col overflow-hidden rounded-sr-lg sr-card-blue p-4 md:p-5"
    >
      <div className="pointer-events-none absolute -right-10 -bottom-12 size-36 rounded-full bg-white/10 md:size-44" />
      <p className="relative text-sm font-semibold text-white/80">Materi dipelajari</p>
      <p
        className={`relative mt-1 text-4xl font-extrabold text-sr-sun-400 md:text-5xl ${isPending ? "animate-pulse" : ""}`}
      >
        {isPending ? "–" : <CountUp to={data?.materialsCompleted ?? 0} />}
      </p>
      <span className="relative z-10 mt-auto inline-flex w-fit items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-sm font-bold text-white ring-1 ring-white/20 transition-colors group-hover:bg-white/25">
        <span className="sm:hidden">Belajar</span>
        <span className="hidden sm:inline">Lanjut belajar</span>
        <ArrowRightIcon weight="bold" className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
      <img
        src="/avatar/subtest/header.webp"
        alt=""
        className="pointer-events-none absolute right-1 bottom-0 h-20 w-auto origin-bottom object-contain transition-transform duration-500 ease-sr-spring motion-safe:group-hover:scale-110 motion-safe:group-hover:-rotate-3 md:right-3 md:h-28"
      />
    </Link>
  );
};

const Tryout = () => {
  return (
    <Link
      to="/tryout"
      className="group relative flex min-h-48 sr-lift flex-col overflow-hidden rounded-sr-lg bg-linear-to-br from-sr-ink to-sr-blue-800 p-4 text-white shadow-sr-3 md:p-5"
    >
      <div className="pointer-events-none absolute -right-10 -bottom-12 size-36 rounded-full bg-white/8 md:size-44" />
      <p className="relative text-sm font-semibold text-sr-sun-400">Try Out SNBT</p>
      <p className="relative mt-1 text-base leading-tight font-extrabold md:text-xl">Uji kemampuanmu</p>
      <span className="relative z-10 mt-auto inline-flex w-fit items-center gap-1 rounded-full bg-sr-sun-500 px-3 py-1.5 text-sm font-bold text-sr-ink shadow-sr-sun transition-colors group-hover:bg-sr-sun-400">
        Mulai <ArrowRightIcon weight="bold" className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
      <img
        src="/avatar/subtest/tka.webp"
        alt=""
        className="pointer-events-none absolute right-1 bottom-0 h-20 w-auto origin-bottom object-contain transition-transform duration-500 ease-sr-spring motion-safe:group-hover:scale-110 motion-safe:group-hover:rotate-2 md:right-3 md:h-28"
      />
    </Link>
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
    <div className="group relative col-span-2 flex min-h-56 sr-lift flex-col overflow-hidden rounded-sr-lg sr-card-sun p-5 md:p-6">
      <div className="pointer-events-none absolute -right-12 -bottom-16 size-56 rounded-full bg-white/40 md:size-64" />

      <div className="relative z-10 max-w-[60%] sm:max-w-none sm:pr-40 md:pr-48">
        <h3 className="text-2xl font-extrabold">Brain Gym</h3>
        <p className="mt-1 text-sm leading-relaxed text-sr-ink-2 md:text-base">
          {hasDoneToday
            ? "Latihan hari ini sudah beres. Lihat hasilnya, yuk!"
            : "Latihan singkat hari ini biar streak-mu nggak putus."}
        </p>
      </div>

      <div className="relative z-10 mt-5 mb-6 flex items-center gap-5">
        <div>
          <p className="text-3xl font-extrabold">
            <CountUp to={session.user.flashcardStreak} />
          </p>
          <p className="text-xs font-semibold text-sr-ink-2">hari streak</p>
        </div>
        <div className="h-10 w-px bg-sr-ink/15" />
        <div>
          <p className="text-3xl font-extrabold">
            <CountUp to={totalScore} />
          </p>
          <p className="text-xs font-semibold text-sr-ink-2">total skor</p>
        </div>
      </div>

      <Button variant="darkBlue" className="relative z-10 mt-auto w-fit rounded-full" asChild>
        {hasDoneToday ? (
          <Link to="/dashboard/flashcard/result">
            Lihat hasil <EyeIcon weight="bold" />
          </Link>
        ) : (
          <Link to="/dashboard/flashcard">
            Mulai latihan <ArrowRightIcon weight="bold" />
          </Link>
        )}
      </Button>

      <img
        src="/avatar/brain-gym.webp"
        alt=""
        className="pointer-events-none absolute right-0 bottom-0 h-40 w-auto origin-bottom translate-y-1 object-contain transition-transform duration-500 ease-sr-spring motion-safe:group-hover:scale-105 motion-safe:group-hover:-rotate-3 sm:right-4 md:h-52"
      />
    </div>
  );
};
