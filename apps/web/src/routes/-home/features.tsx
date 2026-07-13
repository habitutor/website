import { Image } from "@unpic/react";
import { motion } from "motion/react";
import Carousel from "@/components/home/mentor-carousel";
import { MotionPulse } from "@/components/motion/motion-components";
import { useIsBreakpoint } from "@/hooks/browser/use-is-breakpoint";
import { COMMUNITY_LINKS } from "@/lib/community-links";
import { DATA } from "./data";
import { FeatureCard } from "./feature-card";

export function Features() {
  const isMobile = useIsBreakpoint("max", 860);

  return (
    <section className="space-y-3 overflow-x-hidden bg-tertiary-100 py-10 md:space-y-8">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: 0 }}
        className="text-center text-2xl font-bold md:text-[34px]"
      >
        Kenapa Harus Berjuang Bareng <span className="text-primary-300">Habitutor</span>?
      </motion.h2>
      <div className="container mx-auto flex w-full flex-col gap-3 px-4 md:grid md:grid-cols-6">
        {!isMobile && (
          <div className="relative z-10 md:col-span-6">
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
                  className="hidden h-auto w-60 md:block"
                />
              </motion.div>
            </MotionPulse>
          </div>
        )}

        <FeatureCard
          className="md:col-span-3"
          imageSrc="/images/dashboard-page.webp"
          imageAlt="Habitutor Dashboard"
          title={
            <>
              Bersama <span className="text-primary-300">Habitutor</span>
            </>
          }
          description={
            <>
              Mulai dari 3 menit sehari. Habitutor{" "}
              <span className="font-bold text-secondary-700">membangun kebiasaan</span> lewat streak dan latihan mini
              yang ringan.
            </>
          }
          decorations={
            <div className="pointer-events-none absolute top-40 right-8 z-0 size-24 rounded-full border-2 border-primary-200 bg-primary-100 md:top-56 md:right-16 md:size-40" />
          }
        />

        <FeatureCard
          className="md:col-span-3"
          motionProps={{ transition: { duration: 0.3, delay: 0.1 } }}
          imageSrc="/images/kelas-page.webp"
          imageAlt="Video Bahas Soal"
          title={
            <>
              <span className="text-primary-300">250+ Video</span> Bahas Soal
            </>
          }
          description={
            <>
              Contoh <span className="font-bold text-secondary-700">cara mengerjakan soal</span> dari mahasiswa UI, ITB,
              dan UGM
            </>
          }
          decorations={
            <>
              <div className="pointer-events-none absolute top-16 -right-10 z-0 size-40 rounded-full border-2 border-yellow-200 bg-yellow-100 md:top-24 md:-right-8 md:size-56" />
              <div className="pointer-events-none absolute top-36 left-4 z-0 size-20 rounded-full border-2 border-yellow-200 bg-yellow-100 md:top-48 md:size-28" />
            </>
          }
        />

        {!isMobile && (
          <MotionPulse className="z-15">
            <motion.div
              className="relative -top-24 left-250 lg:left-280 xl:left-350"
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
                className="absolute z-10 hidden h-auto w-60 md:block"
              />
            </motion.div>
          </MotionPulse>
        )}

        <div className="relative md:col-span-6">
          <motion.div
            className="relative z-1 flex min-h-132 flex-col rounded-2xl border border-neutral-200 bg-neutral-100 p-5 md:min-h-125 md:justify-end md:px-6 md:pt-10 md:pb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <div className="mb-4 text-center">
              <h2 className="text-xl font-bold md:text-3xl">
                Belajar Lebih <span className="text-primary-300">Percaya Diri</span> Dengan{" "}
                <span className="text-primary-300">Pengajar Terpercaya</span>
              </h2>
              <p className="text-sm leading-relaxed text-foreground md:text-lg">
                Mentor dari <span className="font-bold text-secondary-700">berbagai universitas</span> siap menemani
                proses belajarmu.
              </p>
            </div>

            <Carousel items={[...DATA.mentor]} showNavigation={true} autoPlay={false} className="" />
          </motion.div>
        </div>

        {!isMobile && (
          <div className="relative z-10 flex md:col-span-6">
            <MotionPulse>
              <motion.div
                className="absolute -top-24 -left-30 translate-x-5"
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
                  className="hidden h-auto w-40 md:block"
                />
              </motion.div>
            </MotionPulse>
          </div>
        )}

        <FeatureCard
          className="md:col-span-2"
          motionProps={{ transition: { duration: 0.3, delay: 0.3 } }}
          imageSrc="/images/quiz-page.webp"
          imageAlt="BAB Prioritas"
          title="Kejar BAB Prioritas"
          description={
            <>
              Udah ga sempet belajar semua, <span className="font-bold text-secondary-700">Belajar YKKA</span> (Yang
              Keluar Keluar Aja)
            </>
          }
          imageClassName="max-w-52 sm:max-w-60 md:max-w-64"
          decorations={
            <div className="pointer-events-none absolute top-32 left-0 z-0 size-32 rounded-full border-2 border-secondary-200 bg-secondary-100 md:top-48 md:size-40" />
          }
        />

        <motion.div
          className="relative flex min-h-88 flex-col overflow-hidden rounded-2xl bg-neutral-100 p-5 shadow-sm sm:min-h-96 md:col-span-2 md:min-h-112 md:p-8 md:pt-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <div className="relative z-10 mb-4 space-y-2 text-center md:text-left">
            <h3 className="text-xl font-bold md:text-3xl">
              Jangan <span className="text-primary-300">Melangkah</span> Sendiri
            </h3>
            <p className="text-sm leading-relaxed text-foreground md:text-lg">
              Temukan <span className="font-bold text-secondary-700">komunitas sesama pembelajar</span> dalam perjalanan
              belajar yang didukung penuh.
            </p>
          </div>

          <div className="pointer-events-none absolute bottom-8 left-8 z-0 size-28 rounded-full border-2 border-tertiary-200 bg-background md:bottom-12 md:left-10 md:size-36" />
          <div className="pointer-events-none absolute right-6 bottom-24 z-0 size-16 rounded-full border-2 border-tertiary-200 bg-background md:bottom-28 md:size-20" />

          <div className="relative z-10 mt-auto flex min-h-44 items-end justify-center gap-4 pt-4 sm:min-h-48 md:min-h-52">
            <motion.a
              href={COMMUNITY_LINKS.discord}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Join Discord Habitutor"
              className="flex size-28 items-center justify-center rounded-full border-4 border-primary-300 bg-primary-200 sm:size-32 md:size-36"
              whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
            >
              <Image
                src="/icons/discord.svg"
                alt="Discord"
                width={196}
                height={196}
                className="h-auto w-16 -rotate-12 object-contain sm:w-20 md:w-24"
              />
            </motion.a>

            <motion.a
              href={COMMUNITY_LINKS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Join WhatsApp Habitutor"
              className="flex size-28 items-center justify-center rounded-full border-4 border-fourtiary-300 bg-green-200 sm:size-32 md:size-36"
              whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
            >
              <Image
                src="/icons/whatsapp.svg"
                alt="WhatsApp"
                width={120}
                height={120}
                className="h-auto w-14 rotate-10 object-contain sm:w-16 md:w-20"
              />
            </motion.a>
          </div>
        </motion.div>

        <FeatureCard
          className="md:col-span-2"
          motionProps={{ transition: { duration: 0.3, delay: 0.5 } }}
          imageSrc="/images/classroom-page.webp"
          imageAlt="Reading Habits"
          title={
            <>
              <span className="text-primary-300">Reading Habits</span> dan{" "}
              <span className="text-primary-300">Mabok Vocab</span>
            </>
          }
          description="Buat ningkatin literasi dan vocabulary!"
          imageClassName="max-w-52 sm:max-w-60 md:max-w-64"
          decorations={
            <>
              <div className="pointer-events-none absolute top-28 right-0 z-0 size-32 rounded-full border-2 border-red-200 bg-red-100 md:top-40 md:size-40" />
              <div className="pointer-events-none absolute top-16 left-2 z-0 size-16 rounded-full border-2 border-red-200 bg-red-100 md:size-20" />
            </>
          }
        />

        <FeatureCard
          className="md:col-span-3"
          motionProps={{ transition: { duration: 0.3, delay: 0.6 } }}
          imageSrc="/images/braingym-page.webp"
          imageAlt="Brain Gym"
          title={
            <>
              Asah Skill SNBT di <span className="text-primary">Brain Gym</span>.
            </>
          }
          description={
            <>
              Tes kemampuan basic pakai ribuan soal dalam bentuk{" "}
              <span className="font-bold text-secondary-700">games</span>!
            </>
          }
          decorations={
            <>
              <div className="pointer-events-none absolute top-24 -right-8 z-0 size-40 rounded-full border-2 border-tertiary-600 bg-tertiary-400 md:top-32 md:-right-6 md:size-56" />
              <div className="pointer-events-none absolute top-16 left-2 z-0 size-16 rounded-full border-2 border-tertiary-600 bg-tertiary-400 md:size-24" />
            </>
          }
        />

        <FeatureCard
          className="md:col-span-3"
          motionProps={{ transition: { duration: 0.3, delay: 0.7 } }}
          imageSrc="/images/try-out.webp"
          imageAlt="Tryout"
          title={
            <>
              Simulasi dengan <span className="text-primary">Tryout</span> Rutin.
            </>
          }
          description={
            <>
              <span className="font-bold text-secondary-700">70% snbt mirip tahun lalu</span>, cobain try out Habitutor{" "}
              <span className="font-bold text-secondary-700">gratis</span> sekarang!
            </>
          }
          decorations={
            <>
              <div className="pointer-events-none absolute top-40 left-2 z-0 size-24 rounded-full border-2 border-neutral-300 bg-neutral-200 md:top-52 md:size-40" />
              <div className="pointer-events-none absolute top-20 right-8 z-0 size-20 rounded-full border-2 border-neutral-300 bg-neutral-200 md:top-24 md:size-32" />
            </>
          }
        />
      </div>
    </section>
  );
}
