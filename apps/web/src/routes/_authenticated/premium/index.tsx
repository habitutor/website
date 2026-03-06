import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { isValidElement, type ReactNode, useEffect, useState } from "react";
import { MotionStagger, MotionStaggerItem } from "@/components/motion/motion-components";
import { TryOutCard } from "@/components/pricing/tryout-card";
import { createMeta } from "@/lib/seo-utils";
import { cn } from "@/lib/utils";
import { DATA } from "@/routes/home-premium/-components/data";
import { BundlingCard } from "./-components/bundling-card";
import { PerintisClassroomCard } from "./-components/perintis-card";
import { PremiumHeader } from "./-components/premium-header";
import { PrivilegeCard } from "./-components/privilege-card";

export const Route = createFileRoute("/_authenticated/premium/")({
	head: () => ({
		meta: createMeta({
			title: "Premium",
			description: "Upgrade ke premium untuk akses penuh ke semua fitur dan materi Habitutor.",
			noIndex: true,
		}),
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const { session } = Route.useRouteContext();
	const tryoutPlans = Object.values(DATA.pricing_tryout);
	// const tierCards = [
	// 	<TierCard key="free" variant="free" isPremium={isPremium} />,
	// 	<TierCard
	// 		key="premium"
	// 		variant="premium"
	// 		isPremium={isPremium}
	// 		isPending={transactionMutation.isPending}
	// 		mutate={transactionMutation.mutate}
	// 	/>,
	// ];
	const bundlingCards = [
		<BundlingCard key="premium" variant="premium" buttonLabel="Segera Hadir" buttonDisabled />,
		<BundlingCard key="premium2" variant="premium2" buttonLabel="Segera Hadir" buttonDisabled />,
	];
	const privilegeCards = [
		<PrivilegeCard key="privilege1" variant="privilege1" />,
		<PrivilegeCard key="privilege2" variant="privilege2" />,
	];
	const perintisCards = [
		<PerintisClassroomCard key="perintis1" variant="perintis1" />,
		<PerintisClassroomCard key="perintis2" variant="perintis2" />,
		<PerintisClassroomCard key="classroom" variant="classroom" />,
	];
	const tryoutCards = tryoutPlans.map((plan) => <TryOutCard key={plan.label} data={plan} />);

	return (
		<MotionStagger className="mt-4 flex flex-col gap-6 sm:-mt-3">
			<MotionStaggerItem>
				<PremiumHeader session={session} />
			</MotionStaggerItem>

			{/* <MotionStaggerItem>
				<div className="space-y-4">
					<MobileCarousel items={tierCards} paginationLabel="Tier Premium" />
					<div className="hidden gap-6 sm:grid sm:grid-cols-2">
						{tierCards}
					</div>
				</div>
			</MotionStaggerItem> */}

			<MotionStaggerItem>
				<div className="space-y-6 rounded-2xl border border-neutral-300 bg-neutral-100 p-6 sm:p-10">
					<div className="flex flex-col">
						<span className="font-bold text-lg sm:text-2xl">Ultimate Bundling</span>
						<span className="font-medium text-sm sm:text-lg">
							Paket yang paling worth it!!! Paling lengkap + murah!!
						</span>
					</div>
					<MobileCarousel items={bundlingCards} paginationLabel="Ultimate Bundling" />
					<div className="hidden gap-6 sm:grid sm:grid-cols-2">{bundlingCards}</div>
				</div>
			</MotionStaggerItem>

			<MotionStaggerItem>
				<div className="space-y-6 rounded-2xl border border-neutral-300 bg-neutral-100 p-6 sm:p-10">
					<div className="flex flex-col">
						<span className="font-bold text-lg sm:text-2xl">Privilege</span>
						<span className="font-medium text-sm sm:text-lg">
							Pilihan paket belajar yang lebih ringan dengan benefit terarah.
						</span>
					</div>
					<MobileCarousel items={privilegeCards} paginationLabel="Privilege" />
					<div className="hidden gap-6 sm:grid sm:grid-cols-2">{privilegeCards}</div>
				</div>
			</MotionStaggerItem>

			<MotionStaggerItem>
				<div className="space-y-6 rounded-2xl border border-neutral-300 bg-neutral-100 p-6 sm:p-10">
					<div className="flex flex-col">
						<span className="font-bold text-lg sm:text-2xl">Perintis & Classroom</span>
						<span className="font-medium text-sm sm:text-lg">
							Pilihan belajar bertahap dengan isi dan warna yang sama seperti section perintis.
						</span>
					</div>
					<MobileCarousel items={perintisCards} paginationLabel="Perintis dan Classroom" />
					<div className="hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-3">{perintisCards}</div>
				</div>
			</MotionStaggerItem>

			<MotionStaggerItem>
				<div className="space-y-6 rounded-2xl border border-neutral-300 bg-neutral-100 p-6 sm:p-10">
					<div className="flex flex-col">
						<span className="font-bold text-lg sm:text-2xl">Paket Try Out</span>
						<span className="font-medium text-sm sm:text-lg">
							Pilih paket try out sesuai intensitas latihan yang kamu butuhkan.
						</span>
					</div>
					<MobileCarousel items={tryoutCards} paginationLabel="Paket Try Out" />
					<div className="hidden gap-6 md:grid md:grid-cols-2 xl:grid-cols-3">{tryoutCards}</div>
				</div>
			</MotionStaggerItem>
		</MotionStagger>
	);
}

function MobileCarousel({ items, paginationLabel }: { items: ReactNode[]; paginationLabel: string }) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const totalItems = items.length;
	const isFirst = currentIndex === 0;
	const isLast = currentIndex === totalItems - 1;
	const itemKeys = items.map((item, index) =>
		isValidElement(item) && item.key != null ? String(item.key) : `${paginationLabel}-item-${index}`,
	);

	const goPrev = () => {
		if (isFirst) return;
		setCurrentIndex((prev) => prev - 1);
	};

	const goNext = () => {
		if (isLast) return;
		setCurrentIndex((prev) => prev + 1);
	};

	useEffect(() => {
		if (currentIndex > totalItems - 1) {
			setCurrentIndex(Math.max(0, totalItems - 1));
		}
	}, [currentIndex, totalItems]);

	if (totalItems === 0) return null;

	return (
		<div className="w-full space-y-4 sm:hidden">
			<div className="relative">
				<button
					type="button"
					onClick={goPrev}
					disabled={isFirst}
					aria-label={`Sebelumnya ${paginationLabel}`}
					className="absolute top-1/2 left-0 z-40 ml-2 flex -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-lg bg-primary-200 p-2 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-primary-200/80 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
				>
					<ArrowLeftIcon size={22} />
				</button>

				<button
					type="button"
					onClick={goNext}
					disabled={isLast}
					aria-label={`Selanjutnya ${paginationLabel}`}
					className="absolute top-1/2 right-0 z-40 mr-2 flex translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-lg bg-primary-200 p-2 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-primary-200/80 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
				>
					<ArrowRightIcon size={22} />
				</button>

				<div className="overflow-hidden">
					<motion.div
						className="flex"
						animate={{ x: `-${currentIndex * 100}%` }}
						transition={{ duration: 0.35, ease: "easeInOut" }}
						drag="x"
						dragConstraints={{ left: 0, right: 0 }}
						dragElastic={0.08}
						onDragEnd={(_, info) => {
							const dragThreshold = 50;

							if (info.offset.x <= -dragThreshold && !isLast) {
								goNext();
								return;
							}

							if (info.offset.x >= dragThreshold && !isFirst) {
								goPrev();
							}
						}}
					>
						{items.map((item, index) => (
							<div key={itemKeys[index]} className="w-full shrink-0">
								{item}
							</div>
						))}
					</motion.div>
				</div>
			</div>

			<div className="flex items-center justify-center gap-2">
				{items.map((_, index) => (
					<button
						key={`${itemKeys[index]}-dot`}
						type="button"
						onClick={() => setCurrentIndex(index)}
						aria-label={`${paginationLabel} ${index + 1}`}
						className={cn(
							"h-2.5 w-2.5 rounded-full transition-all duration-200",
							currentIndex === index ? "bg-primary-300" : "bg-primary-100",
						)}
					/>
				))}
			</div>
		</div>
	);
}
