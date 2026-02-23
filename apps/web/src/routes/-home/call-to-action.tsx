import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { motion } from "motion/react";
import { MotionPulse } from "@/components/motion";
import { Button, buttonVariants } from "@/components/ui/button";
import { WhatsappLogoIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { DATA } from "./data";

export function CallToAction() {
    return (
        <section className="flex w-full flex-col items-center px-4 py-20 bg-white">
			<MotionPulse>
				<motion.div className="absolute -right-200 -bottom-100 z-0 size-56 rounded-full border-[#B3DFF5] border-[2px] bg-tertiary-100 md:size-84"
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					transition={{ delay: 0.2, duration: 0.3 }}
				/>
			</MotionPulse>

			<MotionPulse>
				<motion.div className="absolute -left-200 -bottom-190 z-0 size-56 rounded-full border-[#B3DFF5] border-[2px] bg-tertiary-100 md:size-64"
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					transition={{ delay: 0.2, duration: 0.3 }}
				/>
			</MotionPulse>
            {/* TOP CONTAINER */}
            <div className="relative flex min-h-[489px] w-full max-w-[1238px] flex-col overflow-hidden rounded-t-[16px] border-x-[2px] border-t-[2px] border-[#B3DFF5] bg-[#F4FAFF]">
                
                <div className="relative z-10 flex h-full flex-1 flex-col justify-center px-6 py-12 md:px-10 lg:px-20">
                    <div className="flex w-full flex-col lg:flex-row lg:items-center">
                        
                        {/* Left Content */}
                        <div className="z-20 flex flex-col items-start gap-6 lg:w-2/3">
                            <motion.h2
                                className="max-w-5xl text-pretty font-sans text-5xl font-extrabold"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                Kamu Punya{" "}
                                <motion.span
                                    className="inline-block text-primary-300"
                                    whileHover={{ scale: 1.1, rotate: [0, -3, 3, 0], transition: { duration: 0.3 } }}
                                >
                                    Potensi
                                </motion.span>
                                ,<br />
                                Kami Punya{" "}
                                <motion.span
                                    className="inline-block text-primary-300"
                                    whileHover={{ scale: 1.1, rotate: [0, -3, 3, 0], transition: { duration: 0.3 } }}
                                >
                                    Strateginya
                                </motion.span>
                                !
                            </motion.h2>

                            <motion.p
                                className="text-pretty"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                            >
                                Berhenti menebak-nebak cara belajar yang benar. Biarkan kami membimbingmu memaksimalkan setiap potensi yang
                                kamu miliki.
                            </motion.p>

                            {/* UPDATED BUTTON CONTAINER: Added w-full and responsive flex directions */}
                            <div className="flex w-full flex-col gap-4 sm:flex-row sm:flex-wrap">
                                    <Button asChild size="lg" className="h-12 w-full rounded-[6px] bg-[#4A62A8] px-8 font-bold shadow-lg shadow-blue-900/10 sm:w-auto">
                                        <Link to="/login">Mulai Perjalananmu</Link>
                                    </Button>

                                
                                    <Button 
                                        variant="outline" 
                                        size="lg" 
                                        className={cn(
                                            "h-12 w-full rounded-[6px] border-slate-200 bg-white px-8 font-semibold text-slate-600 sm:w-auto",
                                            /* Overriding default hover transparency */
                                            "hover:bg-white hover:text-slate-600 hover:border-slate-300" 
                                        )}
                                    >
                                        <Link to="/dashboard" className="flex items-center justify-center gap-2">
                                            <WhatsappLogoIcon size={24} weight="duotone" className="text-[#777777]" />
                                            Masih Ada Pertanyaan?
                                        </Link>
                                    </Button>
                            </div>
                        </div>

                        {/* Right Mascot Container */}
                        <div className="absolute bottom-0 right-0 h-full flex items-end justify-end pointer-events-none overflow-hidden">
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="relative z-0"
                            >
                                <img 
                                    src="/avatar/tupai-cta-1.webp" 
                                    alt="Mascot" 
                                    className="h-auto w-[180px] md:w-[300px] lg:w-[400px] object-contain -scale-x-100 translate-y-2" 
                                />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
            {/* BOTTOM CONTAINER */}
            <div className="relative z-10 w-full max-w-[1238px] rounded-b-[16px] border-x-[2px] border-b-[2px] border-[#24356B] bg-[#3650A2] py-8 text-white md:py-10">
                <div className="mx-auto px-6 md:px-10 lg:px-20">
                    <div className="flex flex-col items-center justify-between gap-8 sm:flex-row sm:gap-6">
                        <div className="flex flex-col items-center gap-1 sm:items-start">
                            <div className="flex items-center gap-2">
                                <img
                                    src={"/logo.svg"}
									alt="Logo Habitutor"
									layout="fullWidth"
									className="pointer-events-none -ml-2.5 select-none"
                                />
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
                                        "h-10 w-10 rounded-lg bg-white/10 text-white hover:bg-white/20"
                                    )}
                                >
                                    <social.icon className="size-5" weight="bold" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="my-6 h-[1px] w-full bg-white" />

                    <div className="flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
                        <p className="max-w-[280px] text-xs opacity-80 md:max-w-none md:text-sm">
                            Ubah Persiapan Ujian Menjadi Investasi Masa Depan
                        </p>
                        
                        <div className="flex flex-wrap items-center justify-center gap-2 text-xs md:text-sm">
                            <span className="opacity-80">Build together with</span>
                            <a
                                href="https://www.instagram.com/omahti_ugm"
                                className="flex items-center hover:opacity-80 transition-opacity"
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