import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { motion } from "motion/react";
import { MotionPulse } from "@/components/motion/motion-components";
import { buttonVariants } from "@/components/ui/button";
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint";
import { cn } from "@/lib/utils";

const bars = [
  {
    height: 78,
    border: "border-tertiary-300",
    bg: "bg-tertiary-200",
    circleBorder: "border-primary-200",
    circleBg: "bg-primary-100",
    isHidden: true,
    image: "/decorations/acorn-mirror.webp",
    imageClassName: "translate-y-[-8px] scale-105",
  },
  {
    height: 120,
    border: "border-fourtiary-200",
    bg: "bg-fourtiary-100",
    circleBorder: "border-secondary-400",
    circleBg: "bg-secondary-300",
    isHidden: true,
    image: "/decorations/book-mirror.webp",
    imageClassName: "translate-y-[20px] scale-90",
  },
  {
    height: 156,
    border: "border-primary-200",
    bg: "bg-primary-100",
    circleBorder: "border-red-200",
    circleBg: "bg-red-100",
    isHidden: false,
    image: "/decorations/pencil.webp",
    imageClassName: "rotate-345 translate-y-[10px] scale-130",
  },
  {
    height: 208,
    border: "border-tertiary-600",
    bg: "bg-tertiary-500",
    circleBorder: "border-tertiary-200",
    circleBg: "bg-tertiary-100",
    isHidden: false,
    image: "/decorations/graduation-cap.webp",
    imageClassName: "translate-y-[-10px] scale-110 rotate-40",
  },
  {
    height: 293,
    border: "border-red-200",
    bg: "bg-red-100",
    circleBorder: "border-red-300",
    circleBg: "bg-red-200",
    isHidden: false,
    image: "/decorations/acorn-cards.webp",
    imageClassName: "scale-130",
  },
  {
    height: 370,
    border: "border-primary-300",
    bg: "bg-primary-200",
    circleBorder: "border-secondary-400",
    circleBg: "bg-secondary-300",
    isHidden: false,
    image: "/avatar/tupai-hero.webp",
    imageClassName: "scale-150 md:translate-y-[-30px]",
  },
] as const;

export function Hero() {
  const isMobile = useIsBreakpoint("max", 860);

  return (
    <section className="relative mx-auto flex w-full flex-col items-center justify-start overflow-hidden rounded-b-[40px] border-2 border-t-0 border-tertiary-200 bg-background px-4 pt-22 pb-10 shadow-[0_2px_2px_0_rgba(54,80,162,0.20)] md:pb-35">
      <div className="pointer-events-none inset-0 z-0 h-full w-full">
        <MotionPulse>
          <motion.div
            className="absolute top-100 -right-30 h-108 w-108 rounded-full border-2 border-tertiary-200 bg-tertiary-100 md:top-60 md:-right-70 md:h-200 md:w-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          />
        </MotionPulse>
        <MotionPulse>
          <motion.div
            className="absolute top-80 -right-10 h-20 w-20 rounded-full border-2 border-tertiary-200 bg-tertiary-100 md:top-13 md:-right-8 md:h-43 md:w-43"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          />
        </MotionPulse>
        <MotionPulse>
          <motion.div
            className="absolute top-84 right-15 h-9 w-9 rounded-full border-2 border-tertiary-200 bg-tertiary-100 md:top-10 md:right-36 md:h-15 md:w-15"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          />
        </MotionPulse>
        <MotionPulse>
          <motion.div
            className="absolute top-165 h-15 w-15 rounded-full border-2 border-tertiary-200 bg-tertiary-100 md:top-175 md:right-130 md:h-30 md:w-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          />
        </MotionPulse>
      </div>
      <div className="z-1 container flex shrink-0 flex-col space-y-10 pt-8 md:mx-auto md:space-y-13 md:pt-20">
        <div className="flex max-w-3xl flex-col items-start gap-1 text-left md:gap-2">
          <span className="text-primary-600 rounded-full border-2 border-neutral-300 bg-neutral-100 px-3 py-2 text-xs font-medium md:text-sm">
            Selama <span className="font-bold text-primary-400">2</span> Tahun Berdirinya Sudah Membantu{" "}
            <span className="font-bold text-primary-400">1.000+</span> Siswa Mencapai Mimpinya
          </span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0 }}
            className="font-sans text-3xl leading-10 font-bold sm:text-4xl md:text-5xl md:leading-18"
          >
            Ubah Persiapan Ujian{" "}
            <motion.span
              className="inline-block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Menjadi <span className="text-primary-300">Investasi Masa Depan</span>
            </motion.span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="max-w-xl text-sm sm:text-lg"
          >
            Tidak hanya membantumu menaklukkan SNBT, tapi Habitutor juga membentuk growth mindset untuk tantangan masa
            depan.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex w-full flex-col items-center justify-start gap-2 *:max-sm:text-xs md:flex-row md:flex-wrap md:items-start"
        >
          <Link to="/login" className={cn(buttonVariants({ variant: "lightBlue" }), "w-full md:w-fit")}>
            Mulai Belajar Sekarang
          </Link>
          <Link to="/dashboard" className={cn(buttonVariants({ variant: "outline" }), "w-full md:w-fit")}>
            Cara Kerjanya
          </Link>
        </motion.div>
      </div>

      <div className="z-1 container">
        <div className="flex h-60 w-full items-end gap-1">
          {bars.map((bar, i) => {
            const barHeight = isMobile ? Math.round(bar.height * 0.45) : bar.height;
            const initialHeight = isMobile ? 40 : 60;

            return (
              <div
                key={i}
                className={`flex w-full flex-col items-center justify-end ${bar.isHidden ? "hidden lg:flex" : ""}`}
              >
                <motion.div
                  transition={{
                    duration: 0.5,
                    delay: i * 0.15 + 0.6,
                    ease: "easeOut",
                  }}
                  className={`relative h-9 w-18 md:h-18 md:w-36 ${bar.circleBg} border-2 ${bar.circleBorder} z-3 origin-bottom rounded-t-full border-b-0 ${bar.isHidden ? "hidden md:block" : ""}`}
                >
                  <motion.div
                    transition={{
                      duration: 0.5,
                      delay: i * 0.15 + 0.6,
                      ease: "easeOut",
                    }}
                    className="flex items-center justify-center"
                  >
                    <Image
                      src={bar.image}
                      alt={`Circle ${i + 1}`}
                      layout="fullWidth"
                      className={`z-3 ${bar.imageClassName || ""}`}
                    />
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ height: initialHeight }}
                  animate={{ height: barHeight }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.15,
                    ease: "easeOut",
                  }}
                  className={`w-full ${bar.bg} ${bar.border} z-2 rounded-t-xl border-2 border-b-0 ${bar.isHidden ? "hidden lg:block" : ""}`}
                  style={{ height: barHeight }}
                />
              </div>
            );
          })}
        </div>
        <div className="h-4 w-full border-2 border-secondary-600 bg-secondary-400" />
      </div>

      {/* <MotionFloat delay={0.3}>
				<Image src="/images/hero-image.webp" alt="Hero Illustration" layout="fullWidth" className="" />
			</MotionFloat> */}
    </section>
  );
}
