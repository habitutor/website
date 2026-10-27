import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PremiumPackageGrid, PricingExtras } from "@/routes/home-premium/-components/pricing";
import { SectionHeading } from "./motion-bits";

export function Pricing() {
  return (
    <div className="flex border-2 border-secondary-100 bg-[#FFFCF3] py-16">
      <div className="container mx-auto min-w-0 items-center gap-8 space-y-11 px-4">
        <SectionHeading
          eyebrow="Paket Premium"
          title={
            <>
              Persiapan SNBT & TKA 2027, <span className="font-sr-serif text-sr-blue-600 italic">mulai sekarang</span>
            </>
          }
          description="Pilih paket Premium sesuai kebutuhan: video, bank soal, try out, 150+ sesi live, dan komunitas"
        />

        <div>
          <div className="mx-auto w-full max-w-4xl min-w-0">
            <PremiumPackageGrid />
          </div>
          <PricingExtras />
        </div>

        <motion.div
          className="flex items-center justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Link
            to="/home-premium"
            className={cn(
              buttonVariants({ variant: "default" }),
              "package-detail-cta bg-primary-300 text-white hover:bg-primary-200",
            )}
          >
            Lihat Detail Paket
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
