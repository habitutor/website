import { isDefinedError } from "@orpc/client";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouteContext } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
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

  return (
    <section className="flex flex-col gap-4 rounded-md border bg-white p-4 sm:p-6">
      <Button asChild className="w-fit">
        <Link to="/dashboard">
          <ArrowLeftIcon />
          Kembali
        </Link>
      </Button>

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <div className="relative h-17.5 w-full shrink-0 overflow-clip rounded-xl border border-secondary-400 bg-secondary-300 sm:h-21.75 sm:w-92">
          <div className="absolute -top-7 -left-8.25 size-40 sm:-top-9 sm:size-52.25">
            <svg className="absolute block size-full" fill="none" viewBox="0 0 209 209">
              <circle cx="104.5" cy="104.5" fill="#FDC10E" r="104.5" />
            </svg>
          </div>
          <p className="absolute top-1/2 left-4.5 -translate-y-1/2 text-[28px] leading-none font-bold whitespace-nowrap text-white sm:left-5.5 sm:text-[45px]">
            {totalScore.toLocaleString("id-ID")}
          </p>
          <div className="absolute top-1/2 left-30 -translate-y-1/2 text-[11px] font-medium whitespace-nowrap text-black sm:left-47 sm:text-[18px]">
            <p className="mb-0 leading-normal">Capaianmu Sejauh</p>
            <p className="leading-normal">Ini. Teruskan!</p>
          </div>
        </div>

        <div className="relative h-17.5 w-full shrink-0 overflow-clip rounded-xl border border-secondary-400 bg-secondary-300 sm:h-21.75 sm:w-85">
          <div className="absolute -top-7 -left-12.5 size-40 sm:-top-9 sm:size-52.25">
            <svg className="absolute block size-full" fill="none" viewBox="0 0 209 209">
              <circle cx="104.5" cy="104.5" fill="#FDC10E" r="104.5" />
            </svg>
          </div>
          <p className="absolute top-1/2 left-4.5 -translate-y-1/2 text-[28px] leading-none font-bold whitespace-nowrap text-white sm:left-5.5 sm:text-[45px]">
            {session.user.flashcardStreak ?? 0}
          </p>
          <div className="absolute top-1/2 left-27.5 -translate-y-1/2 text-[11px] font-medium whitespace-nowrap text-black sm:left-43.5 sm:text-[18px]">
            {(session.user.flashcardStreak ?? 0) > 0 ? (
              <>
                <p className="mb-0 leading-normal">Streak Brain Gym</p>
                <p className="leading-normal">
                  Kamu! <span className="text-secondary-900">Keren!</span>
                </p>
              </>
            ) : (
              <>
                <p className="mb-0 leading-normal">Streakmu Mati,</p>
                <p className="leading-normal">Main Lagi Yuk!</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="relative">
        <img
          src={(session.user.flashcardStreak ?? 0) > 0 ? "/decorations/image 30.png" : "/decorations/image 29.png"}
          alt=""
          className="pointer-events-none absolute -top-37 right-0 z-10 hidden h-37 w-48.25 md:block"
        />

        <div className="relative h-auto min-h-40 w-full overflow-clip rounded-[5px] border border-solid border-primary-300 bg-primary-200 sm:h-57.25">
          <div className="absolute top-10 -left-10 h-50 w-50 sm:top-18 sm:-left-16 sm:h-78 sm:w-80">
            <svg className="absolute block size-full" fill="none" viewBox="0 0 320 312">
              <ellipse cx="160" cy="156" fill="#91A3DA" rx="160" ry="156" />
            </svg>
          </div>

          <div className="absolute top-0 -left-5 flex size-40 rotate-y-180 items-center justify-center sm:-top-12.25 sm:-left-15 sm:size-84.75">
            <div className="size-full -scale-y-100 rotate-180">
              <img src="/decorations/image 26.png" alt="" className="pointer-events-none h-full w-full object-cover" />
            </div>
          </div>

          <div className="absolute top-1/2 left-40 flex w-[calc(100%-170px)] -translate-y-1/2 flex-col items-start pr-2 text-background sm:top-28.5 sm:left-70.75 sm:w-108 sm:translate-y-0 sm:pr-0">
            <p className="text-[22px] leading-tight font-bold sm:text-[34px] sm:leading-12.75">Flashcard</p>
            <p className="text-[12px] leading-snug font-medium sm:text-[18px] sm:leading-6.75 sm:whitespace-nowrap">
              Uji kemampuan harianmu dengan Flashcard selama 10 menit!
            </p>
          </div>
        </div>
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
}
