import { Image } from "@unpic/react";
import { motion } from "motion/react";
import Carousel from "@/components/carousel";
import { MotionPulse } from "@/components/motion";
import { DATA } from "./data";
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint";

export function Features() {
  const isMobile = useIsBreakpoint("max", 860);

  return (
    <section className="overflow-x-hidden space-y-3 md:space-y-8 bg-tertiary-100 py-10">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: 0 }}
        className="text-center text-2xl font-bold md:text-[34px]"
      >
        Lorem ipsum dolor sit amet, consectetur adipiscing elit
      </motion.h2>
      <div className="container mx-auto flex w-full flex-col gap-3 px-4 md:grid md:grid-cols-6">
        {!isMobile && (
          <div className="relative md:col-span-6 z-10">
            <MotionPulse>
              <motion.div
                className="absolute -top-24 -left-30"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <Image
                  src="/decorations/graduation-cap.webp"
                  alt=""
                  layout="constrained"
                  width={400}
                  height={400}
                  className="h-auto w-60 md:block hidden"
                />
              </motion.div>
            </MotionPulse>
          </div>
        )}
        <motion.div
          className="relative overflow-hidden rounded-2xl bg-neutral-100 p-5 md:p-10 md:pt-15 min-h-75 md:min-h-125 shadow-sm md:col-span-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute z-0 size-30 rounded-full border-2 border-primary-200 bg-primary-100 top-50 md:top-80 md:left-25 md:size-54" />

          <div className="relative z-10 mb-4 space-y-2 md:text-left text-center">
            <motion.h3
              className="font-bold text-xl md:text-3xl"
              whileHover={{
                rotate: [-1, 1, -1, 0],
                transition: { duration: 0.3 },
              }}
            >
              Bersama <span className="text-primary-300">Habitutor</span>
            </motion.h3>
            <p className="text-foreground md:text-lg text-sm leading-relaxed">
              Mulai dari 3 menit sehari. Habitutor{" "}
              <span className="font-bold text-secondary-700">
                membangun kebiasaan
              </span>{" "}
              lewat streak dan latihan mini yang ringan.
            </p>
          </div>

          <motion.div
            className="absolute z-10 md:-bottom-2 -bottom-20 -right-10 md:right-0"
            whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
          >
            <Image
              src="/images/dashboard-page.webp"
              alt="Habitutor Dashboard"
              width={800}
              height={600}
              className="w-auto max-h-60 md:max-h-70 h-full border-2 border-neutral-200"
            />
          </motion.div>
        </motion.div>

        <motion.div
          className="relative overflow-hidden flex justify-center rounded-2xl bg-neutral-100 p-5 md:p-10 md:pt-15 min-h-85 md:min-h-125 shadow-sm md:col-span-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="absolute z-0 size-60 md:size-95 rounded-full border-2 border-yellow-200 bg-yellow-100 top-25 -right-20 md:top-40 md:-right-30" />
          <div className="absolute z-0 size-35 rounded-full border-2 border-yellow-200 bg-yellow-100 top-55 md:top-100 -left-10 md:-left-5" />

          <div className="relative z-10 mb-4 space-y-2 md:text-left text-center">
            <h3 className="font-bold text-xl md:text-3xl">
              <span className="text-primary-300">250+ Video</span> Bahas Soal
            </h3>
            <p className="text-foreground md:text-lg text-sm leading-relaxed">
              Contoh{" "}
              <span className="font-bold text-secondary-700">
                cara mengerjakan soal
              </span>{" "}
              dari mahasiswa UI, ITB, dan UGM
            </p>
          </div>

          <motion.div
            className="absolute z-10 md:translate-y-0 -bottom-10 md:-bottom-2"
            whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
          >
            <Image
              src="/images/kelas-page.webp"
              alt="Video Bahas Soal"
              width={500}
              height={600}
              layout="constrained"
              className="w-auto max-h-60 md:max-h-70 h-full border-2 border-neutral-200"
            />
          </motion.div>
        </motion.div>

        {!isMobile && (
          <MotionPulse className="z-15">
            <motion.div
              className="relative -top-24  left-250"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <Image
                src="/decorations/acorn.webp"
                alt=""
                width={400}
                height={400}
                className="absolute h-auto w-60 z-10 md:block hidden"
              />
            </motion.div>
          </MotionPulse>
        )}

        <div className="relative md:col-span-6">
          <motion.div
            className="relative z-1 flex flex-col rounded-2xl border min-h-132 md:min-h-125 md:justify-end border-neutral-200 bg-neutral-100 p-5 md:px-6 md:pb-6 md:pt-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <div className="mb-4 text-center">
              <h2 className="font-bold text-xl md:text-3xl">
                Belajar Lebih{" "}
                <span className="text-primary-300">Percaya Diri</span> Dengan{" "}
                <span className="text-primary-300">Pengajar Terpercaya</span>
              </h2>
              <p className="text-foreground md:text-lg text-sm leading-relaxed">
                Mentor dari{" "}
                <span className="font-bold text-secondary-700">
                  berbagai universitas
                </span>{" "}
                siap menemani proses belajarmu.
              </p>
            </div>

            <Carousel
              items={[...DATA.mentor]}
              showNavigation={true}
              autoPlay={false}
              className=""
            />
          </motion.div>
        </div>

        {!isMobile && (
          <div className="relative flex md:col-span-6 z-10">
            <MotionPulse>
              <motion.div
                className="absolute -top-24 -left-30"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <Image
                  src="/decorations/book-mirror.webp"
                  alt=""
                  layout="constrained"
                  width={400}
                  height={400}
                  className="h-auto w-40 md:block hidden"
                />
              </motion.div>
            </MotionPulse>
          </div>
        )}

        <motion.div
          className="relative overflow-hidden rounded-2xl bg-neutral-100 p-5 md:p-10 md:pt-15 min-h-80 md:min-h-125 shadow-sm md:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="absolute z-0 size-50 rounded-full border-2 border-secondary-200 bg-secondary-100 top-45 md:top-90 -left-10 md:-left-10" />

          <div className="relative z-10 mb-4 space-y-2 md:text-left text-center">
            <h3 className="font-bold text-xl md:text-3xl">
              Kejar BAB Prioritas
            </h3>
            <p className="text-foreground md:text-lg text-sm leading-relaxed">
              Udah ga sempet belajar semua,{" "}
              <span className="font-bold text-secondary-700">Belajar YKKA</span>{" "}
              (Yang Keluar Keluar Aja)
            </p>
          </div>

          <motion.div
            className="absolute z-10 -bottom-15 md:-bottom-2 translate-x-1/5"
            whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
          >
            <Image
              src="/images/quiz-page.webp"
              alt="BAB Prioritas"
              width={800}
              height={600}
              className="w-auto max-h-60 md:max-h-70 h-70"
            />
          </motion.div>
        </motion.div>

        <motion.div
          className="relative overflow-hidden rounded-2xl bg-neutral-100 p-5 md:p-10 md:pt-15 min-h-85 md:min-h-125 shadow-sm md:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <div className="relative z-10 mb-4 space-y-2 md:text-left text-center">
            <h3 className="font-bold text-xl md:text-3xl">
              Jangan <span className="text-primary-300">Melangkah</span> Sendiri
            </h3>
            <p className="text-foreground md:text-lg text-sm leading-relaxed">
              Temukan{" "}
              <span className="font-bold text-secondary-700">
                komunitas sesama pembelajar
              </span>{" "}
              dalam perjalanan belajar yang didukung penuh.
            </p>
          </div>

          {/* bubbles */}
          <div className="absolute z-0 size-40 rounded-full border-2 border-tertiary-200 bg-background left-18 md:left-10 -bottom-10 md:-bottom-10" />
          <div className="absolute z-0 size-16 rounded-full border-2 border-tertiary-200 bg-background left-1 bottom-35 md:bottom-40" />
          <div className="absolute z-0 size-19 hidden md:block rounded-full border-2 border-tertiary-200 bg-background left-50 md:bottom-42" />
          <div className="absolute z-0 size-40 rounded-full border-2 border-tertiary-200 bg-background -right-20 md:-right-10 bottom-20 md:bottom-50" />

          <div className="relative z-10">
            <motion.div
              className="absolute size-38 md:size-45 top-10 -left-3 md:-left-9 flex items-center justify-center rounded-full bg-primary-200 border-4 border-primary-300"
              whileHover={{ scale: 1.1, transition: { duration: 0.3 } }}
            >
              <Image
                src="/icons/discord.svg"
                alt="Discord"
                width={196}
                height={196}
                className="h-auto w-27 md:w-34 -rotate-12 object-contain"
              />
            </motion.div>

            <motion.div
              className="absolute size-38 top-20 right-0 md:-right-13 md:size-45 flex items-center justify-center rounded-full bg-green-200 border-4 border-fourtiary-300"
              whileHover={{ scale: 1.1, transition: { duration: 0.3 } }}
            >
              <Image
                src="/icons/whatsapp.svg"
                alt="WhatsApp"
                width={120}
                height={120}
                className="h-auto w-23 md:w-30 rotate-10"
              />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className="relative overflow-hidden flex rounded-2xl bg-neutral-100 p-5 md:p-10 md:pt-15 min-h-80 md:min-h-125 shadow-sm md:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <div className="absolute z-0 size-50 rounded-full border-2 border-red-200 bg-red-100 top-45 md:top-90 -right-10" />
          <div className="absolute z-0 size-20 rounded-full border-2 border-red-200 bg-red-100 top-25 md:top-45 -left-5" />

          <div className="relative z-10 mb-4 space-y-2 text-center md:text-left">
            <h3 className="font-bold text-xl md:text-3xl">
              <span className="text-primary-300">Reading Habits</span> dan{" "}
              <span className="text-primary-300">Mabok Vocab</span>
            </h3>
            <p className="text-foreground md:text-lg text-sm leading-relaxed">
              Buat ningkatin literasi dan vocabulary!
            </p>
          </div>

          <motion.div
            className="absolute z-10 -bottom-15 md:-bottom-2 -translate-x-1/5"
            whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
          >
            <Image
              src="/images/classroom-page.webp"
              alt="Reading Habits"
              width={400}
              height={300}
              layout="constrained"
              className="w-auto max-h-60 md:max-h-70 h-70 border-2 border-neutral-200"
            />
          </motion.div>
        </motion.div>

        <motion.div
          className="relative overflow-hidden flex justify-center rounded-2xl bg-neutral-100 p-5 md:p-10 md:pt-15 min-h-85 md:min-h-125 shadow-sm md:col-span-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <div className="absolute z-0 size-60 md:size-95 rounded-full border-2 border-tertiary-600 bg-tertiary-400 top-50 -right-30 md:top-70 md:-right-30" />
          <div className="absolute z-0 size-22 md:size-35 rounded-full border-2 border-tertiary-600 bg-tertiary-400 top-35 md:top-40 -left-10 md:-left-5" />

          <div className="relative z-10 mb-4 space-y-2">
            <h3 className="font-bold text-xl md:text-3xl">
              Asah Skill SNBT di <span className="text-primary">Brain Gym</span>
              .
            </h3>
            <p className="text-foreground md:text-lg text-sm leading-relaxed">
              Tes kemampuan basic pakai ribuan soal dalam bentuk{" "}
              <span className="font-bold text-secondary-700">games</span>!
            </p>
          </div>

          <motion.div
            className="absolute z-10 md:translate-y-0 -bottom-10 md:bottom-0"
            whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
          >
            <Image
              src="/images/braingym-page.webp"
              alt="Brain Gym"
              width={800}
              height={600}
              layout="constrained"
              className="w-auto max-h-50 md:max-h-70 h-full border-2 border-neutral-200"
            />
          </motion.div>
        </motion.div>

        <motion.div
          className="relative overflow-hidden flex justify-center rounded-2xl bg-neutral-100 p-5 md:p-10 md:pt-15 min-h-85 md:min-h-125 shadow-sm md:col-span-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <div className="absolute z-0 size-30 rounded-full border-2 border-neutral-300 bg-neutral-200 top-58 md:top-80 -left-5 md:left-2 md:size-54" />
          <div className="absolute z-0 size-30 rounded-full border-2 border-neutral-300 bg-neutral-200 top-30 md:top-30 left-75 md:left-115 md:size-54" />

          <div className="relative z-10 mb-4 space-y-2">
            <h3 className="font-bold text-xl md:text-3xl">
              Simulasi dengan <span className="text-primary">Tryout</span>{" "}
              Rutin.
            </h3>
            <p className="text-foreground md:text-lg text-sm leading-relaxed">
              <span className="font-bold text-secondary-700">
                70% snbt mirip tahun lalu
              </span>
              , cobain try out Habitutor{" "}
              <span className="font-bold text-secondary-700">gratis</span>{" "}
              sekarang!
            </p>
          </div>

          <motion.div
            className="absolute z-10 md:translate-y-0 -bottom-10 md:bottom-0"
            whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
          >
            <Image
              src="/images/braingym-page.webp"
              alt="Brain Gym"
              width={800}
              height={600}
              layout="constrained"
              className="w-auto max-h-50 md:max-h-70 h-full border-2 border-neutral-200"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
