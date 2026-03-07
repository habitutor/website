import { motion } from "motion/react";
import { MotionPulse } from "@/components/motion/motion-components";

export function Hero() {
	return (
		<section className="relative overflow-hidden bg-background">
			<div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
				<MotionPulse>
					<div className="absolute top-80 left-10 h-15 w-15 md:top-90 md:left-15 md:h-66 md:w-66 rounded-full border-2 border-secondary-200 bg-secondary-100" />
				</MotionPulse>

				<MotionPulse>
					<div className="md:absolute md:flex hidden top-70 left-10 h-23 w-23 rounded-full border-2 border-green-100 bg-[#C5F5DC]" />
				</MotionPulse>

				<MotionPulse>
					<div className="md:absolute md:flex hidden top-70 right-5 h-23 w-23 rounded-full border-2 border-secondary-200 bg-secondary-100" />
				</MotionPulse>

				<MotionPulse>
					<div className="absolute md:top-90 md:right-10 md:h-75 md:w-75 top-70 right-10 h-15 w-15 rounded-full border-2 border-green-100 bg-[#C5F5DC]" />
				</MotionPulse>

				<MotionPulse>
					<div className="md:absolute md:flex hidden top-70 right-40 h-15 w-15 rounded-full border-2 border-neutral-200 bg-neutral-100" />
				</MotionPulse>

				<MotionPulse>
					<div className="md:absolute md:flex hidden top-50 left-30 h-15 w-15 rounded-full border-2 border-neutral-200 bg-neutral-100" />
				</MotionPulse>

			</div>
			<main className="relative mx-auto flex w-full flex-col items-center justify-center overflow-hidden px-4 py-22">
				<div className="container z-1 flex shrink-0 flex-col items-center space-y-10 pt-8 md:mx-auto md:space-y-13 md:pt-20">
					<div className="flex max-w-4xl flex-col items-center gap-1 text-center md:gap-2">
						<motion.h2
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0 }}
							className="font-extrabold font-sans text-3xl leading-10 sm:text-4xl md:text-5xl md:leading-18"
						>
							Akses Premium Untuk <span className="text-primary-300">Strategi</span>{" "}
							<motion.span
								className="inline-block text-primary-300"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.6, delay: 0.3 }}
							>
								Lebih Tajam & Hasil Lebih Besar
							</motion.span>
						</motion.h2>

						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0.1 }}
							className="text-sm sm:text-lg"
						>
							Investasikan masa depanmu sekarang! dengan bimbingan intensif dari Habitutor
						</motion.p>
					</div>
				</div>
			</main>
			<div className="pointer-events-none relative h-30 w-screen overflow-hidden md:h-40 xl:h-50">
				<div className="absolute inset-0 inset-y-0 z-2 bg-tertiary-100 [clip-path:polygon(30%_100%,70%_100%,100%_30%,100%_100%,0_100%,0_30%)] md:[clip-path:polygon(20%_100%,80%_100%,100%_0,100%_100%,0_100%,0_0)] xl:[clip-path:polygon(25%_100%,75%_100%,100%_0,100%_100%,0_100%,0_0)] 2xl:[clip-path:polygon(35%_100%,65%_100%,100%_0,100%_100%,0_100%,0_0)]" />
				<div className="absolute left-1/2 h-75 w-130 -translate-x-1/2 rounded-t-full border-2 border-red-200 bg-red-100 md:h-115 md:w-230" />
				<div className="relative z-10 flex h-full flex-col items-center justify-end pb-5 md:pb-10">
					<p className="text-center font-bold text-lg md:text-2xl">Ultimate Bundling & Privilege</p>
					<p className="max-w-50 text-center text-sm md:max-w-none md:text-lg">
						Paket yang paling worth it, Paling lengkap dan murah!!
					</p>
				</div>
			</div>
		</section>
	);
}
