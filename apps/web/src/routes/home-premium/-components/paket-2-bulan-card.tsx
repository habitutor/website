import { CheckIcon } from "@phosphor-icons/react";
import { buttonVariants } from "@/components/ui/button";
import { PERINTIS_PRICING_COPY, formatRupiah } from "@/lib/perintis-pricing-copy";
import { cn } from "@/lib/utils";

// GANTI dengan link gform / WhatsApp admin untuk pemesanan paket 2 bulan
const PAKET_2_BULAN_ORDER_URL = "ISI_LINK_DI_SINI";

// Sembilan fasilitas inti yang sama dengan Paket Perintis 2027
const FASILITAS = PERINTIS_PRICING_COPY.features;

export function Paket2BulanCard() {
  return (
    <div className="w-full">
      <div className="flex w-full flex-col overflow-hidden rounded-2xl border-2 border-primary-400 bg-primary-300 shadow-sm">
        <div className="border-b-2 border-neutral-1000 bg-primary-500 px-6 py-4">
          <h3 className="text-lg font-bold text-neutral-100">Paket 2 Bulan</h3>
          <p className="text-xs font-medium text-tertiary-100">akses penuh selama 2 bulan</p>
        </div>

        <div className="px-6 py-5">
          <p className="text-4xl font-black text-secondary-200">{formatRupiah(99_000)}</p>
          <p className="mt-2 text-sm text-neutral-100">Fasilitas sama seperti Paket Perintis 2027.</p>
        </div>

        <div className="px-6 pb-5">
          <ul className="grid gap-2">
            {FASILITAS.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-neutral-100">
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-background p-0.5 text-secondary-1000">
                  <CheckIcon weight="bold" size={12} />
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3 p-6 pt-0">
          <a
            href={PAKET_2_BULAN_ORDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "darkBlue", size: "lg" }),
              "w-full border border-neutral-1000 text-base font-bold tracking-wide uppercase",
            )}
          >
            Pesan Paket 2 Bulan
          </a>
          <p className="text-center text-xs text-tertiary-100">Setelah memesan, akunmu diaktifkan oleh admin.</p>
        </div>
      </div>
    </div>
  );
}
