import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { orpc } from "@/utils/orpc";
import { ArrowLeftIcon, ArrowRightIcon, CalendarBlankIcon, ClockIcon, UsersIcon, ArrowCircleRightIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Image } from "@unpic/react";

export type LiveClasses = {
    id: string;
    title: string;
    date: string;
	time: string;
	mentor: string;
};

export const NEWS: LiveClasses[] = [
	{
		id: "1",
		title: "PK",
		date:
			"Senin, 20 Maret 2024",
		time: "10.00",
		mentor: "John Doe",
	},
	{
		id: "2",
		title: "PM",
		date:
			"Selasa, 21 Maret 2024",
		time: "10.00",
		mentor: "Ayasha",
	},
		{
		id: "3",
		title: "PPU",
		date:
			"Selasa, 21 Maret 2024",
		time: "17.00",
		mentor: "Hako",
	},
		{
		id: "4",
		title: "LBI",
		date:
			"Selasa, 21 Maret 2024",
		time: "15.00",
		mentor: "Melinda",
	},
		{
		id: "5",
		title: "LB",
		date:
			"Selasa, 21 Maret 2024",
		time: "11.00",
		mentor: "Klien Habitutor",
	},
];

export const LiveClasses = () => {
	const { data, isPending } = useQuery(orpc.subtest.getRecentViews.queryOptions());
	const carouselRef = useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(true);

	const checkScroll = () => {
		if (carouselRef.current) {
			const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
			setCanScrollLeft(scrollLeft > 0);
			setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
		}
	};

	const scroll = (direction: "left" | "right") => {
		if (carouselRef.current) {
			const scrollAmount = 304;
			carouselRef.current.scrollBy({
				left: direction === "left" ? -scrollAmount : scrollAmount,
				behavior: "smooth",
			});
			setTimeout(checkScroll, 300);
		}
	};

	if (isPending) {
		return (
			<section className="bg-neutral-100 border border-netural-300 p-6 rounded-2xl">
				<h2 className="mb-2 font-medium">Live Class Bersama Mentor</h2>
				<div className="animate-pulse space-y-2">
					<div className="h-32 rounded-md bg-neutral-200" />
					<div className="h-32 rounded-md bg-neutral-200" />
				</div>
			</section>
		);
	}

	if (!NEWS || NEWS.length === 0) {
		return (
			<section className="bg-neutral-100 border border-netural-300 p-6 rounded-md">
				<h2 className="font-medium">Live Class Bersama Mentor</h2>
				<div className="flex flex-col items-center justify-center space-y-6 py-8 text-center">
					<img src="/avatar/mentor-avatar.webp" alt="Belum ada kelas" className="h-40 w-auto" />
					<p className="font-bold text-2xl text-black">Tunggu ya, mentor terbaikmu akan segera hadir!</p>
				</div>
			</section>
		);
	}

	return (
		<section className="bg-neutral-100 border border-netural-300 p-6 rounded-2xl">
			<h2 className="mb-4 font-medium">Live Class Bersama Mentor</h2>
			<div className="relative">
				<div
					ref={carouselRef}
					onScroll={checkScroll}
					onLoad={checkScroll}
					className="overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
				>
					<div className="flex gap-3 pb-2 px-4 ">
						{NEWS.map((liveClass) => (
							<div
								key={liveClass.id}
								className="shrink-0 w-84 bg-background rounded-lg border text-neutral-1000 border-tertiary-200 hover:shadow-md transition-shadow"
							>
								<div className="flex flex-col gap-4 relative overflow-hidden p-6">
									<div className="z-10">
										<h3 className="font-bold text-xl">{liveClass.title}</h3>
									</div>
									<div className=" border-neutral-200 z-10 text-sm font-normal flex flex-col gap-2 [&>p]:flex [&>p]:items-center [&>p]:gap-2">
										<p> <CalendarBlankIcon weight="bold" /> {liveClass.date}</p>
										<p><ClockIcon weight="bold" /> {liveClass.time}</p>
										<p><UsersIcon weight="bold" /> {liveClass.mentor}</p>
									</div>
									<Button className="bg-transparent w-fit shadow-none hover:bg-transparent absolute right-[5%] z-10" size={"icon"} asChild>
										<ArrowCircleRightIcon weight="bold" className="text-tertiary-600" />
									</Button>
									<div className="absolute -bottom-1/2 right-0 z-0 aspect-square h-full rounded-full bg-green-100 border-2 border-fourtiary-200" />
									<Image
										src="/avatar/class-avatar.webp"
										alt=""
										width={160}
										height={160}
										className="absolute right-0 -bottom-1/5 z-0 object-contain"
									/>
								</div>
							</div>
						))}
					</div>
				</div>

				<button
					onClick={() => scroll("left")}
					disabled={!canScrollLeft}
					className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 bg-tertiary-800 rounded-md p-2 hover:bg-tertiary-700 disabled:cursor-not-allowed transition-all"
					aria-label="Carousel sebelumnya"
				>
					<ArrowLeftIcon weight="bold" className="text-white w-6 h-6" />
				</button>
				<button
					onClick={() => scroll("right")}
					disabled={!canScrollRight}
					className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 bg-tertiary-800 rounded-md p-2 hover:bg-tertiary-700 disabled:cursor-not-allowed transition-all"
					aria-label="Carousel selanjutnya"
				>
					<ArrowRightIcon weight="bold" className="text-white w-6 h-6" />
				</button>
			</div>
		</section>
	);
};
