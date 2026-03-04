import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { motion } from "motion/react";
import { MotionPulse } from "@/components/motion/motion-components";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";


export function Hero() {

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <MotionPulse>
          <div className="absolute left-30 top-50 w-15 h-15 rounded-full bg-neutral-100 border-2 border-neutral-200" />
        </MotionPulse>

        <MotionPulse>
          <div className="absolute left-10 top-70 w-23 h-23 rounded-full bg-[#C5F5DC] border-2 border-green-100" />
        </MotionPulse>

        <MotionPulse>
          <div className="absolute top-90 left-15 w-66 h-66 rounded-full bg-secondary-100 border-secondary-200 border-2" />
        </MotionPulse>

        <MotionPulse>
          <div className="absolute right-40 top-70 w-15 h-15 rounded-full bg-neutral-100 border-2 border-neutral-200" />
        </MotionPulse>

        <MotionPulse>
          <div className="absolute right-5 top-70 w-23 h-23 rounded-full bg-secondary-100 border-2 border-secondary-200" />
        </MotionPulse>

        <MotionPulse>
          <div className="absolute top-90 right-10 w-75 h-75 rounded-full bg-[#C5F5DC] border-2 border-green-100" />
        </MotionPulse>
      </div>
      <main className="relative mx-auto flex w-full flex-col items-center justify-center px-4 overflow-hidden py-22 ">
        <div className="container md:mx-auto flex shrink-0 flex-col pt-8 md:pt-20 space-y-10 md:space-y-13 z-1 items-center">
          <div className="flex max-w-4xl flex-col items-center gap-1 text-center md:gap-2">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0 }}
              className="font-sans text-3xl font-extrabold sm:text-4xl md:text-5xl md:leading-18 leading-10"
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
      <div className="relative overflow-hidden w-screen h-20 md:h-40 xl:h-50 pointer-events-none">
        <div className="absolute inset-0 inset-y-0 bg-tertiary-100 xl:[clip-path:polygon(25%_100%,75%_100%,100%_0,100%_100%,0_100%,0_0)] 2xl:[clip-path:polygon(35%_100%,65%_100%,100%_0,100%_100%,0_100%,0_0)] md:[clip-path:polygon(20%_100%,80%_100%,100%_0,100%_100%,0_100%,0_0)] [clip-path:polygon(40%_100%,60%_100%,100%_0,100%_100%,0_100%,0_0)] z-2" />
        <div className="absolute rounded-t-full w-230 h-115 bg-red-100 border-2 border-red-200 left-1/2 -translate-x-1/2" />
        <div className="flex flex-col items-center justify-end pb-10 h-full z-10 relative">
          <p className="text-lg md:text-2xl font-bold text-center">Ultimate Bundling & Privilege</p>
          <p className="text-sm md:text-lg text-center">Paket yang paling worth it, Paling lengkap dan murah!!</p>
        </div>
      </div>

    </section>
  );
}
