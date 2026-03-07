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
	<div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
		{/* Lingkaran 1 */}
		<MotionPulse>
			<m.div
				className="absolute border-[#FEEAAE] border-2 bg-[#FFF5D7] rounded-full
          w-[280px] h-[280px] bottom-[-100px] right-[-60px]
          md:w-[649px] md:h-[649px] md:rounded-[649px] md:bottom-auto md:top-[500px] md:right-[900px]"
				style={{ rotate: "-8.997deg" }}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.1, duration: 0.3 }}
			/>
		</MotionPulse>

		{/* Lingkaran 2 */}
		<MotionPulse>
			<m.div
				className="absolute border-[#FEEAAE] border-2 bg-[#FFF5D7] rounded-[142px]
          hidden md:block md:w-[142px] md:h-[142px]"
				style={{ right: 1400, top: 400, rotate: "-8.997deg" }}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.2, duration: 0.3 }}
			/>
		</MotionPulse>

		{/* Lingkaran 3 */}
		<MotionPulse>
			<m.div
				className="absolute border-[#FEEAAE] border-2 bg-[#FFF5D7] rounded-[72px]
          hidden md:block md:w-[72px] md:h-[72px]"
				style={{ right: 1300, top: 400, rotate: "-8.997deg" }}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.3, duration: 0.3 }}
			/>
		</MotionPulse>

		{/* Lingkaran 4 */}
		<MotionPulse>
			<m.div
				className="absolute border-[#FEEAAE] border-2 bg-[#FFF5D7] rounded-full
          w-[40px] h-[40px] top-[16px] right-[16px]
          md:w-[61px] md:h-[61px] md:rounded-[62px] md:top-[400px] md:right-[208px]"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.4, duration: 0.3 }}
			/>
		</MotionPulse>

		{/* Lingkaran 5 */}
		<MotionPulse>
			<m.div
				className="absolute border-[#FEEAAE] border-2 bg-[#FFF5D7] rounded-[186px]
          hidden md:block md:w-[186px] md:h-[186px]"
				style={{ left: 1400, top: 400 }}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.5, duration: 0.3 }}
			/>
		</MotionPulse>

		{/* Lingkaran 6 */}
		<MotionPulse>
			<m.div
				className="absolute border-[#FEEAAE] border-2 bg-[#FFF5D7] rounded-full
          w-[220px] h-[220px] bottom-[-80px] left-[-60px]
          md:w-[464px] md:h-[464px] md:rounded-[464px] md:bottom-auto md:left-auto md:top-[500px] md:right-[86px]"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.6, duration: 0.3 }}
			/>
		</MotionPulse>

		{/* Lingkaran mobile */}
		<MotionPulse>
			<m.div
				className="absolute border-[#FEEAAE] border-2 bg-[#FFF5D7] rounded-full
          w-[90px] h-[90px] top-[16px] left-[16px]
          md:hidden"
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
							<path d="M1534 1515V1517H1536V1515H1534ZM-126 1515H-128V1517H-126V1515ZM-126 332V330H-128V332H-126ZM-5.05176 332L-4.2433 330.171L-4.62951 330H-5.05176V332ZM724.5 654.421L723.692 656.25L724.5 656.608L725.308 656.25L724.5 654.421ZM1454.05 332V330H1453.63L1453.24 330.171L1454.05 332ZM1534 332H1536V330H1534V332ZM1534 1515V1513H-126V1515V1517H1534V1515ZM-126 1515H-124V332H-126H-128V1515H-126ZM-126 332V334H-5.05176V332V330H-126V332ZM-5.05176 332L-5.86021 333.829L723.692 656.25L724.5 654.421L725.308 652.592L-4.2433 330.171L-5.05176 332ZM724.5 654.421L725.308 656.25L1454.86 333.829L1454.05 332L1453.24 330.171L723.692 652.592L724.5 654.421ZM1454.05 332V334H1534V332V330H1454.05V332ZM1534 332H1532V1515H1534H1536V332H1534Z" fill="#B3DFF5" />
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

	return (
		<section className="flex flex-col gap-4 rounded-md border bg-white p-4 sm:p-6">
			<Button asChild className="w-fit">
				<Link to="/dashboard">
					<ArrowLeftIcon />
					Kembali
				</Link>
			</Button>

			{/* Points & Streak Cards */}
			<div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">

				{/* Points Card */}
				<div className="bg-[#fee086] h-[70px] sm:h-[87px] relative rounded-[8px] shrink-0 w-full sm:w-[368px] border border-[#fed65e] overflow-clip">
					<div className="absolute left-[-33px] size-[160px] sm:size-[209px] top-[-28px] sm:top-[-36px]">
						<svg className="absolute block size-full" fill="none" viewBox="0 0 209 209">
							<circle cx="104.5" cy="104.5" fill="#FDC10E" r="104.5" />
						</svg>
					</div>
					<p className="absolute font-bold left-[18px] sm:left-[22px] text-[28px] sm:text-[45px] leading-none text-white top-1/2 -translate-y-1/2 whitespace-nowrap">
						{session?.user?.points ?? 5000}
					</p>
					<div className="absolute font-medium left-[120px] sm:left-[188px] text-[11px] sm:text-[18px] text-black top-1/2 -translate-y-1/2 whitespace-nowrap">
						<p className="mb-0 leading-[1.5]">Capaianmu Sejauh</p>
						<p className="leading-[1.5]">Ini. Teruskan!</p>
					</div>
				</div>

				{/* Streak Card */}
				<div className="bg-[#fee086] h-[70px] sm:h-[87px] relative rounded-[8px] shrink-0 w-full sm:w-[340px] border border-[#fed65e] overflow-clip">
					<div className="absolute left-[-50px] size-[160px] sm:size-[209px] top-[-28px] sm:top-[-36px]">
						<svg className="absolute block size-full" fill="none" viewBox="0 0 209 209">
							<circle cx="104.5" cy="104.5" fill="#FDC10E" r="104.5" />
						</svg>
					</div>
					<p className="absolute font-bold left-[18px] sm:left-[22px] text-[28px] sm:text-[45px] leading-none text-white top-1/2 -translate-y-1/2 whitespace-nowrap">
						{session?.user?.flashcardStreak ?? 0}
					</p>
					<div className="absolute font-medium left-[110px] sm:left-[174px] text-[11px] sm:text-[18px] text-black top-1/2 -translate-y-1/2 whitespace-nowrap">
						{(session?.user?.flashcardStreak ?? 0) > 0 ? (
							<>
								<p className="mb-0 leading-[1.5]">Streak Brain Gym</p>
								<p className="leading-[1.5]">Kamu! <span className="text-[#916d01]">Keren!</span></p>
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
					src={(session?.user?.flashcardStreak ?? 0) > 0
						? "/decorations/image 30.png"
						: "/decorations/image 29.png"
					}
					alt=""
					className="hidden md:block absolute right-0 h-[148px] top-[-148px] w-[193px] pointer-events-none z-10"
				/>

				{/* Blue Banner */}
				<div className="relative bg-[#5a74c8] border border-[#3650a2] border-solid h-auto min-h-[160px] sm:h-[229px] overflow-clip rounded-[5px] w-full">
					{/* background elips */}
					<div className="absolute h-[200px] sm:h-[312px] left-[-40px] sm:left-[-64px] top-[40px] sm:top-[72px] w-[200px] sm:w-[320px]">
						<svg className="absolute block size-full" fill="none" viewBox="0 0 320 312">
							<ellipse cx="160" cy="156" fill="#91A3DA" rx="160" ry="156" />
						</svg>
					</div>

					{/* Character image */}
					<div className="absolute flex items-center justify-center left-[-20px] sm:left-[-60px] top-[0px] sm:top-[-49px] size-[160px] sm:size-[339px] rotate-y-180">
					<div className="-scale-y-100 rotate-180 size-full">
						<img src="/decorations/image 26.png" alt="" className="object-cover pointer-events-none w-full h-full" />
					</div>
					</div>

					{/* texgt uji kemampuan */}
					<div className="absolute flex flex-col items-start left-[160px] sm:left-[283px] text-[#f4faff] top-1/2 -translate-y-1/2 sm:top-[114px] sm:translate-y-0 w-[calc(100%-170px)] sm:w-[432px] pr-2 sm:pr-0">
						<p className="font-bold text-[22px] sm:text-[34px] leading-tight sm:leading-[51px]">Flashcard</p>
						<p className="font-medium text-[12px] sm:text-[18px] leading-snug sm:leading-[27px] sm:whitespace-nowrap">
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