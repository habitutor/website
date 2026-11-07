import { Image } from "@unpic/react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DATA } from "./data";

// Susunan sama di semua ukuran layar: logo kiri + sosmed kanan, garis, lalu tagline kiri + OmahTI kanan.
// Di layar sempit kedua baris boleh turun, tapi tetap rata kiri dan tidak pernah melebihi kartu.
export function FooterPanel() {
  return (
    <div className="relative z-10 container w-full overflow-hidden rounded-b-2xl border-x-2 border-b-2 border-sr-blue-700 bg-(image:--sr-grad-blue) py-6 text-white md:py-10">
      <div className="pointer-events-none absolute -top-20 -right-16 size-64 animate-sr-drift rounded-full border-[26px] border-white/10" />
      <div className="relative w-full space-y-4 px-5 md:px-10 lg:px-20">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-white/15 pb-4 md:pb-5">
          <div className="flex min-w-0 items-center gap-2">
            <img
              src="/logo.webp"
              alt="Logo Habitutor"
              width={40}
              height={40}
              className="pointer-events-none size-9 shrink-0 select-none md:size-10"
            />
            <h3 className="text-xl font-medium md:text-2xl">Habitutor</h3>
          </div>

          <div className="flex items-center gap-1.5 md:gap-3">
            {DATA.footer.socials.map((social) => (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "size-9 rounded-lg bg-background text-primary-300 hover:-translate-y-0.5 hover:bg-primary-100 hover:shadow-sr-1 md:size-10",
                )}
              >
                <social.icon className="size-4.5 md:size-5" weight="bold" />
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 text-sm text-white/85 sm:flex-row sm:items-center sm:justify-between sm:gap-6 md:text-base">
          <p className="min-w-0 text-pretty">Ubah Persiapan Ujian Menjadi Investasi Masa Depan</p>

          <div className="flex shrink-0 items-center gap-2">
            <span>Build together with</span>
            <a
              href="https://www.instagram.com/omahti_ugm"
              className="flex items-center transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image src="/icons/OmahTI.webp" alt="OmahTI" width={111} height={15} className="h-3 w-auto" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
