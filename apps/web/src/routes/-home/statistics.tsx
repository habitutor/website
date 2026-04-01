import {
  ArrowUpLeftIcon,
  BookOpenIcon,
  CloudLightningIcon,
  FileIcon,
  ShieldCheckIcon,
  SmileySadIcon,
} from "@phosphor-icons/react";
import { Image } from "@unpic/react";
import { motion } from "motion/react";

export function Statistics() {
  return (
    <section className="relative flex flex-col items-center justify-center overflow-visible bg-neutral-100">
      <div className="items-centerlg:gap-20 relative container flex w-full flex-col gap-40">
        <motion.div
          className="pointer-events-none absolute -top-20 left-0 hidden size-50 rounded-full border-2 border-tertiary-200 bg-background lg:block"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.9, duration: 0.3 }}
        />
        <motion.div
          className="pointer-events-none absolute top-0 right-0 hidden size-50 rounded-full border-2 border-tertiary-200 bg-background lg:block"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.9, duration: 0.3 }}
        />

        <div className="relative container flex w-full flex-col items-center gap-40 px-4 lg:gap-20">
          <motion.div
            className="pointer-events-none absolute -bottom-10 left-40 hidden size-80 rounded-full border-t-2 border-tertiary-200 bg-linear-to-b from-background to-transparent lg:block"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.9, duration: 0.3 }}
          />
          <motion.div
            className="pointer-events-none absolute right-35 -bottom-10 hidden size-80 rounded-full border-t-2 border-tertiary-200 bg-linear-to-b from-background to-transparent lg:block"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.9, duration: 0.3 }}
          />
          <motion.div
            className="pointer-events-none absolute bottom-0 size-73 rounded-full bg-linear-to-b from-secondary-200 from-50% to-transparent to-50% md:-bottom-20 lg:top-60 lg:size-156"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.9, duration: 0.3 }}
          />
          <motion.div
            className="z-10 flex w-full flex-col items-center justify-center gap-2 lg:gap-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <h2 className="text-center text-2xl font-bold *:text-pretty lg:text-4xl">
              Ngerasa Persiapan SNBT Kamu <span className="text-primary-300">Masih Gini-Gini Aja</span>?
            </h2>
            <div className="z-3 mt-8 grid w-full grid-cols-2 gap-6 lg:gap-10">
              <div className="flex w-fit flex-row items-center gap-2 rounded-[7px] border-2 border-red-200 bg-red-100 px-4 py-2 shadow-sm md:translate-x-10 xl:translate-x-20">
                <BookOpenIcon className="size-7" />
                <p className="font-medium lg:text-[20px]">Materi Tidak Lengkap</p>
              </div>
              <div className="flex w-fit flex-row items-center gap-2 rounded-[7px] border-2 border-red-200 bg-red-100 px-4 py-2 shadow-sm md:translate-x-30 xl:translate-x-70">
                <ShieldCheckIcon className="size-7" />
                <p className="font-medium lg:text-[20px]">Skor TryOut Stagnan</p>
              </div>
              <div className="flex w-fit flex-row items-center gap-2 rounded-[7px] border-2 border-red-200 bg-red-100 px-4 py-2 shadow-sm md:translate-x-20 xl:translate-x-55">
                <CloudLightningIcon className="size-7" />
                <p className="font-medium lg:text-[20px]">Mudah Burnout & Stress</p>
              </div>
              <div className="flex w-fit flex-row items-center gap-2 rounded-[7px] border-2 border-red-200 bg-red-100 px-4 py-2 shadow-sm md:translate-x-20 xl:translate-x-50">
                <SmileySadIcon className="size-7" />
                <p className="font-medium lg:text-[20px]">Bingung Memilih Jurusan</p>
              </div>
              <div className="flex w-fit flex-row items-center gap-2 rounded-[7px] border-2 border-red-200 bg-red-100 px-4 py-2 shadow-sm md:translate-x-10 xl:translate-x-30">
                <ArrowUpLeftIcon className="size-7" />
                <p className="font-medium lg:text-[20px]">Belajar Tanpa Arah</p>
              </div>
              <div className="flex w-fit flex-row items-center gap-2 rounded-[7px] border-2 border-red-200 bg-red-100 px-4 py-2 shadow-sm md:translate-x-20 xl:translate-x-80">
                <FileIcon className="size-7" />
                <p className="font-medium lg:text-[20px]">Buta Soal Pola SNBT</p>
              </div>
            </div>
          </motion.div>

          <Image
            src="/avatar/testimone-avatar.webp"
            alt=""
            width={600}
            height={600}
            className="absolute bottom-30 z-2 w-50 lg:top-25 lg:bottom-20 lg:w-95"
          />
          <div className="flex w-full flex-col items-center justify-center gap-2 lg:gap-10">
            <div className="relative z-2 flex w-full flex-col gap-4 overflow-hidden rounded-2xl border-2 border-primary-400 bg-primary-300 px-1 py-8 text-neutral-100 lg:w-7/10 lg:px-10">
              <p className="z-2 text-center text-xl font-bold lg:text-3xl">
                Putus <span className="text-secondary-200 italic">Rantai Belajar Salah</span>, Bangun{" "}
                <span className="text-secondary-200 italic">Fondasi</span> Nilai Maksimal.
              </p>
              <p className="z-2 text-center text-sm lg:px-38 lg:text-[18px]">
                Dapatkan fasilitas lengkap untuk membentuk Study Habit serta mental tangguh hingga dunia kampus.
              </p>
              <Image
                src="/decorations/pencil.webp"
                alt=""
                layout="constrained"
                width={200}
                height={200}
                className="absolute -right-20 hidden -scale-x-100 lg:block"
              />
              <Image
                src="/decorations/acorn-2.webp"
                alt=""
                layout="constrained"
                width={130}
                height={130}
                className="absolute bottom-0.5 left-0.5 hidden rounded-2xl lg:block"
              />
            </div>
          </div>
        </div>
      </div>
      {/* v */}
      <div className="absolute inset-0 inset-y-0 z-0 bg-tertiary-100 [clip-path:polygon(100%_100%,0%_100%,100%_64%,100%_100%,0_100%,0_64%)] sm:[clip-path:polygon(49%_100%,49%_100%,100%_38%,100%_100%,0_100%,0_38%)]" />
    </section>
  );
}
