import { WhatsappLogoIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { MotionPulse } from "@/components/motion/motion-components";
import { Button } from "@/components/ui/button";
import { DATA } from "./data";
import { FooterPanel } from "./footer-panel";
import { Float } from "./motion-bits";

function FloatingCircle({ className }: { className: string }) {
  return (
    <MotionPulse>
      <motion.div
        className={className}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.3 }}
      />
    </MotionPulse>
  );
}

function HeroPanel() {
  return (
    <div className="relative container flex min-h-122.25 w-full flex-col overflow-hidden rounded-t-2xl border-x-2 border-t-2 border-[#B3DFF5] bg-linear-to-br from-[#F4FAFF] via-white to-sr-sun-100">
      <div className="relative z-10 flex h-full flex-1 flex-col justify-start px-8 py-8 md:justify-center md:px-10 lg:px-20">
        <div className="flex w-full flex-col lg:flex-row lg:items-center">
          <div className="z-20 flex flex-col items-start gap-6 lg:w-2/3">
            <div className="space-y-2">
              <motion.h2
                className="max-w-5xl font-sans text-2xl font-extrabold text-pretty md:text-5xl"
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
                className="text-sm text-pretty md:text-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                Berhenti menebak-nebak cara belajar yang benar. Biarkan kami membimbingmu memaksimalkan setiap potensi
                yang kamu miliki.
              </motion.p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild size="lg" className="sr-sheen">
                <Link to="/login">Mulai Perjalananmu</Link>
              </Button>

              <Button variant="outline" size="lg">
                <a
                  href={DATA.footer.contactWhatsapp}
                  className="flex items-center justify-center gap-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsappLogoIcon size={24} weight="duotone" className="text-neutral-700" />
                  Masih Ada Pertanyaan?
                </a>
              </Button>
            </div>
          </div>

          <div className="pointer-events-none absolute right-0 bottom-0 flex h-full items-end justify-end overflow-hidden">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="relative z-0"
            >
              <Float distance={10} duration={4.5}>
                <img
                  src="/avatar/tupai-cta-1.webp"
                  alt="Mascot"
                  className="h-auto w-45 translate-y-4 -scale-x-100 object-contain drop-shadow-[0_16px_18px_rgba(20,34,78,0.2)] md:w-75 lg:w-100"
                />
              </Float>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CallToAction() {
  return (
    <section className="relative mx-auto flex w-full flex-col items-center overflow-hidden bg-neutral-100 px-4 pt-10 pb-14 md:pt-12 md:pb-16">
      <FloatingCircle className="absolute -right-200 -bottom-100 z-0 size-56 rounded-full border-2 border-[#B3DFF5] bg-tertiary-100 md:size-84" />
      <FloatingCircle className="absolute -bottom-190 -left-200 z-0 size-56 rounded-full border-2 border-[#B3DFF5] bg-tertiary-100 md:size-64" />
      <HeroPanel />
      <FooterPanel />
    </section>
  );
}
