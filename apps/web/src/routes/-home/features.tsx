import { Image } from "@unpic/react";

export function Features() {
	return (
		<section className="overflow-x-hidden bg-background py-12">
			<div className="container mx-auto flex w-full max-w-4xl flex-col gap-20 px-4">
				<div className="relative w-full">
					<div className="absolute -top-20 -left-14 z-20 md:-top-24 md:-left-16">
						<Image
							src="/decorations/graduation-cap.webp"
							alt=""
							layout="constrained"
							width={400}
							height={400}
							className="h-auto w-36 md:w-40"
						/>
					</div>

					<div className="relative overflow-hidden rounded-2xl bg-neutral-100 shadow-sm">
						<div className="flex flex-col p-8 md:grid md:min-h-96 md:grid-cols-[30%_70%]">
							<div className="space-y-3 text-center md:text-left">
								<h2 className="font-bold text-2xl md:text-3xl">
									Bersama <span className="text-primary">Habitutor</span>
								</h2>
								<p className="text-foreground text-sm leading-relaxed">
									Mulai dari 3 menit sehari. Habitutor{" "}
									<span className="font-bold text-(--tt-color-yellow-dec-2)">membangun kebiasaan</span> lewat streak dan
									latihan mini yang ringan.
								</p>
							</div>

							<div className="relative mt-6 -mb-8 md:mt-10 md:mb-0">
								<div className="mx-auto w-[90%] md:absolute md:-right-16 md:-bottom-10 md:mx-0 md:w-auto">
									<Image
										src="/images/dashboard-page.webp"
										alt="Habitutor Dashboard"
										width={800}
										aspectRatio={4 / 3}
										layout="constrained"
										className="h-auto w-full rounded-lg border border-[#D2D2D2] md:w-lg"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="relative overflow-hidden rounded-2xl bg-neutral-100 shadow-sm">
					<div className="flex flex-col p-8 md:grid md:min-h-96 md:grid-cols-[70%_30%]">
						<div className="relative order-2 mt-6 -mb-8 md:order-1 md:mt-0 md:mb-0">
							<div className="mx-auto w-[90%] md:absolute md:-bottom-10 md:-left-16 md:mx-0 md:w-auto">
								<Image
									src="/images/kelas-page.webp"
									alt="Habitutor Kelas"
									width={800}
									aspectRatio={4 / 3}
									layout="constrained"
									className="h-auto w-full rounded-lg border border-[#D2D2D2] md:w-lg"
								/>
							</div>
						</div>

						<div className="order-1 space-y-3 text-center md:order-2 md:text-right">
							<h2 className="font-bold text-2xl md:text-3xl">
								Penjelasan <span className="text-primary">Jelas</span>.{" "}
								<span className="block">
									Strategi <span className="text-primary">Praktis</span>.
								</span>
							</h2>
							<p className="text-foreground text-sm leading-relaxed">
								Pembelajaran yang mudah diikuti dan dirancang membangun progres jangka panjang.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
