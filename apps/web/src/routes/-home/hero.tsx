import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { motion } from "motion/react";
import { MotionPulse } from "@/components/motion/motion-components";
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

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
    <section className="relative mx-auto flex w-full flex-col items-center justify-start px-4 overflow-hidden rounded-b-[40px] border-2 border-t-0 border-tertiary-200 bg-background pt-22 pb-10 md:pb-35 shadow-[0_2px_2px_0_rgba(54,80,162,0.20)]">
      <div className=" pointer-events-none inset-0 z-0 h-full w-full">
        <MotionPulse>
          <motion.div
            className="absolute md:-right-70 md:top-60 -right-30 top-100 h-108 w-108 rounded-full border-tertiary-200 border-2 bg-tertiary-100 md:h-200 md:w-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          />
        </MotionPulse>
        <MotionPulse>
          <motion.div
            className="absolute md:-right-8 md:top-13 -right-10 top-80 h-20 w-20 rounded-full border-tertiary-200 border-2 bg-tertiary-100 md:h-43 md:w-43"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          />
        </MotionPulse>
        <MotionPulse>
          <motion.div
            className="absolute md:right-36 md:top-10 right-15 top-84 h-9 w-9 rounded-full border-tertiary-200 border-2 bg-tertiary-100 md:h-15 md:w-15"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          />
        </MotionPulse>
        <MotionPulse>
          <motion.div
            className="absolute md:right-130 md:top-175 top-165 h-15 w-15 rounded-full border-tertiary-200 border-2 bg-tertiary-100 md:h-30 md:w-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          />
        </MotionPulse>
      </div>
      <div className="container md:mx-auto flex shrink-0 flex-col pt-8 md:pt-20 space-y-10 md:space-y-13 z-1">
        <div className="flex max-w-3xl flex-col items-start gap-1 text-left md:gap-2">
          <span className="rounded-full bg-neutral-100 border-neutral-300 border-2 px-3 py-2 text-xs md:text-sm font-medium text-primary-600">
            Selama <span className="font-bold text-primary-400">2</span> Tahun
            Berdirinya Sudah Membantu{" "}
            <span className="font-bold text-primary-400">1.000+</span> Siswa
            Mencapai Mimpinya
          </span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0 }}
            className="font-sans text-3xl font-bold sm:text-4xl md:text-5xl md:leading-18 leading-10"
          >
            Ubah Persiapan Ujian{" "}
            <motion.span
              className="inline-block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Menjadi{" "}
              <span className="text-primary-300">Investasi Masa Depan</span>
            </motion.span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="max-w-xl text-sm sm:text-lg"
          >
            Tidak hanya membantumu menaklukkan SNBT, tapi Habitutor juga
            membentuk growth mindset untuk tantangan masa depan.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex w-full md:flex-wrap flex-col md:flex-row md:items-start items-center justify-start gap-2 *:max-sm:text-xs"
        >
          <Link
            to="/login"
            className={cn(
              buttonVariants({ variant: "lightBlue" }),
              "w-full md:w-fit",
            )}
          >
            Mulai Belajar Sekarang
          </Link>
					<Link
            to="/dashboard"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full md:w-fit",
            )}
          >
            Cara Kerjanya
          </Link>
        </motion.div>
      </div>

      <div className="container z-1">
        <div className="flex w-full h-60 items-end gap-1">
          {bars.map((bar, i) => {
            const barHeight = isMobile
              ? Math.round(bar.height * 0.45)
              : bar.height;
            const initialHeight = isMobile ? 40 : 60;

            return (
              <div
                key={i}
                className={`flex flex-col items-center justify-end w-full ${bar.isHidden ? "hidden lg:flex" : ""}`}
              >
                <motion.div
                  transition={{
                    duration: 0.5,
                    delay: i * 0.15 + 0.6,
                    ease: "easeOut",
                  }}
                  className={`relative h-9 w-18 md:h-18 md:w-36 ${bar.circleBg} border-2 ${bar.circleBorder} border-b-0 z-3 rounded-t-full origin-bottom ${bar.isHidden ? "hidden md:block" : ""}`}
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
                      className={` z-3 ${bar.imageClassName || ""}`}
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
                  className={`w-full ${bar.bg} ${bar.border} border-2 border-b-0 rounded-t-xl z-2 ${bar.isHidden ? "hidden lg:block" : ""}`}
                  style={{ height: barHeight }}
                />
              </div>
            );
          })}
        </div>
        <div className=" bg-secondary-400 border-secondary-600 border-2 h-4 w-full" />
      </div>

      {/* <MotionFloat delay={0.3}>
				<Image src="/images/hero-image.webp" alt="Hero Illustration" layout="fullWidth" className="" />
			</MotionFloat> */}
    </section>
  );
}
