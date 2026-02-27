import { motion } from "motion/react";
import { BookOpenIcon } from "lucide-react";
import { CloudLightningIcon } from "lucide-react";
import { Frown } from "lucide-react";
import { ArrowUpLeftIcon } from "lucide-react";
import { FileIcon } from "lucide-react";
import { Pocket } from "lucide-react";
import { Image } from "@unpic/react";

export function AboutUs() {
    return (
        <section className="bg-background flex flex-col items-center justify-center relative overflow-visible">

            <motion.div className="container flex w-full flex-col gap-40 relative items-centerlg:gap-20"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.9, duration: 0.3 }}>
                <motion.div
                    className="absolute -top-20 left-0 size-50 rounded-full border-2 bg-[#f4faff] border-tertiary-200 pointer-events-none hidden lg:block"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.9, duration: 0.3 }}
                />
                <motion.div
                    className="absolute top-0 right-0 size-50 rounded-full border-2 bg-[#f4faff] border-tertiary-200 pointer-events-none hidden lg:block"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.9, duration: 0.3 }}
                />

                <div className="container flex w-full flex-col gap-40 px-4 relative items-center overflow-hidden lg:gap-20">

                <motion.div
                    className="absolute -bottom-10 left-40 size-80 rounded-full border-2 bg-[#f4faff] border-tertiary-200 pointer-events-none hidden lg:block"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.9, duration: 0.3 }}
                />
                <motion.div
                    className="absolute -bottom-10 right-35 size-80 rounded-full border-2 bg-[#f4faff] border-tertiary-200 pointer-events-none hidden lg:block"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.9, duration: 0.3 }}
                />
                    <motion.div
                        className="w-full flex flex-col items-center justify-center gap-2 lg:gap-10 z-2"
                        initial={{ opacity: 0,}}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5, duration: 0.3 }}
                    >
                        <h2 className="font-bold text-2xl lg:text-4xl text-center *:text-pretty">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit
                        </h2>
                        <div className="grid grid-cols-2 gap-6 lg:gap-10 mt-8 w-full z-3">
                            <div className="w-fit bg-red-100 border-2 border-red-200 rounded-[7px] py-2 px-4 flex flex-row items-center gap-2 lg:translate-x-20 shadow-sm">
                                <BookOpenIcon className="size-7" />
                                <p className="lg:text-[20px] font-medium">Materi Tidak Lengkap</p>
                            </div>
                            <div className="w-fit bg-red-100 border-2 border-red-200 rounded-[7px] py-2 px-4 flex flex-row items-center gap-2 lg:translate-x-80 shadow-sm">
                                <Pocket className="size-7" />
                                <p className="lg:text-[20px] font-medium">Skor TryOut Stagnan</p>
                            </div>
                            <div className="w-fit bg-red-100 border-2 border-red-200 rounded-[7px] py-2 px-4 flex flex-row items-center gap-2 lg:translate-x-55 shadow-sm">
                                <CloudLightningIcon className="size-7" />
                                <p className="lg:text-[20px] font-medium">Mudah Burnout & Stress</p>
                            </div>
                            <div className="w-fit bg-red-100 border-2 border-red-200 rounded-[7px] py-2 px-4 flex flex-row items-center gap-2 lg:translate-x-50 shadow-sm">
                                <Frown className="size-7" />
                                <p className="lg:text-[20px] font-medium">Bingung Memilih Jurusan</p>
                            </div>
                            <div className="w-fit bg-red-100 border-2 border-red-200 rounded-[7px] py-2 px-4 flex flex-row items-center gap-2 lg:translate-x-30 shadow-sm">
                                <ArrowUpLeftIcon className="size-7" />
                                <p className="lg:text-[20px] font-medium">Belajar Tanpa Arah</p>
                            </div>
                            <div className="w-fit bg-red-100 border-2 border-red-200 rounded-[7px] py-2 px-4 flex flex-row items-center gap-2 lg:translate-x-90 shadow-sm">
                                <FileIcon className="size-7" />
                                <p className="lg:text-[20px] font-medium">Buta Soal Pola SNBT</p>
                            </div>
                        </div>
                    </motion.div>
                        
                    <Image
                        src="/avatar/testimone-avatar.webp"
                        alt=""
                        layout="constrained"
                        width={600}
                        height={600}
                        className="absolute -bottom-5 lg:top-25 w-80 lg:w-155"
                    />
                    <motion.div
                        className="w-full flex flex-col items-center justify-center gap-2 lg:gap-10"
                        initial={{ opacity: 0,}}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5, duration: 0.3 }}
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
                    </motion.div>

                </div>
            </motion.div>
                {/* v */}
                    {/* <motion.div
                        className="absolute bg-tertiary-100 size-80 lg:size-120 border-t-2 border-tertiary-200 -bottom-30 -right-35 lg:-bottom-50 lg:-right-30"
                        style={{ transform: "rotate(-25deg)" }}
                        initial={{ opacity: 0,}}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5, duration: 0.3 }}
                    />
                    <motion.div
                        className="absolute bg-tertiary-100 size-80 lg:size-120 border-t-2 border-tertiary-200 -bottom-30 -left-35 lg:-bottom-50 lg:-left-30"
                        style={{ transform: "rotate(25deg)" }}
                        initial={{ opacity: 0,}}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5, duration: 0.3 }}
                    /> */}
        </section>
    );
}