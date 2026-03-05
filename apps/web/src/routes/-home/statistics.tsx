import { Image } from "@unpic/react";
import { motion } from "motion/react";
import { BookOpenIcon } from "lucide-react";
import { CloudLightningIcon } from "lucide-react";
import { Frown } from "lucide-react";
import { ArrowUpLeftIcon } from "lucide-react";
import { FileIcon } from "lucide-react";
import { Pocket } from "lucide-react";

export function Statistics() {
    return (
        <section className="bg-neutral-100 flex flex-col items-center justify-center relative overflow-visible">

            <div className="container flex w-full flex-col gap-40 relative items-centerlg:gap-20"
            >
                <motion.div
                    className="absolute -top-20 left-0 size-50 rounded-full border-2 bg-background border-tertiary-200 pointer-events-none hidden lg:block"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.9, duration: 0.3 }}
                />
                <motion.div
                    className="absolute top-0 right-0 size-50 rounded-full border-2 bg-background border-tertiary-200 pointer-events-none hidden lg:block"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.9, duration: 0.3 }}
                />

                <div className="container flex w-full flex-col gap-40 px-4 relative items-center lg:gap-20">

                    <motion.div
                        className="absolute -bottom-10 left-40 size-80 rounded-full border-t-2 bg-linear-to-b from-background to-transparent border-tertiary-200 pointer-events-none hidden lg:block"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.9, duration: 0.3 }}
                    />
                    <motion.div
                        className="absolute -bottom-10 right-35 size-80 rounded-full border-t-2 bg-linear-to-b from-background to-transparent border-tertiary-200 pointer-events-none hidden lg:block"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.9, duration: 0.3 }}
                    />
                    <motion.div
                        className="absolute md:-bottom-20 bottom-0 lg:top-60 size-73 lg:size-156 rounded-full bg-linear-to-b from-secondary-200 from-50% to-transparent to-50% pointer-events-none"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.9, duration: 0.3 }}
                    />
                    <motion.div
                        className="w-full flex flex-col items-center justify-center gap-2 lg:gap-10 z-10"
                        initial={{ opacity: 0, }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5, duration: 0.3 }}
                    >
                        <h2 className="font-bold text-2xl lg:text-4xl text-center *:text-pretty">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit
                        </h2>
                        <div className="grid grid-cols-2 gap-6 lg:gap-10 mt-8 w-full z-3">
                            <div className="w-fit bg-red-100 border-2 border-red-200 rounded-[7px] py-2 px-4 flex flex-row items-center gap-2 md:translate-x-10 xl:translate-x-20 shadow-sm">
                                <BookOpenIcon className="size-7" />
                                <p className="lg:text-[20px] font-medium">Materi Tidak Lengkap</p>
                            </div>
                            <div className="w-fit bg-red-100 border-2 border-red-200 rounded-[7px] py-2 px-4 flex flex-row items-center gap-2 md:translate-x-30 xl:translate-x-70 shadow-sm">
                                <Pocket className="size-7" />
                                <p className="lg:text-[20px] font-medium">Skor TryOut Stagnan</p>
                            </div>
                            <div className="w-fit bg-red-100 border-2 border-red-200 rounded-[7px] py-2 px-4 flex flex-row items-center gap-2 md:translate-x-20 xl:translate-x-55 shadow-sm">
                                <CloudLightningIcon className="size-7" />
                                <p className="lg:text-[20px] font-medium">Mudah Burnout & Stress</p>
                            </div>
                            <div className="w-fit bg-red-100 border-2 border-red-200 rounded-[7px] py-2 px-4 flex flex-row items-center gap-2 md:translate-x-20 xl:translate-x-50 shadow-sm">
                                <Frown className="size-7" />
                                <p className="lg:text-[20px] font-medium">Bingung Memilih Jurusan</p>
                            </div>
                            <div className="w-fit bg-red-100 border-2 border-red-200 rounded-[7px] py-2 px-4 flex flex-row items-center gap-2 md:translate-x-10 xl:translate-x-30 shadow-sm">
                                <ArrowUpLeftIcon className="size-7" />
                                <p className="lg:text-[20px] font-medium">Belajar Tanpa Arah</p>
                            </div>
                            <div className="w-fit bg-red-100 border-2 border-red-200 rounded-[7px] py-2 px-4 flex flex-row items-center gap-2 md:translate-x-20 xl:translate-x-80 shadow-sm">
                                <FileIcon className="size-7" />
                                <p className="lg:text-[20px] font-medium">Buta Soal Pola SNBT</p>
                            </div>
                        </div>
                    </motion.div>

                    <Image
                        src="/avatar/testimone-avatar.webp"
                        alt=""
                        width={600}
                        height={600}
                        className="absolute bottom-30 lg:bottom-20 lg:top-25 w-50 lg:w-95 z-2"
                    />
                    <div
                        className="w-full flex flex-col items-center justify-center gap-2 lg:gap-10"

                    >

                        <div className="bg-primary-300 border-2 z-2 border-primary-400 text-neutral-100 w-full lg:w-7/10 rounded-2xl px-1 lg:px-10 py-8 flex flex-col gap-4 relative overflow-hidden">
                            <p className="z-2 font-bold text-xl lg:text-3xl text-center">Putus <span className="text-secondary-200 italic">Rantai Belajar Salah</span>,
                                Bangun <span className="text-secondary-200 italic">Fondasi</span> Nilai Maksimal.</p>
                            <p className="z-2 text-center text-sm lg:text-[18px] lg:px-38">Dapatkan fasilitas lengkap untuk membentuk Study Habit serta mental tangguh hingga dunia kampus.</p>
                            <Image
                                src="/decorations/pencil.webp"
                                alt=""
                                layout="constrained"
                                width={200}
                                height={200}
                                className="absolute -right-20 -scale-x-100 hidden lg:block"
                            />
                            <Image
                                src="/decorations/acorn-2.webp"
                                alt=""
                                layout="constrained"
                                width={130}
                                height={130}
                                className="absolute left-0.5 bottom-0.5 rounded-2xl hidden lg:block"
                            />
                        </div>
                    </div>

                </div>
            </div>
            {/* v */}
            <div className="absolute inset-0 inset-y-0 bg-tertiary-100 [clip-path:polygon(100%_100%,0%_100%,100%_64%,100%_100%,0_100%,0_64%)] sm:[clip-path:polygon(49%_100%,49%_100%,100%_38%,100%_100%,0_100%,0_38%)] z-0" />
        </section>
    );
}
