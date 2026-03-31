import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { LiveClassCard } from "@/components/classes";
import { orpc } from "@/utils/orpc";

const DUMMY = [
	{
		id: "1",
		title: "Kelas Matematika Dasar",
		date: "2024-06-01",
		time: "19:00",
		teacher: "Pak Budi",
		link: "https://zoom.us/j/123456789",
	},
	{
		id: "2",
		title: "Kelas Fisika Dasar",
		date: "2024-06-02",
		time: "19:00",
		teacher: "Bu Siti",
		link: "https://zoom.us/j/987654321",
	},
];

export const LiveClass = () => {
	const { isPending } = useQuery(orpc.subtest.getRecentViews.queryOptions());
	const [current, setCurrent] = useState(0);
	const [containerWidth, setContainerWidth] = useState(0);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		const update = () => {
			setContainerWidth(containerRef.current?.offsetWidth ?? 0);
		};

		update();

		const observer = new ResizeObserver(update);
		observer.observe(containerRef.current);

		return () => observer.disconnect();
	}, []);

	const getVisible = () => {
		if (containerWidth < 640) return 1;
		if (containerWidth < 1024) return 2;
		return 3;
	};

	const visible = getVisible();
	const cardWidth = containerWidth < 640 ? Math.max(containerWidth, 0) : 304;
	const maxIndex = Math.max(0, DUMMY.length - visible);
	const dotItems = Array.from({ length: Math.max(1, DUMMY.length - visible + 1) }, (_, index) => `live-dot-${index}`);

	const next = () => {
		setCurrent((prev) => (prev >= maxIndex ? 0 : prev + 1));
	};

	const prev = () => {
		setCurrent((value) => (value <= 0 ? maxIndex : value - 1));
	};

	if (isPending) {
		return (
			<section className="rounded-2xl border bg-neutral-100 p-4 md:p-10">
				<h2 className="mb-2 font-medium">Live Class bersama Mentor</h2>
				<div className="animate-pulse space-y-2">
					<div className="h-32 rounded-md bg-neutral-200" />
					<div className="h-32 rounded-md bg-neutral-200" />
				</div>
			</section>
		);
	}

	// if (!data || data.length === 0) {
	//   return (
	//     <section className="border p-4 md:p-10 bg-neutral-100 rounded-2xl">
	//       <h2 className="font-medium">Live Class bersama Mentor</h2>
	//       <div className="flex flex-col items-center justify-center space-y-6 py-8 text-center">
	//         <img src="/avatar/confused-avatar.webp" alt="Belum ada kelas" className="h-40 w-auto" />
	//         <p className="font-bold text-2xl text-black">Kamu belum melihat kelas apapun</p>
	//         <Button asChild>
	//           <Link to="/classes">
	//             Kelas Sekarang <ArrowRightIcon className="" />
	//           </Link>
	//         </Button>
	//       </div>
	//     </section>
	//   );
	// }

	return (
		<section className="rounded-2xl border bg-neutral-100 p-4 md:p-10 relative">
			<h2 className="mb-2 font-medium">Live Class bersama Mentor</h2>
			<div className="w-full">
				<div ref={containerRef} className="relative w-full overflow-hidden">
					<div
						className="flex transition-transform duration-500 ease-out"
						style={{
							gap: 16,
							transform: `translateX(-${current * (cardWidth + 16)}px)`,
						}}
					>
						{DUMMY.map((item) => (
							<div
								key={item.id}
								style={{
									width: cardWidth,
									minWidth: cardWidth,
								}}
							>
								<LiveClassCard
									title={item.title}
									date={item.date}
									time={item.time}
									teacher={item.teacher}
									link={item.link}
								/>
							</div>
						))}
					</div>
				</div>

				{DUMMY.length > 1 && (
					<div className="mt-4 flex items-center justify-between">
						<button
							type="button"
							onClick={prev}
							className="rounded-lg bg-primary-200 p-2 text-white static md:absolute left-5 top-1/2"
							aria-label="Previous live class"
						>
							<ArrowLeftIcon size={20} />
						</button>

						<button
							type="button"
							onClick={next}
							className="rounded-lg bg-primary-200 p-2 text-white static md:absolute right-5 top-1/2"
							aria-label="Next live class"
						>
							<ArrowRightIcon size={20} />
						</button>
					</div>
				)}
			</div>
		</section>
	);
};
