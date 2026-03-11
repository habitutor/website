import { Image } from "@unpic/react";
import * as m from "motion/react-m";
import Carousel from "@/components/carousel";
import { MotionPulse } from "@/components/motion";
import { fadeInUp } from "@/lib/animation-variants";
import { DATA } from "./data";

const getFadeInViewWithDelay = (delay: number) => ({
	initial: { opacity: 0 },
	whileInView: { opacity: 1 },
	viewport: { once: true },
	transition: { delay, duration: 0.3 },
});

const getFadeInUpWithDelay = (delay: number) => ({
	variants: fadeInUp,
	initial: "initial",
	whileInView: "animate",
	viewport: { once: true },
	transition: { delay, duration: 0.3 },
});

export function Features() {
	return (
		<section className="overflow-x-hidden bg-background py-16">
			<div className="container mx-auto flex w-full max-w-4xl flex-col gap-20 px-4">
				<div className="relative w-full">
					<MotionPulse>
						<m.div
							className="absolute -top-12 -left-30 z-0 size-40 rounded-full bg-primary-100 md:size-46"
							{...getFadeInViewWithDelay(0.2)}
						/>
					</MotionPulse>
					<MotionPulse>
						<m.div className="absolute -top-20 -left-14 z-20 md:-top-24 md:-left-16" {...getFadeInViewWithDelay(0.1)}>
							<Image
								src="/decorations/graduation-cap.webp"
								alt=""
								layout="constrained"
								width={400}
								height={400}
								className="h-auto w-36 md:w-40"
							/>
						</m.div>
					</MotionPulse>
					<MotionPulse>
						<m.div className="absolute -top-0 -right-16 z-0" {...getFadeInViewWithDelay(0.3)}>
							<Image
								src="/decorations/green-yellow-double-circle.webp"
								alt=""
								layout="constrained"
								width={120}
								height={120}
								className="h-auto w-20 md:w-28"
							/>
						</m.div>
					</MotionPulse>
					<MotionPulse>
						<m.div className="absolute -top-20 -left-14 z-30 md:-top-24 md:-left-16" {...getFadeInViewWithDelay(0.1)}>
							<Image
								src="/decorations/graduation-cap.webp"
								alt=""
								layout="constrained"
								width={400}
								height={400}
								className="h-auto w-36 md:w-40"
							/>
						</m.div>
					</MotionPulse>

					<m.div
						className="relative z-10 overflow-hidden rounded-2xl bg-neutral-100 shadow-sm"
						{...getFadeInUpWithDelay(0)}
					>
						<div className="flex flex-col p-8 md:grid md:min-h-96 md:grid-cols-[30%_70%]">
							<div className="absolute top-38 -left-40 z-0 size-100 rounded-full bg-tertiary-100 sm:top-30 md:top-50 md:left-60 md:size-54" />

							<div className="relative z-10 space-y-3 text-center md:text-left">
								<m.h2
									className="text-2xl font-bold md:text-3xl"
									whileHover={{ rotate: [-1, 1, -1, 0], transition: { duration: 0.3 } }}
								>
									Bersama <span className="text-primary">Habitutor</span>
								</m.h2>
								<p className="text-sm leading-relaxed text-foreground">
									Mulai dari 3 menit sehari. Habitutor{" "}
									<span className="font-bold text-(--tt-color-yellow-dec-2)">membangun kebiasaan</span> lewat streak dan
									latihan mini yang ringan.
								</p>
							</div>

							<m.div
								className="relative mt-6 -mb-8 md:mt-10 md:mb-0"
								whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
							>
								<div className="mx-auto w-[90%] md:absolute md:-right-16 md:-bottom-10 md:mx-0 md:w-auto">
									<Image
										src="/images/dashboard-page.webp"
										alt="Habitutor Dashboard"
										width={800}
										height={600}
										layout="constrained"
										className="h-auto w-full rounded-lg border border-[#D2D2D2] md:w-lg"
									/>
								</div>
							</m.div>
						</div>
					</m.div>
				</div>

				{/* Testimone Section */}
				<div className="relative container mx-auto flex w-full max-w-4xl flex-col overflow-visible px-4">
					<MotionPulse>
						<m.div
							className="absolute -right-50 z-2 size-75 translate-y-1/2 rounded-full bg-primary-100"
							initial={{ opacity: 0 }}
							whileInView={{ opacity: 1 }}
							viewport={{ once: true }}
							transition={{ delay: 0.4, duration: 0.3 }}
						/>
					</MotionPulse>

					<MotionPulse>
						<m.div
							className="absolute top-10 -left-30 z-2 size-45 rounded-full bg-fourtiary-100"
							{...getFadeInViewWithDelay(0.5)}
						/>
					</MotionPulse>

					<MotionPulse>
						<m.div
							className="absolute top-10 -left-40 z-2 size-11 rounded-full bg-yellow-100"
							{...getFadeInViewWithDelay(0.6)}
						/>
					</MotionPulse>

					<MotionPulse>
						<m.div
							className="absolute -top-3 -left-50 z-2 w-62.5 translate-y-1/2 sm:w-75"
							{...getFadeInViewWithDelay(0.7)}
						>
							<Image src="/decorations/book.webp" alt="Buku Wan***t" width={300} height={150} className="h-auto" />
						</m.div>
					</MotionPulse>

					<MotionPulse>
						<m.div
							className="absolute -top-3 -right-25 z-4 w-62.5 -translate-y-1/2 lg:-right-35 lg:translate-y-1/2"
							{...getFadeInViewWithDelay(0.8)}
						>
							<Image src="/decorations/pencil.webp" alt="Pensil 2B" width={300} height={150} className="h-auto" />
						</m.div>
					</MotionPulse>

					<m.div
						className="relative z-3 flex flex-col gap-y-32 rounded-2xl border border-neutral-200 bg-neutral-100 px-4 py-8"
						{...getFadeInUpWithDelay(0.5)}
					>
						<div className="mb-4 text-center">
							<h2 className="text-2xl font-bold">
								Ruang Aman untuk <span className="text-primary-300">Bertanya & Tumbuh</span>
							</h2>
							<p className="text-sm font-medium">Ribuan siswa telah menemukan rumah kedua mereka di sini.</p>
						</div>

						<Image
							src="/avatar/testimone-avatar.webp"
							alt="Empty State"
							width={300}
							height={150}
							className="absolute inset-0 m-auto w-62.5 sm:w-75"
						/>

						<Carousel
							items={[...DATA.testimone]}
							showNavigation={true}
							showDots={true}
							autoPlay={false}
							gap={36}
							responsiveGap={true}
							className=""
						/>
					</m.div>
				</div>

				<div className="relative">
					<MotionPulse>
						<m.div
							className="absolute -bottom-90 -left-30 z-0 size-40 rounded-full bg-tertiary-100 md:-bottom-100 md:size-46"
							{...getFadeInViewWithDelay(0.9)}
						/>
					</MotionPulse>

					<div className="absolute -right-6 -bottom-8 z-0 hidden md:-right-36 md:-bottom-2 md:block">
						<Image
							src="/avatar/feature-avatar.webp"
							alt=""
							layout="constrained"
							width={200}
							height={200}
							className="h-auto w-50"
						/>
					</div>

					<m.div
						className="relative z-10 overflow-hidden rounded-2xl bg-neutral-100 shadow-sm"
						{...getFadeInUpWithDelay(0)}
					>
						<MotionPulse>
							<m.div className="absolute top-40 -right-20 z-0 md:top-50 md:-right-10" {...getFadeInViewWithDelay(1)}>
								<Image
									src="/decorations/green-yellow-2-circle.webp"
									alt=""
									layout="constrained"
									width={120}
									height={120}
									className="h-auto w-100 md:w-60"
								/>
							</m.div>
						</MotionPulse>

						<div className="flex flex-col p-8 md:grid md:min-h-96 md:grid-cols-[65%_35%]">
							<m.div
								className="relative order-2 mt-6 -mb-8 md:order-1 md:mt-0 md:mb-0"
								whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
							>
								<div className="mx-auto w-[90%] md:absolute md:-bottom-10 md:-left-16 md:mx-0 md:w-auto">
									<Image
										src="/images/kelas-page.webp"
										alt="Habitutor Kelas"
										width={800}
										height={600}
										layout="constrained"
										className="h-auto w-full rounded-lg border border-[#D2D2D2] md:w-lg"
									/>
								</div>
							</m.div>

							<div className="relative z-10 order-1 space-y-3 text-center md:order-2 md:text-right">
								<h2 className="text-2xl font-bold md:text-3xl">
									<m.span
										className="inline-block text-primary"
										whileHover={{ rotate: [-1, 1, -1, 0], transition: { duration: 0.3 } }}
									>
										Penjelasan Jelas.
									</m.span>
									<m.span
										className="inline-block text-primary"
										whileHover={{ rotate: [-1, 1, -1, 0], transition: { duration: 0.3 } }}
									>
										Strategi Praktis.
									</m.span>
								</h2>
								<p className="text-sm leading-relaxed text-foreground">
									Pembelajaran yang mudah diikuti dan dirancang membangun progres jangka panjang.
								</p>
							</div>
						</div>
					</m.div>
				</div>
			</div>
		</section>
	);
}
