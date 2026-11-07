import { isDefinedError } from "@orpc/client";
import { ArrowRightIcon, LightningIcon, TrophyIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { BackButton } from "@/components/navigation/back-button";
import { StreakFlame } from "@/components/streak/streak-flame";
import { Button } from "@/components/ui/button";
import { orpc } from "@/utils/orpc";

export function FlashcardStartCard() {
  const queryClient = useQueryClient();
  const { session } = useRouteContext({ from: "/_authenticated" });
  const navigate = useNavigate();
  const startMutation = useMutation(
    orpc.flashcard.start.mutationOptions({
      onSuccess: () => {
        queryClient.resetQueries({ queryKey: orpc.flashcard.session.key() });
        navigate({ to: "/dashboard/flashcard/intro" });
      },
      onError: (error) => {
        if (isDefinedError(error) && error.code === "NOT_FOUND") {
          toast.error("Ups! Kamu sudah mengerjakan semua Brain Gym yang tersedia!", {
            description: "Silahkan coba lagi dalam beberapa saat.",
          });
        } else if (isDefinedError(error) && error.code === "UNPROCESSABLE_CONTENT") {
          toast.error(error.message || "Permintaan tidak dapat diproses.");
        }
      },
    }),
  );
  const { data: totalScoreData } = useQuery(orpc.flashcard.score.queryOptions());
  const totalScore = totalScoreData?.totalScore ?? 0;

  useEffect(() => {
    if (!session) {
      navigate({ to: "/login" });
    }
  }, [session, navigate]);

  if (!session) {
    return null;
  }

  const streak = session.user.flashcardStreak ?? 0;

  return (
    <section className="flex flex-col gap-5">
      <BackButton to="/dashboard" className="w-fit" />

      {/* Di HP maskot mengintip dari bawah teks; mulai sm duduk di kanan, sama seperti header halaman lain. */}
      <div className="relative overflow-hidden rounded-sr-xl sr-card-sun px-5 pt-6 pb-40 sm:px-8 sm:py-9 sm:pr-72 lg:px-10 lg:py-11 lg:pr-96">
        <div className="pointer-events-none absolute -top-24 -right-20 size-72 rounded-full bg-white/30" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 size-40 rounded-full bg-white/20" />

        <span className="relative inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-sr-ink">
          <LightningIcon weight="fill" className="size-4 text-sr-orange-500" /> Latihan otak harian
        </span>
        <h1 className="relative mt-3 text-[28px] leading-tight font-extrabold text-sr-ink sm:text-4xl">Brain Gym</h1>
        <p className="relative mt-2 max-w-md text-sm leading-relaxed text-sr-ink-2 sm:text-base">
          Uji kemampuan harianmu dengan flashcard selama 10 menit. Jawab sebanyak mungkin dan jaga streak-mu!
        </p>
        <Button
          size="lg"
          variant="darkBlue"
          className="relative mt-5 rounded-full"
          onClick={() => {
            startMutation.mutate({});
          }}
          disabled={startMutation.isPending}
        >
          {startMutation.isPending ? "Menyiapkan..." : "Mulai Sekarang"} <ArrowRightIcon weight="bold" />
        </Button>

        <img
          src="/avatar/subtest/hab.webp"
          alt=""
          className="pointer-events-none absolute right-1/2 bottom-0 h-36 w-auto translate-x-1/2 select-none motion-safe:animate-[sr-rise_0.8s_var(--ease-sr-spring)_0.15s_backwards] sm:right-12 sm:h-52 sm:translate-x-0 lg:right-20 lg:h-60"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div className="flex flex-col gap-3 rounded-sr-xl border border-sr-line bg-white p-4 shadow-sr-1 sm:flex-row sm:items-center sm:p-5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sr-sun-100 text-sr-amber-700">
            <TrophyIcon weight="fill" className="size-6" />
          </span>
          <div className="min-w-0">
            <p className="text-3xl leading-none font-extrabold text-sr-ink tabular-nums">
              {totalScore.toLocaleString("id-ID")}
            </p>
            <p className="mt-1 text-sm font-bold text-sr-ink">Total skor</p>
            <p className="text-xs text-sr-muted">Capaianmu sejauh ini. Teruskan!</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 rounded-sr-xl border border-sr-line bg-white p-4 shadow-sr-1 sm:flex-row sm:items-center sm:p-5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sr-blue-50">
            <StreakFlame tone="brain" lit={streak > 0} animated={false} className="h-7 w-6" />
          </span>
          <div className="min-w-0">
            <p className="text-3xl leading-none font-extrabold text-sr-ink tabular-nums">{streak}</p>
            <p className="mt-1 text-sm font-bold text-sr-ink">Hari streak</p>
            <p className="text-xs text-sr-muted">
              {streak > 0 ? "Keren, pertahankan ya!" : "Streak-mu putus, main lagi yuk!"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
