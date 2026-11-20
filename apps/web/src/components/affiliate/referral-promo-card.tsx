import { HandCoinsIcon, ShareNetworkIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

type Variant = "result" | "purchase";

const COPY: Record<Variant, { title: string; text: (discount: number, commission: number) => string }> = {
  result: {
    title: "Skormu bagus? Ajak temanmu coba juga!",
    text: (discount, commission) =>
      `Temanmu hemat ${discount}% saat beli Premium pertamanya, dan kamu dapat komisi ${commission}% yang masuk ke saldo.`,
  },
  purchase: {
    title: "Premium aktif! Ajak temanmu belajar bareng",
    text: (discount, commission) =>
      `Bagikan kodemu. Temanmu hemat ${discount}% di Premium pertamanya, kamu dapat komisi ${commission}%.`,
  },
};

/**
 * Ajakan program afiliasi yang muncul di momen siswa sedang puas (hasil try out, setelah membeli Premium),
 * bukan sebagai menu tetap. Di Dashboard dan Profil, program yang sama sudah punya kartunya sendiri.
 */
export function ReferralPromoCard({ variant, className }: { variant: Variant; className?: string }) {
  const { data: rules } = useQuery({ ...orpc.affiliate.rules.queryOptions(), staleTime: 5 * 60_000 });
  const { data: overview } = useQuery({ ...orpc.affiliate.overview.queryOptions(), staleTime: 60_000 });
  const discount = rules?.buyerDiscountPercent ?? 15;
  const commission = rules?.commissionPercent ?? 10;
  const copy = COPY[variant];
  const origin = typeof window === "undefined" ? "https://habitutor.id" : window.location.origin;
  const link = overview ? `${origin}/r/${encodeURIComponent(overview.code)}` : null;
  const shareText = link
    ? `Aku belajar SNBT/UTBK di Habitutor. Daftar pakai linkku, kamu dapat diskon ${discount}% pas beli paket Premium: ${link}`
    : null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
      aria-label="Ajak teman"
      className={cn(
        "relative flex flex-col gap-4 overflow-hidden rounded-sr-xl border border-sr-sun-200 bg-linear-to-br from-sr-sun-100 via-white to-sr-blue-50 p-4 shadow-sr-1 transition-shadow duration-300 hover:shadow-sr-2 sm:flex-row sm:items-center sm:gap-5 sm:p-5",
        className,
      )}
    >
      <div className="pointer-events-none absolute -top-10 -right-8 size-32 rounded-full bg-sr-sun-200/50" />
      <span className="relative flex size-12 shrink-0 items-center justify-center rounded-sr-md bg-sr-sun-400 text-sr-ink shadow-sr-sun">
        <HandCoinsIcon weight="fill" className="size-7" />
      </span>
      <div className="relative min-w-0 flex-1">
        <h2 className="text-base font-black text-sr-ink sm:text-lg">{copy.title}</h2>
        <p className="mt-0.5 text-sm leading-relaxed text-sr-ink-2">{copy.text(discount, commission)}</p>
      </div>
      <div className="relative flex shrink-0 flex-wrap gap-2">
        {shareText && (
          <Button asChild className="sr-sheen rounded-full">
            <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer">
              <ShareNetworkIcon weight="bold" /> Bagikan ke WhatsApp
            </a>
          </Button>
        )}
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/affiliate">Lihat detail</Link>
        </Button>
      </div>
    </motion.section>
  );
}
