import { WhatsappLogoIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { motion } from "motion/react";
import { MotionPulse } from "@/components/motion";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DATA } from "@/routes/-home/data";

export function CallToAction() {
	return (
		<section className="mx-auto flex w-full flex-col items-center overflow-hidden bg-neutral-100 px-4 py-20">
			<MotionPulse>
				<motion.div
					className="absolute -right-200 -bottom-100 z-0 size-56 rounded-full border-2 border-[#B3DFF5] bg-tertiary-100 md:size-84"
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					transition={{ delay: 0.2, duration: 0.3 }}
				/>
			</MotionPulse>

			<MotionPulse>
				<motion.div
					className="absolute -bottom-190 -left-200 z-0 size-56 rounded-full border-2 border-[#B3DFF5] bg-tertiary-100 md:size-64"
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					transition={{ delay: 0.2, duration: 0.3 }}
				/>
			</MotionPulse>
			{/* TOP CONTAINER */}
			<div className="container relative mx-4 flex h-150 min-h-122.25 w-full flex-col overflow-hidden rounded-t-2xl border-[#B3DFF5] border-x-2 border-t-2 bg-[#F4FAFF] md:h-full">
				<div className="relative z-10 flex h-150 flex-1 flex-col justify-start px-8 py-8 md:h-full md:justify-center md:px-10 lg:px-20">
					<div className="flex w-full flex-col lg:flex-row lg:items-center">
						{/* Left Content */}
						<div className="z-20 flex flex-col items-start gap-6 lg:w-2/3">
							<div className="space-y-2">
								<motion.h2
									className="max-w-5xl text-pretty font-extrabold font-sans text-2xl md:text-5xl"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3 }}
								>
									Unlock Versi{" "}
									<motion.span
										className="inline-block text-primary-300"
										whileHover={{ scale: 1.1, rotate: [0, -3, 3, 0], transition: { duration: 0.3 } }}
									>
										Terbaik
									</motion.span>
									<br />
									dari{" "}
									<motion.span
										className="inline-block text-primary-300"
										whileHover={{ scale: 1.1, rotate: [0, -3, 3, 0], transition: { duration: 0.3 } }}
									>
										Persiapanmu
									</motion.span>
								</motion.h2>

								<motion.p
									className="text-pretty text-sm md:text-lg"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3, delay: 0.1 }}
								>
									Dengan Premium, kamu dapat semua fitur unggulan: live class rutin, tryout intensif, dan mentoring dari
									kakak TOP PTN
								</motion.p>
							</div>
							{/* UPDATED BUTTON CONTAINER: Added w-full and responsive flex directions */}
							<div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap">
								<Button asChild size="lg" className="">
									<Link to="/login">Mulai Perjalananmu</Link>
								</Button>

								<Button variant="outline" size="lg">
									<a href={DATA.footer.socials[2].url} className="flex items-center gap-2">
										<WhatsappLogoIcon size={24} weight="duotone" className="text-neutral-700" />
										Masih Ada Pertanyaan?
									</a>
								</Button>
							</div>
						</div>

						{/* Right Mascot Container */}
						<div className="pointer-events-none absolute right-0 bottom-0 flex h-full items-end justify-end overflow-hidden">
							<motion.div
								initial={{ opacity: 0, x: 50 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.3, duration: 0.5 }}
								className="relative z-0"
							>
								<img
									src="/avatar/tupai-cta-1.webp"
									alt="Mascot"
									className="h-auto w-60 translate-y-2 -scale-x-100 object-contain md:w-75 lg:w-100"
								/>
							</motion.div>
						</div>
					</div>
				</div>
			</div>
			{/* BOTTOM CONTAINER */}
			<div className="container relative z-10 mx-4 w-full rounded-b-2xl border-[#24356B] border-x-2 border-b-2 bg-[#3650A2] py-7 text-white md:py-10">
				<div className="w-full space-y-4 px-6 md:px-10 lg:px-20">
					<div className="flex flex-col items-center justify-between border-neutral-100 pb-3 sm:flex-row sm:gap-6 md:border-b">
						<div className="flex flex-col items-center gap-1 sm:items-start">
							<div className="flex items-center gap-2">
								<img src={"/logo.svg"} alt="Logo Habitutor" className="pointer-events-none -ml-2.5 select-none" />
								<h3 className="font-medium text-2xl">Habitutor</h3>
							</div>
						</div>

						<div className="flex items-center gap-3">
							{DATA.footer.socials.map((social) => (
								<a
									key={social.label}
									href={social.url}
									target="_blank"
									rel="noopener noreferrer"
									className={cn(
										buttonVariants({ variant: "ghost", size: "icon" }),
										"h-10 w-10 rounded-lg bg-background text-primary-300 hover:bg-primary-100",
									)}
								>
									<social.icon className="size-5" weight="bold" />
								</a>
							))}
						</div>
					</div>

					<div className="flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
						<p className="max-w-70 text-sm md:max-w-none md:text-lg">
							Ubah Persiapan Ujian Menjadi Investasi Masa Depan
						</p>

						<div className="flex flex-wrap items-center justify-center gap-2 text-lg">
							<span className="">Build together with</span>
							<a
								href="https://www.instagram.com/omahti_ugm"
								className="flex items-center transition-opacity hover:opacity-80"
								target="_blank"
								rel="noopener noreferrer"
							>
								<Image
									src="/icons/OmahTI.webp"
									alt="OmahTI"
									width={111}
									height={15}
									sizes="60%"
									className="h-2.5 w-auto md:h-3"
								/>
							</a>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
