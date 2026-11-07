import { WhatsappLogoIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import * as m from "motion/react-m";
import { MotionPulse } from "@/components/motion/motion-components";
import { Button } from "@/components/ui/button";
import { DATA } from "@/routes/-home/data";
import { FooterPanel } from "@/routes/-home/footer-panel";
import { CountUp, Float } from "@/routes/-home/motion-bits";
import { PREMIUM_DATA } from "./data";
import { usePremiumPackages } from "./use-premium-packages";

export function CallToAction() {
  const { closing } = PREMIUM_DATA;
  const pricing = usePremiumPackages();

  return (
    <section className="relative mx-auto flex w-full flex-col items-center overflow-hidden bg-linear-to-b from-sr-ivory to-white px-4 pt-8 pb-16 md:pt-10 md:pb-20">
      <MotionPulse>
        <m.div
          className="absolute -right-200 -bottom-100 z-0 size-56 rounded-full border-2 border-[#B3DFF5] bg-tertiary-100 md:size-84"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.3 }}
        />
      </MotionPulse>

      <MotionPulse>
        <m.div
          className="absolute -bottom-190 -left-200 z-0 size-56 rounded-full border-2 border-[#B3DFF5] bg-tertiary-100 md:size-64"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.3 }}
        />
      </MotionPulse>
      {/* TOP CONTAINER */}
      <div className="relative container flex h-150 min-h-122.25 w-full flex-col overflow-hidden rounded-t-2xl border-x-2 border-t-2 border-[#B3DFF5] bg-linear-to-br from-[#F4FAFF] via-white to-sr-sun-100 md:h-full">
        <div className="relative z-10 flex h-150 flex-1 flex-col justify-start px-8 py-8 md:h-full md:justify-center md:px-10 lg:px-20">
          <div className="flex w-full flex-col lg:flex-row lg:items-center">
            {/* Left Content */}
            <div className="z-20 flex flex-col items-start gap-6 lg:w-2/3">
              <div className="space-y-3">
                <m.h2
                  className="max-w-5xl font-sans text-2xl font-extrabold text-pretty md:text-5xl"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  Merintis duluan selalu <span className="text-primary-300">lebih murah</span> daripada{" "}
                  <span className="text-primary-300">nyusul</span>.
                </m.h2>

                <m.p
                  className="flex flex-wrap items-baseline gap-x-2 text-sm text-pretty md:text-xl"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                >
                  <span className="font-semibold text-neutral-600">Mulai dari</span>
                  <CountUp
                    to={pricing.cheapestPrice}
                    prefix="Rp"
                    duration={1.2}
                    className="text-xl font-black text-sr-blue-600 md:text-3xl"
                  />
                  <span className="font-semibold">— sekali bayar.</span>
                </m.p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button asChild size="lg" className="sr-sheen font-bold tracking-wide uppercase">
                  <Link to="/premium">{closing.cta}</Link>
                </Button>

                <Button variant="outline" size="lg" asChild>
                  <a href={DATA.footer.contactWhatsapp} className="flex items-center gap-2">
                    <WhatsappLogoIcon size={24} weight="duotone" className="text-neutral-700" />
                    Masih Ada Pertanyaan?
                  </a>
                </Button>
              </div>
            </div>

            {/* Right Mascot Container */}
            <div className="pointer-events-none absolute right-0 bottom-0 flex h-full items-end justify-end overflow-hidden">
              <m.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="relative z-0"
              >
                <Float distance={10} duration={4.5}>
                  <img
                    src="/avatar/tupai-cta-1.webp"
                    alt="Mascot"
                    className="h-auto w-60 translate-y-4 -scale-x-100 object-contain drop-shadow-[0_16px_18px_rgba(20,34,78,0.2)] md:w-75 lg:w-100"
                  />
                </Float>
              </m.div>
            </div>
          </div>
        </div>
      </div>
      <FooterPanel />
    </section>
  );
}
