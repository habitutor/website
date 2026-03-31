import { ArrowRightIcon, EyeIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link, useRouteContext } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { Button } from "@/components/ui/button";
import { orpc } from "@/utils/orpc";

export const UserProgress = () => {
	return (
		<section className="border p-4 w-full md:p-10 bg-neutral-100 rounded-2xl">
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
	const { data, isPending } = useQuery(orpc.subtest.getProgressStats.queryOptions());

	return (
		<div className="relative flex min-h-30 items-end justify-between gap-4 overflow-clip w-full rounded-md bg-blue-200 p-4 text-primary">
			<div className="z-10 space-y-0.5">
				<h4 className={`font-bold text-4xl sm:text-5xl ${isPending && "animate-pulse"}`}>
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
				className="absolute -right-[20%] -bottom-[30%] h-auto w-55 z-0 object-contain"
			/>
		</div>
	);
};

const Tryout = () => {
	return (
		<div className="relative flex min-h-30 items-end justify-between gap-4 overflow-clip rounded-md bg-green-200 p-4 text-green-800">
			<div className="z-10 space-y-0.5">
				<h2 className="font-bold text-2xl">Kerjakan Tryout</h2>
			</div>

			<Button asChild size="icon" variant="default" className="z-10 bg-fourtiary-400">
				<a
					href="https://www.anycademy.com"
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
	const { data: totalScoreData } = useQuery(orpc.flashcard.totalScore.queryOptions());
	if (!session) return null;
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const hasDoneToday = session.user.lastCompletedFlashcardAt?.getTime() >= today.getTime();
	const totalScore = totalScoreData?.totalScore ?? 0;

	return (
		<div className="relative flex items-end justify-between gap-4 overflow-clip rounded-md border border-primary-400 bg-primary-300 p-4 text-white sm:col-span-3">
			{!hasDoneToday ? (
				<div className="h-full justify-between flex flex-col">
					<div className="bg-red-200 border rounded-sm border-red-400 px-4 py-2 md:text-sm text-xs md:whitespace-nowrap">
						<p className="font-bold text-white">Streak kamu mati! yuk kejar lagi</p>
					</div>
					<div className="space-y-2">
						<div className="z-10 space-y-0.5">
							<h4 className={"font-bold text-4xl"}>{totalScore.toLocaleString("id-ID")}</h4>
							<p className="font-bold">Skor saat ini</p>
						</div>
						<div className="z-10 space-y-0.5">
							<h4 className={"font-bold text-4xl"}>{session.user.flashcardStreak}</h4>
							<p className="font-bold">Streak Brain Gym</p>
						</div>
					</div>
				</div>
			) : (
				<div className="space-y-2">
					<div className="z-10 space-y-0.5">
						<h4 className={"font-bold text-4xl"}>{totalScore.toLocaleString("id-ID")}</h4>
						<p className="font-bold">Skor saat ini</p>
					</div>
					<div className="z-10 space-y-0.5">
						<h4 className={"font-bold text-4xl"}>{session.user.flashcardStreak}</h4>
						<p className="font-bold">Streak Brain Gym</p>
					</div>
				</div>
			)}

			<div className="z-10 justify-end flex flex-col md:flex-row gap-2">
				<Button
					size="lg"
					variant="darkBlue"
					className="z-10 max-sm:h-auto max-sm:text-wrap max-sm:py-1 max-sm:text-xs max-sm:has-[>svg]:px-2"
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
				{session.user.isPremium && session.user.lastCompletedFlashcardAt?.getTime() >= today.getTime() && (
					<Button
						size="lg"
						variant="darkBlue"
						className="z-10 max-sm:h-auto max-sm:text-wrap max-sm:py-1 max-sm:text-xs max-sm:has-[>svg]:px-2"
						asChild
					>
						<Link to="/dashboard/flashcard">
							Main Lagi <ArrowRightIcon />
						</Link>
					</Button>
				)}
			</div>

			<div className="absolute -bottom-1/2 -left-[5%] z-0 aspect-square h-full rounded-full bg-purple-200/10 sm:-bottom-[20%]" />
			<Image
				src="/avatar/brain-gym.webp"
				alt=""
				width={300}
				height={300}
				className="absolute -right-20 md:right-0 -bottom-[5%] z-0 object-contain"
			/>
		</div>
	);
};
