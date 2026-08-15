import { Link } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PerintisPricingCard } from "@/routes/home-premium/-components/pricing";

export function Pricing() {
  return (
    <div className="flex border-2 border-secondary-100 bg-[#FFFCF3] py-16">
      <div className="container mx-auto items-center gap-8 space-y-11 px-4">
        <div className="space-y-2 text-center *:text-pretty">
          <h2 className="text-2xl font-extrabold sm:text-3xl">
            Perintis SNBT & TKA 2027, <span className="text-primary-300">mulai sekarang</span>
          </h2>
          <p className="text-sm font-medium text-pretty md:text-lg">
            Satu paket, akses penuh sampai hari-H: video, bank soal, try out, 100+ sesi live, dan komunitas
          </p>
        </div>

        <div className="mx-auto w-full max-w-xl">
          <PerintisPricingCard />
        </div>

        <div className="flex items-center justify-center">
          <Link to="/home-premium" className={cn(buttonVariants({ variant: "outline" }))}>
            Lihat Detail Paket
          </Link>
        </div>
      </div>
    </div>
  );
}
