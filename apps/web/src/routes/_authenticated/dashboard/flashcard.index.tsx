import { isDefinedError } from "@orpc/client";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate, useRouteContext } from "@tanstack/react-router";
import * as m from "motion/react-m";
import { useState } from "react";
import { toast } from "sonner";
import { create } from "zustand";
import Loader from "@/components/loader";
import { MotionPulse } from "@/components/motion/motion-components";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { orpc } from "@/utils/orpc";
import { FlashcardCard } from "./-components/flashcard-card";

export const Route = createFileRoute("/_authenticated/dashboard/flashcard/")({
  component: RouteComponent,
});

interface PageStore {
  page: number;
  next: () => void;
  reset: () => void;
}
export const useFlashcardPageStore = create<PageStore>()((set) => ({
  page: 1,
  next: () => set((state) => ({ page: state.page + 1 })),
  reset: () => set({ page: 1 }),
}));

const BackgroundCircles = () => (
  <div className="pointer-events-none fixed inset-0 z-0 hidden overflow-hidden xl:block">
    {/* Lingkaran 1 */}
    <MotionPulse>
      <m.div
        className="absolute -right-15 -bottom-25 h-70 w-70 rounded-full border-2 border-[#FEEAAE] bg-[#FFF5D7] md:top-125 md:right-225 md:bottom-auto md:h-162.25 md:w-162.25"
        style={{ rotate: "-8.997deg" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      />
    </MotionPulse>

    {/* Lingkaran 2 */}
    <MotionPulse>
      <m.div
        className="absolute hidden rounded-[142px] border-2 border-[#FEEAAE] bg-[#FFF5D7] md:block md:h-35.5 md:w-35.5"
        style={{ right: 1400, top: 400, rotate: "-8.997deg" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      />
    </MotionPulse>

    {/* Lingkaran 3 */}
    <MotionPulse>
      <m.div
        className="absolute hidden rounded-[72px] border-2 border-[#FEEAAE] bg-[#FFF5D7] md:block md:h-18 md:w-18"
        style={{ right: 1300, top: 400, rotate: "-8.997deg" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      />
    </MotionPulse>

    {/* Lingkaran 4 */}
    <MotionPulse>
      <m.div
        className="absolute top-4 right-4 h-10 w-10 rounded-full border-2 border-[#FEEAAE] bg-[#FFF5D7] md:top-100 md:right-52 md:h-15.25 md:w-15.25"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      />
    </MotionPulse>

    {/* Lingkaran 5 */}
    <MotionPulse>
      <m.div
        className="absolute hidden rounded-[186px] border-2 border-[#FEEAAE] bg-[#FFF5D7] md:block md:h-46.5 md:w-46.5"
        style={{ left: 1400, top: 400 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      />
    </MotionPulse>

    {/* Lingkaran 6 */}
    <MotionPulse>
      <m.div
        className="absolute -bottom-20 -left-15 h-55 w-55 rounded-full border-2 border-[#FEEAAE] bg-[#FFF5D7] md:top-125 md:right-21.5 md:bottom-auto md:left-auto md:h-116 md:w-116"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.3 }}
      />
    </MotionPulse>

    {/* Lingkaran mobile */}
    <MotionPulse>
      <m.div
        className="absolute top-4 left-4 h-22.5 w-22.5 rounded-full border-2 border-[#FEEAAE] bg-[#FFF5D7] md:hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      />
    </MotionPulse>
  </div>
);

function RouteComponent() {
  const { session } = useRouteContext({ from: "/_authenticated" });
  const navigate = useNavigate();
  const flashcard = useQuery(
    orpc.flashcard.session.queryOptions({
      retry: false,
    }),
  );

  const [showPremiumDialog, setShowPremiumDialog] = useState(!session?.user.isPremium);

  if (flashcard.isPending) {
    return <Loader />;
  }

  if (flashcard.data?.status === "not_started") {
    return (
      <>
        {/* Background biru untuk StartCard */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1440 848">
            <rect fill="#F4FAFF" height="848" width="1440" />
            <g>
              <path d="M1534 1515H-126V332H-5.05176L724.5 654.421L1454.05 332H1534V1515Z" fill="#D9EFFA" />
              <path
                d="M1534 1515V1517H1536V1515H1534ZM-126 1515H-128V1517H-126V1515ZM-126 332V330H-128V332H-126ZM-5.05176 332L-4.2433 330.171L-4.62951 330H-5.05176V332ZM724.5 654.421L723.692 656.25L724.5 656.608L725.308 656.25L724.5 654.421ZM1454.05 332V330H1453.63L1453.24 330.171L1454.05 332ZM1534 332H1536V330H1534V332ZM1534 1515V1513H-126V1515V1517H1534V1515ZM-126 1515H-124V332H-126H-128V1515H-126ZM-126 332V334H-5.05176V332V330H-126V332ZM-5.05176 332L-5.86021 333.829L723.692 656.25L724.5 654.421L725.308 652.592L-4.2433 330.171L-5.05176 332ZM724.5 654.421L725.308 656.25L1454.86 333.829L1454.05 332L1453.24 330.171L723.692 652.592L724.5 654.421ZM1454.05 332V334H1534V332V330H1454.05V332ZM1534 332H1532V1515H1534H1536V332H1534Z"
                fill="#B3DFF5"
              />
            </g>
          </svg>
        </div>
        <div className="relative z-10">
          <StartCard />
        </div>
        <Dialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Fitur Terbatas!</DialogTitle>
              <DialogDescription>Dengan premium, kamu bisa bermain Brain Gym sepuasnya tanpa batas!</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPremiumDialog(false)}>
                Mungkin Nanti
              </Button>
              <Button asChild>
                <Link to="/premium">Beli Premium</Link>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  if (flashcard.data?.status === "submitted") {
    navigate({ to: "/dashboard/flashcard/result" });
  }

  return (
    <div className="relative">
      <BackgroundCircles />
      <div className="relative z-10">
        <FlashcardCard />
      </div>
    </div>
  );
}

const StartCard = () => {
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
        }
      },
    }),
  );

  if (!session) navigate({ to: "/login" });
  const { data: totalScoreData } = useQuery(orpc.flashcard.score.queryOptions());
  const totalScore = totalScoreData?.totalScore ?? 0;
  return (
    <section className="flex flex-col gap-4 rounded-md border bg-white p-4 sm:p-6">
      <Button asChild className="w-fit">
        <Link to="/dashboard">
          <ArrowLeftIcon />
          Kembali
        </Link>
      </Button>

      {/* Points & Streak Cards */}
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        {/* Points Card */}
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

        {/* Streak Card */}
        <div className="relative h-17.5 w-full shrink-0 overflow-clip rounded-xl border border-secondary-400 bg-secondary-300 sm:h-21.75 sm:w-85">
          <div className="absolute -top-7 -left-12.5 size-40 sm:-top-9 sm:size-52.25">
            <svg className="absolute block size-full" fill="none" viewBox="0 0 209 209">
              <circle cx="104.5" cy="104.5" fill="#FDC10E" r="104.5" />
            </svg>
          </div>
          <p className="absolute top-1/2 left-4.5 -translate-y-1/2 text-[28px] leading-none font-bold whitespace-nowrap text-white sm:left-5.5 sm:text-[45px]">
            {session?.user?.flashcardStreak ?? 0}
          </p>
          <div className="absolute top-1/2 left-27.5 -translate-y-1/2 text-[11px] font-medium whitespace-nowrap text-black sm:left-43.5 sm:text-[18px]">
            {(session?.user?.flashcardStreak ?? 0) > 0 ? (
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
          src={(session?.user?.flashcardStreak ?? 0) > 0 ? "/decorations/image 30.png" : "/decorations/image 29.png"}
          alt=""
          className="pointer-events-none absolute -top-37 right-0 z-10 hidden h-37 w-48.25 md:block"
        />

        {/* Blue Banner */}
        <div className="relative h-auto min-h-40 w-full overflow-clip rounded-[5px] border border-solid border-primary-300 bg-primary-200 sm:h-57.25">
          {/* background elips */}
          <div className="absolute top-10 -left-10 h-50 w-50 sm:top-18 sm:-left-16 sm:h-78 sm:w-80">
            <svg className="absolute block size-full" fill="none" viewBox="0 0 320 312">
              <ellipse cx="160" cy="156" fill="#91A3DA" rx="160" ry="156" />
            </svg>
          </div>

          {/* Character image */}
          <div className="absolute top-0 -left-5 flex size-40 rotate-y-180 items-center justify-center sm:-top-12.25 sm:-left-15 sm:size-84.75">
            <div className="size-full -scale-y-100 rotate-180">
              <img src="/decorations/image 26.png" alt="" className="pointer-events-none h-full w-full object-cover" />
            </div>
          </div>

          {/* texgt uji kemampuan */}
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
};
