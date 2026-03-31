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
				className="absolute right-[-60px] bottom-[-100px] h-[280px] w-[280px] rounded-full border-2 border-[#FEEAAE] bg-[#FFF5D7] md:top-[500px] md:right-[900px] md:bottom-auto md:h-[649px] md:w-[649px] md:rounded-[649px]"
				style={{ rotate: "-8.997deg" }}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.1, duration: 0.3 }}
			/>
		</MotionPulse>

		{/* Lingkaran 2 */}
		<MotionPulse>
			<m.div
				className="absolute hidden rounded-[142px] border-2 border-[#FEEAAE] bg-[#FFF5D7] md:block md:h-[142px] md:w-[142px]"
				style={{ right: 1400, top: 400, rotate: "-8.997deg" }}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.2, duration: 0.3 }}
			/>
		</MotionPulse>

		{/* Lingkaran 3 */}
		<MotionPulse>
			<m.div
				className="absolute hidden rounded-[72px] border-2 border-[#FEEAAE] bg-[#FFF5D7] md:block md:h-[72px] md:w-[72px]"
				style={{ right: 1300, top: 400, rotate: "-8.997deg" }}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.3, duration: 0.3 }}
			/>
		</MotionPulse>

		{/* Lingkaran 4 */}
		<MotionPulse>
			<m.div
				className="absolute top-[16px] right-[16px] h-[40px] w-[40px] rounded-full border-2 border-[#FEEAAE] bg-[#FFF5D7] md:top-[400px] md:right-[208px] md:h-[61px] md:w-[61px] md:rounded-[62px]"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.4, duration: 0.3 }}
			/>
		</MotionPulse>

		{/* Lingkaran 5 */}
		<MotionPulse>
			<m.div
				className="absolute hidden rounded-[186px] border-2 border-[#FEEAAE] bg-[#FFF5D7] md:block md:h-[186px] md:w-[186px]"
				style={{ left: 1400, top: 400 }}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.5, duration: 0.3 }}
			/>
		</MotionPulse>

		{/* Lingkaran 6 */}
		<MotionPulse>
			<m.div
				className="absolute bottom-[-80px] left-[-60px] h-[220px] w-[220px] rounded-full border-2 border-[#FEEAAE] bg-[#FFF5D7] md:top-[500px] md:right-[86px] md:bottom-auto md:left-auto md:h-[464px] md:w-[464px] md:rounded-[464px]"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.6, duration: 0.3 }}
			/>
		</MotionPulse>

		{/* Lingkaran mobile */}
		<MotionPulse>
			<m.div
				className="absolute top-[16px] left-[16px] h-[90px] w-[90px] rounded-full border-2 border-[#FEEAAE] bg-[#FFF5D7] md:hidden"
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
		orpc.flashcard.get.queryOptions({
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
				queryClient.resetQueries({ queryKey: orpc.flashcard.get.key() });
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
	const { data: totalScoreData } = useQuery(orpc.flashcard.totalScore.queryOptions());
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
				<div className="relative h-[70px] w-full shrink-0 overflow-clip rounded-[8px] border border-[#fed65e] bg-[#fee086] sm:h-[87px] sm:w-[368px]">
					<div className="absolute top-[-28px] left-[-33px] size-[160px] sm:top-[-36px] sm:size-[209px]">
						<svg className="absolute block size-full" fill="none" viewBox="0 0 209 209">
							<circle cx="104.5" cy="104.5" fill="#FDC10E" r="104.5" />
						</svg>
					</div>
					<p className="absolute top-1/2 left-[18px] -translate-y-1/2 whitespace-nowrap font-bold text-[28px] text-white leading-none sm:left-[22px] sm:text-[45px]">
						{totalScore.toLocaleString("id-ID")}
					</p>
					<div className="absolute top-1/2 left-[120px] -translate-y-1/2 whitespace-nowrap font-medium text-[11px] text-black sm:left-[188px] sm:text-[18px]">
						<p className="mb-0 leading-[1.5]">Capaianmu Sejauh</p>
						<p className="leading-[1.5]">Ini. Teruskan!</p>
					</div>
				</div>

				{/* Streak Card */}
				<div className="relative h-[70px] w-full shrink-0 overflow-clip rounded-[8px] border border-[#fed65e] bg-[#fee086] sm:h-[87px] sm:w-[340px]">
					<div className="absolute top-[-28px] left-[-50px] size-[160px] sm:top-[-36px] sm:size-[209px]">
						<svg className="absolute block size-full" fill="none" viewBox="0 0 209 209">
							<circle cx="104.5" cy="104.5" fill="#FDC10E" r="104.5" />
						</svg>
					</div>
					<p className="absolute top-1/2 left-[18px] -translate-y-1/2 whitespace-nowrap font-bold text-[28px] text-white leading-none sm:left-[22px] sm:text-[45px]">
						{session?.user?.flashcardStreak ?? 0}
					</p>
					<div className="absolute top-1/2 left-[110px] -translate-y-1/2 whitespace-nowrap font-medium text-[11px] text-black sm:left-[174px] sm:text-[18px]">
						{(session?.user?.flashcardStreak ?? 0) > 0 ? (
							<>
								<p className="mb-0 leading-[1.5]">Streak Brain Gym</p>
								<p className="leading-[1.5]">
									Kamu! <span className="text-[#916d01]">Keren!</span>
								</p>
							</>
						) : (
							<>
								<p className="mb-0 leading-[1.5]">Streakmu Mati,</p>
								<p className="leading-[1.5]">Main Lagi Yuk!</p>
							</>
						)}
					</div>
				</div>
			</div>

			<div className="relative">
				<img
					src={(session?.user?.flashcardStreak ?? 0) > 0 ? "/decorations/image 30.png" : "/decorations/image 29.png"}
					alt=""
					className="pointer-events-none absolute top-[-148px] right-0 z-10 hidden h-[148px] w-[193px] md:block"
				/>

				{/* Blue Banner */}
				<div className="relative h-auto min-h-[160px] w-full overflow-clip rounded-[5px] border border-[#3650a2] border-solid bg-[#5a74c8] sm:h-[229px]">
					{/* background elips */}
					<div className="absolute top-[40px] left-[-40px] h-[200px] w-[200px] sm:top-[72px] sm:left-[-64px] sm:h-[312px] sm:w-[320px]">
						<svg className="absolute block size-full" fill="none" viewBox="0 0 320 312">
							<ellipse cx="160" cy="156" fill="#91A3DA" rx="160" ry="156" />
						</svg>
					</div>

					{/* Character image */}
					<div className="absolute top-[0px] left-[-20px] flex size-[160px] rotate-y-180 items-center justify-center sm:top-[-49px] sm:left-[-60px] sm:size-[339px]">
						<div className="size-full rotate-180 -scale-y-100">
							<img src="/decorations/image 26.png" alt="" className="pointer-events-none h-full w-full object-cover" />
						</div>
					</div>

					{/* texgt uji kemampuan */}
					<div className="absolute top-1/2 left-[160px] flex w-[calc(100%-170px)] -translate-y-1/2 flex-col items-start pr-2 text-[#f4faff] sm:top-[114px] sm:left-[283px] sm:w-[432px] sm:translate-y-0 sm:pr-0">
						<p className="font-bold text-[22px] leading-tight sm:text-[34px] sm:leading-[51px]">Flashcard</p>
						<p className="font-medium text-[12px] leading-snug sm:whitespace-nowrap sm:text-[18px] sm:leading-[27px]">
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
