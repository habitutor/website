import { ArrowRightIcon, EyeIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link, useRouteContext } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { Button } from "@/components/ui/button";
import { orpc } from "@/utils/orpc";

export const UserProgress = () => {
	return (
		<section className="bg-neutral-100 border border-netural-300 p-6 rounded-md">
			<h2 className="mb-2 font-medium">Progres Kamu!</h2>
			<div className="grid gap-2 sm:grid-cols-5">
				<div className="space-y-2 sm:col-span-2">
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
		<div className="relative flex min-h-30 items-end justify-between gap-4 overflow-clip rounded-md bg-tertiary-200 border border-tertiary-300 p-4 text-primary">
			<div className="z-10 space-y-0.5 text-tertiary-800">
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

			<div className="absolute -bottom-[10%] -left-[5%] z-0 aspect-square h-full rounded-full bg-tertiary-300 border border-tertiary-400" />
			<Image
				src="/avatar/tupai-materi.webp"
				alt=""
				width={75}
				height={75}
				className="absolute right-[0] -bottom-[30%] z-0 w-auto object-contain"
			/>
		</div>
	);
};

const Tryout = () => {
	return (
		<div className="relative flex min-h-30 items-end justify-between gap-4 overflow-clip rounded-md bg-fourtiary-100 border border-fourtiary-200 p-4 text-green-800">
			<div className="z-10 space-y-0.5 text-fourtiary-400">
				<h2 className="font-bold text-2xl">Kerjakan Tryout</h2>
			</div>

			<Button asChild size="icon" variant="secondary" className="z-10 bg-fourtiary-400">
				<a
					href="https://www.anycademy.com"
					rel="noopener noreferrer"
					target="_blank"
					aria-label="Visit AnyAcademy website"
				>
					<ArrowRightIcon weight="bold" className="text-white" />
				</a>
			</Button>

			<div className="absolute -bottom-[10%] -left-[5%] z-0 aspect-square h-full rounded-full bg-fourtiary-200 border border-fourtiary-300" />
			<Image
				src="/avatar/tryout-avatar.webp"
				alt=""
				width={210}
				height={210}
				className="absolute -right-[10%] -bottom-[50%] z-0 object-contain"
			/>
		</div>
	);
};

const Flashcard = () => {
	const { session } = useRouteContext({ from: "/_authenticated" });
	if (!session) return null;
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	return (
		<div className="relative flex items-end justify-between gap-4 overflow-clip rounded-md bg-primary-300 border border-primary-400 p-4 text-white sm:col-span-3">
			<div className="z-10 space-y-0.5 flex flex-col  justify-end gap-4">
				<div>
					<h4 className="font-bold text-5xl sm:text-6xl">{session.user.name}</h4>
					<p className="font-bold">Skor saat ini</p>
				</div>
				<div>
					<h4 className={"font-bold text-5xl sm:text-6xl"}>{session.user.flashcardStreak}</h4>
					<p className="font-bold">Streak Brain Gym</p>
				</div>
			</div>

			<Button
				size="lg"
				className="z-10 max-sm:h-auto bg-primary-500 max-sm:text-wrap max-sm:py-1 max-sm:text-xs max-sm:has-[>svg]:px-2"
				asChild
			>
				{session.user.lastCompletedFlashcardAt?.getTime() >= today.getTime() ? (
					<Link to="/dashboard/flashcard/result">
						Lihat Hasil <EyeIcon />
					</Link>
				) : (
					<Link to="/dashboard/flashcard">
						Mainkan Brain Gym <ArrowRightIcon />
					</Link>
				)}
			</Button>
			{session.user.isPremium && session.user.lastCompletedFlashcardAt?.getTime() >= today.getTime() && (
				<Button
					size="lg"
					className="z-10 max-sm:h-auto bg-primary-500 max-sm:text-wrap max-sm:py-1 max-sm:text-xs max-sm:has-[>svg]:px-2"
					asChild
				>
					<Link to="/dashboard/flashcard">
						Main Lagi <ArrowRightIcon />
					</Link>
				</Button>
			)}

			<div className="absolute top-0 left-3 z-0 aspect-square w-10 h-10 rounded-full bg-primary-200 sm:-bottom-[20%]" />
			<div className="absolute -bottom-1/2 -left-[5%] z-0 aspect-square h-full rounded-full bg-primary-200 sm:-bottom-[20%]" />
			<Image
				src="/avatar/tupai-braingym.webp"
				alt=""
				width={300}
				height={300}
				className="absolute right-0 -bottom-[5%] z-0 object-contain"
			/>
		</div>
	);
};
